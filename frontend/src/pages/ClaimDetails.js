import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Timeline,
  Button,
  Space,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { claimService } from '../services/api';
import StatusChangeModal from '../components/StatusChangeModal';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const response = await claimService.getOne(id);
      setClaim(response.data);
    } catch (error) {
      message.error('Failed to fetch claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeSuccess = (updatedClaim) => {
    setClaim(updatedClaim);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      submitted: 'blue',
      paid: 'green',
      denied: 'red',
      canceled: 'default',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!claim) {
    return <div>Claim not found</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/claims')}
        >
          Back to Claims
        </Button>
        {!claim.final_state && claim.available_actions?.length > 0 && (
          <Button
            type='primary'
            icon={<ThunderboltOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Change Status
          </Button>
        )}
      </Space>

      <Card title={`Claim Details: ${claim.claim_number}`}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label='Claim Number'>
            {claim.claim_number}
          </Descriptions.Item>
          <Descriptions.Item label='Status'>
            <Tag color={getStatusColor(claim.status)}>
              {claim.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label='Patient'>
            {claim.patient.full_name}
          </Descriptions.Item>
          <Descriptions.Item label='Date of Birth'>
            {new Date(claim.patient.dob).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label='Service Date'>
            {new Date(claim.service_date).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label='Amount'>
            ${parseFloat(claim.amount).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label='Import File' span={2}>
            {claim.claim_import.file_name}
          </Descriptions.Item>
          <Descriptions.Item label='Created At' span={2}>
            {new Date(claim.claim_import.created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {claim.status_changes && claim.status_changes.length > 0 && (
        <Card
          title={
            <span>
              <HistoryOutlined /> Status Change History
            </span>
          }
          style={{ marginTop: 16 }}
        >
          <Timeline
            items={claim.status_changes.map((change) => ({
              color: getStatusColor(change.to_status),
              children: (
                <>
                  <p>
                    <strong>
                      {change.from_status.toUpperCase()} →{' '}
                      {change.to_status.toUpperCase()}
                    </strong>
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    By: {change.changed_by}
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    {new Date(change.created_at).toLocaleString()}
                  </p>
                  {change.notes && (
                    <p style={{ fontStyle: 'italic' }}>Notes: {change.notes}</p>
                  )}
                </>
              ),
            }))}
          />
        </Card>
      )}

      <StatusChangeModal
        claim={claim}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleStatusChangeSuccess}
      />
    </div>
  );
};

export default ClaimDetails;
