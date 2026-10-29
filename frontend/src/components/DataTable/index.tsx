import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faPen,
  faTrash,
  faTimes,
  faCopy,
  faSave,
  faBan,
  faUndoAlt,
  faRecycle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCancel?: (row: T) => void;
  onClose?: (row: T) => void;
  onCopy?: (row: T) => void;
  onSave?: (originalRow: T, updatedData: Partial<T>) => void;
  onRestore?: (row: T) => void;
  viewIcon?: React.ReactNode;
  copyIcon?: React.ReactNode;
    viewLabel?: string;
  copyLabel?: string;
  onPermanentDelete?: (row: T) => void;
  // ✅ New props for invoice action
  onInvoice?: (row: T) => void | Promise<void>;
invoiceLabel?: string | ((row: T) => string);
  invoiceIcon?: React.ReactNode;

    invoiceVisible?: (row: T) => boolean;

  rowsPerPage?: number;
  emptyMessage?: string;
  editableColumns?: (keyof T)[];
  uniqueRowKey?: keyof T;
}

export const DataTable = <T extends object>({
  columns,
  data,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCancel,
  onClose,
  onCopy,
  onSave,
  onRestore,
  onPermanentDelete,
  // ✅ New props added to component destructuring
  onInvoice,
  invoiceLabel,
  invoiceIcon,
    invoiceVisible,

  rowsPerPage = 5,
  emptyMessage = "No entries found.",
  editableColumns = [],
  uniqueRowKey = 'id' as keyof T,
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const currentData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/90 shadow-sm bg-white">
      <table className="w-full table-auto text-sm text-left text-slate-700">
        {/* Table Header */}
        <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3.5">
                {col.header}
              </th>
            ))}
            {(onView ||
              onEdit ||
              onDelete ||
              onCancel ||
              onClose ||
              onCopy ||
              onSave ||
              onRestore ||
              onPermanentDelete ||
              onInvoice) && (
              <th className="px-5 py-3.5 text-right font-semibold">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (onView ||
                  onEdit ||
                  onDelete ||
                  onCancel ||
                  onClose ||
                  onCopy ||
                  onSave ||
                  onRestore ||
                  onPermanentDelete ||
                  onInvoice
                    ? 1
                    : 0)
                }
                className="px-4 py-8 text-center text-slate-500 font-medium"
              >
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-purple-600" />
                Loading records...
              </td>
            </tr>
          ) : currentData.length > 0 ? (
            currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-slate-50/75 transition-colors duration-150"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3.5 text-slate-700 text-sm align-middle">
                    {col.render
                      ? col.render(row)
                      : row[col.accessor] !== undefined &&
                        row[col.accessor] !== null &&
                        row[col.accessor] !== ""
                      ? String(row[col.accessor])
                      : "—"}
                  </td>
                ))}

                {/* Action Buttons */}
                {(onView ||
                  onEdit ||
                  onDelete ||
                  onCancel ||
                  onClose ||
                  onCopy ||
                  onSave ||
                  onRestore ||
                  onPermanentDelete ||
                  onInvoice) && (
                  <td className="px-5 py-3.5 text-sm text-slate-600 align-middle">
                    <div className="flex items-center justify-end gap-2.5">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium p-1 rounded hover:bg-teal-50 transition"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-1 text-xs" /> View
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button" 
                          onClick={() => onEdit(row)}
                          className="text-sky-600 hover:text-sky-800 p-1 rounded hover:bg-sky-50 transition"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPen} className="text-xs" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      )}
                      {onCancel && (
                        <button
                          onClick={() => onCancel(row)}
                          className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-50 transition"
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faBan} className="text-xs" />
                        </button>
                      )}
                      {onClose && (
                        <button
                          onClick={() => onClose(row)}
                          className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition"
                          title="Close"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      )}
                      {onCopy && (
                        <button
                          onClick={() => onCopy(row)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition"
                          title="Copy"
                        >
                          <FontAwesomeIcon icon={faCopy} className="text-xs" />
                        </button>
                      )}
                      {onSave && (
                        <button
                          onClick={() => onSave(row, {} as Partial<T>)}
                          className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-50 transition"
                          title="Save"
                        >
                          <FontAwesomeIcon icon={faSave} className="text-xs" />
                        </button>
                      )}
                      {onRestore && (
                        <button
                          onClick={() => onRestore(row)}
                          className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition"
                          title="Restore"
                        >
                          <FontAwesomeIcon icon={faUndoAlt} className="text-xs" />
                        </button>
                      )}
                      {onPermanentDelete && (
                        <button
                          onClick={() => onPermanentDelete(row)}
                          className="text-rose-700 hover:text-rose-900 p-1 rounded hover:bg-rose-50 transition"
                          title="Permanent Delete"
                        >
                          <FontAwesomeIcon icon={faRecycle} className="text-xs" />
                        </button>
                      )}
                      {/* New invoice button */}
                      {onInvoice && (invoiceVisible ? invoiceVisible(row) : true) && (
                        <button
                          onClick={() => onInvoice(row)}
                          className="inline-flex items-center text-[#5B3DF5] hover:text-[#4326C6] bg-[#5B3DF5]/10 hover:bg-[#5B3DF5]/20 font-semibold px-2 py-1 rounded border border-[#5B3DF5]/30 transition text-xs"
                        >
                          {invoiceIcon || <FontAwesomeIcon icon={faCopy} className="mr-1 text-xs" />}
                          {typeof invoiceLabel === "function" ? invoiceLabel(row) : invoiceLabel}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (onView ||
                  onEdit ||
                  onDelete ||
                  onCancel ||
                  onClose ||
                  onCopy ||
                  onSave ||
                  onRestore ||
                  onPermanentDelete ||
                  onInvoice
                    ? 1
                    : 0)
                }
                className="text-center py-10 text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modernized Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p className="font-medium">
            Showing <span className="text-slate-900 font-semibold">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
            <span className="text-slate-900 font-semibold">{Math.min(currentPage * rowsPerPage, data.length)}</span> of{' '}
            <span className="text-slate-900 font-semibold">{data.length}</span> entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                currentPage === 1
                  ? "text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed"
                  : "text-slate-700 bg-white border-slate-300 hover:bg-slate-100"
              }`}
            >
              Previous
            </button>

            {(() => {
              let startPage = currentPage;
              let endPage = Math.min(currentPage + 2, totalPages);
              if (endPage - startPage < 2) {
                startPage = Math.max(endPage - 2, 1);
              }

              return Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => startPage + i
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition ${
                    currentPage === page
                      ? "text-white bg-gradient-to-r from-indigo-600 to-purple-700 border border-indigo-600 shadow-sm"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                currentPage === totalPages
                  ? "text-slate-300 bg-slate-100 border-slate-200 cursor-not-allowed"
                  : "text-slate-700 bg-white border-slate-300 hover:bg-slate-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
