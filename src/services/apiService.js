// src/services/apiService.js
import axios from 'axios';
import {auth} from '@/firebase/config.js'; // Importez votre instance d'authentification Firebase

// Configurez l'URL de base de votre API Django.
// Pendant le développement, Django tourne généralement sur http://127.0.0.1:8000
// Assurez-vous que cette URL correspond à celle où votre backend Django est accessible.
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Adaptez si votre API Django est sur un autre port ou préfixe
    headers: {
        'Content-Type': 'application/json',
        // Vous pouvez ajouter d'autres en-têtes par défaut ici si nécessaire
    },
});

// Intercepteur de requête Axios
// Cet intercepteur s'exécutera AVANT chaque requête envoyée par 'apiClient'.
apiClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser; // Récupère l'utilisateur Firebase actuellement connecté

        if (user) {
            try {
                // Récupère le token d'ID Firebase.
                // L'argument 'true' force le rafraîchissement du token s'il est sur le point d'expirer.
                const idToken = await user.getIdToken(true);
                // Ajoute le token à l'en-tête 'Authorization' de la requête.
                // C'est ce que votre backend Django (FirebaseAuthentication) attend.
                config.headers.Authorization = `Bearer ${idToken}`;
                console.log('Token Firebase ajouté à la requête:', idToken.substring(0, 20) + "..."); // Pour débogage
            } catch (error) {
                console.error("Erreur lors de la récupération du token Firebase:", error);
                // Vous pourriez vouloir gérer cette erreur plus en détail,
                // par exemple, déconnecter l'utilisateur ou l'empêcher de faire l'appel.
                // Pour l'instant, si le token ne peut pas être récupéré, la requête partira sans,
                // et le backend devrait renvoyer une erreur 401 (Non autorisé).
            }
        } else {
            console.log("Aucun utilisateur Firebase connecté, la requête partira sans token d'autorisation.");
        }
        return config; // Retourne la configuration de la requête (avec ou sans le token)
    },
    (error) => {
        // Gère les erreurs de configuration de la requête
        console.error("Erreur dans l'intercepteur de requête Axios:", error);
        return Promise.reject(error);
    }
);

// Fonction pour récupérer le profil utilisateur depuis votre API Django
export const fetchUserProfile = async () => {
    try {
        // L'intercepteur s'occupera d'ajouter le token d'authentification.
        // L'URL ici est relative à 'baseURL' configurée dans apiClient.
        // Donc, '/accounts/profile/' deviendra 'http://127.0.0.1:8000/api/accounts/profile/'
        const response = await apiClient.get('/accounts/profile/');
        return response.data; // Retourne les données du profil
    } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur via API:', error.response || error);
        // Propagez l'erreur pour qu'elle puisse être gérée par le composant qui appelle cette fonction.
        // error.response contient souvent des détails utiles de la réponse du serveur (status, data).
        throw error;
    }
};

// Vous pourrez ajouter d'autres fonctions pour d'autres appels API ici :
// export const fetchInvoices = async (params) => { ... };
// export const createInvoice = async (invoiceData) => { ... };