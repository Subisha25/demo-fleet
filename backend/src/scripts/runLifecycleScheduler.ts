import sequelize from '../config/dbConfig';
import { runSubscriptionLifecycleEvaluation } from '../services/subscriptionLifecycleService';

async function main() {
  console.log(`[LifecycleScheduler:Cron] Triggered at ${new Date().toISOString()}`);
  try {
    await sequelize.authenticate();
    const result = await runSubscriptionLifecycleEvaluation();
    console.log(`[LifecycleScheduler:Cron] Completed successfully.`);
    console.log(`  - Subscriptions Scanned: ${result.scanned}`);
    console.log(`  - 2-Day Renewal Reminders Sent: ${result.remindersSent}`);
    console.log(`  - Grace Period Notices (Day 1-3): ${result.gracePeriodSet}`);
    console.log(`  - Suspended Tenants (Day 4+): ${result.suspendedSet}`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('[LifecycleScheduler:Cron] Execution failed:', err);
    process.exit(1);
  }
}

main();
