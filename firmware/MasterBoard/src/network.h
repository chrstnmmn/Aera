/* network.h */
#ifndef NETWORK_H
#define NETWORK_H

#include "esp_err.h"

void network_task(void *pvParameters);

/**
 * @brief Broadcasts a text payload to all connected WebSocket clients (the phone app).
 * @param payload Raw string or JSON string to transmit.
 */
esp_err_t websocket_broadcast(const char *payload);

#endif // NETWORK_H