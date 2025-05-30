<!-- /Users/a00/arcadis_frontend/arcadis_space_vue/src/views/InvoicesListView.vue -->
<template>
  <div class="invoices-list-view">
    <h1>Mes Factures</h1>
    <div v-if="isLoading" class="loading-spinner">Chargement des factures...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="!isLoading && !error && invoices.length === 0" class="no-invoices">
      Vous n'avez aucune facture pour le moment.
    </div>
    <ul v-if="!isLoading && !error && invoices.length > 0" class="invoice-list">
      <li v-for="invoice in invoices" :key="invoice.id" class="invoice-item">
        <router-link :to="{ name: 'InvoiceDetail', params: { id: invoice.id } }">
          <div class="invoice-item-header">
            <span class="invoice-number">Facture #{{ invoice.invoice_number }}</span>
            <span :class="['invoice-status', getStatusClass(invoice.status)]">
              {{ invoice.status_display }}
            </span>
          </div>
          <div class="invoice-item-body">
            <p>Date d'émission: {{ formatDate(invoice.issue_date) }}</p>
            <p>Montant TTC: {{ formatCurrency(invoice.total_amount_incl_tax) }}</p>
            <p v-if="invoice.client_company">Client: {{ invoice.client_company.name }}</p>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchInvoices } from '@/services/api';
// Importez les fonctions utilitaires depuis votre fichier centralisé
import { formatDate, formatCurrency, getStatusClass } from '@/utils/formatters';

const invoices = ref([]);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const data = await fetchInvoices();
    invoices.value = data;
  } catch (err) {
    console.error("Erreur lors du chargement des factures:", err);
    error.value = "Impossible de charger les factures. Veuillez réessayer plus tard.";
    if (err.response && err.response.status === 401) {
      error.value = "Votre session a expiré. Veuillez vous reconnecter.";
      // Le store authStore devrait déjà gérer la déconnexion et la redirection
    }
  } finally {
    isLoading.value = false;
  }
});

// LES DÉFINITIONS LOCALES ONT ÉTÉ SUPPRIMÉES D'ICI
// const formatDate = (dateString) => { ... };
// const getStatusClass = (status) => { ... };
// La fonction formatCurrency était déjà correctement gérée (soit supprimée, soit commentée)
</script>

<style scoped>
.invoices-list-view {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg-medium);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--accent-primary);
  text-align: center;
  margin-bottom: 2rem;
}

.loading-spinner,
.error-message,
.no-invoices {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error-message {
  color: var(--accent-secondary); /* Ou une couleur d'erreur dédiée */
  background-color: rgba(255, 140, 0, 0.1);
  border: 1px solid var(--accent-secondary);
  border-radius: 4px;
}

.invoice-list {
  list-style: none;
  padding: 0;
}

.invoice-item {
  background-color: var(--bg-light);
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  margin-bottom: 1rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.invoice-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.invoice-item a {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.invoice-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--bg-medium);
  padding-bottom: 0.75rem;
}

.invoice-number {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.invoice-status {
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-on-accent);
  text-transform: capitalize;
}

/* Statuts spécifiques */
.status-pending { background-color: #ffc107; /* Jaune */ }
.status-paid { background-color: #28a745; /* Vert */ }
.status-overdue { background-color: #dc3545; /* Rouge */ }
.status-cancelled { background-color: #6c757d; /* Gris */ }


.invoice-item-body p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}
</style>