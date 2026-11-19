// src/SuperAdmin/pages/Orders/ViewConfirmPendingOrder.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../../../../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import {
  faFileInvoice,
  faUser,
  faCalendarAlt,
  faTruck,
  faCar,
  faIdCard,
  faArrowLeft,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageLayout from "../../../../components/PageLayout";
import { showToast, AlertContainer } from "../../../../components/AlertBox";

// Interfaces
interface Order {
  bookingId: string;
  bookingCode: string;
  createdAt: string;
  bookingDate: string;
  pickupPoint: string;
  pickupCity: string;
  pickupArea: string;
  dropPoint: string;
  userId: string;
  vehicleTypeId: string;
  confirmStatus: string;
  payment?: {
    paymentId: string;
    status: string;
  };
}

interface User {
  username: string;
  companyId: string;
  email: string;
  mobile: string;
  userAddress: string;
}

interface Company {
  companyName: string;
  email: string;
  phone: string;
  companyAddress: string;
}

interface VehicleType {
  vehicleType: string;
}

// ✅ items returned from /vehicle/vehicleType/:id/vehicle-models
interface VehicleModelItem {
  vehicleMasterId: string;
  vehicleTypeId: string;
  vehicleModelName: string;
  vehicleNumber: string;
  vehicleId: string;
  vehicleName?: string; // optional if backend returns
}

interface Driver {
  driverId: string;
  driverName: string;
}

const formatToCustom = (dateString: string) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const ViewConfirmPendingOrder: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [vehicleType, setVehicleType] = useState<string>("");

  const [vehicleItems, setVehicleItems] = useState<VehicleModelItem[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ✅ "vehicleId::vehicleMasterId"
  const [selectedVehicleKey, setSelectedVehicleKey] = useState<string>("");
  const [selectedVehicleLabel, setSelectedVehicleLabel] = useState<string>("");

  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const vehicleDropdownRef = useRef<HTMLDivElement | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);

  const isPublicBooking = Boolean(
    order && (
      (order as any)?.bookingCreatedBy === "PUBLIC_BOOKING" ||
      (order as any)?.preferredType === "PUBLIC_BOOKING" ||
      (order as any)?.remarks?.toLowerCase().includes("public") ||
      !(order as any)?.userId
    )
  );

  const publicNotesSnapshot = useMemo(() => {
    try {
      const raw = (order as any)?.notes;
      if (!raw) return null;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed?.packageSnapshot || null;
    } catch {
      return null;
    }
  }, [order]);

  const fetchData = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      setFetchError(null);

      // 1) Order
      const orderRes = await axiosInstance.post("/order/getOrdersById", { bookingId });
      const orderData: any = orderRes.data?.data;
      if (!orderData) {
        setFetchError("Booking not found");
        return;
      }
      setOrder(orderData);

      // Pre-fill user & company from synthesized/included data if present
      if (orderData?.user) {
        setUser(orderData.user);
      }
      if (orderData?.company) {
        setCompany(orderData.company);
      } else if (orderData?.companyId) {
        try {
          const companyRes = await axiosInstance.get(`/company/getCompanyById/${orderData.companyId}`);
          setCompany(companyRes.data?.data);
        } catch {}
      }

      // Auto pre-select vehicle if booking already has preselected vehicle (e.g. from public booking)
      if (orderData?.vehicleId && orderData?.vehicleMasterId) {
        setSelectedVehicleKey(`${orderData.vehicleId}::${orderData.vehicleMasterId}`);
        const label = orderData.vehicleMaster?.vehicleModelName
          ? `${orderData.vehicleMaster.vehicleModelName} - ${orderData.vehicleMaster.vehicleNumber}`
          : orderData.vehicle?.vehicleName || "Pre-Selected Vehicle";
        setSelectedVehicleLabel(label);
      }

      // 2) VehicleType name + 3) Vehicles by VehicleTypeId (isolated)
      if (orderData?.vehicleTypeId) {
        try {
          const vehicleTypeRes = await axiosInstance.get(`/vehicleType/${orderData.vehicleTypeId}`);
          const vehicleTypeData: VehicleType = vehicleTypeRes.data?.data;
          setVehicleType(vehicleTypeData?.vehicleType || "");
        } catch (e) {
          console.error("Error fetching vehicle type:", e);
        }

        try {
          const vmRes = await axiosInstance.get(
            `/vehicle/vehicleType/${orderData.vehicleTypeId}/vehicle-models`
          );
          setVehicleItems(vmRes.data?.items || []);
        } catch (e) {
          console.error("Error fetching vehicle models:", e);
        }
      }

      // 4) User + Company (traditional corporate flow fallback, isolated)
      if (orderData?.userId) {
        try {
          const userRes = await axiosInstance.get(`/user/${orderData.userId}`);
          const userData: User = userRes.data?.data;
          setUser(userData);

          if (userData?.companyId) {
            const companyRes = await axiosInstance.get(`/company/getCompanyById/${userData.companyId}`);
            setCompany(companyRes.data?.data);
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      }

      // 5) Drivers (isolated)
      try {
        const driverRes = await axiosInstance.get("/driver/getAllDrivers");
        setDrivers(driverRes.data?.drivers || []);
      } catch (e) {
        console.error("Error fetching drivers:", e);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      const msg = error?.response?.data?.message || "Failed to load booking details.";
      setFetchError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  // click outside close dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!vehicleDropdownRef.current) return;
      if (!vehicleDropdownRef.current.contains(e.target as Node)) {
        setShowVehicleDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);

    if (!order?.bookingId) {
      showToast("Booking ID not found.", "warn");
      setIsConfirming(false);
      return;
    }

    if (!selectedDriver) {
      showToast("Please select a driver before confirming.", "warn");
      setIsConfirming(false);
      return;
    }

    let vehicleId: string | undefined = undefined;
    let vehicleMasterId: string | undefined = undefined;

    if (selectedVehicleKey) {
      const parts = selectedVehicleKey.split("::");
      vehicleId = parts[0];
      vehicleMasterId = parts[1];
    }

    try {
      const res = await axiosInstance.patch("/vendor/confirmBookingforWeb", {
        bookingId: order.bookingId,
        driverId: selectedDriver,
        vehicleId: vehicleId || undefined,
        vehicleMasterId: vehicleMasterId || undefined,
      });

      if (res.status === 200) {
        showToast("Booking confirmed successfully.", "success");
        navigate("/orders/closepending");
      }
    } catch (error: any) {
      console.error("Confirm booking error:", error);
      const msg = error?.response?.data?.message || "Failed to confirm booking.";
      showToast(msg, "error");
    } finally {
      setIsConfirming(false);
    }
  };

  // Filter vehicles by last 4 digits
  const filteredVehicles = vehicleItems.filter((v) => {
    const last4 = (v.vehicleNumber || "").slice(-4);
    const term = (vehicleSearchTerm || "").trim();
    if (!term) return true;
    return last4.includes(term);
  });

  if (loading) {
    return (
      <PageLayout breadcrumbName="Confirm Pending">
        <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">Loading booking details...</p>
        </div>
      </PageLayout>
    );
  }

  if (fetchError || !order) {
    return (
      <PageLayout breadcrumbName="Confirm Pending">
        <div className="p-6 max-w-xl mx-auto mt-12 bg-white rounded-lg border border-red-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 text-red-500 flex items-center justify-center rounded-full bg-red-50">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Booking Details</h3>
          <p className="text-gray-600 text-sm mb-6">{fetchError || "Booking details could not be retrieved."}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/orders/confirmpending")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium text-sm transition-colors"
            >
              Back to Confirm Pending
            </button>
            <button
              onClick={() => fetchData()}
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
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileInvoice} className="text-blue-600" />
          View Confirm Pending Order
        </h2>

        <AlertContainer />

        {order && (order.confirmStatus === "0" || order.payment?.status === "0") && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-4 rounded mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600" />
            <div>
              {order.confirmStatus === "0" && <p className="font-medium">Order not yet confirmed</p>}
              {order.payment?.status === "0" && <p className="font-medium">Order not yet paid</p>}
            </div>
          </div>
        )}

        {isPublicBooking ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Public Order Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileInvoice} className="text-blue-500" />
                  Order Details
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <strong>Booking Number:</strong> #{order?.bookingCode || "-"}
                  </p>
                  <p>
                    <strong>Booking Date:</strong> {formatToCustom(order?.createdAt || "-")}
                  </p>
                  <p>
                    <strong>Booking Type:</strong>{" "}
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                      PUBLIC BOOKING
                    </span>
                  </p>
                  <p>
                    <strong>Booking Status:</strong>{" "}
                    {order?.confirmStatus === "0" ? (
                      <span className="text-amber-600 font-semibold">Pending Confirmation</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Confirmed</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Public Company / Customer Details */}
              <div className="p-4 border rounded-xl shadow-xs bg-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-green-500" />
                  Company & Passenger Details
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Fleet Name:</strong>
                    {(order as any)?.tenant?.logo && (
                      <img
                        src={(order as any).tenant.logo}
                        alt="Fleet Logo"
                        className="h-6 w-auto max-w-[80px] object-contain rounded inline-block"
                      />
                    )}
                    <span>{(order as any)?.tenant?.name || "-"}</span>
                  </div>
                  <p>
                    <strong>Company Name:</strong>{" "}
                    {company?.companyName || (order as any)?.company?.companyName || (order as any)?.user?.company?.companyName || publicNotesSnapshot?.companyName || "-"}
                  </p>
                  <p>
                    <strong>Passenger/User Name:</strong>{" "}
                    {user?.username || (order as any)?.user?.username || (order as any)?.behalfOfName || publicNotesSnapshot?.customerName || "-"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {user?.email || (order as any)?.user?.email || publicNotesSnapshot?.customerEmail || "-"}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {user?.mobile || (order as any)?.user?.mobile || (order as any)?.behalfOfPhone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Public Booking Details */}
            <div className="p-4 border rounded-xl shadow-xs bg-white mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Travel Package:</strong>{" "}
                  <span className="font-bold text-purple-700">PUBLIC BOOKING</span>
                </p>
                <p>
                  <strong>Pickup Date & Time:</strong> {formatToCustom(order?.bookingDate || "-")}
                </p>
                <p>
                  <strong>Pickup Location:</strong> {order?.pickupPoint || "-"}
                </p>
                <p>
                  <strong>Drop Location:</strong> {order?.dropPoint || "-"}
                </p>
                <p>
                  <strong>Passenger Count:</strong> {(order as any)?.travellersCount || 1} Passengers
                </p>
                <p>
                  <strong>Vehicle Type:</strong> {vehicleType || (order as any)?.vehicleType?.vehicleType || "-"}
                </p>
                <p>
                  <strong>Vehicle Model:</strong>{" "}
                  {(order as any)?.vehicleMaster?.vehicleModelName || (order as any)?.vehicle?.vehicleName || selectedVehicleLabel || "-"}
                </p>
                <p>
                  <strong>Seat Capacity:</strong>{" "}
                  <span className="font-semibold text-blue-700">
                    {(order as any)?.seatCapacity || (order as any)?.vehicleMaster?.vehicleTypes?.seatCapacity || (order as any)?.vehicleType?.seatCapacity || 4} Seats
                  </span>
                </p>
                <p>
                  <strong>Agreed Per KM Rate:</strong>{" "}
                  <span className="font-bold text-emerald-700">
                    ₹{publicNotesSnapshot?.amountPerKm ?? publicNotesSnapshot?.perKmRate ?? (order as any)?.ratePerKm ?? 0} / km
                  </span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileInvoice} className="text-blue-500" />
                  Order Details
                </h3>
                <p>
                  <strong>Order Number:</strong> #{order?.bookingCode || "-"}
                </p>
                <p>
                  <strong>Order Date:</strong> {formatToCustom(order?.createdAt || "-")}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {order?.confirmStatus === "0" ? (
                    <span className="text-red-600 font-medium">Not Paid</span>
                  ) : (
                    <span className="text-green-600 font-medium">Paid</span>
                  )}
                </p>
              </div>

              <div className="p-4 border rounded shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-green-500" />
                  User Details
                </h3>
                <p>
                  <strong>Fleet Name:</strong> {(order as any)?.tenant?.name || "-"}
                </p>
                <p>
                  <strong>Company:</strong> {company?.companyName || (order as any)?.company?.companyName || (order as any)?.user?.company?.companyName || "-"}
                </p>
                <p>
                  <strong>User Name:</strong> {user?.username || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email || "-"}
                </p>
                <p>
                  <strong>Phone:</strong> {user?.mobile || "-"}
                </p>
                <p>
                  <strong>Address:</strong> {user?.userAddress || "-"}
                </p>
              </div>
            </div>

            <div className="p-4 border rounded shadow-sm bg-white mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                Booking Details
              </h3>
              <p>
                <strong>Pickup Date & Time:</strong> {formatToCustom(order?.bookingDate || "-")}
              </p>
              <p>
                <strong>Travel Package:</strong> {order?.pickupPoint || "-"}
              </p>
              <p>
                <strong>Pickup Point:</strong> {order?.pickupArea || "-"}
              </p>
              <p>
                <strong>Drop Point:</strong> {order?.dropPoint || "-"}
              </p>
              <p>
                <strong>Pickup City:</strong> {order?.pickupCity || "-"}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {vehicleType || "-"}
              </p>
            </div>
          </>
        )}

        <div className="p-4 border rounded shadow-sm bg-white mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faTruck} className="text-indigo-500" />
            Assign Vehicle & Driver
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* ✅ Vehicle Searchable Dropdown */}
            <div className="relative" ref={vehicleDropdownRef}>
              <label className="block mb-1 font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faCar} className="text-gray-500" /> Vehicle Number
              </label>

            <div className="relative">
  <input
    type="text"
    placeholder="Search by last 4 digits (ex: 3952)"
    className="w-[410px] border border-gray-300 rounded p-2 pr-10"
    value={selectedVehicleKey ? selectedVehicleLabel : vehicleSearchTerm}
    onChange={(e) => {
      if (selectedVehicleKey) return;
      setVehicleSearchTerm(e.target.value);
      setShowVehicleDropdown(true);
    }}
    onFocus={() => {
      if (!selectedVehicleKey) setShowVehicleDropdown(true);
    }}
    readOnly={!!selectedVehicleKey}
  />

  {/* ✅ Clear icon inside input */}
  {selectedVehicleKey && (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
      onClick={() => {
        setSelectedVehicleKey("");
        setSelectedVehicleLabel("");
        setVehicleSearchTerm("");
        setShowVehicleDropdown(true);
      }}
      title="Clear selection"
    >
      ✕
    </button>
  )}
</div>


              {/* ✅ Dropdown list */}
              {showVehicleDropdown && !selectedVehicleKey && (
                <div className="absolute z-10 bg-white border border-gray-300 w-[400px] max-h-60 overflow-auto mt-1 rounded shadow">
                  {filteredVehicles.length > 0 ? (
                    <ul>
                      {filteredVehicles.map((v) => (
                        <li
                          key={`${v.vehicleId}::${v.vehicleMasterId}`}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedVehicleKey(`${v.vehicleId}::${v.vehicleMasterId}`);
                            setSelectedVehicleLabel(`${v.vehicleModelName} - ${v.vehicleNumber}`);
                            setVehicleSearchTerm("");
                            setShowVehicleDropdown(false);
                          }}
                        >
                          <div className="font-medium">{v.vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{v.vehicleModelName}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No vehicles found for: <b>{vehicleSearchTerm}</b>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Driver */}
            <div>
              <label className="block mb-1 font-medium flex items-center gap-1">
                <FontAwesomeIcon icon={faIdCard} className="text-gray-500" /> Driver
              </label>

              <select
                className="w-full border border-gray-300 rounded p-2"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.driverName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              className={`px-6 py-2 rounded flex items-center gap-2 text-white ${
                !selectedDriver || isConfirming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={handleConfirm}
              disabled={!selectedDriver || isConfirming}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              {isConfirming ? "Confirming..." : "Confirm Booking"}
            </button>

            <button
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ViewConfirmPendingOrder;
