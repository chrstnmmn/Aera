#ifndef UI_H
#define UI_H

#include "config.h"

void drawTimer_Active(uint32_t remaining_secs, uint32_t total_secs, bool is_paused);
void ui_task(void *pvParameters);

#endif // UI_H