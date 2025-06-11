import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const MemberNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/member/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/member/meetings',
      icon: <CalendarOutlined />,
      label: 'Meetings',
    },
    {
      key: '/member/finance',
      icon: <DollarOutlined />,
      label: 'Finance',
    },
    {
      key: '/member/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );
};

export default MemberNav; 