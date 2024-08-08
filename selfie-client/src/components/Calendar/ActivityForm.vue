<template>
    <div class="bg-white p-4 rounded-lg shadow-lg relative" @click.stop>
        <div class="flex justify-end">
            <button @click="closeForm">
                <v-icon name="md-close" />
            </button>
        </div>
        <form class="flex flex-col" @submit="handleSubmit">
            <div>
                <label><input type="text" placeholder="Untitled Activity" required
                        v-model="newActivity.title"></label><br>
            </div>
            <hr>
            <div>
                <label><input type="checkbox" v-model="newActivity.done"> Completed </label><br>
            </div>
            <div>
                <div class="flex items-center justify-between w-full gap-4">
                    <label> Deadline </label>
                    <div class="flex gap-1">
                        <input type="date" v-model="formattedEndDate">
                    </div>
                </div>
            </div>
            <hr>
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
            <div v-if="!newActivity.pomodoro">
                <div class="flex items-center justify-between w-full gap-4">
                    Sub-activities
                    <button type="button" @click="openSubActivitiesForm" @click.stop>
                        {{ newActivity.subActivitiesIDs.length }}
                        <v-icon name="md-navigatenext" />
                    </button>
                </div>
            <hr>
            </div>
            <div>
                <div class="flex items-center justify-between w-full gap-4">
                    <label> <input type="checkbox" v-model="newActivity.pomodoro" /> Pomodoro</label>
                </div>
                <label v-if="newActivity.pomodoro" class="flex items-center justify-between w-full gap-4">
                    Cycles
                    <input type="number" v-model="newActivity.pomodoroCycles" min="1" required />
                </label>
            </div>
            <hr>
            <div>
                <div class="flex items-center justify-between w-full gap-4">
                    <p>Notification after deadline</p>
                    <div class="flex flex-wrap justify-end space-x-4">
                        <label> <input type="checkbox" v-model="newNotificationOptions.os" /> OS</label>
                        <label> <input type="checkbox" v-model="newNotificationOptions.email" /> Email </label>
                        <label> <input type="checkbox" v-model="newNotificationOptions.whatsapp" /> Whatsapp </label>
                    </div>
                </div>
                <label v-if="notifyAfterDeadline" class="flex items-center justify-between w-full gap-4">
                    How long
                    <select name="whenNotify" v-model="newActivity.notification.when">
                        <option value="atEvent">Day of deadline</option>
                        <option value="1day">1 day after</option>
                        <option value="3days">3 days after</option>
                        <option value="1week">1 week after</option>
                        <option value="2weeks">2 weeks after</option>
                        <option value="1month">1 month after</option>
                    </select>
                </label>
                <label v-if="notifyAfterDeadline" class="flex items-center justify-between w-full gap-4">
                    Frequency
                    <select name="repeatNotify" v-model="newActivity.notification.repeat" class="max-w-36">
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="linear">Increase by 1 every day</option>
                        <option value="exponential">Multiple 2x every day</option>
                    </select>
                </label>
            </div>
            <hr>
            <div class="flex w-full space-x-1">
                <button v-if="modifying" type="button" @click="deleteActivity"
                    class="flex-1 bg-red-600 text-white p-1 rounded-lg">Delete</button>
                <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
            </div>
        </form>

        <ParticipantsForm v-if="showParticipantsForm" :participants="newActivity.participants"
            @closeParticipantsForm="handleCloseParticipantsForm" />

    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticipantsForm from './ParticipantsForm.vue';
import { Activity } from '@/models/Activity';
import timeService from '@/services/timeService';
import { useAuthStore } from '@/stores/authStore';
import activityService from '@/services/activityService';


export default defineComponent({
    components: {
        ParticipantsForm
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
        }
    },
    emits: ['closeForm', 'saveActivity', 'deleteActivity'],
    data() {
        return {
            authStore: useAuthStore(),
            newActivity: { ...this.activity },
            newNotificationOptions: {
                os: this.activity.notification.method.includes('os'),
                email: this.activity.notification.method.includes('email'),
                whatsapp: this.activity.notification.method.includes('whatsapp')
            },
            showParticipantsForm: false,
            showSubActivitiesForm: false
        }
    },
    mounted() {
        this.onFormVisible();
    },
    methods: {
        onFormVisible() {
            if (!this.modifying) {
                // default initialization for new activity
                this.newActivity.deadline = timeService.moveAheadByDays(this.currentDate, 7);
                this.newActivity.participants = [{ username: this.authStore.user.username, status: 'accepted' }];
            }
        },
        closeForm() {
            this.$emit('closeForm');
        },
        async handleSubmit(event: Event) {
            event.preventDefault();

            this.newActivity.notification.method = [];
            if (this.newNotificationOptions.os)
                this.newActivity.notification.method.push('os');

            if (this.newNotificationOptions.email)
                this.newActivity.notification.method.push('email');

            if (this.newNotificationOptions.whatsapp)
                this.newActivity.notification.method.push('whatsapp');

            let res = null;
            if(this.modifying)
                res = await activityService.modifyActivity(this.newActivity);
            else
                res = await activityService.addActivity(this.newActivity);

            this.$emit('saveActivity', res);
        },
        deleteActivity() {
            activityService.deleteActivity(this.activity);
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
            this.showSubActivitiesForm = true;
        },
        closeSubActivitiesForm() {
            this.showSubActivitiesForm = false;
        },
        handleCloseSubActivitiesForm(subActivitiesIDs: string[]) {
            this.newActivity.subActivitiesIDs = subActivitiesIDs;
            this.closeSubActivitiesForm();
        }
    },
    computed: {
        notifyAfterDeadline() : boolean {
            return this.newNotificationOptions.os || this.newNotificationOptions.email || this.newNotificationOptions.whatsapp;
        },
        formattedEndDate: {
            get() : string{
                return this.newActivity.deadline.toISOString().split('T')[0];
            },
            set(value: string) {
                this.newActivity.deadline = new Date(value);
            }
        },
    }
});
</script>

<style scoped></style>