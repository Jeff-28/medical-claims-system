import React, { useState } from 'react';
import { Upload, Card, message, Progress, Alert, Table, Tag } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { claimImportService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { Dragger } = Upload;

const ImportClaims = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await claimImportService.create(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setResult({
        success: true,
        data: response.data,
      });

      const hasErrors = response.data.error_count > 0;

      if (hasErrors) {
        message.warning(
          `Import completed with ${response.data.error_count} error(s)`
        );
      } else {
        message.success('File imported successfully!');
      }

      // Redirect after 3 seconds if no errors
      if (!hasErrors) {
        setTimeout(() => {
          navigate('/claims');
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Import failed',
      });
      message.error('Failed to import file');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  const getErrorTypeColor = (errorType) => {
    const colors = {
      validation_failed: 'red',
      duplicate_claim_number: 'orange',
      invalid_date: 'volcano',
      missing_required_field: 'magenta',
      invalid_amount: 'red',
      invalid_status: 'orange',
      patient_creation_failed: 'red',
    };
    return colors[errorType] || 'default';
  };

  const errorColumns = [
    {
      title: 'Row',
      dataIndex: 'row_number',
      key: 'row_number',
      width: 80,
      sorter: (a, b) => a.row_number - b.row_number,
    },
    {
      title: 'Error Type',
      dataIndex: 'error_type',
      key: 'error_type',
      width: 200,
      render: (errorType) => (
        <Tag color={getErrorTypeColor(errorType)}>
          {errorType.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Error Message',
      dataIndex: 'error_message',
      key: 'error_message',
    },
    {
      title: 'Row Data',
      dataIndex: 'row_data',
      key: 'row_data',
      render: (rowData) => (
        <pre
          style={{
            fontSize: '11px',
            margin: 0,
            maxWidth: '300px',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(rowData, null, 2)}
        </pre>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Card title='Import Claims from CSV'>
        <Alert
          title='CSV Format Requirements'
          description={
            <div>
              <p>Your CSV file must include the following columns:</p>
              <ul>
                <li>
                  <strong>patient_first_name</strong> - Patient's first name
                </li>
                <li>
                  <strong>patient_last_name</strong> - Patient's last name
                </li>
                <li>
                  <strong>patient_dob</strong> - Date of birth (YYYY-MM-DD)
                </li>
                <li>
                  <strong>claim_number</strong> - Unique claim identifier
                </li>
                <li>
                  <strong>service_date</strong> - Service date (YYYY-MM-DD)
                </li>
                <li>
                  <strong>amount</strong> - Claim amount (must be greater than
                  0)
                </li>
                <li>
                  <strong>status</strong> - One of: pending, submitted, denied,
                  paid
                </li>
              </ul>
            </div>
          }
          type='info'
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Dragger {...uploadProps} disabled={uploading}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>
            Click or drag CSV file to this area to upload
          </p>
          <p className='ant-upload-hint'>
            Only CSV files are supported. Make sure your file follows the
            required format.
          </p>
        </Dragger>

        {uploading && (
          <div style={{ marginTop: 24 }}>
            <Progress percent={uploadProgress} status='active' />
          </div>
        )}

        {result && (
          <>
            <Alert
              title={result.success ? 'Import Completed' : 'Import Failed'}
              description={
                result.success ? (
                  <div>
                    <p>
                      <strong>File:</strong> {result.data.file_name}
                    </p>
                    <p>
                      <strong>Total Records:</strong>{' '}
                      {result.data.total_records}
                    </p>
                    <p>
                      <strong>Successfully Processed:</strong>{' '}
                      {result.data.processed_records}
                    </p>
                    <p>
                      <strong>Errors:</strong> {result.data.error_count || 0}
                    </p>
                    <p>
                      <strong>Status:</strong> {result.data.status}
                    </p>
                    {result.data.error_count === 0 && (
                      <p style={{ marginTop: 8, color: '#52c41a' }}>
                        ✓ All records imported successfully! Redirecting to
                        claims list...
                      </p>
                    )}
                  </div>
                ) : (
                  result.error
                )
              }
              type={
                result.success
                  ? result.data.error_count > 0
                    ? 'warning'
                    : 'success'
                  : 'error'
              }
              showIcon
              style={{ marginTop: 24 }}
            />

            {result.success &&
              result.data.import_errors &&
              result.data.import_errors.length > 0 && (
                <Card
                  title={`Import Errors (${result.data.import_errors.length})`}
                  style={{ marginTop: 24 }}
                  type='inner'
                >
                  <Alert
                    title='Some rows failed to import'
                    description='Review the errors below and correct your CSV file. Successfully processed records have been saved.'
                    type='warning'
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={errorColumns}
                    dataSource={result.data.import_errors}
                    rowKey='id'
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    size='small'
                  />
                </Card>
              )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ImportClaims;
