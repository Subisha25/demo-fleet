import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../../components/PageLayout";
import { DataTable, Column } from "../../../../components/DataTable";
import SearchBar from "../../../../components/SearchBar";
import TrashToggleButton from "../../../../components/TrashToggleButton";
import { ActionModal, showToast, AlertContainer } from "../../../../components/AlertBox";
import axiosInstance from "../../../../utils/axiosInstance";
import CommonButton from "../../../../components/CommonButton";
import config from "../../../../config/config";
import {
  validateVehicleReg,
  extractApiErrorMessage,
} from "../../../../utils/validation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faUsers,
  faIdCard,
  faIndustry,
  faUserTie,
  faLock,
  faTimes,
  faShieldAlt,
  faTruck,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

interface VehicleMaster {
  id: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleType: string;
  vendorName: string;
  seatCapacity?: number;
  manufacturing?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  vehicleImg?: string[];
  trashed: boolean;
  vehicleId?: string;
  vehicleTypeId?: string;
  vendorId?: string;
  createdAt?: string;
}

interface TypeOption {
  id: string;
  name: string;
  seatCapacity?: number;
  AdvanceBookingHours?: string;
}

interface ModelOption {
  id: string;
  name: string;
  vehicleTypeId: string;
  manufacturing?: string;
}

interface OwnerOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

const resolveImageUrl = (img?: string | string[]): string => {
  if (!img) return "/images/default_car.svg";
  const target = Array.isArray(img) ? img[0] : img;
  if (!target || typeof target !== "string") return "/images/default_car.svg";
  const clean = target.trim();
  if (!clean || clean === "null" || clean === "undefined") return "/images/default_car.svg";
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  const apiBase = (config.baseurl.apibaseurl || "http://localhost:5000").replace(/\/+$/, "");
  const stripped = clean.replace(/^\/+/, "");
  if (stripped.startsWith("uploads/")) return `${apiBase}/${stripped}`;
  if (stripped.startsWith("images/")) return `/${stripped}`;
  return `${apiBase}/uploads/vehicleImg/${stripped}`;
};

const ListVehicleMaster: React.FC = () => {
  const navigate = useNavigate();
  const [vehicleMasters, setVehicleMasters] = useState<VehicleMaster[]>([]);
  const [search, setSearch] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [modalType, setModalType] = useState<"confirm-delete" | "confirm-restore" | null>(null);
  const [targetRow, setTargetRow] = useState<VehicleMaster | null>(null);

  // View modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<VehicleMaster | null>(null);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<VehicleMaster>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Options state
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [owners, setOwners] = useState<OwnerOption[]>([]);

  // ---------- Fetch Options ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/vehiclemaster/unified-options");
        if (res.data?.success) {
          setTypes(res.data.types || []);
          setModels(res.data.models || []);
          setOwners(res.data.owners || []);
        }
      } catch (e) {
        // Fallback to individual dropdown endpoints
        try {
          const [resTypes, resModels, resVendors] = await Promise.all([
            axiosInstance.get("/vehicleMaster/dropdown/types"),
            axiosInstance.get("/vehicleMaster/dropdown/models"),
            axiosInstance.get("/vehicleMaster/dropdown/vendors"),
          ]);
          setTypes(
            (resTypes.data?.data || []).map((t: any) => ({
              id: t.id,
              name: t.label,
            }))
          );
          setModels(
            (resModels.data?.data || []).map((m: any) => ({
              id: m.id,
              name: m.label,
              vehicleTypeId: m.vehicleTypeId,
            }))
          );
          setOwners(
            (resVendors.data?.data || []).map((v: any) => ({
              id: v.id,
              name: v.label,
            }))
          );
        } catch {
          showToast("Failed to load vehicle dropdown options", "warn");
        }
      }
    })();
  }, []);

  // ---------- Fetch List ----------
  const fetchVehicleMasters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/vehicleMaster/getAllVehicleMaster?status=${showTrashed ? 1 : 0}`
      );
      const list = response.data.vehicles || [];
      const formatted: VehicleMaster[] = list.map((item: any) => ({
        id: item.vehicleMasterId,
        vehicleNumber: item.vehicleNumber,
        vehicleModel: item.vehicleModel ?? item.vehicleModelName ?? "",
        vehicleType: item.vehicleType,
        vendorName: item.vendorName,
        seatCapacity: item.seatCapacity ? Number(item.seatCapacity) : 4,
        manufacturing: item.manufacturing || "Commercial",
        vendorPhone: item.vendorPhone || "",
        vendorEmail: item.vendorEmail || "",
        vehicleImg: Array.isArray(item.vehicleImg) ? item.vehicleImg : [item.vehicleImg].filter(Boolean),
        trashed: item.isDeleted === 1,
        vehicleId: item.vehicleId,
        vehicleTypeId: item.vehicleTypeId,
        vendorId: item.vendorId,
        createdAt: item.createdAt,
      }));
      setVehicleMasters(formatted);
    } catch {
      showToast("Failed to fetch vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const globalSearchFetch = async () => {
    const q = search.trim();
    if (!q) return fetchVehicleMasters();

    setLoading(true);
    try {
      const res = await axiosInstance.get("/globalsearch", {
        params: { model: "vehiclemaster", keyword: q, isDeleted: showTrashed ? 1 : 0 },
      });

      const payload = res.data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];

      const formatted: VehicleMaster[] = (list || []).map((item: any) => ({
        id: item.vehicleMasterId,
        vehicleNumber: item.vehicleNumber,
        vehicleModel: item.vehicleModelName || item.vehicleModel || "",
        vehicleType: item.vehicleType,
        vendorName: item.vendorName,
        seatCapacity: item.seatCapacity ? Number(item.seatCapacity) : 4,
        manufacturing: item.manufacturing || "Commercial",
        vendorPhone: item.vendorPhone || "",
        vendorEmail: item.vendorEmail || "",
        vehicleImg: Array.isArray(item.vehicleImg) ? item.vehicleImg : [item.vehicleImg].filter(Boolean),
        trashed: item.isDeleted === 1,
        vehicleId: item.vehicleId,
        vehicleTypeId: item.vehicleTypeId,
        vendorId: item.vendorId,
        createdAt: item.createdAt,
      }));

      setVehicleMasters(formatted);
      setCurrentPage(1);
    } catch {
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleMasters();
  }, [showTrashed]);

  // ---------- Delete / Restore ----------
  const confirmDelete = async () => {
    if (!targetRow) return;
    try {
      await axiosInstance.delete(`/vehicleMaster/${targetRow.id}/delete`);
      showToast("Vehicle deleted", "success");
      fetchVehicleMasters();
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Failed to delete vehicle. Please try again.");
      showToast(msg, "error");
    } finally {
      setModalType(null);
      setTargetRow(null);
    }
  };

  const confirmRestore = async () => {
    if (!targetRow) return;
    try {
      await axiosInstance.put(`/vehicleMaster/${targetRow.id}/restore`);
      showToast(`Vehicle '${targetRow.vehicleNumber}' restored successfully.`, "success");
      if (showTrashed) {
        setVehicleMasters((prev) => prev.filter((v) => v.id !== targetRow.id));
      } else {
        fetchVehicleMasters();
      }
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Failed to restore vehicle. Please try again.");
      showToast(msg, "error");
    } finally {
      setModalType(null);
      setTargetRow(null);
    }
  };

  // ---------- Edit Handlers ----------
  const openEditModal = (row: VehicleMaster) => {
    // Resolve vehicleTypeId
    const matchedType = types.find(
      (t) => t.id === row.vehicleTypeId || t.name.toLowerCase() === row.vehicleType.toLowerCase()
    );
    const typeId = matchedType?.id || row.vehicleTypeId;

    // Resolve vehicleId
    const matchedModel = models.find(
      (m) =>
        (m.id === row.vehicleId || m.name.toLowerCase() === row.vehicleModel.toLowerCase()) &&
        (!typeId || m.vehicleTypeId === typeId)
    );
    const modelId = matchedModel?.id || row.vehicleId;

    // Derived seat capacity from selected type
    const derivedCapacity = matchedType?.seatCapacity ?? row.seatCapacity ?? 4;

    setEditData({
      ...row,
      vehicleTypeId: typeId,
      vehicleId: modelId,
      seatCapacity: derivedCapacity,
      manufacturing: row.manufacturing || matchedModel?.manufacturing || "Commercial",
    });

    setEditModalOpen(true);
  };

  const handleEditTypeChange = (selectedTypeId: string) => {
    const matchedType = types.find((t) => t.id === selectedTypeId);
    const newCapacity = matchedType?.seatCapacity ?? editData.seatCapacity ?? 4;

    setEditData((prev) => ({
      ...prev,
      vehicleTypeId: selectedTypeId,
      vehicleType: matchedType?.name || "",
      vehicleId: undefined, // Reset model selection when type changes
      vehicleModel: "",
      seatCapacity: newCapacity,
    }));
  };

  const handleEditModelChange = (selectedModelId: string) => {
    const matchedModel = models.find((m) => m.id === selectedModelId);
    setEditData((prev) => ({
      ...prev,
      vehicleId: selectedModelId,
      vehicleModel: matchedModel?.name || "",
      manufacturing: matchedModel?.manufacturing || prev.manufacturing || "Commercial",
    }));
  };

  const handleEditOwnerChange = (selectedOwnerId: string) => {
    const matchedOwner = owners.find((o) => o.id === selectedOwnerId);
    setEditData((prev) => ({
      ...prev,
      vendorId: selectedOwnerId,
      vendorName: matchedOwner?.name || "",
    }));
  };

  const saveEdit = async () => {
    if (!editData.id) return;
    const regCheck = validateVehicleReg(editData.vehicleNumber);
    if (!regCheck.valid) {
      showToast(regCheck.error || "Please enter a valid vehicle registration number.", "warn");
      return;
    }
    if (!editData.vehicleType) {
      showToast("Please select a vehicle type.", "warn");
      return;
    }
    if (!editData.vehicleModel) {
      showToast("Please select a vehicle model.", "warn");
      return;
    }
    if (!editData.vendorName && !editData.vendorId) {
      showToast("Please select a vehicle owner.", "warn");
      return;
    }

    setEditSaving(true);
    try {
      await axiosInstance.put(`/vehicleMaster/${editData.id}/update`, {
        vehicleNumber: (editData.vehicleNumber || '').trim().toUpperCase(),
        vehicleModelName: editData.vehicleModel,
        vehicleType: editData.vehicleType,
        vendorName: editData.vendorName,
        vehicleId: editData.vehicleId,
        vehicleTypeId: editData.vehicleTypeId,
        vendorId: editData.vendorId,
        manufacturing: editData.manufacturing,
      });

      showToast("Vehicle updated successfully.", "success");
      await fetchVehicleMasters();
      setEditModalOpen(false);
    } catch (e: any) {
      const msg = extractApiErrorMessage(e, "Failed to update vehicle. Please try again.");
      showToast(msg, "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Filter models strictly belonging to current vehicleTypeId
  const availableModels = models.filter((m) => {
    if (!editData.vehicleTypeId) return true;
    return m.vehicleTypeId === editData.vehicleTypeId;
  });

  // ---------- Table Columns ----------
  const columns: Column<VehicleMaster>[] = [
    { header: "Vehicle Number", accessor: "vehicleNumber", sortable: true },
    { header: "Vehicle Model", accessor: "vehicleModel", sortable: true },
    { header: "Vehicle Type", accessor: "vehicleType", sortable: true },
    {
      header: "Seat Capacity",
      accessor: "seatCapacity",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FontAwesomeIcon icon={faUsers} className="mr-1 text-blue-500" />
          {row.seatCapacity || 4} Seats
        </span>
      ),
    },
    { header: "Owner Name", accessor: "vendorName", sortable: true },
  ];

  return (
    <PageLayout>
      <AlertContainer />
      <div className="py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vehicle Master List</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and inspect registered vehicles in your fleet</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/vehicle/add")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <span>+ Add Vehicle</span>
          </button>
        </div>

        {/* Search & Trash Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-5 space-y-4 sm:space-y-0 sm:space-x-4">
          <SearchBar
            placeholder="Search vehicles..."
            value={search}
            onChange={(v: any) => setSearch(typeof v === "string" ? v : v?.target?.value ?? "")}
            onSearch={globalSearchFetch}
          />
          <TrashToggleButton
            showTrashed={showTrashed}
            onToggle={() => {
              setShowTrashed((t) => !t);
              setSearch("");
              setCurrentPage(1);
            }}
          />
        </div>

        {/* DataTable with View, Edit, Delete Actions */}
        <DataTable
          key={search + showTrashed + vehicleMasters.length}
          columns={columns}
          data={vehicleMasters}
          loading={loading}
          onView={(row) => {
            setViewTarget(row);
            setViewModalOpen(true);
          }}
          onEdit={!showTrashed ? openEditModal : undefined}
          onDelete={
            !showTrashed
              ? (row) => {
                  setTargetRow(row);
                  setModalType("confirm-delete");
                }
              : undefined
          }
          onRestore={
            showTrashed
              ? (row) => {
                  setTargetRow(row);
                  setModalType("confirm-restore");
                }
              : undefined
          }
        />

        {/* ===================== VIEW VEHICLE MODAL ===================== */}
        {viewModalOpen && viewTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 animate-fadeIn">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <FontAwesomeIcon icon={faTruck} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{viewTarget.vehicleNumber}</h2>
                    <p className="text-xs text-slate-400">
                      {viewTarget.vehicleModel} • {viewTarget.vehicleType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      viewTarget.trashed
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {viewTarget.trashed ? "Trashed" : "Active"}
                  </span>
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      setViewTarget(null);
                    }}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Vehicle Image Banner */}
                <div className="h-44 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={resolveImageUrl(viewTarget.vehicleImg)}
                    alt={viewTarget.vehicleModel}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default_car.svg";
                    }}
                    className="max-h-full max-w-full object-contain drop-shadow"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-xs">
                    <FontAwesomeIcon icon={faUsers} className="mr-1.5 text-orange-600" />
                    {viewTarget.seatCapacity || 4} Passenger Seats
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Specifications */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCar} className="text-orange-600" />
                      Vehicle Specifications
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Registration:</span>
                        <span className="font-mono font-bold text-slate-800">{viewTarget.vehicleNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Vehicle Type:</span>
                        <span className="font-semibold text-slate-800">{viewTarget.vehicleType}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Vehicle Model:</span>
                        <span className="font-semibold text-slate-800">{viewTarget.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Manufacturer (Make):</span>
                        <span className="font-medium text-slate-700">{viewTarget.manufacturing || "Commercial"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Authoritative Capacity:</span>
                        <span className="font-bold text-blue-700">{viewTarget.seatCapacity || 4} Seats</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ownership & Fleet */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUserTie} className="text-blue-600" />
                      Ownership & Fleet Identity
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Owner Name:</span>
                        <span className="font-semibold text-slate-800">{viewTarget.vendorName}</span>
                      </div>
                      {viewTarget.vendorPhone && (
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500">Owner Phone:</span>
                          <span className="font-mono text-slate-700">{viewTarget.vendorPhone}</span>
                        </div>
                      )}
                      {viewTarget.vendorEmail && (
                        <div className="flex justify-between border-b border-slate-200/60 pb-1">
                          <span className="text-slate-500">Owner Email:</span>
                          <span className="text-slate-700 truncate max-w-[180px]">{viewTarget.vendorEmail}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Fleet Status:</span>
                        <span className="font-medium text-emerald-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" /> Verified & Active
                        </span>
                      </div>
                      {viewTarget.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Registered On:</span>
                          <span className="text-slate-600 text-xs">
                            {new Date(viewTarget.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    openEditModal(viewTarget);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Edit Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewModalOpen(false);
                    setViewTarget(null);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== EDIT VEHICLE MODAL (Consistent with AddVehicle.tsx) ===================== */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 animate-fadeIn">
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-0.5">
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span>Fleet Operations</span>
                  </div>
                  <h2 className="text-lg font-bold">Edit Vehicle Master</h2>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Section 1: Classification & Capacity */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                      1
                    </span>
                    <span>Vehicle Classification & Capacity</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vehicle Type Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
                        value={editData.vehicleTypeId || ""}
                        onChange={(e) => handleEditTypeChange(e.target.value)}
                      >
                        <option value="">Select vehicle type...</option>
                        {types.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.seatCapacity ? `(${t.seatCapacity} seats)` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">Select the classified vehicle category.</p>
                    </div>

                    {/* Seat Capacity: Read-Only (Derived from authoritative VehicleType) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                        <span>
                          Seat Capacity <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1">
                          <FontAwesomeIcon icon={faLock} className="text-[9px]" /> Read-Only
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={`${editData.seatCapacity || 4} Seats`}
                          className="w-full px-3 py-2 text-sm font-semibold bg-gray-50 border border-gray-300 text-gray-700 rounded-lg cursor-not-allowed outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                          <FontAwesomeIcon icon={faUsers} />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Authoritative seating capacity derived from vehicle type.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Model & Manufacturer */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                      2
                    </span>
                    <span>Model & Manufacturer</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vehicle Model Dropdown (Filtered strictly to selected vehicle type) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Vehicle Model <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
                        value={editData.vehicleId || ""}
                        onChange={(e) => handleEditModelChange(e.target.value)}
                      >
                        <option value="">Select vehicle model...</option>
                        {availableModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.manufacturing ? `(${m.manufacturing})` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Filtered strictly to models of the selected vehicle type.
                      </p>
                    </div>

                    {/* Manufacturer (Make) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Manufacturer (Make) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editData.manufacturing || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({ ...prev, manufacturing: e.target.value }))
                          }
                          placeholder="e.g. Toyota, Maruti Suzuki, Tata"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                          <FontAwesomeIcon icon={faIndustry} />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">Automobile manufacturing brand.</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Registration & Ownership */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                      3
                    </span>
                    <span>Registration & Ownership</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vehicle Registration Number */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Vehicle Registration Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editData.vehicleNumber || ""}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              vehicleNumber: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="e.g. TN 01 AB 1234"
                          className="w-full px-3 py-2 text-sm font-mono tracking-wider uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                          <FontAwesomeIcon icon={faIdCard} />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">Official vehicle license plate number.</p>
                    </div>

                    {/* Owner / Vendor Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Vehicle Owner <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
                        value={editData.vendorId || ""}
                        onChange={(e) => handleEditOwnerChange(e.target.value)}
                      >
                        <option value="">Select vehicle owner...</option>
                        {owners.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} {o.phone ? `(${o.phone})` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">Fleet vendor or vehicle owner partner.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <CommonButton onClick={() => setEditModalOpen(false)} variant="secondary">
                  Cancel
                </CommonButton>
                <CommonButton onClick={saveEdit} variant="primary" disabled={editSaving}>
                  {editSaving ? "Saving Changes..." : "Save Vehicle Changes"}
                </CommonButton>
              </div>
            </div>
          </div>
        )}

        {/* Delete/Restore Modal */}
        <ActionModal
          isOpen={modalType !== null}
          type={modalType as any}
          onClose={() => {
            setModalType(null);
            setTargetRow(null);
          }}
          onConfirm={modalType === "confirm-delete" ? confirmDelete : confirmRestore}
          itemName={targetRow?.vehicleNumber}
        />
      </div>
    </PageLayout>
  );
};

export default ListVehicleMaster;
