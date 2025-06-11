import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space, message, Tabs } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { settingsService } from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
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
      await settingsService.updateSettings(values);
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      key: 'general',
      label: 'General Settings',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="chamaName"
            label="Chama Name"
            rules={[{ required: true, message: 'Please enter chama name' }]}
          >
            <Input placeholder="Enter chama name" />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
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
            name="contributionFrequency"
            label="Contribution Frequency"
            rules={[{ required: true, message: 'Please select contribution frequency' }]}
          >
            <Select placeholder="Select frequency">
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
              <Option value="annually">Annually</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="minimumContribution"
            label="Minimum Contribution"
            rules={[{ required: true, message: 'Please enter minimum contribution' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter minimum contribution"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'loans',
      label: 'Loan Settings',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="maxLoanAmount"
            label="Maximum Loan Amount"
            rules={[{ required: true, message: 'Please enter maximum loan amount' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter maximum loan amount"
            />
          </Form.Item>

          <Form.Item
            name="loanInterestRate"
            label="Loan Interest Rate (%)"
            rules={[{ required: true, message: 'Please enter loan interest rate' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Enter loan interest rate"
            />
          </Form.Item>

          <Form.Item
            name="loanProcessingFee"
            label="Loan Processing Fee (%)"
            rules={[{ required: true, message: 'Please enter loan processing fee' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Enter loan processing fee"
            />
          </Form.Item>

          <Form.Item
            name="latePaymentPenalty"
            label="Late Payment Penalty (%)"
            rules={[{ required: true, message: 'Please enter late payment penalty' }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              placeholder="Enter late payment penalty"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: 'Notification Settings',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="enableNotifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableEmailNotifications"
            label="Enable Email Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableSMSNotifications"
            label="Enable SMS Notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="meetingReminderDays"
            label="Meeting Reminder Days"
            rules={[{ required: true, message: 'Please enter meeting reminder days' }]}
          >
            <InputNumber
              min={1}
              max={7}
              style={{ width: '100%' }}
              placeholder="Enter meeting reminder days"
            />
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <div className="settings-page">
      <Card
        title="System Settings"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSettings}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            chamaName: '',
            currency: 'KES',
            contributionFrequency: 'monthly',
            enableNotifications: true,
            enableEmailNotifications: true,
            enableSMSNotifications: false,
            maxLoanAmount: 0,
            loanInterestRate: 0,
            loanProcessingFee: 0,
            minimumContribution: 0,
            latePaymentPenalty: 0,
            meetingReminderDays: 1,
            documentRetentionDays: 365,
          }}
        >
          <Tabs defaultActiveKey="general" items={items} />
          
          <div className="mt-6">
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
      </Card>
    </div>
  );
};

export default AdminSettings; 