"""Storage for Weekly Household Planner."""

from asyncio import tasks
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .models import Task


STORAGE_VERSION = 1
STORAGE_KEY = "weekly_household_planner"
COMPLETION_STORAGE_KEY = "weekly_household_planner_completions"


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


class TaskCompletionStorage:
    """Handle persistent task completion states."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize completion storage."""

        self._store = Store[dict[str, dict[str, bool]]](
            hass,
            STORAGE_VERSION,
            COMPLETION_STORAGE_KEY,
        )

        self._completions: dict[str, dict[str, bool]] = {}

    async def async_load(self) -> None:
        """Load completion states from storage."""

        self._completions = await self._store.async_load() or {}

    async def async_set_completed(
        self,
        task_id: str,
        date: str,
        completed: bool = True,
    ) -> None:
        """Set task completion state for a specific date."""

        self._completions.setdefault(date, {})[task_id] = completed

        await self._store.async_save(self._completions)

    def is_completed(self, task_id: str, date: str) -> bool:
        """Check whether a task is completed on a specific date."""

        return self._completions.get(date, {}).get(task_id, False)
