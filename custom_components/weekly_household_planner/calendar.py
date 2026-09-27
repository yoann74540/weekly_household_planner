"""Calendar platform for Weekly Household Planner."""

from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.util import dt as dt_util

from homeassistant.components.calendar import (
    CalendarEntity,
    CalendarEntityFeature,
    CalendarEvent,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .models import Day
from .planner import WeeklyPlanner


DAY_TO_WEEKDAY = {
    Day.MONDAY: 0,
    Day.TUESDAY: 1,
    Day.WEDNESDAY: 2,
    Day.THURSDAY: 3,
    Day.FRIDAY: 4,
    Day.SATURDAY: 5,
    Day.SUNDAY: 6,
}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the planner calendar."""

    planner: WeeklyPlanner = entry.runtime_data

    async_add_entities(
        [
            WeeklyHouseholdPlannerCalendar(
                planner=planner,
                entry=entry,
            )
        ]
    )


class WeeklyHouseholdPlannerCalendar(CalendarEntity):
    """Calendar representation of the weekly planner."""

    _attr_has_entity_name = True
    _attr_name = "Planning"
    _attr_supported_features = (
        CalendarEntityFeature.DELETE_EVENT
        | CalendarEntityFeature.UPDATE_EVENT
    )

    def __init__(
        self,
        planner: WeeklyPlanner,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the calendar."""

        self._planner = planner
        self._attr_unique_id = f"{entry.entry_id}_calendar"

    @property
    def event(self) -> CalendarEvent | None:
        """Return the next scheduled event."""

        now = dt_util.now()
        events = self._events_between(
            now,
            now + timedelta(days=8),
        )

        if not events:
            return None

        return events[0]

    async def async_get_events(
        self,
        hass: HomeAssistant,
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Return calendar events in a date range."""

        return self._events_between(
            start_date,
            end_date,
        )

    def _events_between(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> list[CalendarEvent]:
        """Build calendar events from weekly planner tasks."""

        events: list[CalendarEvent] = []

        current_date = start_date.date()
        last_date = end_date.date()

        while current_date <= last_date:
            weekday = current_date.weekday()

            for day in Day:
                if DAY_TO_WEEKDAY[day] != weekday:
                    continue

                for task in self._planner.get_tasks_for_day(day):
                    events.append(
                        self._task_to_event(
                            task,
                            current_date,
                        )
                    )

            current_date += timedelta(days=1)

        events.sort(key=lambda event: event.start)

        return events

    def _task_to_event(
        self,
        task,
        event_date: date,
    ) -> CalendarEvent:
        """Convert a planner task to a calendar event."""

        parameters = []

        for name, value in task.parameters.items():
            if isinstance(value, list):
                value_text = ", ".join(
                    str(item) for item in value
                )
            else:
                value_text = str(value)

            parameters.append(
                f"{name}: {value_text}"
            )

        description = f"Actor: {task.who}"

        if parameters:
            description += "\n" + "\n".join(parameters)

        return CalendarEvent(
            start=event_date,
            end=event_date + timedelta(days=1),
            summary=task.task,
            description=description,
            uid=task.id,
        )

    async def async_delete_event(
        self,
        uid: str,
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Delete a task from the weekly planner."""

        success = await self._planner.remove_task(uid)

        if not success:
            return

        self.async_write_ha_state()
        await self.async_update_event_listeners()

    async def async_update_event(
        self,
        uid: str,
        event: dict[str, Any],
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Update a weekly planner task."""

        task = self._planner.get_task(uid)

        if task is None:
            return

        start = event.get("dtstart")

        if start is None:
            return

        if isinstance(start, datetime):
            event_date = start.date()
        else:
            event_date = start

        task.day = Day(event_date.strftime("%A").lower())

        success = await self._planner.update_task(
            uid,
            task,
        )

        if not success:
            return

        self.async_write_ha_state()
        await self.async_update_event_listeners()
