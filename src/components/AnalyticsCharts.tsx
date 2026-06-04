import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, DollarSign, Clock, Users } from 'lucide-react';
import { SalaryBreakdown, Staff, AttendanceRecord } from '../types';
import { formatCurrency } from '../utils';

interface AnalyticsChartsProps {
  salaryBreakdowns: SalaryBreakdown[];
  staffList: Staff[];
  attendance: AttendanceRecord;
  currentYear: number;
  currentMonth: number;
}

export default function AnalyticsCharts({
  salaryBreakdowns,
  staffList,
  attendance,
  currentYear,
  currentMonth
}: AnalyticsChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredPie, setHoveredPie] = useState<string | null>(null);

  // Generate data for charts
  const totalSalaries = salaryBreakdowns.reduce((acc, curr) => acc + curr.monthlySalary, 0);
  const totalPayable = salaryBreakdowns.reduce((acc, curr) => acc + curr.finalPayable, 0);
  const totalDeductions = salaryBreakdowns.reduce((acc, curr) => acc + curr.deductions, 0);

  // Get attendance trends (simulation of the past 5 months or current weeks)
  // Let's create a realistic 6-month historical overview based on the current month selection
  const historicalAttendance = [
    { month: 'Jan', cook: 98.1, cleaner: 96.2, deductions: 400 },
    { month: 'Feb', cook: 94.2, cleaner: 93.3, deductions: 1200 },
    { month: 'Mar', cook: 100, cleaner: 98.1, deductions: 200 },
    { month: 'Apr', cook: 96.5, cleaner: 92.4, deductions: 1500 },
    { month: 'May', cook: 97.2, cleaner: 94.5, deductions: 800 },
    // Fill the last entry dynamically with the live calculated data for the current month!
    {
      month: 'Current',
      cook: salaryBreakdowns.find(s => s.role === 'Cooking')?.attendancePercentage || 100,
      cleaner: salaryBreakdowns.find(s => s.role === 'Cleaning')?.attendancePercentage || 100,
      deductions: totalDeductions
    }
  ];

  // Colors
  const colors = {
    cook: {
      primary: '#6366f1', // Indigo
      light: '#e0e7ff',
      dark: '#312e81'
    },
    cleaner: {
      primary: '#14b8a6', // Teal
      light: '#ccfbf1',
      dark: '#115e59'
    }
  };

  return (
    <div id="analytics-section-bento" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Chart 1: Attendance Percentage Comparison Ring (circular donut progress) */}
      <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Staff Attendance Comparison
            </h4>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-mono">Month-to-Date Performance</p>
          </div>
          <Users className="h-4 w-4 text-indigo-500" />
        </div>

        <div className="flex items-center justify-around py-4">
          {salaryBreakdowns.map(staff => {
            const isCook = staff.role === 'Cooking';
            const color = isCook ? colors.cook.primary : colors.cleaner.primary;
            const percentage = staff.attendancePercentage;
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div key={staff.staffId} className="flex flex-col items-center gap-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Circular SVG Tracker */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      className="stroke-gray-100 dark:stroke-gray-800 fill-none"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r={radius}
                      style={{ stroke: color }}
                      className="fill-none stroke-round"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-display font-bold text-gray-900 dark:text-gray-100 leading-none">
                      {percentage}%
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium font-sans mt-0.5">
                      {staff.role}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {staff.staffName}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {staff.presentShifts} / {staff.totalShifts} shifts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center gap-4 text-[10px] text-gray-500 font-sans">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Cooking Staff
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            Cleaning Staff
          </span>
        </div>
      </div>

      {/* Chart 2: Cumulative Missed Shifts Trends (Interactive SVG Bar Chart) */}
      <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Absence Frequency Heatmap
            </h4>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-mono">Deductions per Staff</p>
          </div>
          <Clock className="h-4 w-4 text-teal-500" />
        </div>

        {/* Bar chart canvas */}
        <div className="flex items-end justify-between h-36 px-2 pr-6">
          {salaryBreakdowns.map((staff, idx) => {
            const isCook = staff.role === 'Cooking';
            const heightPercentage = Math.max(8, Math.min(100, (staff.missedShifts / 10) * 100)); // Scaled max 10 absences

            return (
              <div
                key={staff.staffId}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                onMouseEnter={() => setHoveredBar(staff.staffId)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Custom Label Bubble on Hover */}
                {hoveredBar === staff.staffId && (
                  <div className="absolute -top-12 bg-gray-900 text-white dark:bg-gray-800 text-[10px] rounded px-2 py-1 shadow-lg font-mono z-10 transition-opacity whitespace-nowrap">
                    {staff.missedShifts} missed ({formatCurrency(staff.deductions)})
                  </div>
                )}

                {/* Animated bar column */}
                <div className="w-12 bg-gray-50 dark:bg-gray-950 rounded-lg h-28 flex items-end overflow-hidden border border-gray-100/50 dark:border-gray-900/30">
                  <motion.div
                    className={`w-full rounded-b-lg ${
                      isCook ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' : 'bg-gradient-to-t from-teal-500 to-teal-350'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ type: 'spring', damping: 15 }}
                  />
                </div>
                
                <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  {staff.staffName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend stats helper */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
          <span className="font-mono text-[9px] text-gray-400">0 shifts absent = 100% pay</span>
          <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
            <span className="text-indigo-500">
              {salaryBreakdowns.find(s => s.role === 'Cooking')?.missedShifts || 0}
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-teal-500">
              {salaryBreakdowns.find(s => s.role === 'Cleaning')?.missedShifts || 0}
            </span>
            <span className="text-[9px] font-normal text-gray-400 ml-1 font-mono">Missed</span>
          </div>
        </div>
      </div>

      {/* Chart 3: Financial Distribution Bento Box (Payable vs Deducted Area) */}
      <div className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Monthly Household Payroll
            </h4>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-mono">Budget Allocation</p>
          </div>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </div>

        {/* Financial ratios visual nested line or stacked block */}
        <div className="space-y-4 py-1">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-gray-950 dark:text-gray-50">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Net Cash Disbursed
              </span>
              <span>{formatCurrency(totalPayable)}</span>
            </div>
            {/* Visual ratio line */}
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
              {salaryBreakdowns.map((staff, idx) => {
                const percentage = totalSalaries > 0 ? (staff.finalPayable / totalSalaries) * 100 : 0;
                return (
                  <motion.div
                    key={staff.staffId}
                    style={{ width: `${percentage}%` }}
                    className={`h-full ${idx === 0 ? 'bg-indigo-600' : 'bg-teal-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                  />
                );
              })}
              {/* Deduction remainder */}
              <motion.div
                style={{ width: `${totalSalaries > 0 ? (totalDeductions / totalSalaries) * 100 : 0}%` }}
                className="h-full bg-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${totalSalaries > 0 ? (totalDeductions / totalSalaries) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-sans pt-1">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850">
              <p className="text-gray-400">Total Contract Salary</p>
              <p className="font-display font-extrabold text-sm text-gray-950 dark:text-gray-100 mt-1">
                {formatCurrency(totalSalaries)}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/20">
              <p className="text-gray-400">Total Wallet Savings</p>
              <p className="font-display font-extrabold text-sm text-rose-500 dark:text-rose-450 mt-1">
                {formatCurrency(totalDeductions)}
              </p>
            </div>
          </div>
        </div>

        {/* Mini indicator */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1 font-medium font-mono text-[9px] text-emerald-500">
            <TrendingUp className="h-3 w-3 shrink-0" />
            <span>Real-time calculation active</span>
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {totalSalaries > 0 ? ((totalPayable / totalSalaries) * 100).toFixed(0) : 100}% Paid Out
          </span>
        </div>
      </div>

    </div>
  );
}
