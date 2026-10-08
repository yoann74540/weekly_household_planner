export const WEEKLY_PLANNER_COMMON_STYLES = `

    /* ---------- Light theme ---------- */

    .light {
        --actor-label-mix: 55%;
        --actor-label-base: white;
        --actor-label-text: #111;

        --actor-chip-mix: 35%;
        --actor-chip-base: white;
        --actor-chip-text: #111;
        --actor-chip-border-mix: 0%;
    }


    /* ---------- Dark theme ---------- */

    .dark {
        --actor-label-mix: 18%;
        --actor-label-base: transparent;

        --actor-chip-mix: 18%;
        --actor-chip-base: transparent;
        --actor-chip-border-mix: 35%;
    }

    .dark .task,
    .today-detail-overlay.dark .today-detail-dialog {
        --actor-label-text: var(--actor-color);
        --actor-chip-text: var(--actor-color);
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

        padding: 3px 8px;
        border-radius: 5px;

        background:
            color-mix(
                in srgb,
                var(--actor-color) var(--actor-label-mix),
                var(--actor-label-base)
            );

        color: var(--actor-label-text);
    }

    .days.dark .task-actor-label {
        padding: 0;
        border-radius: 0;
        background: transparent;
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
`;