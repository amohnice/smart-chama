import React, { useState, useEffect } from 'react';
import styles from './LoanForm.module.css';

/**
 * Form component for adding/editing loans
 * @param {object} props
 * @param {object} props.loan - Loan data for editing (optional)
 * @param {Array} props.members - List of members for selection
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 */
const LoanForm = ({ loan, members, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentSchedule: 'Monthly',
    status: 'Pending',
    notes: ''
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        memberId: loan.memberId || '',
        amount: loan.amount || '',
        interestRate: loan.interestRate || '',
        startDate: loan.startDate ? new Date(loan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: loan.endDate ? new Date(loan.endDate).toISOString().split('T')[0] : '',
        paymentSchedule: loan.paymentSchedule || 'Monthly',
        status: loan.status || 'Pending',
        notes: loan.notes || ''
      });
    }
  }, [loan]);

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
        <label htmlFor="amount">Loan Amount (KES)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="Enter loan amount"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="interestRate">Interest Rate (%)</label>
        <input
          type="number"
          id="interestRate"
          name="interestRate"
          value={formData.interestRate}
          onChange={handleChange}
          required
          min="0"
          max="100"
          step="0.01"
          placeholder="Enter interest rate"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="paymentSchedule">Payment Schedule</label>
        <select
          id="paymentSchedule"
          name="paymentSchedule"
          value={formData.paymentSchedule}
          onChange={handleChange}
          required
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
        </select>
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
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Defaulted">Defaulted</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          rows="3"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {loan ? 'Update Loan' : 'Add Loan'}
        </button>
      </div>
    </form>
  );
};

export default LoanForm; 