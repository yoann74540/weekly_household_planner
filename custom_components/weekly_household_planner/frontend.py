"""Frontend support for Weekly Household Planner."""

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant


FRONTEND_PATH = Path(__file__).parent / "frontend"
FRONTEND_URL = "/weekly_household_planner"

CARD_URL = f"{FRONTEND_URL}/weekly-planner-card.js"


async def async_setup_frontend(
    hass: HomeAssistant,
) -> None:
    """Set up frontend resources."""

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(FRONTEND_PATH),
                False,
            )
        ]
    )

    add_extra_js_url(
        hass,
        CARD_URL,
    )
