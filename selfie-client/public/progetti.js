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

class ClickOutside extends HTMLElement {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
    }

    connectedCallback() {
        document.addEventListener('click', this.handleClick);
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleClick);
    }

    handleClick(event) {
        if (!this.contains(event.target)) {
            this.dispatchEvent(new CustomEvent('clickoutside'));
        }
    }
}

customElements.define('click-outside', ClickOutside);

document.addEventListener('DOMContentLoaded', () => {
    // check auth status
    const auth = JSON.parse(localStorage.getItem('auth') || null);
    if (!auth || !auth.isAuthenticated) {
        window.location.href = '/#/login';
    }

    if (auth.isAdmin) {
        document.getElementById("adminLink").classList.remove("hidden");
    }

    // TODO: save date?
    let showTooltip = false;
    const selectedDate = '';

    const conditionalRenderElement = document.getElementById('dateConditionalRender');

    const toggleTooltip = () => {
        const dateInput = document.getElementById('selectedDate');
        dateInput.value = new Date().toISOString().split('T')[0];
        showTooltip = !showTooltip;
        conditionalRenderElement.setAttribute('condition', showTooltip);
    };

    const resetDate = () => {
        const dateInput = document.getElementById('selectedDate');
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
    const response = await fetch(url, options);
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
            'Content-Type': 'application/json',
            'Credentials': 'include'
        },
        body: JSON.stringify({endpoint: subscription?.endpoint})
    });
}

const logout = async () => {
    await unsubscribe();
    await fetchWithMiddleware(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Credentials': 'include'
        },
        body: JSON.stringify({})
    });
}