<template>
  <div class="p-4 bg-white rounded-lg shadow border text-gray-600">
    <h3 class="text-lg font-semibold text-gray-800">Project</h3>
    <ul class="list-disc pl-5">
      <li v-for="activity in selectedActivities" :key="activity.activity._id">
        <div>Project: {{ activity.projectName }}</div>
        <div>Phase: {{ activity.phaseName }}</div>
        <div>Activity: {{ activity.activity.title }}</div>
        <div>Deadline: {{ new Date(activity.activity.deadline).toLocaleDateString() }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import projectService from "@/services/projectService";
import {useAuthStore} from "@/stores/authStore";

export default defineComponent({
  props: {
    date: {
      type: Date,
      required: true,
    },
    assigned: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      projects: [],
      username: useAuthStore().user.username
    }
  },
  methods: {},
  async created() {
    this.projects = await projectService.getAllProjects();
  },
  computed: {
    activities(): any[] {
      return this.projects
          .flatMap((project: any) =>
              project.phases.flatMap((phase: any) =>
                  phase.activities.map((activity: any) => ({
                    ...activity,
                    phaseName: phase.title,
                    projectName: project.title
                  }))
              )
          )
          .sort((a: any, b: any) => new Date(a.activity.deadline).getTime() - new Date(b.activity.deadline).getTime());
    },
    unfinishedActivities(): any[] {
      return this.activities.filter((activity: any) => activity.status != 'Concluded');
    },
    assignedActivities(): any[] {
      return this.activities.filter((activity: any) => activity.activity.participants.map((participant: any) => participant.username).includes(this.username));
    },
    selectedActivities(): any[] {
      return this.assigned ? this.assignedActivities.slice(0,5) : this.unfinishedActivities.slice(0,5);
    }
  },
  watch: {
    date: {
      immediate: true,
      async handler() {
        this.projects = await projectService.getAllProjects();
      }
    }
  }
});
</script>