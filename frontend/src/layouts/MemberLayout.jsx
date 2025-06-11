import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MemberNav from '../components/navigation/MemberNav';

const { Header, Sider, Content } = Layout;

const MemberLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/member/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/member/settings'),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <BellOutlined />,
      onClick: () => navigate('/member/notifications'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className="logo p-4">
          <h1 className="text-xl font-bold text-center">
            {collapsed ? 'SC' : 'Smart Chama'}
          </h1>
        </div>
        <MemberNav />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer">
                <Avatar
                  icon={<UserOutlined />}
                  src={user?.profileImage}
                  className="mr-2"
                />
                <span className="hidden md:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-white">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MemberLayout; 