class ModalComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="tailwind.css"/>
            <div class="fixed inset-0 items-center justify-center bg-black p-1 sm:p-0 bg-opacity-30 hidden max-h-screen" id="container">
                <div class="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-2xl mx-auto">
                    <slot></slot>
                </div>
            </div>
        `;
        this.modal = this.shadowRoot.getElementById('container');
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