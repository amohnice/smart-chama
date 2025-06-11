import React from 'react';
import styles from './Modal.module.css';

/**
 * Reusable Modal component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 