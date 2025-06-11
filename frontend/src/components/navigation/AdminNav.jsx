import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/members',
      icon: <TeamOutlined />,
      label: 'Members',
    },
    {
      key: '/admin/finance',
      icon: <DollarOutlined />,
      label: 'Finance',
      children: [
        {
          key: '/admin/finance/transactions',
          label: 'Transactions',
        },
        {
          key: '/admin/finance/loans',
          label: 'Loans',
        },
        {
          key: '/admin/finance/reports',
          label: 'Reports',
        },
      ],
    },
    {
      key: '/admin/meetings',
      icon: <CalendarOutlined />,
      label: 'Meetings',
    },
    {
      key: '/admin/documents',
      icon: <FileOutlined />,
      label: 'Documents',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: '/admin/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );
};

export default AdminNav; 