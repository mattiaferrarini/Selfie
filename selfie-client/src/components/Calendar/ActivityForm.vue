<template>
    <div class="bg-white p-4 rounded-lg shadow-lg w-4/5" @click.stop>
        <form class="flex flex-col" @submit="handleSubmit">
            <div>
                <label><input type="text" placeholder="Untitled Activity" required v-model="newTitle"></label><br>
            </div>
            <hr>
            <div>
                <label><input type="checkbox" v-model="newDone"> Completed </label><br>
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
                    <select name="whenNotify" v-model="newWhenNotify">
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
                    <select name="repeatNotify" v-model="newRepeatNotify" class="max-w-36">
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

export default defineComponent({
    props: {
        title: {
            type: String,
            default: ''
        },
        done: {
            type: Boolean,
            default: false
        },
        deadline: {
            type: Date,
            required: true
        },
        notificationOptions: {
            type: Object,
            default: () => ({
                os: false,
                email: false,
                whatsapp: false
            })
        },
        whenNotify: {
            type: String,
            default: 'atEvent'
        },
        repeatNotify: {
            type: String,
            default: 'never'
        }
    },
    emits: ['closeActivityForm', 'saveActivity'],
    data() {
        return {
            newTitle: this.title,
            newDone: this.done,
            newDeadline: this.deadline,
            newStartTime: this.startTime,
            newNotificationOptions: this.notificationOptions,
            newWhenNotify: this.whenNotify,
            newRepeatNotify: this.repeatNotify
        }
    },
    methods: {
        closeForm() {
            console.log('closeForm');
            this.$emit('closeActivityForm');
        },
        handleSubmit(event: Event) {
            event.preventDefault();
            const newActivity = {
                title: this.newTitle,
                done: this.newDone,
                deadline: this.newDeadline,
                notificationOptions: this.newNotificationOptions,
                whenNotify: this.newWhenNotify,
                repeatNotify: this.newRepeatNotify
            }
            this.$emit('saveActivity', newActivity);
        }
    },
    computed: {
        notifyAfterDeadline() {
            return this.newNotificationOptions.os || this.newNotificationOptions.email || this.newNotificationOptions.whatsapp;
        },
        formattedEndDate: {
            get() {
                return this.newDeadline.toISOString().split('T')[0];
            },
            set(value: string) {
                this.newDeadline = new Date(value);
            }
        },
    }
});
</script>

<style scoped>
</style>