"""Config flow schemas for Weekly Household Planner."""

from typing import Any

import voluptuous as vol

from homeassistant.data_entry_flow import SectionConfig, section
from homeassistant.helpers import selector

from .definition import (
    ParameterDefinition,
    ParameterType,
    TaskDefinition,
)


def build_actors_schema(
    actors: list[str],
) -> vol.Schema:
    """Build the actors configuration schema."""
    return vol.Schema(
        {
            vol.Required(
                "actors",
                default=actors,
            ): selector.TextSelector(
                selector.TextSelectorConfig(
                    multiple=True,
                )
            ),
        }
    )


def build_parameters_schema(
    parameters: dict[str, ParameterDefinition],
) -> vol.Schema:
    """Build the parameters configuration schema."""
    schema: dict[Any, Any] = {}

    for parameter_name, parameter in parameters.items():
        schema[
            vol.Required(parameter_name)
        ] = section(
            vol.Schema(
                {
                    vol.Required(
                        "values",
                        default=parameter.values,
                        description={
                            "suggested_value": parameter.values,
                        },
                    ): selector.TextSelector(
                        selector.TextSelectorConfig(
                            multiple=True,
                        )
                    ),
                }
            ),
            SectionConfig(
                collapsed=False,
            ),
        )

    schema[
        vol.Optional(
            "new_parameter",
            default="",
        )
    ] = selector.TextSelector()

    return vol.Schema(schema)


def build_tasks_schema(
    tasks: dict[str, TaskDefinition],
    actors: list[str],
    parameters: dict[str, ParameterDefinition],
) -> vol.Schema:
    """Build the tasks configuration schema."""
    schema: dict[Any, Any] = {}

    for task_name, task_definition in tasks.items():
        schema[
            vol.Required(task_name)
        ] = section(
            vol.Schema(
                {
                    vol.Required(
                        "actors",
                        default=[
                            actor
                            for actor in task_definition.actors
                            if actor in actors
                        ],
                    ): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=actors,
                            multiple=True,
                        )
                    ),

                    vol.Optional(
                        "parameters",
                        default=[
                            parameter_name
                            for parameter_name
                            in task_definition.parameters
                            if parameter_name in parameters
                        ],
                    ): selector.SelectSelector(
                        selector.SelectSelectorConfig(
                            options=list(parameters),
                            multiple=True,
                        )
                    ),
                }
            ),
            SectionConfig(
                collapsed=False,
            ),
        )

    schema[
        vol.Optional(
            "new_task",
            default="",
        )
    ] = selector.TextSelector()

    return vol.Schema(schema)


def build_task_parameters_schema(
    tasks: dict[str, TaskDefinition],
) -> vol.Schema:
    """Build the task parameters configuration schema."""
    schema: dict[Any, Any] = {}

    for task_name, task_definition in tasks.items():
        for parameter_name, parameter in (
            task_definition.parameters.items()
        ):
            section_key = (
                f"{task_name} · {parameter_name}"
            )

            schema[
                vol.Required(section_key)
            ] = section(
                vol.Schema(
                    {
                        vol.Required(
                            "type",
                            default=parameter.type.value,
                        ): selector.SelectSelector(
                            selector.SelectSelectorConfig(
                                options=[
                                    {
                                        "value": ParameterType.SELECT.value,
                                        "label": "Sélection unique",
                                    },
                                    {
                                        "value": ParameterType.SELECT_MULTIPLE.value,
                                        "label": "Sélection multiple",
                                    },
                                ],
                                mode=selector.SelectSelectorMode.DROPDOWN,
                            )
                        ),

                        vol.Optional(
                            "required",
                            default=parameter.required,
                        ): selector.BooleanSelector(),
                    }
                ),
                SectionConfig(
                    collapsed=False,
                ),
            )

    return vol.Schema(schema)
