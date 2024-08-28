import { fetchWithMiddleware, API_URL} from "./utilities.js";

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

document.addEventListener('DOMContentLoaded', () => {
    // check auth status
    const auth = JSON.parse(localStorage.getItem('auth') || null);
    if (!auth || !auth.isAuthenticated) {
        window.location.href = '/#/login';
    }

    if (auth.isAdmin) {
        document.getElementById("adminLink").classList.remove("hidden");
    }

    const ganttView = document.getElementById('ganttView');

    document.getElementById('visualType').value = auth.user.preferences?.projectsView || 'list';
    document.getElementById('visualType').addEventListener('change', (event) => {
        auth.user.preferences.projectsView = event.target.value;
        localStorage.setItem('auth', JSON.stringify(auth));
        fetchWithMiddleware(`${API_URL}/profile/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({projectsView: event.target.value})
        });
        if (event.target.value === 'gantt') {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
            showGantt(projects.find(project => project._id === projectSelector.value));
        } else {
            ganttView.classList.add('hidden');
            listView.classList.remove('hidden');
            showList(projects.find(project => project._id === projectSelector.value));
        }
    });
    auth.user.preferences?.projectsView === 'gantt' && ganttView.classList.remove('hidden');

    let showTooltip = false;
    const conditionalRenderElement = document.getElementById('dateConditionalRender');

    const dateInput = document.getElementById('selectedDate');
    const timeInput = document.getElementById('selectedTime');
    const timeMachineMessage = document.getElementById('timeMachineMessage');
    let timeDifference = JSON.parse(localStorage.getItem('date')).realTimeDiff || 0;

    const getTimeMachineDate = () => new Date(new Date().getTime() + timeDifference);

    const toggleTooltip = () => {
        showTooltip = !showTooltip;

        const date = getTimeMachineDate();
        dateInput.value = date.toISOString().split('T')[0];
        timeInput.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        timeMachineMessage.innerText = '';
        conditionalRenderElement.setAttribute('condition', showTooltip);
    };

    const resetDate = () => {
        fetchWithMiddleware(`${API_URL}/timeMachine/restoreGlobalClock/`, {
            method: 'POST'
        }).then(() => {
                const date = new Date();
                dateInput.value = date.toISOString().split('T')[0];
                timeInput.value = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                timeDifference = 0;
                timeMachineMessage.innerText = 'Time machine restored!'
                localStorage.setItem('date', JSON.stringify({
                    "currentDate": new Date().toISOString(),
                    "timeDiff": 0,
                    "realTimeDiff": 0
                }));
            }
        ).catch(
            () => timeMachineMessage.innerText = 'Error restoring time machine!'
        );
    };

    const setCurrentDate = () => {
        const newDate = new Date(dateInput.value);
        newDate.setHours(timeInput.value.split(':')[0]);
        newDate.setMinutes(timeInput.value.split(':')[1]);
        fetchWithMiddleware(`${API_URL}/timeMachine/setGlobalClock/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({date: newDate})
        }).then(() => {
            timeDifference = new Date().getTime() - newDate.getTime();
            timeMachineMessage.innerText = 'Time machine set!'
            localStorage.setItem('date', JSON.stringify({
                "currentDate": newDate.toISOString(),
                "timeDiff": 0,
                "realTimeDiff": timeDifference
            }));
        }).catch(
            () => timeMachineMessage.innerText = 'Error setting time machine!'
        );
    }

    const clickOutsideElement = document.getElementById('clickOutsideElement');
    clickOutsideElement.addEventListener('clickoutside', () => {
        showTooltip = false;
        conditionalRenderElement.setAttribute('condition', showTooltip);
    });

    document.getElementById('toggleDateTooltip').addEventListener('click', toggleTooltip);
    document.getElementById('setCurrentDate').addEventListener('click', setCurrentDate);
    document.getElementById('resetDate').addEventListener('click', resetDate);

    const projectModal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const projectForm = document.getElementById('projectForm');
    const projectTitle = document.getElementById('projectTitle');
    const actorsContainer = document.getElementById('actorsContainer');
    const addActorButton = document.getElementById('addActor');
    const phasesContainer = document.getElementById('phasesContainer');
    const addPhaseButton = document.getElementById('addPhase');
    const cancelButton = document.getElementById('cancelButton');
    const addProjectButton = document.getElementById('addProjectButton');

    let isEditing = false;
    let currentProjectId = null;

    const openModal = (project = null) => {
        if (project) {
            isEditing = true;
            currentProjectId = project._id;
            modalTitle.innerText = 'Edit Project';
            projectTitle.value = project.title;
            populateActors(project.actors);
            populatePhases(project.phases);
        } else {
            isEditing = false;
            currentProjectId = null;
            modalTitle.innerText = 'Add Project';
            projectForm.reset();
            actorsContainer.innerHTML = '';
            phasesContainer.innerHTML = '';
        }
        projectModal.show();
        //editActivityModal.show();
    };

    const closeModal = () => {
        projectModal.hide();
    };

    const addActor = () => {
        const actorDiv = document.createElement('div');
        actorDiv.classList.add('actor', 'flex', 'gap-x-1', 'items-center', 'mb-1');
        actorDiv.innerHTML = `
            <div class="flex gap-1">
            <input type="text" placeholder="Actor Username" class="actorUsername p-2 border border-gray-300 rounded-md" required>
            <button type="button" class="removeActorButton bg-red-500 text-white p-2 rounded-md"><i class="bi bi-x-lg"></i></button>
            </div>
        `;
        actorsContainer.appendChild(actorDiv);
        actorDiv.querySelector('.removeActorButton').addEventListener('click', () => removeActor(actorDiv));
    };

    const removeActor = (actorDiv) => {
        actorDiv.remove();
    };

    const populateActors = (actors) => {
        actorsContainer.innerHTML = '';
        actors.forEach(actor => {
            const actorDiv = document.createElement('div');
            actorDiv.classList.add('actor', 'flex', 'gap-1');
            actorDiv.innerHTML = `
                <input type="text" value="${actor}" class="actorUsername p-2 border border-gray-300 rounded-md" required>
                <button type="button" class="removeActorButton bg-red-500 text-white p-2 rounded-md"><i class="bi bi-x-lg"></i></button>
            `;
            actorsContainer.appendChild(actorDiv);
            actorDiv.querySelector('.removeActorButton').addEventListener('click', () => removeActor(actorDiv));
        });
    };

    const addPhase = () => {
        const phaseDiv = document.createElement('fieldset');
        phaseDiv.classList.add('phase', 'rounded', 'bg-gray-100', 'p-2', 'mt-2');
        phaseDiv.innerHTML = `
            <div class="flex w-full gap-2">
                <!--<button type="button" class="toggleActivitesVisButton" text-white"><i class="bi bi-chevron-down"></i></button>-->
                <input type="text" placeholder="Phase Title" class="flex-1 p-2 border border-gray-300 rounded-md" required>
                <button type="button" class="removePhaseButton bg-red-500 text-white p-2 rounded-md"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="activitiesContainer my-2"></div>
            <button type="button" class="addActivityButton bg-emerald-400 text-white p-2  rounded-md">Add Activity</button>
        `;
        phasesContainer.appendChild(phaseDiv);
        //phaseDiv.querySelector('.toggleActivitesVisButton').addEventListener('click', () => toggleActivitesVisualizations(phaseDiv));
        phaseDiv.querySelector('.addActivityButton').addEventListener('click', () => addActivity(phaseDiv));
        phaseDiv.querySelector('.removePhaseButton').addEventListener('click', () => removePhase(phaseDiv));
    };

    const removePhase = (phaseDiv) => {
        phaseDiv.remove();
    };

    /*
    const toggleActivitesVisualizations = (phaseDiv) => {
        const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
        activitiesContainer.classList.toggle('hidden');
        phaseDiv.querySelector('.addActivityButton').classList.toggle('hidden');

        if (activitiesContainer.classList.contains('hidden'))
            phaseDiv.querySelector('.toggleActivitesVisButton').style.transform = 'rotate(270deg)';
        else
            phaseDiv.querySelector('.toggleActivitesVisButton').style.transform = 'rotate(0deg)';
    };
    */

    const generateUniqueId = (phaseDiv) => {
        if (!phaseDiv.activityCounter) {
            phaseDiv.activityCounter = 0;
        }
        phaseDiv.activityCounter += 1;
        return phaseDiv.activityCounter;
    };

    const addLinkedActivityEventListener = (activityDiv) => {
        const linkedActivityIdSelect = activityDiv.querySelector('.linkedActivityId');
        const inputElement = activityDiv.querySelector('.input');
        linkedActivityIdSelect.addEventListener('change', () => {
            inputElement.disabled = linkedActivityIdSelect.value !== '';
            inputElement.value = linkedActivityIdSelect.value !== '' ? 'Output of #' + linkedActivityIdSelect.value : '';
        });
    }

    const updateLinkedActivities = (activitiesContainer, phaseDiv) => {
        activitiesContainer.querySelectorAll('.linkedActivityId').forEach(select => {
            const value = select.value;
            select.innerHTML = `
                <option value="">None</option>
                ${phaseDiv.activityIds.map(id => `<option value="${id}">${id}</option>`).join('')}
            `;
            select.value = value;
        });
    }

    const addActivity = (phaseDiv) => {
        //editActivityModal.show();

        const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
        const activityDiv = document.createElement('fieldset');
        const uniqueId = generateUniqueId(phaseDiv);

        // Store the unique ID in the phase-specific list
        if (!phaseDiv.activityIds) {
            phaseDiv.activityIds = [];
        }
        phaseDiv.activityIds.push(uniqueId);

        
        activityDiv.classList.add('activity', 'border-l-4', 'border-emerald-400', 'p-2', 'mt-4', 'flex', 'flex-col', 'gap-2', 'bg-emerald-50');
        activityDiv.innerHTML = `
        <div class="flex justify-between items-center w-full font-bold">
            <div class="flex gap-2"> 
                #${uniqueId} 
                <p class="activityTitle">Activity</p>
            </div>
            <div class="flex gap-1">
                <button type="button" class="editActivityButton bg-yellow-500 text-white px-2 py-1 rounded-md"><i class="bi bi-pencil-fill"></i></button>
                <button type="button" class="removeActivityButton bg-red-500 text-white px-2 py-1 rounded-md"><i class="bi bi-trash-fill"></i></button>
            </div>
        </div>
        <div class="flex gap-2 items-center justify-between">
            <label><input type="checkbox" class="isMilestone"> Milestone</label>
            <label>Status:
                <select class="status p-2 border border-gray-300 rounded-md" required>
                    <option value="NotStarted" selected>Not Started</option>
                    <option value="Started">Started</option>
                    <option value="Concluded">Concluded</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Abandoned">Abandoned</option>
                </select>
            </label>
            <label>Linked Activity:
                <select class="linkedActivityId p-2 border border-gray-300 rounded-md">
                    <option value="">None</option>
                    ${phaseDiv.activityIds.map(id => `<option value="${id}">${id}</option>`).join('')}
                </select>
            </label>
        </div>
        <div class="flex gap-1">
            <input type="text" placeholder="Input" class="flex-1 input p-2 border border-gray-300 rounded-md">
            <input type="text" placeholder="Output" class="flex-1 output p-2 border border-gray-300 rounded-md">
        </div>
        <input type="hidden" class="hidden" value="${uniqueId}"/>
    `;
        activitiesContainer.appendChild(activityDiv);
        activityDiv.querySelector('.editActivityButton').addEventListener('click', () => editActivity(activityDiv, phaseDiv));
        activityDiv.querySelector('.removeActivityButton').addEventListener('click', () => removeActivity(activityDiv, phaseDiv));
        
        openActivityModalForAdd(activityDiv, phaseDiv);

        addLinkedActivityEventListener(activityDiv);
        updateLinkedActivities(activitiesContainer, phaseDiv);  
    };

    const removeActivity = (activityDiv, phaseDiv) => {
        const uniqueId = Number(activityDiv.querySelector('input.hidden').value);
        phaseDiv.activityIds = phaseDiv.activityIds.filter(id => id !== uniqueId);
        activityDiv.remove();

        const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
        updateLinkedActivities(activitiesContainer, phaseDiv);
    };

    const populatePhases = (phases) => {
        phasesContainer.innerHTML = '';
        phases.forEach(phase => {
            const phaseDiv = document.createElement('fieldset');
            phaseDiv.classList.add('phase', 'rounded', 'bg-gray-100', 'p-2', 'mt-2');
            phaseDiv.innerHTML = `
            <div class="flex w-full gap-1 mt-2">
                <input type="text" value="${phase.title}" class="flex-1 p-2 border border-gray-300 rounded-md" required>
                <button type="button" class="removePhaseButton bg-red-500 text-white p-2 rounded-md"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="activitiesContainer my-2"></div>
            <button type="button" class="addActivityButton bg-emerald-400 text-white p-2 rounded-md">Add Activity</button>
        `;
            const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
            phase.activities.forEach(activity => {
                const activityDiv = document.createElement('fieldset');
                activityDiv.classList.add('activity', 'border-2', 'rounded', 'border-emerald-400', 'p-1', 'mt-2');
                activityDiv.innerHTML = `
                    ID:${activity.localId}
                    <input type="hidden" class="hidden" value="${activity.localId}"/>
                    <input type="checkbox" class="isMilestone" ${activity.isMilestone ? 'checked' : ''}> Milestone
                    <input type="text" value="${activity.input}" class="input p-2 border border-gray-300 rounded-md"  ${activity.linkedActivityId != null ? 'disabled' : ''}>
                    <input type="text" value="${activity.output}" class="output p-2 border border-gray-300 rounded-md">
                    <label>Linked Activity:
                    <select class="linkedActivityId p-2 border border-gray-300 rounded-md">
                        <option value="">None</option>
                        ${phase.activities.map(act => `<option value="${act.localId}" ${activity.linkedActivityId === act.localId ? 'selected' : ''}>${act.localId}</option>`).join('')}
                    </select>
                    </label>
                    <label>Status:
                    <select class="status p-2 border border-gray-300 rounded-md" required>
                        <option value="NotStarted">Not Started</option>
                        <option value="Started">Started</option>
                        <option value="Concluded">Concluded</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Abandoned">Abandoned</option>
                    </select>
                    </label>
                    <button type="button" class="editActivityButton bg-yellow-500 text-white p-2 rounded-md">Edit</button>
                    <button type="button" class="removeActivityButton bg-red-500 text-white p-2 rounded-md">Remove</button>
                `;
                activityDiv.querySelector('.status').value = activity.status;

                addLinkedActivityEventListener(activityDiv);

                activitiesContainer.appendChild(activityDiv);
                activityDiv.querySelector('.editActivityButton').addEventListener('click', () => editActivity(activityDiv, phaseDiv));
                activityDiv.querySelector('.removeActivityButton').addEventListener('click', () => removeActivity(activityDiv, phaseDiv));
            });
            phasesContainer.appendChild(phaseDiv);
            phaseDiv.querySelector('.addActivityButton').addEventListener('click', () => addActivity(phaseDiv));
            phaseDiv.querySelector('.removePhaseButton').addEventListener('click', () => removePhase(phaseDiv));
        });
    };

    const errorMessage = document.getElementById('errorMessage');

    const showError = (message) => {
        errorMessage.innerText = message;
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({block: 'center', behavior: 'smooth'});
    };

    const hideError = () => {
        errorMessage.innerText = '';
        errorMessage.classList.add('hidden');
    };

    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        hideError();
        const projectData = {
            owner: auth.user.username,
            actors: Array.from(actorsContainer.querySelectorAll('.actorUsername')).map(actorInput => actorInput.value),
            title: projectTitle.value,
            phases: Array.from(phasesContainer.querySelectorAll('.phase')).map(phaseDiv => ({
                title: phaseDiv.querySelector('input').value,
                activities: Array.from(phaseDiv.querySelectorAll('.activity')).map(activityDiv => ({
                    status: activityDiv.querySelector('.status').value, // Add status field
                    localId: activityDiv.querySelector('input.hidden').value,
                    isMilestone: activityDiv.querySelector('.isMilestone').checked,
                    input: activityDiv.querySelector('.input').value,
                    output: activityDiv.querySelector('.output').value,
                    linkedActivityId: activityDiv.querySelector('.linkedActivityId').value
                }))
            }))
        };

        if (isEditing) {
            fetchWithMiddleware(`${API_URL}/project/${currentProjectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            }).then(response => response.json()).then(data => {
                if (data.hasOwnProperty("error"))
                    showError(data.error);
                else {
                    projects[projects.findIndex(project => project._id === currentProjectId)] = data;
                    showProjects();
                    closeModal();
                }
            })
            console.log('Updating project:', currentProjectId, projectData);
        } else {
            fetchWithMiddleware(`${API_URL}/project/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            }).then(response => response.json()).then(data => {
                if (data.hasOwnProperty("error"))
                    showError(data.error);
                else {
                    projects.push(data);
                    showProjects();
                    closeModal();
                }
            })
            console.log('Adding new project:', projectData);
        }
    });

    addActorButton.addEventListener('click', addActor);
    addPhaseButton.addEventListener('click', addPhase);
    cancelButton.addEventListener('click', closeModal);
    addProjectButton.addEventListener('click', () => openModal());

    let projects = [];
    const projectSelector = document.querySelector('#selectedProject');

    const showProjects = () => {
        const value = projectSelector.value;
        projectSelector.innerHTML = `
            ${projects.map(project => `<option value="${project._id}">${project.title}</option>`).join('')}
        `;
        projectSelector.value = value;
    }

    projectSelector.addEventListener('change', () => {
        const project = projects.find(project => project.id === projectSelector.value);
        auth.user.preferences.projectsView === 'gantt' ? showGantt(project) : showList(project);
    });

    const listView = document.getElementById('listView');

    const getStatusFromActivity = (activity) => {
        let status;
        if (activity.input === "") {
            status = "Non attivabile";
        } else if (activity.status === "NotStarted") {
            status = "Attivabile";
        } else if (activity.status === "Rejected") {
            status = "Riattivata";
        } else if (activity.status === "Abandoned" || getTimeMachineDate(new Date().setDate(new Date().getDate() + 2 * 7)) > activity.activity?.deadline) {
            status = "Abbandonata";
        } else if (activity.activity?.deadline < getTimeMachineDate(new Date()) && (activity.output === "" || activity.status !== "Concluded")) {
            status = "In ritardo";
        } else if (activity.status === "Concluded" && activity.output !== "") {
            status = "Conclusa";
        } else {
            status = "Attiva";
        }
        return status;
    }
    
    const showGantt = (project) => {
        console.log('Showing gantt:', project);
        const gantt = document.querySelector("gantt-component");
        gantt.project = project;
    };

    const showList = (project) => {
        listView.innerHTML = '';

        const activities = project.phases.flatMap(phase =>
            phase.activities.map(activity => ({
                ...activity,
                phaseTitle: phase.title
            }))
        );

        activities.sort((a, b) => {
            const dateA = new Date(a.activity.deadline);
            const dateB = new Date(b.activity.deadline);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return a.activity.participants.map(participant => participant.username).includes(auth.user.username) ? -1 : 1;
        });

        const activityList = activities.map(activity => {
            const status = getStatusFromActivity(activity);
            return `
        <li class="activity-item border p-4 mb-4 rounded-lg shadow-lg">
            <div><strong>Phase:</strong> ${activity.phaseTitle}</div>
            <div><strong>Title:</strong>${activity.activity?.title}</div> 
            <div><strong>Actor:</strong> ${activity.activity?.participants.map(participant => participant.username).join('')}</div>
            <div><strong>Starting Date:</strong> ${new Date(activity.activity?.start).toLocaleDateString()}</div>
            <div><strong>Ending Date:</strong> ${new Date(activity.activity?.deadline).toLocaleDateString()}</div>
            <div><strong>Status:</strong> ${status}</div>
            <div><strong>Input:</strong> ${activity.input}</div>
            <div><strong>Output:</strong> ${activity.output}</div>
            <button type="button" class="edit-activity-button bg-yellow-500 text-white p-2 rounded-md" data-activity-id="${activity.activityId}">Edit</button>
        </li>
    `
        }).join('');

        listView.innerHTML = `
            <div class="inline-flex items-center mb-2">Project: <h3 class="text-2xl p-2">${project.title}</h3><button type="button" class="edit-project-button bg-emerald-500 text-white p-2 rounded-md">Edit Project</button></div>
            <ul class="activity-list list-none p-0">${activityList}</ul>`;

        document.querySelector('.edit-project-button').addEventListener('click', () => openModal(project));

        document.querySelectorAll('.edit-activity-button').forEach(button => {
            button.addEventListener('click', (event) => {
                openEditActivityModal(activities.find(activity => activity.activityId === event.target.dataset.activityId));
            });
        });
    };

    const editActivityModal = document.getElementById('editActivityModal');
    const editActivityForm = document.getElementById('editActivityForm');
    const editErrorMessage = document.getElementById('editErrorMessage');
    const editActivityId = document.getElementById('editActivityId');
    const editMilestone = document.getElementById('editMilestone');
    const editStatus = document.getElementById('editStatus');
    const editInput = document.getElementById('editInput');
    const editOutput = document.getElementById('editOutput');
    const editActivityTitle = document.getElementById('editTitle');
    const editStartDate = document.getElementById('editStartDate');
    const editEndDate = document.getElementById('editEndDate');
    const editNotifyOS = document.getElementById('editNotifyOS');
    const editNotifyEmail = document.getElementById('editNotifyEmail');
    const editRepeatNotify = document.getElementById('editRepeatNotify');
    const addActivityParticipantButton = document.getElementById('addActivityParticipantButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const participantsContainer = editActivityModal.querySelector('#actParticipantsContainer');
    const usernameInput = editActivityModal.querySelector('#actNewParticipantUsername');

    /*
    const openEditActivityModal = (activity) => {
        editActivityId.value = activity.activityId;
        editInput.value = activity.input;
        editOutput.value = activity.output;
        editStatus.value = activity.status;
        editActivityModal.show();
    };
    */

    let modifyingActivity = false; // whether the activity is being modified or created
    let selectedActivityDiv = null;
    let selectedPhaseDiv = null;

    const editActivity = (activityDiv, phaseDiv) => {
        selectedActivityDiv = activityDiv;
        selectedPhaseDiv = phaseDiv;

        modifyingActivity = true;

        // populate the edit form with the activity data
        editActivityTitle.value = activityDiv.activity.title;
        editStartDate.value = activityDiv.activity.start.toISOString().split('T')[0];
        editEndDate.value = activityDiv.activity.deadline.toISOString().split('T')[0];
        editNotifyOS.checked = activityDiv.activity.notification.methods.includes('os');
        editNotifyEmail.checked = activityDiv.activity.notification.methods.includes('email');
        editRepeatNotify.value = activityDiv.activity.notification.repeat;

        // populate the participants list
        participantsContainer.innerHTML = '';
        activityDiv.activity.participants.forEach(participant => {
            usernameInput.value = participant.username;
            addActivityParticipantButton.click(); 
        });
        editActivityModal.show();
    };

    const openActivityModalForAdd = (activityDiv, phaseDiv) => {
        selectedActivityDiv = activityDiv;
        selectedPhaseDiv = phaseDiv;
        modifyingActivity = false;
        editActivityModal.show();
    };

    const cancelEditActivity = () => {
        if(!modifyingActivity) {
            // an adding operation was interrupted
            selectedActivityDiv.remove();
            selectedPhaseDiv.activityIds.pop();
            selectedPhaseDiv.activityCounter -= 1;
        }
        selectedActivityDiv = null;
        selectedPhaseDiv = null;

        closeEditActivityModal();
    };

    editActivityForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const newActivity = {};
        newActivity.title = editActivityTitle.value;
        newActivity.start = new Date(editStartDate.value);
        newActivity.deadline = new Date(editEndDate.value);
        newActivity.notification = {
            methods: [],
            repeat: editRepeatNotify.value
        };
        if(editNotifyOS.checked) {
            newActivity.notification.methods.push('os');
        }
        if(editNotifyEmail.checked) {
            newActivity.notification.methods.push('email');
        }
        // TODO: fix to add status
        newActivity.participants = Array.from(participantsContainer.querySelectorAll('.participant')).map(participantDiv => ({ username: participantDiv.querySelector('.username').innerText }));

        selectedActivityDiv.querySelector('.activityTitle').innerText = editActivityTitle.value;
        selectedActivityDiv.activity = newActivity;

        selectedActivityDiv = null;
        selectedPhaseDiv = null;

        closeEditActivityModal();
    });

    const closeEditActivityModal = () => {
        editActivityForm.reset();
        participantsContainer.innerHTML = '';
        modifyingActivity = false;
        editActivityModal.hide();
    };

    addActivityParticipantButton.addEventListener('click', () => {
        if (usernameInput.value !== '') {
            const newParticipant = document.createElement('div');
            newParticipant.classList.add('participant', 'flex', 'gap-x-1', 'items-center', 'p-1', 'rounded-md', 'text-white', 'bg-blue-400');
            newParticipant.innerHTML = `
            <p class="username">${usernameInput.value}</p>
            <button type="button" class="removeParticipantButton"><i class="bi bi-x-lg"></i></button>
            `;
            participantsContainer.appendChild(newParticipant);
            newParticipant.querySelector('.removeParticipantButton').addEventListener('click', () => newParticipant.remove());
            usernameInput.value = '';
        }
    });



    /*
    editActivityForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const updatedActivity = {
            activityId: editActivityId.value,
            input: editInput.value,
            output: editOutput.value,
            status: editStatus.value
        };
        let project = projects.find(project => project._id === projectSelector.value);
        fetchWithMiddleware(`${API_URL}/project/${project._id}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedActivity)
        }).then(response => response.json()).then(data => {
            if (data.hasOwnProperty("error"))
                editErrorMessage.innerText = data.error;
            else {
                project = data;
                showList(project);
            }
        });
        closeEditActivityModal();
    });
    */

    cancelEditButton.addEventListener('click', cancelEditActivity);

    fetchWithMiddleware(`${API_URL}/project/all`, {}).then(response => response.json()).then(data => {
        projects = data;
        showProjects();
        projectSelector.selectedIndex = 0;
        auth.user.preferences.projectsView === 'gantt' ? showGantt(projects[0]) : showList(projects[0]);
    });
});

