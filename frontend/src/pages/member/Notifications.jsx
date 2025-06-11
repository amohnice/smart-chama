import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, message, Empty, Badge, Tabs, Space, Popconfirm } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  MailOutlined,
  MessageOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { TabPane } = Tabs;

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/members/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      message.success('Notification marked as read');
    } catch (error) {
      message.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/members/notifications/${notificationId}`);
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
      message.success('Notification deleted');
    } catch (error) {
      message.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/members/notifications/read-all');
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      message.success('All notifications marked as read');
    } catch (error) {
      message.error('Failed to mark all notifications as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/members/notifications');
      setNotifications([]);
      setUnreadCount(0);
      message.success('All notifications cleared');
    } catch (error) {
      message.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'email':
        return <MailOutlined style={{ color: '#1890ff' }} />;
      case 'message':
        return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'meeting':
        return <CalendarOutlined style={{ color: '#722ed1' }} />;
      case 'payment':
        return <DollarOutlined style={{ color: '#faad14' }} />;
      case 'document':
        return <FileOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'email':
        return 'blue';
      case 'message':
        return 'green';
      case 'meeting':
        return 'purple';
      case 'payment':
        return 'gold';
      case 'document':
        return 'pink';
      default:
        return 'default';
    }
  };

  const renderNotification = (notification) => (
    <List.Item
      actions={[
        !notification.read && (
          <Button
            type="link"
            icon={<CheckOutlined />}
            onClick={() => handleMarkAsRead(notification._id)}
          >
            Mark as Read
          </Button>
        ),
        <Popconfirm
          title="Are you sure you want to delete this notification?"
          onConfirm={() => handleDelete(notification._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>,
      ]}
    >
      <List.Item.Meta
        avatar={getNotificationIcon(notification.type)}
        title={
          <Space>
            {!notification.read && <Badge status="processing" />}
            <span>{notification.title}</span>
            <Tag color={getNotificationColor(notification.type)}>
              {notification.type.toUpperCase()}
            </Tag>
          </Space>
        }
        description={
          <div>
            <div className="text-gray-500 mb-2">{notification.message}</div>
            <div className="text-xs text-gray-400">
              {new Date(notification.createdAt).toLocaleString()}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Space>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Popconfirm
              title="Are you sure you want to clear all notifications?"
              onConfirm={handleClearAll}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Clear All</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Card>
        <Tabs defaultActiveKey="all">
          <TabPane
            tab={
              <span>
                All Notifications
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                )}
              </span>
            }
            key="all"
          >
            <List
              loading={loading}
              dataSource={notifications}
              renderItem={renderNotification}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No notifications"
                  />
                ),
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                Unread
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                )}
              </span>
            }
            key="unread"
          >
            <List
              loading={loading}
              dataSource={notifications.filter(n => !n.read)}
              renderItem={renderNotification}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No unread notifications"
                  />
                ),
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Notifications; 