#include <stdio.h>
#include <stdbool.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_log.h"
#include "esp_timer.h"

static const char *TAG = "CHAMBER_CTRL";

// --- Pin Definitions ---
#define RELAY_GPIO 25
#define FAN_PWM_GPIO 26
#define FAN_TACH_GPIO 27

// Button Pins
#define BTN_0_GPIO 32
#define BTN_25_GPIO 33
#define BTN_50_GPIO 22
#define BTN_100_GPIO 23
#define HEATER_BTN_GPIO 21 // New Heater Toggle Button

// --- LEDC Configuration ---
#define LEDC_TIMER LEDC_TIMER_0
#define LEDC_MODE LEDC_LOW_SPEED_MODE
#define LEDC_CHANNEL LEDC_CHANNEL_0
#define LEDC_DUTY_RES LEDC_TIMER_10_BIT
#define LEDC_FREQUENCY 2000 // Kept at 2kHz for software debouncing

// --- Global State Variables ---
volatile uint32_t tach_pulse_count = 0;
volatile int64_t last_tach_time = 0;
uint8_t current_fan_speed = 0; // Track fan speed for safety checks
bool is_heater_on = false;     // Track heater state

// --- Interrupt Service Routine (ISR) ---
static void IRAM_ATTR tach_isr_handler(void *arg)
{
  int64_t current_time = esp_timer_get_time();
  if (current_time - last_tach_time > 2000)
  {
    tach_pulse_count++;
    last_tach_time = current_time;
  }
}

// --- Helper: Set Fan Speed with Safety Interlock ---
void set_fan_speed_percent(uint8_t percent)
{
  if (percent > 100)
    percent = 100;

  // SAFETY INTERLOCK: Auto-kill heater if fan is turned off
  if (percent == 0 && is_heater_on)
  {
    is_heater_on = false;
    gpio_set_level(RELAY_GPIO, 0);
    ESP_LOGW(TAG, "SAFETY TRIGGERED: Heater auto-disabled because fan was turned off.");
  }

  uint32_t duty = (percent * 1023) / 100;
  ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, duty);
  ledc_update_duty(LEDC_MODE, LEDC_CHANNEL);
  current_fan_speed = percent;

  ESP_LOGI(TAG, "--> Fan Speed set to %d%%", percent);
}

// --- FreeRTOS Task: Log RPM every 1 second ---
void rpm_monitor_task(void *pvParameter)
{
  while (1)
  {
    tach_pulse_count = 0;
    int64_t start_time = esp_timer_get_time();

    vTaskDelay(pdMS_TO_TICKS(1000));

    int64_t end_time = esp_timer_get_time();
    uint32_t pulses = tach_pulse_count;

    float seconds_elapsed = (float)(end_time - start_time) / 1000000.0;
    uint32_t rpm = (uint32_t)(((float)pulses / 2.0) * (60.0 / seconds_elapsed));

    // Only log RPM to keep the terminal slightly cleaner, but you can uncomment this if you want it
    // ESP_LOGI(TAG, "Current RPM: %lu", rpm);
  }
}

void app_main(void)
{
  ESP_LOGI(TAG, "Initializing hardware...");

  // 1. Initialize Relay
  gpio_reset_pin(RELAY_GPIO);
  gpio_set_direction(RELAY_GPIO, GPIO_MODE_OUTPUT);
  gpio_set_level(RELAY_GPIO, 0); // Ensure OFF on boot

  // 2. Initialize All 5 Buttons
  uint64_t btn_pin_mask = (1ULL << BTN_0_GPIO) |
                          (1ULL << BTN_25_GPIO) |
                          (1ULL << BTN_50_GPIO) |
                          (1ULL << BTN_100_GPIO) |
                          (1ULL << HEATER_BTN_GPIO);

  gpio_config_t btn_conf = {
      .intr_type = GPIO_INTR_DISABLE,
      .pin_bit_mask = btn_pin_mask,
      .mode = GPIO_MODE_INPUT,
      .pull_up_en = 1,
      .pull_down_en = 0};
  ESP_ERROR_CHECK(gpio_config(&btn_conf));

  // 3. Initialize Fan PWM
  ledc_timer_config_t ledc_timer = {
      .speed_mode = LEDC_MODE,
      .timer_num = LEDC_TIMER,
      .duty_resolution = LEDC_DUTY_RES,
      .freq_hz = LEDC_FREQUENCY,
      .clk_cfg = LEDC_AUTO_CLK};
  ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

  ledc_channel_config_t ledc_channel = {
      .speed_mode = LEDC_MODE,
      .channel = LEDC_CHANNEL,
      .timer_sel = LEDC_TIMER,
      .intr_type = LEDC_INTR_DISABLE,
      .gpio_num = FAN_PWM_GPIO,
      .duty = 0,
      .hpoint = 0};
  ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));

  // 4. Initialize Tachometer
  gpio_config_t tach_conf = {
      .intr_type = GPIO_INTR_NEGEDGE,
      .pin_bit_mask = (1ULL << FAN_TACH_GPIO),
      .mode = GPIO_MODE_INPUT,
      .pull_up_en = 1,
      .pull_down_en = 0};
  ESP_ERROR_CHECK(gpio_config(&tach_conf));

  ESP_ERROR_CHECK(gpio_install_isr_service(0));
  ESP_ERROR_CHECK(gpio_isr_handler_add(FAN_TACH_GPIO, tach_isr_handler, NULL));

  // 5. Start RPM Task
  xTaskCreate(rpm_monitor_task, "rpm_monitor_task", 2048, NULL, 5, NULL);

  ESP_LOGI(TAG, "System Ready.");
  set_fan_speed_percent(0); // Start safely at 0%

  // --- Main Control Loop ---
  while (1)
  {
    // --- FAN CONTROLS ---
    if (gpio_get_level(BTN_0_GPIO) == 0)
    {
      vTaskDelay(pdMS_TO_TICKS(50));
      if (gpio_get_level(BTN_0_GPIO) == 0)
      {
        set_fan_speed_percent(0);
        while (gpio_get_level(BTN_0_GPIO) == 0)
          vTaskDelay(10);
      }
    }
    if (gpio_get_level(BTN_25_GPIO) == 0)
    {
      vTaskDelay(pdMS_TO_TICKS(50));
      if (gpio_get_level(BTN_25_GPIO) == 0)
      {
        set_fan_speed_percent(25);
        while (gpio_get_level(BTN_25_GPIO) == 0)
          vTaskDelay(10);
      }
    }
    if (gpio_get_level(BTN_50_GPIO) == 0)
    {
      vTaskDelay(pdMS_TO_TICKS(50));
      if (gpio_get_level(BTN_50_GPIO) == 0)
      {
        set_fan_speed_percent(50);
        while (gpio_get_level(BTN_50_GPIO) == 0)
          vTaskDelay(10);
      }
    }
    if (gpio_get_level(BTN_100_GPIO) == 0)
    {
      vTaskDelay(pdMS_TO_TICKS(50));
      if (gpio_get_level(BTN_100_GPIO) == 0)
      {
        set_fan_speed_percent(100);
        while (gpio_get_level(BTN_100_GPIO) == 0)
          vTaskDelay(10);
      }
    }

    // --- HEATER TOGGLE CONTROL ---
    if (gpio_get_level(HEATER_BTN_GPIO) == 0)
    {
      vTaskDelay(pdMS_TO_TICKS(50)); // Debounce
      if (gpio_get_level(HEATER_BTN_GPIO) == 0)
      {

        is_heater_on = !is_heater_on; // Toggle state

        // SAFETY INTERLOCK: Auto-start fan if turning heater ON
        if (is_heater_on && current_fan_speed == 0)
        {
          ESP_LOGW(TAG, "SAFETY TRIGGERED: Auto-starting fan to 25%% before heating.");
          set_fan_speed_percent(25);
        }

        // Apply the relay state
        gpio_set_level(RELAY_GPIO, is_heater_on ? 1 : 0);
        ESP_LOGI(TAG, "--> Heater turned %s", is_heater_on ? "ON" : "OFF");

        // Wait for the user to let go of the button
        while (gpio_get_level(HEATER_BTN_GPIO) == 0)
          vTaskDelay(10);
      }
    }

    vTaskDelay(pdMS_TO_TICKS(50));
  }
}