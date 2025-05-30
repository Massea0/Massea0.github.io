// /Users/a00/arcadis_frontend/arcadis_space_vue/src/services/api.js
import axios from 'axios';
import {useAuthStore} from '@/stores/authStore';
import {pinia} from '@/main'; // Importez l'instance pinia depuis main.js

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api', // L'URL de base de votre API Django
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token d'ID Firebase à chaque requête sortante
apiClient.interceptors.request.use(
    (config) => {
        // Obtenez l'instance du store en passant l'instance pinia
        // UNIQUEMENT quand l'intercepteur est effectivement appelé
        const authStore = useAuthStore(pinia);
        const token = authStore.idToken;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Obtenez l'instance du store en passant l'instance pinia
            const authStore = useAuthStore(pinia);
            console.warn("Unauthorized request or token expired. Logging out.");
            authStore.signOutUser(); // Assurez-vous que cette action redirige bien vers la page de connexion
        }
        return Promise.reject(error);
    }
);

// Fonctions existantes (si vous en aviez d'autres pour le profil par exemple)
// export const fetchUserProfile = async () => { ... };
// export const syncUserWithBackend = async (userData) => { ... }; // Exemple, si vous aviez une fonction pour sync-user

// NOUVELLES FONCTIONS POUR LA FACTURATION
/**
 * Récupère la liste des factures pour l'utilisateur authentifié.
 */
export const fetchInvoices = async () => {
    try {
        const response = await apiClient.get('/billing/invoices/');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error.response || error);
        throw error; // Propage l'erreur pour la gérer dans le composant ou le store
    }
};

/**
 * Récupère les détails d'une facture spécifique par son ID.
 * @param {string|number} invoiceId - L'ID de la facture.
 */
export const fetchInvoiceById = async (invoiceId) => {
    try {
        const response = await apiClient.get(`/billing/invoices/${invoiceId}/`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la facture ${invoiceId}:`, error.response || error);
        throw error; // Propage l'erreur
    }
};

export default apiClient; // Vous pouvez continuer à exporter apiClient si d'autres modules l'utilisent directement
// ou choisir de n'exporter que les fonctions spécifiques.
// Pour l'instant, gardons l'export par défaut et exportons aussi les fonctions.