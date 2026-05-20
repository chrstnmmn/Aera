/* network.c */
#include "network.h"
#include "config.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "esp_log.h"
#include "mdns.h"
#include "esp_http_server.h"
#include "cJSON.h"

static httpd_handle_t server = NULL;
static bool mdns_initialized = false;

// Forward Declarations of Webserver Controls
static httpd_handle_t start_webserver(void);
static esp_err_t stop_webserver(httpd_handle_t server_handle);

/**
 * @brief Parses and processes inbound payloads sent from React Native
 */
static void handle_incoming_ws_message(const char *payload)
{
    cJSON *root = cJSON_Parse(payload);
    if (!root) {
        ESP_LOGE(TAG, "Malformed JSON package received.");
        return;
    }

    cJSON *event = cJSON_GetObjectItem(root, "event");
    if (cJSON_IsString(event) && (event->valuestring != NULL)) {
        
        if (strcmp(event->valuestring, "START_TIMER") == 0) {
            cJSON *duration = cJSON_GetObjectItem(root, "duration");
            if (cJSON_IsNumber(duration)) {
                xSemaphoreTake(sys_mutex, portMAX_DELAY);
                total_drying_seconds = duration->valueint;
                remaining_seconds = duration->valueint;
                is_paused = false;
                app_state = STATE_DRYING; // Instantly switch the OLED view state
                xSemaphoreGive(sys_mutex);
                
                ESP_LOGI(TAG, "Network Command: Started cycle from App. Duration: %lu s", remaining_seconds);
            }
        } 
        else if (strcmp(event->valuestring, "PAUSE_TIMER") == 0) {
            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            is_paused = true;
            xSemaphoreGive(sys_mutex);
            ESP_LOGI(TAG, "Network Command: Cycle Paused via Phone.");
        }
        else if (strcmp(event->valuestring, "RESUME_TIMER") == 0) {
            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            is_paused = false;
            xSemaphoreGive(sys_mutex);
            ESP_LOGI(TAG, "Network Command: Cycle Resumed via Phone.");
        }
        else if (strcmp(event->valuestring, "STOP_TIMER") == 0) {
            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            remaining_seconds = 0;
            total_drying_seconds = 0;
            app_state = STATE_MAIN_MENU; // Instantly bounce OLED back to primary screen
            xSemaphoreGive(sys_mutex);
            ESP_LOGI(TAG, "Network Command: Cycle Aborted via Phone.");
        }
    }
    cJSON_Delete(root);
}

/**
 * @brief Core WebSocket URI handler routine execution loop
 */
static esp_err_t ws_handler(httpd_req_t *req)
{
    if (req->method == HTTP_GET) {
        ESP_LOGI(TAG, "Handshake established! React Native client connected.");
        return ESP_OK;
    }

    httpd_ws_frame_t ws_pkt;
    uint8_t *buf = NULL;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;

    // First call with zero length to populate the actual allocation bounds
    esp_err_t ret = httpd_ws_recv_frame(req, &ws_pkt, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to capture framing parameters: %d", ret);
        return ret;
    }

    if (ws_pkt.len > 0) {
        buf = calloc(1, ws_pkt.len + 1);
        if (!buf) {
            ESP_LOGE(TAG, "Failed to allocate memory for incoming payload context.");
            return ESP_ERR_NO_MEM;
        }
        ws_pkt.payload = buf;
        
        ret = httpd_ws_recv_frame(req, &ws_pkt, ws_pkt.len);
        if (ret != ESP_OK) {
            ESP_LOGE(TAG, "Failed to process target content frame: %d", ret);
            free(buf);
            return ret;
        }

        handle_incoming_ws_message((const char *)ws_pkt.payload);
    }

    free(buf);
    return ESP_OK;
}

static const httpd_uri_t ws_config = {
    .uri        = "/ws",
    .method     = HTTP_GET,
    .handler    = ws_handler,
    .user_ctx   = NULL,
    .is_websocket = true
};

static httpd_handle_t start_webserver(void)
{
    httpd_handle_t server_handle = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = SERVER_PORT;
    config.ctrl_port = 32768; // Explicit control port isolation to prevent socket collisions

    ESP_LOGI(TAG, "Spinning up asynchronous WebOS engine on port %d...", SERVER_PORT);
    if (httpd_start(&server_handle, &config) == ESP_OK) {
        httpd_register_uri_handler(server_handle, &ws_config);
        return server_handle;
    }
    ESP_LOGE(TAG, "Failed to bind web socket server instance engine.");
    return NULL;
}

static esp_err_t stop_webserver(httpd_handle_t server_handle)
{
    if (server_handle) {
        return httpd_stop(server_handle);
    }
    return ESP_ERR_INVALID_ARG;
}

esp_err_t websocket_broadcast(const char *payload)
{
    if (server == NULL) {
        return ESP_ERR_INVALID_STATE;
    }

    size_t clients = 10;
    int client_fds[10] = {0};
    
    // Safely pull the list of all active file descriptors from the server
    if (httpd_get_client_list(server, &clients, client_fds) != ESP_OK) {
        return ESP_FAIL;
    }

    httpd_ws_frame_t ws_pkt;
    memset(&ws_pkt, 0, sizeof(httpd_ws_frame_t));
    ws_pkt.payload = (uint8_t *)payload;
    ws_pkt.len = strlen(payload);
    ws_pkt.type = HTTPD_WS_TYPE_TEXT;

    for (size_t i = 0; i < clients; i++) {
        // Correct API validation check for an active WebSocket descriptor
        if (httpd_ws_get_fd_info(server, client_fds[i]) == HTTPD_WS_CLIENT_WEBSOCKET) {
            httpd_ws_send_frame_async(server, client_fds[i], &ws_pkt);
        }
    }
    return ESP_OK;
}
static void wifi_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        ESP_LOGI(TAG, "Wi-Fi Interface Ready. Triggering automatic boot connection...");
        esp_wifi_connect();
    }
    else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        if (wifi_state != WIFI_STATE_IDLE) {
            if (server != NULL) {
                stop_webserver(server);
                server = NULL;
            }
            if (retry_count < MAX_WIFI_RETRIES) {
                retry_count++;
                wifi_state = WIFI_STATE_PAIRING;
                xSemaphoreGive(sys_mutex);
                ESP_LOGW(TAG, "Handshake dropped/unavailable. Retrying attempt %d/%d...", retry_count, MAX_WIFI_RETRIES);
                esp_wifi_connect();
            } else {
                ESP_LOGE(TAG, "Failed to locate target router after %d attempts. Halting link loop.", MAX_WIFI_RETRIES);
                wifi_state = WIFI_STATE_IDLE;
                retry_count = 0;
                xSemaphoreGive(sys_mutex);
            }
        } else {
            xSemaphoreGive(sys_mutex);
        }
    }
    else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(TAG, "IP Assigned Successfully! Station Address: " IPSTR, IP2STR(&event->ip_info.ip));

        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        wifi_state = WIFI_STATE_CONNECTED;
        retry_count = 0;
        xSemaphoreGive(sys_mutex);

        // Fixed mDNS memory leak logic loop parameters
        if (!mdns_initialized) {
            ESP_ERROR_CHECK(mdns_init());
            ESP_ERROR_CHECK(mdns_hostname_set("aera-system"));
            ESP_ERROR_CHECK(mdns_instance_name_set("Aera Nano Appliance"));
            mdns_initialized = true;
        }
        mdns_service_add(NULL, "_websocket", "_tcp", SERVER_PORT, NULL, 0);
        ESP_LOGI(TAG, "mDNS active profile broadcast registered: aera-system.local");

        if (server == NULL) {
            server = start_webserver();
        }
    }
}

void network_task(void *pvParameters)
{
    ESP_LOGI(TAG, "Network Subsystem pipeline successfully pinned to Core %d", xPortGetCoreID());

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id, instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL, &instance_got_ip));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    bool internal_connect_triggered = true;

    while (1) {
        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        wifi_status_t current_state = wifi_state;
        bool local_reconnect_req = manual_reconnect_request;
        xSemaphoreGive(sys_mutex);

        if (local_reconnect_req) {
            ESP_LOGI(TAG, "Manual reconnect requested via UI click. Resetting bounds tracker.");
            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            retry_count = 0;
            wifi_state = WIFI_STATE_PAIRING;
            xSemaphoreGive(sys_mutex);

            esp_wifi_disconnect();
            esp_wifi_connect();

            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            manual_reconnect_request = false;
            internal_connect_triggered = true;
            xSemaphoreGive(sys_mutex);
        }

        if (current_state == WIFI_STATE_PAIRING && !internal_connect_triggered) {
            ESP_LOGI(TAG, "Re-initiating baseline router connection: %s ...", WIFI_SSID);
            esp_wifi_connect();
            internal_connect_triggered = true;
        } else if (current_state == WIFI_STATE_IDLE) {
            internal_connect_triggered = false;
        }

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}