import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  message,
  Progress,
  List,
  Avatar,
  Typography,
  Divider,
  Spin,
} from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  BankOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Line, Bar, Pie } from '@ant-design/plots';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalContributions: 0,
    pendingApprovals: 0,
    monthlyContributions: 0,
    monthlyLoans: 0,
    contributionGrowth: 0,
    loanGrowth: 0,
    totalLoans: 0,
    totalDocuments: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [contributionData, setContributionData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [memberDistribution, setMemberDistribution] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, membersRes, transactionsRes] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/dashboard/members/recent'),
          api.get('/api/dashboard/transactions/recent'),
        ]);

        console.log('Dashboard data:', {
          stats: statsRes.data,
          members: membersRes.data,
          transactions: transactionsRes.data,
        });

        setStats(statsRes.data || {});
        setRecentMembers(membersRes.data || []);
        setRecentTransactions(transactionsRes.data || []);

        // Generate mock data for charts since the endpoints don't exist yet
        const mockContributionData = generateMockContributionData();
        const mockLoanData = generateMockLoanData();
        const mockMemberDistribution = generateMockMemberDistribution();

        setContributionData(mockContributionData);
        setLoanData(mockLoanData);
        setMemberDistribution(mockMemberDistribution);
      } catch (error) {
        console.error('Dashboard data error:', error);
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper functions to generate mock data
  const generateMockContributionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 10000),
      category: 'Contributions'
    }));
  };

  const generateMockLoanData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 5000),
      category: Math.random() > 0.5 ? 'Active Loans' : 'Pending Loans'
    }));
  };

  const generateMockMemberDistribution = () => {
    return [
      { category: 'Active', value: 65 },
      { category: 'Inactive', value: 25 },
      { category: 'Pending', value: 10 }
    ];
  };

  const handleActivateMember = async (memberId) => {
    try {
      await api.put(`/api/members/${memberId}/activate`);
      message.success('Member activated successfully');
      fetchDashboardData();
    } catch (error) {
      message.error('Failed to activate member');
    }
  };

  const handleDeactivateMember = async (memberId) => {
    try {
      await api.put(`/api/members/${memberId}/deactivate`);
      message.success('Member deactivated successfully');
      fetchDashboardData();
    } catch (error) {
      message.error('Failed to deactivate member');
    }
  };

  const memberColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{record.name || 'Unknown'}</Text>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {(status || 'inactive').toUpperCase()}
        </Tag>
      ),
    },
  ];

  const transactionColumns = [
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
      render: (status) => {
        const colors = {
          completed: 'green',
          pending: 'orange',
          failed: 'red'
        };
        const icons = {
          completed: <CheckCircleOutlined />,
          pending: <ClockCircleOutlined />,
          failed: <CloseCircleOutlined />
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
      responsive: ['xs'],
    },
  ];

  const contributionConfig = {
    data: contributionData,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond'
    },
    label: {
      style: {
        fill: '#aaa'
      }
    },
    meta: {
      value: {
        alias: 'Amount'
      }
    }
  };

  const loanConfig = {
    data: loanData,
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    isGroup: true,
    label: {
      position: 'top',
      style: {
        fill: '#fff',
        opacity: 0.6
      }
    },
    meta: {
      value: {
        alias: 'Amount'
      }
    }
  };

  const memberConfig = {
    data: memberDistribution,
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{category}: {percentage}'
    },
    interactions: [
      {
        type: 'element-active'
      }
    ],
    meta: {
      value: {
        alias: 'Count'
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Welcome back, {user?.firstName}!</Title>
        <Text type="secondary">Here's what's happening with your chama today.</Text>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              prefix={<TeamOutlined />}
            />
            <Progress
              percent={Math.round((stats.totalMembers / 100) * 100)}
              size="small"
              status="active"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Loans"
              value={stats.activeLoans}
              prefix={<CalendarOutlined />}
            />
            <div className="growth-indicator">
              <Text type={stats.loanGrowth >= 0 ? 'success' : 'danger'}>
                {stats.loanGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                {Math.abs(stats.loanGrowth)}%
              </Text>
              <Text type="secondary"> from last month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={stats.totalContributions}
              prefix={<DollarOutlined />}
            />
            <div className="growth-indicator">
              <Text type={stats.contributionGrowth >= 0 ? 'success' : 'danger'}>
                {stats.contributionGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                {Math.abs(stats.contributionGrowth)}%
              </Text>
              <Text type="secondary"> from last month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Loans"
              value={stats.totalLoans}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={stats.totalDocuments}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              prefix={<ClockCircleOutlined />}
            />
            <div className="approval-status">
              <Tag icon={<ClockCircleOutlined />} color="orange">
                {stats.pendingApprovals} pending
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-row">
        <Col xs={24} lg={12}>
          <Card
            title="Recent Members"
            className="recent-members-card"
            loading={loading}
          >
            <Table
              columns={memberColumns}
              dataSource={recentMembers.map(member => ({ ...member, key: member._id || member.id }))}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Transactions"
            className="recent-transactions-card"
            loading={loading}
          >
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions.map(transaction => ({ ...transaction, key: transaction._id || transaction.id }))}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-row">
        <Col xs={24} lg={12}>
          <Card title="Contribution Trends" className="hover-scale">
            <Line {...contributionConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Loan Distribution" className="hover-scale">
            <Bar {...loanConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-row">
        <Col xs={24} lg={12}>
          <Card title="Member Distribution" className="hover-scale">
            <Pie {...memberConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Transactions" 
            className="hover-scale"
            extra={
              <Button type="link" onClick={() => window.location.href = '/admin/transactions'}>
                View All
              </Button>
            }
          >
            <Table
              columns={transactionColumns}
              dataSource={recentTransactions.map(transaction => ({ ...transaction, key: transaction._id || transaction.id }))}
              loading={loading}
              pagination={false}
              scroll={{ x: true }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <style>{`
        .admin-dashboard {
          padding: 24px;
        }
        .dashboard-header {
          margin-bottom: 24px;
        }
        .stats-row {
          margin-bottom: 24px;
        }
        .content-row {
          margin-top: 24px;
        }
        .growth-indicator {
          margin-top: 8px;
          font-size: 12px;
        }
        .approval-status {
          margin-top: 8px;
        }
        .recent-members-card,
        .recent-transactions-card {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 