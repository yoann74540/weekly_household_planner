import {
    addTask,
    updateTask,
} from "./weekly-planner-api.js";

const DAYS = [
    ["monday", "Lundi"],
    ["tuesday", "Mardi"],
    ["wednesday", "Mercredi"],
    ["thursday", "Jeudi"],
    ["friday", "Vendredi"],
    ["saturday", "Samedi"],
    ["sunday", "Dimanche"],
];


const REPEAT_DAYS = [
    ["monday", "L", "Lun"],
    ["tuesday", "M", "Mar"],
    ["wednesday", "M", "Mer"],
    ["thursday", "J", "Jeu"],
    ["friday", "V", "Ven"],
    ["saturday", "S", "Sam"],
    ["sunday", "D", "Dim"],
];


export function renderEditor({
    editor,
    definition,
    repeatDaysExpanded,
    getTasksForActor,
    taskDetails,
}) {
    if (editor.mode === "duplicate") {
        return renderDuplicateEditor({
            editor,
            repeatDaysExpanded,
            taskDetails,
        });
    }

    const actors =
        definition?.actors ?? [];

    const tasks =
        getTasksForActor(editor.who);

    const taskDefinition =
        definition?.tasks?.[editor.task] ?? null;

    return `
        <div class="editor">
            <div class="editor-title">
                ${editor.mode === "edit"
            ? "Modifier la tâche"
            : "Ajouter une tâche"
        }
            </div>

            <label class="field">
                <span>Jour</span>

                <select data-field="day">
                    ${DAYS.map(
            ([value, label]) => `
                            <option
                                value="${value}"
                                ${value === editor.day
                    ? "selected"
                    : ""
                }
                            >
                                ${label}
                            </option>
                        `
        ).join("")}
                </select>
            </label>

            <label class="field">
                <span>Acteur</span>

                <select data-field="who">
                    ${actors.map(
            (actor) => `
                            <option
                                value="${actor}"
                                ${actor === editor.who
                    ? "selected"
                    : ""
                }
                            >
                                ${actor}
                            </option>
                        `
        ).join("")}
                </select>
            </label>

            <label class="field">
                <span>Tâche</span>

                <select data-field="task">
                    ${tasks.map(
            (task) => `
                            <option
                                value="${task}"
                                ${task === editor.task
                    ? "selected"
                    : ""
                }
                            >
                                ${task}
                            </option>
                        `
        ).join("")}
                </select>
            </label>

            <div class="parameters">
                ${renderParameters(
            editor,
            definition,
            taskDefinition
        )}
            </div>

            ${editor.mode !== "edit"
            ? renderRepeatDays(
                editor,
                repeatDaysExpanded
            )
            : ""
        }

            ${renderError(editor)}

            <div class="editor-actions">
                <button
                    class="editor-button"
                    data-action="cancel-editor"
                >
                    Annuler
                </button>

                <button
                    class="editor-button primary"
                    data-action="save-editor"
                >
                    ${editor.mode === "edit"
            ? "Enregistrer"
            : "Ajouter"
        }
                </button>
            </div>
        </div>
    `;
}


export function getTasksForActor(
    definition,
    actor
) {
    if (!definition) {
        return [];
    }

    return Object.entries(
        definition.tasks ?? {}
    )
        .filter(([, taskDefinition]) =>
            taskDefinition.actors?.includes(actor)
        )
        .map(([name]) => name);
}


export function initializeParameters(
    editor,
    definition
) {
    if (!editor) {
        return;
    }

    editor.parameters = {};

    const taskDefinition =
        definition?.tasks?.[
        editor.task
        ];

    if (!taskDefinition) {
        return;
    }

    for (
        const [name, parameter]
        of Object.entries(
            taskDefinition.parameters ?? {}
        )
    ) {
        if (
            parameter.type ===
            "select_multiple"
        ) {
            editor.parameters[name] = [];
        } else {
            editor.parameters[name] = "";
        }
    }
}


export function createAddEditor(
    definition,
    day = null
) {
    const firstActor =
        definition?.actors?.[0] ?? "";

    const availableTasks =
        getTasksForActor(
            definition,
            firstActor
        );

    const firstTask =
        availableTasks[0] ?? "";

    const editor = {
        mode: "add",
        day: day ?? "monday",
        who: firstActor,
        task: firstTask,
        parameters: {},
        repeatDays: [],
        error: null,
    };

    initializeParameters(
        editor,
        definition
    );

    return editor;
}


export function createEditEditor(
    task
) {
    return {
        mode: "edit",
        id: task.id,
        day: task.day,
        who: task.who,
        task: task.task,
        parameters: structuredClone(
            task.parameters ?? {}
        ),
        error: null,
    };
}


export function createDuplicateEditor(
    task
) {
    return {
        mode: "duplicate",

        sourceDay: task.day,

        day: task.day,
        who: task.who,
        task: task.task,

        parameters: structuredClone(
            task.parameters ?? {}
        ),

        repeatDays: [],
        error: null,
    };
}


export function findScheduledTask(
    schedule,
    taskId
) {
    for (
        const tasks
        of Object.values(schedule ?? {})
    ) {
        const task = tasks.find(
            (item) => item.id === taskId
        );

        if (task) {
            return task;
        }
    }

    return null;
}

export async function saveEditor(
    hass,
    editor
) {
    const parameters = {};

    for (
        const [name, value]
        of Object.entries(
            editor.parameters ?? {}
        )
    ) {
        if (
            Array.isArray(value)
            && value.length > 0
        ) {
            parameters[name] = value;
        } else if (
            !Array.isArray(value)
            && value !== ""
        ) {
            parameters[name] = value;
        }
    }

    /*
     * Modification d'une tâche existante.
     */
    if (editor.mode === "edit") {
        return updateTask(
            hass,
            editor.id,
            {
                day: editor.day,
                who: editor.who,
                task: editor.task,
                parameters,
            }
        );
    }

    /*
     * Ajout / duplication.
     */
    const days =
        editor.mode === "duplicate"
            ? editor.repeatDays ?? []
            : [
                editor.day,
                ...(editor.repeatDays ?? []),
            ];

    if (days.length === 0) {
        return {
            success: false,
            error: "no_day",
        };
    }

    for (const day of days) {
        const response =
            await addTask(
                hass,
                {
                    day,
                    who: editor.who,
                    task: editor.task,
                    parameters,
                }
            );

        if (!response?.success) {
            return response;
        }
    }

    return {
        success: true,
    };
}

export function attachEditorListeners({
    root,
    editor,
    definition,
    repeatDaysExpanded,
    setRepeatDaysExpanded,
    render,
    save,
    cancel,
}) {
    root.querySelector(
        '[data-action="toggle-repeat"]'
    )?.addEventListener(
        "click",
        () => {
            setRepeatDaysExpanded(
                !repeatDaysExpanded
            );

            render();
        }
    );

    root.querySelector(
        '[data-action="cancel-editor"]'
    )?.addEventListener(
        "click",
        () => {
            cancel();
        }
    );

    root.querySelector(
        '[data-field="day"]'
    )?.addEventListener(
        "change",
        (event) => {
            editor.day =
                event.target.value;

            editor.error = null;

            render();
        }
    );

    root.querySelector(
        '[data-field="who"]'
    )?.addEventListener(
        "change",
        (event) => {
            editor.who =
                event.target.value;

            editor.error = null;

            const tasks =
                getTasksForActor(
                    definition,
                    editor.who
                );

            editor.task =
                tasks[0] ?? "";

            initializeParameters(
                editor,
                definition
            );

            render();
        }
    );

    root.querySelector(
        '[data-field="task"]'
    )?.addEventListener(
        "change",
        (event) => {
            editor.task =
                event.target.value;

            editor.error = null;

            initializeParameters(
                editor,
                definition
            );

            render();
        }
    );

    root.querySelectorAll(
        "[data-parameter]"
    ).forEach((element) => {
        element.addEventListener(
            "change",
            () => {
                const name =
                    element.dataset.parameter;

                if (
                    element.type ===
                    "checkbox"
                ) {
                    const selected = [
                        ...root.querySelectorAll(
                            `input[data-parameter="${name}"]:checked`
                        )
                    ].map(
                        (checkbox) =>
                            checkbox.value
                    );

                    editor.parameters[name] =
                        selected;
                } else {
                    editor.parameters[name] =
                        element.value;
                }
            }
        );
    });

    root.querySelectorAll(
        ".repeat-day:not(.main)"
    ).forEach((element) => {
        element.addEventListener(
            "click",
            () => {
                const day =
                    element.dataset.repeatDay;

                const repeatDays =
                    editor.repeatDays ?? [];

                if (
                    repeatDays.includes(day)
                ) {
                    editor.repeatDays =
                        repeatDays.filter(
                            (item) =>
                                item !== day
                        );
                } else {
                    editor.repeatDays = [
                        ...repeatDays,
                        day,
                    ];
                }

                editor.error = null;

                render();
            }
        );
    });

    root.querySelector(
        '[data-action="save-editor"]'
    )?.addEventListener(
        "click",
        async () => {
            await save();
        }
    );
}

function renderDuplicateEditor({
    editor,
    repeatDaysExpanded,
    taskDetails,
}) {
    return `
        <div class="editor">
            <div class="editor-title">
                Dupliquer la tâche
            </div>

            <div class="duplicate-summary">
                <div class="task-name">
                    ${editor.task}
                </div>

                <div class="task-details">
                    ${taskDetails(editor)}
                </div>
            </div>

            ${renderRepeatDays(
        editor,
        repeatDaysExpanded
    )}

            ${renderError(editor)}

            <div class="editor-actions">
                <button
                    class="editor-button"
                    data-action="cancel-editor"
                >
                    Annuler
                </button>

                <button
                    class="editor-button primary"
                    data-action="save-editor"
                >
                    Dupliquer
                </button>
            </div>
        </div>
    `;
}


function renderParameters(
    editor,
    definition,
    taskDefinition
) {
    if (!taskDefinition) {
        return "";
    }

    return Object.entries(
        taskDefinition.parameters ?? {}
    )
        .map(([name, taskParameter]) => {
            const parameterDefinition =
                definition?.parameters?.[name];

            if (!parameterDefinition) {
                return "";
            }

            const values =
                parameterDefinition.values ?? [];

            const currentValue =
                editor.parameters?.[name];

            if (
                taskParameter.type ===
                "select_multiple"
            ) {
                const selectedValues =
                    Array.isArray(currentValue)
                        ? currentValue
                        : [];

                return `
                    <div class="field">
                        <span>
                            ${name}
                            ${taskParameter.required
                        ? " *"
                        : ""
                    }
                        </span>

                        <div class="checkboxes">
                            ${values.map(
                        (value) => `
                                    <label class="checkbox">
                                        <input
                                            type="checkbox"
                                            data-parameter="${name}"
                                            value="${value}"
                                            ${selectedValues.includes(
                            value
                        )
                                ? "checked"
                                : ""
                            }
                                        >

                                        <span>
                                            ${value}
                                        </span>
                                    </label>
                                `
                    ).join("")}
                        </div>
                    </div>
                `;
            }

            return `
                <label class="field">
                    <span>
                        ${name}
                        ${taskParameter.required
                    ? " *"
                    : ""
                }
                    </span>

                    <select
                        data-parameter="${name}"
                    >
                        <option value="">
                            —
                        </option>

                        ${values.map(
                    (value) => `
                                <option
                                    value="${value}"
                                    ${currentValue === value
                            ? "selected"
                            : ""
                        }
                                >
                                    ${value}
                                </option>
                            `
                ).join("")}
                    </select>
                </label>
            `;
        })
        .join("");
}


function renderRepeatDays(
    editor,
    repeatDaysExpanded
) {
    const repeatDays =
        editor.repeatDays ?? [];

    const selectedLabels = REPEAT_DAYS
        .filter(
            ([day]) =>
                repeatDays.includes(day)
        )
        .map(
            ([, , shortLabel]) =>
                shortLabel
        );

    const summary =
        selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : "";

    return `
        <div class="repeat-field">
            <button
                type="button"
                class="repeat-header"
                data-action="toggle-repeat"
            >
                <span class="repeat-title">
                    Répéter aussi
                </span>

                <span class="repeat-header-right">
                    ${summary
            ? `
                                <span class="repeat-summary">
                                    ${summary}
                                </span>
                            `
            : ""
        }

                    <ha-icon
                        class="
                            repeat-chevron
                            ${repeatDaysExpanded
            ? "expanded"
            : ""
        }
                        "
                        icon="mdi:chevron-down"
                    ></ha-icon>
                </span>
            </button>

            ${repeatDaysExpanded
            ? `
                        <div class="repeat-days">
                            ${REPEAT_DAYS.map(
                ([day, label]) => {
                    const isMain =
                        day === editor.day;

                    const isSelected =
                        repeatDays.includes(
                            day
                        );

                    return `
                                        <button
                                            type="button"
                                            class="
                                                repeat-day
                                                ${isMain
                            ? "main"
                            : ""
                        }
                                                ${isSelected
                            ? "selected"
                            : ""
                        }
                                            "
                                            data-repeat-day="${day}"
                                            ${isMain
                            ? "disabled"
                            : ""
                        }
                                            title="${dayLabel(day)}"
                                        >
                                            ${label}
                                        </button>
                                    `;
                }
            ).join("")}
                        </div>
                    `
            : ""
        }
        </div>
    `;
}


function renderError(editor) {
    if (!editor.error) {
        return "";
    }

    return `
        <div class="editor-error">
            <ha-icon
                icon="mdi:alert-circle-outline"
            ></ha-icon>

            <span>
                ${editor.error}
            </span>
        </div>
    `;
}


function dayLabel(day) {
    const labels = {
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche",
    };

    return labels[day] ?? day;
}
