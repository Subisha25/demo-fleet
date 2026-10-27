import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faUsers,
  faClock,
  faImage,
  faIndustry,
  faIdCard,
  faUserTie,
  faCheckCircle,
  faList,
  faArrowLeft,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import axiosInstance from '../../../utils/axiosInstance';

interface TypeOption {
  id: string;
  name: string;
  seatCapacity?: number;
  AdvanceBookingHours?: string;
  vehicleImg?: string[];
}

interface ModelOption {
  id: string;
  name: string;
  vehicleTypeId: string;
  manufacturing: string;
  vehicleImg?: string[];
}

interface OwnerOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export const AddVehicle: React.FC = () => {
  const navigate = useNavigate();

  // Options state
  const [types, setTypes] = useState<TypeOption[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [vehicleType, setVehicleType] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [seatCapacity, setSeatCapacity] = useState<string>('4');
  const [advanceBookingHours, setAdvanceBookingHours] = useState<string>('2');
  const [vehicleModelName, setVehicleModelName] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [manufacturing, setManufacturing] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Custom vs Existing selection indicators
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Load options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await axiosInstance.get('/vehiclemaster/unified-options');
        if (res.data?.success) {
          setTypes(res.data.types || []);
          setModels(res.data.models || []);
          setOwners(res.data.owners || []);
        }
      } catch (err) {
        console.error('Error fetching unified vehicle options:', err);
        // Fallback to individual endpoints
        try {
          const [resTypes, resModels, resVendors] = await Promise.all([
            axiosInstance.get('/vehicleType/getAllVehicleType'),
            axiosInstance.get('/vehicle/getAllVehicles'),
            axiosInstance.get('/vendor/getAllVendors'),
          ]);
          setTypes(
            (resTypes.data?.data || []).map((t: any) => ({
              id: t.vehicleTypeId,
              name: t.vehicleType,
              seatCapacity: t.seatCapacity,
              AdvanceBookingHours: t.AdvanceBookingHours,
            }))
          );
          setModels(
            (resModels.data?.vehicles || []).map((m: any) => ({
              id: m.vehicleId,
              name: m.vehicleName,
              vehicleTypeId: m.vehicleTypeId,
              manufacturing: m.manufacturing,
            }))
          );
          setOwners(
            (resVendors.data?.vendors || []).map((v: any) => ({
              id: v.vendorId,
              name: v.vendorName,
            }))
          );
        } catch (fbErr) {
          showToast('Failed to load vehicle configuration options.', 'error');
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Handle Type selection
  const handleSelectType = (type: TypeOption) => {
    setVehicleType(type.name);
    setSelectedTypeId(type.id);
    setTypeDropdownOpen(false);
    if (type.seatCapacity) {
      setSeatCapacity(String(type.seatCapacity));
    }
    if (type.AdvanceBookingHours) {
      setAdvanceBookingHours(String(type.AdvanceBookingHours));
    }
  };

  // Handle Model selection
  const handleSelectModel = (model: ModelOption) => {
    setVehicleModelName(model.name);
    setSelectedModelId(model.id);
    setModelDropdownOpen(false);
    if (model.manufacturing) {
      setManufacturing(model.manufacturing);
    }
    // Also sync vehicle type if known
    if (model.vehicleTypeId) {
      const matchedType = types.find((t) => t.id === model.vehicleTypeId);
      if (matchedType) {
        setVehicleType(matchedType.name);
        setSelectedTypeId(matchedType.id);
        if (matchedType.seatCapacity) setSeatCapacity(String(matchedType.seatCapacity));
        if (matchedType.AdvanceBookingHours) setAdvanceBookingHours(String(matchedType.AdvanceBookingHours));
      }
    }
  };

  // Image file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image file size must be less than 2MB.', 'error');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Filtered lists for autocompletes
  const filteredTypes = types.filter((t) =>
    t.name.toLowerCase().includes(vehicleType.toLowerCase().trim())
  );

  const filteredModels = models.filter((m) => {
    const matchesQuery = m.name.toLowerCase().includes(vehicleModelName.toLowerCase().trim());
    if (selectedTypeId) {
      return matchesQuery && m.vehicleTypeId === selectedTypeId;
    }
    return matchesQuery;
  });

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleType.trim()) {
      showToast('Please enter or select a Vehicle Type.', 'error');
      return;
    }

    const cap = parseInt(seatCapacity, 10);
    if (isNaN(cap) || cap < 1) {
      showToast('Seat Capacity must be at least 1.', 'error');
      return;
    }

    if (!vehicleModelName.trim()) {
      showToast('Please enter or select a Vehicle Model.', 'error');
      return;
    }

    if (!manufacturing.trim()) {
      showToast('Manufacturer (Make) is required.', 'error');
      return;
    }

    const cleanNum = vehicleNumber.trim().toUpperCase();
    if (!cleanNum || cleanNum.length < 4) {
      showToast('Please enter a valid Vehicle Registration Number.', 'error');
      return;
    }

    if (!vendorId) {
      showToast('Please select a Vehicle Owner.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('vehicleType', vehicleType.trim());
      formData.append('seatCapacity', String(cap));
      formData.append('AdvanceBookingHours', advanceBookingHours.trim() || '0');
      formData.append('vehicleModelName', vehicleModelName.trim());
      formData.append('manufacturing', manufacturing.trim());
      formData.append('vehicleNumber', cleanNum);
      formData.append('vendorId', vendorId);

      if (selectedFile) {
        formData.append('vehicleImg', selectedFile);
      }

      const res = await axiosInstance.post('/vehiclemaster/unified-create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201 || res.status === 200) {
        showToast('Vehicle registered successfully in your fleet!', 'success');
        setTimeout(() => {
          navigate('/vehicle/vehiclemaster/list');
        }, 1000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to register vehicle.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <AlertContainer />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Fleet Operations {loadingOptions ? '• Loading Options...' : ''}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Add Vehicle</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Unified vehicle onboarding: effortlessly configure type, model, and registration in one single atomic step.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/vehicle/vehiclemaster/list')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon={faList} />
              <span>Vehicle List</span>
            </button>
          </div>
        </div>

        {/* Unified Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Vehicle Category & Type */}
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">1</span>
                <span>Vehicle Classification & Capacity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Vehicle Type Autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleType}
                      onChange={(e) => {
                        setVehicleType(e.target.value);
                        setSelectedTypeId(null);
                        setTypeDropdownOpen(true);
                      }}
                      onFocus={() => setTypeDropdownOpen(true)}
                      placeholder="e.g. Sedan, SUV, Hatchback"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faCar} />
                    </div>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {typeDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectType(t)}
                            className="w-full text-left px-3.5 py-2 text-sm hover:bg-orange-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
                          >
                            <span className="font-medium text-gray-800">{t.name}</span>
                            <span className="text-xs text-gray-400">
                              {t.seatCapacity ? `${t.seatCapacity} seats` : 'Existing Type'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-gray-500">
                          No matching type found. Pressing save will create &apos;{vehicleType}&apos; automatically.
                        </div>
                      )}
                      <div className="p-1.5 bg-gray-50 border-t border-gray-100 text-right">
                        <button
                          type="button"
                          onClick={() => setTypeDropdownOpen(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">Select an existing type or type a new one.</p>
                </div>

                {/* Seat Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Seat Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={seatCapacity}
                      onChange={(e) => setSeatCapacity(e.target.value)}
                      placeholder="e.g. 4, 7"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Passenger seating capacity.</p>
                </div>

                {/* Advance Booking Hours */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Advance Booking Hours
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={advanceBookingHours}
                      onChange={(e) => setAdvanceBookingHours(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faClock} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Required lead time before pickup.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Model & Manufacturer */}
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">2</span>
                <span>Model & Manufacturer</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Vehicle Model Autocomplete */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Model Name <span className="text-red-500">*</span>
                    {selectedModelId && (
                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
                        Existing Model
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleModelName}
                      onChange={(e) => {
                        setVehicleModelName(e.target.value);
                        setSelectedModelId(null);
                        setModelDropdownOpen(true);
                      }}
                      onFocus={() => setModelDropdownOpen(true)}
                      placeholder="e.g. Innova Crysta, Swift Dzire, Ertiga"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faCar} />
                    </div>
                  </div>

                  {/* Model Autocomplete Dropdown */}
                  {modelDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredModels.length > 0 ? (
                        filteredModels.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleSelectModel(m)}
                            className="w-full text-left px-3.5 py-2 text-sm hover:bg-orange-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
                          >
                            <span className="font-medium text-gray-800">{m.name}</span>
                            <span className="text-xs text-gray-400">{m.manufacturing || 'Existing Model'}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-gray-500">
                          No matching model found. Pressing save will create &apos;{vehicleModelName}&apos; automatically.
                        </div>
                      )}
                      <div className="p-1.5 bg-gray-50 border-t border-gray-100 text-right">
                        <button
                          type="button"
                          onClick={() => setModelDropdownOpen(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">Select an existing model or create a new model.</p>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Manufacturer (Make) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={manufacturing}
                      onChange={(e) => setManufacturing(e.target.value)}
                      placeholder="e.g. Toyota, Maruti Suzuki, Tata, Hyundai"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faIndustry} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Brand or manufacturing company.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Identity & Assignment */}
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">3</span>
                <span>Registration & Ownership</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Vehicle Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. TN 01 AB 1234"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all uppercase"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faIdCard} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Unique license plate number.</p>
                </div>

                {/* Owner / Vendor Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Vehicle Owner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                      required
                    >
                      <option value="">Select an Owner</option>
                      {owners.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} {o.phone ? `(${o.phone})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none text-gray-400">
                      <FontAwesomeIcon icon={faUserTie} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">The registered owner/vendor managing this vehicle.</p>
                </div>
              </div>
            </div>

            {/* Section 4: Vehicle Image */}
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">4</span>
                <span>Vehicle Photograph (Optional)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-full sm:w-64">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, or WEBP up to 2MB.</p>
                </div>

                {imagePreview ? (
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                    <FontAwesomeIcon icon={faImage} className="text-2xl mb-1" />
                    <span className="text-[10px]">No image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/vehicle/vehiclemaster/list')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{submitting ? 'Registering Vehicle...' : 'Register Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AddVehicle;
