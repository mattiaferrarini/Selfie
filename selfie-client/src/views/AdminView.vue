<template>
    <div class="w-full flex justify-center">
        <div class="m-4 max-w-[1200px] w-full">
        <h1 class="text-xl font-semibold text-center text-gray-800 my-2">Admin Panel</h1>
        <div class="animate-fade-in mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4">
            <div class="flex-1 flex flex-col gap-y-4">
                <div class="bg-white rounded-lg shadow-lg p-4">
                    <form @submit="addResource">
                        <h2 class="font-semibold text-gray-700 text-lg">Add a resource</h2>
                        <div class="mt-4 flex flex-col gap-y-2">
                            <div class="flex flex-col gap-y-2 sm:flex-row sm:gap-x-2 w-full">
                                <label class="flex-1 border border-gray-400 rounded-md overflow-hidden"><input type="text" required
                                        v-model="newUsername" placeholder="Resource username"
                                        class="w-full px-2 py-1"></label>
                                <label class="flex-1 border border-gray-400 rounded-md overflow-hidden"><input type="text" required
                                        v-model="newName" placeholder="Resource name" class="w-full px-2 py-1"></label>
                            </div>
                            <button type="submit" class="bg-emerald-600 text-white px-2 py-1 rounded-md">Add
                                resource</button>
                        </div>
                        <p v-if="errorText.length > 0" class="mt-2 text-red-600">{{ errorText }}</p>
                    </form>
                </div>
                <div class="bg-white rounded-lg shadow-lg p-4 flex-1 sm:overflow-scroll" style="max-height: 50vh;">
                    <h2 class="font-semibold text-gray-700 text-lg mb-2">Resources</h2>
                    <ul>
                        <li v-for="res in resources" :key="res.id">
                            <div class="flex align-center justify-between">
                                <div>
                                    {{ res.name }} -
                                    <i>{{ res.username }}</i>
                                </div>
                                <button @click="deleteResource(res)"><v-icon name="md-delete"
                                        class="h-full"></v-icon></button>
                            </div>
                        </li>
                    </ul>
                    <p v-if="resources.length == 0">No existing resources.</p>
                </div>
            </div>
            <div class="flex-1">
                <div class="bg-white shadow-lg rounded-lg p-4">
                    <h2 class="font-semibold text-gray-700 text-lg mb-2">Invites</h2>
                    <div v-if="resources.length > 0" class="flex flex-wrap gap-1">
                        <p class="hidden">Showing invites for:</p>
                        <select name="resource" id="resource" class="p-2 rounded-md"
                            v-model="selectedResourceName">
                            <option v-for="res in resources" :key="res.id" :value="res.name">{{ res.name }}</option>
                        </select>
                    </div>
                    <p v-else>No pending invites.</p>
                    <InvitesList class="mt-4" v-if="resources.length > 0" :username="selectedResourceUsername"
                        :currentDate="currentDate" />
                </div>
            </div>
        </div>
    </div>
    <ConfirmationPanel v-if="confirmationMessage.length > 0" :message="confirmationMessage"
        @cancel="cancelAction" @confirm="confirmAction" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Resource } from '@/models/Resource';
import resourceService from '@/services/resourceService';
import InvitesList from '@/components/Calendar/InvitesList.vue';
import { useDateStore } from '@/stores/dateStore';
import ConfirmationPanel from '@/components/Calendar/ConfirmationPanel.vue';

export default defineComponent({
    components: {
        InvitesList,
        ConfirmationPanel
    },
    data() {
        return {
            resources: [] as Resource[],
            newName: '',
            newUsername: '',
            errorText: '',
            selectedResourceName: '',
            currentDate: useDateStore().currentDate,
            confirmationMessage: '',
            resourceToDelete: {} as Resource
        }
    },
    methods: {
        async fetchResources() {
            this.resources = await resourceService.getAllResources();
            this.updateSelectedResourceName();
        },
        async deleteResource(resource: Resource) {
            this.confirmationMessage = `Are you sure you want to delete ${resource.name}?`;
            this.resourceToDelete = resource;
        },
        cancelAction(){
            this.confirmationMessage = '';
        },
        async confirmAction(){
            this.confirmationMessage = '';
            try {
                await resourceService.deleteResource(this.resourceToDelete);
            }
            catch {
                this.resources = this.resources.filter(res => res.id !== this.resourceToDelete.id);
            }
            this.resources = this.resources.filter(res => res.id !== this.resourceToDelete.id);

            if (this.selectedResourceUsername === this.resourceToDelete.username) {
                this.updateSelectedResourceName();
            }
        },
        formatResourceName(resource: Resource) {
            return `${resource.name} (${resource.username})`;
        },
        async addResource(event: Event) {
            event.preventDefault();
            try {
                const newResource = await resourceService.addResource(this.newName, this.newUsername);
                this.resources.push(newResource);
                this.newName = '';
                this.newUsername = '';

                if (this.resources.length === 1) {
                    this.updateSelectedResourceName();
                }
            }
            catch (error: any) {
                this.onAddFailure(error.error);
            }
        },
        onAddFailure(text: string) {
            this.errorText = text;
            setTimeout(() => {
                this.errorText = '';
            }, 2000);
        },
        updateSelectedResourceName() {
            this.selectedResourceName = this.resources[0]?.name || '';
        }
    },
    computed: {
        selectedResourceUsername(): string {
            return this.resources.find(res => res.name === this.selectedResourceName)?.username || '';
        }
    },
    mounted() {
        this.fetchResources();
    }
});

</script>

<style scoped></style>