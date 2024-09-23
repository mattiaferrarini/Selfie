<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" @click.stop="close">
        <div class="bg-white m-4 p-4 rounded-lg shadow-lg flex flex-col justify-center text-center" @click.stop>
            <h2 class="text-xl font-bold mb-8 mt-4 text-red-500">Something went wrong</h2>
            <p class="my-2" v-for="(message, index) in messages" :key="index">{{ message }}</p>
            <p class="my-2" >Please try again later.</p>
            <div class="flex mt-8 gap-x-2">
                <button @click.stop="close" class="flex-1 px-4 py-2 bg-gray-400 text-white rounded-md">Close</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
    export default defineComponent({
        props: {
            messages: {
                type: Array as () => string[],
                required: true
            }
        },
        emits: ['close'],
        methods: {
            close() {
                this.$emit('close');
            }
        }
    });
</script>

<style scoped>

</style>