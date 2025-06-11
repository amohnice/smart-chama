import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import LoanForm from '../components/LoanForm';
import styles from './Loans.module.css';

/**
 * Loans page displays and manages member loans.
 */
const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, membersRes] = await Promise.all([
        api.get('/api/loans'),
        api.get('/api/users')
      ]);
      setLoans(loansRes.data);
      setMembers(membersRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = () => {
    setSelectedLoan(null);
    setIsModalOpen(true);
  };

  const handleEditLoan = (loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/api/loans/${loanId}`);
      setLoans(loans.filter(loan => loan._id !== loanId));
    } catch (err) {
      setError('Failed to delete loan. Please try again later.');
      console.error('Error deleting loan:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedLoan) {
        // Update existing loan
        const response = await api.patch(`/api/loans/${selectedLoan._id}`, formData);
        setLoans(loans.map(loan => 
          loan._id === selectedLoan._id ? response.data : loan
        ));
      } else {
        // Add new loan
        const response = await api.post('/api/loans', formData);
        setLoans([...loans, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save loan. Please try again later.');
      console.error('Error saving loan:', err);
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m._id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const calculateTotalAmount = (amount, interestRate) => {
    const interest = (amount * interestRate) / 100;
    return amount + interest;
  };

  if (loading) {
    return <div className={styles.loading}>Loading loans...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Loans</h1>
        <button 
          className={styles.addButton}
          onClick={handleAddLoan}
          disabled={isDeleting}
        >
          Add Loan
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Interest Rate</th>
              <th>Total Amount</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map(loan => (
              <tr key={loan._id}>
                <td>{getMemberName(loan.memberId)}</td>
                <td>{formatCurrency(loan.amount)}</td>
                <td>{loan.interestRate}%</td>
                <td>{formatCurrency(calculateTotalAmount(loan.amount, loan.interestRate))}</td>
                <td>{new Date(loan.startDate).toLocaleDateString()}</td>
                <td>{new Date(loan.endDate).toLocaleDateString()}</td>
                <td>{loan.paymentSchedule}</td>
                <td>
                  <span className={`${styles.status} ${styles[loan.status.toLowerCase()]}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditLoan(loan)}
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteLoan(loan._id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLoan ? 'Edit Loan' : 'Add Loan'}
      >
        <LoanForm
          loan={selectedLoan}
          members={members}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Loans; 