import React, { useEffect, useState, FormEvent, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../../../components/PageLayout";
import CommonButton from "../../../../components/CommonButton";
import { DataTable, Column } from "../../../../components/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faChain,
} from "@fortawesome/free-solid-svg-icons";
import { showToast } from "../../../../components/AlertBox";
import axiosInstance from "../../../../utils/axiosInstance";
import config from "../../../../config/config";

interface DayBookingRule {
  day: string;
  startTime: string;
  endTime: string;
  priorMinutes: string;
}

const defaultStart = "09:00 AM";
const defaultEnd = "06:00 PM";
const defaultPrior = "60";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const bookingRuleColumns: Column<DayBookingRule>[] = [
  { header: "Days", accessor: "day" },
  { header: "Start Time", accessor: "startTime" },
  { header: "Close Time", accessor: "endTime" },
  { header: "Prior Minutes", accessor: "priorMinutes" },
];

export default function EditCompany() {
  const navigate = useNavigate();
  const { companyId } = useParams();

  const [companyLogo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [bookingRules, setBookingRules] = useState<DayBookingRule[]>(
    days.map((day) => ({
      day,
      startTime: defaultStart,
      endTime: defaultEnd,
      priorMinutes: defaultPrior,
    }))
  );

  // 🔹 Form state
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    seoUrl: "",
    managerEmail: "",
    domainName: "",
    companyAddress: "",
    allowTax: false,
    gstNo: "", 
    startTime: defaultStart,
    endTime: defaultEnd,
    priorMinutes: defaultPrior,
    companyCode: "", 
  });

  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Handle logo change
const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;
  if (file && file.size > 1 * 1024 * 1024) {
    showToast("Image too large! Please select below 1 MB,", "error");
    e.currentTarget.value = "";
    setLogo(null);
    setLogoPreview(null); // optional: remove old preview if user tried a huge file
    return;
  }
  setLogo(file);
  if (file) {
    setLogoPreview(URL.createObjectURL(file)); // quick local preview if you like
  }
};


  // 🔹 Handle input changes
  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;
  const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;

  setCompanyForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};


  // 🔹 Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await axiosInstance.get(
          `company/getCompanyById/${companyId}`
        );
        const company = data?.data;
         const BASE_URL = config.baseurl.apibaseurl;
        if (company) {
          setCompanyForm({
            companyName: company.companyName || "",
            seoUrl: company.seoUrl || "",
            managerEmail: company.managerEmail || "",
            domainName: company.domainName || "",
            companyAddress: company.companyAddress || "",
            allowTax: company.allowTax === "Yes",
            gstNo: company.gstNo || "",
            startTime: company.startTime || defaultStart,
            endTime: company.closeTime || defaultEnd,
            priorMinutes: company.priorMinutes || defaultPrior,
            companyCode: company.companyCode || "",  

          });

       if (company.companyLogo) {
  setLogoPreview(
    `${BASE_URL}/uploads/companyLogo/${company.companyLogo}`
  );
}


          setBookingRules(
            days.map((day) => ({
              day,
              startTime: company.startTime || defaultStart,
              endTime: company.closeTime || defaultEnd,
              priorMinutes: company.priorMinutes || defaultPrior,
            }))
          );
        }
      } catch (err) {
        showToast("Failed to load company details.", "warn");
      }
    };

    fetchCompany();
  }, [companyId]);

  // 🔹 Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;

    if (!companyForm.companyName) {
      showToast("Company Name is required", "warn");
      return;
    }

    if (!companyForm.companyCode || !companyForm.companyCode.trim()) {
      showToast("Company Code is required", "warn");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("companyName", companyForm.companyName);
      formData.append("managerEmail", companyForm.managerEmail);
      formData.append("seoUrl", companyForm.seoUrl);
      formData.append("domainName", companyForm.domainName);
      formData.append("companyAddress", companyForm.companyAddress); // ✅ ADD
      formData.append("allowTax", companyForm.allowTax ? "Yes" : "No");
      formData.append("needEmail", "false");
      formData.append("managerApproval", "false");
      formData.append("gstNo", companyForm.gstNo);
      formData.append("startTime", companyForm.startTime);
      formData.append("closeTime", companyForm.endTime);
      formData.append("priorMinutes", companyForm.priorMinutes);
      formData.append("bookingRules", JSON.stringify(bookingRules));

      if (companyLogo) {
        formData.append("companyLogo", companyLogo);
      }

      formData.append("companyCode", companyForm.companyCode.trim());

      await axiosInstance.put(`company/companyUpdate/${companyId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Company updated successfully!", "success");
      navigate("/master/company/list");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Update failed. Please try again.", "error");
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  // 🔹 Set All button
  const setAllTime = () => {
    setBookingRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        startTime: companyForm.startTime,
        endTime: companyForm.endTime,
        priorMinutes: companyForm.priorMinutes,
      }))
    );
    showToast("All booking rules updated!", "success");
  };

  return (
    <PageLayout>
      <main className="py-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Company</h1>
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Company Info */}
          <div className="bg-white py-4 px-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 py-3 border-b border-slate-100 mb-4">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
              <div className="w-full">
                <label className="block mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={companyForm.companyName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  placeholder="Company Name"
                />
                
              </div>
<div className="w-full">
  <label className="block mb-1 font-medium">
    Company Code <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="companyCode"
    value={companyForm.companyCode}
    onChange={handleInputChange}
    className="w-full border p-2 rounded"
    placeholder="Enter company code"
  />
</div>

              <div className="w-full">
                <label className="block mb-1 font-medium">SEO URL</label>
                <input
                  type="text"
                  name="seoUrl"
                  value={companyForm.seoUrl}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  placeholder="SEO URL"
                />
              </div>

   <div className="w-full">
                <label className="block mb-1 font-medium">Domain Name</label>
                <input
                  type="text"
                  name="domainName"
                  value={companyForm.domainName}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  placeholder="Domain Name"
                />
              </div>
              <div className="w-full">
                <label className="block mb-1 font-medium">Manager Email</label>
                <textarea
                  name="managerEmail"
                  value={companyForm.managerEmail}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  placeholder="Enter emails separated by comma"

                />
                  <span className="text-xs text-gray-500 mt-1">
    Separate multiple emails with comma (,) or new line.
  </span>
              </div>

           
              <div className="w-full">
  <label className="block mb-1 font-medium">Company Address</label>
  <textarea
    name="companyAddress"
    value={companyForm.companyAddress}
    onChange={handleInputChange}
    className="w-full border p-2 rounded resize-none"
    rows={3}
    placeholder="Enter company address"
  />
</div>
<div className="w-full">
  <label className="block mb-1 font-medium">GST Number</label>
  <input
    type="text"
    name="gstNo"
    value={companyForm.gstNo}
    onChange={handleInputChange}
    className="w-full border p-2 rounded"
    placeholder="Enter GST Number"
  />
</div>

              <div className="w-full">
                <label className="block mb-1 font-medium">Company Logo</label>
                  <input
  type="file"
  accept="image/*"
  onChange={handleLogoChange}
  className="w-full border p-2 rounded"
/>
{logoPreview ? (
  <img
    src={logoPreview}
    alt="Company Logo"
    className="h-30 w-30 object-contain border rounded p-1"
  />
) : (
  <div className="h-10 w-10 flex items-center justify-center border rounded text-xs text-gray-400">
    No Logo
  </div>
)}


             
              

              </div>

              <div className="w-full flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  name="allowTax"
                  checked={companyForm.allowTax}
                  onChange={handleInputChange}
                />
                <label>Allow Tax</label>
              </div>


            </div>
          </div>

          {/* Booking Rule */}
          {/* <div>
            <h2 className="text-lg font-semibold text-[#275981] mb-4 underline">
              <FontAwesomeIcon icon={faChain} />
              Booking Rule
            </h2>
            <div className="mb-4 flex gap-4 items-end">
              <div>
                <label className="block text-sm">Start Time</label>
                <input
                  type="text"
                  name="startTime"
                  value={companyForm.startTime}
                  onChange={handleInputChange}
                  className="px-2 py-1 border border-gray-300 rounded w-28"
                />
              </div>
              <div>
                <label className="block text-sm">End Time</label>
                <input
                  type="text"
                  name="endTime"
                  value={companyForm.endTime}
                  onChange={handleInputChange}
                  className="px-2 py-1 border border-gray-300 rounded w-28"
                />
              </div>
              <div>
                <label className="block text-sm">Prior Minutes</label>
                <input
                  type="number"
                  name="priorMinutes"
                  value={companyForm.priorMinutes}
                  onChange={handleInputChange}
                  className="px-2 py-1 border border-gray-300 rounded w-28"
                />
              </div>
              <CommonButton type="button" onClick={setAllTime} variant="success">
                Set All
              </CommonButton>
            </div>

            <DataTable<DayBookingRule> columns={bookingRuleColumns} data={bookingRules} />
          </div> */}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <CommonButton
              type="submit"
              variant="primary"
              loading={submitting}
              loadingText="Updating Company..."
              className="px-8 py-3 shadow-md"
            >
              Update Company
            </CommonButton>
          </div>
        </form>
      </main>
    </PageLayout>
  );
}
