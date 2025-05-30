// /Users/a00/arcadis_frontend/arcadis_space_vue/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Assurez-vous d'importer createPinia
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia() // 1. Créez l'instance Pinia

app.use(pinia) // 2. Utilisez Pinia avec votre application
app.use(router)

app.mount('#app')

export { pinia } // Exportez l'instance pinia si vous en avez besoin ailleurs (comme dans api.js)