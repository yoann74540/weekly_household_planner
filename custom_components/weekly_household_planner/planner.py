"""Weekly planner for Weekly Household Planner."""

from .definition import (
    ParameterType,
    PlannerDefinition,
)
from .models import Day, Task
from .storage import PlannerStorage


class DuplicateTaskError(Exception):
    """Raised when a task already exists for the day."""


class WeeklyPlanner:
    """Manage the weekly household tasks."""

    def __init__(
        self,
        storage: PlannerStorage,
        definition: PlannerDefinition,
        tasks: list[Task] | None = None,
    ) -> None:
        """Initialize the planner."""
        self._storage = storage
        self.definition = definition
        self.tasks: list[Task] = tasks or []

    async def add_task(self, task: Task) -> bool:
        """Add a task to the planner."""
        if not self.definition.validate_task(task):
            return False

        if self._has_duplicate(task):
            raise DuplicateTaskError

        self.tasks.append(task)
        await self._storage.async_save(self.tasks)
        return True

    async def remove_task(self, task_id: str) -> bool:
        """Remove a task from the planner by ID."""
        for task in self.tasks:
            if task.id == task_id:
                self.tasks.remove(task)
                await self._storage.async_save(self.tasks)
                return True

        return False

    async def update_task(
        self,
        task_id: str,
        updated_task: Task,
    ) -> bool:
        """Update an existing task."""
        if not self.definition.validate_task(updated_task):
            return False

        if self._has_duplicate(
            updated_task,
            exclude_id=task_id,
        ):
            raise DuplicateTaskError

        for index, task in enumerate(self.tasks):
            if task.id == task_id:
                updated_task.id = task_id
                self.tasks[index] = updated_task
                await self._storage.async_save(self.tasks)
                return True

        return False

    def get_tasks_for_day(self, day: Day) -> list[Task]:
        """Return all tasks scheduled for a day."""
        return [
            task
            for task in self.tasks
            if task.day == day
        ]

    def get_schedule(self) -> dict[str, list[dict]]:
        """Return the complete weekly schedule."""
        return {
            day.value: [
                task.to_dict()
                for task in self.get_tasks_for_day(day)
            ]
            for day in Day
        }

    def get_task(self, task_id: str) -> Task | None:
        """Return a task by ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task

        return None

    def _has_duplicate(
        self,
        task: Task,
        exclude_id: str | None = None,
    ) -> bool:
        """Return whether the same task and actor already exist for the day."""

        return any(
            existing.id != exclude_id
            and existing.day == task.day
            and existing.task == task.task
            and existing.who == task.who
            for existing in self.tasks
        )

    async def reconcile_tasks_with_definition(self) -> None:
        """Update scheduled tasks to match the current definition."""

        changed = False

        for task in self.tasks.copy():
            # Keep the task if its task definition no longer exists.
            # We don't delete scheduled tasks automatically.
            task_definition = self.definition.tasks.get(task.task)

            # The task type no longer exists in the definition:
            # remove the scheduled task.
            if task_definition is None:
                self.tasks.remove(task)
                changed = True
                continue

            # The scheduled actor is no longer allowed for this task.
            if (
                task.who not in self.definition.actors
                or task.who not in task_definition.actors
            ):
                self.tasks.remove(task)
                changed = True
                continue

            # Remove parameters that no longer exist or are no longer
            # used by this task definition.
            for parameter_name in list(task.parameters):
                if (
                    parameter_name not in self.definition.parameters
                    or parameter_name not in task_definition.parameters
                ):
                    del task.parameters[parameter_name]
                    changed = True
                    continue

                parameter_definition = (
                    self.definition.parameters[parameter_name]
                )

                task_parameter_definition = (
                    task_definition.parameters[parameter_name]
                )

                value = task.parameters[parameter_name]

                # Multiple selection:
                # remove values that no longer exist.
                if (
                    task_parameter_definition.type
                    == ParameterType.SELECT_MULTIPLE
                ):
                    if not isinstance(value, list):
                        continue

                    new_value = [
                        item
                        for item in value
                        if item in parameter_definition.values
                    ]

                    if new_value != value:
                        if new_value:
                            task.parameters[parameter_name] = new_value
                        else:
                            del task.parameters[parameter_name]
                        changed = True

                # Single selection:
                # remove the parameter if its value no longer exists.
                elif (
                    task_parameter_definition.type
                    == ParameterType.SELECT
                ):
                    if value not in parameter_definition.values:
                        del task.parameters[parameter_name]
                        changed = True

        if changed:
            await self._storage.async_save(self.tasks)
