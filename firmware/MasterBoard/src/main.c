#include "config.h"
#include "settings.h"
#include "network.h"
#include "ui.h"
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

void app_main(void) {
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK(err);

    load_settings();

    uint8_t mac_addr[6];
    if (esp_read_mac(mac_addr, ESP_MAC_WIFI_STA) == ESP_OK) {
        ESP_LOGI(TAG, "==========================================");
        ESP_LOGI(TAG, "     TARGET DEVICE MAC WHITELIST PROFILE ");
        ESP_LOGI(TAG, " MAC ADDR: %02X:%02X:%02X:%02X:%02X:%02X",
                 mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
        ESP_LOGI(TAG, "==========================================");
    } else {
        ESP_LOGE(TAG, "Failed to read hardware EFUSE MAC block!");
    }

    sys_mutex = xSemaphoreCreateMutex();
    if (sys_mutex == NULL) {
        ESP_LOGE(TAG, "Fatal error initializing safety mutex block.");
        return;
    }

    gpio_install_isr_service(0);

    // Cross-Core Symmetric Task Execution Setup
    xTaskCreatePinnedToCore(network_task, "network_task", 4096, NULL, 3, NULL, 0); // Core 0
    xTaskCreatePinnedToCore(ui_task,      "ui_task",      8192, NULL, 3, NULL, 1); // Core 1
}