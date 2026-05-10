#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/spi_master.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_log.h"
#include "u8g2.h"
#include "nvs_flash.h"
#include "nvs.h"
#include "esp_timer.h"

static const char *TAG = "AERA_SYSTEM";

// Pin definitions
#define PIN_NUM_MISO -1
#define PIN_NUM_MOSI 25
#define PIN_NUM_CLK 33
#define PIN_NUM_CS 14
#define PIN_NUM_DC 27
#define PIN_NUM_RST 26

#define ROTARY_PIN_NUM_SW 23
#define ROTARY_PIN_NUM_DT 22
#define ROTARY_PIN_NUM_CLK 21

#define BUZZER_PIN_NUM 16

#define OLED_WIDTH 128
#define OLED_HEIGHT 64

spi_device_handle_t spi;
u8g2_t u8g2;

// ==========================================
// Graphics Data
// ==========================================
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

// ==========================================
// Settings & NVS Management
// ==========================================
bool uvc_on = true;
bool buzzer_on = true;
int brightness_level = 2; // 0=Low, 1=Mid, 2=High

void load_settings()
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
    ESP_LOGI(TAG, "Settings loaded from NVS");
}

void save_settings()
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
    ESP_LOGI(TAG, "Settings saved to NVS");
}

// ==========================================
// Native ESP-IDF u8g2 Callbacks
// ==========================================
uint8_t u8g2_esp32_spi_byte_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr)
{
    switch (msg)
    {
    case U8X8_MSG_BYTE_SET_DC:
        gpio_set_level(PIN_NUM_DC, arg_int);
        break;
    case U8X8_MSG_BYTE_SEND:
    {
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

uint8_t u8g2_esp32_gpio_and_delay_cb(u8x8_t *u8x8, uint8_t msg, uint8_t arg_int, void *arg_ptr)
{
    switch (msg)
    {
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

// ==========================================
// Buzzer
// ==========================================
void buzzer_init()
{
    ledc_timer_config_t ledc_timer = {.speed_mode = LEDC_LOW_SPEED_MODE, .timer_num = LEDC_TIMER_0, .duty_resolution = LEDC_TIMER_13_BIT, .freq_hz = 2000, .clk_cfg = LEDC_AUTO_CLK};
    ledc_timer_config(&ledc_timer);
    ledc_channel_config_t ledc_channel = {.speed_mode = LEDC_LOW_SPEED_MODE, .channel = LEDC_CHANNEL_0, .timer_sel = LEDC_TIMER_0, .intr_type = LEDC_INTR_DISABLE, .gpio_num = BUZZER_PIN_NUM, .duty = 0, .hpoint = 0};
    ledc_channel_config(&ledc_channel);
}

void buzzer_beep(bool is_enabled)
{
    if (!is_enabled)
        return;
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 4096);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
    vTaskDelay(pdMS_TO_TICKS(40));
    ledc_set_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0, 0);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, LEDC_CHANNEL_0);
}

// ==========================================
// Rotary Encoder ISR (State Machine)
// ==========================================
static volatile int encoder_diff = 0;
static portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

static void IRAM_ATTR rotary_encoder_isr(void *arg)
{
    static uint8_t old_state = 3;
    static int8_t encoder_value = 0;
    static const int8_t state_table[] = {0, -1, 1, 0, 1, 0, 0, -1, -1, 0, 0, 1, 0, 1, -1, 0};

    uint8_t clk = gpio_get_level(ROTARY_PIN_NUM_CLK);
    uint8_t dt = gpio_get_level(ROTARY_PIN_NUM_DT);
    uint8_t current_state = (clk << 1) | dt;
    uint8_t index = (old_state << 2) | current_state;

    encoder_value += state_table[index];
    old_state = current_state;

    if (encoder_value > 3)
    {
        encoder_diff++;
        encoder_value = 0;
    }
    else if (encoder_value < -3)
    {
        encoder_diff--;
        encoder_value = 0;
    }
}

// ==========================================
// Application States
// ==========================================
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

// ==========================================
// Active Timer UI Renderer
// ==========================================
void drawTimer_Active(uint32_t remaining_secs, uint32_t total_secs, bool is_paused)
{
    u8g2_SetBitmapMode(&u8g2, 1);
    u8g2_SetFontMode(&u8g2, 1);

    // Outline Border
    u8g2_DrawFrame(&u8g2, 0, 61, 128, 3);

    // Progress Bar Fill (Fills up as time elapses)
    if (total_secs > 0)
    {
        uint32_t elapsed_secs = total_secs - remaining_secs;
        uint32_t fill_w = (126 * elapsed_secs) / total_secs;
        u8g2_DrawBox(&u8g2, 1, 62, fill_w, 1);
    }

    // Smart Format Switching Logic
    int display_val1 = 0;
    int display_val2 = 0;
    bool showing_hr_min = false;

    // If remaining time is 1 hour or more, display [hr:min]
    if (remaining_secs >= 3600)
    {
        display_val1 = remaining_secs / 3600;
        display_val2 = (remaining_secs % 3600) / 60;
        showing_hr_min = true;
    }
    // If under an hour, dynamically switch down to [min:sec]
    else
    {
        display_val1 = remaining_secs / 60;
        display_val2 = remaining_secs % 60;
        showing_hr_min = false;
    }

    // Dynamic Timer Text with Blinking Colon
    char separator = ':';
    // Only blink if the timer is actively running
    if (!is_paused && remaining_secs > 0)
    {
        // Toggle the separator every 500ms
        if ((xTaskGetTickCount() * portTICK_PERIOD_MS / 500) % 2 == 0)
        {
            separator = ' '; // Replace with space to hide it
        }
    }

    char time_str[16];
    // Use %c to inject our dynamic separator character
    snprintf(time_str, sizeof(time_str), "%02d%c%02d", display_val1, separator, display_val2);
    u8g2_SetFont(&u8g2, u8g2_font_profont29_tr);
    u8g2_DrawStr(&u8g2, 24, 36, time_str);

    // Dynamic Format Label
    u8g2_SetFont(&u8g2, u8g2_font_profont10_tr);
    u8g2_DrawStr(&u8g2, 42, 44, showing_hr_min ? "hr : min" : "min : sec");

    // Dynamic Status Label
    u8g2_SetFont(&u8g2, u8g2_font_4x6_tr);
    u8g2_DrawStr(&u8g2, 1, 60, is_paused ? "Paused" : "Now Drying");

    // Dynamic Percentage
    char pct_str[16];
    if (total_secs > 0)
    {
        // Percentage of completion (fills up to 100%)
        uint32_t pct = ((total_secs - remaining_secs) * 100) / total_secs;
        snprintf(pct_str, sizeof(pct_str), "%lu%%", pct);
    }
    else
    {
        strcpy(pct_str, "100%");
    }

    // Quick right alignment for the percentage string
    int pct_x = 126 - u8g2_GetUTF8Width(&u8g2, pct_str);
    u8g2_DrawStr(&u8g2, pct_x, 60, pct_str);
}

void app_main(void)
{
    // --- NVS Flash Initialization ---
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK(err);

    load_settings();

    ESP_LOGI(TAG, "Initializing Hardware...");

    // SPI & GPIO Setup
    gpio_config_t io_conf = {.pin_bit_mask = (1ULL << PIN_NUM_DC) | (1ULL << PIN_NUM_RST), .mode = GPIO_MODE_OUTPUT};
    gpio_config(&io_conf);

    spi_bus_config_t buscfg = {.miso_io_num = PIN_NUM_MISO, .mosi_io_num = PIN_NUM_MOSI, .sclk_io_num = PIN_NUM_CLK, .quadwp_io_num = -1, .quadhd_io_num = -1, .max_transfer_sz = OLED_WIDTH * 8};
    spi_device_interface_config_t devcfg = {.clock_speed_hz = 10 * 1000 * 1000, .mode = 0, .spics_io_num = PIN_NUM_CS, .queue_size = 7};

    ESP_ERROR_CHECK(spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO));
    ESP_ERROR_CHECK(spi_bus_add_device(SPI2_HOST, &devcfg, &spi));

    u8g2_Setup_ssd1306_128x64_noname_f(&u8g2, U8G2_R0, u8g2_esp32_spi_byte_cb, u8g2_esp32_gpio_and_delay_cb);
    u8g2_InitDisplay(&u8g2);
    u8g2_SetPowerSave(&u8g2, 0);

    // Apply loaded brightness level
    if (brightness_level == 0)
        u8g2_SetContrast(&u8g2, 1);
    else if (brightness_level == 1)
        u8g2_SetContrast(&u8g2, 127);
    else
        u8g2_SetContrast(&u8g2, 255);

    gpio_config_t rot_conf = {
        .pin_bit_mask = (1ULL << ROTARY_PIN_NUM_CLK) | (1ULL << ROTARY_PIN_NUM_DT) | (1ULL << ROTARY_PIN_NUM_SW),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = 1,
        .intr_type = GPIO_INTR_DISABLE};
    gpio_config(&rot_conf);

    gpio_set_intr_type(ROTARY_PIN_NUM_CLK, GPIO_INTR_ANYEDGE);
    gpio_set_intr_type(ROTARY_PIN_NUM_DT, GPIO_INTR_ANYEDGE);

    gpio_install_isr_service(0);

    gpio_isr_handler_add(ROTARY_PIN_NUM_CLK, rotary_encoder_isr, NULL);
    gpio_isr_handler_add(ROTARY_PIN_NUM_DT, rotary_encoder_isr, NULL);

    buzzer_init();

    // App State Variables
    int app_state = STATE_SPLASH;

    // Menu States
    int main_menu_idx = 0;
    int sub_menu_idx = 0;
    int edit_state = EDIT_NONE;
    int time_val1 = 0, time_val2 = 0, temp_val = 20;
    bool time_is_min_sec = true, temp_is_celsius = true;

    // Settings States
    int settings_menu_idx = 0;

    // Global Timer Tracking Variables
    uint32_t total_drying_seconds = 0;
    uint32_t remaining_seconds = 0;
    bool is_paused = false;
    uint32_t last_timer_tick = 0;

    // Button State Variables
    bool button_was_pressed = false;
    uint32_t button_press_tick = 0;
    bool long_press_handled = false;

    while (1)
    {
        // --- 1. Splash Screen ---
        if (app_state == STATE_SPLASH)
        {
            u8g2_ClearBuffer(&u8g2);
            u8g2_DrawXBM(&u8g2, 14, 16, 99, 32, image_Logo_Aera_bits);
            u8g2_SendBuffer(&u8g2);
            vTaskDelay(pdMS_TO_TICKS(3000));
            app_state = STATE_MAIN_MENU;
            continue;
        }

        // --- 2. Timer Processing (Runs continuously in background) ---
        if (app_state == STATE_DRYING)
        {
            if (!is_paused && remaining_seconds > 0)
            {
                uint32_t current_tick = xTaskGetTickCount();
                // Check if exactly 1000ms has elapsed since the last recorded tick
                if ((current_tick - last_timer_tick) >= pdMS_TO_TICKS(1000))
                {
                    remaining_seconds--;
                    last_timer_tick += pdMS_TO_TICKS(1000); // Prevents drift
                }
            }
            else if (remaining_seconds == 0 && total_drying_seconds > 0)
            {
                // Finished!
                app_state = STATE_MAIN_MENU;
                total_drying_seconds = 0; // Reset

                // Alarm
                for (int i = 0; i < 3; i++)
                {
                    buzzer_beep(buzzer_on);
                    vTaskDelay(pdMS_TO_TICKS(100));
                }
            }
        }

        // --- 3. Input Handling (Encoder Rotation via ISR) ---
        int rot_dir = 0;

        portENTER_CRITICAL(&mux);
        if (encoder_diff != 0)
        {
            rot_dir = (encoder_diff > 0) ? 1 : -1;
            encoder_diff = 0;
        }
        portEXIT_CRITICAL(&mux);

        if (rot_dir != 0)
        {
            if (app_state == STATE_MAIN_MENU)
            {
                main_menu_idx += rot_dir;
                if (main_menu_idx < 0)
                    main_menu_idx = 2;
                if (main_menu_idx > 2)
                    main_menu_idx = 0;
            }
            else if (app_state == STATE_SUB_MENU)
            {
                if (edit_state == EDIT_NONE)
                {
                    sub_menu_idx += rot_dir;
                    if (sub_menu_idx < 0)
                        sub_menu_idx = 5; // <-- Changed from 4 to 5
                    if (sub_menu_idx > 5)
                        sub_menu_idx = 0; // <-- Changed from 4 to 5
                }
                else if (edit_state == EDIT_TIME_VAL1)
                {
                    time_val1 = (time_val1 + rot_dir + 100) % 100;
                }
                else if (edit_state == EDIT_TIME_VAL2)
                {
                    time_val2 = (time_val2 + rot_dir + 60) % 60;
                }
                else if (edit_state == EDIT_TEMP)
                {
                    temp_val = (temp_val + rot_dir + 100) % 100;
                }
            }
            else if (app_state == STATE_SETTINGS_MENU)
            {
                settings_menu_idx += rot_dir;
                if (settings_menu_idx < 0)
                    settings_menu_idx = 4;
                if (settings_menu_idx > 4)
                    settings_menu_idx = 0;
            }
        }

        // --- 4. Input Polling (Non-Blocking Button Handler) ---
        bool current_button_state = (gpio_get_level(ROTARY_PIN_NUM_SW) == 0);

        if (current_button_state && !button_was_pressed)
        {
            // Button just went down
            vTaskDelay(pdMS_TO_TICKS(20)); // debounce
            if (gpio_get_level(ROTARY_PIN_NUM_SW) == 0)
            {
                button_was_pressed = true;
                button_press_tick = xTaskGetTickCount();
                long_press_handled = false;
            }
        }
        else if (current_button_state && button_was_pressed)
        {
            // Button is actively being held down
            if (!long_press_handled && app_state == STATE_DRYING)
            {
                // Check if held for 3 seconds
                if ((xTaskGetTickCount() - button_press_tick) >= pdMS_TO_TICKS(3000))
                {
                    long_press_handled = true;
                    app_state = STATE_SUB_MENU; // Abort straight back to setup
                    sub_menu_idx = 0;
                    edit_state = EDIT_NONE;

                    // Long Beep feedback
                    buzzer_beep(buzzer_on);
                    vTaskDelay(pdMS_TO_TICKS(100));
                    buzzer_beep(buzzer_on);
                }
            }
        }
        else if (!current_button_state && button_was_pressed)
        {
            // Button was just released
            button_was_pressed = false;

            // Only execute normal click logic if a long press didn't already happen
            if (!long_press_handled)
            {
                buzzer_beep(buzzer_on); // Short press feedback

                if (app_state == STATE_MAIN_MENU)
                {
                    if (main_menu_idx == 0)
                    {
                        app_state = STATE_SUB_MENU;
                        sub_menu_idx = 0;
                        edit_state = EDIT_NONE;
                    }
                    else if (main_menu_idx == 1)
                    {
                        app_state = STATE_SETTINGS_MENU;
                        settings_menu_idx = 0;
                    }
                    else if (main_menu_idx == 2)
                    {
                        app_state = STATE_ABOUT_MENU;
                    }
                }
                else if (app_state == STATE_SUB_MENU)
                {
                    if (edit_state == EDIT_NONE)
                    {
                        if (sub_menu_idx == 0)
                            edit_state = EDIT_TIME_VAL1;
                        else if (sub_menu_idx == 1)
                            edit_state = EDIT_TEMP;
                        else if (sub_menu_idx == 2)
                            time_is_min_sec = !time_is_min_sec;
                        else if (sub_menu_idx == 3)
                            temp_is_celsius = !temp_is_celsius;
                        else if (sub_menu_idx == 4)
                        {
                            // --- BUG FIX: Prevent starting with 00:00 ---
                            if (time_val1 == 0 && time_val2 == 0)
                            {
                                // Error beep (two quick beeps)
                                buzzer_beep(buzzer_on);
                                vTaskDelay(pdMS_TO_TICKS(50));
                                buzzer_beep(buzzer_on);
                            }
                            else
                            {
                                // --- Transition into Drying State & Load Timer ---
                                app_state = STATE_DRYING;
                                is_paused = false;

                                // Convert UI set time to pure seconds
                                if (time_is_min_sec)
                                {
                                    total_drying_seconds = (time_val1 * 60) + time_val2;
                                }
                                else
                                {
                                    total_drying_seconds = (time_val1 * 3600) + (time_val2 * 60);
                                }
                                remaining_seconds = total_drying_seconds;
                                last_timer_tick = xTaskGetTickCount();
                            }
                        }
                        // --- EXIT BUTTON ---
                        else if (sub_menu_idx == 5)
                        {
                            app_state = STATE_MAIN_MENU;
                            sub_menu_idx = 0; // Reset index for next time
                        }
                    }
                    else if (edit_state == EDIT_TIME_VAL1)
                        edit_state = EDIT_TIME_VAL2;
                    else if (edit_state == EDIT_TIME_VAL2)
                        edit_state = EDIT_NONE;
                    else if (edit_state == EDIT_TEMP)
                        edit_state = EDIT_NONE;
                }
                else if (app_state == STATE_DRYING)
                {
                    // Short press during drying simply pauses/resumes
                    is_paused = !is_paused;

                    // Reset the reference tick when resuming to prevent time jumping
                    if (!is_paused)
                    {
                        last_timer_tick = xTaskGetTickCount();
                    }
                }
                else if (app_state == STATE_SETTINGS_MENU)
                {
                    if (settings_menu_idx == 0)
                    {
                        ESP_LOGI(TAG, "Triggering Wi-Fi Pairing Mode...");
                    }
                    else if (settings_menu_idx == 1)
                    {
                        uvc_on = !uvc_on;
                        save_settings();
                    }
                    else if (settings_menu_idx == 2)
                    {
                        buzzer_on = !buzzer_on;
                        save_settings();
                    }
                    else if (settings_menu_idx == 3)
                    {
                        brightness_level = (brightness_level + 1) % 3;
                        if (brightness_level == 0)
                            u8g2_SetContrast(&u8g2, 1);
                        else if (brightness_level == 1)
                            u8g2_SetContrast(&u8g2, 127);
                        else
                            u8g2_SetContrast(&u8g2, 255);
                        save_settings();
                    }
                    else if (settings_menu_idx == 4)
                    {
                        app_state = STATE_MAIN_MENU;
                    }
                }
                else if (app_state == STATE_ABOUT_MENU)
                {
                    app_state = STATE_MAIN_MENU;
                }
            }
        }

        // --- 5. Render UI ---
        u8g2_ClearBuffer(&u8g2);
        u8g2_SetBitmapMode(&u8g2, 1);
        u8g2_SetFontMode(&u8g2, 1);

        bool blink_off = (xTaskGetTickCount() * portTICK_PERIOD_MS / 300) % 2 == 0;

        // --- Main Menu View ---
        if (app_state == STATE_MAIN_MENU)
        {
            u8g2_SetFont(&u8g2, u8g2_font_profont17_tf);
            u8g2_DrawStr(&u8g2, 13, 16, "Start");
            u8g2_DrawStr(&u8g2, 13, 39, "Settings");
            u8g2_DrawStr(&u8g2, 12, 59, "About");

            int frame_y[] = {1, 24, 44};
            int cursor_y[] = {7, 30, 50};
            u8g2_DrawFrame(&u8g2, 1, frame_y[main_menu_idx], 126, 19);
            u8g2_DrawXBM(&u8g2, 5, cursor_y[main_menu_idx], 4, 7, image_cursor_bits);
        }

        // --- Setup Drying View ---
        else if (app_state == STATE_SUB_MENU)
        {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);

            // Dynamic camera offset: If on the last item, push everything up by 12 pixels
            int scroll_y = (sub_menu_idx == 5) ? 12 : 0;

            // Left Labels
            u8g2_DrawStr(&u8g2, 7, 10 - scroll_y, "Time");
            u8g2_DrawStr(&u8g2, 7, 22 - scroll_y, "Temp");
            u8g2_DrawStr(&u8g2, 7, 34 - scroll_y, "Time Format");
            u8g2_DrawStr(&u8g2, 7, 46 - scroll_y, "Temp Format");
            u8g2_DrawStr(&u8g2, 7, 58 - scroll_y, "[Start Drying]");
            u8g2_DrawStr(&u8g2, 7, 70 - scroll_y, "[Exit]"); // Physically off-screen until scrolled

            // Right Align Labels
            u8g2_DrawStr(&u8g2, 73, 34 - scroll_y, time_is_min_sec ? "[min:sec]" : "[hr:min]");
            u8g2_DrawUTF8(&u8g2, 73, 46 - scroll_y, temp_is_celsius ? "[°C]" : "[°F]");

            char buf[32];
            if (edit_state == EDIT_TIME_VAL1 && blink_off)
                sprintf(buf, "[  :%02d]", time_val2);
            else if (edit_state == EDIT_TIME_VAL2 && blink_off)
                sprintf(buf, "[%02d:  ]", time_val1);
            else
                sprintf(buf, "[%02d:%02d]", time_val1, time_val2);
            u8g2_DrawStr(&u8g2, 30, 10 - scroll_y, buf);

            if (edit_state == EDIT_TEMP && blink_off)
                sprintf(buf, temp_is_celsius ? "[  °C]" : "[  °F]");
            else
                sprintf(buf, temp_is_celsius ? "[%02d°C]" : "[%02d°F]", temp_val);
            u8g2_DrawUTF8(&u8g2, 30, 22 - scroll_y, buf);

            // Coordinates for the highlight box and cursor
            int frame_y[] = {0, 12, 24, 36, 48, 60};
            int cursor_y[] = {3, 15, 27, 39, 51, 63};

            u8g2_DrawFrame(&u8g2, 0, frame_y[sub_menu_idx] - scroll_y, 128, 13);
            u8g2_DrawXBM(&u8g2, 2, cursor_y[sub_menu_idx] - scroll_y, 4, 7, image_cursor_bits);
        }

        // --- Active Drying Timer View ---
        else if (app_state == STATE_DRYING)
        {
            drawTimer_Active(remaining_seconds, total_drying_seconds, is_paused);
        }

        // --- Settings Menu View ---
        else if (app_state == STATE_SETTINGS_MENU)
        {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);

            u8g2_DrawStr(&u8g2, 8, 10, "Wi-Fi [Pair]");
            u8g2_DrawStr(&u8g2, 8, 22, uvc_on ? "UV Sterilize [ON]" : "UV Sterilize [OFF]");
            u8g2_DrawStr(&u8g2, 8, 34, buzzer_on ? "Buzzer Alert [ON]" : "Buzzer Alert [OFF]");

            if (brightness_level == 0)
                u8g2_DrawStr(&u8g2, 8, 46, "Brightness [Low]");
            else if (brightness_level == 1)
                u8g2_DrawStr(&u8g2, 8, 46, "Brightness [Mid]");
            else
                u8g2_DrawStr(&u8g2, 8, 46, "Brightness [High]");

            u8g2_DrawStr(&u8g2, 8, 58, "[Exit]");

            int frame_y[] = {0, 12, 24, 36, 48};
            int cursor_y[] = {3, 15, 27, 39, 51};
            u8g2_DrawFrame(&u8g2, 0, frame_y[settings_menu_idx], 128, 13);
            u8g2_DrawXBM(&u8g2, 2, cursor_y[settings_menu_idx], 4, 7, image_cursor_bits);
        }

        // --- About Menu View ---
        else if (app_state == STATE_ABOUT_MENU)
        {
            u8g2_SetFont(&u8g2, u8g2_font_profont11_tf);

            u8g2_DrawStr(&u8g2, 8, 9, "Hardware: Aera Nano");
            u8g2_DrawStr(&u8g2, 8, 19, "Firmware: v1.0.0");
            u8g2_DrawStr(&u8g2, 8, 29, "IP: 192.168.1.45");
            u8g2_DrawStr(&u8g2, 8, 39, "MAC: AB:CD:EF:12:34");

            u8g2_DrawStr(&u8g2, 8, 58, "[Exit]");

            u8g2_DrawFrame(&u8g2, 0, 48, 128, 13);
            u8g2_DrawXBM(&u8g2, 2, 51, 4, 7, image_cursor_bits);
        }

        u8g2_SendBuffer(&u8g2);
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}