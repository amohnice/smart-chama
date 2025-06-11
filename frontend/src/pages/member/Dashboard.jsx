import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, List, Typography, Tag, Space } from 'antd';
import { UserOutlined, DollarOutlined, BankOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons';
import memberService from '../../services/memberService';

const { Title, Text } = Typography;

const MemberDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentContributions, setRecentContributions] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          contributionsData,
          loansData,
          meetingsData,
          notificationsData
        ] = await Promise.all([
          memberService.getDashboardStats(),
          memberService.getRecentContributions(),
          memberService.getRecentLoans(),
          memberService.getUpcomingMeetings(),
          memberService.getNotifications()
        ]);

        setStats(statsData);
        setRecentContributions(contributionsData);
        setRecentLoans(loansData);
        setUpcomingMeetings(meetingsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const contributionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
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
    },
  ];

  const loanColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
          paid: 'blue',
        };
        return (
          <Tag color={colors[status]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>Member Dashboard</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Contributions"
              value={stats?.totalContributions || 0}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Active Loans"
              value={stats?.activeLoans || 0}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Upcoming Meetings"
              value={stats?.upcomingMeetings || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Notifications"
              value={stats?.unreadNotifications || 0}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Contributions"
            loading={loading}
            className="h-full"
          >
            <Table
              dataSource={recentContributions}
              columns={contributionColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Loans"
            loading={loading}
            className="h-full"
          >
            <Table
              dataSource={recentLoans}
              columns={loanColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Upcoming Meetings and Notifications */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <Card
            title="Upcoming Meetings"
            loading={loading}
            className="h-full"
          >
            <List
              dataSource={upcomingMeetings}
              renderItem={(meeting) => (
                <List.Item>
                  <List.Item.Meta
                    title={meeting.title}
                    description={
                      <Space direction="vertical">
                        <Text>{new Date(meeting.date).toLocaleString()}</Text>
                        <Text type="secondary">{meeting.location}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Notifications"
            loading={loading}
            className="h-full"
          >
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item>
                  <List.Item.Meta
                    title={notification.title}
                    description={notification.message}
                  />
                  <Text type="secondary">
                    {new Date(notification.date).toLocaleDateString()}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberDashboard; 