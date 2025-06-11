import React, { useState, useEffect } from 'react';
import styles from './ContributionForm.module.css';

/**
 * Form component for adding/editing contributions
 * @param {object} props
 * @param {object} props.contribution - Contribution data for editing (optional)
 * @param {Array} props.members - List of members for selection
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 */
const ContributionForm = ({ contribution, members, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: 'Regular',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => {
    if (contribution) {
      setFormData({
        memberId: contribution.memberId || '',
        amount: contribution.amount || '',
        type: contribution.type || 'Regular',
        date: contribution.date ? new Date(contribution.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: contribution.status || 'Pending'
      });
    }
  }, [contribution]);

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
        <label htmlFor="memberId">Member</label>
        <select
          id="memberId"
          name="memberId"
          value={formData.memberId}
          onChange={handleChange}
          required
        >
          <option value="">Select a member</option>
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="amount">Amount (KES)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="Enter contribution amount"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="Regular">Regular</option>
          <option value="Emergency">Emergency</option>
          <option value="Special">Special</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {contribution ? 'Update Contribution' : 'Add Contribution'}
        </button>
      </div>
    </form>
  );
};

export default ContributionForm; 