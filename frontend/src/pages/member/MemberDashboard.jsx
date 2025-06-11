import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Table, Statistic, Progress } from 'antd';
import { DollarOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalContributions: 0,
    activeLoan: null,
    nextMeeting: null,
    contributionProgress: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, transactionsResponse] = await Promise.all([
        api.get('/members/stats'),
        api.get('/members/transactions')
      ]);

      setStats(statsResponse.data);
      setRecentTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    }
  ];

  return (
    <div className="member-dashboard p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.firstName}!</h1>
      
      {/* Personal Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={stats.totalContributions}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Loan"
              value={stats.activeLoan?.amount || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Next Meeting"
              value={stats.nextMeeting?.date}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Contribution Progress"
              value={stats.contributionProgress}
              prefix={<Progress type="circle" percent={stats.contributionProgress} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card title="Quick Actions">
            <Button 
              type="primary" 
              onClick={() => navigate('/contributions/new')}
              className="mr-4"
            >
              Make Contribution
            </Button>
            <Button 
              onClick={() => navigate('/loans/apply')}
              className="mr-4"
            >
              Apply for Loan
            </Button>
            <Button 
              onClick={() => navigate('/meetings')}
            >
              View Meetings
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Row>
        <Col span={24}>
          <Card title="Recent Transactions">
            <Table
              columns={columns}
              dataSource={recentTransactions}
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Upcoming Events */}
      {stats.nextMeeting && (
        <Row className="mt-6">
          <Col span={24}>
            <Card title="Next Meeting">
              <div className="flex items-center">
                <CalendarOutlined className="text-2xl mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">{stats.nextMeeting.title}</h3>
                  <p>Date: {stats.nextMeeting.date}</p>
                  <p>Time: {stats.nextMeeting.time}</p>
                  <p>Location: {stats.nextMeeting.location}</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default MemberDashboard; 