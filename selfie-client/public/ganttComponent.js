class GanttComponent extends HTMLElement {
    constructor() {
        super();
        this._project = {};
        this._untoachedProject = {};
        this._now = {};
        this.myStyle = document.createElement('style');
        this.content = document.createElement('div');
        this._row = 1;
        this._timeslice = {start: null, end: null};

        this.INFO_COLS = 6;
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
            <link rel="stylesheet" href="tailwind.css" >
            <h1 class="font-bold text-3xl text-center">Gantt chart</h1>
            ${this.renderHeading()}
            ${this.renderGantt()}
            <!-- Color legend -->
            ${this.renderColorLegend()}
        </div>
        `
    }

    renderHeading() {
        if (!this._project) {
            return '';
        }
        return `
        <div class="text-xl font-bold">
            <h1>Project: ${this._project.title}</h1>
            <p>Owner: ${this._project.owner}</p>
            <p>Actors: ${this._project.actors}</p>
        </div>
        `
    }

    renderGantt() {
        const [infobar, bar] = this.renderBar();
        const [info, phases] = this.renderPhases();

        return `
        <div>
            
            <div style="display: grid; grid-template-columns: auto 1fr;">
                <div class="infogrid" style="grid-column: 1;">
                    <div style="display: grid; grid-template-columns: repeat(${this.INFO_COLS}, auto);">
                        <div style="grid-row: 1;"></div>
                        <div style="grid-row: 2;"></div>
                        ${infobar}
                        ${info}
                    </div>
                </div>
                <div style="grid-column: 2; overflow-x: scroll;">
                    <div class="gantt">
                        <!-- bar -->
                        ${bar}
 
                        <!-- TASKS -->
                        ${phases}
                    </div>
                </div>
            </div>
        </div>
        `
    }

    set project([project, now]) {
        this._project = project;
        this._untoachedProject = structuredClone(project);
        this._now = now;
        this._timeslice = this.getTimeSlice(this._project);

        this.adjustActivityDeadline();
        this.render();
    }

    adjustActivityDeadline() {
        let now = this._now;

        for (const phase of this._project.phases) {
            for (const activity of phase.activities) {
                if (!activity.isMilestone) {
                    if (['NotStarted', 'Started', 'Rejected'].includes(activity.status)) { // is affected by time translation
                        if (activity.activity.deadline.getTime() < now.getTime()) {
                            if (now.getTime() > this._timeslice.end.getTime()) {
                                this._timeslice.end = now;
                            }
                            const increment = now.getTime() - activity.activity.deadline.getTime();
                            activity.activity.deadline = now;

                            this.adjustActivityDeadLineRecursive(activity, phase.activities, increment);
                        }
                    }
                }
            }
        }
    }

    adjustActivityDeadLineRecursive(activity, activities, increment) {
        if (!activity) {
            return;
        }

        for (const linkedActivity of this.getAllLinkedActivitiesToAnActivity(activity, activities)) {
            if (!linkedActivity.isMilestone) {
                const newEnd = new Date(linkedActivity.activity.deadline.getTime() + increment);

                if (newEnd.getTime() > this._timeslice.end.getTime()) {
                    this._timeslice.end = newEnd;
                }

                linkedActivity.activity.deadline = newEnd;
            }
            this.adjustActivityDeadLineRecursive(linkedActivity, activities, increment);
        }
    }


    SECOND = 1000;
    MINUTE = 60 * this.SECOND;
    HOUR = 60 * this.MINUTE;
    DAY = 24 * this.HOUR;
    dayDiff(d1, d2) {
        return Math.ceil((d2 - d1) / this.DAY);
    }

    nextDay(date) {
        return new Date(date.getTime() + this.DAY);
    }

    numToMonth(num) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthNames[num];
    }

    renderBar() {
        const timeSlice = this._timeslice;
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;
        this.myStyle.textContent = `
        .gantt {
            display: grid;
            grid-template-columns: repeat(${numOfCol}, minmax(2em, 1fr));
            overflow-x: scroll;
        }

        .gantt div { 
            padding: 2px; 
            white-space: nowrap;
            min-height: 2em;
        }
        
        .infogrid div { 
            padding-left: 2px; 
            padding-right: 2px; 
            white-space: nowrap;
            min-height: 2em;
        }

        .head {
            text-align: center;
            font-weight: 700;
            color: #fff;
            background: #103a99;
            white-space: nowrap;
        }
        
        .gantt .head + .head {
            border-left:2px solid white;
        }
        
        .infogrid .head + .head {
            border-left:2px solid white;
        }
        
        .gantt .head:first-child {
            border-left: 2px solid white;
        }
        `;
        let bar = '';
        bar += this.renderYears();
        this._row++;
        bar += this.renderMonths();
        this._row++;
        const infobar = this.renderInfo();
        bar += this.renderDays();
        return [infobar, bar];
    }

    renderYears() {
        const timeSlice = this._timeslice;
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;
        let dateCol = timeSlice.start;
        let years = '';

        let year = dateCol.getFullYear();
        let savedI = 1;

        for (let i = 1; i <= numOfCol; i++) {
            if (dateCol.getFullYear() !== year) {
                years += `<div class="head" style="grid-row: ${this._row}; grid-column: ${savedI} / span ${i - savedI}; ${(year === this._now.getFullYear())? 'background-color: dodgerblue;' : ''}">${year}</div>`;
                year = dateCol.getFullYear();
                savedI = i;
            }
            dateCol = this.nextDay(dateCol);
        }
        if (savedI < numOfCol) {
            years += `<div class="head" style="grid-row: ${this._row}; grid-column: ${savedI} / span ${numOfCol - savedI + 1}; ${(year === this._now.getFullYear())? 'background-color: dodgerblue;' : ''}">${timeSlice.end.getFullYear()}</div>`;
        }
        return years;
    }

    renderMonths() {
        const timeSlice = this._timeslice;
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;
        let dateCol = timeSlice.start;
        let months = '';

        let month = dateCol.getMonth();
        let savedI = 1;

        for (let i = 1; i <= numOfCol; i++) {
            if (dateCol.getMonth() !== month) {
                months += `<div class="head" style="grid-row: ${this._row}; grid-column: ${savedI} / span ${i - savedI}; ${(dateCol.getFullYear() === this._now.getFullYear() && month === this._now.getMonth())? 'background-color: dodgerblue;' : ''}">${this.numToMonth(month)}</div>`;
                month = dateCol.getMonth();
                savedI = i;
            }
            dateCol = this.nextDay(dateCol);
        }
        if (savedI < numOfCol) {
            months += `<div class="head" style="grid-row: ${this._row}; grid-column: ${savedI} / span ${numOfCol - savedI + 1}; ${(dateCol.getFullYear() === this._now.getFullYear() && month === this._now.getMonth())? 'background-color: dodgerblue;' : ''}">${this.numToMonth(timeSlice.end.getMonth())}</div>`;
        }
        return months;
    }

    renderInfo() {
        let info = '';
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 1">Phases and activities</div>`;
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 2">Actors</div>`;
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 3">Start</div>`;
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 4">End</div>`;
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 5">gg</div>`;
        info += `<div class="head" style="grid-row: ${this._row}; grid-column: 6">Status</div>`;
        return info;
    }

    legendBlock(style, text) {
        return `<div class="head" style="color: white; width: 150px; padding: 3px;${style}"><p>${text}</p></div>`;
    }

    renderColorLegend() {
        return `
        <div style="display: flex; flex-direction: row; gap: 1em; margin-top: 50px; flex-wrap: wrap" id="color-legend">
            ${this.legendBlock('background-color: gray; border-right: 1rem solid red;', 'Milestone')}
            ${this.legendBlock('background-color: gray; border: white 3px dashed;', 'Delayed')}
            ${this.legendBlock('background-color: gray;', 'Not started')}
            ${this.legendBlock('background-color: SpringGreen;', 'Started')}
            ${this.legendBlock('background-color: green;', 'Concluded')}
            ${this.legendBlock('background-color: OrangeRed;', 'Rejected')}
            ${this.legendBlock('background-color: black;', 'Abandoned')}
        </div>
        `
    }

    renderDays() {
        const timeSlice = this._timeslice;
        const numOfCol = this.dayDiff(timeSlice.start, timeSlice.end) + 1;
        let dateCol = timeSlice.start;
        let days = '';
        for (let i = 1; i <= numOfCol; i++) {
            days += `<div class="head" style="grid-row: ${this._row}; grid-column: ${i}; ${(dateCol.toLocaleDateString() === this._now.toLocaleDateString())? 'background-color: yellow; color: black' : ''}"><span class="day">${dateCol.getDate()}</span></div>`;
            dateCol = this.nextDay(dateCol);
        }
        return days;
    }

    renderPhases() {
        let phasesHtml = '';
        let infoHtml = '';
        for (const phase of this._project.phases) {
            this._row++;
            infoHtml += `<div style="grid-row: ${this._row}; grid-column: 1 / span ${this.INFO_COLS}; font-weight: bold">${phase.title}</div>`;
            phasesHtml += `<div style="grid-row: ${this._row}; grid-column: 1;"></div>`;
            const [i, p] = this.renderPhase(phase);
            infoHtml += i;
            phasesHtml += p;
        }
        return [infoHtml, phasesHtml];
    }

    renderPhase(phase) {
        let phaseHtml = '';
        let infoHtml = '';
        if (phase.activities.length <= 0) {
            return phaseHtml;
        }
        for (const unlikedActivity of this.getAllUnlinkedActivities(phase.activities)) {
            const [i, p] = this.convolutedRender(unlikedActivity, phase.activities);
            phaseHtml += p;
            infoHtml += i;
        }
        return [infoHtml, phaseHtml];
    }

    convolutedRender(activity, activities) {
        if (!activity) { // base case END
            return '';
        }

        // if activity exists render it
        const [startDate, endDate] = this.getStartEndDates(activity, activities);
        let [info, phase] = this.renderActivity(activity, startDate, endDate);

        // recursively walk through linked activities
        for (const linkedActivity of this.getAllLinkedActivitiesToAnActivity(activity, activities)) {
            const [i, p] = this.convolutedRender(linkedActivity, activities);
            info += i;
            phase += p;
        }
        return [info, phase];
    }

    getStartEndDates(activity, activities) {
        let prevActivity = this.getPrevActivity(activity, activities);

        let startDate = null;
        if (activity.linkedActivityId) {
            startDate = prevActivity.activity.deadline;
        }
        else if (activity.activity.start.getTime() !== Date.parse("Thu Jan 01 1970 01:00:00 GMT+0100")) {
            startDate = activity.activity.start;
        }
        else {
            startDate = this._timeslice.start;
        }

        let endDate = activity.activity.deadline;


        return [startDate, endDate];
    }

    getPrevActivity(activity, activities) {
        for (const a of activities) {
            if (a.localId === activity.linkedActivityId) {
                return a;
            }
        }
        return null;
    }

    getStartColSpanNum(startDate, endDate) {
        const startCol = this.dayDiff(this._timeslice.start, startDate) + 1;
        const spanNum = this.dayDiff(startDate, endDate);
        return [startCol, spanNum];
    }

    renderActivity(activity, startDate, endDate) {
        const oldEndDate = this.getActivitybyId(activity.activity._id, this._untoachedProject).activity.deadline;
        this._row++;

        let [rstartcol, rspannum] = this.getStartColSpanNum(startDate, endDate);
        let colorStyle = '';
        // ['NotStarted', 'Started', 'Concluded', 'Rejected', 'Abandoned']
        switch (activity.status) {
            case 'NotStarted':
                colorStyle = 'background-color: gray;';
                break;
            case 'Started':
                colorStyle = 'background-color: SpringGreen;';
                break;
            case 'Concluded':
                colorStyle = 'background-color: green;';
                break;
            case 'Rejected':
                colorStyle = 'background-color: OrangeRed;';
                break;
            case 'Abandoned':
                colorStyle = 'background-color: black;';
                break;
            default:
                colorStyle = 'background-color: green;';
        }

        if (activity.isMilestone) {
            colorStyle += 'border-right: 1rem solid red;'
        }

        const infoHtml = `
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 1 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${activity.activity.title}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 2 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${activity.activity.participants.map((obj) => obj.username)}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 3 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${startDate.toLocaleDateString()}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 4 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${endDate.toLocaleDateString()}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 5 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${rspannum}</div>
        <div class="activity-info" style="grid-row: ${this._row}; grid-column: 6 / span 1; ${(activity.isMilestone)? 'color: red;' : ''}">${(activity.status === 'NotStarted')? 'Not started' : activity.status}</div>
        `;
        let activityHtml = '';

        if (oldEndDate.getTime() < endDate.getTime()) {
            // old part
            let [startCol, spanNum] = this.getStartColSpanNum(startDate, oldEndDate);
            if (spanNum > 0) {
                activityHtml += `<div class="" style="${colorStyle} grid-row: ${this._row}; grid-column: ${startCol} / span ${spanNum}"></div>`;
                [startCol, spanNum] = this.getStartColSpanNum(oldEndDate, endDate);
                if (spanNum > 0) {
                    activityHtml += `<div class="" style="${colorStyle}; border: white 3px dashed; grid-row: ${this._row}; grid-column: ${startCol} / span ${spanNum}"></div>`;
                }
            } else {
                [startCol, spanNum] = this.getStartColSpanNum(startDate, endDate);
                activityHtml += `<div class="" style="${colorStyle}; border: white 3px dashed; grid-row: ${this._row}; grid-column: ${startCol} / span ${spanNum}"></div>`;
            }
        }
        else {
            let [startCol, spanNum] = this.getStartColSpanNum(startDate, endDate);
            activityHtml += `<div class="" style="${colorStyle} grid-row: ${this._row}; grid-column: ${startCol} / span ${spanNum}"></div>`;
        }

        return [infoHtml, activityHtml];
    }

    getAllUnlinkedActivities(activities) {
        let unlinkedActivities = [];
        for (const activity of activities) {
            if (activity.linkedActivityId === null) {
                unlinkedActivities.push(activity);
            }
        }
        return unlinkedActivities;
    }

    getAllLinkedActivitiesToAnActivity(activity, activities) {
        let linkedActivities = [];
        for (const a of activities) {
            if (a.linkedActivityId === activity.localId) {
                linkedActivities.push(a);
            }
        }
        return linkedActivities;
    }

    getActivitybyId(id, project) {
        for (const phase of project.phases) {
            for (const a of phase.activities) {
                if (id === a.activity._id) {
                    return a;
                }
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