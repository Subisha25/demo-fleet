import { calculateDemoCallStatus } from '../utils/demoCallUtils';

const refTime = new Date('2026-11-26T10:00:00+05:30'); // Reference: 26-11-2026 at 10:00 AM IST

const cases = [
  { name: 'Yesterday', date: '2026-11-25', time: '10:00 AM', expected: 'INACTIVE' },
  { name: 'Today future (11 AM vs 10 AM)', date: '2026-11-26', time: '11:00 AM', expected: 'ACTIVE' },
  { name: 'Today past (9 AM vs 10 AM)', date: '2026-11-26', time: '09:00 AM', expected: 'INACTIVE' },
  { name: 'Tomorrow', date: '2026-11-27', time: '02:00 PM', expected: 'ACTIVE' },
  { name: 'Missing date', date: null, time: '11:00 AM', expected: 'NOT SCHEDULED' },
  { name: 'Missing time', date: '2026-11-27', time: '', expected: 'NOT SCHEDULED' },
  { name: 'Slot range (11:00 AM - 11:45 AM)', date: '2026-11-26', time: '11:00 AM - 11:45 AM', expected: 'ACTIVE' },
];

let failed = false;
for (const c of cases) {
  const result = calculateDemoCallStatus(c.date, c.time, refTime);
  const pass = result.demoCallStatus === c.expected;
  console.log(`${pass ? '✓' : '✗'} Case [${c.name}]: Expected ${c.expected}, got ${result.demoCallStatus} (formatted: ${result.formattedAppointment})`);
  if (!pass) failed = true;
}

if (failed) {
  console.error('Some tests failed!');
  process.exit(1);
} else {
  console.log('All demoCallUtils tests passed!');
  process.exit(0);
}
