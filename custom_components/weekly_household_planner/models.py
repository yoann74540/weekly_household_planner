"""Data models for Weekly Household Planner."""

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any
from uuid import uuid4
from datetime import date


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
class Recurrence:
    """Represent a task recurrence every X weeks."""

    interval_weeks: int
    start_date: str

    def __post_init__(self) -> None:
        """Validate recurrence settings."""

        if self.interval_weeks < 1:
            raise ValueError("interval_weeks must be >= 1")

        date.fromisoformat(self.start_date)

    def to_dict(self) -> dict[str, Any]:
        """Convert recurrence to a dictionary."""
        return {
            "interval_weeks": self.interval_weeks,
            "start_date": self.start_date,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Recurrence":
        """Create recurrence from a dictionary."""
        return cls(
            interval_weeks=data["interval_weeks"],
            start_date=data["start_date"],
        )


@dataclass
class Task:
    """Represent a scheduled household task."""

    day: Day
    who: str
    task: str
    parameters: dict[str, Any] = field(default_factory=dict)
    recurrence: Recurrence | None = None
    id: str = field(default_factory=lambda: uuid4().hex)

    def __post_init__(self) -> None:
        """Validate the recurrence start date."""

        if self.recurrence is None:
            return

        start_date = date.fromisoformat(self.recurrence.start_date)

        if start_date.weekday() != list(Day).index(self.day):
            raise ValueError(
                "Recurrence start_date must match task day"
            )

    def to_dict(self) -> dict[str, Any]:
        """Convert the task to a dictionary."""
        data = {
            "id": self.id,
            "day": self.day.value,
            "who": self.who,
            "task": self.task,
            "parameters": self.parameters,
        }

        if self.recurrence is not None:
            data["recurrence"] = self.recurrence.to_dict()

        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Task":
        """Create a task from a dictionary."""
        task = cls(
            day=Day(data["day"]),
            who=data["who"],
            task=data["task"],
            parameters=data.get("parameters", {}),
            recurrence=(
                Recurrence.from_dict(data["recurrence"])
                if data.get("recurrence") is not None
                else None
            )
        )

        if "id" in data:
            task.id = data["id"]

        return task
