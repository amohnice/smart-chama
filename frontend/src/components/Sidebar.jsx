import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

/**
 * Sidebar navigation for main app sections.
 */
const Sidebar = () => (
  <nav className={styles.sidebar}>
    <div className={styles.logo}>
      <h2>Smart Chama</h2>
    </div>
    <ul className={styles.navLinks}>
      <li><NavLink to="/" end className={({isActive}) => isActive ? styles.active : ''}>Dashboard</NavLink></li>
      <li><NavLink to="/members" className={({isActive}) => isActive ? styles.active : ''}>Members</NavLink></li>
      <li><NavLink to="/contributions" className={({isActive}) => isActive ? styles.active : ''}>Contributions</NavLink></li>
      <li><NavLink to="/loans" className={({isActive}) => isActive ? styles.active : ''}>Loans</NavLink></li>
      <li><NavLink to="/meetings" className={({isActive}) => isActive ? styles.active : ''}>Meetings</NavLink></li>
    </ul>
  </nav>
);

export default Sidebar;
