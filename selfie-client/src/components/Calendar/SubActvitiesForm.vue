<template>
    <div class="absolute inset-0 bg-white rounded-lg w-full h-full p-4 overflow-scroll">
        <h2 class="text-lg font-semibold mb-2">Subactivities</h2>
        <ul>
            <li v-for="(sub, index) in sortedSubactivities" :key="index" class="flex justify-between items-center">
                <p>{{ sub.title }} </p>
                <div class="flex items-center">
                    <v-icon name="bi-circle-fill" class="mr-2" :class="sub.done ? 'completed' : 'uncompleted'"></v-icon>
                    <button @click="modifySubactivity(sub)"><v-icon name="md-navigatenext"></v-icon></button>
                </div>
            </li>
        </ul>
        <button @click="addSubactivity" class="py-1 px-2 mt-2 bg-blue-500 text-white rounded-md">Add new
            subactivity</button>
        <div class="flex w-full space-x-1 mt-8">
            <button type="button" @click="closeForm" class="flex-1 bg-red-600 text-white p-1 rounded-lg">Back</button>
            <button type="submit" @click="saveChanges"
                class="flex-1 bg-emerald-600 text-white p-1 rounded-lg">Save</button>
        </div>

        <ActivityForm class="absloute inset-0" v-if="showActivityForm" :activity="selectedSub"
            :current-date="currentDate" :modifying="modifying" @delete-activity="deleteSubactivity"/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { Activity } from '@/models/Activity';
import ActivityForm from './ActivityForm.vue';

export default defineComponent({
    components: {
        ActivityForm
    },
    emits: ['closeForm', 'saveChanges'],
    props: {
        subActivitiesIDs: {
            type: Array,
            required: true,
        },
        currentDate: {
            type: Date,
            required: true,
        }
    },
    data() {
        return {
            newSubs: [] as Activity[],
            selectedSub: {} as Activity,
            showActivityForm: false,
            modifying: false,
        };
    },
    methods: {
        addSubactivity() {
            this.selectedSub = new Activity();
            this.showActivityForm = true;
        },
        deleteSubactivity(sub: Activity) {
            //sthis.newSubs.splice(index, 1);
        },
        modifySubactivity(sub: Activity) {
            this.selectedSub = sub;
            this.modifying = true;
            this.showActivityForm = true;
        },
        saveChanges() {
            this.$emit('saveChanges', this.newSubs);
        },
        closeForm() {
            this.$emit('closeForm');
        },

    },
    computed: {
        sortedSubactivities(): Activity[] {
            return this.newSubs;
        }
    }
});
</script>

<style scoped>
.completed {
    color: green;
}

.uncompleted {
    color: orange;
}
</style>