<script septup lang="ts">
import { ref, defineComponent } from "vue";
import noteService from "@/services/noteService";

export default defineComponent({
  setup() {
    const allnotes = ref(noteService.getall())
    console.log(allnotes.value)

    const createRandomNote = async () => {
      await noteService.create(createRandomString(50), createRandomString(10), '1-1-1', '1-1-1')
    }

    const createRandomString = (length: number): string => {

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    
    return {
      allnotes,
      createRandomNote
    }
  }
})
</script>

<template>
  <div>
    <h1>NOTE VIEW</h1>
    <button @click="createRandomNote()">create empty</button>
    <div>
      <div v-for="note in allnotes" :key="note.id">
        <h3>{{ note.title }}</h3>
        <p>{{ note.content }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
