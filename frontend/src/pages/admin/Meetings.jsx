import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingService.getMeetings();
      setMeetings(response.data);
    } catch (error) {
      message.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    form.setFieldsValue({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      location: meeting.location,
      type: meeting.type,
      description: meeting.description,
    });
    setModalVisible(true);
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await meetingService.deleteMeeting(meetingId);
      message.success('Meeting deleted successfully');
      fetchMeetings();
    } catch (error) {
      message.error('Failed to delete meeting');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedMeeting) {
        await meetingService.updateMeeting(selectedMeeting.id, values);
        message.success('Meeting updated successfully');
      } else {
        await meetingService.createMeeting(values);
        message.success('Meeting created successfully');
      }
      setModalVisible(false);
      fetchMeetings();
    } catch (error) {
      message.error('Failed to save meeting');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
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
        <Tag color={
          type === 'regular' ? 'blue' :
          type === 'emergency' ? 'red' :
          type === 'annual' ? 'green' : 'default'
        }>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'scheduled' ? 'blue' :
          status === 'completed' ? 'green' :
          status === 'cancelled' ? 'red' : 'default'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditMeeting(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMeeting(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="meetings-page">
      <Card
        title="Meetings Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMeeting}
          >
            Schedule Meeting
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={meetings.map(meeting => ({ ...meeting, key: meeting._id || meeting.id }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={selectedMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter meeting title' }]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select meeting date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please enter meeting time' }]}
          >
            <Input placeholder="Enter meeting time" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter meeting location' }]}
          >
            <Input placeholder="Enter meeting location" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select meeting type' }]}
          >
            <Select placeholder="Select meeting type">
              <Option value="regular">Regular</Option>
              <Option value="emergency">Emergency</Option>
              <Option value="annual">Annual</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter meeting description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedMeeting ? 'Update' : 'Create'}
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

export default AdminMeetings; 