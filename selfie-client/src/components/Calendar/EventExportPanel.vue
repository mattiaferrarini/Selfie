<template>
    <div class="absolute inset-0 bg-white rounded-lg w-full h-full overflow-scroll">

        <div class="p-4 flex flex-col justify-between w-full h-full">
            <div class="flex flex-col justify-stretch text-center mt-4 mb-4">
                <h2 class="text-lg font-semibold mb-4">Export Options</h2>
                <button @click="downloadICalendar" class="export-option">Download iCalendar File</button>
                <a :href="yahooLink" target="_blank" class="export-option">Open in Yahoo! Calendar</a>
                <a :href="googleLink" target="_blank" class="export-option">Open in Google Calendar</a>
                <a :href="outlookLink" target="_blank" class="export-option">Open in Outlook Web Calendar</a>
                <button v-if="!emailSent" @click="sendAllToEmail" class="export-option">Send All to Email</button>
                <div v-if="emailSent" class="export-option">{{ emailSentResult }}</div>
            </div>

            <button @click="closePanel" class="w-full p-2 rounded-lg bg-gray-400 text-white">Done</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventService from '@/services/eventService';
import { CalendarEvent } from '@/models/Event';
import { CalendarOptions } from 'datebook';
import FileSaver from 'file-saver';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
    emits: ['closePanel'],
    props: {
        event: {
            type: Object as () => CalendarEvent,
            required: true
        }
    },
    data() {
        return {
            iCalendarOptions: {} as CalendarOptions,
            iCalendarFile: '',
            yahooLink: '',
            googleLink: '',
            outlookLink: '',
            authStore: useAuthStore(),
            emailSent: false,
            emailSentResult: ''
        }
    },
    methods: {
        downloadICalendar() {
            const blob = new Blob([this.iCalendarFile], { type: 'text/calendar' });
            FileSaver.saveAs(blob, `${this.event.title}.ics`);
        },
        closePanel() {
            this.$emit('closePanel');
        },
        async sendAllToEmail() {
            const formData = new FormData();

            const blob = new Blob([this.iCalendarFile], { type: 'text/calendar' });
            formData.append('file', blob, `${this.event.title}.ics`);

            formData.append('to', this.authStore.user.email);
            formData.append('eventName', this.event.title);
            formData.append('yahooLink', this.yahooLink);
            formData.append('googleLink', this.googleLink);
            formData.append('outlookLink', this.outlookLink);

            this.emailSentResult = await eventService.sendExportViaEmail(formData);
            this.setEmailSent();
        },
        setEmailSent() {
            this.emailSent = true;
            setTimeout(() => {
                this.emailSent = false;
            }, 5000);
        }
    },
    computed: {

    },
    mounted() {
        this.iCalendarOptions = eventService.generateOptionsForEvent(this.event);
        this.iCalendarFile = eventService.convertOptionsToICalendar(this.iCalendarOptions);
        this.yahooLink = eventService.convertOptionsToYahoo(this.iCalendarOptions);
        this.googleLink = eventService.convertOptionsToGoogle(this.iCalendarOptions);
        this.outlookLink = eventService.convertOptionsToOutlook(this.iCalendarOptions);
    }
});
</script>

<style scoped>
.export-option {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
}

.export-option:hover {
    background-color: #e5e5e5;
}
</style>