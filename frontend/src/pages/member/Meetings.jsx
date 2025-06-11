import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, message, Row, Col, Statistic, Tabs } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Meetings = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/api/meetings/upcoming'),
        api.get('/api/meetings/past')
      ]);
      setUpcomingMeetings(upcomingRes.data);
      setPastMeetings(pastRes.data);
    } catch (error) {
      message.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (meetingId, willAttend) => {
    try {
      await api.post(`/api/meetings/${meetingId}/attendance`, {
        member: user._id,
        willAttend,
      });
      message.success('Attendance updated successfully');
      fetchMeetings();
    } catch (error) {
      message.error('Failed to update attendance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'blue';
      case 'ongoing':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'regular':
        return 'blue';
      case 'emergency':
        return 'red';
      case 'annual':
        return 'purple';
      default:
        return 'default';
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  const totalAttendance = [...upcomingMeetings, ...pastMeetings].reduce((sum, meeting) => {
    const attendance = meeting.attendees?.find(a => a.member === user._id);
    return sum + (attendance?.willAttend ? 1 : 0);
  }, 0);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_, record) => formatDateTime(record.date, record.time),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => {
        const attendance = record.attendees?.find(a => a.member === user._id);
        return (
          <Space>
            {record.status === 'upcoming' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAttendance(record._id, true)}
                  disabled={attendance?.willAttend}
                >
                  Will Attend
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleAttendance(record._id, false)}
                  disabled={attendance?.willAttend === false}
                >
                  Won't Attend
                </Button>
              </>
            )}
            {record.status !== 'upcoming' && attendance && (
              <Tag color={attendance.willAttend ? 'green' : 'red'}>
                {attendance.willAttend ? 'Attended' : 'Absent'}
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  const items = [
    {
      key: 'upcoming',
      label: 'Upcoming Meetings',
      children: (
        <Table
          columns={columns}
          dataSource={upcomingMeetings}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'past',
      label: 'Past Meetings',
      children: (
        <Table
          columns={columns}
          dataSource={pastMeetings}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Meetings</h1>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Upcoming Meetings"
              value={upcomingMeetings.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Attendance"
              value={totalAttendance}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="upcoming" items={items} />
      </Card>
    </div>
  );
};

export default Meetings; 