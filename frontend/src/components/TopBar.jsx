import React from 'react';
import styles from './TopBar.module.css';

/**
 * TopBar displays the current page title and user info.
 * @param {object} props
 * @param {string} props.title - The current page title
 */
const TopBar = ({ title }) => (
  <header className={styles.topBar}>
    <h1>{title}</h1>
    <div className={styles.userInfo}>
      <span>Welcome, User</span>
    </div>
  </header>
);

export default TopBar; 