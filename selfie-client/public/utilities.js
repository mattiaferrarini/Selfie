export const API_URL = "http://localhost:3000"; // TODO: Change this url in deployment

export const forceLogout = () => {
    localStorage.setItem('auth', '{"user":null,"isAuthenticated":false,"isAdmin":false}');
    window.location.href = '/#/login';
}

export const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await registration?.unregister();
    await fetchWithMiddleware(`${API_URL}/notification/unsubscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({endpoint: subscription?.endpoint})
    });
}

export const logout = async () => {
    await unsubscribe();
    await fetchWithMiddleware(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
    forceLogout();
}

export async function fetchWithMiddleware(url, options) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });
    if (response.status === 401) {
        forceLogout();
    }
    return response;
}

export const getTimeMachineDate = () => {
    let timeDifference = JSON.parse(localStorage.getItem('date')).realTimeDiff || 0;
    return new Date(new Date().getTime() + timeDifference);
}

export const getLastTimemachineSavedDate = () => {
    let currentDate = JSON.parse(localStorage.getItem('date')).currentDate;
    return new Date(currentDate)
}

export const getStatusFromActivity = (activity, activities) => {
    let status;
    let linkedOutputUnavailable = false;
    if (activity.linkedActivityId !== null) {
        const linkedActivity = activities.find(act => act.localId === activity.linkedActivityId);
        if (!(linkedActivity.output !== "" && linkedActivity.status === "Concluded"))
            linkedOutputUnavailable = true;
    }
    if (activity.status === "Abandoned" || getTimeMachineDate().setDate(getTimeMachineDate().getDate() + 2 * 7) > activity.activity?.deadline) {
        status = "Abbandoned";
    } else if (activity.activity?.deadline < getTimeMachineDate() && (activity.output === "" || activity.status !== "Concluded")) {
        status = "Late";
    } else if (activity.input === "" || linkedOutputUnavailable) {
        status = "Not activatable";
    } else if (activity.status === "NotStarted") {
        status = "Activatable";
    } else if (activity.status === "Rejected") {
        status = "Reactivated";
    } else if (activity.status === "Concluded" && activity.output !== "") {
        status = "Concluded";
    } else {
        status = "Active";
    }
    return status;
}