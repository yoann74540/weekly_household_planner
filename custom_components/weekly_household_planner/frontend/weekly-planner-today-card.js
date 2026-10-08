import {
    WEEKLY_PLANNER_COMMON_STYLES,
    WEEKLY_PLANNER_TODAY_STYLES,
} from "./weekly-planner-styles.js";

import {
    getDefinition,
    getSchedule,
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
        this._loading = false;
        this._selectedTask = null;
    }


    setConfig(config) {
        this._config = config;
    }


    set hass(hass) {
        const firstLoad = !this._hass;

        this._hass = hass;

        if (firstLoad) {
            this._loadData();
        }
    }


    connectedCallback() {
        if (this._hass && !this._schedule) {
            this._loadData();
        }
    }


    async _loadData() {
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

            this._schedule =
                scheduleResponse.schedule ?? {};

            this._definition =
                definitionResponse.definition ?? {};

        } catch (error) {
            console.error(
                "Unable to load Weekly Household Planner today card",
                error
            );

            this._schedule = {};
            this._definition = {};

        } finally {
            this._loading = false;
            this._render();
        }
    }


    _getToday() {
        return DAYS[new Date().getDay()];
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

        return `
            <div
                class="task today-task-clickable"
                data-task-index="${index}"
                style="--actor-color: ${actorColor};"
            >
                <div class="task-actor">
                    <span class="task-actor-label">
                        ${task.who}
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
                () => {
                    const index =
                        Number(
                            element.dataset.taskIndex
                        );

                    this._selectedTask =
                        this._getTodayTasks()[index]
                        ?? null;

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