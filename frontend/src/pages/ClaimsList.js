import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Spin,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { claimService, exportService } from '../services/api';
import StatusChangeModal from '../components/StatusChangeModal';

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleStatusChange = (claim) => {
    setSelectedClaim(claim);
    setModalVisible(true);
  };

  const handleStatusChangeSuccess = (updatedClaim) => {
    // Update the claim in the list
    setClaims(claims.map((c) => (c.id === updatedClaim.id ? updatedClaim : c)));
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

  const getActionButtons = (record) => {
    console.log('DEBUG FINAL', record);
    if (record.final_state) {
      return (
        <Tooltip title='This claim is in a final state'>
          <Tag color='blue'>Final</Tag>
        </Tooltip>
      );
    }

    if (!record.available_actions || record.available_actions.length === 0) {
      return null;
    }

    // If only one action available, show direct button
    if (record.available_actions.length === 1) {
      const action = record.available_actions[0];
      return (
        <Button
          size='small'
          type='primary'
          icon={<ThunderboltOutlined />}
          onClick={() => handleStatusChange(record)}
        >
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Button>
      );
    }

    // If multiple actions, show dropdown
    const menuItems = record.available_actions.map((action) => ({
      key: action,
      label: action.charAt(0).toUpperCase() + action.slice(1),
      onClick: () => handleStatusChange(record),
    }));

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button size='small' type='primary' icon={<ThunderboltOutlined />}>
          Change Status
        </Button>
      </Dropdown>
    );
  };

  const columns = [
    {
      title: 'Claim Number',
      dataIndex: 'claim_number',
      key: 'claim_number',
      sorter: (a, b) => a.claim_number.localeCompare(b.claim_number),
      render: (_, record) => {
        return <a href={`/claims/${record.id}`}>{record.claim_number}</a>;
      },
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
        { text: 'Canceled', value: 'canceled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Import Source',
      key: 'import_source',
      render: (_, record) => record.claim_import?.file_name || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => getActionButtons(record),
      width: 150,
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

      {/* Status Change Modal */}
      {selectedClaim && (
        <StatusChangeModal
          claim={selectedClaim}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedClaim(null);
          }}
          onSuccess={handleStatusChangeSuccess}
        />
      )}
    </div>
  );
};

export default ClaimsList;
