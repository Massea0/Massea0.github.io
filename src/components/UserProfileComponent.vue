<template>
  <div class="user-profile-view">
    <h2>Mon Profil Django</h2>
    <div v-if="isLoadingProfile" class="loading-indicator">
      Chargement du profil Django...
    </div>
    <div v-else-if="profileError" class="error-message">
      <p>{{ profileError }}</p>
    </div>
    <div v-else-if="profileData" class="profile-details">
      <p><strong>Nom d'utilisateur (Django):</strong> {{ profileData.username }}</p>
      <p><strong>Email (Django):</strong> {{ profileData.email }}</p>
      <p><strong>Prénom (Django):</strong> {{ profileData.first_name || 'Non renseigné' }}</p>
      <p><strong>Nom (Django):</strong> {{ profileData.last_name || 'Non renseigné' }}</p>
      <p><strong>Entreprise (Django):</strong> {{ profileData.company_name || 'Non renseignée' }}</p>
      <p><strong>Firebase UID (Django):</strong> {{ profileData.firebase_uid || 'Non lié' }}</p>
      <p><strong>Date d'inscription (Django):</strong> {{ formatDate(profileData.date_joined) }}</p>
      <p><strong>Dernière connexion (Django):</strong> {{ formatDate(profileData.last_login) }}</p>
    </div>
    <div v-else>
      <p>Aucune donnée de profil Django à afficher.</p>
    </div>

    <hr style="margin: 20px 0;">

    <div class="edit-profile">
      <h3>Modifier mon profil Firebase</h3>
      <!-- LIGNES DE DÉBOGAGE -->
      <div v-if="showDebugInfo" style="border: 1px dashed red; padding: 10px; margin-bottom: 15px;">
        <h4>Infos de débogage du composant :</h4>
        <p>Utilisateur du store (UID) : <strong>{{ authStore.user ? authStore.user.uid : 'Non défini (null/undefined)' }}</strong></p>
        <p>Utilisateur du store (displayName) : <strong>{{ authStore.user ? (authStore.user.displayName || 'Vide ou null') : 'N/A' }}</strong></p>
        <p>Valeur de newDisplayName (champ du formulaire) : <strong>{{ newDisplayName }}</strong></p>
        <p>isAuthenticated (store): <strong>{{ authStore.isAuthenticated }}</strong></p>
      </div>

      <div v-if="authStore.isAuthenticated && authStore.user">
        <form @submit.prevent="handleProfileUpdate">
          <div>
            <label for="displayName">Nom d'affichage (Firebase):</label>
            <input type="text" id="displayName" v-model="newDisplayName" />
          </div>
          <button type="submit" :disabled="authStore.isLoadingAuth || !authStore.user">
            {{ authStore.isLoadingAuth ? 'Mise à jour...' : 'Mettre à jour le nom (Firebase)' }}
          </button>
          <p v-if="updateSuccessMessage" class="success-message">{{ updateSuccessMessage }}</p>
          <p v-if="updateErrorMessage" class="error-message">{{ updateErrorMessage }}</p>
        </form>
      </div>
      <div v-else>
        <p style="color: orange;">Veuillez vous connecter pour modifier votre profil Firebase.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api'; // Notre client Axios configuré

const authStore = useAuthStore();
const profileData = ref(null);
const isLoadingProfile = ref(false);
const profileError = ref(null);

// Pour la modification du profil Firebase
const newDisplayName = ref('');
const updateSuccessMessage = ref('');
const updateErrorMessage = ref('');
const showDebugInfo = ref(true); // Mettre à false pour la production (ou supprimer)

async function fetchUserProfile() {
  isLoadingProfile.value = true;
  profileError.value = null;
  try {
    const response = await apiClient.get('/accounts/profile/');
    profileData.value = response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.response) {
      profileError.value = `Erreur du serveur (${error.response.status}): ${error.response.data.detail || error.response.data.error || error.message}`;
      if (error.response.status === 401) {
        profileError.value = "Session invalide ou expirée. Vous allez être déconnecté.";
        // L'intercepteur Axios dans api.js devrait gérer la déconnexion.
      }
    } else if (error.request) {
      profileError.value = "Impossible de joindre le serveur. Vérifiez votre connexion et que le backend est démarré.";
    } else {
      profileError.value = "Une erreur est survenue lors du chargement du profil.";
    }
  } finally {
    isLoadingProfile.value = false;
  }
}

// Formatter la date pour un affichage plus lisible
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Initialiser newDisplayName avec la valeur du store au montage
onMounted(() => {
  if (authStore.user && authStore.user.displayName) {
    newDisplayName.value = authStore.user.displayName;
  }
  // fetchUserProfile est déjà appelé par le watcher immediate:true si authentifié
});

// Mettre à jour newDisplayName si le displayName du store change (par exemple après une mise à jour réussie)
watch(() => authStore.user?.displayName, (newName) => {
  if (newName) {
    newDisplayName.value = newName;
  }
});

async function handleProfileUpdate() {
  if (!authStore.user) {
    updateErrorMessage.value = "Utilisateur non authentifié.";
    return;
  }
  if (!newDisplayName.value.trim()) {
    updateErrorMessage.value = "Le nom d'affichage ne peut pas être vide.";
    setTimeout(() => updateErrorMessage.value = '', 3000);
    return;
  }

  updateSuccessMessage.value = '';
  updateErrorMessage.value = '';

  const success = await authStore.updateFirebaseUserProfile({ displayName: newDisplayName.value.trim() });
  if (success) {
    updateSuccessMessage.value = 'Nom d\'affichage Firebase mis à jour avec succès !';
    // Le watch sur authStore.user?.displayName devrait mettre à jour newDisplayName.value
  } else {
    updateErrorMessage.value = authStore.authError || "Erreur lors de la mise à jour du nom d'affichage Firebase.";
  }
  setTimeout(() => {
    updateSuccessMessage.value = '';
    updateErrorMessage.value = '';
  }, 3000);
}

// Observer les changements d'état d'authentification pour recharger le profil si nécessaire
watch(() => authStore.isAuthenticated, (newAuthStatus, oldAuthStatus) => {
  if (newAuthStatus) {
    if (!profileData.value || (oldAuthStatus === false && newAuthStatus === true)) {
      fetchUserProfile();
    }
    // S'assurer que newDisplayName est initialisé si l'utilisateur se connecte
    // et que le champ n'a pas encore été rempli par le onMounted ou un autre watch.
    if (authStore.user && authStore.user.displayName && !newDisplayName.value) {
      newDisplayName.value = authStore.user.displayName;
    }
  } else {
    profileData.value = null;
    profileError.value = null;
    newDisplayName.value = ''; // Effacer aussi le champ du formulaire
  }
}, { immediate: true });

</script>

<style scoped>
.user-profile-view {
  /* Styles pour la vue globale du profil si nécessaire */
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: var(--bg-light, #f4f4f4); /* Utilisez vos variables CSS globales */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  color: var(--text-primary, #333);
}

.loading-indicator, .error-message {
  text-align: center;
  padding: 15px;
  margin-top: 10px;
  border-radius: 4px;
}
.loading-indicator {
  color: var(--text-secondary, #555);
}
.error-message p {
  color: var(--accent-secondary, red); /* Utilisez vos variables CSS globales */
  background-color: rgba(255,0,0,0.1);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--accent-secondary, red);
}

.profile-details p {
  margin: 8px 0;
  line-height: 1.6;
}
.profile-details strong {
  color: var(--text-primary, #111);
}

.edit-profile {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid var(--bg-medium, #ccc); /* Utilisez vos variables CSS globales */
  border-radius: 8px;
  background-color: var(--bg-medium, #f9f9f9); /* Utilisez vos variables CSS globales */
}
.edit-profile h3 {
  margin-top: 0;
  color: var(--text-primary, #333);
}
.edit-profile div {
  margin-bottom: 15px;
}
.edit-profile label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--text-secondary, #555);
}
.edit-profile input[type="text"] {
  width: calc(100% - 24px); /* Ajustez pour le padding et la bordure */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* Important pour que width 100% inclue padding/border */
  background-color: var(--bg-deep, #fff); /* Utilisez vos variables CSS globales */
  color: var(--text-primary, #333);
}
.edit-profile button {
  padding: 10px 20px;
  background-color: var(--accent-primary, #007bff); /* Utilisez vos variables CSS globales */
  color: var(--text-on-accent, white); /* Utilisez vos variables CSS globales */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.edit-profile button:hover:not(:disabled) {
  background-color: darken(var(--accent-primary, #007bff), 10%); /* Assombrir un peu au survol */
}
.edit-profile button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.success-message {
  color: green;
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}
.error-message { /* Style pour les erreurs de formulaire aussi */
  color: var(--accent-secondary, red);
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

hr {
  border: none;
  border-top: 1px solid var(--bg-medium, #eee); /* Utilisez vos variables CSS globales */
}
</style>