<template>
    <div class="absolute inset-0 bg-white rounded-lg w-full h-full overflow-scroll">

        <div class="p-4 flex flex-col justify-center">
            <div class="flex flex-col justify-stretch text-center mb-4">
            <button @click="downloadICalendar" class="export-option">Download iCalendar File</button>
            <a :href="yahooLink" target="_blank" class="export-option">Open in Yahoo! Calendar</a>
            <a :href="googleLink" target="_blank" class="export-option">Open in Google Calendar</a>
            <a :href="outlookLink" target="_blank" class="export-option">Open in Outlook Web Calendar</a>
            <button @click="sendAllToEmail" class="export-option">Send All to Email</button>
        </div>

        <button @click="closePanel" class="w-full p-1 rounded-lg bg-gray-300">Done</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import eventService from '@/services/eventService';
import { CalendarEvent } from '@/models/Event';
import { CalendarOptions } from 'datebook';
import FileSaver from 'file-saver';

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
            outlookLink: ''
        }
    },
    methods: {
        downloadICalendar() {
            const blob = new Blob([this.iCalendarFile], {type: 'text/calendar'});
            FileSaver.saveAs(blob, `${this.event.title}.ics`);
        },
        closePanel() {
            this.$emit('closePanel');
        },
        sendAllToEmail() {
            // TODO: implement sendAllToEmail
            console.log('sendAllToEmail');
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

.export-option{
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
}
</style>