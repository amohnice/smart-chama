import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Statistic, Row, Col, Tag, DatePicker } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, DollarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/finance/transactions');
      setTransactions(response.data);
    } catch (error) {
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await api.post('/api/finance/transactions', values);
      message.success('Transaction added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchTransactions();
    } catch (error) {
      message.error('Failed to add transaction');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      responsive: ['xs'],
    },
    {
      title: 'Member',
      dataIndex: 'member',
      key: 'member',
      render: (member) => `${member.firstName} ${member.lastName}`,
      responsive: ['xs'],
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'contribution' ? 'green' : 'blue'}>
          {type.toUpperCase()}
        </Tag>
      ),
      responsive: ['xs'],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      responsive: ['xs'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
      responsive: ['xs'],
    },
  ];

  const totalTransactions = transactions.reduce((sum, transaction) => 
    transaction.status === 'completed' ? sum + transaction.amount : sum, 0);

  return (
    <div className="animate-fade-in">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card hover-scale">
            <Statistic
              title="Total Transactions"
              value={totalTransactions}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">All Transactions</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          className="w-full sm:w-auto"
        >
          Add Transaction
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Add Transaction"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        className="transaction-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="member"
            label="Member"
            rules={[{ required: true, message: 'Please select a member' }]}
          >
            <Select
              placeholder="Select member"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {/* Add member options dynamically */}
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select
              placeholder="Select type"
              size="large"
            >
              <Select.Option value="contribution">Contribution</Select.Option>
              <Select.Option value="loan">Loan</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 0, message: 'Amount must be positive' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter amount"
              size="large"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const loansResponse = await api.get('/api/finance/loans');
      setLoans(loansResponse.data);
    } catch (error) {
      message.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      await api.post('/api/finance/loans', values);
      message.success('Loan added successfully');
      setModalVisible(false);
      form.resetFields();
      fetchLoans();
    } catch (error) {
      message.error('Failed to add loan');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      responsive: ['xs'],
    },
    {
      title: 'Member',
      dataIndex: 'member',
      key: 'member',
      render: (member) => `${member.firstName} ${member.lastName}`,
      responsive: ['xs'],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      responsive: ['xs'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      responsive: ['xs'],
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => `$${balance?.toFixed(2) || '0.00'}`,
      responsive: ['xs'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/admin/finance/loans/${record.id}`)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">All Loans</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          className="w-full sm:w-auto"
        >
          Add Loan
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={loans}
          loading={loading}
          rowKey="_id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
          }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Add Loan"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        className="loan-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="member"
            label="Member"
            rules={[{ required: true, message: 'Please select a member' }]}
          >
            <Select
              placeholder="Select member"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {/* Add member options dynamically */}
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 0, message: 'Amount must be positive' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter amount"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duration (months)"
            rules={[
              { required: true, message: 'Please enter duration' },
              { type: 'number', min: 1, max: 12, message: 'Duration must be between 1 and 12 months' }
            ]}
          >
            <InputNumber 
              min={1} 
              max={12} 
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const Reports = () => {
  const [report, setReport] = useState({
    totalContributions: 0,
    totalLoans: 0,
    activeLoans: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsResponse = await api.get('/api/finance/reports');
      setReport(reportsResponse.data);
    } catch (error) {
      message.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const exportResponse = await api.get('/api/finance/reports/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([exportResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'financial-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Financial Reports</h2>
        <Space className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <RangePicker
            onChange={setDateRange}
            allowClear
            className="w-full sm:w-auto"
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            Export Report
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card hover-scale">
            <Statistic
              title="Total Contributions"
              value={report.totalContributions}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card hover-scale">
            <Statistic
              title="Total Loans"
              value={report.totalLoans}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card hover-scale">
            <Statistic
              title="Active Loans"
              value={report.activeLoans}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card hover-scale">
            <Statistic
              title="Net Balance"
              value={report.netBalance}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: report.netBalance >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const AdminFinance = () => {
  const location = useLocation();
  const activeKey = location.pathname.split('/').pop();
  const navigate = useNavigate();

  const items = [
    {
      key: 'transactions',
      label: 'Transactions',
      children: <Transactions />,
    },
    {
      key: 'loans',
      label: 'Loans',
      children: <Loans />,
    },
    {
      key: 'reports',
      label: 'Reports',
      children: <Reports />,
    },
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gradient">Finance Management</h1>
      
      <Card className="finance-card">
        <Tabs 
          defaultActiveKey="transactions"
          className="finance-tabs"
          items={items}
        />
      </Card>
    </div>
  );
};

export default AdminFinance; 