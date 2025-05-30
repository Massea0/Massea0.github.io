<!-- src/components/LoginComponent.vue -->
<template>
  <div class="login-container">
    <h2>Connexion au Portail Arcadis Space</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email :</label>
        <input type="email" id="email" v-model="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Mot de passe :</label>
        <input type="password" id="password" v-model="password" required autocomplete="current-password" />
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
      </button>
      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config.js'; // Assurez-vous que le chemin est correct

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const emit = defineEmits(['userLoggedIn']);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log('Utilisateur connecté:', userCredential.user);
    emit('userLoggedIn', userCredential.user);
  } catch (error) {
    console.error('Erreur de connexion Firebase:', error.code, error.message);
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage.value = 'L\'adresse email n\'est pas valide.';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage.value = 'Email ou mot de passe incorrect.';
        break;
      case 'auth/user-disabled':
        errorMessage.value = 'Ce compte utilisateur a été désactivé.';
        break;
      case 'auth/too-many-requests':
        errorMessage.value = 'Trop de tentatives de connexion. Veuillez réessayer plus tard ou réinitialiser votre mot de passe.';
        break;
      case 'auth/network-request-failed':
        errorMessage.value = 'Erreur de réseau. Veuillez vérifier votre connexion et réessayer.';
        break;
      default:
        errorMessage.value = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600; /* Un peu plus de poids pour le titre */
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box; /* Important pour que width: 100% fonctionne comme attendu avec padding/border */
}

.form-group input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

button {
  width: 100%;
  padding: 12px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
}

button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #0056b3;
}

.error-message {
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
  font-size: 0.9rem;
}
</style>