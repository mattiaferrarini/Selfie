<template>
    <div class="absolute inset-0 bg-white rounded-lg w-full h-full p-4 overflow-scroll flex flex-col justify-between">
        <div>
            <h2 class="text-lg font-semibold mb-2 mt-2">Participants</h2>
            <div class="mb-3" v-if="modificationAllowed">
                <h3 class="font-semibold mb-1">Add participants</h3>
                <div class="flex w-full">
                    <input type="text" placeholder="Add username" v-model="newUsername" @keyup.enter="addParticipant"
                        class="border border-gray-300 p-1 flex-grow rounded-bl-md rounded-tl-md">
                    <button @click="addParticipant" class="px-2 bg-gray-300 rounded-tr-md rounded-br-md"><v-icon name="md-add"></v-icon></button>
                </div>
                <p v-if="noMessagesDisplayed" class="mt-2 text-gray-600">Save in calendar to invite all participants.</p>
                <p v-if="successfulAdd" class="mt-2 text-gray-600">The user was added.</p>
                <p v-if="failureAdd" class="mt-2 text-red-600">{{ failureText }}</p>
                <button v-if="yourselfMissing" @click="addYoursef"
                    class="py-1 px-2 mt-2 bg-blue-500 text-white rounded-md">Add yourself</button>
            </div>
            <div>
                <h3 class="font-semibold">Invited</h3>
                <ul>
                    <li v-for="(participant, index) in sortedParticipants" :key="index"
                        class="flex justify-between items-center">
                        <div class="flex items-center">
                            <v-icon name="bi-circle-fill" class="mr-1" :class="participant.status"></v-icon>
                            <p>{{ participant.username }} </p>
                        </div>
                        <button v-if="participant.username !== yourself && modificationAllowed" @click="removeParticipant(participant)"><v-icon
                            name="md-removecircleoutline"></v-icon></button>
                    </li>
                </ul>
            </div>
        </div>
        <div class="justify-self-end flex w-full space-x-1 mt-8" v-if="modificationAllowed">
            <button type="button" @click="cancelChanges"
                class="flex-1 bg-gray-400 text-white rounded-lg p-2">Cancel</button>
            <button type="submit" @click="saveChanges"
                class="flex-1 bg-emerald-600 text-white p-2 rounded-lg">Save</button>
        </div>
        <div v-else>
            <button type="button" @click="closeForm"
                class="bg-gray-400 text-white rounded-lg p-2 w-full">Back</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import userService from '@/services/userService';
import unavailabilityService from '@/services/unavailabilityService';
import resourceService from '@/services/resourceService';
import { CalendarEvent } from '@/models/Event';

export default defineComponent({
    emits: ['closeParticipantsForm'],
    props: {
        participants: {
            type: Array,
            required: true,
        },
        event: {
            type: Object as () => CalendarEvent,
            required: false,
        },
        modificationAllowed: {
            type: Boolean,
            default: true,
        }
    },
    data() {
        return {
            newParticipants: [...this.participants],
            yourself: useAuthStore().user.username,
            yourEmail: useAuthStore().user.email,
            newUsername: '',
            successfulAdd: false,
            failureAdd: false,
            failureText: '',
            timeoutId: null as number | null,
        };
    },
    methods: {
        removeParticipant(participant: any) {
            this.newParticipants = this.newParticipants.filter((p: any) => p.username !== participant.username);
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
            this.newParticipants.push({ username: this.yourself, email: this.yourEmail, status: 'accepted' });
        },
        async addParticipant() {
            try{
                const userData = await userService.getUserBasicInfo(this.newUsername);
            if (userData) {
                console.log('user');
                if (!this.userAlreadyAdded(userData.username)) {
                    if(this.event){
                        // event case: check if user is available
                        const unavailabilities = await unavailabilityService.getOverlappingUnavailabilities(userData.username, this.event);
                        if(unavailabilities.length > 0){
                            this.onUnavailableUser();
                        }
                        else{
                            this.newParticipants.push({ username: userData.username, email: userData.email, status: userData.username == this.yourself ? 'accepted' : 'pending'});
                            this.onAddSuccess();
                        }
                    }
                    else{
                        // activity case: add user
                        this.newParticipants.push({ username: userData.username, email: userData.email, status: userData.username == this.yourself ? 'accepted' : 'pending'});
                        this.onAddSuccess();
                    }
                }
                else
                    this.onAddSuccess();
            } 
            else if(this.event){
                console.log('resource');
                //check if user is a resource
                const resource = await resourceService.getResource(this.newUsername);
                if(resource){
                    this.newParticipants.push({ username: resource.username, status: 'pending'});
                    this.onAddSuccess();
                }
                else {
                    this.onUserNotExisting();
                }
            }
            else {
                this.onUserNotExisting();
            }
            }
            catch(error){
                console.error(error);
                this.onUserAddError();
            }
            this.newUsername = '';
        },
        userAlreadyAdded(username: string): boolean {
            return this.newParticipants.some((participant: any) => participant.username === username);
        },
        onAddSuccess() {
            this.clearAllMessages();
            this.successfulAdd = true;
            this.timeoutId = setTimeout(() => {
                this.successfulAdd = false;
                this.timeoutId = null;
            }, 3000);
        },
        onUserNotExisting() {
            this.failureText = `${this.newUsername} does not exist.`;
            this.onAddFailure();
        },
        onUnavailableUser() {
            this.failureText = `${this.newUsername} is unavailable at the time of the event.`;
            this.onAddFailure();
        },
        onUserAddError() {
            this.failureText = `An error occurred while adding ${this.newUsername}.`;
            this.onAddFailure();
        },
        onAddFailure() {
            this.clearAllMessages();
            this.failureAdd = true;
            this.timeoutId = setTimeout(() => {
                this.failureAdd = false;
                this.timeoutId = null;
            }, 5000);
        },
        clearAllMessages() {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;

                this.successfulAdd = false;
                this.failureAdd = false;
            }
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
            return !this.userAlreadyAdded(this.yourself);
        },
        noMessagesDisplayed(): boolean{
            return !this.successfulAdd && !this.failureAdd;
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