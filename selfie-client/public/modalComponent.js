class ModalComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="tailwind.css"/>
            <div class="fixed inset-0 items-center justify-center bg-black bg-opacity-50 hidden" id="container">
                <div class="bg-white p-4 rounded-lg shadow-lg relative max-w-lg mx-auto">
                    <button class="absolute top-0 right-2 text-gray-500 text-lg" id="close-btn">&times;</button>
                    <slot></slot>
                </div>
            </div>
        `;
        this.modal = this.shadowRoot.getElementById('container');
        this.closeBtn = this.shadowRoot.getElementById('close-btn');
        this.closeBtn.addEventListener('click', () => this.hide());
        this.modal.addEventListener('click', (event) => this.handleOutsideClick(event));
    }

    handleOutsideClick(event) {
        if (event.target === this.modal) {
            this.hide();
        }
    }

    disconnectedCallback() {
        this.closeBtn.removeEventListener('click');
        this.modal.removeEventListener('click');
    }

    show() {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
    }

    hide() {
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
    }
}

customElements.define('modal-component', ModalComponent);