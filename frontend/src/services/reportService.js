import api from './api';

export const reportService = {
  downloadMonthlyReport: async (format) => {
    const response = await api.get('/reports/monthly', {
      params: { format: format.toLowerCase() },
      responseType: 'blob',
    });
    const extension = format.toLowerCase() === 'excel' ? 'xls' : format.toLowerCase();
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finwise-monthly-report.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
