import React, { useState } from 'react';
import { Modal, Select, Input, message } from 'antd';
import { claimService } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const StatusChangeModal = ({ claim, visible, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      message.warning('Please select a status');
      return;
    }

    setLoading(true);
    try {
      const response = await claimService.transition(
        claim.id,
        selectedStatus,
        notes
      );

      message.success(response.data.message);
      setSelectedStatus('');
      setNotes('');
      onSuccess(response.data.claim);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      submitted: 'blue',
      paid: 'green',
      denied: 'red',
      canceled: 'gray',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Modal
      title={`Update Claim Status: ${claim?.claim_number}`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText='Update Status'
    >
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Current Status:</strong>{' '}
          <span
            style={{
              color: getStatusColor(claim?.status),
              fontWeight: 'bold',
            }}
          >
            {getStatusLabel(claim?.status)}
          </span>
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>New Status:</strong>
        </label>
        <Select
          style={{ width: '100%' }}
          placeholder='Select new status'
          value={selectedStatus}
          onChange={setSelectedStatus}
        >
          {claim?.available_actions?.map((status) => (
            <Option key={status} value={status}>
              {getStatusLabel(status)}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>Notes (optional):</strong>
        </label>
        <TextArea
          rows={4}
          placeholder='Add notes about this status change...'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default StatusChangeModal;
