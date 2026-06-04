import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Download, Printer, Percent, DollarSign, ArrowDownRight, 
  HelpCircle, CreditCard, ChevronDown, CheckCircle, ChevronRight, X, Sparkles
} from 'lucide-react';
import { SalaryBreakdown, Staff } from '../types';
import { formatCurrency, MONTHS } from '../utils';

interface SalaryPageProps {
  salaryBreakdowns: SalaryBreakdown[];
  currentYear: number;
  currentMonth: number;
}

export default function SalaryPage({ salaryBreakdowns, currentYear, currentMonth }: SalaryPageProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Generate invoice number dynamically
  const getInvoiceNumber = (staffName: string) => {
    const code = staffName.substring(0, 3).toUpperCase();
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    return `INV-${currentYear}${monthStr}-${code}`;
  };

  const activeBreakdown = salaryBreakdowns.find(sb => sb.staffId === selectedStaffId) || salaryBreakdowns[0];

  // Export to Excel (CSV)
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Headers
    csvContent += 'Staff Name,Role,Month,Total Working Days,Total Shifts,Per Shift Rate,Present Shifts,Missed Shifts,Base Salary,Total Deductions,Final Net Payable\n';
    
    // Rows
    salaryBreakdowns.forEach(sb => {
      const row = [
        sb.staffName,
        sb.role,
        `${MONTHS[currentMonth]} ${currentYear}`,
        sb.totalWorkingDays,
        sb.totalShifts,
        sb.perShiftRate.toFixed(2),
        sb.presentShifts,
        sb.missedShifts,
        sb.monthlySalary,
        sb.deductions,
        sb.finalPayable
      ].map(val => `"${val}"`).join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `household_salary_report_${MONTHS[currentMonth]}_${currentYear}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="salary-page-container" className="space-y-6">
      
      {/* Overview stats table */}
      <div className="sleek-card border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-50 text-lg">
              Paysheet & Distribution • {MONTHS[currentMonth]} {currentYear}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Calculated real-time according to Mon-Sat shifts
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-55/40 dark:hover:bg-gray-850 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export Excel (CSV)
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              Generate Roster Report
            </button>
          </div>
        </div>

        {/* Desktop responsive table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-850 bg-gray-55/30 dark:bg-gray-950/20 text-gray-450 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider font-mono">
                <th className="p-4 pl-6">Staff Profile</th>
                <th className="p-4">Base Salary</th>
                <th className="p-4">Total/Present Shifts</th>
                <th className="p-4 text-center">Missed (Deducted)</th>
                <th className="p-4 text-right">Per-Shift Rate</th>
                <th className="p-4 text-right pr-6">Payable Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
              {salaryBreakdowns.map(sb => (
                <tr
                  key={sb.staffId}
                  onClick={() => setSelectedStaffId(sb.staffId)}
                  className={`hover:bg-gray-55/10 dark:hover:bg-gray-950/10 transition-colors cursor-pointer ${
                    selectedStaffId === sb.staffId ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                  }`}
                >
                  <td className="p-4 pl-6">
                    <div className="font-semibold text-gray-905 text-gray-900 dark:text-gray-50 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sb.role === 'Cooking' ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                      {sb.staffName}
                      <span className="text-[9px] font-medium font-mono text-gray-455 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded ml-1">
                        {sb.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 dark:text-gray-300 font-mono font-medium">
                    {formatCurrency(sb.monthlySalary)}
                  </td>
                  <td className="p-4 text-gray-750 dark:text-gray-305">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">{sb.presentShifts}</span>
                    <span className="text-gray-400 font-mono"> / {sb.totalShifts}</span>
                    <span className="text-[10px] text-gray-400 font-sans block mt-0.5 leading-none">
                      {sb.attendancePercentage}% Attendance
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {sb.missedShifts > 0 ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-400 font-mono inline-flex items-center gap-0.5">
                        -{sb.missedShifts} ({formatCurrency(sb.deductions)})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-500 font-mono inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        Nil
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-gray-500 dark:text-gray-400 font-mono">
                    {formatCurrency(sb.perShiftRate)}
                  </td>
                  <td className="p-4 text-right pr-6 font-mono font-bold text-gray-950 dark:text-gray-100 text-sm">
                    {formatCurrency(sb.finalPayable)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Salary Invoice Drill-down widget (Stripe/Linear billing layout style) */}
      <AnimatePresence mode="wait">
        {activeBreakdown && (
          <motion.div
            key={activeBreakdown.staffId}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4 mb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-indigo-500 uppercase tracking-widest block">
                  Detailed Payslip Breakdown
                </span>
                <h4 className="text-base font-display font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  {activeBreakdown.staffName}
                  <span className="text-xs font-medium font-sans text-gray-400 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 px-2.5 py-0.5 rounded-full inline-block">
                    {activeBreakdown.role} Specialist
                  </span>
                </h4>
              </div>

              <div className="text-right text-xs shrink-0 bg-gray-55/30 dark:bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-855 font-mono text-gray-501 text-gray-500">
                <span>Invoice ID: </span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{getInvoiceNumber(activeBreakdown.staffName)}</span>
              </div>
            </div>

            {/* Calculations visualization row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Core Formula details */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  Base Calculations
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-505 text-gray-500">Monthly Contract Rate:</span>
                    <span className="font-mono text-gray-950 dark:text-gray-100 font-semibold">{formatCurrency(activeBreakdown.monthlySalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-505 text-gray-500">Working Days This Month:</span>
                    <span className="font-mono text-gray-905 text-gray-900 dark:text-gray-200">{activeBreakdown.totalWorkingDays} days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-505 text-gray-500">Contract Shifts Count:</span>
                    <span className="font-mono text-gray-905 text-gray-900 dark:text-gray-200">{activeBreakdown.totalShifts} shifts</span>
                  </div>
                  <div className="p-3 bg-gray-55/40 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500">Calculated Per-Shift Rate:</span>
                      <span className="font-mono text-indigo-505 text-indigo-600 dark:text-indigo-400">{formatCurrency(activeBreakdown.perShiftRate)}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed font-mono">
                      Formula: {formatCurrency(activeBreakdown.monthlySalary)} ÷ ({activeBreakdown.totalWorkingDays} days × 2 daily shifts)
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 2: Deductions Breakdown */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  Deduction Adjustments
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-505 text-gray-500">Total Missed Shifts:</span>
                    <span className={`font-mono font-semibold ${activeBreakdown.missedShifts > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {activeBreakdown.missedShifts} shifts
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-505 text-gray-500">Total Present Shifts:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{activeBreakdown.presentShifts} shifts</span>
                  </div>
                  
                  <div className="p-3 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/10 dark:border-rose-900/10 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <span>Accumulated Deductions:</span>
                      <span className="font-mono">-{formatCurrency(activeBreakdown.deductions)}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed font-mono">
                      Formula: {activeBreakdown.missedShifts} missed shifts × {formatCurrency(activeBreakdown.perShiftRate)} shift rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 3: Wallet final payable balance summary */}
              <div className="space-y-4 md:col-span-1">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  Salary Net Yield
                </h5>
                <div className="p-4 bg-indigo-600 dark:bg-indigo-950/30 rounded-2xl text-white space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-200 dark:text-indigo-400 font-semibold font-mono uppercase tracking-wide block">
                      Payable Balance Due
                    </span>
                    <div className="text-2xl font-display font-extrabold tracking-tight font-mono">
                      {formatCurrency(activeBreakdown.finalPayable)}
                    </div>
                  </div>

                  <hr className="border-indigo-500/30 dark:border-indigo-900/40" />

                  <div className="flex items-center justify-between text-[11px] text-indigo-150 font-sans leading-tight">
                    <span>Attendance Weight:</span>
                    <span className="font-bold text-white bg-indigo-500/40 px-2 py-0.5 rounded font-mono">
                      {activeBreakdown.attendancePercentage}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <div
            id="report-overlay"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print"
          >
            <motion.div
              id="report-modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 border border-gray-200 dark:border-gray-850 rounded-2xl shadow-2xl overflow-hidden block print:p-0 print:border-0 print:shadow-none"
            >
              {/* Modal Head Controls */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between no-print bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                  <span className="font-display font-bold text-gray-900 dark:text-gray-50">Monthly Payroll Invoice Report</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / Print PDF
                  </button>
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* The Invoice/Report Document */}
              <div className="p-8 space-y-6 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
                {/* Visual watermark */}
                <div className="flex justify-between items-start border-b-2 border-gray-150 dark:border-gray-800 pb-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-extrabold text-indigo-650 flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 fill-indigo-100 text-indigo-600" />
                      Staff Attendance & Salary System
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono">Generated on {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono tracking-tight uppercase text-indigo-600 dark:text-indigo-400">Payroll Invoice Report</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">Period: {MONTHS[currentMonth]} {currentYear}</div>
                  </div>
                </div>

                {/* Sub info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1">Prepared By</h4>
                    <p className="font-semibold">Household Registry Manager</p>
                    <p className="text-gray-505 text-gray-500 text-[11px] mt-0.5">Secure local spreadsheet database</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1 font-mono">Export Protocol</h4>
                    <p className="font-mono font-semibold text-gray-850 dark:text-gray-200">ISO-2026-PAY</p>
                  </div>
                </div>

                {/* Main line-items table */}
                <div className="space-y-3 pt-4">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[9px] font-mono">Adjustments & Payouts Detail</h4>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase font-bold text-gray-500 font-mono">
                        <th className="py-2.5">Employee & Role</th>
                        <th className="py-2.5">Total Shifts</th>
                        <th className="py-2.5 text-center">Missed Shifts</th>
                        <th className="py-2.5 text-right">Deductions</th>
                        <th className="py-2.5 text-right">Net Payable Salary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                      {salaryBreakdowns.map(sb => (
                        <tr key={sb.staffId} className="font-sans">
                          <td className="py-3">
                            <div className="font-bold">{sb.staffName}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{sb.role} Specialist</div>
                          </td>
                          <td className="py-3 font-mono text-gray-750">{sb.totalShifts} shifts</td>
                          <td className="py-3 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">
                            {sb.missedShifts} shifts
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-rose-550 text-rose-600">
                            {sb.deductions > 0 ? `-${formatCurrency(sb.deductions)}` : 'Nil'}
                          </td>
                          <td className="py-3 text-right font-bold text-sm font-mono">{formatCurrency(sb.finalPayable)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grand summary billing banner */}
                <div className="p-4 bg-gray-55/40 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl flex items-center justify-between text-xs pt-4">
                  <div>
                    <span className="font-mono text-gray-400 font-semibold uppercase text-[9px]">Grand Invoice Total Due</span>
                    <h3 className="text-xl font-display font-extrabold text-indigo-650 dark:text-indigo-400 mt-1 font-mono">
                      {formatCurrency(salaryBreakdowns.reduce((acc, curr) => acc + curr.finalPayable, 0))}
                    </h3>
                  </div>

                  <div className="text-right font-sans text-gray-555">
                    <p className="font-semibold text-emerald-550 text-emerald-600 flex items-center justify-end gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Status: Checked & Verified
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">Requires signing prior to payout.</p>
                  </div>
                </div>

                {/* Signature box for physical prints */}
                <div className="pt-12 grid grid-cols-2 gap-12 text-xs">
                  <div className="border-t border-gray-350 pt-2 text-center text-gray-450 dark:text-gray-500 font-mono">
                    Supervisor / Employer Signatory
                  </div>
                  <div className="border-t border-gray-350 pt-2 text-center text-gray-450 dark:text-gray-500 font-mono">
                    Employee Signatory Received
                  </div>
                </div>
              </div>

              {/* Informative Help Alert footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-850 text-[10px] text-center text-gray-450 font-mono text-gray-500 no-print">
                <span>To export as PDF, select 'Safe PDF Printer' in the browser Print destination selector.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
