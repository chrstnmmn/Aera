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