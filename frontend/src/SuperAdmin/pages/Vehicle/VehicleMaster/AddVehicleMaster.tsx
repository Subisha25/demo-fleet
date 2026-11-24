

import React, { useEffect, useState } from 'react';
import PageLayout from '../../../../components/PageLayout';
import InputBox, { getFormStore } from '../../../../components/InputBox';
import CommonButton from '../../../../components/CommonButton';
import { AlertContainer, showToast } from '../../../../components/AlertBox';
import { faCar, faIdCard, faUser, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axiosInstance from '../../../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  validateVehicleReg,
  validateSelect,
  extractApiErrorMessage,
  extractFieldErrors,
} from '../../../../utils/validation';

interface Vendor {
  vendorId: string;
  vendorName: string;
}

interface VehicleModel {
  vehicleId: string;
  vehicleName: string;
}

const AddVehicleMaster: React.FC = () => {
  const [vendorsList, setVendorsList] = useState<Vendor[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axiosInstance.get('/vendor/getAllVendors');
        setVendorsList(res.data.vendors || []);
      } catch (err) {
        showToast('Failed to load owners. Please refresh.', 'error');
      }
    };

    const fetchVehicleModels = async () => {
      try {
        const res = await axiosInstance.get('/vehicle/getAllVehicles');
        setVehicleModels(res.data.vehicles || []);
      } catch (err) {
        showToast('Failed to load vehicle models. Please refresh.', 'error');
      }
    };

    fetchVendors();
    fetchVehicleModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const form = getFormStore();
    const { vehicleNumber, vehicleModel, vendors } = form;
    const newErrors: Record<string, string> = {};

    const regCheck = validateVehicleReg(vehicleNumber);
    if (!regCheck.valid) {
      newErrors.vehicleNumber = regCheck.error || 'Please enter a valid vehicle registration number.';
    }

    const modelCheck = validateSelect(vehicleModel, 'a vehicle model');
    if (!modelCheck.valid) {
      newErrors.vehicleModel = modelCheck.error || 'Please select a vehicle model.';
    }

    const vendorCheck = validateSelect(vendors, 'an owner');
    if (!vendorCheck.valid) {
      newErrors.vendors = vendorCheck.error || 'Please select an owner.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'warn');
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const selectedVendor = vendorsList.find(o => o.vendorId === vendors);
      const payload = {
        vehicleNumber: String(vehicleNumber).trim().toUpperCase(),
        vehicleId: vehicleModel,
        vendorId: vendors,
        vendors: selectedVendor?.vendorName || '',
      };

      const res = await axiosInstance.post('/vendor/createVehicleMaster', payload);

      if (res.status === 201 || res.status === 200) {
        showToast('Vehicle registered successfully.', 'success');
        navigate('/vehicle/vehiclemaster/list');
      }
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      const msg = extractApiErrorMessage(err, 'Failed to register vehicle. Please try again.');
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const vehicleModelOptions = [
    { value: '', label: 'Select a vehicle model' },
    ...vehicleModels.map(v => ({
      value: v.vehicleId,
      label: v.vehicleName,
    })),
  ];

  const vendorOptions = [
    { value: '', label: 'Select a owner' },
    ...vendorsList.map(o => ({
      value: o.vendorId,
      label: o.vendorName,
    })),
  ];

  return (
    <PageLayout>
      <AlertContainer />

      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-800">Add Vehicle Master</h1>

        <form onSubmit={handleSubmit} className="max-w-4xl text-left">
          <div className="text-lg font-semibold text-[#275981] py-5 underline">
            <FontAwesomeIcon icon={faClipboardList} /> Vehicle Info
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-4 w-[280px]">
              <InputBox
                label="Vehicle Number"
                name="vehicleNumber"
                placeholder="Enter Vehicle Number"
                required
                icon={faIdCard}
                error={errors.vehicleNumber}
                onChange={() => {
                  if (errors.vehicleNumber) {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.vehicleNumber;
                      return copy;
                    });
                  }
                }}
              />
              <span className="text-xs text-gray-400">e.g. MH01AB1234 or DL1CA9999</span>

              <InputBox
                label="Owner"
                name="vendors"
                options={vendorOptions}
                required
                icon={faUser}
                error={errors.vendors}
                onChange={() => {
                  if (errors.vendors) {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.vendors;
                      return copy;
                    });
                  }
                }}
              />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4 w-[280px]">
              <InputBox
                label="Vehicle Model"
                name="vehicleModel"
                options={vehicleModelOptions}
                required
                icon={faCar}
                error={errors.vehicleModel}
                onChange={() => {
                  if (errors.vehicleModel) {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.vehicleModel;
                      return copy;
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <CommonButton
              type="submit"
              variant="success"
              loading={submitting}
              loadingText="Saving..."
              className="px-8 py-2"
            >
              Save
            </CommonButton>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default AddVehicleMaster;
