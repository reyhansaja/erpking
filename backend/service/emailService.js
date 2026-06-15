// backend/services/emailService.js  ← FILE BARU
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendTaskDoneNotification = async ({ toEmail, taskTitle, projectName, assignedBy }) => {
  await transporter.sendMail({
    from: `"ERPKu System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `✅ Misi selesai: "${taskTitle}" — ${projectName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px;">
        <h2 style="color:#1a6b3c;">Misi Diselesaikan ✅</h2>
        <p>Halo,</p>
        <p>Misi berikut pada proyek <strong>${projectName}</strong> telah diselesaikan:</p>
        <div style="background:#f0fdf4; border-left:4px solid #22c55e; padding:12px 16px; border-radius:6px; margin:16px 0;">
          <strong>${taskTitle}</strong><br/>
          <span style="color:#555; font-size:13px;">Progress: 100% · Done</span>
        </div>
        <p style="color:#888; font-size:12px;">— ERPKu System</p>
      </div>
    `,
  });
};

const sendDeadlineReminder = async ({ toEmail, taskTitle, projectName, deadline }) => {
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  await transporter.sendMail({
    from: `"ERPKu System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `⏰ Deadline dalam ${daysLeft} hari: "${taskTitle}"`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px;">
        <h2 style="color:#b45309;">Pengingat Deadline ⏰</h2>
        <p>Misi <strong>${taskTitle}</strong> pada proyek <strong>${projectName}</strong> akan berakhir dalam <strong>${daysLeft} hari</strong>.</p>
        <div style="background:#fffbeb; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:6px; margin:16px 0;">
          Deadline: <strong>${new Date(deadline).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</strong>
        </div>
        <p style="color:#888; font-size:12px;">— ERPKu System</p>
      </div>
    `,
  });
};

module.exports = { sendTaskDoneNotification, sendDeadlineReminder };