const DAYS = [
    ["monday", "Lundi"],
    ["tuesday", "Mardi"],
    ["wednesday", "Mercredi"],
    ["thursday", "Jeudi"],
    ["friday", "Vendredi"],
    ["saturday", "Samedi"],
    ["sunday", "Dimanche"],
];

function isTaskActiveThisWeek(task) {
    if (!task.recurrence) {
        return true;
    }

    const { interval_weeks, start_date } = task.recurrence;

    const start = new Date(`${start_date}T00:00:00`);

    if (
        !Number.isInteger(interval_weeks) ||
        interval_weeks < 1 ||
        Number.isNaN(start.getTime())
    ) {
        return false;
    }

    const today = new Date();

    const currentMonday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const weekday = (currentMonday.getDay() + 6) % 7;
    currentMonday.setDate(currentMonday.getDate() - weekday);

    const startMonday = new Date(start);
    const startWeekday = (startMonday.getDay() + 6) % 7;
    startMonday.setDate(startMonday.getDate() - startWeekday);

    const daysBetween = Math.round(
        (Date.UTC(
            currentMonday.getFullYear(),
            currentMonday.getMonth(),
            currentMonday.getDate()
        ) - Date.UTC(
            startMonday.getFullYear(),
            startMonday.getMonth(),
            startMonday.getDate()
        )) / 86400000
    );

    const weeksBetween = daysBetween / 7;

    return (
        weeksBetween >= 0 &&
        weeksBetween % interval_weeks === 0
    );
}


export function renderWeek(
    schedule,
    expandedDay,
    actorColors = {},
    showInactiveRecurrences = false
) {
    return DAYS
        .map(([day, label]) => {
            const allTasks = schedule?.[day] ?? [];

            const tasks = showInactiveRecurrences
                ? allTasks
                : allTasks.filter(isTaskActiveThisWeek);

            const expanded =
                expandedDay === day;

            return renderDay(
                day,
                label,
                tasks,
                expanded,
                actorColors
            );
        })
        .join("");
}


function renderDay(
    day,
    label,
    tasks,
    expanded,
    actorColors
) {
    const count = tasks.length;

    let countText = "—";

    if (count === 1) {
        countText = "1 tâche";
    } else if (count > 1) {
        countText = `${count} tâches`;
    }

    return `
        <div class="day">
            <div
                class="day-summary"
                data-day="${day}"
            >
                <div class="day-name">
                    ${label}
                </div>

                <div class="day-count">
                    ${countText}
                </div>

                <ha-icon
                    class="
                        chevron
                        ${expanded ? "expanded" : ""}
                    "
                    icon="mdi:chevron-down"
                ></ha-icon>
            </div>

            ${expanded
            ? renderTasks(
                day,
                label,
                tasks,
                actorColors
            )
            : ""
        }
        </div>
    `;
}


function renderTasks(
    day,
    label,
    tasks,
    actorColors
) {
    const taskList = tasks
        .map(
            (task) => {
                const actorColor =
                    actorColors?.[task.who] ?? "var(--primary-color)";

                const inactive = !isTaskActiveThisWeek(task);

                const recurrenceLabel = task.recurrence
                    ? `↻ Toutes les ${task.recurrence.interval_weeks} semaines`
                    : "";
                return `
                    <div
                        class="task ${inactive ? "task-inactive" : ""}"
                        style="--actor-color: ${actorColor};"
                    >
                        <div class="task-actor">
                            <span class="task-actor-label">
                                ${task.who}
                            </span>
                            ${recurrenceLabel ? `
                                <span class="task-recurrence">
                                    ${recurrenceLabel}
                                </span>
                            ` : ""}
                        </div>

                        <div class="task-content">
                            <div class="task-info">
                                <div class="task-name">
                                    ${task.task}
                                </div>

                                <div class="task-details">
                                    ${taskDetails(task)}
                                </div>
                            </div>

                            <div class="task-actions">
                                <button
                                    class="icon-button"
                                    data-action="edit"
                                    data-task-id="${task.id}"
                                    title="Modifier"
                                >
                                    <ha-icon
                                        icon="mdi:pencil"
                                    ></ha-icon>
                                </button>

                                <button
                                    class="icon-button"
                                    data-action="duplicate"
                                    data-task-id="${task.id}"
                                    title="Dupliquer"
                                >
                                    <ha-icon
                                        icon="mdi:content-copy"
                                    ></ha-icon>
                                </button>

                                <button
                                    class="icon-button"
                                    data-action="delete"
                                    data-task-id="${task.id}"
                                    title="Supprimer"
                                >
                                    <ha-icon
                                        icon="mdi:delete-outline"
                                    ></ha-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            })
        .join("");

    return `
        <div class="tasks">
            ${taskList}

            <button
                class="day-add"
                data-action="add"
                data-day="${day}"
            >
                <ha-icon
                    icon="mdi:plus"
                ></ha-icon>

                Ajouter ${label.toLowerCase()}
            </button>
        </div>
    `;
}


export function taskDetails(task) {
    const details = [];

    for (
        const [, value]
        of Object.entries(
            task.parameters ?? {}
        )
    ) {
        if (Array.isArray(value)) {
            details.push(
                value.join(", ")
            );
        } else if (
            value !== null
            && value !== undefined
            && value !== ""
        ) {
            details.push(
                String(value)
            );
        }
    }

    return details.join(" · ");
}