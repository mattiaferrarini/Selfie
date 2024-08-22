class ConditionalRender extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    static get observedAttributes() {
        return ['condition'];
    }

    attributeChangedCallback(name) {
        if (name === 'condition') {
            this.render();
        }
    }

    render() {
        const condition = this.getAttribute('condition');
        this.shadowRoot.innerHTML = condition === 'true' ? `<slot name="true"></slot>` : `<slot name="false"></slot>`;
    }
}

customElements.define('conditional-render', ConditionalRender);

document.addEventListener('DOMContentLoaded', () => {
    // check auth status
    const auth = JSON.parse(localStorage.getItem('auth') || null);
    if (!auth || !auth.isAuthenticated) {
        window.location.href = '/#/login';
    }

    if (auth.isAdmin) {
        document.getElementById("adminLink").classList.remove("hidden");
    }

    document.getElementById('visualType').value = auth.user.preferences?.projectsView || 'list';
    document.getElementById('visualType').addEventListener('change', (event) => {
        console.log(event)
        auth.user.preferences.projectsView = event.target.value;
        localStorage.setItem('auth', JSON.stringify(auth));
        fetchWithMiddleware(`${API_URL}/profile/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({projectsView: event.target.value})
        });
        const ganttView = document.getElementById('ganttView');
        const listView = document.getElementById('listView');
        if (event.target.value === 'gantt') {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
        } else {
            ganttView.classList.add('hidden');
            listView.classList.remove('hidden');
        }
    });

    // TODO: save date?
    let showTooltip = false;
    const selectedDate = '';

    const conditionalRenderElement = document.getElementById('dateConditionalRender');

    const dateInput = document.getElementById('selectedDate');
    const timeInput = document.getElementById('selectedTime');

    try {
        const date = JSON.parse(localStorage.getItem('date'));
        dateInput.value = date.currentDate.split('T')[0];
        timeInput.value = date.currentTime;
    } catch (e) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const toggleTooltip = () => {
        showTooltip = !showTooltip;
        conditionalRenderElement.setAttribute('condition', showTooltip);
    };

    const resetDate = () => {
        dateInput.value = new Date().toISOString().split('T')[0];
    };

    const clickOutsideElement = document.getElementById('clickOutsideElement');
    clickOutsideElement.addEventListener('clickoutside', () => {
        showTooltip = false;
        conditionalRenderElement.setAttribute('condition', showTooltip);
    });

    document.getElementById('toggleDateTooltip').addEventListener('click', toggleTooltip);
    document.getElementById('resetDate').addEventListener('click', resetDate);
});

const API_URL = "http://localhost:3000";

const forceLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/#/login';
}

async function fetchWithMiddleware(url, options) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });
    if (response.status === 401) {
        forceLogout();
    }
    return response;
}

const unsubscribe = async () => {
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

const logout = async () => {
    await unsubscribe();
    await fetchWithMiddleware(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}