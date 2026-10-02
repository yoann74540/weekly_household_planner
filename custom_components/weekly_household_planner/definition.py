"""Planner definition for Weekly Household Planner."""

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any
from .models import Task


class ParameterType(StrEnum):
    """Supported parameter input types."""

    SELECT = "select"
    SELECT_MULTIPLE = "select_multiple"


@dataclass
class ParameterDefinition:
    """Define a parameter and its possible values."""

    values: list[Any] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "values": self.values,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ParameterDefinition":
        """Create from dictionary."""
        return cls(
            values=data.get("values", []),
        )


@dataclass
class TaskParameterDefinition:
    """Define how a task uses a parameter."""

    type: ParameterType
    required: bool = True

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "type": self.type.value,
            "required": self.required,
        }

    @classmethod
    def from_dict(
        cls,
        data: dict[str, Any],
    ) -> "TaskParameterDefinition":
        """Create from dictionary."""
        return cls(
            type=ParameterType(data["type"]),
            required=data.get("required", True),
        )


@dataclass
class TaskDefinition:
    """Define a task available in the planner."""

    actors: list[str]
    parameters: dict[str, TaskParameterDefinition] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "actors": self.actors,
            "parameters": {
                name: parameter.to_dict()
                for name, parameter in self.parameters.items()
            },
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "TaskDefinition":
        """Create from dictionary."""
        return cls(
            actors=data.get("actors", []),
            parameters={
                name: TaskParameterDefinition.from_dict(parameter)
                for name, parameter in data.get(
                    "parameters",
                    {}
                ).items()
            },
        )


@dataclass
class PlannerDefinition:
    """Define what can be scheduled by the planner."""

    actors: list[str] = field(default_factory=list)

    actor_colors: dict[str, str] = field(default_factory=dict)

    parameters: dict[str, ParameterDefinition] = field(
        default_factory=dict
    )

    tasks: dict[str, TaskDefinition] = field(
        default_factory=dict
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert the complete definition to a dictionary."""
        return {
            "actors": self.actors,
            "actor_colors": self.actor_colors,
            "parameters": {
                name: parameter.to_dict()
                for name, parameter in self.parameters.items()
            },

            "tasks": {
                name: task.to_dict()
                for name, task in self.tasks.items()
            },
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "PlannerDefinition":
        """Create a planner definition from a dictionary."""
        return cls(
            actors=data.get("actors", []),
            actor_colors=data.get("actor_colors", {}),
            parameters={
                name: ParameterDefinition.from_dict(parameter)
                for name, parameter in data.get(
                    "parameters",
                    {}
                ).items()
            },

            tasks={
                name: TaskDefinition.from_dict(task)
                for name, task in data.get(
                    "tasks",
                    {}
                ).items()
            },
        )

    def validate_task(self, task: Task) -> bool:
        """Validate a scheduled task against this definition."""

        # The actor must exist.
        if task.who not in self.actors:
            return False

        # The task type must exist.
        if task.task not in self.tasks:
            return False

        task_definition = self.tasks[task.task]

        # The selected actor must be allowed to perform this task.
        if task.who not in task_definition.actors:
            return False

        # Validate every parameter expected by the task.
        for parameter_name, task_parameter in task_definition.parameters.items():

            # The referenced parameter must exist.
            if parameter_name not in self.parameters:
                return False

            parameter_definition = self.parameters[parameter_name]

            # Required parameter missing.
            if (
                task_parameter.required
                and parameter_name not in task.parameters
            ):
                return False

            # Optional parameter not supplied: nothing else to validate.
            if parameter_name not in task.parameters:
                continue

            value = task.parameters[parameter_name]

            if task_parameter.type == ParameterType.SELECT:
                if value not in parameter_definition.values:
                    return False

            elif task_parameter.type == ParameterType.SELECT_MULTIPLE:
                if not isinstance(value, list):
                    return False

                if not value:
                    return False

                if any(
                    item not in parameter_definition.values
                    for item in value
                ):
                    return False

        # Reject parameters that the task does not support.
        for parameter_name in task.parameters:
            if parameter_name not in task_definition.parameters:
                return False

        return True
