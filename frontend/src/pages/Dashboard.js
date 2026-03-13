import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, message, Tag, Button } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      message.error('Failed to fetch dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card loading />
            </Col>
          ))}
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card loading style={{ height: 350 }} />
          </Col>
          <Col xs={24} lg={12}>
            <Card loading style={{ height: 350 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (!stats || stats.summary.total_claims === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <Card style={{ textAlign: 'center', padding: 50 }}>
          <FileTextOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />
          <h2>No Data Yet</h2>
          <p>Import some claims to see dashboard statistics</p>
          <Button type='primary' onClick={() => navigate('/import')}>
            Import Claims
          </Button>
        </Card>
      </div>
    );
  }

  // Transform data for charts
  const statusData = Object.entries(stats.claims_by_status).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  const monthlyData = Object.entries(stats.claims_by_month).map(
    ([month, count]) => ({
      month,
      claims: count,
    })
  );

  const amountData = Object.entries(stats.amounts_by_status).map(
    ([status, amount]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      amount: parseFloat(amount),
    })
  );

  // Colors for pie chart
  const COLORS = {
    Pending: '#faad14',
    Submitted: '#1890ff',
    Denied: '#ff4d4f',
    Paid: '#52c41a',
  };

  // Recent imports table columns
  const importColumns = [
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: 'Total',
      dataIndex: 'total_records',
      key: 'total_records',
      width: 80,
    },
    {
      title: 'Processed',
      dataIndex: 'processed_records',
      key: 'processed_records',
      width: 100,
    },
    {
      title: 'Errors',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 80,
      render: (count) => <Tag color={count > 0 ? 'red' : 'green'}>{count}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1>Dashboard</h1>
        <ReloadOutlined
          style={{ fontSize: 20, cursor: 'pointer' }}
          onClick={fetchStats}
        />
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Total Claims'
              value={stats.summary.total_claims}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Total Patients'
              value={stats.summary.total_patients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Total Amount in Claims'
              value={stats.summary.total_amount}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toFixed(2);
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Total Imports'
              value={stats.summary.total_imports}
              prefix={<CloudUploadOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size='small'>
            <Statistic
              title='Total Pending Claims'
              value={stats.summary.pending_claims}
              valueStyle={{ color: '#faad14', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size='small'>
            <Statistic
              title='Total Paid Claims'
              value={stats.summary.paid_claims}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Pie Chart - Claims by Status */}
        <Col xs={24} lg={12}>
          <Card title='Claims by Status' style={{ height: '100%' }}>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bar Chart - Claims by Month */}
        <Col xs={24} lg={12}>
          <Card title='Claims by Month' style={{ height: '100%' }}>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='claims' fill='#1890ff' />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bar Chart - Amount by Status */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title='Total Amount by Status'>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={amountData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='status' />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey='amount' fill='#52c41a' />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Imports Table */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card title='Recent Imports'>
            <Table
              columns={importColumns}
              dataSource={stats.recent_imports}
              rowKey='id'
              pagination={false}
              size='small'
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
