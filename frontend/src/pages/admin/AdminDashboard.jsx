import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Table, Statistic } from 'antd';
import { UserOutlined, DollarOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    pendingApprovals: 0,
    totalContributions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activities')
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Activity',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    }
  ];

  return (
    <div className="admin-dashboard p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Loans"
              value={stats.activeLoans}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.pendingApprovals}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contributions"
              value={stats.totalContributions}
              prefix={<DollarOutlined />}
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
              onClick={() => navigate('/admin/members/new')}
              className="mr-4"
            >
              Add New Member
            </Button>
            <Button 
              onClick={() => navigate('/admin/meetings/new')}
              className="mr-4"
            >
              Schedule Meeting
            </Button>
            <Button 
              onClick={() => navigate('/admin/loans/pending')}
            >
              Review Loans
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col span={24}>
          <Card title="Recent Activity">
            <Table
              columns={columns}
              dataSource={recentActivities}
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 