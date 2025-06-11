import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip,
  Badge,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/members');
      setMembers(response.data);
    } catch (error) {
      message.error('Failed to fetch members');
      console.error('Members fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    form.setFieldsValue({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      role: member.role
    });
    setModalVisible(true);
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await api.delete(`/api/admin/members/${memberId}`);
      message.success('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      message.error('Failed to delete member');
    }
  };

  const handleActivateMember = async (memberId) => {
    try {
      await api.put(`/api/admin/members/${memberId}/activate`);
      message.success('Member activated successfully');
      fetchMembers();
    } catch (error) {
      message.error('Failed to activate member');
    }
  };

  const handleDeactivateMember = async (memberId) => {
    try {
      await api.put(`/api/admin/members/${memberId}/deactivate`);
      message.success('Member deactivated successfully');
      fetchMembers();
    } catch (error) {
      message.error('Failed to deactivate member');
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      await api.put(`/api/admin/members/${memberId}/activate`);
      message.success('Member approved successfully');
      fetchMembers();
    } catch (error) {
      message.error('Failed to approve member');
    }
  };

  const handleRejectMember = async (memberId) => {
    try {
      await api.put(`/api/admin/members/${memberId}/deactivate`);
      message.success('Member rejected successfully');
      fetchMembers();
    } catch (error) {
      message.error('Failed to reject member');
    }
  };

  const handleModalSubmit = async (values) => {
    try {
      if (selectedMember) {
        await api.put(`/api/admin/members/${selectedMember._id}`, values);
        message.success('Member updated successfully');
      } else {
        await api.post('/api/admin/members', values);
        message.success('Member added successfully');
      }
      setModalVisible(false);
      fetchMembers();
    } catch (error) {
      message.error(selectedMember ? 'Failed to update member' : 'Failed to add member');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <Badge
            status={getStatusColor(name?.status)}
            text={name || 'Unknown'}
          />
        </Space>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {(status || 'inactive').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleEditMember(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Member">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditMember(record)}
            />
          </Tooltip>
          {record.status === 'pending' ? (
            <>
              <Tooltip title="Approve Member">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => handleApproveMember(record.id)}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject Member">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => handleRejectMember(record.id)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          ) : record.status === 'inactive' ? (
            <Tooltip title="Activate Member">
              <Button
                type="primary"
                size="small"
                onClick={() => handleActivateMember(record.id)}
              >
                Activate
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Deactivate Member">
              <Button
                danger
                size="small"
                onClick={() => handleDeactivateMember(record.id)}
              >
                Deactivate
              </Button>
            </Tooltip>
          )}
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDeleteMember(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Member">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch = searchText
      ? `${member.name} ${member.email}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      filters.status === 'all' ? true : member.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="members-page">
      <Card
        title="Member Management"
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleAddMember}
          >
            Add Member
          </Button>
        }
      >
        <div className="filters-container">
          <Input
            placeholder="Search members..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, marginRight: 16 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="pending">Pending</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} members`,
          }}
        />
      </Card>

      <Modal
        title={selectedMember ? 'Edit Member' : 'Add Member'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedMember ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .members-page {
          padding: 24px;
        }
        .members-header {
          margin-bottom: 24px;
        }
        .members-table {
          margin-top: 24px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default Members; 