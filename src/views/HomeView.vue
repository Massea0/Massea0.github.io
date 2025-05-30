<template>
  <div class="home-view">
    <h1>Bienvenue sur Arcadis Space</h1>
    <p>Ceci est la page d'accueil de notre application.</p>
    <p v-if="authStore.isAuthenticated && authStore.user">
      Vous êtes connecté en tant que {{ authStore.user.displayName || authStore.user.email }}.
    </p>
    <p v-else>
      Veuillez vous connecter pour voir plus de contenu.
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'; // Importez le store Pinia

const authStore = useAuthStore(); // Utilisez le store

// Plus besoin de 'currentUser' de l'ancien service,
// vous pouvez accéder directement à authStore.user ou authStore.isAuthenticated dans le template
// ou via des computed properties si nécessaire pour une logique plus complexe.
// const user = computed(() => authStore.user); // Si vous préférez l'utiliser ainsi
</script>

<style scoped>
.home-view {
  text-align: center;
  padding: 20px;
}
</style>