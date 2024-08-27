class GanttComponent extends HTMLElement {
    constructor() {
        super();
        this._project = {};
        this.myStyle = document.createElement('style');
        this.content = document.createElement('div');
    }

    connectedCallback() {
        this.attachShadow({ mode: "open" });

        this.myStyle.textContent = `
        /* (A) GANTT CHART CONTAINER */
        .gantt {
            /* (A1) GRID LAYOUT - 7 COLUMNS */
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
 
            /* (A2) "TIMELINE" */
            background: repeating-linear-gradient(
                to right, #f2f2f2, #ddd 2px, #fff 2px, #fff 14.25%
            );
        }
        
        /* (B) CELLS */
        /* (B1) SHARED CELLS */
        .gantt div { padding: 10px; }
 
         /* (B2) HEADER CELLS */
        .gantt .head {
            text-align: center;
            font-weight: 700;
            color: #fff;
            background: #103a99;
        }
        `;

        this.shadowRoot.appendChild(this.myStyle);
        this.shadowRoot.appendChild(this.content);

        this.render();
    }


    render() {
        this.content.innerHTML = `
        <div class="gantt-container">
            <h1>Gantt chart</h1>
            ${this.renderHeading()}
            ${this.renderGantt()}
        </div>
        `
    }

    renderHeading() {
        if (!this._project) {
            return '';
        }
        return `
        <div>
            <h1>${this._project.title}</h1>
            <p>Owner: ${this._project.owner}</p>
            <p>Actors: ${this._project.actors}</p>
        </div>
        `
    }

    renderGantt() {
        return `
        <div class="gantt">
            <!-- (A) FIRST ROW : DAYS -->
            <div class="head">Mon</div> <div class="head">Tue</div>
            <div class="head">Wed</div> <div class="head">Thur</div>
            <div class="head">Fri</div> <div class="head">Sat</div>
            <div class="head">Sun</div>
 
            <!-- (B) FOLLOWING : TASKS -->
            <div style="background: #ffdddd; grid-row: 2; grid-column: 1 / span 2">
                First
            </div>
            <div style="background: #d6ffd8; grid-row: 3; grid-column: 3 / span 3">
                Second
            </div>
            <div style="background: #e2e5ff; grid-row: 4; grid-column: 5 / span 3">
                Third
            </div>
        </div>
        `
    }

    set project(project) {
        this._project = project;
        console.log(this._project);
        this.render();
    }

    get project() {
        return this._project;
    }
}

customElements.define('gantt-component', GanttComponent);