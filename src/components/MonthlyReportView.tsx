import React, { useState } from 'react';
import { Staff, AttendanceRecord, DayAttendance, SalaryBreakdown } from '../types';
import { calculateSalaryBreakdown, formatCurrency, MONTHS } from '../utils';
import { FileText, TrendingUp, DollarSign, Calendar, Users, Percent, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MonthlyReportViewProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
}

export default function MonthlyReportView({
  staffList,
  attendance,
  currentYear,
  currentMonth,
  onMonthChange
}: MonthlyReportViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // Generate list of months for selection
  const handleMonthChangeSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    setSelectedMonth(val);
    onMonthChange(selectedYear, val);
  };

  const handleYearChangeSubmit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    setSelectedYear(val);
    onMonthChange(val, selectedMonth);
  };

  // 1st Month Pay Summary Breakdowns
  const reportBreakdowns = staffList.map(member => 
    calculateSalaryBreakdown(member, attendance[member.id] || {}, selectedYear, selectedMonth)
  );

  // Get previous month to compute Month-on-Month comparison
  const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  const prevMonthBreakdowns = staffList.map(member => 
    calculateSalaryBreakdown(member, attendance[member.id] || {}, prevYear, prevMonthIndex)
  );

  // Aggregated monthly metrics
  const totalPayrollCost = reportBreakdowns.reduce((sum, item) => sum + item.finalPayable, 0);
  const totalBaseSalary = reportBreakdowns.reduce((sum, item) => sum + item.monthlySalary, 0);
  const averageAttendance = reportBreakdowns.length > 0
    ? reportBreakdowns.reduce((sum, item) => sum + item.attendancePercentage, 0) / reportBreakdowns.length
    : 100;

  const prevTotalPayrollCost = prevMonthBreakdowns.reduce((sum, item) => sum + item.finalPayable, 0);
  const prevAverageAttendance = prevMonthBreakdowns.length > 0
    ? prevMonthBreakdowns.reduce((sum, item) => sum + item.attendancePercentage, 0) / prevMonthBreakdowns.length
    : 100;

  // Percentage differences
  const payrollChange = prevTotalPayrollCost > 0 
    ? ((totalPayrollCost - prevTotalPayrollCost) / prevTotalPayrollCost) * 100 
    : 0;

  const attendanceChange = averageAttendance - prevAverageAttendance;

  return (
    <div className="space-y-6">
      
      {/* Month Year Filter selectors */}
      <div className="p-5 sleek-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-indigo-605 text-indigo-600" />
              1st of Month Paysheet & Ledger
            </h2>
            <p className="text-xs text-slate-400">Payroll, days worked audit, and Month-on-Month relative comparisons</p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500 font-mono">Select Payroll Month:</span>
            
            <select
              value={selectedMonth}
              onChange={handleMonthChangeSubmit}
              className="p-2 text-xs border border-slate-205 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden"
            >
              {MONTHS.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChangeSubmit}
              className="p-2 text-xs border border-slate-205 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* MoM (Month-on-Month) High Level Stats Box Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cost Card */}
        <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Gross Payable Wages</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {formatCurrency(totalPayrollCost)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              {payrollChange <= 0 ? (
                <span className="text-emerald-650 dark:text-emerald-400 font-bold font-mono flex items-center">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {payrollChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-rose-650 dark:text-rose-400 font-bold font-mono flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{payrollChange.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400">vs last month ({formatCurrency(prevTotalPayrollCost)})</span>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Avg Attendance Rate</span>
            <Percent className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {averageAttendance.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              {attendanceChange >= 0 ? (
                <span className="text-emerald-650 dark:text-emerald-400 font-bold font-mono flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +{attendanceChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-rose-655 dark:text-rose-400 font-bold font-mono flex items-center">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {attendanceChange.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400">vs last month ({prevAverageAttendance.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Personnel Card */}
        <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Total Salary Saved</span>
            <TrendingUp className="h-5 w-5 text-sky-505 text-sky-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {formatCurrency(totalBaseSalary - totalPayrollCost)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">Deductions retrieved from missed, unapproved shift logs</p>
          </div>
        </div>

      </div>

      {/* Main Breakdown Sheet */}
      <div className="sleek-card overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm uppercase tracking-tight">
            Official Paycheck Overview (As of 1st of next month)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Summary of total days worked and calculations for exact paysheets</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-505 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800">Staff Member</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">Available Work Days</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">Worked Shifts</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">Approved Paid Leaves</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">Unapproved Absences</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-right">Base wages</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-right">Total Deductions</th>
                <th className="p-4 border-b border-slate-100 dark:border-slate-800 text-right text-indigo-650 dark:text-indigo-400">Net To Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {reportBreakdowns.map((stat, idx) => {
                const prev = prevMonthBreakdowns.find(p => p.staffId === stat.staffId);
                
                // Estimate approved leaves counts for current staff in memory
                // Total unapproved missed shifts is stat.missedShifts (determined as 'absent' or 'leave_pending' in our formula)
                // Let's count how many leaves actually are marked as 'leave_approved' inside attendance list for the selected month:
                const records = attendance[stat.staffId] || {};
                let approvedLeavesCount = 0;
                Object.keys(records).forEach(dStr => {
                  const d = new Date(dStr);
                  if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
                    const rec = records[dStr];
                    if (rec) {
                      if (rec.morning === 'leave_approved') approvedLeavesCount++;
                      if (rec.night === 'leave_approved') approvedLeavesCount++;
                    }
                  }
                });

                return (
                  <tr key={stat.staffId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    
                    <td className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-slate-150 text-sm">{stat.staffName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.role} Specialist</p>
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-mono font-semibold">
                      {stat.totalWorkingDays} Days
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-mono font-bold text-emerald-650 dark:text-emerald-400">
                      {stat.presentShifts - approvedLeavesCount} Shifts
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-mono font-bold text-sky-600 dark:text-sky-400">
                      {approvedLeavesCount} Shifts
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-mono font-bold text-rose-500">
                      {stat.missedShifts} Shifts
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatCurrency(stat.monthlySalary)}
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-right font-mono text-rose-600 dark:text-rose-400 font-bold">
                      -{formatCurrency(stat.deductions)}
                    </td>

                    <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-right font-mono font-bold text-indigo-650 dark:text-indigo-405 text-slate-950 dark:text-white text-sm bg-indigo-500/5 dark:bg-indigo-400/5">
                      {formatCurrency(stat.finalPayable)}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Month-on-Month Trends Analysis Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Presence and Shifts Rate Comparison Card */}
        <div className="p-5 sleek-card">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-tight mb-4">Shifts Completion Trend (MoM)</h3>
          
          <div className="space-y-5">
            {staffList.map(member => {
              const currentStat = reportBreakdowns.find(s => s.staffId === member.id);
              const prevStat = prevMonthBreakdowns.find(s => s.staffId === member.id);

              const currRate = currentStat ? currentStat.attendancePercentage : 0;
              const prevRate = prevStat ? prevStat.attendancePercentage : 0;

              return (
                <div key={member.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-250">{member.name} ({member.role})</span>
                    <span className="text-slate-400 text-[10px]">Goal: 100%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Previous Month progress */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
                        Previous Month ({prevMonthIndex + 1}/{prevYear})
                      </p>
                      <p className="text-base font-extrabold text-slate-700 dark:text-slate-350 font-mono">{prevRate}%</p>
                      <div className="w-full bg-slate-205 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${prevRate}%` }}></div>
                      </div>
                    </div>

                    {/* Selected Active Month progress */}
                    <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100/50 rounded-xl space-y-1">
                      <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-mono uppercase tracking-wider font-semibold">
                        Selected Month ({selectedMonth + 1}/{selectedYear})
                      </p>
                      <p className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 font-mono">{currRate}%</p>
                      <div className="w-full bg-slate-205 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${currRate}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg italic">
                    {currRate >= prevRate 
                      ? `📈 Great! Shift attendance grew by +${(currRate - prevRate).toFixed(1)}% compared to the previous period.` 
                      : `📉 Notice: Attendance dropped by ${(prevRate - currRate).toFixed(1)}% compared to last month.`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Salary Budget Comparison Card */}
        <div className="p-5 sleek-card">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-tight mb-4">Household Salary Outlay Trend (MoM)</h3>
          
          <div className="space-y-6">
            
            <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Outlay (Previous Month)</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{formatCurrency(prevTotalPayrollCost)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Outlay (Selected Month)</span>
                <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold text-sm">{formatCurrency(totalPayrollCost)}</span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-indigo-400 h-full" 
                  style={{ width: `${prevTotalPayrollCost > 0 ? (prevTotalPayrollCost / Math.max(1, prevTotalPayrollCost + totalPayrollCost)) * 100 : 50}%` }}
                ></div>
                <div 
                  className="bg-indigo-600 h-full" 
                  style={{ width: `${totalPayrollCost > 0 ? (totalPayrollCost / Math.max(1, prevTotalPayrollCost + totalPayrollCost)) * 100 : 50}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                <span>◀ Left: Last Month (Prev)</span>
                <span>Right: This Month (Curr) ▶</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/10 border border-indigo-100/40 rounded-xl">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">💡 Savings Summary Insights</h4>
              <p className="text-[10.5px] text-slate-505 dark:text-slate-400 leading-normal">
                Based on unexcused absences, your household saved <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalBaseSalary - totalPayrollCost)}</span> in deductions this active period. Authorized leave permissions approved by Akash, Alojyoti or Sumanta carried no wage penalties.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
