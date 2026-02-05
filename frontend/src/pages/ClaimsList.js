import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { claimService, exportService } from '../services/api';

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await claimService.getAll();
      setClaims(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.length,
      }));
    } catch (error) {
      message.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleExport = async () => {
    try {
      const response = await exportService.exportClaims();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `claims_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Export successful!');
    } catch (error) {
      message.error('Export failed');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      submitted: 'blue',
      denied: 'red',
      paid: 'green',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Claim Number',
      dataIndex: 'claim_number',
      key: 'claim_number',
      sorter: (a, b) => a.claim_number.localeCompare(b.claim_number),
    },
    {
      title: 'Patient Name',
      key: 'patient_name',
      render: (_, record) => record.patient?.full_name || 'N/A',
      sorter: (a, b) => {
        const nameA = a.patient?.full_name || '';
        const nameB = b.patient?.full_name || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Service Date',
      dataIndex: 'service_date',
      key: 'service_date',
      sorter: (a, b) => new Date(a.service_date) - new Date(b.service_date),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Submitted', value: 'submitted' },
        { text: 'Denied', value: 'denied' },
        { text: 'Paid', value: 'paid' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Import Source',
      key: 'import_source',
      render: (_, record) => record.claim_import?.file_name || 'N/A',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h1>Claims Management</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchClaims}>
            Refresh
          </Button>
          <Button
            type='primary'
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size='large' />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={claims}
          rowKey='id'
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} claims`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
};

export default ClaimsList;
