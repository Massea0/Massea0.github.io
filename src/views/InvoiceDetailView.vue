<!-- /Users/a00/arcadis_frontend/arcadis_space_vue/src/views/InvoiceDetailView.vue -->
<template>
  <div class="invoice-detail-view">
    <div v-if="isLoading" class="loading-spinner">Chargement de la facture...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="invoice && !isLoading && !error" class="invoice-content">
      <div class="invoice-header">
        <h1>Facture #{{ invoice.invoice_number }}</h1>
        <span :class="['invoice-status-badge', getStatusClass(invoice.status)]">
          {{ invoice.status_display }}
        </span>
      </div>

      <div class="invoice-meta">
        <div class="meta-item">
          <strong>Client:</strong> {{ invoice.client_company?.name || 'N/A' }}
        </div>
        <div class="meta-item">
          <strong>Date d'émission:</strong> {{ formatDate(invoice.issue_date) }}
        </div>
        <div class="meta-item">
          <strong>Date d'échéance:</strong> {{ formatDate(invoice.due_date) }}
        </div>
      </div>

      <div class="invoice-line-items">
        <h2>Détails de la facture</h2>
        <table v-if="invoice.line_items && invoice.line_items.length > 0">
          <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix Unitaire HT</th>
            <th>Total HT</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in invoice.line_items" :key="item.id">
            <td>{{ item.description }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.unit_price_excl_tax) }}</td>
            <td>{{ formatCurrency(item.total_amount_excl_tax) }}</td>
          </tr>
          </tbody>
        </table>
        <p v-else>Aucune ligne d'article pour cette facture.</p>
      </div>

      <div class="invoice-summary">
        <div class="summary-item">
          <span>Total HT:</span>
          <strong>{{ formatCurrency(invoice.total_amount_excl_tax) }}</strong>
        </div>
        <div class="summary-item">
          <span>TVA:</span>
          <strong>{{ formatCurrency(invoice.vat_amount) }}</strong>
        </div>
        <div class="summary-item total-ttc">
          <span>Total TTC:</span>
          <strong>{{ formatCurrency(invoice.total_amount_incl_tax) }}</strong>
        </div>
      </div>

      <div v-if="invoice.pdf_url" class="invoice-actions">
        <a :href="invoice.pdf_url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          Télécharger le PDF
        </a>
      </div>
      <router-link :to="{ name: 'InvoicesList' }" class="btn btn-secondary back-link">
        &larr; Retour à la liste des factures
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchInvoiceById } from '@/services/api';
// Importez les fonctions utilitaires depuis votre fichier centralisé
import { formatDate, formatCurrency, getStatusClass } from '@/utils/formatters';


const route = useRoute();
const invoice = ref(null);
const isLoading = ref(true);
const error = ref(null);

const invoiceId = computed(() => route.params.id);

onMounted(async () => {
  if (invoiceId.value) {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await fetchInvoiceById(invoiceId.value);
      invoice.value = data;
    } catch (err) {
      console.error(`Erreur lors du chargement de la facture ${invoiceId.value}:`, err);
      error.value = `Impossible de charger la facture. Veuillez réessayer plus tard.`;
      if (err.response && err.response.status === 401) {
        error.value = "Votre session a expiré. Veuillez vous reconnecter.";
      } else if (err.response && err.response.status === 403) {
        error.value = "Vous n'avez pas l'autorisation de voir cette facture.";
      } else if (err.response && err.response.status === 404) {
        error.value = "Facture non trouvée.";
      }
    } finally {
      isLoading.value = false;
    }
  } else {
    error.value = "Aucun ID de facture fourni.";
    isLoading.value = false;
  }
});

// LES DÉFINITIONS LOCALES ONT ÉTÉ SUPPRIMÉES D'ICI
// const formatDate = (dateString) => { ... }; // Déjà géré car importé et non défini localement
// const formatCurrency = (amount) => { ... };
// const getStatusClass = (status) => { ... };
</script>

<style scoped>
.invoice-detail-view {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg-medium);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.loading-spinner,
.error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error-message {
  color: var(--accent-secondary);
  background-color: rgba(255, 140, 0, 0.1);
  border: 1px solid var(--accent-secondary);
  border-radius: 4px;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--bg-light);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.invoice-header h1 {
  color: var(--accent-primary);
  margin: 0;
  font-size: 2rem;
}

.invoice-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-on-accent);
  text-transform: uppercase;
}

/* Statuts spécifiques (identiques à InvoicesListView) */
.status-pending { background-color: #ffc107; }
.status-paid { background-color: #28a745; }
.status-overdue { background-color: #dc3545; }
.status-cancelled { background-color: #6c757d; }


.invoice-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--bg-light);
  border-radius: 6px;
}

.meta-item {
  font-size: 0.95rem;
  color: var(--text-secondary);
}
.meta-item strong {
  color: var(--text-primary);
  margin-right: 0.5em;
}

.invoice-line-items {
  margin-bottom: 2rem;
}

.invoice-line-items h2 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
  font-size: 1.5rem;
  border-bottom: 1px solid var(--bg-light);
  padding-bottom: 0.5rem;
}

.invoice-line-items table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.invoice-line-items th,
.invoice-line-items td {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bg-light);
  color: var(--text-secondary);
}

.invoice-line-items th {
  background-color: var(--bg-light);
  color: var(--text-primary);
  font-weight: 600;
}

.invoice-line-items td:nth-child(2), /* Quantité */
.invoice-line-items td:nth-child(3), /* Prix Unit. */
.invoice-line-items td:nth-child(4) { /* Total Ligne */
  text-align: right;
}

.invoice-summary {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--bg-light);
  max-width: 400px;
  margin-left: auto; /* Aligne à droite */
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 1rem;
}
.summary-item span {
  color: var(--text-secondary);
}
.summary-item strong {
  color: var(--text-primary);
}

.summary-item.total-ttc strong {
  font-size: 1.3rem;
  color: var(--accent-primary);
}

.invoice-actions {
  margin-top: 2rem;
  text-align: right;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: inline-block;
  margin-left: 1rem;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-on-accent);
}
.btn-primary:hover {
  background-color: var(--accent-secondary); /* Ou une version plus foncée de l'accent primaire */
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}
.btn-secondary:hover {
  background-color: var(--accent-primary);
  color: var(--text-on-accent);
}
.back-link {
  display: block;
  width: fit-content;
  margin-top: 2rem;
  margin-left: 0; /* Pour le lien retour */
}
</style>