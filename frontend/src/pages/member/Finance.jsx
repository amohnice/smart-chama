import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Space,
  Tag,
  message,
  Tabs,
  Statistic,
  DatePicker,
  Input,
  Modal,
  Form,
  Progress,
  Select,
  Typography,
  InputNumber
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import api from '../../services/api';
import memberService from '../../services/memberService';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

const MemberFinance = () => {
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [dateRange, setDateRange] = useState([]);
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [contributionsData, loansData, statsData] = await Promise.all([
        memberService.getRecentContributions(),
        memberService.getRecentLoans(),
        memberService.getDashboardStats()
      ]);

      setContributions(contributionsData);
      setLoans(loansData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      message.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleMakeContribution = async (values) => {
    try {
      const mpesaResponse = await api.post('/payments/mpesa/initiate', {
        amount: values.amount,
        phoneNumber: values.phoneNumber,
        description: values.description
      });

      if (mpesaResponse.data.CheckoutRequestID) {
        message.success('M-Pesa payment initiated. Please check your phone for the STK Push.');
        pollMpesaStatus(mpesaResponse.data.CheckoutRequestID);
      }
      setContributionModalVisible(false);
      form.resetFields();
      fetchFinanceData();
    } catch (error) {
      message.error('Failed to submit contribution');
    }
  };

  const pollMpesaStatus = async (checkoutRequestId) => {
    try {
      const response = await api.get(`/payments/mpesa/status/${checkoutRequestId}`);
      if (response.data.status === 'success') {
        message.success('M-Pesa payment completed successfully');
        fetchFinanceData();
      } else if (response.data.status === 'pending') {
        setTimeout(() => pollMpesaStatus(checkoutRequestId), 5000);
      } else {
        message.error('M-Pesa payment failed');
      }
    } catch (error) {
      message.error('Failed to check M-Pesa payment status');
    }
  };

  const handleApplyForLoan = async (values) => {
    try {
      await api.post('/members/loans/apply', values);
      message.success('Loan application submitted successfully');
      setLoanModalVisible(false);
      form.resetFields();
      fetchFinanceData();
    } catch (error) {
      message.error('Failed to submit loan application');
    }
  };

  const handleRepayLoan = async (loanId) => {
    try {
      await api.post(`/members/loans/${loanId}/repay`);
      message.success('Loan repayment submitted successfully');
      fetchFinanceData();
    } catch (error) {
      message.error('Failed to submit loan repayment');
    }
  };

  const contributionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone ? `+254${phone}` : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'rejected' ? 'red' :
          'blue'
        }>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const loanColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Interest Rate',
      dataIndex: 'loanDetails.interestRate',
      key: 'interestRate',
      render: (rate) => `${rate}%`
    },
    {
      title: 'Term',
      dataIndex: 'loanDetails.term',
      key: 'term',
      render: (term) => `${term} months`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'rejected' ? 'red' :
          'blue'
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
          {record.status === 'approved' && (
            <Button type="primary" onClick={() => handleRepayLoan(record._id)}>
              Repay
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="member-finance">
      <div className="finance-header">
        <h1>My Finance</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setContributionModalVisible(true)}
          >
            Make Contribution
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setLoanModalVisible(true)}
          >
            Apply for Loan
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => window.location.href = '/members/statements'}
          >
            Download Statement
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={statistics.totalContributions}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
            <Progress
              percent={Math.round((statistics.totalContributions / statistics.contributionTarget) * 100)}
              size="small"
              status="active"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Loan"
              value={statistics.activeLoan}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
            {statistics.activeLoan > 0 && (
              <Progress
                percent={Math.round((statistics.paidAmount / statistics.activeLoan) * 100)}
                size="small"
                status="active"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Next Contribution Due"
              value={statistics.nextContributionDue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Next Loan Payment"
              value={statistics.nextLoanPayment}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="contributions">
        <TabPane tab="Contributions" key="contributions">
          <Card
            title="My Contributions"
            extra={
              <Space>
                <RangePicker
                  onChange={(dates) => setDateRange(dates)}
                />
                <Input
                  placeholder="Search contributions"
                  prefix={<SearchOutlined />}
                />
              </Space>
            }
          >
            <Table
              columns={contributionColumns}
              dataSource={contributions}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        <TabPane tab="Loans" key="loans">
          <Card
            title="My Loans"
            extra={
              <Space>
                <RangePicker
                  onChange={(dates) => setDateRange(dates)}
                />
                <Input
                  placeholder="Search loans"
                  prefix={<SearchOutlined />}
                />
              </Space>
            }
          >
            <Table
              columns={loanColumns}
              dataSource={loans}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Make Contribution"
        visible={contributionModalVisible}
        onCancel={() => setContributionModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleMakeContribution}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Amount (KES)"
            rules={[{ required: true }]}
          >
            <Input type="number" prefix="KES" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="M-Pesa Phone Number"
            rules={[
              { required: true, message: 'Please enter your M-Pesa phone number' },
              { pattern: /^(?:254|\+254|0)?([7-9]{1}[0-9]{8})$/, message: 'Please enter a valid Kenyan phone number' }
            ]}
          >
            <Input 
              prefix="+254" 
              placeholder="7XXXXXXXX"
              maxLength={9}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<MobileOutlined />}>
              Pay with M-Pesa
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Apply for Loan"
        visible={loanModalVisible}
        onCancel={() => setLoanModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleApplyForLoan}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Loan Amount (KES)"
            rules={[
              { required: true, message: 'Please enter loan amount' },
              { type: 'number', min: 1000, message: 'Minimum loan amount is KES 1,000' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\KES\s?|(,*)/g, '')}
              placeholder="Enter loan amount"
            />
          </Form.Item>

          <Form.Item
            name="purpose"
            label="Purpose"
            rules={[{ required: true, message: 'Please enter loan purpose' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe the purpose of the loan" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (months)"
            rules={[
              { required: true, message: 'Please enter loan duration' },
              { type: 'number', min: 1, max: 12, message: 'Duration must be between 1 and 12 months' }
            ]}
          >
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="guarantors"
            label="Guarantors"
            rules={[{ required: true, message: 'Please select at least one guarantor' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select guarantors"
              style={{ width: '100%' }}
            >
              {/* Add member options dynamically */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit Application
              </Button>
              <Button onClick={() => setLoanModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .member-finance {
          padding: 24px;
        }
        .finance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .stats-row {
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default MemberFinance; 