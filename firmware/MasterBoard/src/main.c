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