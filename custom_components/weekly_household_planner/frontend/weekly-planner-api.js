const DOMAIN = "weekly_household_planner";


async function callService(
    hass,
    service,
    data = {}
) {
    const response = await hass.callService(
        DOMAIN,
        service,
        data,
        {},
        true,
        true
    );

    return response.response;
}


export async function getSchedule(hass) {
    return callService(
        hass,
        "get_schedule"
    );
}


export async function getDefinition(hass) {
    return callService(
        hass,
        "get_definition"
    );
}


export async function addTask(
    hass,
    task
) {
    return callService(
        hass,
        "add_task",
        task
    );
}


export async function updateTask(
    hass,
    id,
    task
) {
    return callService(
        hass,
        "update_task",
        {
            id,
            ...task,
        }
    );
}


export async function removeTask(
    hass,
    id
) {
    return callService(
        hass,
        "remove_task",
        {
            id,
        }
    );
}