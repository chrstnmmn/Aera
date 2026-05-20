#include "network.h"
#include "config.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "esp_log.h"
#include "mdns.h"

static void wifi_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data)
{
  if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START)
  {
    ESP_LOGI(TAG, "Wi-Fi Interface Ready. Triggering automatic boot connection...");
    esp_wifi_connect();
  }
  else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED)
  {
    xSemaphoreTake(sys_mutex, portMAX_DELAY);
    if (wifi_state != WIFI_STATE_IDLE)
    {
      if (retry_count < MAX_WIFI_RETRIES)
      {
        retry_count++;
        wifi_state = WIFI_STATE_PAIRING;
        xSemaphoreGive(sys_mutex);
        ESP_LOGW(TAG, "Handshake dropped/unavailable. Retrying attempt %d/%d...", retry_count, MAX_WIFI_RETRIES);
        esp_wifi_connect();
      }
      else
      {
        ESP_LOGE(TAG, "Failed to locate target router after %d attempts. Halting link loop.", MAX_WIFI_RETRIES);
        wifi_state = WIFI_STATE_IDLE;
        retry_count = 0;
        xSemaphoreGive(sys_mutex);
      }
    }
    else
    {
      xSemaphoreGive(sys_mutex);
    }
  }
  else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP)
  {
    ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
    ESP_LOGI(TAG, "IP Assigned Successfully! Station Address: " IPSTR, IP2STR(&event->ip_info.ip));

    xSemaphoreTake(sys_mutex, portMAX_DELAY);
    wifi_state = WIFI_STATE_CONNECTED;
    retry_count = 0;
    xSemaphoreGive(sys_mutex);

    mdns_init();
    mdns_hostname_set("aera-system");
    mdns_instance_name_set("Aera Nano Appliance");
    mdns_service_add(NULL, "_websocket", "_tcp", 8080, NULL, 0);
    ESP_LOGI(TAG, "mDNS active profile broadcast registered: aera-system.local");
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

  while (1)
  {
    xSemaphoreTake(sys_mutex, portMAX_DELAY);
    wifi_status_t current_state = wifi_state;
    bool local_reconnect_req = manual_reconnect_request;
    xSemaphoreGive(sys_mutex);

    if (local_reconnect_req)
    {
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

    if (current_state == WIFI_STATE_PAIRING && !internal_connect_triggered)
    {
      ESP_LOGI(TAG, "Re-initiating baseline router connection: %s ...", WIFI_SSID);
      esp_wifi_connect();
      internal_connect_triggered = true;
    }
    else if (current_state == WIFI_STATE_IDLE)
    {
      internal_connect_triggered = false;
    }

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}