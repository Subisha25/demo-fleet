import React, { FC, useEffect, useState, useRef,ReactNode } from "react";
import Calendar from "./Calender";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Eye, EyeOff } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface InputBoxProps {
  label?: string | ReactNode;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?:boolean;
  value?: string | boolean;
  onChange?: (name: string, value: string) => void;
  onValueChange?: (value: string | boolean | File | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  options?: string[] | Option[];
  defaultValue?: string | boolean;
  isTextarea?: boolean;
  icon?: IconDefinition | React.ReactElement;
  error?: string; // Added error prop here
  onWheel?: React.WheelEventHandler<HTMLInputElement>;
  onEnterPress?: () => void; 
}

const formStore: Record<string, any> = {};
export const getFormStore = () => formStore;

const InputBox: FC<InputBoxProps> = ({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
  readOnly = false,
  value,
  onChange,
  onValueChange,
  options,
  defaultValue,
  isTextarea = false,
  icon,
  error, 
  onEnterPress, 
}) => {
  const initial = value ?? defaultValue ?? (type === "checkbox" ? false : "");
  const [inputValue, setInputValue] = useState<string | boolean | File | null>(initial);
  const [showPassword, setShowPassword] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null!);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectingDateType, setSelectingDateType] = useState<"from" | "to">("from");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDemo = typeof window !== 'undefined' && (
    localStorage.getItem('isDemoView') === 'true' ||
    localStorage.getItem('isDemoMode') === 'true' ||
    localStorage.getItem('role') === 'demo'
  );

  const pathname = typeof window !== 'undefined' ? (window.location.pathname || '').toLowerCase() : '';
  const isAuthOrPublicRoute = /^\/(login|adminlogin|forgetpasword|activate|register-fleet|company)/.test(pathname) || pathname.includes('/login');

  const isFilterOrSearch =
    /search|filter|keyword|query/i.test(name) ||
    /search|filter|keyword|query/i.test(placeholder || '') ||
    (typeof label === 'string' && /search|filter/i.test(label));

  const isDemoDisabled = isDemo && !isAuthOrPublicRoute && !isFilterOrSearch;
  const effectiveDisabled = disabled || isDemoDisabled;
  const effectiveReadOnly = readOnly || isDemoDisabled;

useEffect(() => {
  if (value !== undefined) {
    setInputValue(value);
  }
}, [value]);
  useEffect(() => {
    if (type === "date-range" && typeof initial === "string" && initial.includes(" - ")) {
      const [fromStr, toStr] = initial.split(" - ");
      const [fD, fM, fY] = fromStr.split("-").map(Number);
      const [tD, tM, tY] = toStr.split("-").map(Number);
      const from = new Date(fY, fM - 1, fD);
      const to = new Date(tY, tM - 1, tD);
      setFromDate(from);
      setToDate(to);
    }
  }, [initial]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleDateSelect = (date: Date) => {
    if (isDemoDisabled) return;
    if (selectingDateType === "from") {
      setFromDate(date);
      setToDate(null);
      setSelectingDateType("to");
    } else {
      if (fromDate && date >= fromDate) {
        setToDate(date);
        setShowCalendar(false);
        const formatted = `${formatDate(fromDate)} - ${formatDate(date)}`;
        setInputValue(formatted);
        formStore[name] = formatted;
        onChange?.(name, formatted);
        onValueChange?.(formatted);
      } else {
        alert("End date must be after start date");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (isDemoDisabled) return;
    let rawValue: string | boolean | File | null;

    if (type === "checkbox") {
      rawValue = (e.target as HTMLInputElement).checked;
    } else if (type === "file") {
      rawValue = (e.target as HTMLInputElement).files?.[0] || null;
    } else {
      rawValue = e.target.value;
    }

    setInputValue(rawValue);
    formStore[name] = rawValue;
    onChange?.(name, String(rawValue));
    onValueChange?.(rawValue);
  };

  const renderOptions = () => {
    if (!options) return null;
    return options.map((opt) =>
      typeof opt === "string" ? (
        <option key={opt} value={opt}>{opt}</option>
      ) : (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      )
    );
  };
  
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "object" && 'iconName' in icon) {
      return <FontAwesomeIcon icon={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />;
    }
    return <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>;
  }

  return (
    
    <div className="mb-4 relative">
      {type !== "checkbox" && (
        <label htmlFor={name} className="block mb-1 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === "date-range" ? (
  <>
    <div
      className={`relative flex gap-2 items-center border border-gray-300 rounded px-4 py-2 w-[290px] ${
        isDemoDisabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : 'bg-white cursor-pointer'
      }`}
      title={isDemoDisabled ? 'Demo Preview is read-only. Date selection is disabled.' : undefined}
    >
      <span
        onClick={() => {
          if (!isDemoDisabled) {
            setShowCalendar(true);
            setSelectingDateType("from");
          }
        }}
        className={isDemoDisabled ? 'text-gray-500 text-sm font-medium' : 'hover:text-purple-600 text-sm font-medium'}
      >
        From: {fromDate ? formatDate(fromDate) : "Select"}
      </span>
      <span className="text-gray-400">|</span>
      <span
        onClick={() => {
          if (!isDemoDisabled) {
            setShowCalendar(true);
            setSelectingDateType("to");
          }
        }}
        className={isDemoDisabled ? 'text-gray-500 text-sm font-medium' : 'hover:text-purple-600 text-sm font-medium'}
      >
        To: {toDate ? formatDate(toDate) : "Select"}
      </span>
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className={`absolute right-3 top-2.5 ${
          isDemoDisabled ? 'text-gray-400' : 'text-gray-500 hover:text-purple-600'
        }`}
        onClick={() => {
          if (!isDemoDisabled) {
            setShowCalendar(true);
            setSelectingDateType("from");
          }
        }}
      />
    </div>

    <Calendar
      show={showCalendar}
      onClose={() => setShowCalendar(false)}
      fromDate={fromDate}
      toDate={toDate}
      selectingDateType={selectingDateType}
      onDateSelect={(date) => {
        if (selectingDateType === "from") {
          if (toDate && date > toDate) {
            alert("Start date must be before end date");
            return;
          }
          setFromDate(date);
        } else {
          if (fromDate && date < fromDate) {
            alert("End date must be after start date");
            return;
          }
          setToDate(date);
        }
        const updatedFrom = selectingDateType === "from" ? date : fromDate;
        const updatedTo = selectingDateType === "to" ? date : toDate;
        if (updatedFrom && updatedTo) {
          const formatted = `${formatDate(updatedFrom)} - ${formatDate(updatedTo)}`;
          setInputValue(formatted);
          formStore[name] = formatted;
          onChange?.(name, formatted);
          onValueChange?.(formatted);
          setShowCalendar(false);
        }
      }}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      calendarRef={calendarRef}
    />
  </>
) : options ? (
        <div className="relative">
          {renderIcon()}
          <select
            id={name}
            name={name}
            value={inputValue as string}
            onChange={handleChange}
             onKeyDown={(e) => {
    if (e.key === "Enter") onEnterPress?.(); // 🔥 Enter press triggers callback
  }}
            required={required}
            disabled={effectiveDisabled}
            title={isDemoDisabled ? 'Demo Preview is read-only. Selection is disabled.' : undefined}
            className={`w-full border rounded px-4 py-2 outline-none ${icon ? 'pl-10' : ''} ${isDemoDisabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''} ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600'}`}
          >
            <option value="">-- Select --</option>
            {renderOptions()}
          </select>
        </div>
      ) : isTextarea ? (
        <div className="relative">
          {renderIcon()}
          <textarea
            id={name}
            name={name}
            value={inputValue as string}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            title={isDemoDisabled ? 'Demo Preview is read-only. Text editing is disabled.' : undefined}
            className={`w-full border rounded px-4 py-2 h-20 outline-none ${icon ? 'pl-10' : ''} ${isDemoDisabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''} ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600'}`}
          />
        </div>
      ) : type === "checkbox" ? (
        <div className="flex items-center gap-2">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={Boolean(inputValue)}
            onChange={handleChange}
            disabled={effectiveDisabled}
            title={isDemoDisabled ? 'Demo Preview is read-only. Checkbox is disabled.' : undefined}
            className={`w-5 h-5 ${isDemoDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
          />
          <label htmlFor={name} className="font-medium">{label}</label>
        </div>
      ) : type === "file" ? (
        <input
          id={name}
          name={name}
          type="file"
          onChange={handleChange}
          disabled={effectiveDisabled}
          title={isDemoDisabled ? 'Demo Preview is read-only. File upload is disabled.' : undefined}
          className={`w-full px-4 py-2 ${isDemoDisabled ? 'cursor-not-allowed opacity-60 bg-slate-100' : ''} ${error ? 'border border-red-500 rounded ring-1 ring-red-500' : ''}`}
        />
      ) : (
        <div className="relative">
          {renderIcon()}
          <input
            id={name}
            name={name}
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            value={inputValue as string}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            title={isDemoDisabled ? 'Demo Preview is read-only. Input is disabled.' : undefined}
            onWheel={(e) => e.currentTarget.blur()} 
            onKeyDown={(e) => {
              if (e.key === "Enter") onEnterPress?.(); // 🔥 Enter press triggers callback
            }}
            className={`w-full border rounded px-4 py-2 outline-none ${icon ? 'pl-10' : ''} ${type === 'password' ? 'pr-10' : ''} ${isDemoDisabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''} ${error ? 'border-red-500 ring-1 ring-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600'} ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
          />
          {type === "password" && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><FontAwesomeIcon icon={faCircleExclamation} /> {error}</p>}
    </div>
  );
};

export default InputBox;