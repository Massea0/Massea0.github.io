// /Users/a00/arcadis_frontend/arcadis_space_vue/src/router/index.js
import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import UserProfileView from '../views/UserProfileView.vue';
// NOUVEAUX IMPORTS POUR LES VUES DE FACTURATION
import InvoicesListView from '../views/InvoicesListView.vue';
import InvoiceDetailView from '../views/InvoiceDetailView.vue';

import {useAuthStore} from '@/stores/authStore';

const routes = [
    {path: '/', name: 'Home', component: HomeView},
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: {requiresGuest: true}
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        meta: {requiresGuest: true}
    },
    {
        path: '/profile',
        name: 'UserProfile',
        component: UserProfileView,
        meta: {requiresAuth: true}
    },
    // NOUVELLES ROUTES POUR LA FACTURATION
    {
        path: '/invoices', // URL pour la liste des factures
        name: 'InvoicesList', // Nom de la route
        component: InvoicesListView,
        meta: {requiresAuth: true} // Nécessite que l'utilisateur soit connecté
    },
    {
        path: '/invoices/:id', // URL pour le détail d'une facture, avec un paramètre 'id'
        name: 'InvoiceDetail', // Nom de la route
        component: InvoiceDetailView,
        meta: {requiresAuth: true}, // Nécessite que l'utilisateur soit connecté
        props: true // Permet de passer les params de la route (comme :id) en props au composant
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated; // Utilise le getter du store

    // Attendre que l'état d'authentification initial soit résolu si ce n'est pas déjà fait
    // Ceci est important si l'utilisateur accède directement à une URL protégée
    if (authStore.isLoadingAuth) {
        // Créer une promesse qui se résout quand isLoadingAuth devient false
        await new Promise(resolve => {
            const unwatch = authStore.$subscribe((mutation, state) => {
                if (!state.isLoadingAuth) {
                    unwatch(); // Arrêter d'écouter une fois résolu
                    resolve();
                }
            });
            // Au cas où isLoadingAuth est déjà false au moment de l'abonnement
            if (!authStore.isLoadingAuth) {
                unwatch();
                resolve();
            }
        });
    }
    // Mettre à jour isAuthenticated après avoir attendu la fin de isLoadingAuth
    const finalIsAuthenticated = authStore.isAuthenticated;


    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

    if (requiresAuth && !finalIsAuthenticated) {
        console.log("Navigation guard: requiresAuth=true, isAuthenticated=false. Redirecting to /login.");
        next({name: 'Login', query: {redirect: to.fullPath}});
    } else if (requiresGuest && finalIsAuthenticated) {
        console.log("Navigation guard: requiresGuest=true, isAuthenticated=true. Redirecting to /profile.");
        next({name: 'UserProfile'});
    } else {
        console.log("Navigation guard: proceeding to route:", to.name || to.path);
        next();
    }
});

export default router;