<template>
  <div class="register-view">
    <h2>Inscription</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="firstName">Prénom :</label>
        <input type="text" id="firstName" v-model="firstName" required autocomplete="given-name" />
      </div>
      <div class="form-group">
        <label for="lastName">Nom :</label>
        <input type="text" id="lastName" v-model="lastName" required autocomplete="family-name" />
      </div>
      <div class="form-group">
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password" required autocomplete="new-password" />
      </div>
      <!-- Optionnel: Confirmer le mot de passe -->
      <!-- <div class="form-group">
        <label for="confirmPassword">Confirmer le mot de passe :</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required autocomplete="new-password" />
      </div> -->
      <button type="submit" :disabled="authStore.isLoadingAuth" class="submit-button">
        {{ authStore.isLoadingAuth ? 'Inscription en cours...' : "S'inscrire" }}
      </button>
      <p v-if="authStore.authError" class="error-message">{{ authStore.authError }}</p>
      <p class="form-footer">
        Déjà un compte ? <router-link to="/login">Connectez-vous ici</router-link>.
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
// const confirmPassword = ref(''); // Si vous ajoutez la confirmation

async function handleRegister() {
  // if (password.value !== confirmPassword.value) { // Logique de confirmation si activée
  //   authStore.authError = "Les mots de passe ne correspondent pas.";
  //   return;
  // }
  await authStore.signUp(email.value, password.value, firstName.value, lastName.value);
  if (authStore.isAuthenticated) {
    // Rediriger vers la page demandée avant la connexion (si pertinent ici), ou le profil par défaut
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
/* Styles similaires à LoginView.vue pour la cohérence */
.register-view {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--bg-light);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color-light);
  background-color: var(--bg-medium);
}
.register-view h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-family: var(--arcadis-font-heading);
}
.register-form .form-group {
  margin-bottom: 1rem;
}
.register-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-family: var(--arcadis-font-body);
}
.register-form input[type="text"],
.register-form input[type="email"],
.register-form input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--bg-light);
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--arcadis-font-body);
}
.register-form input[type="text"]:focus,
.register-form input[type="email"]:focus,
.register-form input[type="password"]:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-hover-shadow, rgba(160, 216, 239, 0.3));
}
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-secondary); /* Couleur d'accent secondaire pour l'inscription */
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
  filter: brightness(1.1); /* Un peu plus clair au survol */
}
.submit-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.error-message {
  color: #f87171;
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