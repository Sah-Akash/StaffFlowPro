import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Check, X, ShieldAlert, User, Award, PlusCircle, CalendarDays } from 'lucide-react';
import { Staff, AttendanceRecord, DayAttendance, ShiftStatus } from '../types';
import { calculateSalaryBreakdown, formatCurrency, getMonthStats } from '../utils';

interface HomeLogsPanelProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  onSaveDayAttendance: (staffId: string, dateStr: string, data: DayAttendance) => void;
  currentYear: number;
  currentMonth: number;
}

export default function HomeLogsPanel({
  staffList,
  attendance,
  onSaveDayAttendance,
  currentYear,
  currentMonth
}: HomeLogsPanelProps) {
  // Current selected logging date string (YYYY-MM-DD), default is today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Leave Request Form States
  const [requestStaffId, setRequestStaffId] = useState<string>(staffList[0]?.id || '');
  const [requestDate, setRequestDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [requestShift, setRequestShift] = useState<'morning' | 'night' | 'both'>('morning');
  const [requestNote, setRequestNote] = useState<string>('');
  const [showRequestForm, setShowRequestForm] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Helper to get formatted local date text for the selected date
  const getSelectedDateLabel = () => {
    try {
      const d = new Date(selectedDate);
      if (isNaN(d.getTime())) return selectedDate;
      return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  };

  // Helper to adjust the selected date by +/- 1 day
  const adjustDateByDays = (days: number) => {
    const baseDate = new Date(selectedDate);
    if (isNaN(baseDate.getTime())) return;
    baseDate.setDate(baseDate.getDate() + days);
    setSelectedDate(`${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`);
  };

  const isSelectedDateSunday = () => {
    try {
      return new Date(selectedDate).getDay() === 0;
    } catch {
      return false;
    }
  };

  // Quick toggle helper for Morning/Night shifts
  const toggleShiftValue = (staffId: string, shift: 'morning' | 'night') => {
    if (isSelectedDateSunday()) return; // Sunday is rest

    const existingRecord: DayAttendance = attendance[staffId]?.[selectedDate] || {
      morning: 'present',
      night: 'present'
    };

    const currentVal = existingRecord[shift];
    // Simple toggle between present and absent
    const newVal: ShiftStatus = currentVal === 'present' ? 'absent' : 'present';

    const updatedRecord: DayAttendance = {
      ...existingRecord,
      [shift]: newVal
    };

    // Clean up approvedBy if toggle changed
    if (shift === 'morning') updatedRecord.morningApprovedBy = undefined;
    if (shift === 'night') updatedRecord.nightApprovedBy = undefined;

    onSaveDayAttendance(staffId, selectedDate, updatedRecord);
  };

  // Submit Leave Request (Marks as leave_pending)
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestStaffId || !requestDate) return;

    const existingRecord: DayAttendance = attendance[requestStaffId]?.[requestDate] || {
      morning: 'present',
      night: 'present'
    };

    const updatedRecord: DayAttendance = { ...existingRecord };
    
    if (requestShift === 'morning' || requestShift === 'both') {
      updatedRecord.morning = 'leave_pending';
      updatedRecord.morningApprovedBy = undefined;
    }
    if (requestShift === 'night' || requestShift === 'both') {
      updatedRecord.night = 'leave_pending';
      updatedRecord.nightApprovedBy = undefined;
    }
    if (requestNote) {
      updatedRecord.note = requestNote;
    }

    onSaveDayAttendance(requestStaffId, requestDate, updatedRecord);

    setFormSuccess("Permission request submitted successfully! Pending approval from Akash, Alojyoti or Sumanta.");
    setRequestNote('');
    setTimeout(() => {
      setFormSuccess(null);
      setShowRequestForm(false);
    }, 4000);
  };

  // Find all leave_pending records across ALL staff and dates in memory
  interface PendingApprovalItem {
    staffId: string;
    staffName: string;
    role: string;
    dateStr: string;
    shift: 'morning' | 'night' | 'both';
    note?: string;
  }

  const getPendingApprovals = (): PendingApprovalItem[] => {
    const list: PendingApprovalItem[] = [];
    staffList.forEach(s => {
      const records = attendance[s.id] || {};
      Object.keys(records).forEach(dateStr => {
        const record = records[dateStr];
        if (!record) return;

        const morningPending = record.morning === 'leave_pending';
        const nightPending = record.night === 'leave_pending';

        if (morningPending && nightPending) {
          list.push({
            staffId: s.id,
            staffName: s.name,
            role: s.role,
            dateStr,
            shift: 'both',
            note: record.note
          });
        } else if (morningPending) {
          list.push({
            staffId: s.id,
            staffName: s.name,
            role: s.role,
            dateStr,
            shift: 'morning',
            note: record.note
          });
        } else if (nightPending) {
          list.push({
            staffId: s.id,
            staffName: s.name,
            role: s.role,
            dateStr,
            shift: 'night',
            note: record.note
          });
        }
      });
    });

    // Sort by date descending
    return list.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  };

  const pendingApprovals = getPendingApprovals();

  // Approve leave handler
  const handleApproveLeave = (
    staffId: string, 
    dateStr: string, 
    shift: 'morning' | 'night' | 'both', 
    approver: 'Akash' | 'Alojyoti' | 'Sumanta'
  ) => {
    const existing = attendance[staffId]?.[dateStr] || { morning: 'present', night: 'present' };
    const updated = { ...existing };

    if (shift === 'morning' || shift === 'both') {
      updated.morning = 'leave_approved';
      updated.morningApprovedBy = approver;
    }
    if (shift === 'night' || shift === 'both') {
      updated.night = 'leave_approved';
      updated.nightApprovedBy = approver;
    }

    onSaveDayAttendance(staffId, dateStr, updated);
  };

  // Reject / Deny leave handler (marks as absent)
  const handleRejectLeave = (staffId: string, dateStr: string, shift: 'morning' | 'night' | 'both') => {
    const existing = attendance[staffId]?.[dateStr] || { morning: 'present', night: 'present' };
    const updated = { ...existing };

    if (shift === 'morning' || shift === 'both') {
      updated.morning = 'absent';
      updated.morningApprovedBy = undefined;
    }
    if (shift === 'night' || shift === 'both') {
      updated.night = 'absent';
      updated.nightApprovedBy = undefined;
    }

    onSaveDayAttendance(staffId, dateStr, updated);
  };

  return (
    <div className="space-y-6">
      
      {/* 3-Column Top Panel: Toggles + Live Earned + Leave approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Date log, Shifts toggle & Permission Request trigger */}
        <div className="lg:col-span-7 sleek-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Header with quick date selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-indigo-505 text-indigo-500" />
                  Daily Shift Log
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Toggle morning & night shifts to log attendance</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => adjustDateByDays(-1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition active:scale-95 cursor-pointer"
                >
                  ◀
                </button>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }} 
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono hover:border-indigo-400 dark:hover:border-indigo-500"
                />
                <button 
                  onClick={() => adjustDateByDays(1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition active:scale-95 cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Display active selected date */}
            <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-200/20 dark:border-indigo-500/20 p-2.5 rounded-xl text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono flex items-center justify-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Viewing: {getSelectedDateLabel()}
              {isSelectedDateSunday() && <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-450 rounded-full text-[10px]">Rest Day (Sunday)</span>}
            </div>

            {/* Toggles Container */}
            {isSelectedDateSunday() ? (
              <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-100 dark:border-slate-850 rounded-xl">
                ☕ Today is Sunday. Regular personnel shifts are off. Weekly summary will skip weekly off days.
              </div>
            ) : (
              <div className="space-y-4">
                {staffList.map(member => {
                  const record = attendance[member.id]?.[selectedDate] || { morning: 'present', night: 'present' };
                  
                  return (
                    <div key={member.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition duration-150">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Member Details */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-extrabold text-slate-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{member.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{member.role} specialist • {formatCurrency(member.monthlySalary)} /mo</p>
                          </div>
                        </div>

                        {/* Shift Toggles */}
                        <div className="flex flex-wrap gap-3">
                          
                          {/* Morning shift pill toggle */}
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Morning Shift</span>
                            <button
                              onClick={() => toggleShiftValue(member.id, 'morning')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border hover:scale-102 hover:shadow-xs ${
                                record.morning === 'present'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                                  : record.morning === 'leave_approved'
                                  ? 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-305 dark:border-sky-500/30'
                                  : record.morning === 'leave_pending'
                                  ? 'bg-amber-505 bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-305 dark:border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-305 dark:border-rose-500/30'
                              }`}
                            >
                              {record.morning === 'present' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-505" />}
                              {record.morning === 'absent' && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                              {record.morning === 'leave_pending' && <Clock className="h-3.5 w-3.5 animate-pulse text-amber-505" />}
                              {record.morning === 'leave_approved' && <Award className="h-3.5 w-3.5 text-sky-505" />}

                              <span className="capitalize">
                                {record.morning === 'leave_pending' ? 'Leave Pending' : record.morning === 'leave_approved' ? 'Paid Leave' : record.morning}
                              </span>
                            </button>
                            {record.morningApprovedBy && (
                              <span className="text-[9px] text-sky-600 dark:text-sky-400 font-mono font-semibold">By: {record.morningApprovedBy}</span>
                            )}
                          </div>

                          {/* Night shift pill toggle */}
                          <div className="flex flex-col gap-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Night Shift</span>
                            <button
                              onClick={() => toggleShiftValue(member.id, 'night')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border hover:scale-102 hover:shadow-xs ${
                                record.night === 'present'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                                  : record.night === 'leave_approved'
                                  ? 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-305 dark:border-sky-500/30'
                                  : record.night === 'leave_pending'
                                  ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-305 dark:border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                              }`}
                            >
                              {record.night === 'present' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-505" />}
                              {record.night === 'absent' && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                              {record.night === 'leave_pending' && <Clock className="h-3.5 w-3.5 animate-pulse text-amber-505" />}
                              {record.night === 'leave_approved' && <Award className="h-3.5 w-3.5 text-sky-505" />}

                              <span className="capitalize">
                                {record.night === 'leave_pending' ? 'Leave Pending' : record.night === 'leave_approved' ? 'Paid Leave' : record.night}
                              </span>
                            </button>
                            {record.nightApprovedBy && (
                              <span className="text-[9px] text-sky-600 dark:text-sky-400 font-mono font-semibold">By: {record.nightApprovedBy}</span>
                            )}
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Leave Request Form Toggle */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-6 flex justify-between items-center gap-4">
            <span className="text-xs text-slate-400">Need an extra day off or leave permission request?</span>
            <button 
              onClick={() => {
                setShowRequestForm(!showRequestForm);
                setFormSuccess(null);
              }}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-600" />
              {showRequestForm ? "Cancel Request" : "Request Leave Taken"}
            </button>
          </div>

          {/* Interactive Leave Taker Request Form */}
          {showRequestForm && (
            <div className="mt-4 p-4 rounded-xl border border-dashed border-indigo-150 bg-indigo-50/15 dark:bg-indigo-950/10 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-indigo-400 uppercase tracking-tight">Record Leave Request (Requires Approval)</h3>
              
              {formSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs leading-normal">
                  ✓ {formSuccess}
                </div>
              )}

              <form onSubmit={handleRequestLeave} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Staff Member</label>
                    <select
                      value={requestStaffId}
                      onChange={(e) => setRequestStaffId(e.target.value)}
                      className="mt-1 w-full p-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden"
                    >
                      {staffList.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Leave Date</label>
                    <input
                      type="date"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      className="mt-1 w-full p-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Shift Target</label>
                    <select
                      value={requestShift}
                      onChange={(e) => setRequestShift(e.target.value as any)}
                      className="mt-1 w-full p-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden"
                    >
                      <option value="morning">Morning Shift only</option>
                      <option value="night">Night Shift only</option>
                      <option value="both">Both Shifts (Full Day)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Reason for Leave</label>
                  <input
                    type="text"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g. Health emergency, Urgent travels"
                    className="mt-1 w-full p-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Submit for Approval to Akash/Alojyoti/Sumanta
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right 5 Columns: Dynamic Salaries Generated so Far + Approval queue */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Earnings card: money generated till date on a daily basis */}
          <div className="sleek-card p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-3 flex items-center gap-1.5 font-display">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-sm shadow-emerald-500/50"></span>
                Daily Earnings Meter
              </h2>
              <p className="text-[11px] text-slate-400 mb-4">Calculated in real-time according to shifts logged so far this month.</p>
              
              <div className="space-y-4">
                {staffList.map(member => {
                  const stat = calculateSalaryBreakdown(member, attendance[member.id] || {}, currentYear, currentMonth);
                  
                  // Percentage of working shifts completed out of total working shifts
                  const percentOfSalary = member.monthlySalary > 0 
                    ? (stat.salaryEarned / member.monthlySalary) * 100 
                    : 100;

                  return (
                    <div key={member.id} className="p-3 bg-slate-50/55 dark:bg-slate-950/25 border border-slate-100/50 dark:border-slate-950/50 rounded-xl space-y-2">
                       <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-205">{member.name}</p>
                          <p className="text-[10px] text-slate-400">{member.role} • worked {stat.presentShifts} shifts</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm font-mono">{formatCurrency(stat.salaryEarned)}</p>
                          <p className="text-[9.5px] text-slate-400">of {formatCurrency(member.monthlySalary)} base</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar representation */}
                      <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, percentOfSalary)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                        <span>Month Complete: {percentOfSalary.toFixed(0)}%</span>
                        <span>{formatCurrency(stat.perShiftRate)} per shift rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Admin Permission-Leave Review Approval Queue Widget */}
          <div className="sleek-card p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5 label-admin-approvals">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Admin Approvals
                </h2>
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
                  {pendingApprovals.length} Needed
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Official leaves must be authorized by Akash, Alojyoti or Sumanta. Approved leaves are counted as fully paid.</p>

              {pendingApprovals.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5">
                  <Check className="h-8 w-8 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-full" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Perfectly Clean!</p>
                  <p className="text-[10px] text-slate-400">All requested leave permissions have been authorized.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {pendingApprovals.map((req, idx) => {
                    const formattedDate = (() => {
                      try {
                        return new Date(req.dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      } catch {
                        return req.dateStr;
                      }
                    })();

                    return (
                      <div key={idx} className="p-3 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[9px] font-bold rounded uppercase">
                              PENDING LEAVE
                            </span>
                            <p className="font-bold text-slate-950 dark:text-slate-200 text-xs mt-1.5">
                              {req.staffName} ({req.role})
                            </p>
                            <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                              {formattedDate} • <span className="capitalize">{req.shift} shift</span>
                            </p>
                            {req.note && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 italic bg-amber-500/10 dark:bg-amber-950/30 p-1.5 rounded-md mt-1 leading-normal">
                                Reason: "{req.note}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interactive Approvers Selection Grid */}
                        <div className="space-y-1.5">
                          <p className="text-[9.5px] text-slate-400 font-medium uppercase">Select Admin for Paid Approval:</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['Akash', 'Alojyoti', 'Sumanta'] as const).map(adminName => (
                              <button
                                key={adminName}
                                onClick={() => handleApproveLeave(req.staffId, req.dateStr, req.shift, adminName)}
                                className="py-1 bg-white hover:bg-slate-55 bg-indigo-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px] font-bold transition-all cursor-pointer"
                              >
                                {adminName}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => handleRejectLeave(req.staffId, req.dateStr, req.shift)}
                            className="w-full mt-1.5 py-1 text-center bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border border-rose-200/40"
                          >
                            <X className="h-3 w-3" />
                            Deny & Deduct Salary (Absent)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
