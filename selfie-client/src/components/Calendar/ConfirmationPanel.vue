<template>
    <div class="fixed inset-0 flex justify-center items-center bg-emerald-600 z-50" @click.stop="cancel">
        <div class="bg-white m-4 p-8 rounded-lg shadow-lg flex flex-col justify-center text-center">
            <h2 class="text-3xl font-bold mb-8 mt-4">Are you sure?</h2>
            <p class="my-4">{{ message }}</p>
            <div class="flex mt-8 gap-x-2">
                <button @click="cancel" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg">Cancel</button>
                <button @click="confirm" class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg">Confirm</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
    export default defineComponent({
        props: {
            message: {
                type: String,
                required: true
            }
        },
        emits: ['cancel', 'confirm'],
        methods: {
            cancel() {
                this.$emit('cancel');
            },
            confirm() {
                this.$emit('confirm');
            }
        }
    });
</script>

<style scoped>

</style>