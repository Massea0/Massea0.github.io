<template>
  <div id="app-layout">
    <header class="app-header">
      <nav class="main-navigation container">
        <router-link to="/" class="nav-item site-logo">
          <!-- Emplacement pour le logo -->
          <img v-if="logoUrl" :src="logoUrl" alt="Arcadis Space Logo" class="logo-image" />
          <span v-else>Arcadis Space</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-item">Accueil</router-link>
          <template v-if="isAuthenticated">
            <router-link to="/profile" class="nav-item">Mon Profil</router-link>
            <!-- NOUVEAU LIEN POUR LES FACTURES AJOUTÉ ICI -->
            <router-link :to="{ name: 'InvoicesList' }" class="nav-item">Mes Factures</router-link>
            <button @click="handleLogout" class="nav-item nav-button">Déconnexion</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-item">Connexion</router-link>
            <router-link to="/register" class="nav-item">Inscription</router-link>
          </template>
        </div>
        <!-- TODO: Ajouter un bouton pour le menu mobile ici plus tard -->
      </nav>
    </header>

    <main class="app-main-content">
      <!-- Afficher un indicateur de chargement global pendant que Firebase vérifie l'état d'auth -->
      <div v-if="isLoadingAuthGlobal" class="loading-indicator">
        <p>Vérification de l'authentification...</p>
      </div>
      <router-view v-else />
    </main>

    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} Arcadis Space. Tous droits réservés.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isLoadingAuthGlobal = computed(() => authStore.isLoadingAuth);

onMounted(() => {
  authStore.listenToAuthState();
});

async function handleLogout() {
  await authStore.signOutUser();
}

const logoUrl = '/img/logo.svg';
</script>

<style scoped>
/* Styles spécifiques à App.vue, utilisant les variables globales de global.css */

.app-header {
  background-color: var(--bg-medium);
  color: var(--text-primary);
  box-shadow: 0 2px 10px var(--shadow-color-light);
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.main-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* Classe container pour centrer le contenu.
   Assurez-vous qu'elle est définie dans global.css ou ici si elle est spécifique.
*/
.container {
  width: 90%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem; /* Empêche le contenu de coller aux bords */
  padding-right: 1rem;
}


.site-logo {
  font-weight: bold;
  font-size: 1.5rem; /* Ajustez si le logo textuel est utilisé */
  font-family: var(--arcadis-font-heading);
  color: var(--text-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-image {
  /* S'assure que le logo s'adapte bien à la hauteur de la navbar */
  max-height: calc(var(--navbar-height) * 0.75); /* 75% de la hauteur de la navbar, ajustez au besoin */
  width: auto; /* Maintient les proportions de l'image */
  object-fit: contain; /* S'assure que l'image entière est visible et bien proportionnée */
  margin-right: 0.75rem; /* Espace si vous avez aussi du texte à côté du logo */
}


.nav-links {
  display: flex;
  align-items: center;
}

.nav-item {
  font-family: var(--arcadis-font-heading);
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-left: 1.8rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color var(--theme-transition-duration) ease;
}

.nav-item.site-logo { /* Le logo lui-même (router-link) */
  margin-left: 0;
}

.nav-item:hover {
  color: var(--accent-primary);
}

.nav-item::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--accent-primary);
  transition: width 0.3s ease-in-out;
  border-radius: 1px;
}

.nav-item:hover::after,
.nav-item.router-link-exact-active::after {
  width: 60%;
}

.nav-item.router-link-exact-active {
  color: var(--accent-primary);
  font-weight: 600;
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  /* Hérite des styles de .nav-item pour la police, couleur, etc. */
  /* Ajouts pour cohérence avec les liens */
  font-family: var(--arcadis-font-heading);
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: 0.5rem 0; /* Assure un alignement vertical similaire */
  margin-left: 1.8rem; /* Conserve l'espacement */
}
.nav-button:hover {
  color: var(--accent-primary);
}


/* Styles pour le contenu principal et le pied de page */
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--arcadis-font-body);
  background-color: var(--bg-deep);
  color: var(--text-primary);
}

.app-main-content {
  flex-grow: 1;
  padding-top: var(--navbar-height); /* Pour compenser le header fixe */
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.app-footer {
  background-color: var(--bg-medium);
  color: var(--text-secondary);
  text-align: center;
  padding: 1.5rem;
  font-size: 0.85rem;
  box-shadow: 0 -2px 5px var(--shadow-color-light);
}
</style>