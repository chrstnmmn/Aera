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