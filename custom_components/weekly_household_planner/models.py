"""Data models for Weekly Household Planner."""

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any
from uuid import uuid4


class Day(StrEnum):
    """Days available in the planner."""

    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


@dataclass
class Task:
    """Represent a scheduled household task."""

    day: Day
    who: str
    task: str
    parameters: dict[str, Any] = field(default_factory=dict)
    id: str = field(default_factory=lambda: uuid4().hex)

    def to_dict(self) -> dict[str, Any]:
        """Convert the task to a dictionary."""
        return {
            "id": self.id,
            "day": self.day.value,
            "who": self.who,
            "task": self.task,
            "parameters": self.parameters,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Task":
        """Create a task from a dictionary."""
        task = cls(
            day=Day(data["day"]),
            who=data["who"],
            task=data["task"],
            parameters=data.get("parameters", {}),
        )

        if "id" in data:
            task.id = data["id"]

        return task
