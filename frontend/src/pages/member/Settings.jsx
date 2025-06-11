import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Tabs, Space, Divider } from 'antd';
import { SaveOutlined, ReloadOutlined, BellOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { TabPane } = Tabs;
const { Option } = Select;

const MemberSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/settings');
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      await api.put('/members/settings', values);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSettings}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs defaultActiveKey="notifications">
          <TabPane tab="Notification Settings" key="notifications">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                enableEmailNotifications: true,
                enableSMSNotifications: false,
                notifyOnContribution: true,
                notifyOnLoan: true,
                notifyOnMeeting: true,
                notifyOnDocument: true,
                notifyOnPayment: true,
                meetingReminderDays: 1,
                contributionReminderDays: 1,
                paymentReminderDays: 1,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="enableEmailNotifications"
                  label="Email Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="enableSMSNotifications"
                  label="SMS Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider className="md:col-span-2">Notification Types</Divider>

                <Form.Item
                  name="notifyOnContribution"
                  label="Contribution Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="notifyOnLoan"
                  label="Loan Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="notifyOnMeeting"
                  label="Meeting Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="notifyOnDocument"
                  label="Document Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="notifyOnPayment"
                  label="Payment Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider className="md:col-span-2">Reminder Settings</Divider>

                <Form.Item
                  name="meetingReminderDays"
                  label="Meeting Reminder (Days Before)"
                  rules={[{ required: true, message: 'Please enter meeting reminder days' }]}
                >
                  <Select placeholder="Select days">
                    <Option value={1}>1 Day</Option>
                    <Option value={2}>2 Days</Option>
                    <Option value={3}>3 Days</Option>
                    <Option value={7}>1 Week</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="contributionReminderDays"
                  label="Contribution Reminder (Days Before)"
                  rules={[{ required: true, message: 'Please enter contribution reminder days' }]}
                >
                  <Select placeholder="Select days">
                    <Option value={1}>1 Day</Option>
                    <Option value={2}>2 Days</Option>
                    <Option value={3}>3 Days</Option>
                    <Option value={7}>1 Week</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="paymentReminderDays"
                  label="Payment Reminder (Days Before)"
                  rules={[{ required: true, message: 'Please enter payment reminder days' }]}
                >
                  <Select placeholder="Select days">
                    <Option value={1}>1 Day</Option>
                    <Option value={2}>2 Days</Option>
                    <Option value={3}>3 Days</Option>
                    <Option value={7}>1 Week</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                >
                  Save Settings
                </Button>
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Security" key="security">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <div className="grid grid-cols-1 gap-6">
                <Form.Item
                  name="twoFactorEnabled"
                  label="Two-Factor Authentication"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="loginNotification"
                  label="Login Notifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="sessionTimeout"
                  label="Session Timeout (Minutes)"
                  rules={[{ required: true, message: 'Please select session timeout' }]}
                >
                  <Select placeholder="Select timeout">
                    <Option value={15}>15 Minutes</Option>
                    <Option value={30}>30 Minutes</Option>
                    <Option value={60}>1 Hour</Option>
                    <Option value={120}>2 Hours</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                >
                  Save Security Settings
                </Button>
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Display" key="display">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <div className="grid grid-cols-1 gap-6">
                <Form.Item
                  name="theme"
                  label="Theme"
                  rules={[{ required: true, message: 'Please select theme' }]}
                >
                  <Select placeholder="Select theme">
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                    <Option value="system">System Default</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="currency"
                  label="Currency Display"
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                  <Select placeholder="Select currency">
                    <Option value="KES">Kenyan Shilling (KES)</Option>
                    <Option value="USD">US Dollar (USD)</Option>
                    <Option value="EUR">Euro (EUR)</Option>
                    <Option value="GBP">British Pound (GBP)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dateFormat"
                  label="Date Format"
                  rules={[{ required: true, message: 'Please select date format' }]}
                >
                  <Select placeholder="Select date format">
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="timeFormat"
                  label="Time Format"
                  rules={[{ required: true, message: 'Please select time format' }]}
                >
                  <Select placeholder="Select time format">
                    <Option value="12h">12-hour</Option>
                    <Option value="24h">24-hour</Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                >
                  Save Display Settings
                </Button>
              </div>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MemberSettings; 