"""Config flow for the Weekly Household Planner integration."""

from typing import Any, override

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from .config_schema import (
    build_actors_schema,
    build_parameters_schema,
    build_task_parameters_schema,
    build_tasks_schema,
)

from .const import DOMAIN
from .definition import (
    ParameterDefinition,
    ParameterType,
    PlannerDefinition,
    TaskDefinition,
    TaskParameterDefinition,
)


def create_default_definition() -> PlannerDefinition:
    """Create the default planner definition."""
    return PlannerDefinition(
        actors=[
            "robot",
            "manual",
        ],
        parameters={
            "room": ParameterDefinition(
                values=[
                    "cuisine",
                    "salon",
                    "salle_de_bain",
                    "chambre",
                ]
            ),
        },
        tasks={
            "aspiration": TaskDefinition(
                actors=["manual"],
                parameters={
                    "room": TaskParameterDefinition(
                        type=ParameterType.SELECT_MULTIPLE,
                        required=True,
                    ),
                },
            ),
            "nettoyage": TaskDefinition(
                actors=["manual"],
                parameters={
                    "room": TaskParameterDefinition(
                        type=ParameterType.SELECT_MULTIPLE,
                        required=True,
                    ),
                },
            ),
        },
    )


class WeeklyHouseholdPlannerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Weekly Household Planner."""

    VERSION = 1

    _reconfigure_data: dict[str, Any]
    _is_reconfigure: bool = False

    @override
    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle the initial step."""

        if user_input is not None:
            definition = create_default_definition()

            self._is_reconfigure = False

            self._reconfigure_data = {
                "name": user_input["name"],
                "actors": definition.actors,
                "parameters": definition.parameters,
                "tasks": definition.tasks,
            }

            return await self.async_step_reconfigure()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "name",
                        default="Weekly Household Planner",
                    ): str,
                }
            ),
        )

    @override
    async def async_step_reconfigure(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Reconfigure the planner actors."""

        if not hasattr(self, "_reconfigure_data"):
            self._is_reconfigure = True

            entry = self._get_reconfigure_entry()

            current_definition = PlannerDefinition.from_dict(
                entry.data["definition"]
            )

            self._reconfigure_data = {
                "name": entry.data["name"],
                "actors": current_definition.actors,
                "parameters": current_definition.parameters,
                "tasks": current_definition.tasks,
            }

        if user_input is not None:
            self._reconfigure_data["actors"] = user_input["actors"]

            return await self.async_step_parameters()

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=build_actors_schema(
                self._reconfigure_data["actors"]
            ),
        )

    async def async_step_parameters(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Configure planner parameters and their values."""

        parameters = self._reconfigure_data["parameters"]

        if user_input is not None:
            new_parameters: dict[str, ParameterDefinition] = {}

            # Recover all currently displayed parameters.
            for parameter_name in parameters:
                parameter_data = user_input.get(
                    parameter_name,
                    {},
                )

                values = parameter_data.get("values") or []

                # Remove empty values just in case.
                values = [
                    value
                    for value in values
                    if value
                ]

                # No value -> the parameter no longer exists.
                if not values:
                    continue

                new_parameters[parameter_name] = ParameterDefinition(
                    values=values,
                )

            # Add a new parameter if requested.
            new_parameter_name = user_input.get(
                "new_parameter",
                ""
            ).strip()

            if new_parameter_name:
                # Keep the current values and add the new parameter.
                new_parameters.setdefault(
                    new_parameter_name,
                    ParameterDefinition(),
                )

                self._reconfigure_data["parameters"] = new_parameters

                # Redisplay this step with the new parameter.
                return await self.async_step_parameters()

            self._reconfigure_data["parameters"] = new_parameters

            return await self.async_step_tasks()

        return self.async_show_form(
            step_id="parameters",
            data_schema=build_parameters_schema(
                parameters
            ),
        )

    async def async_step_tasks(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Configure planner tasks."""

        tasks = self._reconfigure_data["tasks"]
        actors = self._reconfigure_data["actors"]
        parameters = self._reconfigure_data["parameters"]

        if user_input is not None:
            new_tasks: dict[str, TaskDefinition] = {}

            for task_name, task_definition in tasks.items():
                task_data = user_input.get(
                    task_name,
                    {},
                )

                selected_actors = task_data.get(
                    "actors",
                    [],
                )

                # A task without actors is useless:
                # remove it from the definition.
                if not selected_actors:
                    continue

                selected_parameters = task_data.get(
                    "parameters",
                    [],
                )

                task_parameters: dict[
                    str,
                    TaskParameterDefinition,
                ] = {}

                for parameter_name in selected_parameters:
                    if parameter_name in task_definition.parameters:
                        task_parameters[parameter_name] = (
                            task_definition.parameters[
                                parameter_name
                            ]
                        )
                    else:
                        task_parameters[parameter_name] = (
                            TaskParameterDefinition(
                                type=ParameterType.SELECT,
                            )
                        )

                new_tasks[task_name] = TaskDefinition(
                    actors=selected_actors,
                    parameters=task_parameters,
                )

            new_task_name = user_input.get(
                "new_task",
                "",
            ).strip()

            if new_task_name:
                new_tasks.setdefault(
                    new_task_name,
                    TaskDefinition(
                        actors=[],
                        parameters={},
                    ),
                )

                self._reconfigure_data["tasks"] = new_tasks

                return await self.async_step_tasks()

            self._reconfigure_data["tasks"] = new_tasks

            return await self.async_step_task_parameters()

        return self.async_show_form(
            step_id="tasks",
            data_schema=build_tasks_schema(
                tasks,
                actors,
                parameters,
            ),
        )

    async def async_step_task_parameters(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Configure parameter types used by tasks."""

        tasks = self._reconfigure_data["tasks"]

        if user_input is not None:
            for task_name, task_definition in tasks.items():
                for parameter_name, parameter in (
                    task_definition.parameters.items()
                ):
                    section_key = (
                        f"{task_name} · {parameter_name}"
                    )

                    parameter_data = user_input.get(
                        section_key,
                        {},
                    )

                    parameter.type = ParameterType(
                        parameter_data["type"]
                    )

                    parameter.required = (
                        parameter_data.get(
                            "required",
                            False,
                        )
                    )

            return await self.async_step_finish()

        return self.async_show_form(
            step_id="task_parameters",
            data_schema=build_task_parameters_schema(
                tasks
            ),
        )

    async def async_step_finish(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Finish planner configuration."""

        definition = PlannerDefinition(
            actors=self._reconfigure_data["actors"],
            parameters=self._reconfigure_data["parameters"],
            tasks=self._reconfigure_data["tasks"],
        )

        if self._is_reconfigure:
            entry = self._get_reconfigure_entry()

            new_data = {
                **entry.data,
                "definition": definition.to_dict(),
            }

            return self.async_update_reload_and_abort(
                entry,
                data=new_data,
            )

        return self.async_create_entry(
            title=self._reconfigure_data["name"],
            data={
                "name": self._reconfigure_data["name"],
                "definition": definition.to_dict(),
            },
        )
