<template>
    <div class="bg-white p-4 rounded-lg shadow-lg w-4/5" @click.stop>
        <form class="flex flex-col" @submit="handleSubmit">
            <div>
                <label><input type="text" placeholder="Untitled Activity" required v-model="newActivity.title"></label><br>
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
                <button type="button" @click="closeForm"
                    class="flex-1 bg-red-600 text-white p-1 rounded-lg">Cancel</button>
                <button type="submit" class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Activity } from '@/models/Activity';

export default defineComponent({
    props: {
        activity: {
            type: Object as () => Activity,
            required: true
        }
    },
    emits: ['closeForm', 'saveActivity'],
    data() {
        return {
            newActivity: this.activity,
            newNotificationOptions: {
                os: this.activity.notification.method.includes('os'),
                email: this.activity.notification.method.includes('email'),
                whatsapp: this.activity.notification.method.includes('whatsapp')
            },
        }
    },
    methods: {
        closeForm() {
            console.log('closeForm');
            this.$emit('closeForm');
        },
        handleSubmit(event: Event) {
            event.preventDefault();

            this.newActivity.notification.method = [];
            if (this.newNotificationOptions.os)
                this.newActivity.notification.method.push('os');

            if (this.newNotificationOptions.email)
                this.newActivity.notification.method.push('email');

            if (this.newNotificationOptions.whatsapp)
                this.newActivity.notification.method.push('whatsapp');
            
            this.$emit('saveActivity', this.newActivity);
        }
    },
    computed: {
        notifyAfterDeadline() {
            return this.newNotificationOptions.os || this.newNotificationOptions.email || this.newNotificationOptions.whatsapp;
        },
        formattedEndDate: {
            get() {
                return this.newActivity.deadline.toISOString().split('T')[0];
            },
            set(value: string) {
                this.newActivity.deadline = new Date(value);
            }
        },
    }
});
</script>

<style scoped>
</style>