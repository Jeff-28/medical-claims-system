import React, { useState } from 'react';
import { Upload, Card, message, Progress, Alert } from 'antd';
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

      message.success('File imported successfully!');

      // Redirect to claims list after 2 seconds
      setTimeout(() => {
        navigate('/claims');
      }, 2000);
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

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card title='Import Claims from CSV'>
        <Alert
          title='CSV Format Requirements'
          description={
            <div>
              <p>Your CSV file must include the following columns:</p>
              <ul>
                <li>patient_first_name</li>
                <li>patient_last_name</li>
                <li>patient_dob (YYYY-MM-DD)</li>
                <li>claim_number</li>
                <li>service_date (YYYY-MM-DD)</li>
                <li>amount (decimal)</li>
                <li>status (pending/submitted/denied/paid)</li>
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
          <Alert
            title={result.success ? 'Import Successful' : 'Import Failed'}
            description={
              result.success ? (
                <div>
                  <p>File: {result.data.file_name}</p>
                  <p>Total Records: {result.data.total_records}</p>
                  <p>Processed: {result.data.processed_records}</p>
                  <p>Status: {result.data.status}</p>
                </div>
              ) : (
                result.error
              )
            }
            type={result.success ? 'success' : 'error'}
            showIcon
            style={{ marginTop: 24 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ImportClaims;
