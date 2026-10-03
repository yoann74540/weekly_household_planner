export const WEEKLY_PLANNER_STYLES = `
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

    .task {
        overflow: hidden;

        border:
            1px solid color-mix(
                in srgb,
                var(--actor-color) 30%,
                var(--divider-color)
            );

        border-left:
            5px solid var(--actor-color);

        border-radius: 9px;

        background:
            var(--card-background-color);
    }

    .task-actor {
        padding: 6px 12px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) 14%,
                transparent
            );

        color: var(--actor-color);

        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .task-actor-label {
        display: inline-block;
    }

    /* Thème clair */
    .days.light .task-actor-label {
        padding: 3px 8px;

        border-radius: 5px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) 55%,
                white
            );

        color: #111;
    }

    /* Thème sombre */
    .days.dark .task-actor-label {
        padding: 0;
        border-radius: 0;
        background: transparent;

        color: var(--actor-color);
    }

    .task-content {
        display: flex;
        align-items: center;

        min-height: 46px;

        padding: 5px 8px 5px 12px;
    }

    .task-info {
        flex: 1;
        min-width: 0;
    }

    .task-name {
        font-size: 15px;
        font-weight: 500;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .task-details {
        margin-top: 3px;

        color:
            var(--secondary-text-color);

        font-size: 13px;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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