"""The Weekly Household Planner integration."""

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)

from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.const import Platform

from .planner import (
    DuplicateTaskError,
    WeeklyPlanner,
)
from .storage import PlannerStorage
from .frontend import async_setup_frontend


from .const import DOMAIN
from .models import Day, Task

from .definition import PlannerDefinition
from homeassistant.util import dt as dt_util

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

PLATFORMS = [
    Platform.CALENDAR,
]

ADD_TASK_SCHEMA = vol.Schema(
    {
        vol.Required("day"): vol.In([day.value for day in Day]),
        vol.Required("who"): cv.string,
        vol.Required("task"): cv.string,
        vol.Optional("parameters", default={}): dict,
    }
)

REMOVE_TASK_SCHEMA = vol.Schema(
    {
        vol.Required("id"): cv.string,
    }
)

UPDATE_TASK_SCHEMA = vol.Schema(
    {
        vol.Required("id"): cv.string,
        vol.Required("day"): vol.In([day.value for day in Day]),
        vol.Required("who"): cv.string,
        vol.Required("task"): cv.string,
        vol.Optional("parameters", default={}): dict,
    }
)

GET_TASKS_SCHEMA = vol.Schema(
    {
        vol.Optional("day"): vol.In(
            ["today", *[day.value for day in Day]]
        ),
        vol.Optional("who"): cv.string,
        vol.Optional("task"): cv.string,
    }
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up Weekly Household Planner from a config entry."""

    definition = PlannerDefinition.from_dict(
        entry.data["definition"]
    )

    storage = PlannerStorage(hass)
    tasks = await storage.async_load()

    planner = WeeklyPlanner(
        storage=storage,
        definition=definition,
        tasks=tasks,
    )

    # Adapt existing scheduled tasks to the new definition.
    await planner.reconcile_tasks_with_definition()

    entry.runtime_data = planner

    await hass.config_entries.async_forward_entry_setups(
        entry,
        PLATFORMS,
    )

    return True


async def async_unload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Unload a config entry."""

    return await hass.config_entries.async_unload_platforms(
        entry,
        PLATFORMS,
    )


async def async_setup(
    hass: HomeAssistant,
    config: ConfigType,
) -> bool:
    """Set up Weekly Household Planner."""

    async def async_add_task(
        call: ServiceCall,
    ) -> ServiceResponse:
        """Add a task to the weekly planner."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {
                "success": False,
                "error": "planner_not_found",
            }

        entry = entries[0]
        planner = entry.runtime_data

        task = Task(
            day=Day(call.data["day"]),
            who=call.data["who"],
            task=call.data["task"],
            parameters=call.data.get("parameters", {}),
        )

        try:
            success = await planner.add_task(task)
        except DuplicateTaskError:
            return {
                "success": False,
                "error": "duplicate_task",
            }

        if not success:
            return {
                "success": False,
                "error": "invalid_task",
            }

        return {
            "success": True,
            "task": task.to_dict(),
        }

    async def async_remove_task(call: ServiceCall) -> ServiceResponse:
        """Remove a task from the planner."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {
                "success": False,
                "error": "planner_not_found",
            }

        entry = entries[0]
        planner = entry.runtime_data

        success = await planner.remove_task(call.data["id"])

        return {
            "success": success,
        }

    async def async_update_task(call: ServiceCall) -> ServiceResponse:
        """Update a task in the planner."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {
                "success": False,
                "error": "planner_not_found",
            }

        entry = entries[0]
        planner = entry.runtime_data

        task = Task(
            day=Day(call.data["day"]),
            who=call.data["who"],
            task=call.data["task"],
            parameters=call.data.get("parameters", {}),
        )

        try:
            success = await planner.update_task(
                call.data["id"],
                task,
            )
        except DuplicateTaskError:
            return {
                "success": False,
                "error": "duplicate_task",
            }

        if not success:
            return {
                "success": False,
                "error": "invalid_task",
            }

        return {
            "success": True,
            "task": task.to_dict(),
        }

    async def async_get_schedule(call: ServiceCall) -> ServiceResponse:
        """Return the complete weekly schedule."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {"schedule": {}}

        entry = entries[0]
        planner = entry.runtime_data

        return {
            "schedule": planner.get_schedule(),
        }

    async def async_get_tasks(
        call: ServiceCall,
    ) -> ServiceResponse:
        """Return tasks matching the requested filters."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {"tasks": []}

        planner = entries[0].runtime_data

        requested_day = call.data.get("day")

        if requested_day == "today":
            day = Day(
                dt_util.now().strftime("%A").lower()
            )
        elif requested_day is not None:
            day = Day(requested_day)
        else:
            day = None

        tasks = planner.get_tasks(
            day=day,
            who=call.data.get("who"),
            task=call.data.get("task"),
        )

        return {
            "tasks": [
                task.to_dict()
                for task in tasks
            ]
        }

    async def async_get_definition(
        call: ServiceCall,
    ) -> ServiceResponse:
        """Return the planner definition."""

        entries = hass.config_entries.async_entries(DOMAIN)

        if not entries:
            return {"definition": {}}

        entry = entries[0]
        planner = entry.runtime_data

        return {
            "definition": planner.definition.to_dict(),
        }

    hass.services.async_register(
        DOMAIN,
        "get_definition",
        async_get_definition,
        supports_response=SupportsResponse.ONLY,
    )

    hass.services.async_register(
        DOMAIN,
        "add_task",
        async_add_task,
        schema=ADD_TASK_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )

    hass.services.async_register(
        DOMAIN,
        "remove_task",
        async_remove_task,
        schema=REMOVE_TASK_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )

    hass.services.async_register(
        DOMAIN,
        "update_task",
        async_update_task,
        schema=UPDATE_TASK_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )

    hass.services.async_register(
        DOMAIN,
        "get_schedule",
        async_get_schedule,
        supports_response=SupportsResponse.ONLY,
    )

    hass.services.async_register(
        DOMAIN,
        "get_tasks",
        async_get_tasks,
        schema=GET_TASKS_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    await async_setup_frontend(hass)

    return True
