<template>
    <div class="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-[600px]" @click.stop v-click-outside="closeForm">
        <div class="flex justify-end">
            <button @click="closeForm">
                <v-icon name="md-close" />
            </button>
        </div>
        <form class="flex flex-col" @submit="handleSubmit">
            <div>
                <label><input type="text" placeholder="Untitled Activity" required class="w-full"
                        v-model="newActivity.title" :disabled="!modificationAllowed"></label>
            </div>
            <hr>
            <div class="mb-2">
                <label><input type="checkbox" v-model="newActivity.done" :disabled="!modificationAllowed"> Completed </label><br>
            </div>
            <div>
                <div class="flex items-center justify-between w-full gap-4" v-if="activity.start">
                    <label> Start </label>
                    <div class="flex gap-1">
                        <input type="date" v-model="formattedStartDate" :disabled="!modificationAllowed">
                    </div>
                </div>
                <div class="flex items-center justify-between w-full gap-4">
                    <label> Deadline </label>
                    <div class="flex gap-1">
                        <input type="date" v-model="formattedEndDate" :disabled="!modificationAllowed">
                    </div>
                </div>
            </div>
            <hr>
            <div v-if="projectName && phaseName">
                <div class="flex items-center justify-between w-full gap-4" v-if="projectName">
                    <h4>Project</h4>
                    <p>{{ projectName }}</p>
                </div>
                <div class="flex items-center justify-between w-full gap-4" v-if="phaseName">
                    <h4>Phase</h4>
                    <p>{{ phaseName }}</p>
                </div>
                <hr>
            </div>
            <div>
                <div class="flex items-center justify-between w-full gap-4">
                    Participants
                    <button type="button" @click="openParticipantsForm" @click.stop>
                        {{ newActivity.participants.length }}
                        <v-icon name="md-navigatenext" />
                    </button>
                </div>
            </div>
            <hr>
            <div v-if="!newActivity.pomodoro && subActivitiesAllowed && !activity.projectId">
                <div class="flex items-center justify-between w-full gap-4">
                    Sub-activities
                    <button type="button" @click="openSubActivitiesForm" @click.stop>
                        {{ subActivities.length }}
                        <v-icon name="md-navigatenext" />
                    </button>
                </div>
                <hr>
            </div>
            <div v-if="!activity.projectId">
                <div class="flex items-center justify-between w-full gap-4">
                    <label> <input type="checkbox" :checked="newActivity.pomodoro != null" :disabled="!modificationAllowed"
                            @click="newActivity.pomodoro = newActivity.pomodoro == null ? { options: authStore.user.preferences.pomodoro, completedCycles: { [authStore.user.username]: 0 } } : null" />
                        Pomodoro</label>
                </div>
                <div v-if="newActivity.pomodoro">
                    <label class="flex items-center justify-between w-full gap-4">
                        <span class="flex-1">Work Duration (minutes)</span>
                        <input type="number" v-model="newActivity.pomodoro.options.workDuration" min="1" class="flex-1"
                            required style="max-width: 4em; text-align: center" :disabled="!modificationAllowed"/>
                    </label>
                    <label class="flex items-center justify-between w-full gap-4">
                        <span class="flex-1">Pause Duration (minutes)</span>
                        <input type="number" v-model="newActivity.pomodoro.options.pauseDuration" min="1" class="flex-1"
                            required style="max-width: 4em; text-align: center" :disabled="!modificationAllowed"/>
                    </label>
                    <label class="flex items-center justify-between w-full gap-4">
                        <span class="flex-1">Cycles</span>
                        <input type="number" v-model="newActivity.pomodoro.options.numberOfCycles" min="1"
                            class="flex-1" required style="max-width: 4em; text-align: center" :disabled="!modificationAllowed"/>
                    </label>
                    <label class="flex items-center justify-between w-full gap-4">
                        <span class="flex-1">Completed Cycles</span>
                        <input type="number" v-model="newActivity.pomodoro.completedCycles[authStore.user.username]"
                            class="flex-1" min="0" :max="newActivity.pomodoro.options.numberOfCycles" required
                            style="max-width: 4em; text-align: center" :disabled="!modificationAllowed"/>
                    </label>
                </div>
                <hr>
            </div>
            <div>
                <div class="flex items-center justify-between w-full gap-4">
                    <p>Notification after deadline</p>
                    <div class="flex flex-wrap justify-end space-x-4">
                        <label> <input type="checkbox" v-model="newNotificationOptions.push" :disabled="!modificationAllowed"/> Push</label>
                        <label> <input type="checkbox" v-model="newNotificationOptions.email" :disabled="!modificationAllowed"/> Email </label>
                    </div>
                </div>
                <label v-if="false" class="flex items-center justify-between w-full gap-4 mt-1">
                    How long
                    <select name="whenNotify" v-model="newActivity.notification.when" :disabled="!modificationAllowed">
                        <option value="atEvent">Day of deadline</option>
                        <option value="1day">1 day after</option>
                        <option value="3days">3 days after</option>
                        <option value="1week">1 week after</option>
                        <option value="2weeks">2 weeks after</option>
                        <option value="1month">1 month after</option>
                    </select>
                </label>
                <label v-if="notifyAfterDeadline" class="flex items-center justify-between w-full gap-4 mt-1">
                    Frequency
                    <select name="repeatNotify" v-model="newActivity.notification.repeat" class="max-w-36" :disabled="!modificationAllowed">
                        <!-- <option value="never">Never</option> -->
                        <option value="daily">Daily</option>
                        <option value="linear">Increase by 1 every day</option>
                        <option value="exponential">Multiple 2x every day</option>
                    </select>
                </label>
            </div>
            <hr>
            <div class="flex-col space-y-1 w-full mt-8">
                <button v-if="modifying" type="button" @click="openExportPanel"
                    class="w-full p-2 rounded-md bg-gray-400 text-white">Export as event</button>
                <div v-else class="text-center cursor-pointer">
                    <label id="event-upload" for="fileInput"
                        class="w-full p-2 rounded-md bg-gray-400 text-white block">Import
                        activity</label>
                    <input class="hidden" type="file" id="fileInput" accept=".ics" @change="handleEventUpload">
                </div>
                <div class="flex w-full space-x-1">
                    <button v-if="modifying && !activity.projectId" type="button" @click="handleDeleteRequest"
                        class="flex-1 bg-red-600 text-white p-2 rounded-md">Delete</button>
                    <button v-if="modificationAllowed" type="submit" class="flex-1 bg-emerald-600 text-white p-2 rounded-md">Save</button>
                </div>
            </div>
            <div v-if="!modificationAllowed" class="mt-4">
        <p class="text-center text-gray-700">You cannot modify this activity.</p>
      </div>
        </form>

        <div v-if="showSubActivities" class="absolute inset-0 bg-white rounded-lg w-full h-full p-4 overflow-scroll flex flex-col justify-between" @click.stop>
            <div>
                <h2 class="text-lg font-semibold mb-2 mt-2">Subactivities</h2>
            <ul>
                <li v-for="(sub, index) in newSubActivities" :key="index">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-1">
                        <v-icon name="bi-circle-fill" :class="sub.done ? 'completed' : 'uncompleted'"></v-icon>
                        <p>{{ sub.title }} </p>
                    </div>
                    <div class="flex items-center gap-1">
                        <button v-if="modificationAllowed" @click="modifySubActivity(sub)"><v-icon name="md-modeeditoutline"></v-icon></button>
                    </div>
                    </div>
                    <hr>
                </li>
            </ul>
            <button v-if="modificationAllowed" @click="addSubActivity" class="py-1 px-2 mt-2 bg-blue-500 text-white rounded-md">Add new</button>
            </div>
            <div class="flex w-full space-x-1 mt-8">
                <!--<button type="button" @click="discardSubActivityChanges"
                    class="flex-1 bg-gray-400 text-white p-2 rounded-md">Cancel</button>-->
                <button type="submit" @click="saveSubActivities"
                    class="flex-1 bg-emerald-600 text-white p-2 rounded-md">Done</button>
            </div>
        </div>

        <ParticipantsForm v-if="showParticipantsForm" :participants="newActivity.participants"
            @closeParticipantsForm="handleCloseParticipantsForm" :modification-allowed="modificationAllowed"/>

        <EventExportPanel v-if="showExportPanel" :event="associatedEvent" @closePanel="closeExportPanel" />

        <ConfirmationPanel v-if="confirmationMessage.length > 0" :message="confirmationMessage" @cancel="cancelAction"
            @confirm="deleteActivity" />

        <div v-if="showSubForm" class="fixed inset-0 flex justify-center items-center">
            <div class="overflow-hidden w-full max-w-[600px] m-4">
                <ActivityForm :activity="selectedSub" :modifying="modifyingSub" :currentDate="currentDate"
                @closeForm="showSubForm = false" @saveActivity="handleSavedSub" @delete-activity="handleDeletedSub" class="animate-slide-in-bottom"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticipantsForm from './ParticipantsForm.vue';
import EventExportPanel from './EventExportPanel.vue';
import { Activity } from '@/models/Activity';
import timeService from '@/services/timeService';
import { useAuthStore } from '@/stores/authStore';
import activityService from '@/services/activityService';
import { CalendarEvent } from '@/models/Event';
import ConfirmationPanel from './ConfirmationPanel.vue';
import projectService from '@/services/projectService';

export default defineComponent({
    name: 'ActivityForm',
    components: {
        ParticipantsForm,
        EventExportPanel,
        ConfirmationPanel
    },
    props: {
        activity: {
            type: Object as () => Activity,
            required: true
        },
        modifying: {
            type: Boolean,
            default: false
        },
        currentDate: {
            type: Date,
            required: true
        },
        subActivitiesAllowed: {
            type: Boolean,
            default: true
        }
    },
    emits: ['closeForm', 'saveActivity', 'deleteActivity'],
    data() {
        return {
            authStore: useAuthStore(),
            newActivity: { ...this.activity },
            newNotificationOptions: {
                push: this.activity.notification.method.includes('push'),
                email: this.activity.notification.method.includes('email'),
            },
            showParticipantsForm: false,
            showSubActivities: false,
            showExportPanel: false,
            confirmationMessage: '',
            subActivities: [] as Activity[],
            newSubActivities: [] as Activity[],
            showSubForm: false,
            selectedSub: {} as Activity,
            modifyingSub: false,
            projectName: '',
            phaseName: ''
        }
    },
    mounted() {
        this.onFormVisible();
    },
    methods: {
        async onFormVisible() {
            if (!this.modifying) {
                // default initialization for new activity
                this.newActivity.owners = [this.authStore.user.username];
                this.newActivity.deadline = timeService.moveAheadByDays(this.currentDate, 7);
                this.newActivity.participants = [
                    { username: this.authStore.user.username, email: this.authStore.user.email, status: 'accepted' },
                ]
            }
            else {
                await this.fetchSubActivities();
                await this.fetchAssociatedProject();
            }
        },
        async fetchSubActivities() {
            const fetched = await Promise.all(this.activity.subActivitiesIDs.map((id: string) => {
                    return activityService.getActivityById(id);
                }));
            this.subActivities = fetched.filter((a) => a) as Activity[];
            this.newSubActivities = [...this.subActivities];
        },
        async fetchAssociatedProject() {
            if (this.activity.projectId) {
                const project = await projectService.getProjectById(this.activity.projectId);
                if(project) {
                    this.projectName = project.title;
                    this.phaseName = project.phases.find((p: any) => p.activities.some((a: any) => a.activityId === this.activity.id))?.title || '';    }
            }
        },
        async closeForm() {
            await this.handleSubActivitiesChanges();
            this.$emit('closeForm');
        },
        async handleSubActivitiesChanges() {
            // delete subactivities that were added but not saved
            await Promise.all(this.newSubActivities.map(async (sub) => {
                if (sub.id && !this.activity.subActivitiesIDs.some((s) => s === sub.id)) {
                    await activityService.deleteActivity(sub);
                }
            }));
            
            // remove the ids of subactivities that were deleted
            if(this.modifying){
                const newSubsIDs = this.activity.subActivitiesIDs.filter((id) => this.newSubActivities.some((s) => s.id === id));
                const sameSubs = newSubsIDs.length === this.activity.subActivitiesIDs.length && newSubsIDs.every((id) => this.activity.subActivitiesIDs.includes(id));

                if(!sameSubs){
                    const updatedActivity = { ...this.activity };
                    updatedActivity.subActivitiesIDs = newSubsIDs;
                    await this.saveActivity(updatedActivity);
                }
            }
        },
        async handleSubmit(event: Event) {
            event.preventDefault();

            this.newActivity.notification.method = [];
            if (this.newNotificationOptions.push)
                this.newActivity.notification.method.push('push');

            if (this.newNotificationOptions.email)
                this.newActivity.notification.method.push('email');

            console.log('saving activity', this.newActivity);

            this.newActivity.subActivitiesIDs = this.newSubActivities.map((s) => s.id).filter((id): id is string => id !== undefined);
            this.saveActivity(this.newActivity);
        },
        async saveActivity(activity: Activity) {            
            let res;
            if (this.modifying)
                res = await activityService.modifyActivity(activity);
            else
                res = await activityService.addActivity(activity);

            this.$emit('saveActivity', res);
        },
        handleDeleteRequest() {
            this.confirmationMessage = 'Are you sure you want to delete this activity?';
        },
        cancelAction() {
            this.confirmationMessage = '';
        },
        async deleteActivity() {
            this.confirmationMessage = '';
            if(this.modificationAllowed)
                await activityService.deleteActivity(this.activity);
            else
                await activityService.removeParticipantFromActivity(this.activity, this.authStore.user.username);

            this.$emit('deleteActivity', this.activity);
        },
        openParticipantsForm() {
            this.showParticipantsForm = true;
        },
        closeParticipantsForm() {
            this.showParticipantsForm = false;
        },
        handleCloseParticipantsForm(participants: any[]) {
            this.newActivity.participants = participants;
            this.closeParticipantsForm();
        },
        openSubActivitiesForm() {
            this.showSubActivities = true;
        },
        openExportPanel() {
            this.showExportPanel = true;
        },
        closeExportPanel() {
            this.showExportPanel = false;
        },
        handleEventUpload(event: Event) {
            const file = (event.target as HTMLInputElement)?.files?.[0] || null;

            if (file && file.type === 'text/calendar') {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const fileContent = e.target?.result;
                    this.setUploadedFile(fileContent as string);
                };
                reader.readAsText(file);
            } else {
                alert('Please upload a valid .ics file.');
            }
        },
        async setUploadedFile(fileContent: string) {
            this.newActivity = await activityService.convertICalendarToActivity(fileContent);
        },
        modifySubActivity(sub: Activity) {
            this.selectedSub = sub;
            this.modifyingSub = true;
            this.showSubForm = true;
        },
        addSubActivity() {
            this.selectedSub = new Activity();
            this.showSubForm = true;
        },
        handleSavedSub(sub: Activity) {
            if (this.modifyingSub) {
                const index = this.newSubActivities.findIndex((s) => s.id === sub.id);
                this.newSubActivities[index] = sub;
            } else {
                this.newSubActivities.push(sub);
            }

            this.showSubForm = false;
            this.modifyingSub = false;
        },
        handleDeletedSub(sub: Activity) {
            // remove the deleted subactivity from the list of subs
            this.newSubActivities = this.newSubActivities.filter((s) => s.id !== sub.id);
            this.showSubForm = false;
            this.modifyingSub = false;
        },
        saveSubActivities() {
            if(this.modificationAllowed)
                this.subActivities = [...this.newSubActivities];
            this.showSubActivities = false;
        },
        async discardSubActivityChanges() {
            await Promise.all(this.newSubActivities.map(async (sub) => {
                if (sub.id && !this.subActivities.some((s) => s.id === sub.id)) {
                    await activityService.deleteActivity(sub);
                }
            }));
            
            this.newSubActivities = [...this.subActivities];
            this.showSubActivities = false;
        }
    },
    computed: {
        notifyAfterDeadline(): boolean {
            return this.newNotificationOptions.push || this.newNotificationOptions.email;
        },
        formattedEndDate: {
            get(): string {
                return this.newActivity.deadline.toISOString().split('T')[0];
            },
            set(value: string) {
                this.newActivity.deadline = new Date(value);
            }
        },
        formattedStartDate: {
            get(): string {
                if(this.newActivity.start)
                    return this.newActivity.start.toISOString().split('T')[0];
                else
                    return '';
            },
            set(value: string) {
                this.newActivity.start = new Date(value);
            }
        },
        associatedEvent(): CalendarEvent {
            const event = new CalendarEvent();
            event.title = this.newActivity.title;
            event.start = timeService.getStartOfDay(this.newActivity.deadline);
            event.end = timeService.getEndOfDay(this.newActivity.deadline);
            event.allDay = true;
            event.participants = this.newActivity.participants;
            event.notification.method = [];
            return event;
        },
        modificationAllowed(): boolean {
            return this.newActivity.owners.includes(this.authStore.user.username) && !this.activity.projectId;
        }
    }
});
</script>

<style scoped>
hr {
    margin: 0.5rem 0;
}

select {
    padding: 0.25rem;
    border-radius: 0.375rem;
}

.completed {
    color: green;
}

.uncompleted {
    color: orange;
}
</style>