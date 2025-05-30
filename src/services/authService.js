// src/services/authService.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile // Renommé pour éviter conflit de nom
} from "firebase/auth";
import {auth} from '@/firebase/config.js'; // Votre instance d'auth Firebase initialisée
import {ref} from 'vue'; // Pour la réactivité de l'état de l'utilisateur

// Référence réactive pour l'utilisateur Firebase actuellement connecté
const currentUser = ref(auth.currentUser);
const isLoadingAuth = ref(true); // Pour savoir si l'état initial d'auth a été déterminé

// Observer les changements d'état d'authentification
// Cela mettra à jour currentUser de manière réactive
onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    isLoadingAuth.value = false; // L'état initial est maintenant connu
    if (user) {
        console.log("AuthService: Utilisateur connecté:", user.uid, user.email, user.displayName);
    } else {
        console.log("AuthService: Utilisateur déconnecté.");
    }
});

/**
 * Inscrit un nouvel utilisateur avec email et mot de passe.
 * @param {string} email
 * @param {string} password
 * @param {string|null} displayName - Nom d'affichage optionnel pour le profil.
 * @returns {Promise<{user: User|null, error: {message: string, code: string}|null}>}
 */
async function signUp(email, password, displayName = null) {
    isLoadingAuth.value = true;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Utilisateur inscrit:", userCredential.user.uid);
        // Mettre à jour le profil avec le displayName si fourni
        if (displayName && userCredential.user) {
            await firebaseUpdateProfile(userCredential.user, {displayName});
            console.log("Nom d'affichage défini pour le nouvel utilisateur:", displayName);
            // currentUser sera mis à jour par onAuthStateChanged, mais on peut forcer ici si besoin
            // pour refléter immédiatement le displayName sur userCredential.user
            // (note: currentUser.value.displayName sera mis à jour par l'observer)
        }
        return {user: userCredential.user, error: null};
    } catch (error) {
        console.error("Erreur d'inscription:", error.message, error.code);
        return {user: null, error: {message: error.message, code: error.code}};
    } finally {
        isLoadingAuth.value = false;
    }
}

/**
 * Connecte un utilisateur existant avec email et mot de passe.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: User|null, error: {message: string, code: string}|null}>}
 */
async function signIn(email, password) {
    isLoadingAuth.value = true;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Utilisateur connecté:", userCredential.user.uid);
        return {user: userCredential.user, error: null};
    } catch (error) {
        console.error("Erreur de connexion:", error.message, error.code);
        return {user: null, error: {message: error.message, code: error.code}};
    } finally {
        isLoadingAuth.value = false;
    }
}

/**
 * Déconnecte l'utilisateur actuellement authentifié.
 * @returns {Promise<{success: boolean, error: {message: string, code: string}|null}>}
 */
async function signOutUser() {
    isLoadingAuth.value = true;
    try {
        await signOut(auth);
        console.log("Utilisateur déconnecté avec succès.");
        return {success: true, error: null};
    } catch (error) {
        console.error("Erreur de déconnexion:", error.message, error.code);
        return {success: false, error: {message: error.message, code: error.code}};
    } finally {
        // isLoadingAuth sera mis à false par onAuthStateChanged quand user devient null
    }
}

/**
 * Met à jour le profil de l'utilisateur Firebase connecté.
 * @param {object} profileData - Objet contenant les données à mettre à jour (ex: { displayName: 'Nouveau Nom', photoURL: 'url' }).
 * @returns {Promise<{success: boolean, error: {message: string, code: string}|null}>}
 */
async function updateUserProfile(profileData) {
    if (!currentUser.value) {
        const errMessage = "Aucun utilisateur connecté pour mettre à jour le profil.";
        console.error(errMessage);
        return {success: false, error: {message: errMessage}};
    }
    try {
        await firebaseUpdateProfile(currentUser.value, profileData);
        console.log("Profil Firebase mis à jour avec:", profileData);
        // currentUser.value sera mis à jour par Firebase et l'observateur onAuthStateChanged
        // pour refléter les changements (displayName, photoURL).
        return {success: true, error: null};
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil Firebase:", error);
        return {success: false, error: {message: error.message, code: error.code}};
    }
}

export {
    auth, // Exporter l'instance auth si elle est nécessaire directement ailleurs
    currentUser, // L'utilisateur Firebase actuellement connecté (réactif Vue)
    isLoadingAuth, // Pour savoir si l'état d'authentification initial est en cours de chargement
    signUp,
    signIn,
    signOutUser,
    updateUserProfile,
    // onAuthStateChanged // Vous pouvez l'exporter si vous avez besoin de vous abonner manuellement ailleurs,
    // mais currentUser et isLoadingAuth devraient couvrir la plupart des cas d'usage.
};