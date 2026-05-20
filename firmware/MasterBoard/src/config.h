#ifndef CONFIG_H
#define CONFIG_H

#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "driver/spi_master.h"
#include "driver/gpio.h"
#include "u8g2.h"

// Hardcoded Local Router Credentials
#define WIFI_SSID "HUAWEI-2.4G-ZxPH"
#define WIFI_PASS "vq5hJkB8"
#define MAX_WIFI_RETRIES 3

// Hardware Interface Pin Assignments
#define PIN_NUM_MISO -1
#define PIN_NUM_CLK 14
#define PIN_NUM_MOSI 27
#define PIN_NUM_RST 26
#define PIN_NUM_DC 25
#define PIN_NUM_CS 33

#define ROTARY_PIN_NUM_SW 23
#define ROTARY_PIN_NUM_DT 22
#define ROTARY_PIN_NUM_CLK 21

#define BUZZER_PIN_NUM 16

#define OLED_WIDTH 128
#define OLED_HEIGHT 64

// System Architecture Enums
enum
{
    STATE_SPLASH,
    STATE_MAIN_MENU,
    STATE_SUB_MENU,
    STATE_SETTINGS_MENU,
    STATE_ABOUT_MENU,
    STATE_DRYING
};
enum
{
    EDIT_NONE,
    EDIT_TIME_VAL1,
    EDIT_TIME_VAL2,
    EDIT_TEMP
};

typedef enum
{
    WIFI_STATE_IDLE,
    WIFI_STATE_PAIRING,
    WIFI_STATE_CONNECTED
} wifi_status_t;

// --- Shared Thread Variables Declarations ---
extern const char *TAG;
extern spi_device_handle_t spi;
extern u8g2_t u8g2;
extern SemaphoreHandle_t sys_mutex;

extern wifi_status_t wifi_state;
extern bool manual_reconnect_request;
extern int retry_count;

extern bool uvc_on;
extern bool buzzer_on;
extern int brightness_level;

#endif // CONFIG_H