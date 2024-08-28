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
            <!-- bar -->
            ${this.renderBar()}
 
            <!-- (B) FOLLOWING : TASKS -->
            <div style="background: #ffdddd; grid-row: 2; grid-column: 1 / span 2">
                First
            </div>
            
        </div>
        `
    }

    set project(project) {
        this._project = project;
        console.log(this._project);
        console.log(this.getTimeSlice(this._project));
        this.render();
    }

    get project() {
        return this._project;
    }

    SECOND = 1000;
    MINUTE = 60 * this.SECOND;
    HOUR = 60 * this.MINUTE;
    DAY = 24 * this.HOUR;
    WEEK = 7 * this.DAY;
    dayDiff(d1, d2) {
        return Math.floor((d2 - d1) / this.DAY);
    }

    nextDay(date) {
        return new Date(date.getTime() + this.DAY);
    }

    numToMonth(num) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[num];
    }

    renderBar() {
        // TODO: done only for monthly view
        const timeSlice = this.getTimeSlice(this._project);
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;

        this.myStyle.textContent = `
        /* (A) GANTT CHART CONTAINER */
        .gantt {
            /* (A1) GRID LAYOUT - 7 COLUMNS */
            display: grid;
            grid-template-columns: repeat(${numOfCol}, minmax(0, 1fr));
 
            /* (A2) "TIMELINE" */
            background: repeating-linear-gradient(
                to right, #000000, #ddd 2px, #fff 2px, #fff ${(1/numOfCol)*100}%
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
        let bar = '';
        let dateCol = timeSlice.start;
        for (let monthnum = 0; monthnum < numOfCol; monthnum++) {
            bar += `<div class="head">${dateCol.getDate()}</div>`;
            dateCol = this.nextDay(dateCol);
        }
        return bar
    }

    // extract data for creating gantt
    getTimeSlice(project) {
        return {start: this.getStartDate(project), end: this.getEndDate(project)};
    }

    getStartDate(project) {
        let startDate = null;

        for (const phase of project.phases) {
            for (const activity of phase.activities) {
                if (this.isFirstActivity(activity)) {
                    if (activity.activity.start) {
                        const start = new Date(activity.activity.start);
                        if (startDate) {
                            if (start.getTime() < startDate.getTime()) {
                                startDate = start;
                            }
                        } else {
                            startDate = start;
                        }
                    }
                }
            }
        }

        if (!startDate) {
            let firstEnd = this.getFirstEndDate(project);
            if (firstEnd.getTime() < new Date().getTime()) {
                startDate = firstEnd;
            } else {
                startDate = new Date();
            }
        }
        return startDate;
    }

    getFirstEndDate(project) {
        let endDate = null;

        for (const phase of project.phases) {
            for (const activity of phase.activities) {
                const deadline = new Date(activity.activity.deadline)
                if (endDate) {
                    if (deadline.getTime() < endDate.getTime()) {
                        endDate = deadline;
                    }
                } else {
                    endDate = deadline;
                }
            }
        }
        return endDate;
    }

    getEndDate(project) {
        let endDate = null;

        for (const phase of project.phases) {
            for (const activity of phase.activities) {
                const deadline = new Date(activity.activity.deadline)
                if (endDate) {
                    if (deadline.getTime() > endDate.getTime()) {
                        endDate = deadline;
                    }
                } else {
                    endDate = deadline;
                }
            }
        }
        return endDate;
    }

    isFirstActivity(activity) {
        return activity.linkedActivityId == null;
    }
}

customElements.define('gantt-component', GanttComponent);