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