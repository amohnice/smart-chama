import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Tabs, Space, Divider, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../services/api';

const Profile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/me');
      setUserData(response.data);
      form.setFieldsValue(response.data);
      if (response.data.profilePicture) {
        setProfileImage(`${import.meta.env.VITE_API_URL}/${response.data.profilePicture}`);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      message.error(error.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setSaving(true);
      const response = await api.put('/api/auth/profile', values);
      setUserData(response.data);
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      message.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setSaving(true);
      await api.put('/api/auth/change-password', values);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Password change error:', error);
      message.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setSaving(true);
      const response = await api.put('/api/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileImage(`${import.meta.env.VITE_API_URL}/${response.data.profileImage}`);
      message.success('Profile image updated successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      message.error(error.response?.data?.error || 'Failed to update profile image');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      key: 'personal',
      label: 'Personal Information',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={userData}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter last name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              className="md:col-span-2"
            >
              <Input.TextArea rows={3} placeholder="Enter address" />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <div className="grid grid-cols-1 gap-6">
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter current password"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
              />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
            >
              Change Password
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <div className="flex flex-col items-center">
              <Avatar
                size={120}
                src={profileImage}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImageUpload(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Change Photo</Button>
              </Upload>
              <div className="mt-4 text-center">
                <h2 className="text-lg font-semibold">
                  {userData?.firstName} {userData?.lastName}
                </h2>
                <p className="text-gray-500">{userData?.email}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <Tabs defaultActiveKey="personal" items={items} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 