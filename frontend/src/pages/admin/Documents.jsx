import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, message, Modal, Form, Input, Upload, Select } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.getFieldValue('title'));
    formData.append('category', form.getFieldValue('category'));
    formData.append('description', form.getFieldValue('description'));

    try {
      setUploading(true);
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Document uploaded successfully');
      setModalVisible(false);
      form.resetFields();
      fetchDocuments();
    } catch (error) {
      message.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      message.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      message.error('Failed to delete document');
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to download document');
    }
  };

  const handleView = async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}/view`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      message.error('Failed to view document');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'minutes':
        return 'blue';
      case 'financial':
        return 'green';
      case 'policy':
        return 'purple';
      case 'report':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'MINUTES', value: 'minutes' },
        { text: 'FINANCIAL', value: 'financial' },
        { text: 'POLICY', value: 'policy' },
        { text: 'REPORT', value: 'report' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      render: (uploadedBy) => uploadedBy?.name || 'N/A',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record._id)}
          >
            View
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record._id, record.filename)}
          >
            Download
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Upload Document
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Upload Document"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter document title' }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select document category' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="minutes">Minutes</Select.Option>
              <Select.Option value="financial">Financial</Select.Option>
              <Select.Option value="policy">Policy</Select.Option>
              <Select.Option value="report">Report</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter document description" />
          </Form.Item>

          <Form.Item
            name="file"
            label="File"
            rules={[{ required: true, message: 'Please upload a file' }]}
          >
            <Upload
              beforeUpload={(file) => {
                form.setFieldsValue({ file });
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
              >
                Upload
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Documents; 