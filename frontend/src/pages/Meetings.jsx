import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import MeetingForm from '../components/MeetingForm';
import styles from './Meetings.module.css';

/**
 * Meetings page displays and manages chama meetings.
 */
const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchMeetings();
  }, []);

  /**
   * Fetches meetings from the backend.
   */
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/meetings');
      setMeetings(response.data || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.response?.data?.error || 'Failed to fetch meetings. Please try again later.');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    setIsModalOpen(true);
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await api.delete(`/meetings/${meetingId}`);
      setMeetings(meetings.filter(meeting => meeting._id !== meetingId));
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(err.response?.data?.error || 'Failed to delete meeting. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (selectedMeeting) {
        // Update existing meeting
        const response = await api.patch(`/meetings/${selectedMeeting._id}`, formData);
        setMeetings(meetings.map(meeting => 
          meeting._id === selectedMeeting._id ? response.data : meeting
        ));
      } else {
        // Add new meeting
        const response = await api.post('/meetings', formData);
        setMeetings([...meetings, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError(err.response?.data?.error || 'Failed to save meeting. Please try again later.');
    }
  };

  const getSortedAndFilteredMeetings = () => {
    if (!Array.isArray(meetings)) return [];
    
    let filteredMeetings = [...meetings];
    
    // Apply filter
    if (filter !== 'all') {
      filteredMeetings = filteredMeetings.filter(meeting => meeting.status === filter);
    }
    
    // Apply sort
    filteredMeetings.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
    
    return filteredMeetings;
  };

  if (loading) {
    return <div className={styles.loading}>Loading meetings...</div>;
  }

  const sortedAndFilteredMeetings = getSortedAndFilteredMeetings();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meetings</h1>
        <div className={styles.controls}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filter}
          >
            <option value="all">All Meetings</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sort}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
          <button 
            className={styles.addButton}
            onClick={handleAddMeeting}
            disabled={isDeleting}
          >
            Add Meeting
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={fetchMeetings} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredMeetings.length > 0 ? (
              sortedAndFilteredMeetings.map(meeting => (
                <tr key={meeting._id}>
                  <td>{meeting.title}</td>
                  <td>{new Date(meeting.date).toLocaleDateString()}</td>
                  <td>{meeting.time}</td>
                  <td>{meeting.location}</td>
                  <td>
                    <span className={`${styles.status} ${styles[meeting.status?.toLowerCase() || 'scheduled']}`}>
                      {meeting.status || 'Scheduled'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditMeeting(meeting)}
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteMeeting(meeting._id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  No meetings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMeeting ? 'Edit Meeting' : 'Add Meeting'}
      >
        <MeetingForm
          meeting={selectedMeeting}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Meetings; 