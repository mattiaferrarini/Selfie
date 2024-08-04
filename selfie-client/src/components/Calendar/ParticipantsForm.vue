<template>
    <div class="absolute inset-0 bg-white rounded-lg w-full h-full p-4 overflow-scroll">
        <h2 class="text-lg font-semibold mb-2">Participants</h2>
        <div class="mb-3">
            <h3 class="font-semibold mb-1">Add participants</h3>
            <div class="flex w-full">
                <input type="text" placeholder="Add usernames" class="border border-gray-300 p-1 flex-grow">
                <button class="px-2 bg-gray-300"><v-icon name="md-add"></v-icon></button>
            </div>
            <button v-if="yourselfMissing" @click="addYoursef"
                class="py-1 px-2 mt-2 bg-blue-500 text-white rounded-md">Add yourself</button>
        </div>
        <div>
            <h3 class="font-semibold">Invited</h3>
            <ul>
                <li v-for="(participant, index) in sortedParticipants" :key="index"
                    class="flex justify-between items-center">
                    <p>{{ participant.username }} </p>
                    <div class="flex items-center">
                        <v-icon name="bi-circle-fill" class="mr-2" :class="participant.status"></v-icon>
                        <button @click="removeParticipant(index)"><v-icon
                                name="md-removecircleoutline"></v-icon></button>
                    </div>
                </li>
            </ul>
        </div>
        <div class="flex w-full space-x-1 mt-8">
            <button type="button" @click="cancelChanges"
                class="flex-1 bg-red-600 text-white p-1 rounded-lg">Back</button>
            <button type="submit" @click="saveChanges"
                class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/authStore';

export default defineComponent({
    emits: ['closeParticipantsForm'],
    props: {
        participants: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            newParticipants: [...this.participants],
            yourself: useAuthStore().user.username,
        };
    },
    methods: {
        removeParticipant(index: number) {
            this.newParticipants.splice(index, 1);
        },
        cancelChanges() {
            this.newParticipants = this.participants;
            this.closeForm();
        },
        saveChanges() {
            this.closeForm();
        },
        closeForm() {
            this.$emit('closeParticipantsForm', this.newParticipants);
        },
        addYoursef() {
            this.newParticipants.push({ username: this.yourself, status: 'accepted' });
        }
    },
    computed: {
        sortedParticipants(): any[] {
            return [...this.newParticipants].sort((a: any, b: any) => {
                if (a.status === 'accepted' && b.status !== 'accepted') {
                    return -1;
                } else if (a.status !== 'accepted' && b.status === 'accepted') {
                    return 1;
                } else if (a.status === 'pending' && b.status === 'declined') {
                    return -1;
                } else if (a.status === 'declined' && b.status === 'pending') {
                    return 1;
                } else {
                    return 0;
                }
            });
        },
        yourselfMissing(): boolean {
            return !this.newParticipants.some((participant: any) => participant.username === this.yourself);
        }
    }
});
</script>

<style scoped>
.accepted {
    color: green;
}

.pending {
    color: orange;
}

.declined {
    color: red;
}
</style>