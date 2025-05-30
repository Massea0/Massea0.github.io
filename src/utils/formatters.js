// /Users/a00/arcadis_frontend/arcadis_space_vue/src/utils/formatters.js
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(dateString).toLocaleDateString('fr-FR', options);
};

export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '';
    // Choisissez XOF ou XAF selon vos besoins
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'XOF'}).format(amount);
};

export const getStatusClass = (status) => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
};