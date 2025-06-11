const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to Smart Chama',
    html: `
      <h1>Welcome to Smart Chama, ${firstName}!</h1>
      <p>Thank you for joining our community. We're excited to have you on board.</p>
      <p>To get started, please verify your email address by clicking the link below:</p>
      <p><a href="${process.env.FRONTEND_URL}/verify-email">Verify Email</a></p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${process.env.FRONTEND_URL}/verify-email/${token}">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send loan approval email
const sendLoanApprovalEmail = async (email, firstName, loanDetails) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Loan Application Approved',
    html: `
      <h1>Loan Application Approved</h1>
      <p>Dear ${firstName},</p>
      <p>Your loan application has been approved. Here are the details:</p>
      <ul>
        <li>Amount: ${loanDetails.amount}</li>
        <li>Interest Rate: ${loanDetails.interestRate}%</li>
        <li>Term: ${loanDetails.term} months</li>
        <li>Monthly Payment: ${loanDetails.monthlyPayment}</li>
      </ul>
      <p>Please log in to your account to view the complete details and accept the loan terms.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send loan rejection email
const sendLoanRejectionEmail = async (email, firstName, reason) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Loan Application Status',
    html: `
      <h1>Loan Application Update</h1>
      <p>Dear ${firstName},</p>
      <p>We regret to inform you that your loan application has not been approved at this time.</p>
      <p>Reason: ${reason}</p>
      <p>If you have any questions or would like to discuss this further, please contact our support team.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send meeting reminder email
const sendMeetingReminderEmail = async (email, firstName, meetingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Meeting Reminder',
    html: `
      <h1>Meeting Reminder</h1>
      <p>Dear ${firstName},</p>
      <p>This is a reminder about the upcoming meeting:</p>
      <ul>
        <li>Title: ${meetingDetails.title}</li>
        <li>Date: ${meetingDetails.date}</li>
        <li>Time: ${meetingDetails.time}</li>
        <li>Location: ${meetingDetails.location}</li>
      </ul>
      <p>Please make sure to attend and bring any necessary documents.</p>
      <p>Best regards,<br>The Smart Chama Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends a meeting invitation email to a user
 * @param {Object} user - The user to send the email to
 * @param {Object} meeting - The meeting details
 */
const sendMeetingInvitation = async (user, meeting) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: `Meeting Invitation: ${meeting.title}`,
      html: `
        <h1>Meeting Invitation</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>You have been invited to attend the following meeting:</p>
        <h2>${meeting.title}</h2>
        <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${meeting.time}</p>
        <p><strong>Location:</strong> ${meeting.location}</p>
        <p><strong>Description:</strong> ${meeting.description}</p>
        ${meeting.agenda && meeting.agenda.length > 0 ? `
          <h3>Agenda:</h3>
          <ul>
            ${meeting.agenda.map(item => `
              <li>
                <strong>${item.title}</strong>
                ${item.duration ? `(${item.duration} minutes)` : ''}
                ${item.description ? `<br>${item.description}` : ''}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        <p>Please make sure to attend this meeting.</p>
        <p>Best regards,<br>Smart Chama Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending meeting invitation email:', error);
    // Don't throw the error as email sending should not block the main flow
  }
};

/**
 * Sends a meeting update email to a user
 * @param {Object} user - The user to send the email to
 * @param {Object} meeting - The updated meeting details
 */
const sendMeetingUpdate = async (user, meeting) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: `Meeting Update: ${meeting.title}`,
      html: `
        <h1>Meeting Update</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>The following meeting has been updated:</p>
        <h2>${meeting.title}</h2>
        <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${meeting.time}</p>
        <p><strong>Location:</strong> ${meeting.location}</p>
        <p><strong>Description:</strong> ${meeting.description}</p>
        ${meeting.agenda && meeting.agenda.length > 0 ? `
          <h3>Agenda:</h3>
          <ul>
            ${meeting.agenda.map(item => `
              <li>
                <strong>${item.title}</strong>
                ${item.duration ? `(${item.duration} minutes)` : ''}
                ${item.description ? `<br>${item.description}` : ''}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        <p>Please note these changes in your schedule.</p>
        <p>Best regards,<br>Smart Chama Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending meeting update email:', error);
  }
};

/**
 * Sends a meeting cancellation email to a user
 * @param {Object} user - The user to send the email to
 * @param {Object} meeting - The cancelled meeting details
 */
const sendMeetingCancellation = async (user, meeting) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: `Meeting Cancelled: ${meeting.title}`,
      html: `
        <h1>Meeting Cancelled</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>The following meeting has been cancelled:</p>
        <h2>${meeting.title}</h2>
        <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${meeting.time}</p>
        <p><strong>Location:</strong> ${meeting.location}</p>
        <p>We apologize for any inconvenience caused.</p>
        <p>Best regards,<br>Smart Chama Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending meeting cancellation email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLoanApprovalEmail,
  sendLoanRejectionEmail,
  sendMeetingReminderEmail,
  sendMeetingInvitation,
  sendMeetingUpdate,
  sendMeetingCancellation
}; 