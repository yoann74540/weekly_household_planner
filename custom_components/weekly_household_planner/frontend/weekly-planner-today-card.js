import { WEEKLY_PLANNER_COMMON_STYLES } from "./styles/weekly-planner-common-styles.js";
import { WEEKLY_PLANNER_TODAY_STYLES } from "./styles/weekly-planner-today-styles.js";

import {
    getDefinition,
    getSchedule,
    getCompletions,
} from "./weekly-planner-api.js";


const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];


class WeeklyPlannerTodayCard extends HTMLElement {

    constructor() {
        super();

        this._hass = null;
        this._config = {};
        this._schedule = null;
        this._definition = null;
        this._completions = {};
        this._loading = false;
        this._selectedTask = null;
        this._unsubscribeCompletion = null;

        this._currentDate = this._getTodayDate();
        this._dayTimer = null;
    }


    setConfig(config) {
        this._config = config;
    }


    set hass(hass) {
        const firstLoad = !this._hass;

        this._hass = hass;

        if (this.isConnected) {
            this._subscribeCompletionEvents();
        }

        if (firstLoad) {
            this._loadData();
        } else {
            this._checkDayChange();
        }
    }


    connectedCallback() {
        this._subscribeCompletionEvents();

        this._dayTimer = setInterval(() => {
            this._checkDayChange();
        }, 60_000);

        if (this._hass && !this._schedule) {
            this._loadData();
        }
    }

    disconnectedCallback() {
        if (this._dayTimer) {
            clearInterval(this._dayTimer);
            this._dayTimer = null;
        }

        if (this._unsubscribeCompletion) {
            this._unsubscribeCompletion();
            this._unsubscribeCompletion = null;
        }
    }


    async _loadData() {
        if (this._loading || !this._hass) {
            return;
        }

        this._loading = true;
        this._render();

        try {
            const [scheduleResponse, definitionResponse, completionsResponse] =
                await Promise.all([
                    getSchedule(this._hass),
                    getDefinition(this._hass),
                    getCompletions(this._hass),
                ]);

            this._schedule =
                scheduleResponse.schedule ?? {};

            this._definition =
                definitionResponse.definition ?? {};

            this._completions =
                completionsResponse.completions ?? {};

        } catch (error) {
            console.error(
                "Unable to load Weekly Household Planner today card",
                error
            );

            this._schedule = {};
            this._definition = {};
            this._completions = {};
        } finally {
            this._loading = false;
            this._render();
        }
    }

    async _subscribeCompletionEvents() {
        if (!this._hass || this._unsubscribeCompletion) {
            return;
        }

        this._unsubscribeCompletion =
            await this._hass.connection.subscribeEvents(
                (event) => {
                    const { task_id, completed, date } = event.data;

                    if (date !== this._currentDate) {
                        return;
                    }

                    this._completions[task_id] = completed;

                    this._updateTaskStatus(task_id, completed);
                },
                "weekly_household_planner_task_completion_changed"
            );
    }

    async _toggleTaskCompletion(task) {
        const completed = !(this._completions[task.id] ?? false);

        try {
            await this._hass.callService(
                "weekly_household_planner",
                "complete_task",
                {
                    task_id: task.id,
                    completed,
                }
            );
        } catch (error) {
            console.error(
                "Unable to update task completion",
                error
            );
        }
    }

    _checkDayChange() {
        const today = this._getTodayDate();

        if (today === this._currentDate) {
            return;
        }

        this._currentDate = today;
        this._completions = {};
        this._selectedTask = null;

        this._loadData();
    }


    _getToday() {
        return DAYS[new Date().getDay()];
    }

    _getTodayDate() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    _getTodayTasks() {
        const day = this._getToday();

        return this._schedule?.[day] ?? [];
    }


    _formatDate() {
        return new Intl.DateTimeFormat(
            this._hass?.locale?.language ?? "fr",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
            }
        ).format(new Date());
    }


    _taskDetails(task) {
        const parameters =
            task.parameters ?? {};

        const values =
            Object.values(parameters)
                .flatMap((value) =>
                    Array.isArray(value)
                        ? value
                        : [value]
                )
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                );

        return values.join(", ");
    }


    _renderTask(task, index) {
        const actorColor =
            this._definition
                ?.actor_colors
            ?.[task.who]
            ?? "var(--primary-color)";

        const details =
            this._taskDetails(task);

        const completed =
            this._completions[task.id] ?? false;

        return `
            <div
                class="task today-task-clickable"
                data-task-index="${index}"
                data-task-id="${task.id}"
                style="--actor-color: ${actorColor};"
            >

                <div class="task-actor">
                    <span class="task-actor-label">
                        ${task.who}
                    </span>

                    <span class="today-task-status ${completed ? "completed" : ""}"
                        data-completion-toggle="true">
                        ${completed ? `<ha-icon icon="mdi:check"></ha-icon>` : ""}
                    </span>
                </div>

                <div class="task-content">
                    <div class="task-info">
                        <div class="task-name">
                            ${task.task}
                        </div>

                        ${details
                ? `
                                <div class="task-details">
                                    ${details}
                                </div>
                            `
                : ""
            }
                    </div>
                </div>
            </div>
        `;
    }

    _updateTaskStatus(taskId, completed) {
        const task = [...this.querySelectorAll(".today-task-clickable")]
            .find((element) => element.dataset.taskId === taskId);

        if (!task) {
            return;
        }

        const status = task.querySelector(".today-task-status");

        if (!status) {
            return;
        }

        status.classList.toggle("completed", completed);

        status.innerHTML = completed
            ? '<ha-icon icon="mdi:check"></ha-icon>'
            : "";
    }

    _renderTaskDetails(task, darkMode) {
        const actorColor =
            this._definition
                ?.actor_colors
            ?.[task.who]
            ?? "var(--primary-color)";

        const parameters =
            task.parameters ?? {};

        const parameterRows =
            Object.entries(parameters)
                .filter(
                    ([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                )
                .map(([key, value]) => {

                    const values =
                        Array.isArray(value)
                            ? value
                            : [value];

                    const chips =
                        values
                            .map(
                                (item) => `
                                    <span class="today-detail-chip">
                                        ${item}
                                    </span>
                                `
                            )
                            .join("");

                    return `
                        <div class="today-detail-row">

                            <div class="today-detail-key">
                                ${key}
                            </div>

                            <div class="today-detail-value">
                                ${chips}
                            </div>

                        </div>
                    `;
                })
                .join("");

        return `
            <div
                class="today-detail-overlay ${darkMode ? "dark" : "light"}"
                data-action="close-detail"
            >
                <div
                    class="today-detail-dialog"
                    style="--actor-color: ${actorColor};"
                >
                    <div class="today-detail-header">

                        <div>
                            <div class="today-detail-actor">
                                ${task.who}
                            </div>

                            <div class="today-detail-title">
                                ${task.task}
                            </div>
                        </div>

                        <button
                            class="today-detail-close"
                            data-action="close-detail"
                            aria-label="Fermer"
                        >
                            <ha-icon
                                icon="mdi:close"
                            ></ha-icon>
                        </button>

                    </div>

                    ${parameterRows
                ? `
                            <div class="today-detail-parameters">
                                ${parameterRows}
                            </div>
                        `
                : `
                            <div class="today-detail-empty">
                                Aucun paramètre
                            </div>
                        `
            }

                </div>
            </div>
        `;
    }


    _render() {
        if (!this._hass) {
            return;
        }

        const darkMode =
            this._hass.themes?.darkMode ?? false;

        const tasks =
            this._getTodayTasks();

        const taskCount =
            tasks.length;

        this.innerHTML = `
            <ha-card>
                <style>
                    ${WEEKLY_PLANNER_COMMON_STYLES}
                    ${WEEKLY_PLANNER_TODAY_STYLES}
                </style>

                <div class="today-card">

                    <div class="today-header">
                        <div>
                            <div class="today-title">
                                Aujourd'hui
                            </div>

                            <div class="today-date">
                                ${this._formatDate()}
                            </div>
                        </div>

                        <div class="today-count">
                            ${taskCount}
                            ${taskCount > 1
                ? "tâches"
                : "tâche"
            }
                        </div>
                    </div>

                    ${this._loading && !this._schedule
                ? `
                            <div class="today-empty">
                                Chargement...
                            </div>
                        `
                : taskCount
                    ? `
                                <div class="days ${darkMode ? "dark" : "light"}">
                                    <div class="tasks">
                                        ${tasks
                        .map(
                            (task, index) =>
                                this._renderTask(task, index)
                        )
                        .join("")
                    }
                                    </div>
                                </div>
                            `
                    : `
                                <div class="today-empty">
                                    <ha-icon
                                        icon="mdi:calendar-check-outline"
                                    ></ha-icon>

                                    <div>
                                        Rien de prévu aujourd'hui
                                    </div>
                                </div>
                            `
            }

            ${this._selectedTask
                ? this._renderTaskDetails(
                    this._selectedTask,
                    darkMode
                )
                : ""
            }

                </div>
            </ha-card>
        `;
        this._attachListeners();
    }

    _attachListeners() {
        this.querySelectorAll(
            ".today-task-clickable"
        ).forEach((element) => {

            element.addEventListener(
                "click",
                (event) => {
                    const index = Number(element.dataset.taskIndex);
                    const task = this._getTodayTasks()[index];

                    if (!task) {
                        return;
                    }

                    const status = event.target.closest(".today-task-status");

                    if (status) {
                        event.stopPropagation();
                        this._toggleTaskCompletion(task);
                        return;
                    }

                    this._selectedTask = task;
                    this._render();
                }
            );
        });


        this.querySelector(
            ".today-detail-close"
        )?.addEventListener(
            "click",
            () => {
                this._selectedTask = null;
                this._render();
            }
        );


        this.querySelector(
            ".today-detail-overlay"
        )?.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    this._selectedTask = null;
                    this._render();
                }
            }
        );
    }


    getCardSize() {
        return 3;
    }


    static getStubConfig() {
        return {};
    }
}


customElements.define(
    "weekly-planner-today-card",
    WeeklyPlannerTodayCard
);


window.customCards =
    window.customCards || [];


window.customCards.push({
    type: "weekly-planner-today-card",
    name: "Weekly Planner Today",
    description: "Display today's household tasks",
    preview: true,
});