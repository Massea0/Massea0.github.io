// /Users/a00/arcadis_frontend/arcadis_space_vue/src/stores/authStore.js
import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {auth} from '@/firebase/config'; // Assurez-vous que ce chemin est correct
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    getIdToken
} from 'firebase/auth'
import router from '@/router'
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const idToken = ref(localStorage.getItem('idToken') || null)
    const isLoadingAuth = ref(true) // Initialement true
    const authError = ref(null)

    const isAuthenticated = computed(() => !!user.value && !!idToken.value)
    const userDisplayName = computed(() => user.value?.displayName || user.value?.email || 'Utilisateur')

    async function signUp(email, password, firstName, lastName) {
        isLoadingAuth.value = true
        authError.value = null
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const firebaseUser = userCredential.user
            const displayName = `${firstName} ${lastName}`.trim();
            await updateProfile(firebaseUser, {displayName});

            user.value = {...firebaseUser, displayName}; // Mettre à jour l'utilisateur localement

            const token = await getIdToken(firebaseUser);
            idToken.value = token;
            localStorage.setItem('idToken', token);

            try {
                await apiClient.post('/accounts/sync-user/', { // Assurez-vous que cet endpoint est correct
                    firstName: firstName,
                    lastName: lastName,
                    // email: firebaseUser.email // L'email est dans le token, mais peut être envoyé
                });
                console.log('User synced with Django backend successfully.');
            } catch (djangoError) {
                console.error('Error syncing user with Django backend:', djangoError);
                authError.value = "Erreur de synchronisation avec le serveur. Votre compte Firebase est créé, mais veuillez contacter le support si des problèmes persistent.";
                // Ne pas bloquer la redirection frontend si la synchro échoue, mais informer.
            }

            router.push({name: 'UserProfile'})
        } catch (error) {
            console.error('Error during sign up:', error)
            authError.value = mapFirebaseError(error.code)
        } finally {
            isLoadingAuth.value = false
        }
    }

    async function signIn(email, password) {
        isLoadingAuth.value = true
        authError.value = null
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            user.value = userCredential.user
            const token = await getIdToken(userCredential.user);
            idToken.value = token;
            localStorage.setItem('idToken', token);

            const redirectPath = router.currentRoute.value.query.redirect || {name: 'UserProfile'};
            router.push(redirectPath);
        } catch (error) {
            console.error('Error during sign in:', error)
            authError.value = mapFirebaseError(error.code)
        } finally {
            isLoadingAuth.value = false
        }
    }

    async function signOutUser() {
        isLoadingAuth.value = true // Peut être mis à false directement si pas d'appel asynchrone critique
        authError.value = null
        try {
            await signOut(auth)
            user.value = null
            idToken.value = null
            localStorage.removeItem('idToken');
            router.push({name: 'Login'})
        } catch (error) {
            console.error('Error during sign out:', error)
            authError.value = "Erreur lors de la déconnexion."
        } finally {
            isLoadingAuth.value = false // Assurez-vous que c'est toujours mis à false
        }
    }

    function listenToAuthState() {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                user.value = firebaseUser; // Stocke l'objet utilisateur Firebase complet
                try {
                    const token = await getIdToken(firebaseUser);
                    idToken.value = token;
                    localStorage.setItem('idToken', token);
                } catch (error) {
                    console.error("Error getting ID token on auth state change:", error);
                    // En cas d'erreur pour obtenir le token, considérer l'utilisateur comme déconnecté
                    user.value = null;
                    idToken.value = null;
                    localStorage.removeItem('idToken');
                }
            } else {
                user.value = null
                idToken.value = null
                localStorage.removeItem('idToken');
            }
            isLoadingAuth.value = false; // TRÈS IMPORTANT : Mettre à false ici
            console.log("isLoadingAuth set to false. User:", user.value ? user.value.email : 'null');
        });
    }

    async function updateFirebaseUserProfile(profileUpdates) {
        if (!auth.currentUser) {
            authError.value = "Utilisateur non connecté pour la mise à jour du profil.";
            console.error("updateFirebaseUserProfile: auth.currentUser est null");
            return false;
        }
        isLoadingAuth.value = true; // Peut-être un autre indicateur de chargement pour cette action spécifique
        authError.value = null;
        try {
            await updateProfile(auth.currentUser, profileUpdates);
            if (user.value && profileUpdates.displayName) {
                user.value = {...user.value, displayName: profileUpdates.displayName};
            }
            console.log("Profil Firebase mis à jour avec succès via le store.");
            return true;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil Firebase via le store:", error);
            authError.value = mapFirebaseError(error.code) || "Erreur de mise à jour du profil.";
            return false;
        } finally {
            isLoadingAuth.value = false; // Ou l'indicateur spécifique
        }
    }

    function mapFirebaseError(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Adresse email invalide.';
            case 'auth/user-disabled':
                return 'Ce compte utilisateur a été désactivé.';
            case 'auth/user-not-found':
                return 'Aucun utilisateur trouvé avec cet email.';
            case 'auth/wrong-password':
                return 'Mot de passe incorrect.';
            case 'auth/email-already-in-use':
                return 'Cette adresse email est déjà utilisée.';
            case 'auth/weak-password':
                return 'Le mot de passe est trop faible (minimum 6 caractères).';
            case 'auth/operation-not-allowed':
                return "L'authentification par email/mot de passe n'est pas activée.";
            default:
                return "Une erreur d'authentification est survenue. Veuillez réessayer.";
        }
    }

    return {
        user,
        idToken,
        isLoadingAuth,
        authError,
        isAuthenticated,
        userDisplayName,
        signUp,
        signIn,
        signOutUser,
        listenToAuthState,
        mapFirebaseError,
        updateFirebaseUserProfile
    }
})