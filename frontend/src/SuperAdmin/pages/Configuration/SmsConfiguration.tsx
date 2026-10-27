import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { DataTable, Column } from '../../../components/DataTable';
import axiosInstance from '../../../utils/axiosInstance'; 
import SearchBar from '../../../components/SearchBar'; 

interface SmsConfig {
  smsTemplateId: string;
  title: string;
  templateCode: string;
  senderId: string;
  message: string;
  isActive: boolean;
  tenantId?: string;
  createdAt: string;
}

const SmsConfiguration: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [configs, setConfigs] = useState<SmsConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/smsTemplateRoutes/getAllSmsTemplates');
        setConfigs(res.data.smsTemplates || []);
      } catch (err: any) {
        setError('Failed to load SMS templates');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const filteredConfigs = configs.filter(row =>
    row.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    row.templateCode?.toLowerCase().includes(searchText.toLowerCase()) ||
    row.senderId?.toLowerCase().includes(searchText.toLowerCase()) ||
    row.message?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (row: SmsConfig) => {
    navigate(`/sms/configurations/edit/${row.smsTemplateId}`);
  };

  const columns: Column<SmsConfig>[] = [
    { header: 'Title', accessor: 'title' },
    { header: 'Template Code', accessor: 'templateCode' },
    { header: 'Sender ID', accessor: 'senderId' },
    {
      header: 'Message Template',
      accessor: 'message',
      render: (row: SmsConfig) => (
        <span className="text-gray-700 text-sm line-clamp-2" title={row.message}>
          {row.message && row.message.length > 70 ? row.message.substring(0, 70) + '...' : row.message}
        </span>
      ),
    },
  ];

  return (
    <PageLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">List SMS Templates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage SMS notifications for bookings, driver assignments, and OTP alerts.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar
            placeholder="Keywords (Template Name, Code, Message)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => {}}
          />
        </div>

        <div>
          {loading ? (
            <p className="text-gray-600">Loading SMS templates...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <DataTable
              columns={columns}
              data={filteredConfigs}
              onEdit={handleEdit}
              rowsPerPage={10}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SmsConfiguration;
