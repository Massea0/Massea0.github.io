<template>
  <div class="login-view">
    <h2>Connexion</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password" required autocomplete="current-password" />
      </div>
      <button type="submit" :disabled="authStore.isLoadingAuth" class="submit-button">
        {{ authStore.isLoadingAuth ? 'Connexion en cours...' : 'Se connecter' }}
      </button>
      <p v-if="authStore.authError" class="error-message">{{ authStore.authError }}</p>
      <p class="form-footer">
        Pas encore de compte ? <router-link to="/register">Inscrivez-vous ici</router-link>.
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router'; // useRoute pour la redirection

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); // Pour accéder aux query params

const email = ref('');
const password = ref('');

async function handleLogin() {
  await authStore.signIn(email.value, password.value);
  if (authStore.isAuthenticated) {
    // Rediriger vers la page demandée avant la connexion, ou le profil par défaut
    const redirectPath = route.query.redirect || { name: 'UserProfile' };
    router.push(redirectPath);
  }
}

// Nettoyer les erreurs d'authentification quand le composant est quitté
onUnmounted(() => {
  authStore.authError = null;
});
</script>

<style scoped>
/* Styles similaires à ceux que vous aviez, ou adaptez avec Tailwind si vous le souhaitez */
.login-view {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--bg-light); /* Utilisation de vos variables CSS globales */
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color-light);
  background-color: var(--bg-medium);
}
.login-view h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-family: var(--arcadis-font-heading);
}
.login-form .form-group {
  margin-bottom: 1rem;
}
.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-family: var(--arcadis-font-body);
}
.login-form input[type="email"],
.login-form input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--arcadis-font-body);
}
.login-form input[type="email"]:focus,
.login-form input[type="password"]:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-hover-shadow, rgba(160, 216, 239, 0.3)); /* Ajout d'une couleur par défaut */
}
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-primary);
  color: var(--text-on-accent);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--arcadis-font-heading);
  transition: background-color 0.3s ease;
}
.submit-button:hover {
  background-color: var(--accent-secondary); /* Ou une version plus foncée de accent-primary */
}
.submit-button:disabled {
  background-color: #aaa; /* Ou une variable CSS pour l'état désactivé */
  cursor: not-allowed;
}
.error-message {
  color: #f87171; /* Rouge clair pour l'erreur */
  margin-top: 1rem;
  text-align: center;
  font-family: var(--arcadis-font-body);
}
.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: var(--arcadis-font-body);
}
.form-footer a {
  color: var(--accent-primary);
  text-decoration: none;
}
.form-footer a:hover {
  text-decoration: underline;
}
</style>