import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../utils/axiosInstance";
import PageLayout from "../../../../components/PageLayout";

// Date Formatter
const formatToCustom = (dateString: string) => {
  if (!dateString) return "-";
  const d = new Date(dateString);

  if (isNaN(d.getTime())) {
    return dateString;
  }

  let day = String(d.getDate()).padStart(2, "0");
  let monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let month = monthNames[d.getMonth()];
  let year = d.getFullYear();

  let hours = d.getHours();
  let minutes = String(d.getMinutes()).padStart(2, "0");
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

// Interfaces
interface OrderDetails {
  bookingId?: string;
  bookingCode: string;
  bookingDate: string;
  status: string;
  pickupCity: string;
  pickupPoint: string;
  dropPoint?: string;
  flightNumber: string;
  createdAt: string;
  userId: string;
  vehicleType: {
    vehicleType: string;
  };
  tenant?: {
    tenantId: string;
    name: string;
    logo?: string;
  };
  company?: {
    companyId: string;
    companyName: string;
  };
  vehicleMaster?: {
    vehicleMasterId: string;
    vehicleModelName: string;
    vehicleNumber: string;
    vehicleType: string;
  };
  travellersCount?: number;
  ratePerKm?: number;
  remarks?: string;
  bookingCreatedBy?: string;
  preferredType?: string;
  behalfOfName?: string;
  behalfOfPhone?: string;
  notes?: string;
}

interface UserDetails {
  username: string;
  email: string;
  phoneNo?: string;
  mobile?: string;
  address?: string;
  userAddress?: string;
  gstNo?: string;
  companyId?: string;
}

interface CompanyDetails {
  companyName: string;
}

const ViewCancelOrder: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPublicBooking = Boolean(
    order && (
      order.bookingCreatedBy === "PUBLIC_BOOKING" ||
      order.preferredType === "PUBLIC_BOOKING" ||
      order.remarks?.toLowerCase().includes("public") ||
      !order.userId
    )
  );

  const publicNotesSnapshot = useMemo(() => {
    try {
      const raw = order?.notes;
      if (!raw) return null;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed?.packageSnapshot || null;
    } catch {
      return null;
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      if (!bookingId) {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const orderRes = await axiosInstance.post("/order/getOrdersById", { bookingId });
      const orderData = orderRes.data?.data;
      if (!orderData) {
        setError("Order not found.");
        return;
      }
      setOrder(orderData);

      if (orderData.user) {
        setUser(orderData.user);
      }
      if (orderData.company) {
        setCompany(orderData.company);
      } else if (orderData.companyId) {
        try {
          const companyRes = await axiosInstance.get(`/company/getCompanyById/${orderData.companyId}`);
          setCompany(companyRes.data?.data);
        } catch {}
      }

      if (orderData.userId) {
        try {
          const userRes = await axiosInstance.get(`/user/${orderData.userId}`);
          const userData = userRes.data?.data;
          if (userData) {
            setUser(userData);
            if (userData.companyId && !orderData.company) {
              const compRes = await axiosInstance.get(`/company/getCompanyById/${userData.companyId}`);
              setCompany(compRes.data?.data);
            }
          }
        } catch {}
      }
    } catch (err: any) {
      console.error("Error fetching details:", err);
      setError(err?.response?.data?.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <PageLayout breadcrumbName="Cancelled Order">
        <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">Loading cancelled order details...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout breadcrumbName="Cancelled Order">
        <div className="p-6 max-w-xl mx-auto mt-12 bg-white rounded-lg border border-red-200 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Order</h3>
          <p className="text-gray-600 text-sm mb-6">{error || "Cancelled order details could not be retrieved."}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/orders/cancelorder")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium text-sm transition-colors"
            >
              Back to Cancelled Orders
            </button>
            <button
              onClick={() => fetchOrderDetails()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout breadcrumbName={order?.bookingCode || "Order"}>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">View Cancelled Order</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Back
          </button>
        </div>

        {isPublicBooking ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Order Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <h3 className="font-semibold text-orange-600">Order Details</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    PUBLIC BOOKING
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><b>Booking Number:</b> #{order.bookingCode}</p>
                  <p><b>Booking Date:</b> {formatToCustom(order.bookingDate || order.createdAt)}</p>
                  <p><b>Status:</b> <span className="text-red-600 font-semibold">Cancelled</span></p>
                </div>
              </div>

              {/* Company & Passenger Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <h3 className="font-semibold text-orange-600 border-b pb-2 mb-3">Company & Passenger Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <b>Fleet Name:</b>
                    {order.tenant?.logo && (
                      <img
                        src={order.tenant.logo}
                        alt="Fleet Logo"
                        className="h-6 w-auto max-w-[80px] object-contain rounded inline-block"
                      />
                    )}
                    <span>{order.tenant?.name || "-"}</span>
                  </div>
                  <p><b>Company Name:</b> {company?.companyName || order.company?.companyName || (user as any)?.company?.companyName || publicNotesSnapshot?.companyName || "-"}</p>
                  <p><b>Passenger Name:</b> {user?.username || (order as any).behalfOfName || publicNotesSnapshot?.customerName || "-"}</p>
                  <p><b>Email Address:</b> {user?.email || publicNotesSnapshot?.customerEmail || "-"}</p>
                  <p><b>Phone Number:</b> {user?.phoneNo || user?.mobile || (order as any).behalfOfPhone || publicNotesSnapshot?.customerPhone || "-"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Booking & Route Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <h3 className="font-semibold text-orange-600 border-b pb-2 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><b>Pickup Date & Time:</b> {formatToCustom(order.bookingDate)}</p>
                  <p><b>Pickup Location:</b> {order.pickupPoint || "-"}</p>
                  <p><b>Drop Location:</b> {order.dropPoint || "-"}</p>
                  <p><b>Passenger Count:</b> {order.travellersCount || 1} Passengers</p>
                  <p><b>Vehicle Type:</b> {order.vehicleType?.vehicleType || order.vehicleMaster?.vehicleType || "-"}</p>
                  <p><b>Vehicle Model:</b> {order.vehicleMaster?.vehicleModelName || "-"}</p>
                  <p>
                    <b>Agreed Rate / KM:</b>{" "}
                    <span className="font-bold text-emerald-700">
                      ₹{publicNotesSnapshot?.amountPerKm ?? publicNotesSnapshot?.perKmRate ?? order.ratePerKm ?? 0} / km
                    </span>
                  </p>
                </div>
              </div>

              {/* Cancellation Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <h3 className="font-semibold text-orange-600 border-b pb-2 mb-3">Booking Cancel Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><b>Cancel Date and Time:</b> <span className="text-red-600 font-semibold">{formatToCustom(order.createdAt)}</span></p>
                  <p><b>Cancellation Reason:</b> {order.remarks || "Cancelled by Fleet / User"}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side */}
            <div>
              <h3 className="font-semibold text-orange-600 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><b>Order Number:</b> #{order.bookingCode}</p>
                <p><b>Order Date:</b> {formatToCustom(order.bookingDate)}</p>
                <p><b>Status:</b> <span className="text-red-600 font-semibold">Cancelled</span></p>
              </div>

              <h3 className="font-semibold text-orange-600 mt-6 mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><b>Pickup Date and Time:</b> {formatToCustom(order.bookingDate)}</p>
                <p><b>Pickup City:</b> {order.pickupCity || "-"}</p>
                <p><b>Pickup Point:</b> {order.pickupPoint || "-"}</p>
                <p><b>Drop Point:</b> {order.dropPoint || "-"}</p>
                <p><b>Vehicle Type:</b> {order.vehicleType?.vehicleType || "-"}</p>
              </div>
            </div>

            {/* Right Side */}
            <div>
              <h3 className="font-semibold text-orange-600 mb-3">User Details</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><b>Fleet Name:</b> {order.tenant?.name || "-"}</p>
                <p><b>Company Name:</b> {company?.companyName || (order as any).company?.companyName || (user as any)?.company?.companyName || "-"}</p>
                <p><b>User Name:</b> {user?.username || "-"}</p>
                <p><b>Email Address:</b> {user?.email || "-"}</p>
                <p><b>Phone Number:</b> {user?.phoneNo || user?.mobile || "-"}</p>
                <p><b>Address:</b> {user?.address || user?.userAddress || "-"}</p>
                <p><b>GST NO:</b> {user?.gstNo || "-"}</p>
              </div>

              <h3 className="font-semibold text-orange-600 mt-6 mb-3">Booking Cancel Details</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><b>Cancel Date and Time:</b> <span className="text-red-600">{formatToCustom(order.createdAt)}</span></p>
                <p><b>Cancellation Reason:</b> {order.remarks || "Cancelled by Fleet / User"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ViewCancelOrder;
