const DAYS = [
    ["monday", "Lundi"],
    ["tuesday", "Mardi"],
    ["wednesday", "Mercredi"],
    ["thursday", "Jeudi"],
    ["friday", "Vendredi"],
    ["saturday", "Samedi"],
    ["sunday", "Dimanche"],
];


export function renderWeek(
    schedule,
    expandedDay
) {
    return DAYS
        .map(([day, label]) => {
            const tasks =
                schedule?.[day] ?? [];

            const expanded =
                expandedDay === day;

            return renderDay(
                day,
                label,
                tasks,
                expanded
            );
        })
        .join("");
}


function renderDay(
    day,
    label,
    tasks,
    expanded
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
                tasks
            )
            : ""
        }
        </div>
    `;
}


function renderTasks(
    day,
    label,
    tasks
) {
    const taskList = tasks
        .map(
            (task) => `
                <div class="task">
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
            `
        )
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

    if (task.who) {
        details.push(task.who);
    }

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