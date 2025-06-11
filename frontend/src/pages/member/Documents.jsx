import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, message, Row, Col, Statistic, Input } from 'antd';
import { DownloadOutlined, EyeOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredDocuments(filtered);
  }, [searchText, documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
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

  const getCategoryStats = () => {
    const stats = {};
    documents.forEach(doc => {
      stats[doc.category] = (stats[doc.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
      filters: Object.keys(categoryStats).map(cat => ({
        text: cat.toUpperCase(),
        value: cat,
      })),
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
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>

      <Row gutter={16} className="mb-6">
        {Object.entries(categoryStats).map(([category, count]) => (
          <Col span={6} key={category}>
            <Card>
              <Statistic
                title={`${category.toUpperCase()} Documents`}
                value={count}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mb-6">
        <Input
          placeholder="Search documents..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Documents; 