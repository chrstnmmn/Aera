#include <stdio.h>
#include <string.h>
#include <math.h> // Now required for swirl math
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/spi_master.h"
#include "driver/gpio.h"
#include "esp_log.h"

static const char *TAG = "OLED_SWIRL";

// Standard PI constant if not defined by compiler
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// Pin definitions (Keeping same from previous step)
#define PIN_NUM_MISO -1
#define PIN_NUM_MOSI 23
#define PIN_NUM_CLK 18
#define PIN_NUM_CS 5
#define PIN_NUM_DC 21
#define PIN_NUM_RST 22

// Display dimensions
#define OLED_WIDTH 128
#define OLED_HEIGHT 64
#define OLED_PAGES 8 // 64 height / 8 bits per page

spi_device_handle_t spi;

// ==========================================
// Framebuffer Management
// SSD1309 uses a vertical addressing scheme
// ==========================================
static uint8_t frame_buffer[OLED_WIDTH * OLED_PAGES];

// Clear the local RAM framebuffer (0=black, 255=all white)
void oled_clear_buffer(uint8_t pattern)
{
    memset(frame_buffer, pattern, sizeof(frame_buffer));
}

// Map (x,y) coordinate to the correct bit in the framebuffer
// color: 1 = ON, 0 = OFF
void oled_draw_pixel(int x, int y, int color)
{
    // Basic boundary check
    if (x < 0 || x >= OLED_WIDTH || y < 0 || y >= OLED_HEIGHT)
    {
        return;
    }

    // The SSD1309 organizes memory in Pages (rows 8px high)
    int page = y / 8;
    int bit_within_byte = y % 8;

    // Calculate index in the linear array
    int buffer_idx = (page * OLED_WIDTH) + x;

    if (color)
    {
        frame_buffer[buffer_idx] |= (1 << bit_within_byte); // Set bit (pixel ON)
    }
    else
    {
        frame_buffer[buffer_idx] &= ~(1 << bit_within_byte); // Clear bit (pixel OFF)
    }
}

// ==========================================
// SPI Communication (Standard from previous step)
// ==========================================
void oled_send_cmd(uint8_t cmd)
{
    spi_transaction_t t;
    memset(&t, 0, sizeof(t));
    t.length = 8;
    t.tx_buffer = &cmd;
    t.user = (void *)0; // D/C line LOW for command
    spi_device_polling_transmit(spi, &t);
}

void oled_send_data(const uint8_t *data, int len)
{
    spi_transaction_t t;
    memset(&t, 0, sizeof(t));
    t.length = len * 8;
    t.tx_buffer = data;
    t.user = (void *)1; // D/C line HIGH for data
    spi_device_polling_transmit(spi, &t);
}

void oled_spi_pre_transfer_callback(spi_transaction_t *t)
{
    int dc = (int)t->user;
    gpio_set_level(PIN_NUM_DC, dc);
}

// Push the entire contents of RAM framebuffer to the hardware display
void oled_flush_buffer()
{
    // 1. Reset hardware window pointer to (0,0)
    oled_send_cmd(0x21);           // Set Column Address
    oled_send_cmd(0);              // Start
    oled_send_cmd(OLED_WIDTH - 1); // End
    oled_send_cmd(0x22);           // Set Page Address
    oled_send_cmd(0);              // Start
    oled_send_cmd(OLED_PAGES - 1); // End

    // 2. Burst all data via DMA
    // (Ensure SPI bus max_transfer_sz was set large enough)
    oled_send_data(frame_buffer, sizeof(frame_buffer));
}

// ==========================================
// Initialization & Main Logic
// ==========================================
void oled_init()
{
    gpio_set_level(PIN_NUM_RST, 0);
    vTaskDelay(pdMS_TO_TICKS(100));
    gpio_set_level(PIN_NUM_RST, 1);
    vTaskDelay(pdMS_TO_TICKS(100));

    // Send optimized SSD1309 setup commands
    oled_send_cmd(0xAE); // Display OFF

    // CRITICAL for framebuffer: Setup Horizontal Addressing Mode
    // Data written will automatically wrap across pages
    oled_send_cmd(0x20);
    oled_send_cmd(0x00); // 00 = Horizontal Mode

    // Basic setup remains same
    oled_send_cmd(0xC8); // Set COM Output Scan Direction
    oled_send_cmd(0x81); // Set contrast control
    oled_send_cmd(0x7F); // Medium contrast for test
    oled_send_cmd(0xA1); // Set segment re-map (depends on display orientation)
    oled_send_cmd(0xA6); // Set normal display
    oled_send_cmd(0xA8); // Multiplex ratio
    oled_send_cmd(0x3F); // 64 Duty

    oled_send_cmd(0x8D); // Charge Pump
    oled_send_cmd(0x14); // Enable

    oled_send_cmd(0xAF); // Display ON
}

void app_main(void)
{
    // Configure IO
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << PIN_NUM_DC) | (1ULL << PIN_NUM_RST),
        .mode = GPIO_MODE_OUTPUT,
    };
    gpio_config(&io_conf);

    // Configure SPI Bus
    spi_bus_config_t buscfg = {
        .miso_io_num = PIN_NUM_MISO,
        .mosi_io_num = PIN_NUM_MOSI,
        .sclk_io_num = PIN_NUM_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        // MUST fit the entire framebuffer size for DMA flush
        .max_transfer_sz = OLED_WIDTH * OLED_PAGES};

    // Configure SPI Device
    spi_device_interface_config_t devcfg = {
        .clock_speed_hz = 10 * 1000 * 1000, // 10 MHz works well on 2.4 inch
        .mode = 0,
        .spics_io_num = PIN_NUM_CS,
        .queue_size = 7,
        .pre_cb = oled_spi_pre_transfer_callback,
    };

    ESP_ERROR_CHECK(spi_bus_initialize(SPI2_HOST, &buscfg, SPI_DMA_CH_AUTO));
    ESP_ERROR_CHECK(spi_bus_add_device(SPI2_HOST, &devcfg, &spi));

    oled_init();
    oled_clear_buffer(0x00);
    oled_flush_buffer();

    ESP_LOGI(TAG, "Starting cool swirl animation...");

    // Animation variables
    float angle_offset = 0.0;
    float center_x = OLED_WIDTH / 2.0;
    float center_y = OLED_HEIGHT / 2.0;

    // Swirl appearance tuners
    float spiral_tightness = 0.8;
    float max_theta = 10 * M_PI; // How long is the spiral (in radians)
    float animation_speed = 0.2;

    while (1)
    {
        // 1. Clear the canvas (locally in RAM)
        oled_clear_buffer(0x00);

        // 2. Calculate the Archimedean Spiral Points
        // Polar coordinates: radius = tightness * theta
        for (float theta = 0; theta < max_theta; theta += 0.08)
        {

            float radius = spiral_tightness * theta;

            // Convert Polar (radius, theta) to Cartesian (x,y)
            // Add angle_offset to rotate the whole spiral
            int x_draw = (int)(center_x + (radius * cos(theta + angle_offset)));
            int y_draw = (int)(center_y + (radius * sin(theta + angle_offset)));

            // Draw the point
            oled_draw_pixel(x_draw, y_draw, 1);

            // OPTIONAL: Draw thicker lines by drawing neighboring pixels
            // oled_draw_pixel(x_draw+1, y_draw, 1);
            // oled_draw_pixel(x_draw, y_draw+1, 1);
        }

        // 3. BLAST the whole buffer to the display over SPI
        oled_flush_buffer();

        // 4. Update the rotation for next frame
        angle_offset += animation_speed;
        if (angle_offset > (2 * M_PI))
            angle_offset -= (2 * M_PI); // keeps float accuracy

        // Add small delay to keep FPS stable (aprox 30-40 fps)
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}