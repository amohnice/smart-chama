import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Tabs, Space, Divider, Avatar, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, BankOutlined, IdcardOutlined } from '@ant-design/icons';
import memberService from '../../services/memberService';

const { TabPane } = Tabs;

const MemberProfile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await memberService.getProfile();
      form.setFieldsValue(profileData);
      if (profileData.profileImage) {
        setProfileImage(profileData.profileImage);
      }
    } catch (error) {
      message.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setSaving(true);
      await memberService.updateProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setSaving(true);
      await memberService.changePassword(values);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setSaving(true);
      const response = await memberService.updateProfileImage(file);
      setProfileImage(response.profileImage);
      message.success('Profile image updated successfully');
    } catch (error) {
      message.error('Failed to update profile image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
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
                  {form.getFieldValue('firstName')} {form.getFieldValue('lastName')}
                </h2>
                <p className="text-gray-500">{form.getFieldValue('email')}</p>
                <p className="text-gray-500">Member ID: {form.getFieldValue('memberId')}</p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card>
            <Tabs defaultActiveKey="personal">
              <TabPane tab="Personal Information" key="personal">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  initialValues={{
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    dateOfBirth: '',
                    gender: '',
                    occupation: '',
                    employer: '',
                    emergencyContact: {
                      name: '',
                      relationship: '',
                      phone: '',
                    },
                  }}
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
                      name="dateOfBirth"
                      label="Date of Birth"
                      rules={[{ required: true, message: 'Please enter date of birth' }]}
                    >
                      <Input type="date" />
                    </Form.Item>

                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true, message: 'Please select gender' }]}
                    >
                      <Input placeholder="Enter gender" />
                    </Form.Item>

                    <Form.Item
                      name="occupation"
                      label="Occupation"
                    >
                      <Input placeholder="Enter occupation" />
                    </Form.Item>

                    <Form.Item
                      name="employer"
                      label="Employer"
                    >
                      <Input placeholder="Enter employer" />
                    </Form.Item>

                    <Form.Item
                      name={['emergencyContact', 'name']}
                      label="Emergency Contact Name"
                      rules={[{ required: true, message: 'Please enter emergency contact name' }]}
                    >
                      <Input placeholder="Enter emergency contact name" />
                    </Form.Item>

                    <Form.Item
                      name={['emergencyContact', 'relationship']}
                      label="Relationship"
                      rules={[{ required: true, message: 'Please enter relationship' }]}
                    >
                      <Input placeholder="Enter relationship" />
                    </Form.Item>

                    <Form.Item
                      name={['emergencyContact', 'phone']}
                      label="Emergency Contact Phone"
                      rules={[{ required: true, message: 'Please enter emergency contact phone' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Enter emergency contact phone" />
                    </Form.Item>
                  </div>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving}>
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Security" key="security">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[{ required: true, message: 'Please enter current password' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Please enter new password' },
                      { min: 8, message: 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
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
                    <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving}>
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemberProfile; 