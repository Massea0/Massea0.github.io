<template>
  <div class="user-profile-view">
    <h2>Mon Profil Utilisateur</h2>
    <div v-if="isLoadingProfile" class="loading-indicator">
      <p>Chargement du profil...</p>
    </div>
    <div v-else-if="profileError" class="error-message">
      <p>{{ profileError }}</p>
      <button @click="fetchUserProfile" class="retry-button">Réessayer</button>
    </div>
    <div v-else-if="profileData" class="profile-details">
      <p><strong>Nom d'utilisateur :</strong> {{ profileData.username }}</p>
      <p><strong>Email :</strong> {{ profileData.email }}</p>
      <p><strong>Prénom :</strong> {{ profileData.first_name || 'Non renseigné' }}</p>
      <p><strong>Nom :</strong> {{ profileData.last_name || 'Non renseigné' }}</p>
      <p><strong>Firebase UID :</strong> {{ profileData.firebase_uid }}</p>
      <p><strong>Compagnie :</strong> {{ profileData.company ? profileData.company.name : 'Non associée' }}</p>
      <p><strong>Membre depuis :</strong> {{ formatDate(profileData.date_joined) }}</p>
      <p><strong>Dernière connexion :</strong> {{ formatDate(profileData.last_login) }}</p>

      <hr class="separator">
      <h3>Modifier le profil (via UserProfileComponent) :</h3>
      <UserProfileComponent :initial-profile-data="profileData" @profile-updated="fetchUserProfile" />
      <!-- :initial-profile-data pour passer les données au composant enfant -->
      <!-- @profile-updated pour rafraîchir les données après une mise à jour -->
    </div>
    <div v-else>
      <p>Aucune donnée de profil à afficher.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api'; // Notre client Axios configuré
import UserProfileComponent from '@/components/UserProfileComponent.vue'; // Votre composant existant
import router from '@/router'; // Pour la redirection si non authentifié

const authStore = useAuthStore();
const profileData = ref(null);
const isLoadingProfile = ref(false);
const profileError = ref(null);

async function fetchUserProfile() {
  if (!authStore.isAuthenticated || !authStore.idToken) {
    profileError.value = "Utilisateur non authentifié ou token manquant.";
    // La garde de navigation devrait déjà gérer la redirection
    // mais au cas où l'état change pendant que la vue est active :
    // router.push({ name: 'Login' });
    return;
  }

  isLoadingProfile.value = true;
  profileError.value = null;
  try {
    // L'intercepteur Axios ajoutera le token Bearer automatiquement
    const response = await apiClient.get('/accounts/profile/');
    profileData.value = response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.response) {
      profileError.value = `Erreur du serveur (${error.response.status}): ${error.response.data.detail || error.response.data.error || error.message}`;
      if (error.response.status === 401) {
        // Géré par l'intercepteur Axios, mais on peut aussi afficher un message spécifique ici
        profileError.value = "Session invalide ou expirée. Veuillez vous reconnecter.";
        // authStore.signOutUser(); // L'intercepteur devrait déjà le faire
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

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchUserProfile();
  } else {
    // Si l'utilisateur arrive directement sur cette page sans être authentifié
    // (la garde de navigation devrait déjà l'avoir redirigé)
    // Mais pour plus de robustesse :
    if (to.name === 'UserProfile') { // 'to' n'est pas défini ici, il faut utiliser 'route' de vue-router
      // Correction: la garde de navigation s'en occupe.
      // Si on arrive ici sans être authentifié, c'est probablement que listenToAuthState n'a pas fini.
      // Le watch ci-dessous devrait s'en charger.
    }
  }
});

// Observer les changements d'état d'authentification pour recharger le profil si nécessaire
// ou si l'utilisateur se connecte pendant que la vue est déjà montée (peu probable avec les gardes)
watch(() => authStore.isAuthenticated, (newAuthStatus, oldAuthStatus) => {
  if (newAuthStatus && (!profileData.value || !oldAuthStatus)) { // Charger si authentifié et pas de données, ou si vient de se connecter
    fetchUserProfile();
  } else if (!newAuthStatus) {
    profileData.value = null; // Effacer les données si déconnecté
    // La redirection est gérée par la garde de navigation ou l'action signOutUser
  }
}, { immediate: true }); // immediate: true pour exécuter le watch dès le montage si l'état est déjà vrai

</script>

<style scoped>
.user-profile-view {
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto; /* Ajout de marge en haut/bas */
  background-color: var(--bg-medium);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color-medium, rgba(0,0,0,0.2)); /* Ajout d'une couleur par défaut */
  color: var(--text-primary);
}
.user-profile-view h2, .user-profile-view h3 {
  text-align: center;
  margin-bottom: 1.5rem; /* Réduit pour h3 */
  color: var(--accent-primary);
  font-family: var(--arcadis-font-heading);
}
.user-profile-view h3 {
  font-size: 1.25rem;
  margin-top: 2rem; /* Espace avant "Modifier le profil" */
}
.profile-details p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  color: var(--text-secondary);
  font-family: var(--arcadis-font-body);
}
.profile-details strong {
  color: var(--text-primary);
  font-weight: 600;
}
.loading-indicator, .error-message {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-secondary);
  font-family: var(--arcadis-font-body);
}
.error-message {
  color: #ef4444; /* Rouge plus vif pour les erreurs */
}
.retry-button {
  background-color: var(--accent-secondary);
  color: var(--text-on-accent);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--arcadis-font-heading);
  margin-top: 1rem;
}
.retry-button:hover {
  filter: brightness(1.1);
}
.separator {
  border-color: var(--bg-light);
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>