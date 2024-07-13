<script septup lang="ts">
import { ref, defineComponent } from 'vue'
import noteService from '@/services/noteService';

const title = ref('')
const content = ref('')

export default defineComponent({
  name: 'NoteView',
})
</script>

<template>
    <h1>NOTE VIEW</h1>
    
	<textarea v-model="title" placeholder="title"></textarea>
	<textarea v-model="content" placeholder="content"></textarea>
    <button @click="noteService.create()">save</button>
</template>

<style scoped>

</style>