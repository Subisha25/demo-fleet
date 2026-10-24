import nodemailer from 'nodemailer';
import config from '../config/config';

async function testEmail() {
  const smtpServer = config.sendmail?.smtp_server;
  const smtpUser = config.sendmail?.smtp_email;
  const smtpPass = config.sendmail?.smtp_password;
  const smtpPort = config.sendmail?.smtp_port || 587;

  console.log('Testing SMTP connection with:');
  console.log('Host:', smtpServer);
  console.log('Port:', smtpPort);
  console.log('User:', smtpUser);
  console.log('Has Password:', Boolean(smtpPass));

  const transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: { rejectUnauthorized: false },
    debug: true,
    logger: true,
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully.');

    console.log('Sending test email to subisha2002.m@gmail.com...');
    const info = await transporter.sendMail({
      from: `"Grace Cabs Mobility" <${smtpUser}>`,
      to: 'subisha2002.m@gmail.com',
      subject: `Grace Cabs Test Delivery ${new Date().toISOString()}`,
      text: 'This is a test notification from Grace Cabs to verify delivery status.',
      html: '<p>This is a test notification from Grace Cabs to verify delivery status.</p>',
    });

    console.log('SendMail Result:');
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Response:', info.response);
    console.log('MessageId:', info.messageId);
    console.log('Envelope:', info.envelope);
  } catch (err: any) {
    console.error('SendMail Error:', err.message);
    if (err.response) console.error('Error Response:', err.response);
    if (err.responseCode) console.error('Error ResponseCode:', err.responseCode);
  }
}

testEmail().then(() => process.exit(0)).catch(() => process.exit(1));
