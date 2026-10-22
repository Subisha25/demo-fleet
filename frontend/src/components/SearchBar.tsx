// // components/SearchBar.tsx
// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
// import CommonButton from './CommonButton';

// interface SearchBarProps {
//   placeholder?: string;
//   value?: string;
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onSearch?: () => void;
//   onlyButton?: boolean;
// }

// const SearchBar: React.FC<SearchBarProps> = ({
//   placeholder = 'Keywords (Order Number, User Name, Payment Mode)',
//   value,
//   onChange,
//   onSearch,
//   onlyButton = false,
// }) => {
//   return (
//     <div className="flex items-center gap-2">
//       {!onlyButton && (
//         <input
//           type="text"
//           placeholder={placeholder}
//           value={value}
//           onChange={onChange}
//           className="px-3 py-2 w-120 border rounded border-gray-300"
//         />
//       )}
//       <CommonButton variant="custom" onClick={onSearch}>
//         <FontAwesomeIcon icon={faSearch} className="mr-2" />
//         Search
//       </CommonButton>
//     </div>
//   );
// };

// export default SearchBar;




// components/SearchBar.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CommonButton from './CommonButton';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  onlyButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Keywords (Order Number, User Name, Payment Mode)',
  value,
  onChange,
  onSearch,
  onlyButton = false,
}) => {
  return (
    <div className="flex items-center gap-2.5 w-full max-w-xl">
      {!onlyButton && (
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch?.();
              }
            }}
          />
        </div>
      )}
      <CommonButton variant="primary" onClick={onSearch} className="whitespace-nowrap">
        <FontAwesomeIcon icon={faSearch} className="mr-1.5 text-xs" />
        Search
      </CommonButton>
    </div>
  );
};

export default SearchBar;
