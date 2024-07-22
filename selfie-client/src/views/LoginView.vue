<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-3">
    <div class="absolute inset-0 overflow-hidden">
      <div
          class="[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--aurora:repeating-linear-gradient(100deg,var(--green-500)_10%,var(--emerald-300)_15%,var(--green-300)_20%,var(--teal-200)_25%,var(--green-400)_30%)] [background-image:var(--white-gradient),var(--aurora)] dark:[background-image:var(--dark-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] filter blur-[10px] invert dark:invert-0 after:content-[&quot;&quot;] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:dark:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform [mask-image:radial-gradient(ellipse_at_100%_10%,black_10%,var(--transparent)_75%)]"></div>
    </div>
    <div
        class="animate-fade-in w-full max-w-xs p-5 sm:p-10 pt-1 sm:pt-2 rounded shadow-2xl shadow-emerald-600 z-10 relative bg-[#fdfefd]">
      <img src="@/assets/selfie.jpeg" alt="bradipo che si fa un selfie"/>
      <input v-model="username" v-on:keyup.enter="login" aria-label="Username"
             class="w-full px-3 py-2 mb-3 border rounded" placeholder="Username"/>
      <input type="password" v-on:keyup.enter="login" aria-label="Password" v-model="password"
             class="w-full px-3 py-2 mb-3 border rounded" placeholder="Password"/>
      <button @click="login" v-on:keyup.enter="login" aria-label="Login"
              class="w-full px-3 py-2 text-white bg-emerald-500 mb-3 rounded">Login
      </button>
      <p v-if="errorMessage" class="mb-3 text-red-500">{{ errorMessage }}</p>
      <div class="text-center w-full">
        <router-link to="/register" class="text-emerald-500">Non hai un account? Registrati</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useAuthStore} from '@/stores/authStore';
import authService from '@/services/authService';
import router from "@/router";

export default defineComponent({
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref(router.currentRoute.value.params.message);
    const authStore = useAuthStore();

    const login = async () => {
      try {
        if (username.value.trim() == "" || password.value.trim() == "") {
          throw "I valori dei campi non possono essere vuoti!";
        } /*else if (username.value == "fl") {
          authStore.setUser({username:"pippo", real_name: "pippo"})
          router.push({name: 'home'})
        }*/
        const data = await authService.login(username.value, password.value);
        authStore.setUser(data.user);
        router.push({name: 'home'})
      } catch (error: any) {
        errorMessage.value = error;
      }
    };

    return {
      username,
      password,
      login,
      errorMessage,
    };
  },
});
</script>

<style>
.bg-tropical {
  background-image: url("@/assets/tropical.jpg");
  background-repeat: repeat;
  background-size: 100vh;
}

@media (max-width: 640px) {
  .bg-tropical {
    background-size: 100vw;
  }
}
</style>
