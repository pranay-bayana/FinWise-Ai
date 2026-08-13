import React, { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, TrendingUp, PiggyBank, PieChart as PieChartIcon } from 'lucide-react';
import { reportService } from '../services/reportService';
import toast from 'react-hot-toast';
import { EmptyStateReports } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const Reports = () => {
  const [loading, setLoading] = useState({});

  const reports = [
    { name: 'Monthly Report', description: 'Summary of all transactions and spending for the current month', icon: Calendar },
    { name: 'Annual Report', description: 'Yearly financial overview with trends and insights', icon: TrendingUp },
    { name: 'Category Report', description: 'Detailed breakdown by spending categories', icon: PieChartIcon },
    { name: 'Savings Report', description: 'Track progress towards savings goals', icon: PiggyBank },
  ];

  const handleDownload = async (reportName, format) => {
    setLoading(prev => ({ ...prev, [`${reportName}-${format}`]: true }));
    try {
      await reportService.downloadMonthlyReport(format);
      toast.success(`${format} report generated`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to generate ${format}`);
    } finally {
      setLoading(prev => ({ ...prev, [`${reportName}-${format}`]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Generate monthly, annual, category, and savings reports.</p>
      </div>
      <div className="card p-8 text-center">
        <EmptyStateReports message="No reports generated." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.name} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/30">
                <report.icon className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white">{report.name}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['PDF', 'Excel', 'CSV'].map((format) => (
                <button
                  key={format}
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => handleDownload(report.name, format)}
                  disabled={loading[`${report.name}-${format}`]}
                >
                  {loading[`${report.name}-${format}`] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {format}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
