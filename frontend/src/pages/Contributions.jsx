import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import ContributionForm from '../components/ContributionForm';
import styles from './Contributions.module.css';

/**
 * Contributions page displays and manages member contributions.
 */
const Contributions = () => {
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contributionsRes, membersRes] = await Promise.all([
        api.get('/api/contributions'),
        api.get('/api/users')
      ]);
      setContributions(contributionsRes.data);
      setMembers(membersRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = () => {
    setSelectedContribution(null);
    setIsModalOpen(true);
  };

  const handleEditContribution = (contribution) => {
    setSelectedContribution(contribution);
    setIsModalOpen(true);
  };

  const handleDeleteContribution = async (contributionId) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/api/contributions/${contributionId}`);
      setContributions(contributions.filter(contribution => contribution._id !== contributionId));
    } catch (err) {
      setError('Failed to delete contribution. Please try again later.');
      console.error('Error deleting contribution:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedContribution) {
        // Update existing contribution
        const response = await api.patch(`/api/contributions/${selectedContribution._id}`, formData);
        setContributions(contributions.map(contribution => 
          contribution._id === selectedContribution._id ? response.data : contribution
        ));
      } else {
        // Add new contribution
        const response = await api.post('/api/contributions', formData);
        setContributions([...contributions, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save contribution. Please try again later.');
      console.error('Error saving contribution:', err);
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

  if (loading) {
    return <div className={styles.loading}>Loading contributions...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Contributions</h1>
        <button 
          className={styles.addButton}
          onClick={handleAddContribution}
          disabled={isDeleting}
        >
          Add Contribution
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(contribution => (
              <tr key={contribution._id}>
                <td>{getMemberName(contribution.memberId)}</td>
                <td>{formatCurrency(contribution.amount)}</td>
                <td>{contribution.type}</td>
                <td>{new Date(contribution.date).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.status} ${styles[contribution.status.toLowerCase()]}`}>
                    {contribution.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditContribution(contribution)}
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteContribution(contribution._id)}
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
        title={selectedContribution ? 'Edit Contribution' : 'Add Contribution'}
      >
        <ContributionForm
          contribution={selectedContribution}
          members={members}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Contributions; 