import {
    WEEKLY_PLANNER_STYLES,
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


    _renderTask(task) {
        const actorColor =
            this._definition
                ?.actor_colors
            ?.[task.who]
            ?? "var(--primary-color)";

        const details =
            this._taskDetails(task);

        return `
            <div
                class="task"
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
                    ${WEEKLY_PLANNER_STYLES}
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
                            (task) =>
                                this._renderTask(task)
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

                </div>
            </ha-card>
        `;
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