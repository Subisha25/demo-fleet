import { sequelize } from '../models';

export async function updateEmailTemplates() {
  await sequelize.authenticate();
  console.log('[EmailTemplates] Connected to database');

  const userTemplateMsg = [
    '<p>Hello ###UserName###,</p>',
    '<p>Welcome to Grace Cabs! Your user account has been successfully created.</p>',
    '<p><strong>Your Account Login Details:</strong></p>',
    '<p>Email Address: <strong>###UserEmail###</strong></p>',
    '<p>Temporary Password: <strong>###Password###</strong></p>',
    '<p>Company Portal: <a href="###CompanySeoUrl###">###CompanySeoUrl###</a></p>',
    '<p>Common Login URL: <a href="###LoginUrl###">###LoginUrl###</a></p>',
    '<p><strong>Setup Instructions:</strong> Please visit your Company Portal link above, log in with your temporary password, and update your password under My Account for security.</p>',
    '<p>You can always reach our 24/7 support desk at traveldesk@gracecabs.com</p>',
    '<p>Regards,<br>Team Grace Cabs</p>'
  ].join('');

  await sequelize.query(
    "UPDATE emailConfiguration SET message = :message WHERE emailCode = 'USER_REGISTRATION_EMAIL_TO_USER'",
    { replacements: { message: userTemplateMsg } }
  );

  console.log('[EmailTemplates] Successfully updated USER_REGISTRATION_EMAIL_TO_USER template');
}

if (require.main === module) {
  updateEmailTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
