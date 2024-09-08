class ModalComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="tailwind.css"/>
            <div class="fixed inset-0 items-center justify-center bg-black p-1 sm:p-0 bg-opacity-30 hidden max-h-screen" id="container">
                <div class="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-2xl mx-auto">
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
            //this.hide();
            // sarebbe un po' un casino riattivarlo per come funziona l'aggiunta delle 
            // attività al mondo, quindi per ora lo lascio così
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