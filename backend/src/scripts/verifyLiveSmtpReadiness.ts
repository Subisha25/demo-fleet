import dotenv from 'dotenv';
dotenv.config();
import { verifySmtpConnection, getSmtpConfig } from '../services/emailConfServices';

async function main() {
  const conf = await getSmtpConfig();
  console.log('[CONFIG EVALUATION]');
  console.log('Host:', conf?.host);
  console.log('Port:', conf?.port);
  console.log('Secure:', conf?.secure);
  console.log('User:', conf?.user);
  console.log('Pass Available:', Boolean(conf?.pass && conf.pass.length > 0));

  console.log('\n[TESTING TRANSPORTER VERIFICATION HANDSHAKE]');
  const res = await verifySmtpConnection();
  console.log('[VERIFY RESULT]:', JSON.stringify(res, null, 2));

  if (res.success) {
    console.log('✅ Provider connection successful. Handshake verified.');
  } else {
    console.error('❌ Provider connection failed:', res.error);
  }
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});

