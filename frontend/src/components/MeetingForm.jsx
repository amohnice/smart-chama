import React, { useState, useEffect } from 'react';
import styles from './MeetingForm.module.css';

/**
 * Form component for adding/editing meetings
 * @param {object} props
 * @param {object} props.meeting - Meeting data for editing (optional)
 * @param {Array} props.members - List of members for selection
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 */
const MeetingForm = ({ meeting, members, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    type: 'Regular',
    agenda: '',
    attendees: [],
    status: 'Scheduled'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        date: meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: meeting.time || '10:00',
        location: meeting.location || '',
        type: meeting.type || 'Regular',
        agenda: meeting.agenda || '',
        attendees: meeting.attendees || [],
        status: meeting.status || 'Scheduled'
      });
    }
  }, [meeting]);

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must be less than 100 characters';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Date cannot be in the past';
        return '';
      case 'time':
        if (!value) return 'Time is required';
        return '';
      case 'location':
        if (!value.trim()) return 'Location is required';
        if (value.length < 3) return 'Location must be at least 3 characters';
        return '';
      case 'agenda':
        if (!value.trim()) return 'Agenda is required';
        if (value.length < 10) return 'Agenda must be at least 10 characters';
        return '';
      case 'attendees':
        if (!value.length) return 'At least one attendee is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleAttendeeChange = (e) => {
    const options = e.target.options;
    const selectedAttendees = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedAttendees.push(options[i].value);
      }
    }
    setFormData(prev => ({
      ...prev,
      attendees: selectedAttendees
    }));
    
    // Validate attendees if the field has been touched
    if (touched.attendees) {
      const error = validateField('attendees', selectedAttendees);
      setErrors(prev => ({
        ...prev,
        attendees: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getFieldError = (name) => {
    return touched[name] && errors[name] ? errors[name] : '';
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Meeting Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="Enter meeting title"
          className={getFieldError('title') ? styles.errorInput : ''}
        />
        {getFieldError('title') && (
          <span className={styles.errorText}>{getFieldError('title')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={getFieldError('date') ? styles.errorInput : ''}
        />
        {getFieldError('date') && (
          <span className={styles.errorText}>{getFieldError('date')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="time">Time</label>
        <input
          type="time"
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={getFieldError('time') ? styles.errorInput : ''}
        />
        {getFieldError('time') && (
          <span className={styles.errorText}>{getFieldError('time')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="Enter meeting location"
          className={getFieldError('location') ? styles.errorInput : ''}
        />
        {getFieldError('location') && (
          <span className={styles.errorText}>{getFieldError('location')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="type">Meeting Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="Regular">Regular</option>
          <option value="Emergency">Emergency</option>
          <option value="Annual">Annual</option>
          <option value="Special">Special</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="agenda">Agenda</label>
        <textarea
          id="agenda"
          name="agenda"
          value={formData.agenda}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          placeholder="Enter meeting agenda"
          rows="4"
          className={getFieldError('agenda') ? styles.errorInput : ''}
        />
        {getFieldError('agenda') && (
          <span className={styles.errorText}>{getFieldError('agenda')}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="attendees">Attendees</label>
        <select
          id="attendees"
          name="attendees"
          value={formData.attendees}
          onChange={handleAttendeeChange}
          onBlur={handleBlur}
          multiple
          required
          className={`${styles.multiSelect} ${getFieldError('attendees') ? styles.errorInput : ''}`}
        >
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
        <small className={styles.helpText}>Hold Ctrl/Cmd to select multiple members</small>
        {getFieldError('attendees') && (
          <span className={styles.errorText}>{getFieldError('attendees')}</span>
        )}
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
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {meeting ? 'Update Meeting' : 'Add Meeting'}
        </button>
      </div>
    </form>
  );
};

export default MeetingForm; 