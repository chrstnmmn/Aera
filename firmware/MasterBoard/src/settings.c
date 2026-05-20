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