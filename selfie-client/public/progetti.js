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
        const ganttView = document.getElementById('ganttView');
        const listView = document.getElementById('listView');
        if (event.target.value === 'gantt') {
            ganttView.classList.remove('hidden');
            listView.classList.add('hidden');
        } else {
            ganttView.classList.add('hidden');
            listView.classList.remove('hidden');
        }
    });

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
            currentProjectId = project.id;
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
    };

    const closeModal = () => {
        projectModal.hide();
    };


    const addActor = () => {
        const actorDiv = document.createElement('div');
        actorDiv.classList.add('actor', 'flex', 'gap-x-1', 'items-center', 'mb-1');
        actorDiv.innerHTML = `
            <input type="text" placeholder="Actor Username" class="actorUsername p-2 border border-gray-300 rounded-md" required>
            <button type="button" class="removeActorButton bg-red-500 text-white p-2 rounded-md">Remove</button>
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
            actorDiv.classList.add('actor', 'flex', 'gap-x-1', 'items-center', 'mb-1');
            actorDiv.innerHTML = `
                <input type="text" value="${actor}" class="actorUsername p-2 border border-gray-300 rounded-md" required>
                <button type="button" class="removeActorButton bg-red-500 text-white p-2 rounded-md">Remove</button>
            `;
            actorsContainer.appendChild(actorDiv);
            actorDiv.querySelector('.removeActorButton').addEventListener('click', () => removeActor(actorDiv));
        });
    };

    const addPhase = () => {
        const phaseDiv = document.createElement('fieldset');
        phaseDiv.classList.add('phase', 'border-2', 'rounded', 'border-emerald-800', 'p-1', 'mt-2');
        phaseDiv.innerHTML = `
            <input type="text" placeholder="Phase Title" class="p-2 mt-2 border border-gray-300 rounded-md" required>
            <div class="activitiesContainer my-2"></div>
            <button type="button" class="addActivityButton bg-emerald-600 text-white p-2  rounded-md">Add Activity</button>
            <button type="button" class="removePhaseButton bg-red-500 text-white p-2 rounded-md">Remove Phase</button>
        `;
        phasesContainer.appendChild(phaseDiv);
        phaseDiv.querySelector('.addActivityButton').addEventListener('click', () => addActivity(phaseDiv));
        phaseDiv.querySelector('.removePhaseButton').addEventListener('click', () => removePhase(phaseDiv));
    };

    const removePhase = (phaseDiv) => {
        phaseDiv.remove();
    };

    const editActivity = (activityDiv) => {
        // Logic to edit activity
        console.log('Editing activity:', activityDiv);
    };

    const generateUniqueId = (phaseDiv) => {
        if (!phaseDiv.activityCounter) {
            phaseDiv.activityCounter = 0;
        }
        phaseDiv.activityCounter += 1;
        return phaseDiv.activityCounter;
    };

    const addActivity = (phaseDiv) => {
        const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
        const activityDiv = document.createElement('fieldset');
        const uniqueId = generateUniqueId(phaseDiv);

        // Store the unique ID in the phase-specific list
        if (!phaseDiv.activityIds) {
            phaseDiv.activityIds = [];
        }
        phaseDiv.activityIds.push(uniqueId);

        activityDiv.classList.add('activity', 'border-2', 'rounded', 'border-emerald-400', 'p-1', 'mt-2');
        activityDiv.innerHTML = `
        ID:${uniqueId}
        <input type="hidden" class="hidden" value="${uniqueId}"/>
        <input type="checkbox" class="isMilestone"> Milestone
        <input type="text" placeholder="Input" class="input p-2 border border-gray-300 rounded-md">
        <input type="text" placeholder="Output" class="output p-2 border border-gray-300 rounded-md">
        <select class="linkedActivityId p-2 border border-gray-300 rounded-md">
            <option value="">None</option>
            ${phaseDiv.activityIds.map(id => `<option value="${id}">${id}</option>`).join('')}
        </select>
        <button type="button" class="editActivityButton bg-yellow-500 text-white p-2 rounded-md">Edit</button>
        <button type="button" class="removeActivityButton bg-red-500 text-white p-2 rounded-md">Remove</button>
    `;
        activitiesContainer.appendChild(activityDiv);
        activityDiv.querySelector('.editActivityButton').addEventListener('click', () => editActivity(activityDiv));
        activityDiv.querySelector('.removeActivityButton').addEventListener('click', () => removeActivity(activityDiv, phaseDiv));

        // Add event listener to linkedActivityId select element
        const linkedActivityIdSelect = activityDiv.querySelector('.linkedActivityId');
        const inputElement = activityDiv.querySelector('.input');
        linkedActivityIdSelect.addEventListener('change', () => {
            inputElement.disabled = linkedActivityIdSelect.value !== '';
            inputElement.value = linkedActivityIdSelect.value !== '' ? 'Output of ' + linkedActivityIdSelect.value : '';
        });

        // Update all linkedActivityId dropdowns within the same phase
        activitiesContainer.querySelectorAll('.linkedActivityId').forEach(select => {
            select.innerHTML = `
            <option value="">None</option>
            ${phaseDiv.activityIds.map(id => `<option value="${id}">${id}</option>`).join('')}
        `;
        });
    };

    const removeActivity = (activityDiv, phaseDiv) => {
        const uniqueId = Number(activityDiv.querySelector('input.hidden').value);
        phaseDiv.activityIds = phaseDiv.activityIds.filter(id => id !== uniqueId);
        activityDiv.remove();

        // Update all linkedActivityId dropdowns within the same phase
        const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
        activitiesContainer.querySelectorAll('.linkedActivityId').forEach(select => {
            select.innerHTML = `
            <option value="">None</option>
            ${phaseDiv.activityIds.map(id => `<option value="${id}">${id}</option>`).join('')}
        `;
        });
    };

    const populatePhases = (phases) => {
        phasesContainer.innerHTML = '';
        phases.forEach(phase => {
            const phaseDiv = document.createElement('fieldset');
            phaseDiv.classList.add('phase', 'border-2', 'rounded', 'border-emerald-800', 'p-1', 'mt-2');
            phaseDiv.innerHTML = `
            <input type="text" value="${phase.title}" class="p-2 mt-2 border border-gray-300 rounded-md" required>
            <div class="activitiesContainer my-2"></div>
            <button type="button" class="addActivityButton bg-emerald-400 text-white p-2 rounded-md">Add Activity</button>
            <button type="button" class="removePhaseButton bg-red-500 text-white p-2 rounded-md">Remove Phase</button>
        `;
            const activitiesContainer = phaseDiv.querySelector('.activitiesContainer');
            phaseDiv.activityIds = [];
            phaseDiv.activityCounter = 0;
            phase.activities.forEach(activity => {
                const activityDiv = document.createElement('fieldset');
                const uniqueId = generateUniqueId(phaseDiv);
                phaseDiv.activityIds.push(uniqueId);
                activityDiv.classList.add('activity', 'border-2', 'rounded', 'border-emerald-400', 'p-1', 'mt-2');
                activityDiv.innerHTML = `
                    ID:${uniqueId}
                    <input type="hidden" class="hidden" value="${uniqueId}"/>
                    <input type="checkbox" class="isMilestone" ${activity.isMilestone ? 'checked' : ''}> Milestone
                    <input type="text" value="${activity.input}" class="input p-2 border border-gray-300 rounded-md">
                    <input type="text" value="${activity.output}" class="output p-2 border border-gray-300 rounded-md">
                    <select class="linkedActivityId p-2 border border-gray-300 rounded-md">
                        <option value="">None</option>
                        ${phaseDiv.activityIds.map(id => `<option value="${id}" ${activity.linkedActivityId === id ? 'selected' : ''}>${id}</option>`).join('')}
                    </select>
                    <button type="button" class="editActivityButton bg-yellow-500 text-white p-2 rounded-md">Edit</button>
                    <button type="button" class="removeActivityButton bg-red-500 text-white p-2 rounded-md">Remove</button>
                `;

                // Add event listener to linkedActivityId select element
                const linkedActivityIdSelect = activityDiv.querySelector('.linkedActivityId');
                const inputElement = activityDiv.querySelector('.input');
                linkedActivityIdSelect.addEventListener('change', () => {
                    inputElement.disabled = linkedActivityIdSelect.value !== '';
                    inputElement.value = linkedActivityIdSelect.value !== '' ? 'Output of ' + linkedActivityIdSelect.value : '';
                });

                activitiesContainer.appendChild(activityDiv);
                activityDiv.querySelector('.editActivityButton').addEventListener('click', () => editActivity(activityDiv));
                activityDiv.querySelector('.removeActivityButton').addEventListener('click', () => removeActivity(activityDiv, phaseDiv));
            });
            phasesContainer.appendChild(phaseDiv);
            phaseDiv.querySelector('.addActivityButton').addEventListener('click', () => addActivity(phaseDiv));
            phaseDiv.querySelector('.removePhaseButton').addEventListener('click', () => removePhase(phaseDiv));
        });
    };

    projectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const projectData = {
            owner: auth.user.username,
            title: projectTitle.value,
            phases: Array.from(phasesContainer.querySelectorAll('.phase')).map(phaseDiv => ({
                title: phaseDiv.querySelector('input').value,
                activities: Array.from(phaseDiv.querySelectorAll('.activity')).map(activityDiv => ({
                    localId: activityDiv.querySelector('input.hidden').value,
                    isMilestone: activityDiv.querySelector('.isMilestone').checked,
                    input: activityDiv.querySelector('.input').value,
                    output: activityDiv.querySelector('.output').value,
                    linkedActivityId: activityDiv.querySelector('.linkedActivityId').value
                }))
            }))
        };

        if (isEditing) {
            // Update project logic here
            console.log('Updating project:', currentProjectId, projectData);
        } else {
            // Add project logic here
            console.log('Adding new project:', projectData);
        }

        closeModal();
    });

    addActorButton.addEventListener('click', addActor);
    addPhaseButton.addEventListener('click', addPhase);
    cancelButton.addEventListener('click', closeModal);
    addProjectButton.addEventListener('click', () => openModal());
});

const API_URL = "http://localhost:3000";

const forceLogout = () => {
    localStorage.removeItem('auth');
    window.location.href = '/#/login';
}

async function fetchWithMiddleware(url, options) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });
    if (response.status === 401) {
        forceLogout();
    }
    return response;
}

const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await registration?.unregister();
    await fetchWithMiddleware(`${API_URL}/notification/unsubscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({endpoint: subscription?.endpoint})
    });
}

const logout = async () => {
    await unsubscribe();
    await fetchWithMiddleware(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}