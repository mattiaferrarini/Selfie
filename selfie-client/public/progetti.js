class ConditionalRender extends HTMLElement {
    static get observedAttributes() {
        return ['condition'];
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    attributeChangedCallback(name, oldValue, newValue) {
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
    // check logincookies
    const auth = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth="))
        ?.split("=")[1];
    if (!auth) {
        window.location.href = '/#/login';
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

delete_cookie = (name) => {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

const unsubscribe = async () => {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        await registration?.unregister();
        const response = await fetch(`${API_URL}/notification/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Credentials': 'include'
            },
            body: JSON.stringify({ endpoint: subscription?.endpoint })
        });

        if (!response.ok) {
            throw await response.json();
        }

        return await response.json();
    } catch (error) {}
}

const logout = async () => {
    await unsubscribe();
    await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Credentials': 'include'
        },
        body: JSON.stringify({})
    });
    delete_cookie('auth');
    window.location.href = '/#/login';
}