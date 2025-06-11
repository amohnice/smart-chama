import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import MemberForm from '../components/MemberForm';
import { useUser } from '../contexts/UserContext';
import styles from './Members.module.css';

/**
 * Members page displays and manages chama members.
 */
const Members = () => {
  const { user, isAdmin } = useUser();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  /**
   * Fetches members from the backend.
   */
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/members');
      setMembers(response.data || []);
      
      // If admin, fetch pending approvals
      if (isAdmin()) {
        const pendingResponse = await api.get('/members/pending');
        setPendingApprovals(pendingResponse.data || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.response?.data?.error || 'Failed to fetch members. Please try again later.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await api.delete(`/members/${memberId}`);
      setMembers(members.filter(member => member._id !== memberId));
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(err.response?.data?.error || 'Failed to delete member. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      setError(null);
      const response = await api.patch(`/members/${memberId}/approve`);
      setMembers(members.map(member => 
        member._id === memberId ? response.data : member
      ));
      setPendingApprovals(pendingApprovals.filter(member => member._id !== memberId));
    } catch (err) {
      console.error('Error approving member:', err);
      setError(err.response?.data?.error || 'Failed to approve member. Please try again later.');
    }
  };

  const handleRejectMember = async (memberId) => {
    try {
      setError(null);
      await api.patch(`/members/${memberId}/reject`);
      setPendingApprovals(pendingApprovals.filter(member => member._id !== memberId));
    } catch (err) {
      console.error('Error rejecting member:', err);
      setError(err.response?.data?.error || 'Failed to reject member. Please try again later.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (selectedMember) {
        // Update existing member
        const response = await api.patch(`/members/${selectedMember._id}`, formData);
        setMembers(members.map(member => 
          member._id === selectedMember._id ? response.data : member
        ));
      } else {
        // Add new member
        const response = await api.post('/members', {
          ...formData,
          role: 'member',
          status: 'pending' // New members start as pending
        });
        setMembers([...members, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving member:', err);
      setError(err.response?.data?.error || 'Failed to save member. Please try again later.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading members...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Members</h1>
        {isAdmin() && (
          <button 
            className={styles.addButton}
            onClick={handleAddMember}
            disabled={isDeleting}
          >
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={fetchMembers} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {isAdmin() && pendingApprovals.length > 0 && (
        <div className={styles.pendingApprovals}>
          <h2>Pending Approvals</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map(member => (
                  <tr key={member._id}>
                    <td>{`${member.firstName} ${member.lastName}`}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApproveMember(member._id)}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleRejectMember(member._id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              {isAdmin() && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members && members.length > 0 ? (
              members.map(member => (
                <tr key={member._id}>
                  <td>{`${member.firstName} ${member.lastName}`}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>
                    <span className={`${styles.status} ${styles[member.status?.toLowerCase() || 'active']}`}>
                      {member.status || 'Active'}
                    </span>
                  </td>
                  {isAdmin() && (
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditMember(member)}
                          disabled={isDeleting}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteMember(member._id)}
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin() ? 5 : 4} className={styles.noData}>
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMember ? 'Edit Member' : 'Add Member'}
      >
        <MemberForm
          member={selectedMember}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Members; 