"""Storage for Weekly Household Planner."""

from asyncio import tasks
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import Task


STORAGE_VERSION = 1
STORAGE_KEY = "weekly_household_planner"


class PlannerStorage:
    """Handle persistent storage for the planner."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize storage."""
        self._store = Store[list[dict[str, Any]]](
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
        )

    async def async_load(self) -> list[Task]:
        """Load tasks from storage."""

        data = await self._store.async_load()

        if data is None:
            return []

        needs_migration = any("id" not in task_data for task_data in data)

        tasks = [Task.from_dict(task_data) for task_data in data]

        if needs_migration:
            await self.async_save(tasks)

        return tasks

    async def async_save(self, tasks: list[Task]) -> None:
        """Save tasks to storage."""

        data = [task.to_dict() for task in tasks]

        await self._store.async_save(data)
