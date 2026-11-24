import React, { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../../components/PageLayout";
import CommonButton from "../../../components/CommonButton";
import InputBox from "../../../components/InputBox";
import axiosInstance from "../../../utils/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faGlobe,
  faCity,
  faMapMarkerAlt,
  faLocationArrow,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { AlertContainer, showToast } from "../../../components/AlertBox";
import {
  validateName,
  validateEmail,
  validateMobile,
  validatePinCode,
  validateSelect,
  extractApiErrorMessage,
  extractFieldErrors,
} from "../../../utils/validation";
import { Country, State, City, ICountry, IState, ICity } from "country-state-city";

interface Company {
  companyId: string;
  companyName: string;
}

export default function AddUser() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [userAddress, setAddress] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  const navigate = useNavigate();

  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const fetchPincode = async (cityName: string, stateName: string) => {
    try {
      setLoadingPincode(true);

      const response = await fetch(`https://api.postalpincode.in/postoffice/${cityName}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
        const postOffices = data[0].PostOffice;

        const filteredOffices = postOffices.filter(
          (office: any) => office.State.toLowerCase() === stateName.toLowerCase()
        );

        if (filteredOffices.length > 0) {
          const pincode = filteredOffices[0].Pincode;
          setPinCode(pincode);
          showToast(`Pincode auto-filled: ${pincode}`, "success");
        } else if (postOffices.length > 0) {
          const pincode = postOffices[0].Pincode;
          setPinCode(pincode);
          showToast(`Pincode auto-filled: ${pincode}`, "success");
        } else {
          showToast("Pincode not found for this city", "warn");
        }
      } else {
        await fetchPincodeAlternative(cityName, stateName);
      }
    } catch (error) {
      console.error("Error fetching pincode:", error);
      await fetchPincodeAlternative(cityName, stateName);
    } finally {
      setLoadingPincode(false);
    }
  };

  const fetchPincodeAlternative = async (cityName: string, stateName: string) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${cityName}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
        const postOffice = data[0].PostOffice.find((office: any) =>
          office.Name.toLowerCase().includes(cityName.toLowerCase())
        );

        if (postOffice) {
          setPinCode(postOffice.Pincode);
          showToast(`Pincode auto-filled: ${postOffice.Pincode}`, "success");
        } else {
          showToast("Unable to auto-fill pincode. Please enter manually.", "info");
        }
      } else {
        showToast("Unable to auto-fill pincode. Please enter manually.", "info");
      }
    } catch (error) {
      console.error("Alternative pincode fetch failed:", error);
      showToast("Unable to auto-fill pincode. Please enter manually.", "info");
    }
  };

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);

    setCountry("");
    setStates([]);
    setCities([]);
  }, []);

  const handleCountryChange = (name: string, value: string) => {
    const selectedCountry = countries.find((c) => c.name === value);
    setCountry(value);
    setState("");
    setCity("");
    setPinCode("");

    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.isoCode));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  };

  const handleStateChange = (name: string, value: string) => {
    const selectedState = states.find((s) => s.name === value);
    const countryIso = countries.find((c) => c.name === country)?.isoCode;
    setState(value);
    setCity("");
    setPinCode("");

    if (countryIso && selectedState) {
      setCities(City.getCitiesOfState(countryIso, selectedState.isoCode));
    } else {
      setCities([]);
    }
  };

  const handleCityChange = async (name: string, value: string) => {
    setCity(value);
    setPinCode("");

    if (value && state) {
      await fetchPincode(value, state);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (submitting || isSubmittingRef.current) return;

    const newErrors: Record<string, string> = {};
    const nameRes = validateName(username, "Username", 2);
    if (!nameRes.valid) newErrors.username = nameRes.error!;

    const emailRes = validateEmail(email);
    if (!emailRes.valid) newErrors.email = emailRes.error!;

    const mobileRes = validateMobile(mobile);
    if (!mobileRes.valid) newErrors.mobile = mobileRes.error!;

    const countryRes = validateSelect(country, "a country");
    if (!countryRes.valid) newErrors.country = countryRes.error!;

    const stateRes = validateSelect(state, "a state");
    if (!stateRes.valid) newErrors.state = stateRes.error!;

    if (!city || !city.trim()) {
      newErrors.city = "Please enter the city.";
    }

    const compRes = validateSelect(companyId, "a company");
    if (!compRes.valid) newErrors.companyId = compRes.error!;

    if (pinCode && pinCode.trim()) {
      const pinRes = validatePinCode(pinCode);
      if (!pinRes.valid) newErrors.pinCode = pinRes.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast(Object.values(newErrors)[0], "warn");
      return;
    }

    setErrors({});
    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        role: "user",
        gender,
        country,
        state,
        city,
        companyId,
        userAddress,
        presentAddress,
        pinCode,
        isDeleted: 0,
        status: "active",
        isConfirmed: 1,
      };

      const response = await axiosInstance.post("/auth/createUser", payload);

      if (response.data?.success) {
        showToast("User added successfully. Login password sent to email.", "success");

        setUsername("");
        setEmail("");
        setMobile("");
        setGender("male");
        setCountry("");
        setState("");
        setCity("");
        setCompanyId("");
        setAddress("");
        setPresentAddress("");
        setPinCode("");

        setTimeout(() => navigate("/users/list"), 1000);
      } else {
        showToast(response.data?.message || "Already exists. Please try again.", "error");
      }
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      showToast(extractApiErrorMessage(error, "Failed to create user. Please try again."), "error");
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axiosInstance.get("/company/getAllCompany");
        if (response.status === 200 && Array.isArray(response.data.data)) {
          setCompanies(response.data.data);
        }
      } catch (error) {
        showToast("Failed to fetch companies", "error");
      }
    };

    fetchCompanies();
  }, []);

  return (
    <PageLayout>
      <main className="py-6">
        <h1 className="text-3xl font-bold text-gray-800">Add User</h1>

        <div className="rounded-lg py-3 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6 py-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputBox
                label={
                  <>
                    Username <span className="text-red-500">*</span>
                  </>
                }
                name="username"
                required={false}
                placeholder="Enter Username"
                value={username}
                onChange={(name, value) => { setUsername(value); clearError("username"); }}
                error={errors.username}
                icon={faUser}
              />

              <InputBox
                label={
                  <>
                    Email <span className="text-red-500">*</span>
                  </>
                }
                name="email"
                required={false}
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(name, value) => { setEmail(value); clearError("email"); }}
                error={errors.email}
                icon={faEnvelope}
              />

              <InputBox
                label={
                  <>
                    Mobile <span className="text-red-500">*</span>
                  </>
                }
                name="mobile"
                required={false}
                type="number"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(name, value) => { setMobile(value); clearError("mobile"); }}
                error={errors.mobile}
                icon={faPhone}
              />

              <div>
                <label className="block text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full border rounded p-2"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <InputBox
                label={
                  <>
                    Country <span className="text-red-500">*</span>
                  </>
                }
                name="country"
                type="select"
                required={false}
                value={country}
                onChange={handleCountryChange}
                options={countries.map((c: ICountry) => ({
                  value: c.name,
                  label: c.name,
                }))}
                placeholder="Select Country"
                icon={<FontAwesomeIcon icon={faGlobe} />}
                error={errors.country}
              />

              <InputBox
                label={
                  <>
                    State <span className="text-red-500">*</span>
                  </>
                }
                name="state"
                type="select"
                required={false}
                value={state}
                onChange={handleStateChange}
                options={states.map((s: IState) => ({
                  value: s.name,
                  label: s.name,
                }))}
                placeholder="Select State"
                icon={<FontAwesomeIcon icon={faLocationArrow} />}
                disabled={!country}
                error={errors.state}
              />

              <InputBox
                label={
                  <>
                    City <span className="text-red-500">*</span>
                  </>
                }
                name="city"
                type="text"
                required={false}
                value={city}
                onChange={(name, value) => { setCity(value); clearError("city"); }}
                placeholder="Enter City"
                error={errors.city}
                icon={<FontAwesomeIcon icon={faCity} />}
              />

              <div>
                <label className="block text-gray-700">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="companyId"
                  value={companyId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCompanyId(selectedId);
                  }}
                  className="w-full border rounded p-2"
                >
                  <option value="">-- Select Company --</option>
                  {companies.map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                {errors.companyId && <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>}
              </div>


              <InputBox
                label={<>Permanent Address</>}
                name="address"
                required={false}
                placeholder="Enter Permanent Address"
                value={userAddress}
                onChange={(name, value) => setAddress(value)}
                icon={faMapMarkerAlt}
              />

              <InputBox
                label={<>Present Address</>}
                name="presentAddress"
                required={false}
                placeholder="Enter Present Address"
                value={presentAddress}
                onChange={(name, value) => setPresentAddress(value)}
                icon={faMapMarkerAlt}
              />

              <InputBox
                label={<>Pin Code</>}
                name="pinCode"
                required={false}
                placeholder={loadingPincode ? "Loading pincode..." : "Enter Pin Code (auto-filled)"}
                value={pinCode}
                onChange={(name, value) => { setPinCode(value); clearError("pinCode"); }}
                icon={faHashtag}
                error={errors.pinCode}
                disabled={loadingPincode}
              />
            </div>

            <div className="flex justify-end pt-4">
              <CommonButton
                type="submit"
                variant="primary"
                loading={submitting}
                loadingText="Saving User..."
                disabled={loadingPincode || submitting}
                className="px-8 py-3 shadow-md"
              >
                Save User
              </CommonButton>
            </div>
          </form>
        </div>
      </main>
      <AlertContainer/>
    </PageLayout>
  );
}