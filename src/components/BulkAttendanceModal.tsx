import React, { useState } from 'react';
import { Calendar, User, FileText, Info, X, CheckSquare } from 'lucide-react';
import { Staff, DayAttendance, ShiftStatus } from '../types';
import { getMonthStats } from '../utils';

interface BulkAttendanceModalProps {
  staffList: Staff[];
  isOpen: boolean;
  onClose: () => void;
  onSaveBulk: (
    staffId: string,
    startDateStr: string,
    endDateStr: string,
    morningStatus: ShiftStatus,
    nightStatus: ShiftStatus,
    note: string
  ) => void;
}

export default function BulkAttendanceModal({
  staffList,
  isOpen,
  onClose,
  onSaveBulk
}: BulkAttendanceModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  
  const [attendancePreset, setAttendancePreset] = useState<'both_present' | 'morning_absent' | 'night_absent' | 'both_absent'>('both_present');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStaffId) {
      setError('Please select a staff member.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    // Map preset to morning/night status
    let morning: ShiftStatus = 'present';
    let night: ShiftStatus = 'present';

    if (attendancePreset === 'morning_absent') {
      morning = 'absent';
    } else if (attendancePreset === 'night_absent') {
      night = 'absent';
    } else if (attendancePreset === 'both_absent') {
      morning = 'absent';
      night = 'absent';
    }

    onSaveBulk(selectedStaffId, startDate, endDate, morning, night, note);
    
    // Reset state & close
    setNote('');
    onClose();
  };

  return (
    <div 
      id="bulk-attendance-modal-overlay"
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print"
    >
      <div 
        id="bulk-attendance-modal-content"
        className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-500" />
            <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100 text-lg">
              Bulk Attendance Logger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-lg font-medium flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Staff */}
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-400" />
              Select Staff Member
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="" disabled>Choose Staff...</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Attendance Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Attendance Setup
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAttendancePreset('both_present')}
                className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  attendancePreset === 'both_present'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'
                }`}
              >
                Present (Both Shifts)
              </button>
              <button
                type="button"
                onClick={() => setAttendancePreset('both_absent')}
                className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  attendancePreset === 'both_absent'
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-650 dark:text-red-400 ring-2 ring-red-500/10'
                    : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'
                }`}
              >
                Absent (Both Shifts)
              </button>
              <button
                type="button"
                onClick={() => setAttendancePreset('morning_absent')}
                className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  attendancePreset === 'morning_absent'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/10'
                    : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'
                }`}
              >
                Morning Missed Only
              </button>
              <button
                type="button"
                onClick={() => setAttendancePreset('night_absent')}
                className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  attendancePreset === 'night_absent'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/10'
                    : 'border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850'
                }`}
              >
                Night Missed Only
              </button>
            </div>
          </div>

          {/* Reason Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Absence Note / Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Family emergency, Festival leave, Sick leave"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Sunday off alert banner */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/30 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-650 dark:text-indigo-455">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" />
            <p className="leading-relaxed">
              <strong>Pro Tip:</strong> Sundays are automatically excluded from attendance overrides to maintain accurate off-day records.
            </p>
          </div>
        </form>

        {/* Action buttons */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-850 flex gap-3 bg-gray-50 dark:bg-gray-950">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-850 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Apply Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
