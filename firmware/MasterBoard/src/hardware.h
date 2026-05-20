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