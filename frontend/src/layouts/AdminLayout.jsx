import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Space, Button } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminNav from '../components/navigation/AdminNav';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/admin/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="p-4">
          <h1 className="text-white text-xl font-bold text-center">
            {collapsed ? 'SC' : 'Smart Chama'}
          </h1>
        </div>
        <AdminNav />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex justify-between items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span>{user?.firstName} {user?.lastName}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="m-6 p-6 bg-white">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 