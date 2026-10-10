export const WEEKLY_PLANNER_WEEK_STYLES = `
    .card-content {
        padding: 0;
    }

    .editor-error {
        display: flex;
        align-items: flex-start;
        gap: 8px;

        margin-top: 12px;
        padding: 10px 12px;

        border-radius: 6px;

        background:
            var(--error-color);

        color: white;

        font-size: 14px;
        font-weight: 400;
    }

    .editor-error ha-icon {
        flex-shrink: 0;

        --mdc-icon-size: 20px;
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 16px 16px 12px;
    }

    .title {
        font-size: 20px;
        font-weight: 500;
    }

    .add-main {
        display: flex;
        align-items: center;
        gap: 5px;

        border: 0;
        background: transparent;

        color: var(--primary-color);

        font: inherit;
        font-weight: 500;

        cursor: pointer;
    }

    .add-main ha-icon {
        --mdc-icon-size: 20px;
    }

    .days {
        border-top:
            1px solid var(--divider-color);
    }

    .day {
        border-bottom:
            1px solid var(--divider-color);
    }

    .day:last-child {
        border-bottom: 0;
    }

    .day-summary {
        display: flex;
        align-items: center;

        min-height: 52px;
        padding: 0 12px 0 16px;

        cursor: pointer;
        user-select: none;
    }

    .day-name {
        flex: 1;

        font-size: 15px;
        font-weight: 500;
    }

    .day-count {
        margin-right: 8px;

        color:
            var(--secondary-text-color);

        font-size: 14px;
    }

    .chevron {
        color:
            var(--secondary-text-color);

        transition:
            transform 150ms ease;
    }

    .chevron.expanded {
        transform: rotate(180deg);
    }

    .tasks {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 4px 16px 12px 28px;
    }

    .task-actions {
        display: flex;
        gap: 5px;
        margin-left: 8px;
    }

    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 34px;
        height: 34px;

        padding: 0;

        border:
            1px solid var(--divider-color);
        border-radius: 50%;

        background:
            var(--card-background-color);

        color:
            var(--secondary-text-color);

        cursor: pointer;

        transition:
            background-color 120ms ease,
            border-color 120ms ease;
    }

    .icon-button:hover {
        background:
            var(--secondary-background-color);

        border-color:
            var(--secondary-text-color);
    }

    .icon-button ha-icon {
        --mdc-icon-size: 18px;
    }

    .day-add {
        display: flex;
        align-items: center;
        gap: 4px;

        margin-top: 4px;
        padding: 8px 0;

        border: 0;
        background: transparent;

        color: var(--primary-color);

        font: inherit;
        font-size: 14px;
        font-weight: 500;

        cursor: pointer;
    }

    .day-add ha-icon {
        --mdc-icon-size: 18px;
    }

    .loading {
        padding: 24px 16px;

        color:
            var(--secondary-text-color);
    }

    .editor {
        padding: 16px;
    }

    .editor-title {
        margin-bottom: 20px;

        font-size: 20px;
        font-weight: 500;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 7px;

        margin-bottom: 18px;

        font-size: 14px;
        font-weight: 500;
    }

    .field select {
        width: 100%;

        box-sizing: border-box;

        padding: 10px;

        border:
            1px solid var(--divider-color);
        border-radius: 6px;

        background:
            var(--card-background-color);

        color:
            var(--primary-text-color);

        font: inherit;
    }

    .checkboxes {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;

        margin-top: 4px;
    }

    .checkbox {
        display: flex;
        align-items: center;
        gap: 6px;

        font-weight: normal;

        cursor: pointer;
    }

    .checkbox input {
        width: 18px;
        height: 18px;
    }

    .editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        margin-top: 24px;
    }

    .editor-button {
        padding: 9px 14px;

        border: 0;
        border-radius: 5px;

        background: transparent;

        color: var(--primary-color);

        font: inherit;
        font-weight: 500;

        cursor: pointer;
    }

    .editor-button.primary {
        background: var(--primary-color);
        color: white;
    }

    .repeat-field {
        margin: 6px 0 18px;
    }

    .repeat-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;

        padding-top: 10px;
    }

    .repeat-header {
        display: flex;
        align-items: center;

        width: 100%;
        min-height: 44px;

        padding: 0;

        border: 0;

        background: transparent;

        color: var(--primary-text-color);

        font: inherit;

        cursor: pointer;
    }

    .repeat-title {
        flex: 1;

        text-align: left;

        font-size: 14px;
        font-weight: 500;
    }

    .repeat-header-right {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .repeat-summary {
        color: var(--secondary-text-color);

        font-size: 13px;
        font-weight: 400;
    }

    .repeat-chevron {
        color: var(--secondary-text-color);

        transition: transform 150ms ease;
    }

    .repeat-chevron.expanded {
        transform: rotate(180deg);
    }

    .repeat-day {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        aspect-ratio: 1;

        max-width: 44px;

        justify-self: center;

        padding: 0;

        border:
            1px solid var(--divider-color);
        border-radius: 50%;

        background:
            var(--secondary-background-color);

        color:
            var(--primary-text-color);

        font: inherit;
        font-size: 13px;
        font-weight: 500;

        cursor: pointer;

        transition:
            background-color 120ms ease,
            color 120ms ease,
            border-color 120ms ease,
            transform 80ms ease;
    }

    .repeat-day:hover:not(:disabled) {
        border-color:
            var(--primary-color);
    }

    .repeat-day:active:not(:disabled) {
        transform: scale(0.94);
    }

    .repeat-day.selected {
        border-color:
            var(--primary-color);

        background:
            var(--primary-color);

        color: white;
    }

    .repeat-day.main {
        border-color:
            var(--primary-color);

        background:
            var(--primary-color);

        color: white;

        opacity: 0.45;

        cursor: default;
    }
`;

export const WEEKLY_PLANNER_TODAY_STYLES = `

    .today-card {
        padding: 10px;
    }


    /* ---------- Header ---------- */

    .today-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 8px;
    }


    .today-title {
        font-size: 20px;
        font-weight: 600;
        line-height: 1.1;
    }


    .today-date {
        margin-top: 2px;

        color: var(--secondary-text-color);

        font-size: 12px;
        line-height: 1.2;
    }


    .today-count {
        padding: 5px 9px;

        border-radius: 12px;

        background:
            color-mix(
                in srgb,
                var(--primary-color) 12%,
                transparent
            );

        color: var(--primary-color);

        font-size: 12px;
        font-weight: 600;

        white-space: nowrap;
    }


    /* ---------- Tasks grid ---------- */

    .today-card .days {
        border-top: 0;
    }


    .today-card .tasks {
        display: grid;

        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        gap: 6px;

        padding: 0;
    }


    /*
    * Small-screen specific adjustments.
    * Colors and general styles are inherited
    * from WEEKLY_PLANNER_COMMON_STYLES.
    */

    .today-card .task {
        min-width: 0;
    }


    .today-card .task-actor {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 3px 7px;

        font-size: 10px;
        line-height: 1.2;
    }


    .today-card .task-actor-label {
        padding: 2px 6px;
    }

    /* ---------- Task completion status ---------- */

    .today-card .today-task-status {
        display: flex;
        align-items: center;
        justify-content: center;

        flex-shrink: 0;

        width: 18px;
        height: 18px;

        border: 2px solid var(--secondary-text-color);
        border-radius: 50%;

        color: var(--secondary-text-color);
    }

    .today-card .today-task-status ha-icon {
        --mdc-icon-size: 14px;
    }

    .today-card .today-task-status.completed {
        border-color: #4caf50;
        background: #4caf50;
        color: white;
    }


    .today-card .task-content {
        min-height: 0;

        padding: 5px 7px;
    }


    .today-card .task-info {
        min-width: 0;
    }


    .today-card .task-name {
        overflow: hidden;

        font-size: 13px;
        line-height: 1.2;

        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .today-card .task-details {
        overflow: hidden;

        margin-top: 2px;

        font-size: 11px;
        line-height: 1.2;

        text-overflow: ellipsis;
        white-space: nowrap;
    }


    /* ---------- Empty state ---------- */

    .today-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 8px;

        min-height: 120px;

        color: var(--secondary-text-color);

        text-align: center;
        font-size: 14px;
    }


    .today-empty ha-icon {
        --mdc-icon-size: 34px;
    }

    /* ---------- Clickable tasks ---------- */

    .today-task-clickable {
        cursor: pointer;

        touch-action: pan-y;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;

        transition:
            transform 100ms ease,
            opacity 100ms ease;
    }


    .today-task-clickable:active {
        transform: scale(0.98);

        opacity: 0.8;
    }


    /* ---------- Task details ---------- */

    .today-detail-overlay {
        position: fixed;

        inset: 0;

        z-index: 1000;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 16px;

        background: rgba(0, 0, 0, 0.45);
    }


    .today-detail-dialog {
        width: min(360px, 90vw);
        max-height: 80vh;

        overflow-y: auto;

        border-left:
            6px solid var(--actor-color);

        border-radius: 12px;

        background:
            var(--card-background-color);

        color:
            var(--primary-text-color);

        box-shadow:
            0 8px 30px
            rgba(0, 0, 0, 0.25);
    }


    .today-detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;

        gap: 12px;

        padding: 12px 12px 10px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) 14%,
                transparent
            );
    }

    .today-detail-title {
        font-size: 20px;
        font-weight: 600;
    }


    .today-detail-close {
        display: flex;
        align-items: center;
        justify-content: center;

        flex: 0 0 auto;

        width: 36px;
        height: 36px;

        padding: 0;

        border: 0;
        border-radius: 50%;

        background:
            color-mix(
                in srgb,
                var(--primary-text-color) 8%,
                transparent
            );

        color:
            var(--primary-text-color);

        cursor: pointer;
    }


    .today-detail-close ha-icon {
        --mdc-icon-size: 21px;
    }


    .today-detail-parameters {
        padding: 8px 12px 12px;
    }


    .today-detail-row {
        display: grid;

        grid-template-columns:
            minmax(80px, 0.8fr)
            minmax(0, 1.2fr);

        gap: 10px;

        padding: 8px 0;

        border-bottom:
            1px solid
            var(--divider-color);
    }


    .today-detail-row:last-child {
        border-bottom: 0;
    }


    .today-detail-key {
        color:
            var(--secondary-text-color);

        font-size: 13px;
    }


    .today-detail-value {
        display: flex;
        flex-wrap: wrap;

        gap: 5px;

        min-width: 0;
    }


    .today-detail-empty {
        padding: 16px;

        color:
            var(--secondary-text-color);

        text-align: center;
        font-size: 13px;
    }
    /* ---------- Actor label ---------- */

    .today-detail-actor {
        display: inline-block;

        margin-bottom: 5px;
        padding: 3px 8px;

        border-radius: 5px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) var(--actor-label-mix),
                var(--actor-label-base)
            );

        color: var(--actor-label-text);

        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .today-detail-overlay.dark .today-detail-actor {
        padding: 0;
        border-radius: 0;
        background: transparent;
    }


    /* ---------- Parameter chips ---------- */

    .today-detail-chip {
        display: inline-flex;
        align-items: center;

        min-height: 24px;
        padding: 2px 9px;

        border:
            1px solid
            color-mix(
                in srgb,
                var(--actor-color) var(--actor-chip-border-mix),
                transparent
            );

        border-radius: 12px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) var(--actor-chip-mix),
                var(--actor-chip-base)
            );

        color: var(--actor-chip-text);

        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }
`;