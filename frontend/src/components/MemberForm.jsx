import React, { useState, useEffect } from 'react';
import styles from './MemberForm.module.css';

/**
 * Form component for adding/editing members
 * @param {object} props
 * @param {object} props.member - Member data for editing (optional)
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 */
const MemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'Active'
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter member's name"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter member's email"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="Enter member's phone number"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {member ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  );
};

export default MemberForm; 