import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, Tabs, Table, Button, Space, Modal, Form, Input, InputNumber, Select, message, Statistic, Row, Col, Tag, DatePicker, Typography } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, DownloadOutlined, DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title } = Typography;

const AdminFinance = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    totalAmount: 0
  });
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'contribution' or 'loan'
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);

  useEffect(() => {
    fetchStats();
    fetchContributions();
    fetchLoans();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [contribStats, loanStats] = await Promise.all([
        api.get('/api/contributions/stats'),
        api.get('/api/loans/stats')
      ]);
      setStats({
        ...contribStats.data,
        ...loanStats.data
      });
    } catch (error) {
      message.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/contributions', {
        params: {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD')
        }
      });
      setContributions(response.data);
    } catch (error) {
      message.error('Failed to fetch contributions');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loans');
      setLoans(response.data);
    } catch (error) {
      message.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setModalType(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (modalType === 'contribution') {
        await api.post('/api/contributions', values);
        message.success('Contribution added successfully');
      } else {
        await api.post('/api/loans', values);
        message.success('Loan added successfully');
      }
      setModalVisible(false);
      fetchStats();
      fetchContributions();
      fetchLoans();
    } catch (error) {
      message.error(`Failed to add ${modalType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await api.post(`/api/loans/${loanId}/approve`);
      message.success('Loan approved successfully');
      fetchLoans();
    } catch (error) {
      message.error('Failed to approve loan');
    }
  };

  const handleRejectLoan = async (loanId) => {
    Modal.confirm({
      title: 'Reject Loan',
      content: (
        <Form layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
      onOk: async (close) => {
        try {
          const form = Modal.confirm.getForm();
          const values = await form.validateFields();
          await api.post(`/api/loans/${loanId}/reject`, values);
          message.success('Loan rejected successfully');
          fetchLoans();
          close();
        } catch (error) {
          message.error('Failed to reject loan');
        }
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const contributionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Member',
      dataIndex: 'member',
      key: 'member',
      render: (member) => `${member.firstName} ${member.lastName}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={
          type === 'regular' ? 'blue' :
          type === 'special' ? 'green' :
          'orange'
        }>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const loanColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Member',
      dataIndex: 'member',
      key: 'member',
      render: (member) => `${member.firstName} ${member.lastName}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} months`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'approved' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'rejected' ? 'red' :
          status === 'active' ? 'blue' :
          'default'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApproveLoan(record._id)}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleRejectLoan(record._id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Finance Management</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            allowClear={false}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.location.href = '/api/contributions/export'}
          >
            Export
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={stats.totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Active Loans"
              value={stats.activeLoans}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pending Loans"
              value={stats.pendingLoans}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="contributions">
        <TabPane
          tab="Contributions"
          key="contributions"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd('contribution')}
            >
              Add Contribution
            </Button>
          }
        >
          <Table
            columns={contributionColumns}
            dataSource={contributions}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane
          tab="Loans"
          key="loans"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleAdd('loan')}
            >
              Add Loan
            </Button>
          }
        >
          <Table
            columns={loanColumns}
            dataSource={loans}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={`Add ${modalType === 'contribution' ? 'Contribution' : 'Loan'}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {modalType === 'contribution' ? (
            <>
              <Form.Item
                name="member"
                label="Member"
                rules={[{ required: true, message: 'Please select a member' }]}
              >
                <Select
                  placeholder="Select member"
                  showSearch
                  optionFilterProp="children"
                >
                  {/* Add member options dynamically */}
                </Select>
              </Form.Item>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\KES\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select>
                  <Select.Option value="regular">Regular</Select.Option>
                  <Select.Option value="special">Special</Select.Option>
                  <Select.Option value="emergency">Emergency</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="member"
                label="Member"
                rules={[{ required: true, message: 'Please select a member' }]}
              >
                <Select
                  placeholder="Select member"
                  showSearch
                  optionFilterProp="children"
                >
                  {/* Add member options dynamically */}
                </Select>
              </Form.Item>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\KES\s?|(,*)/g, '')}
                  min={1000}
                />
              </Form.Item>
              <Form.Item
                name="duration"
                label="Duration (months)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="interestRate"
                label="Interest Rate (%)"
                rules={[{ required: true, message: 'Please enter interest rate' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="purpose"
                label="Purpose"
                rules={[{ required: true, message: 'Please enter purpose' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}
          <Form.Item>
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

export default AdminFinance; 