import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Staff, AttendanceRecord, DayAttendance, ShiftStatus } from '../types';
import { getCalendarDays, MONTHS, getMonthStats } from '../utils';
import { User, Calendar, Award, AlertCircle, CheckCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface StaffCalendarViewProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
}

export default function StaffCalendarView({
  staffList,
  attendance,
  currentYear,
  currentMonth,
  onMonthChange
}: StaffCalendarViewProps) {
  // Toggle who is selected for full month review
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return staffList[0]?.id || '';
  });

  const selectedStaff = staffList.find(s => s.id === selectedStaffId) || staffList[0];

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();

  // Create empty cell arrays for calendar grid aligning
  const emptyBlankCells = Array(firstDayOffset).fill(null);

  // Stats in current selected month for this staff
  const staffMonthRecords = selectedStaff ? (attendance[selectedStaff.id] || {}) : {};
  let totalPresentCount = 0;
  let totalAbsentCount = 0;
  let totalPendingCount = 0;
  let totalApprovedCount = 0;

  calendarDays.forEach(day => {
    if (day.isSunday) return;
    const rec = staffMonthRecords[day.dateStr];
    if (rec) {
      if (rec.morning === 'present') totalPresentCount++;
      if (rec.morning === 'absent') totalAbsentCount++;
      if (rec.morning === 'leave_pending') totalPendingCount++;
      if (rec.morning === 'leave_approved') totalApprovedCount++;

      if (rec.night === 'present') totalPresentCount++;
      if (rec.night === 'absent') totalAbsentCount++;
      if (rec.night === 'leave_pending') totalPendingCount++;
      if (rec.night === 'leave_approved') totalApprovedCount++;
    } else {
      // Unmarked elapsed days are assumed present
      if (!day.isFuture) {
        totalPresentCount += 2;
      }
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Selection Control Panel */}
      <div className="p-5 sleek-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-indigo-600" />
              Monthly Roll Ledger
            </h2>
            <p className="text-xs text-slate-400">Choose a staff member below to view their active schedules & shifts calendar</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Staff Selector buttons */}
            <div className="flex overflow-x-auto max-w-full scrollbar-none p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-1 sm:gap-0">
              {staffList.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedStaffId === s.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20'
                      : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <User className="h-3 w-3" />
                  <span>{s.name} ({s.role})</span>
                </button>
              ))}
            </div>

            {/* Month Scroller */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
              <button 
                onClick={handlePrevMonth}
                className="p-1 px-2.5 text-slate-500 hover:text-indigo-650 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold font-mono px-3 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {MONTHS[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-1 px-2.5 text-slate-500 hover:text-indigo-650 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid View */}
      {selectedStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Calendar Month Grid */}
          <div className="lg:col-span-3 sleek-card p-6">
            
            {/* Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              {weekDays.map(day => (
                <span 
                  key={day} 
                  className={`text-[10px] uppercase font-bold tracking-widest font-mono ${
                    day === 'Sun' ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-2.5">
              
              {/* Offset Blank Cells */}
              {emptyBlankCells.map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[84px] bg-slate-50/20 dark:bg-slate-950/5 rounded-xl border border-transparent"></div>
              ))}

              {/* Month Days Cells */}
              {calendarDays.map(day => {
                const record = staffMonthRecords[day.dateStr];
                
                // Set default display states
                const isSunday = day.isSunday;
                const morningStatus = record?.morning || (day.isFuture ? undefined : 'present');
                const nightStatus = record?.night || (day.isFuture ? undefined : 'present');

                // Determine cellular highlight states
                return (
                  <div 
                    key={day.dateStr} 
                    className={`min-h-[64px] sm:min-h-[84px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                      day.isToday 
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-xs' 
                        : isSunday 
                        ? 'border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 text-slate-400' 
                        : 'border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/5'
                    }`}
                  >
                    {/* Day number & today marker */}
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] sm:text-[11px] font-bold font-mono ${
                        isSunday 
                          ? 'text-rose-500' 
                          : day.isToday 
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold ring-1 ring-indigo-300 dark:ring-indigo-800 rounded-full w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-[11px]' 
                          : 'text-slate-600 dark:text-slate-350'
                      }`}>
                        {day.dayNumber}
                      </span>
                      {day.isToday && (
                        <span className="hidden xs:inline-block text-[7.5px] uppercase font-bold text-indigo-650 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 rounded px-1">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Shifts status cells */}
                    {isSunday ? (
                      <div className="text-[8px] sm:text-[10px] text-center italic font-semibold text-rose-450 dark:text-rose-500/80 my-1 sm:my-2">
                        Off
                      </div>
                    ) : (
                      <div className="space-y-1 sm:space-y-1.5 pt-1 sm:pt-2">
                        
                        {/* Morning indicator */}
                        <div className="flex sm:flex-row flex-col items-center sm:justify-between justify-center gap-0.5 sm:gap-0">
                          <span className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-bold tracking-wider font-mono">M</span>
                          {morningStatus ? (
                            <>
                              {/* Desktop text pill */}
                              <span className={`hidden sm:inline-block text-[8.5px] font-bold rounded-lg px-2 py-0.5 border ${
                                morningStatus === 'present'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                  : morningStatus === 'leave_approved'
                                  ? 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900'
                                  : morningStatus === 'leave_pending'
                                  ? 'bg-amber-105 bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900'
                                  : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900'
                              }`} title={morningStatus === 'leave_approved' ? `Approved by ${record?.morningApprovedBy}` : morningStatus}>
                                {morningStatus === 'leave_approved' ? `Leave✓` : morningStatus === 'leave_pending' ? 'Pending' : morningStatus}
                              </span>
                              {/* Mobile circular badge */}
                              <span className={`sm:hidden inline-flex items-center justify-center w-3 w-3 h-3 h-3 text-[8px] font-extrabold rounded-full ${
                                morningStatus === 'present'
                                  ? 'bg-emerald-500 text-white'
                                  : morningStatus === 'leave_approved'
                                  ? 'bg-sky-505 bg-sky-550 bg-sky-500 text-white'
                                  : morningStatus === 'leave_pending'
                                  ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                                  : 'bg-rose-500 text-white'
                              }`} title={morningStatus === 'leave_approved' ? `Approved by ${record?.morningApprovedBy}` : morningStatus}>
                                {morningStatus === 'present' ? 'P' : morningStatus === 'leave_approved' ? 'L' : morningStatus === 'leave_pending' ? '?' : 'A'}
                              </span>
                            </>
                          ) : (
                            <span className="text-[7.5px] sm:text-[8px] text-slate-400 italic font-mono">-</span>
                          )}
                        </div>

                        {/* Night indicator */}
                        <div className="flex sm:flex-row flex-col items-center sm:justify-between justify-center gap-0.5 sm:gap-0">
                          <span className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-bold tracking-wider font-mono">N</span>
                          {nightStatus ? (
                            <>
                              {/* Desktop text pill */}
                              <span className={`hidden sm:inline-block text-[8.5px] font-bold rounded-lg px-2 py-0.5 border ${
                                nightStatus === 'present'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                  : nightStatus === 'leave_approved'
                                  ? 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900'
                                  : nightStatus === 'leave_pending'
                                  ? 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900'
                                  : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900'
                              }`} title={nightStatus === 'leave_approved' ? `Approved by ${record?.nightApprovedBy}` : nightStatus}>
                                {nightStatus === 'leave_approved' ? `Leave✓` : nightStatus === 'leave_pending' ? 'Pending' : nightStatus}
                              </span>
                              {/* Mobile circular badge */}
                              <span className={`sm:hidden inline-flex items-center justify-center w-3 w-3 h-3 h-3 text-[8px] font-extrabold rounded-full ${
                                nightStatus === 'present'
                                  ? 'bg-emerald-500 text-white'
                                  : nightStatus === 'leave_approved'
                                  ? 'bg-sky-500 text-white'
                                  : nightStatus === 'leave_pending'
                                  ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                                  : 'bg-rose-500 text-white'
                              }`} title={nightStatus === 'leave_approved' ? `Approved by ${record?.nightApprovedBy}` : nightStatus}>
                                {nightStatus === 'present' ? 'P' : nightStatus === 'leave_approved' ? 'L' : nightStatus === 'leave_pending' ? '?' : 'A'}
                              </span>
                            </>
                          ) : (
                            <span className="text-[7.5px] sm:text-[8px] text-slate-400 italic font-mono">-</span>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}

            </div>

          </div>

          {/* Right Summary Sidebar Info Panel */}
          <div className="sleek-card p-5 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-slate-505 dark:text-slate-350 uppercase tracking-widest font-mono">
                  Monthly Roll Report
                </h3>
                <p className="text-lg font-bold text-slate-950 dark:text-white mt-1">
                  {selectedStaff.name}
                </p>
                <span className="text-badge px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] font-bold mt-1 inline-block">
                  {selectedStaff.role} Specialist
                </span>
              </div>

              {/* Attendance metrics counts list */}
              <div className="space-y-3.5">
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    Shifts Worked (Present)
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    {totalPresentCount}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    Unexcused Absences
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    {totalAbsentCount}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-sky-500" />
                    Paid Approved Leaves
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    {totalApprovedCount}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Leaves Left Pending
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    {totalPendingCount}
                  </span>
                </div>

              </div>

              {/* Status color definitions legend */}
              <div className="bg-slate-50 dark:bg-slate-955 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-[9.5px] uppercase font-bold tracking-widest text-slate-400 font-mono">Legend Indices</p>
                
                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded border border-emerald-400"></span>
                  <span>Present / Worked</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded border border-rose-400"></span>
                  <span>Absent / Deducted</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-sky-500 rounded border border-sky-400"></span>
                  <span>Paid Approved Leave</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded border border-amber-400"></span>
                  <span>Awaiting Auth Review</span>
                </div>
              </div>

            </div>

            <p className="text-[10px] text-slate-400 text-center italic mt-6 leading-normal font-mono border-t border-slate-100 dark:border-slate-800 pt-4">
              Sunday logs are fully excluded from deduction equations.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
