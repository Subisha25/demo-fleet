/**
 * Utility functions for authoritative Demo Call status calculations.
 * Timezone: Asia/Kolkata (IST, UTC+05:30).
 *
 * Rules:
 * - ACTIVE: Scheduled appointment date and time are in the future (has not yet passed).
 * - INACTIVE: Scheduled appointment date and time have passed.
 * - NOT SCHEDULED: Demo appointment date or time is missing / unconfigured.
 */

export interface DemoCallInfo {
  demoCallDate: string | null;
  demoCallTime: string | null;
  demoCallStatus: 'ACTIVE' | 'INACTIVE' | 'NOT SCHEDULED';
  appointmentIso: string | null;
  formattedAppointment: string | null;
  isUpcoming: boolean;
  registrationDate?: string | null;
  approvalDate?: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Parses appointment date and time and calculates status based on current time in Asia/Kolkata.
 */
export function calculateDemoCallStatus(
  demoDate?: string | null,
  demoTime?: string | null,
  referenceNow?: Date
): DemoCallInfo {
  if (!demoDate || !demoDate.trim() || !demoTime || !demoTime.trim()) {
    return {
      demoCallDate: demoDate?.trim() || null,
      demoCallTime: demoTime?.trim() || null,
      demoCallStatus: 'NOT SCHEDULED',
      appointmentIso: null,
      formattedAppointment: null,
      isUpcoming: false,
    };
  }

  const cleanDate = demoDate.trim();
  const cleanTime = demoTime.trim();

  let year = 0;
  let month = 0;
  let day = 0;

  const dateParts = cleanDate.split(/[-/]/);
  if (dateParts.length === 3) {
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10);
      day = parseInt(dateParts[2], 10);
    } else if (dateParts[2].length === 4) {
      day = parseInt(dateParts[0], 10);
      month = parseInt(dateParts[1], 10);
      year = parseInt(dateParts[2], 10);
    }
  }

  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    return {
      demoCallDate: cleanDate,
      demoCallTime: cleanTime,
      demoCallStatus: 'NOT SCHEDULED',
      appointmentIso: null,
      formattedAppointment: null,
      isUpcoming: false,
    };
  }

  const timeMatch = cleanTime.match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
  if (!timeMatch) {
    return {
      demoCallDate: cleanDate,
      demoCallTime: cleanTime,
      demoCallStatus: 'NOT SCHEDULED',
      appointmentIso: null,
      formattedAppointment: null,
      isUpcoming: false,
    };
  }

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const meridiem = timeMatch[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  const appointmentIso = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  const appointmentDate = new Date(appointmentIso);

  if (isNaN(appointmentDate.getTime())) {
    return {
      demoCallDate: cleanDate,
      demoCallTime: cleanTime,
      demoCallStatus: 'NOT SCHEDULED',
      appointmentIso: null,
      formattedAppointment: null,
      isUpcoming: false,
    };
  }

  const nowMs = referenceNow ? referenceNow.getTime() : Date.now();
  const isUpcoming = appointmentDate.getTime() > nowMs;
  const demoCallStatus: 'ACTIVE' | 'INACTIVE' = isUpcoming ? 'ACTIVE' : 'INACTIVE';

  const formattedDate = `${pad(day)}-${pad(month)}-${year}`;
  const displayHours = hours % 12 || 12;
  const displayMeridiem = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${pad(displayHours)}:${pad(minutes)} ${displayMeridiem}`;
  const formattedAppointment = `${formattedDate} at ${formattedTime}`;

  return {
    demoCallDate: formattedDate,
    demoCallTime: formattedTime,
    demoCallStatus,
    appointmentIso,
    formattedAppointment,
    isUpcoming,
  };
}
