# Firmware Codes

/* main.c */

#include "config.h"
#include "settings.h"
#include "network.h"
#include "ui.h"
#include "hardware.h"  // <-- ADD THIS LINE HERE
#include "nvs_flash.h"
#include "esp_mac.h"
#include "esp_log.h"

// --- Global Variables Definitions ---
const char *TAG = "AERA_SYSTEM";
spi_device_handle_t spi;
u8g2_t u8g2;
SemaphoreHandle_t sys_mutex = NULL;

wifi_status_t wifi_state = WIFI_STATE_PAIRING;
bool manual_reconnect_request = false;
int retry_count = 0;

bool uvc_on = true;
bool buzzer_on = true;
int brightness_level = 2;

// Standardized Core Runtime Variables
int app_state = STATE_SPLASH;
uint32_t total_drying_seconds = 0;
uint32_t remaining_seconds = 0;
bool is_paused = false;

void telemetry_spammer_task(void *pvParameters)
{
    char json_buffer[192];
    uint32_t last_execution_tick = xTaskGetTickCount();

    while (1)
    {
        // Force strict 1-second task execution intervals
        vTaskDelayUntil(&last_execution_tick, pdMS_TO_TICKS(1000));

        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        
        // 1. Authoritative Countdown Processing
        if (app_state == STATE_DRYING && !is_paused && remaining_seconds > 0) {
            remaining_seconds--;
            
            // Handle completion inside the secure tick boundary
            if (remaining_seconds == 0) {
                app_state = STATE_MAIN_MENU;
                total_drying_seconds = 0;
                bool sound_alert = buzzer_on;
                xSemaphoreGive(sys_mutex);

                // Fire completion buzzer alerts
                for (int i = 0; i < 3; i++) {
                    buzzer_beep(sound_alert);
                    vTaskDelay(pdMS_TO_TICKS(100));
                }
                xSemaphoreTake(sys_mutex, portMAX_DELAY);
            }
        }

        // 2. Capture snapshots for state broadcasting
        int current_state = app_state;
        uint32_t rem_secs = remaining_seconds;
        uint32_t tot_secs = total_drying_seconds;
        bool paused_state = is_paused;
        
        xSemaphoreGive(sys_mutex);

        // 3. Broadcast unified metrics to React Native over WebSocket
        snprintf(json_buffer, sizeof(json_buffer),
                 "{\"event\":\"TIMER_SYNC\",\"app_state\":%d,\"secondsLeft\":%lu,\"totalSeconds\":%lu,\"isPaused\":%d,\"water\":75,\"uvActive\":true}",
                 current_state, rem_secs, tot_secs, paused_state);

        websocket_broadcast(json_buffer);
    }
}

void app_main(void)
{
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK(err);

    load_settings();

    uint8_t mac_addr[6];
    if (esp_read_mac(mac_addr, ESP_MAC_WIFI_STA) == ESP_OK)
    {
        ESP_LOGI(TAG, "==========================================");
        ESP_LOGI(TAG, "     TARGET DEVICE MAC WHITELIST PROFILE ");
        ESP_LOGI(TAG, " MAC ADDR: %02X:%02X:%02X:%02X:%02X:%02X",
                 mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
        ESP_LOGI(TAG, "==========================================");
    }
    else
    {
        ESP_LOGE(TAG, "Failed to read hardware EFUSE MAC block!");
    }

    sys_mutex = xSemaphoreCreateMutex();
    if (sys_mutex == NULL)
    {
        ESP_LOGE(TAG, "Fatal error initializing safety mutex block.");
        return;
    }

    gpio_install_isr_service(0);

    // Cross-Core Symmetric Task Execution Setup
    xTaskCreatePinnedToCore(network_task, "network_task", 4096, NULL, 3, NULL, 0); // Core 0
    xTaskCreatePinnedToCore(ui_task, "ui_task", 8192, NULL, 3, NULL, 1);           // Core 1
    xTaskCreatePinnedToCore(telemetry_spammer_task, "telemetry_spammer", 3072, NULL, 1, NULL, 0); // Core 0
}


/* hardware.c */

#include "hardware.h"
#include "driver/ledc.h"

volatile int encoder_diff = 0;
portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

uint8_t u8g2_esp32_spi_byte_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr) {
    switch (msg) {
        case U8X8_MSG_BYTE_SET_DC:
            gpio_set_level(PIN_NUM_DC, arg_int);
            break;
        case U8X8_MSG_BYTE_SEND: {
            spi_transaction_t t;
            memset(&t, 0, sizeof(t));
            t.length = 8 * arg_int;
            t.tx_buffer = arg_ptr;
            spi_device_polling_transmit(spi, &t);
            break;
        }
    }
    return 1;
}

uint8_t u8g2_esp32_gpio_and_delay_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr) {
    switch (msg) {
        case U8X8_MSG_DELAY_MILLI:
            vTaskDelay(pdMS_TO_TICKS(arg_int));
            break;
        case U8X8_MSG_GPIO_RESET:
            gpio_set_level(PIN_NUM_RST, arg_int);
            break;
        case U8X8_MSG_GPIO_CS:
            gpio_set_level(PIN_NUM_CS, arg_int);
            break;
    }
    return 1;
}

void buzzer_init(void) {
    ledc_timer_config_t ledc_timer = {.speed_mode = LEDC_LOW_SPEED_MODE, .timer_num = LEDC_TIMER_0, .duty_resolution = LEDC_TIMER_13_BIT, .freq_hz = 2000, .clk_cfg = LEDC_AUTO_CLK};
    ledc_timer_config(&ledc_timer);
    ledc_channel_config_t ledc_channel = {.speed_mode = LEDC_LOW_SPEED_MODE, .channel = LEDC_CHANNEL_0, .timer_sel = LEDC_TIMER_0, .intr_type = LEDC_INTR_DISABLE, .gpio_num = BUZZER_PIN_NUM, .duty = 0, .hpoint = 0};
    ledc_channel_config(&ledc_channel);
}

void buzzer_beep(bool is_enabled) {
    if (!is_enabled) return;
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 4096);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
    vTaskDelay(pdMS_TO_TICKS(40));
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}

void IRAM_ATTR rotary_encoder_isr(void *arg) {
    static uint8_t old_state = 3;
    static int8_t encoder_value = 0;
    static const int8_t state_table[] = {0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0};

    uint8_t clk = gpio_get_level(ROTARY_PIN_NUM_CLK);
    uint8_t dt = gpio_get_level(ROTARY_PIN_NUM_DT);
    uint8_t current_state = (clk << 1) | dt;
    uint8_t index = (old_state << 2) | current_state;

    encoder_value += state_table[index];
    old_state = current_state;

    if (encoder_value > 3) {
        encoder_diff++;
        encoder_value = 0;
    } else if (encoder_value < -3) {
        encoder_diff--;
        encoder_value = 0;
    }
}


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

/* settings.c */
#include "settings.h"
#include "config.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "esp_log.h"

void load_settings(void)
{
  nvs_handle_t my_handle;
  esp_err_t err = nvs_open("storage", NVS_READWRITE, &my_handle);
  if (err != ESP_OK)
    return;

  int8_t val8 = 0;
  if (nvs_get_i8(my_handle, "uvc_on", &val8) == ESP_OK)
    uvc_on = val8;
  if (nvs_get_i8(my_handle, "buzzer_on", &val8) == ESP_OK)
    buzzer_on = val8;

  int32_t val32 = 0;
  if (nvs_get_i32(my_handle, "brightness", &val32) == ESP_OK)
    brightness_level = val32;

  nvs_close(my_handle);
  ESP_LOGI(TAG, "Settings successfully pulled from NVS allocation.");
}

void save_settings(void)
{
  nvs_handle_t my_handle;
  esp_err_t err = nvs_open("storage", NVS_READWRITE, &my_handle);
  if (err != ESP_OK)
    return;

  nvs_set_i8(my_handle, "uvc_on", uvc_on ? 1 : 0);
  nvs_set_i8(my_handle, "buzzer_on", buzzer_on ? 1 : 0);
  nvs_set_i32(my_handle, "brightness", brightness_level);

  nvs_commit(my_handle);
  nvs_close(my_handle);
}

/* ui.c */
#include "ui.h"
#include "config.h"
#include "graphics.h"
#include "hardware.h"
#include "settings.h"
#include "esp_log.h"

void drawTimer_Active(uint32_t remaining_secs, uint32_t total_secs, bool is_paused) {
    u8g2_SetBitmapMode(&u8g2, 1);
    u8g2_SetFontMode(&u8g2, 1);
    u8g2_DrawFrame(&u8g2, 0, 61, 128, 3);

    if (total_secs > 0) {
        uint32_t elapsed_secs = total_secs - remaining_secs;
        uint32_t fill_w = (126 * elapsed_secs) / total_secs;
        u8g2_DrawBox(&u8g2, 1, 62, fill_w, 1);
    }

    int display_val1 = 0, display_val2 = 0;
    bool showing_hr_min = false;

    if (remaining_secs >= 3600) {
        display_val1 = remaining_secs / 3600;
        display_val2 = (remaining_secs % 3600) / 60;
        showing_hr_min = true;
    } else {
        display_val1 = remaining_secs / 60;
        display_val2 = remaining_secs % 60;
    }

    char separator = ':';
    if (!is_paused && remaining_secs > 0) {
        if ((xTaskGetTickCount() * portTICK_PERIOD_MS / 500) % 2 == 0)
            separator = ' ';
    }

    char time_str[16];
    snprintf(time_str, sizeof(time_str), "%02d%c%02d", display_val1, separator, display_val2);
    u8g2_SetFont(&u8g2, u8g2_font_profont29_tr);
    u8g2_DrawStr(&u8g2, 24, 36, time_str);

    u8g2_SetFont(&u8g2, u8g2_font_profont10_tr);
    u8g2_DrawStr(&u8g2, 42, 44, showing_hr_min ? "hr : min" : "min : sec");

    u8g2_SetFont(&u8g2, u8g2_font_4x6_tr);
    u8g2_DrawStr(&u8g2, 1, 60, is_paused ? "Paused" : "Now Drying");

    char pct_str[16];
    if (total_secs > 0) {
        uint32_t pct = ((total_secs - remaining_secs) * 100) / total_secs;
        snprintf(pct_str, sizeof(pct_str), "%lu%%", pct);
    } else {
        strcpy(pct_str, "100%");
    }

    int pct_x = 126 - u8g2_GetUTF8Width(&u8g2, pct_str);
    u8g2_DrawStr(&u8g2, pct_x, 60, pct_str);
}

void ui_task(void *pvParameters) {
    ESP_LOGI(TAG, "UI Interface pipeline successfully pinned to Core %d", xPortGetCoreID());

    gpio_config_t io_conf = {.pin_bit_mask = (1ULL << PIN_NUM_DC) | (1ULL << PIN_NUM_RST), .mode = GPIO_MODE_OUTPUT};
    gpio_config(&io_conf);

    spi_bus_config_t buscfg = {.miso_io_num = PIN_NUM_MISO, .mosi_io_num = PIN_NUM_MOSI, .sclk_io_num = PIN_NUM_CLK, .quadwp_io_num = -1, .quadhd_io_num = -1, .max_transfer_sz = OLED_WIDTH * 8};
    spi_device_interface_config_t devcfg = {.clock_speed_hz = 10 * 1000 * 1000, .mode = 0, .spics_io_num = PIN_NUM_CS, .queue_size = 7};

    ESP_ERROR_CHECK(spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO));
    ESP_ERROR_CHECK(spi_bus_add_device(SPI2_HOST, &devcfg, &spi));

    u8g2_Setup_ssd1306_128x64_noname_f(&u8g2, U8G2_R0, u8g2_esp32_spi_byte_cb, u8g2_esp32_gpio_and_delay_cb);
    u8g2_InitDisplay(&u8g2);
    u8g2_SetPowerSave(&u8g2, 0);

    xSemaphoreTake(sys_mutex, portMAX_DELAY);
    int current_brightness = brightness_level;
    xSemaphoreGive(sys_mutex);

    if (current_brightness == 0) u8g2_SetContrast(&u8g2, 1);
    else if (current_brightness == 1) u8g2_SetContrast(&u8g2, 127);
    else u8g2_SetContrast(&u8g2, 255);

    gpio_config_t rot_conf = {
        .pin_bit_mask = (1ULL << ROTARY_PIN_NUM_CLK) | (1ULL << ROTARY_PIN_NUM_DT) | (1ULL << ROTARY_PIN_NUM_SW),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = 1,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&rot_conf);

    gpio_set_intr_type(ROTARY_PIN_NUM_CLK, GPIO_INTR_ANYEDGE);
    gpio_set_intr_type(ROTARY_PIN_NUM_DT, GPIO_INTR_ANYEDGE);
    gpio_isr_handler_add(ROTARY_PIN_NUM_CLK, rotary_encoder_isr, NULL);
    gpio_isr_handler_add(ROTARY_PIN_NUM_DT, rotary_encoder_isr, NULL);

    buzzer_init();

    int main_menu_idx = 0, sub_menu_idx = 0, edit_state = EDIT_NONE;
    int time_val1 = 0, time_val2 = 0, temp_val = 20;
    bool time_is_min_sec = true, temp_is_celsius = true;
    int settings_menu_idx = 0;

    bool button_was_pressed = false;
    uint32_t button_press_tick = 0;
    bool long_press_handled = false;

    while (1) {
        // Safe Snapshot Extraction of Core Global States
        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        int local_app_state = app_state;
        uint32_t local_remaining = remaining_seconds;
        uint32_t local_total = total_drying_seconds;
        bool local_paused = is_paused;
        bool local_buzz_cfg = buzzer_on;
        xSemaphoreGive(sys_mutex);

        if (local_app_state == STATE_SPLASH) {
            u8g2_ClearBuffer(&u8g2);
            u8g2_DrawXBM(&u8g2, 14, 16, 99, 32, image_Logo_Aera_bits);
            u8g2_SendBuffer(&u8g2);
            vTaskDelay(pdMS_TO_TICKS(3000));
            
            xSemaphoreTake(sys_mutex, portMAX_DELAY);
            app_state = STATE_MAIN_MENU;
            xSemaphoreGive(sys_mutex);
            continue;
        }

        int rot_dir = 0;
        portENTER_CRITICAL(&mux);
        if (encoder_diff != 0) {
            rot_dir = (encoder_diff > 0) ? 1 : -1;
            encoder_diff = 0;
        }
        portEXIT_CRITICAL(&mux);

        if (rot_dir != 0) {
            if (local_app_state == STATE_MAIN_MENU) {
                main_menu_idx += rot_dir;
                if (main_menu_idx < 0) main_menu_idx = 2;
                if (main_menu_idx > 2) main_menu_idx = 0;
            } else if (local_app_state == STATE_SUB_MENU) {
                if (edit_state == EDIT_NONE) {
                    sub_menu_idx += rot_dir;
                    if (sub_menu_idx < 0) sub_menu_idx = 5;
                    if (sub_menu_idx > 5) sub_menu_idx = 0;
                }
                else if (edit_state == EDIT_TIME_VAL1) time_val1 = (time_val1 + rot_dir + 100) % 100;
                else if (edit_state == EDIT_TIME_VAL2) time_val2 = (time_val2 + rot_dir + 60) % 60;
                else if (edit_state == EDIT_TEMP) temp_val = (temp_val + rot_dir + 100) % 100;
            } else if (local_app_state == STATE_SETTINGS_MENU) {
                settings_menu_idx += rot_dir;
                if (settings_menu_idx < 0) settings_menu_idx = 4;
                if (settings_menu_idx > 4) settings_menu_idx = 0;
            }
        }

        bool current_button_state = (gpio_get_level(ROTARY_PIN_NUM_SW) == 0);

        if (current_button_state && !button_was_pressed) {
            vTaskDelay(pdMS_TO_TICKS(20));
            if (gpio_get_level(ROTARY_PIN_NUM_SW) == 0) {
                button_was_pressed = true;
                button_press_tick = xTaskGetTickCount();
                long_press_handled = false;
            }
        } else if (current_button_state && button_was_pressed) {
            if (!long_press_handled && local_app_state == STATE_DRYING) {
                if ((xTaskGetTickCount() - button_press_tick) >= pdMS_TO_TICKS(3000)) {
                    long_press_handled = true;
                    
                    xSemaphoreTake(sys_mutex, portMAX_DELAY);
                    app_state = STATE_SUB_MENU;
                    xSemaphoreGive(sys_mutex);

                    sub_menu_idx = 0;
                    edit_state = EDIT_NONE;
                    buzzer_beep(local_buzz_cfg);
                    vTaskDelay(pdMS_TO_TICKS(100));
                    buzzer_beep(local_buzz_cfg);
                }
            }
        } else if (!current_button_state && button_was_pressed) {
            button_was_pressed = false;
            if (!long_press_handled) {
                buzzer_beep(local_buzz_cfg);

                if (local_app_state == STATE_MAIN_MENU) {
                    xSemaphoreTake(sys_mutex, portMAX_DELAY);
                    if (main_menu_idx == 0) { app_state = STATE_SUB_MENU; sub_menu_idx = 0; edit_state = EDIT_NONE; }
                    else if (main_menu_idx == 1) { app_state = STATE_SETTINGS_MENU; settings_menu_idx = 0; }
                    else if (main_menu_idx == 2) app_state = STATE_ABOUT_MENU;
                    xSemaphoreGive(sys_mutex);
                } 
                else if (local_app_state == STATE_SUB_MENU) {
                    if (edit_state == EDIT_NONE) {
                        if (sub_menu_idx == 0) edit_state = EDIT_TIME_VAL1;
                        else if (sub_menu_idx == 1) edit_state = EDIT_TEMP;
                        else if (sub_menu_idx == 2) time_is_min_sec = !time_is_min_sec;
                        else if (sub_menu_idx == 3) temp_is_celsius = !temp_is_celsius;
                        else if (sub_menu_idx == 4) {
                            if (time_val1 == 0 && time_val2 == 0) {
                                buzzer_beep(local_buzz_cfg); vTaskDelay(pdMS_TO_TICKS(50)); buzzer_beep(local_buzz_cfg);
                            } else {
                                uint32_t computed_total = time_is_min_sec ? ((time_val1 * 60) + time_val2) : ((time_val1 * 3600) + (time_val2 * 60));
                                
                                xSemaphoreTake(sys_mutex, portMAX_DELAY);
                                app_state = STATE_DRYING; 
                                is_paused = false;
                                total_drying_seconds = computed_total;
                                remaining_seconds = computed_total;
                                xSemaphoreGive(sys_mutex);
                            }
                        }
                        else if (sub_menu_idx == 5) { 
                            xSemaphoreTake(sys_mutex, portMAX_DELAY);
                            app_state = STATE_MAIN_MENU; 
                            xSemaphoreGive(sys_mutex);
                            sub_menu_idx = 0; 
                        }
                    }
                    else if (edit_state == EDIT_TIME_VAL1) edit_state = EDIT_TIME_VAL2;
                    else if (edit_state == EDIT_TIME_VAL2) edit_state = EDIT_NONE;
                    else if (edit_state == EDIT_TEMP) edit_state = EDIT_NONE;
                } 
                else if (local_app_state == STATE_DRYING) {
                    xSemaphoreTake(sys_mutex, portMAX_DELAY);
                    is_paused = !is_paused;
                    xSemaphoreGive(sys_mutex);
                } 
                else if (local_app_state == STATE_SETTINGS_MENU) {
                    if (settings_menu_idx == 0) {
                        xSemaphoreTake(sys_mutex, portMAX_DELAY);
                        if (wifi_state != WIFI_STATE_CONNECTED) { wifi_state = WIFI_STATE_PAIRING; manual_reconnect_request = true; }
                        xSemaphoreGive(sys_mutex);
                    }
                    else if (settings_menu_idx == 1) { xSemaphoreTake(sys_mutex, portMAX_DELAY); uvc_on = !uvc_on; save_settings(); xSemaphoreGive(sys_mutex); }
                    else if (settings_menu_idx == 2) { xSemaphoreTake(sys_mutex, portMAX_DELAY); buzzer_on = !buzzer_on; save_settings(); xSemaphoreGive(sys_mutex); }
                    else if (settings_menu_idx == 3) {
                        xSemaphoreTake(sys_mutex, portMAX_DELAY);
                        brightness_level = (brightness_level + 1) % 3;
                        if (brightness_level == 0) u8g2_SetContrast(&u8g2, 1);
                        else if (brightness_level == 1) u8g2_SetContrast(&u8g2, 127);
                        else u8g2_SetContrast(&u8g2, 255);
                        save_settings();
                        xSemaphoreGive(sys_mutex);
                    }
                    else if (settings_menu_idx == 4) {
                        xSemaphoreTake(sys_mutex, portMAX_DELAY);
                        app_state = STATE_MAIN_MENU;
                        xSemaphoreGive(sys_mutex);
                    }
                } 
                else if (local_app_state == STATE_ABOUT_MENU) {
                    xSemaphoreTake(sys_mutex, portMAX_DELAY);
                    app_state = STATE_MAIN_MENU;
                    xSemaphoreGive(sys_mutex);
                }
            }
        }

        // Re-verify layout states post execution processing
        xSemaphoreTake(sys_mutex, portMAX_DELAY);
        local_app_state = app_state;
        local_remaining = remaining_seconds;
        local_total = total_drying_seconds;
        local_paused = is_paused;
        wifi_status_t local_wifi = wifi_state;
        bool local_uv = uvc_on;
        int local_bright = brightness_level;
        xSemaphoreGive(sys_mutex);

        u8g2_ClearBuffer(&u8g2);
        bool blink_off = (xTaskGetTickCount() * portTICK_PERIOD_MS / 300) % 2 == 0;

        if (local_app_state == STATE_MAIN_MENU) {
            u8g2_SetFont(&u8g2, u8g2_font_profont17_tf);
            u8g2_DrawStr(&u8g2, 13, 16, "Start"); u8g2_DrawStr(&u8g2, 13, 39, "Settings"); u8g2_DrawStr(&u8g2, 12, 59, "About");
            int frame_y[] = {1, 24, 44}; int cursor_y[] = {7, 30, 50};
            u8g2_DrawFrame(&u8g2, 1, frame_y[main_menu_idx], 126, 19);
            u8g2_DrawXBM(&u8g2, 5, cursor_y[main_menu_idx], 4, 7, image_cursor_bits);
        } 
        else if (local_app_state == STATE_SUB_MENU) {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);
            int scroll_y = (sub_menu_idx == 5) ? 12 : 0;
            u8g2_DrawStr(&u8g2, 7, 10 - scroll_y, "Time"); u8g2_DrawStr(&u8g2, 7, 22 - scroll_y, "Temp");
            u8g2_DrawStr(&u8g2, 7, 34 - scroll_y, "Time Format"); u8g2_DrawStr(&u8g2, 7, 46 - scroll_y, "Temp Format");
            u8g2_DrawStr(&u8g2, 7, 58 - scroll_y, "[Start Drying]"); u8g2_DrawStr(&u8g2, 7, 70 - scroll_y, "[Exit]");

            u8g2_DrawStr(&u8g2, 73, 34 - scroll_y, time_is_min_sec ? "[min:sec]" : "[hr:min]");
            u8g2_DrawUTF8(&u8g2, 73, 46 - scroll_y, temp_is_celsius ? "[°C]" : "[°F]");

            char buf[32];
            if (edit_state == EDIT_TIME_VAL1 && blink_off) sprintf(buf, "[  :%02d]", time_val2);
            else if (edit_state == EDIT_TIME_VAL2 && blink_off) sprintf(buf, "[%02d:  ]", time_val1);
            else sprintf(buf, "[%02d:%02d]", time_val1, time_val2);
            u8g2_DrawStr(&u8g2, 30, 10 - scroll_y, buf);

            if (edit_state == EDIT_TEMP && blink_off) sprintf(buf, temp_is_celsius ? "[  °C]" : "[  °F]");
            else sprintf(buf, temp_is_celsius ? "[%02d°C]" : "[%02d°F]", temp_val);
            u8g2_DrawUTF8(&u8g2, 30, 22 - scroll_y, buf);

            int frame_y[] = {0, 12, 24, 36, 48, 60}; int cursor_y[] = {3, 15, 27, 39, 51, 63};
            u8g2_DrawFrame(&u8g2, 0, frame_y[sub_menu_idx] - scroll_y, 128, 13);
            u8g2_DrawXBM(&u8g2, 2, cursor_y[sub_menu_idx] - scroll_y, 4, 7, image_cursor_bits);
        } 
        else if (local_app_state == STATE_DRYING) {
            drawTimer_Active(local_remaining, local_total, local_paused);
        } 
        else if (local_app_state == STATE_SETTINGS_MENU) {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);

            char wifi_lbl[32];
            if (local_wifi == WIFI_STATE_IDLE) snprintf(wifi_lbl, sizeof(wifi_lbl), "Wi-Fi [Pair]");
            else if (local_wifi == WIFI_STATE_PAIRING) snprintf(wifi_lbl, sizeof(wifi_lbl), "Wi-Fi [Pairing...]");
            else if (local_wifi == WIFI_STATE_CONNECTED) snprintf(wifi_lbl, sizeof(wifi_lbl), "Wi-Fi [Connected]");
            u8g2_DrawStr(&u8g2, 8, 10, wifi_lbl);

            u8g2_DrawStr(&u8g2, 8, 22, local_uv ? "UV Sterilize [ON]" : "UV Sterilize [OFF]");
            u8g2_DrawStr(&u8g2, 8, 34, local_buzz_cfg ? "Buzzer Alert [ON]" : "Buzzer Alert [OFF]");

            if (local_bright == 0) u8g2_DrawStr(&u8g2, 8, 46, "Brightness [Low]");
            else if (local_bright == 1) u8g2_DrawStr(&u8g2, 8, 46, "Brightness [Mid]");
            else u8g2_DrawStr(&u8g2, 8, 46, "Brightness [High]");

            u8g2_DrawStr(&u8g2, 8, 58, "[Exit]");
            int frame_y[] = {0, 12, 24, 36, 48}; int cursor_y[] = {3, 15, 27, 39, 51};
            u8g2_DrawFrame(&u8g2, 0, frame_y[settings_menu_idx], 128, 13);
            u8g2_DrawXBM(&u8g2, 2, cursor_y[settings_menu_idx], 4, 7, image_cursor_bits);
        } 
        else if (local_app_state == STATE_ABOUT_MENU) {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);
            u8g2_DrawStr(&u8g2, 8, 9, "Hardware: Aera Nano"); u8g2_DrawStr(&u8g2, 8, 19, "Firmware: v1.0.0");
            u8g2_DrawStr(&u8g2, 8, 29, "MDNS: aera-system"); u8g2_DrawStr(&u8g2, 8, 39, "Suffix: .local");
            u8g2_DrawStr(&u8g2, 8, 58, "[Exit]");
            u8g2_DrawFrame(&u8g2, 0, 48, 128, 13); u8g2_DrawXBM(&u8g2, 2, 51, 4, 7, image_cursor_bits);
        }

        u8g2_SendBuffer(&u8g2);
        vTaskDelay(pdMS_TO_TICKS(15));
    }
}


/* grahpics.h */
#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <stdint.h>

static const uint8_t image_Logo_Aera_bits[] = {
    0x00, 0x00, 0x00, 0xfe, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xfe, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0x3f, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x3f, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x80, 0xff, 0x3f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x80, 0xff, 0x7f, 0x00, 0x3f, 0xc0, 0x3f, 0x3e, 0xc0, 0x0f, 0x00, 0x00, 0x00, 0x80, 0xff, 0x7f,
    0xe0, 0xff, 0xe1, 0xbf, 0x3f, 0xf8, 0x7f, 0x00, 0x00, 0x00, 0xc0, 0xbf, 0x7f, 0xf8, 0xff, 0xe3,
    0xff, 0x3f, 0xfe, 0xff, 0x01, 0x00, 0x00, 0xc0, 0xbf, 0x7f, 0xfc, 0xff, 0xe7, 0xff, 0x3f, 0xff,
    0xff, 0x03, 0x00, 0x00, 0xe0, 0x9f, 0x7f, 0xfe, 0xff, 0xef, 0xff, 0x9f, 0xff, 0xff, 0x03, 0x00,
    0x00, 0xf0, 0x9f, 0x7f, 0xfe, 0xff, 0xef, 0xff, 0x9f, 0xff, 0xff, 0x07, 0x00, 0x00, 0xf0, 0x8f,
    0x7f, 0xff, 0xe1, 0xf7, 0xff, 0xdf, 0x7f, 0xfe, 0x07, 0x00, 0x00, 0xf8, 0x8f, 0x3f, 0xff, 0xc0,
    0xf7, 0xff, 0xdc, 0x3f, 0xf8, 0x07, 0x00, 0x00, 0xf8, 0x87, 0xbf, 0x7f, 0xc0, 0xf7, 0x3f, 0x00,
    0x00, 0xf8, 0x07, 0x00, 0x00, 0xfc, 0x87, 0xbf, 0xff, 0xff, 0xf7, 0x1f, 0x00, 0x00, 0xfc, 0x07,
    0x00, 0x00, 0xfe, 0x87, 0x9f, 0xff, 0xff, 0xf3, 0x0f, 0x00, 0xfe, 0xff, 0x03, 0x00, 0x00, 0xff,
    0x83, 0x9f, 0xff, 0xff, 0xfb, 0x0f, 0x80, 0xff, 0xff, 0x03, 0x00, 0x80, 0xff, 0xff, 0x9f, 0xff,
    0xff, 0xfb, 0x0f, 0xe0, 0xff, 0xff, 0x03, 0x00, 0x80, 0xff, 0xff, 0x9f, 0xff, 0xff, 0xfb, 0x0f,
    0xf0, 0xff, 0xff, 0x03, 0x00, 0xc0, 0xff, 0xff, 0x9f, 0x3f, 0x00, 0xf8, 0x07, 0xf0, 0xff, 0xff,
    0x03, 0x00, 0xe0, 0xff, 0xff, 0x9f, 0x3f, 0x00, 0xf8, 0x07, 0xf8, 0x0f, 0xfe, 0x01, 0x00, 0xf0,
    0xff, 0xff, 0x9f, 0x7f, 0xf0, 0xfd, 0x07, 0xf8, 0x07, 0xfe, 0x01, 0x00, 0xfc, 0xff, 0xff, 0xbf,
    0xff, 0xf8, 0xfd, 0x07, 0xf8, 0x0f, 0xff, 0x01, 0x00, 0xfe, 0x7f, 0x00, 0x3f, 0xff, 0xff, 0xfd,
    0x03, 0xf8, 0xff, 0xff, 0x01, 0x00, 0xff, 0x3f, 0x00, 0x7f, 0xff, 0xff, 0xff, 0x03, 0xf8, 0xff,
    0xff, 0x01, 0xc0, 0xff, 0x3f, 0x00, 0x7f, 0xfe, 0xff, 0xfe, 0x03, 0xf0, 0xff, 0xff, 0x00, 0xe0,
    0xff, 0x1f, 0x00, 0xff, 0xfc, 0xff, 0xfe, 0x03, 0xf0, 0xff, 0xff, 0x00, 0xf8, 0xff, 0x1f, 0x00,
    0xff, 0xf9, 0x7f, 0xfe, 0x03, 0xe0, 0x7f, 0xff, 0x00, 0xfe, 0xff, 0x0f, 0x00, 0xff, 0xc1, 0x0f,
    0xfe, 0x01, 0x80, 0x1f, 0xff, 0x00, 0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f, 0x00};

static const uint8_t image_cursor_bits[] = {0x01, 0x03, 0x07, 0x0f, 0x07, 0x03, 0x01};

#endif // GRAPHICS_H



/* hardware.h */
#ifndef HARDWARE_H
#define HARDWARE_H

#include "config.h"

extern volatile int encoder_diff;
extern portMUX_TYPE mux;

uint8_t u8g2_esp32_spi_byte_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr);
uint8_t u8g2_esp32_gpio_and_delay_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr);
void buzzer_init(void);
void buzzer_beep(bool is_enabled);
void rotary_encoder_isr(void *arg);

#endif // HARDWARE_H


/* network.h */
#ifndef NETWORK_H
#define NETWORK_H

#include "esp_err.h"

void network_task(void *pvParameters);

/**
 * @brief Broadcasts a text payload to all connected WebSocket clients (the phone app).
 * @param payload Raw string or JSON string to transmit.
 */
esp_err_t websocket_broadcast(const char *payload);

#endif // NETWORK_H

/* settings.h */
#ifndef SETTINGS_H
#define SETTINGS_H

void load_settings(void);
void save_settings(void);

#endif // SETTINGS_H



/* ui.h */
#ifndef UI_H
#define UI_H

#include "config.h"

void drawTimer_Active(uint32_t remaining_secs, uint32_t total_secs, bool is_paused);
void ui_task(void *pvParameters);

#endif // UI_H