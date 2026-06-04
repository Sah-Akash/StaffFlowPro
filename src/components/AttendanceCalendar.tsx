import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, X, Filter, Sparkles, Plus, AlertCircle, FileText, Bookmark, CalendarIcon } from 'lucide-react';
import { Staff, AttendanceRecord, DayAttendance, ShiftStatus } from '../types';
import { getCalendarDays, MONTHS, getMonthStats } from '../utils';

interface AttendanceCalendarProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
  onSaveDayAttendance: (staffId: string, dateStr: string, data: DayAttendance) => void;
}

export default function AttendanceCalendar({
  staffList,
  attendance,
  currentYear,
  currentMonth,
  onMonthChange,
  onSaveDayAttendance
}: AttendanceCalendarProps) {
  // Navigation states
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Filters state
  const [filterStaffId, setFilterStaffId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'partial' | 'unmarked'>('all');

  // Sidebar detail states for the selected date
  const [morningStatusMap, setMorningStatusMap] = useState<Record<string, ShiftStatus>>({});
  const [nightStatusMap, setNightStatusMap] = useState<Record<string, ShiftStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Dynamic calendar dates
  const calendarDays = getCalendarDays(currentYear, currentMonth);

  // Month navigation
  const nextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(currentYear + 1, 0);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(currentYear - 1, 11);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const handleDaySelect = (dateStr: string, isSunday: boolean) => {
    if (isSunday) return; // Sundays are offs
    
    setSelectedDateStr(dateStr);
    
    // Pre-populate editor maps
    const newMorning: Record<string, ShiftStatus> = {};
    const newNight: Record<string, ShiftStatus> = {};
    const newNotes: Record<string, string> = {};

    staffList.forEach(s => {
      const dayData = attendance[s.id]?.[dateStr];
      newMorning[s.id] = dayData?.morning || 'present';
      newNight[s.id] = dayData?.night || 'present';
      newNotes[s.id] = dayData?.note || '';
    });

    setMorningStatusMap(newMorning);
    setNightStatusMap(newNight);
    setNotesMap(newNotes);
  };

  const handleSaveDay = () => {
    if (!selectedDateStr) return;
    
    staffList.forEach(s => {
      onSaveDayAttendance(s.id, selectedDateStr, {
        morning: morningStatusMap[s.id] || 'present',
        night: nightStatusMap[s.id] || 'present',
        note: notesMap[s.id]?.trim() || undefined
      });
    });

    setSelectedDateStr(null);
  };

  const handleQuickMarkPresent = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering open modal
    
    // Quick mark both shifts as present for both staff
    staffList.forEach(s => {
      onSaveDayAttendance(s.id, dateStr, { morning: 'present', night: 'present' });
    });
  };

  // Quick mark everyone present for Today helper
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isTodayInSelectedMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  // Render cell status tags for a given date
  const getDateStatusAndColorCount = (dateStr: string) => {
    let presentCount = 0;
    let absentCount = 0;
    let unmarkedCount = 0;
    let partialCount = 0;

    const targetedStaffIds = filterStaffId === 'all' ? staffList.map(s => s.id) : [filterStaffId];

    targetedStaffIds.forEach(staffId => {
      const records = attendance[staffId]?.[dateStr];
      if (!records) {
        unmarkedCount++;
      } else {
        const morningAbsent = records.morning === 'absent';
        const nightAbsent = records.night === 'absent';

        if (morningAbsent && nightAbsent) {
          absentCount++;
        } else if (!morningAbsent && !nightAbsent) {
          presentCount++;
        } else {
          partialCount++;
        }
      }
    });

    return { presentCount, absentCount, partialCount, unmarkedCount };
  };

  // Standard Weekday titles matching localized indices
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Start offset: find which day of week the 1st of the month starts on
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div id="attendance-calendar-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Calendar Grid Section */}
      <div className="lg:col-span-2 sleek-card border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between space-y-6">
        
        {/* Calendar Nav & Filters Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg leading-none">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Household attendance calendar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl border border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onMonthChange(new Date().getFullYear(), new Date().getMonth())}
                className="px-3.5 py-1.5 rounded-xl border border-gray-150 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors cursor-pointer"
              >
                Today
              </button>
              
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl border border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Real-time search filters dashboard bar */}
          <div className="p-3.5 rounded-xl bg-gray-55/70 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-405 text-gray-500 font-semibold font-mono">
              <Filter className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>Filters</span>
            </div>

            {/* Filter staff */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-401 text-gray-400 font-bold uppercase font-mono">Staff:</span>
              <select
                value={filterStaffId}
                onChange={(e) => setFilterStaffId(e.target.value)}
                className="text-xs p-1.5 pr-6 rounded-lg border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[130px] font-medium"
              >
                <option value="all">Combined (All)</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-401 text-gray-400 font-bold uppercase font-mono">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-xs p-1.5 pr-6 rounded-lg border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Show All Days</option>
                <option value="present">Fully Present Days</option>
                <option value="absent">Fully Absent Days</option>
                <option value="partial">Partial Miss Days</option>
                <option value="unmarked">Unmarked Days</option>
              </select>
            </div>

            {/* Today quick check alert */}
            {isTodayInSelectedMonth && (
              <button
                type="button"
                onClick={(e) => handleQuickMarkPresent(todayStr, e)}
                className="ml-auto text-[10px] shrink-0 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer transition-colors"
                title="Saves Present-Present for everyone today"
              >
                <Sparkles className="h-3 w-3" />
                Quick Today Present
              </button>
            )}
          </div>
        </div>

        {/* The Calendar Grid */}
        <div className="space-y-2">
          {/* Calendar weekdays header */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekdays.map(day => (
              <span
                key={day}
                className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                  day === 'Sun' ? 'text-rose-400 dark:text-rose-455' : 'text-gray-400'
                }`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Pad the month start */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-55/20 dark:bg-gray-950/20 rounded-xl" />
            ))}

            {calendarDays.map(day => {
              const { presentCount, absentCount, partialCount, unmarkedCount } = getDateStatusAndColorCount(day.dateStr);
              
              // Filter logic out if status fit
              let isFilteredOut = false;
              if (filterStatus === 'present' && presentCount === 0) isFilteredOut = true;
              if (filterStatus === 'absent' && absentCount === 0) isFilteredOut = true;
              if (filterStatus === 'partial' && partialCount === 0) isFilteredOut = true;
              if (filterStatus === 'unmarked' && unmarkedCount === 0) isFilteredOut = true;
              
              if (day.isSunday && filterStatus !== 'all') isFilteredOut = true;

              // Color determination
              let cellClass = "border-gray-150/80 dark:border-gray-800 bg-white dark:bg-gray-900";
              let badgeDot = "bg-transparent";

              if (day.isSunday) {
                cellClass = "bg-gray-100 dark:bg-gray-950 border-transparent text-gray-400";
              } else if (unmarkedCount > 0 && presentCount === 0 && absentCount === 0 && partialCount === 0) {
                // Completely unmarked
                cellClass = "border-dashed border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-solid";
              } else if (absentCount > 0 && presentCount === 0 && partialCount === 0) {
                // Everyone absent or focused staff absent
                cellClass = "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40 text-rose-800 dark:text-rose-300";
                badgeDot = "bg-rose-500 animate-pulse";
              } else if (partialCount > 0 || (presentCount > 0 && absentCount > 0)) {
                // Mixed statuses or dynamic partials
                cellClass = "bg-amber-50/50 dark:bg-amber-955/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300";
                badgeDot = "bg-amber-500";
              } else {
                // Present and accounted for
                cellClass = "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300";
                badgeDot = "bg-emerald-500";
              }

              return (
                <div
                  key={day.dateStr}
                  onClick={() => handleDaySelect(day.dateStr, day.isSunday)}
                  className={`aspect-square border rounded-xl p-1.5 flex flex-col justify-between transition-all select-none relative group ${cellClass} ${
                    day.isSunday ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-xs hover:scale-101'
                  } ${isFilteredOut ? 'opacity-25' : 'opacity-100'}`}
                >
                  {/* Day counter + Badge indicator */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold ${day.isToday ? 'bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center -m-1' : ''}`}>
                      {day.dayNumber}
                    </span>
                    {!day.isSunday && <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />}
                  </div>

                  {/* Cell interactive labels or notes hover */}
                  {!day.isSunday && (
                    <div className="hidden sm:flex flex-col gap-0.5 pointer-events-none mt-1">
                      {filterStaffId === 'all' ? (
                        staffList.map(s => {
                          const dayData = attendance[s.id]?.[day.dateStr];
                          const mLabel = dayData?.morning === 'absent' ? 'M❌' : '';
                          const nLabel = dayData?.night === 'absent' ? 'N❌' : '';
                          if (!mLabel && !nLabel) return null;
                          return (
                            <span key={s.id} className="text-[7.5px] font-mono text-gray-500 block truncate">
                              {s.name.split(' ')[0]}: {mLabel} {nLabel}
                            </span>
                          );
                        })
                      ) : (
                        (() => {
                          const dayData = attendance[filterStaffId]?.[day.dateStr];
                          if (!dayData) return null;
                          return (
                            <div className="space-y-0.5">
                              {dayData.morning === 'absent' && <span className="text-[7px] font-semibold bg-rose-100 dark:bg-rose-950 px-1 py-0.2 rounded text-rose-600 font-mono">M. Missed</span>}
                              {dayData.night === 'absent' && <span className="text-[7px] font-semibold bg-rose-100 dark:bg-rose-950 px-1 py-0.2 rounded text-rose-600 font-mono">N. Missed</span>}
                              {dayData.note && <span className="text-[7px] italic text-gray-400 block truncate leading-tight">💬 {dayData.note}</span>}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}

                  {/* Mobile responsive Quick Tick icon */}
                  {!day.isSunday && unmarkedCount > 0 && (
                    <button
                      onClick={(e) => handleQuickMarkPresent(day.dateStr, e)}
                      className="absolute bottom-1 right-1 p-0.5 rounded bg-indigo-50 dark:bg-indigo-950 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs cursor-pointer border border-indigo-100"
                      title="Quick mark present"
                    >
                      <Check className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend block at container footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex flex-wrap justify-between items-center text-[10px] text-gray-400 font-mono gap-y-2">
          <span>* Select any working cell to edit logs or add absence notes.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500/80" /> Fully Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500/80" /> Partially Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-rose-500/80" /> Fully Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-gray-200 dark:bg-gray-800" /> Weekend Off
            </span>
          </div>
        </div>

      </div>

      {/* Editor Drawer Panel on select cell */}
      <AnimatePresence>
        {selectedDateStr && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="sleek-card border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between max-h-[600px] no-print"
          >
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-display font-semibold text-slate-800 dark:text-gray-50 text-base">
                    Log Shift Attendance
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono font-medium mt-1">
                    Date: {new Date(selectedDateStr).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Roster form inputs */}
              <div className="space-y-5 overflow-y-auto max-h-[380px] pr-1">
                {staffList.map(staff => {
                  const mVal = morningStatusMap[staff.id] || 'present';
                  const nVal = nightStatusMap[staff.id] || 'present';
                  const noteVal = notesMap[staff.id] || '';

                  return (
                    <div
                      key={staff.id}
                      className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-55/20 dark:bg-gray-950/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                          {staff.name} <span className="font-normal font-mono text-[10px] text-gray-400">({staff.role})</span>
                        </span>
                      </div>

                      {/* Shifts triggers */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Morning shift selectors */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-450 uppercase font-mono font-semibold">Morning Shift</span>
                          <div className="grid grid-cols-2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shrink-0">
                            <button
                              id={`edit-${staff.id}-morning-present`}
                              type="button"
                              onClick={() => setMorningStatusMap({ ...morningStatusMap, [staff.id]: 'present' })}
                              className={`py-1 rounded-l text-center font-semibold text-[10px] cursor-pointer ${
                                mVal === 'present'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              id={`edit-${staff.id}-morning-absent`}
                              type="button"
                              onClick={() => setMorningStatusMap({ ...morningStatusMap, [staff.id]: 'absent' })}
                              className={`py-1 rounded-r text-center font-semibold text-[10px] cursor-pointer ${
                                mVal === 'absent'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>

                        {/* Night Shift selectors */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-450 uppercase font-mono font-semibold">Night Shift</span>
                          <div className="grid grid-cols-2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shrink-0">
                            <button
                              id={`edit-${staff.id}-night-present`}
                              type="button"
                              onClick={() => setNightStatusMap({ ...nightStatusMap, [staff.id]: 'present' })}
                              className={`py-1 rounded-l text-center font-semibold text-[10px] cursor-pointer ${
                                nVal === 'present'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              id={`edit-${staff.id}-night-absent`}
                              type="button"
                              onClick={() => setNightStatusMap({ ...nightStatusMap, [staff.id]: 'absent' })}
                              className={`py-1 rounded-r text-center font-semibold text-[10px] cursor-pointer ${
                                nVal === 'absent'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notes row */}
                      <div className="space-y-1">
                        <span className="text-[9.5px] text-gray-400 font-bold uppercase font-mono">Absence Note (Optional)</span>
                        <input
                          id={`edit-${staff.id}-note`}
                          type="text"
                          placeholder="Family emergency, Sick leave..."
                          value={noteVal}
                          onChange={(e) => setNotesMap({ ...notesMap, [staff.id]: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Foot save actions */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                id="save-shifts-btn"
                onClick={handleSaveDay}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Save Attendance
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
