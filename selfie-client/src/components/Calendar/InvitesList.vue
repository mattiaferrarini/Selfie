<template>
    <div class="invite-list">
        <ul>
            <li v-for="(invInf, index) in inviteInfos" :key="index" class="mb-3">
                <div class="p-2 rounded-lg bg-slate-200">
                    <div>
                        <h3 class="font-semibold mb-2 text-gray-700">{{ inviteInfos[index].title }}</h3>
                        <div v-html="formattedDescription(inviteInfos[index].description)"></div>
                    </div>
                    <div class="flex gap-x-1 mt-4 mb-1">
                        <button @click="declineInvite(invInf.invite)"
                            class="flex-1 bg-red-600 action-button">Decline</button>
                        <button @click="postponeInvite(invInf.invite)"
                            class="flex-1 bg-gray-400 action-button">Postpone</button>
                        <button @click="acceptInvite(invInf.invite)"
                            class="flex-1 bg-emerald-600 action-button">Accept</button>
                    </div>
                </div>
            </li>
        </ul>
        <p v-if="inviteInfos.length == 0">No pending invites.</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Invite } from '@/models/Invite';
import inviteService from '@/services/inviteService';
import eventService from '@/services/eventService';
import activityService from '@/services/activityService';
import { CalendarEvent } from '@/models/Event';
import { Activity } from '@/models/Activity';

export default defineComponent({
    name: 'InvitesList',
    props: {
        username: {
            type: String,
            required: true
        },
        currentDate: {
            type: Date,
            required: true
        }
    },
    data() {
        return {
            inviteInfos: [] as { invite: Invite, title: string, description: string }[],
        }
    },
    watch: {
        username: {
            handler: 'fetchInviteInfos',
            immediate: true
        },
        currentDate: {
            handler: 'fetchInviteInfos',
            immediate: true
        }
    },
    emits: ['no-invites', 'accept-invite', 'decline-invite', 'postpone-invite', 'error'],
    methods: {
        formattedDescription(description: string): string {
            return description.replace(/\n/g, '<br>');
        },
        async fetchInviteInfos() {

            if (this.username === '') {
                this.$emit('no-invites');
                return;
            }

            try {
                const invites = await inviteService.getPendingInvitesByUser(this.username, this.currentDate);
                let newInfos = [] as { invite: Invite, title: string, description: string }[];

                for (let invite of invites) {
                    if (invite.eventId) {
                        const event = await eventService.getEventById(invite.eventId)
                        if (event)
                            newInfos.push(this.formatEventInvite(invite, event));
                    }
                    else if (invite.activityId) {
                        const activity = await activityService.getActivityById(invite.activityId)
                        if (activity)
                            newInfos.push(this.formatActivityInvite(invite, activity));
                    }
                }
                this.inviteInfos = newInfos;
            }
            catch {
                this.$emit('error', 'Failed to fetch invites.');
            }
        },
        async acceptInvite(invite: Invite) {
            try {
                await inviteService.acceptInvite(invite);
                this.removeInvite(invite);
                this.$emit('accept-invite', invite);
            }
            catch {
                this.$emit('error', 'Failed to accept invite.');
            }
        },
        async declineInvite(invite: Invite) {
            try {
                await inviteService.declineInvite(invite);
                this.removeInvite(invite);
                this.$emit('decline-invite', invite);
            }
            catch {
                this.$emit('error', 'Failed to decline invite.');
            }
        },
        async postponeInvite(invite: Invite) {
            try {
                await inviteService.postponeInvite(invite);
                this.removeInvite(invite);
                this.$emit('postpone-invite', invite);
            }
            catch {
                this.$emit('error', 'Failed to postpone invite.');
            }
        },
        removeInvite(invite: Invite) {
            this.inviteInfos = this.inviteInfos.filter(inviteInfo => inviteInfo.invite.id !== invite.id);
            if (this.inviteInfos.length === 0) {
                this.$emit('no-invites');
            }
        },
        formatEventInvite(invite: Invite, event: CalendarEvent): { invite: Invite, title: string, description: string } {

            let description = `When: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}`;
            if (event.repetition.frequency !== 'never') {
                description += `\nRepeats ${event.repetition.frequency}`;
                description += event.repetition.until === 'infinity' ? ` until infinity` : '';
                description += event.repetition.until === 'date' ? ` until ${event.repetition.endDate.toLocaleDateString()}` : '';
                description += event.repetition.until === 'n-reps' ? ` for ${event.repetition.numberOfRepetitions} repetitions` : '';
            }

            description += event.location !== '' ? `\nWhere: ${event.location}` : '';
            description += "\nInvited participants: " + event.participants.map(participant => participant.username).join(', ');

            return {
                invite: invite,
                title: event.title + " (E)",
                description: description
            };
        },
        formatActivityInvite(invite: Invite, activity: Activity): { invite: Invite, title: string, description: string } {
            let description = `Deadline: ${activity.deadline.toLocaleDateString()}`;
            description += "\nInvited participants: " + activity.participants.map(participant => participant.username).join(', ');

            return {
                invite: invite,
                title: activity.title + " (A)",
                description: description
            };
        }
    },
    computed: {

    },
    async mounted() {
        await this.fetchInviteInfos();
    }
});
</script>

<style scoped>
.action-button {
    padding: 0.3rem 0.3rem;
    border-radius: 0.375rem;
    color: white;
}

div {
    white-space: pre-wrap;
}
</style>