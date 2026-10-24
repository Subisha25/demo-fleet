import { sendDriverAllocationTwoWaySms } from '../services/smsServices';

type BookingAny = any;

export async function sendSmsNotifications(options: {
  booking: BookingAny;
  user: any;
  driver: any;
  vehicle?: any;
  formattedBookingDate?: string;
  shouldSendSms?: boolean;
}) {
  const { booking, user, driver, vehicle } = options;

  const customerName = booking?.behalfOfName || user?.username || 'Customer';
  const customerPhone = booking?.behalfOfPhone || user?.mobile || '';

  const vehicleName = vehicle?.vehicleName || booking?.vehicle?.vehicleName || 'Standard Vehicle';
  const vehicleNumber =
    booking?.vehicle?.vehicleMaster?.vehicleNumber ??
    vehicle?.vehicleMaster?.vehicleNumber ??
    booking?.vehicleNumber ??
    vehicle?.vehicleNumber ??
    'Not provided';

  const result = await sendDriverAllocationTwoWaySms({
    booking,
    driver,
    customerName,
    customerPhone,
    vehicleName,
    vehicleNumber,
  });

  return {
    skipped: result.customerSms.skipped && result.driverSms.skipped,
    customerSms: result.customerSms,
    driverSms: result.driverSms,
  };
}
