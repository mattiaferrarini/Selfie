class GanttComponent extends HTMLElement {
    constructor() {
        super();
        this._project = {};
        this.myStyle = document.createElement('style');
        this.content = document.createElement('div');
        this._row = 1;
        this._timeslice = {start: null, end: null};

        this.INFO_COLS = 5;
    }

    connectedCallback() {
        this.attachShadow({ mode: "open" });

        this.shadowRoot.appendChild(this.myStyle);
        this.shadowRoot.appendChild(this.content);

        this.render();
    }


    render() {
        this._row = 1;
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
 
            <!-- TASKS -->
            ${this.renderPhases()}
            
        </div>
        `
    }

    set project(project) {
        this._project = project;
        this._timeslice = this.getTimeSlice(this._project);
        console.log(this._project);
        console.log(this._timeslice);
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
        return Math.ceil((d2 - d1) / this.DAY);
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
        const timeSlice = this._timeslice;
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;

        this.myStyle.textContent = `
        /* (A) GANTT CHART CONTAINER */
        .gantt {
            /* (A1) GRID LAYOUT - 7 COLUMNS */
            display: grid;
            grid-template-columns: repeat(${this.INFO_COLS}, auto) repeat(${numOfCol}, minmax(0, 1fr));
 
            /* (A2) "TIMELINE" */
            /*background: repeating-linear-gradient(
                to right, #000000, #ddd 2px, #fff 2px, #fff ${(1/numOfCol)*100}%
            );*/
        }
        
        /* (B) CELLS */
        /* (B1) SHARED CELLS */
        /*.gantt div { padding: 10px; }*/
 
         /* (B2) HEADER CELLS */
        .gantt .head {
            text-align: center;
            font-weight: 700;
            color: #fff;
            background: #103a99;
        }
        
        .gantt .head + .head {
            border-left:2px solid red;
        }
        `;
        let bar = '';
        let dateCol = timeSlice.start;

        // info part
        bar += `<div class="head">Phases and activities</div>`;
        bar += `<div class="head">Actors</div>`;
        bar += `<div class="head">Start</div>`;
        bar += `<div class="head">End</div>`;
        bar += `<div class="head">Duration</div>`;

        for (let monthnum = this.INFO_COLS; monthnum < numOfCol + this.INFO_COLS; monthnum++) {
            bar += `<div class="head">${dateCol.getDate()}</div>`;
            dateCol = this.nextDay(dateCol);
        }
        return bar
    }

    renderPhases() {
        let phasesHtml = '';
        for (const phase of this._project.phases) {
            this._row++;
            phasesHtml += `<div style="grid-row: ${this._row}; grid-column: 1 / span ${this.INFO_COLS}; font-weight: bold">${phase.title}</div>`;
            phasesHtml += this.renderPhase(phase);
        }
        return phasesHtml;
    }

    renderPhase(phase) {
        let phaseHtml = '';
        if (phase.activities.length <= 0) {
            return phaseHtml;
        }
        let activity = this.getFirstActivity(phase);
        let startDate = new Date(activity.activity.start);
        let endDate = new Date(activity.activity.deadline);
        let localId = activity.localId;

        while (activity) {
            endDate = new Date(activity.activity.deadline);
            localId = activity.localId;

            phaseHtml += this.renderActivity(activity, startDate, endDate);

            startDate = endDate;
            activity = this.getNextActivity(localId, phase.activities);
        }
        return phaseHtml;
    }

    getNextActivity(linkedActivityId, activities) {
        for (const activity of activities) {
            if (activity.linkedActivityId === linkedActivityId) {
                return activity;
            }
        }
        return null;
    }

    renderActivity(activity, startDate, endDate) {
        const startCol = this.dayDiff(this._timeslice.start, startDate) + 1 + this.INFO_COLS;
        const spanNum = this.dayDiff(startDate, endDate);
        this._row++;

        let info = `
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 1 / span 1">${activity.activity.title}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 2 / span 1">${activity.activity.participants.map((obj) => obj.username)}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 3 / span 1">${startDate.toLocaleString()}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 4 / span 1">${endDate.toLocaleString()}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 5 / span 1">${spanNum}</div>
        `;
        return info + `<div style="background: green; grid-row: ${this._row}; grid-column: ${startCol} / span ${spanNum}"></div>`;
    }

    getFirstActivity(phase) {
        for (const activity of phase.activities) {
            if (this.isFirstActivity(activity)) {
                return activity;
            }
        }
        return null;
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