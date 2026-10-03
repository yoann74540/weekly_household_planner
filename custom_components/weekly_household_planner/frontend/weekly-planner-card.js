import {
    WEEKLY_PLANNER_STYLES
} from "./weekly-planner-styles.js";

import {
    getDefinition,
    getSchedule,
    removeTask,
} from "./weekly-planner-api.js";

import {
    attachEditorListeners,
    createAddEditor,
    createDuplicateEditor,
    createEditEditor,
    findScheduledTask,
    getTasksForActor,
    renderEditor,
    saveEditor,
} from "./weekly-planner-editor.js";

import {
    renderWeek,
    taskDetails,
} from "./weekly-planner-week.js";

class WeeklyPlannerCard extends HTMLElement {
    constructor() {
        super();

        this._hass = null;
        this._config = {};
        this._schedule = null;
        this._loading = false;
        this._expandedDay = null;
        this._definition = null;
        this._editor = null;
        this._repeatDaysExpanded = false;
    }

    setConfig(config) {
        this._config = config;
    }

    set hass(hass) {
        const firstLoad = !this._hass;
        this._hass = hass;

        if (firstLoad) {
            this._loadSchedule();
        }
    }

    connectedCallback() {
        if (this._hass && !this._schedule) {
            this._loadSchedule();
        }
    }

    async _loadSchedule() {
        if (this._loading || !this._hass) {
            return;
        }

        this._loading = true;
        this._render();

        try {
            const [scheduleResponse, definitionResponse] =
                await Promise.all([
                    getSchedule(this._hass),
                    getDefinition(this._hass),
                ]);

            this._schedule = scheduleResponse.schedule;
            this._definition = definitionResponse.definition;
        } catch (error) {
            console.error(
                "Unable to load Weekly Household Planner schedule",
                error
            );

            this._schedule = {};
        } finally {
            this._loading = false;
            this._render();
        }
    }

    async _loadDefinition() {
        if (this._definition) {
            return this._definition;
        }

        try {
            const response =
                await getDefinition(this._hass);

            this._definition =
                response.definition;

            return this._definition;
        } catch (error) {
            console.error(
                "Unable to load planner definition",
                error
            );

            return null;
        }
    }

    async _openAddEditor(day = null) {

        this._repeatDaysExpanded = false;

        const definition =
            await this._loadDefinition();

        if (!definition) {
            return;
        }

        this._editor =
            createAddEditor(
                definition,
                day
            );

        this._render();
    }

    async _saveEditor() {
        if (!this._editor) {
            return;
        }

        const editor = this._editor;

        try {
            const response =
                await saveEditor(
                    this._hass,
                    editor
                );

            if (!response?.success) {
                if (
                    response?.error ===
                    "duplicate_task"
                ) {
                    this._editor.error =
                        "Cette tâche est déjà présente ce jour pour cet acteur.";

                    this._render();
                    return;
                }

                if (
                    response?.error ===
                    "no_day"
                ) {
                    return;
                }

                console.error(
                    "Unable to save task",
                    response
                );

                return;
            }

            const day = editor.day;

            this._editor = null;
            this._expandedDay = day;

            await this._loadSchedule();
        } catch (error) {
            console.error(
                "Unable to save task",
                error
            );
        }
    }

    async _openEditEditor(taskId) {
        const definition =
            await this._loadDefinition();

        if (!definition) {
            return;
        }

        const existingTask =
            findScheduledTask(
                this._schedule,
                taskId
            );

        if (!existingTask) {
            console.error(
                "Task not found",
                taskId
            );

            return;
        }

        this._editor =
            createEditEditor(
                existingTask
            );

        this._render();
    }

    async _deleteTask(taskId) {
        try {
            const response =
                await removeTask(
                    this._hass,
                    taskId
                );

            if (!response?.success) {
                console.error(
                    "Unable to delete task",
                    response
                );

                return;
            }

            await this._loadSchedule();
        } catch (error) {
            console.error(
                "Unable to delete task",
                error
            );
        }
    }

    async _openDuplicateEditor(taskId) {

        this._repeatDaysExpanded = false;
        const definition =
            await this._loadDefinition();

        if (!definition) {
            return;
        }

        const existingTask =
            findScheduledTask(
                this._schedule,
                taskId
            );

        if (!existingTask) {
            console.error(
                "Task not found",
                taskId
            );

            return;
        }

        this._editor =
            createDuplicateEditor(
                existingTask
            );

        this._render();
    }

    _render() {
        if (!this._hass) {
            return;
        }

        const darkMode =
            this._hass.themes?.darkMode ?? false;

        const content = renderWeek(
            this._schedule,
            this._expandedDay,
            this._definition?.actor_colors ?? {}
        );

        this.innerHTML = `
            <ha-card>
                <style>
                    ${WEEKLY_PLANNER_STYLES}
                </style>

                <div class="card-content">
                    ${this._editor
                ? renderEditor({
                    editor: this._editor,
                    definition: this._definition,
                    repeatDaysExpanded:
                        this._repeatDaysExpanded,
                    getTasksForActor:
                        (actor) =>
                            getTasksForActor(
                                this._definition,
                                actor
                            ),
                    taskDetails,
                })
                : `
                                <div class="header">
                                    <div class="title">
                                        Weekly Household Planner
                                    </div>

                                    <button
                                        class="add-main"
                                        data-action="add"
                                    >
                                        <ha-icon
                                            icon="mdi:plus"
                                        ></ha-icon>

                                        Ajouter
                                    </button>
                                </div>

                                ${this._loading &&
                    !this._schedule
                    ? `
                                            <div class="loading">
                                                Chargement...
                                            </div>
                                        `
                    : `
                                            <div class="days ${darkMode ? "dark" : "light"}">
                                                ${content}
                                            </div>
                                        `
                }
                            `
            }
                </div>
            </ha-card>
        `;

        this._attachListeners();
    }

    _attachListeners() {
        this.querySelector(
            ".card-content"
        )?.addEventListener(
            "click",
            async (event) => {
                const element =
                    event.target.closest(
                        "[data-action], .day-summary"
                    );

                if (!element) {
                    return;
                }

                if (
                    element.classList.contains(
                        "day-summary"
                    )
                ) {
                    const day =
                        element.dataset.day;

                    this._expandedDay =
                        this._expandedDay === day
                            ? null
                            : day;

                    this._render();
                    return;
                }

                const action =
                    element.dataset.action;

                if (
                    [
                        "add",
                        "edit",
                        "duplicate",
                        "delete",
                    ].includes(action)
                ) {
                    event.stopPropagation();
                }

                switch (action) {
                    case "add":
                        await this._openAddEditor(
                            element.dataset.day ?? null
                        );
                        break;

                    case "edit":
                        await this._openEditEditor(
                            element.dataset.taskId
                        );
                        break;

                    case "duplicate":
                        await this._openDuplicateEditor(
                            element.dataset.taskId
                        );
                        break;

                    case "delete":
                        await this._deleteTask(
                            element.dataset.taskId
                        );
                        break;
                }
            }
        );

        if (this._editor) {
            attachEditorListeners({
                root: this,
                editor: this._editor,
                definition: this._definition,

                repeatDaysExpanded:
                    this._repeatDaysExpanded,

                setRepeatDaysExpanded:
                    (value) => {
                        this._repeatDaysExpanded =
                            value;
                    },

                render:
                    () => this._render(),

                save:
                    () => this._saveEditor(),

                cancel:
                    () => {
                        this._editor = null;
                        this._render();
                    },
            });
        }
    }

    getCardSize() {
        return 5;
    }

    static getStubConfig() {
        return {};
    }
}

customElements.define(
    "weekly-planner-card",
    WeeklyPlannerCard
);

window.customCards = window.customCards || [];

window.customCards.push({
    type: "weekly-planner-card",
    name: "Weekly Household Planner",
    description: "Manage weekly household tasks",
    preview: true,
});