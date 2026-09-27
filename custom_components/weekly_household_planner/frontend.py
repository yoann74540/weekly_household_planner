"""Frontend support for Weekly Household Planner."""

from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant


FRONTEND_PATH = Path(__file__).parent / "frontend"

FRONTEND_URL = "/weekly_household_planner"


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
