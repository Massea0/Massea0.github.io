// /Users/a00/arcadis_frontend/arcadis_space_vue/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importez createPinia
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia() // Créez une instance Pinia

app.use(pinia) // Utilisez Pinia avec votre application
app.use(router)

app.mount('#app')