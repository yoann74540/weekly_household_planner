"""WebSocket subscriptions for Weekly Household Planner."""

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import Unauthorized
import voluptuous as vol

from .const import DOMAIN


@callback
def async_setup_websocket(hass: HomeAssistant) -> None:
    """Register the planner WebSocket command."""
    websocket_api.async_register_command(
        hass,
        websocket_subscribe,
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/subscribe",
    }
)
@callback
def websocket_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Subscribe to planner changes."""

    # Allow active, authenticated Home Assistant users.
    if connection.user is None or not connection.user.is_active:
        raise Unauthorized()

    @callback
    def schedule_changed(event) -> None:
        connection.send_event(
            msg["id"],
            {
                "type": "schedule_changed",
            },
        )

    @callback
    def completion_changed(event) -> None:
        connection.send_event(
            msg["id"],
            {
                "type": "completion_changed",
                "task_id": event.data["task_id"],
                "completed": event.data["completed"],
                "date": event.data["date"],
            },
        )

    unsubscribe_schedule = hass.bus.async_listen(
        f"{DOMAIN}_schedule_changed",
        schedule_changed,
    )

    unsubscribe_completion = hass.bus.async_listen(
        f"{DOMAIN}_task_completion_changed",
        completion_changed,
    )

    @callback
    def unsubscribe() -> None:
        unsubscribe_schedule()
        unsubscribe_completion()

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
