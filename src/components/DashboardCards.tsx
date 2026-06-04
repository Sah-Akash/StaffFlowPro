import { motion } from 'motion/react';
import { Calendar, CheckCircle2, XCircle, Wallet, HelpCircle, Activity } from 'lucide-react';
import { SalaryBreakdown } from '../types';
import { formatCurrency } from '../utils';

interface DashboardCardsProps {
  salaryBreakdowns: SalaryBreakdown[];
}

export default function DashboardCards({ salaryBreakdowns }: DashboardCardsProps) {
  // Aggregate stats across all selected staff profiles
  const totalWorkingDays = salaryBreakdowns[0]?.totalWorkingDays || 26;
  const totalShifts = salaryBreakdowns.reduce((acc, curr) => acc + curr.totalShifts, 0);
  const totalPresentShifts = salaryBreakdowns.reduce((acc, curr) => acc + curr.presentShifts, 0);
  const totalMissedShifts = salaryBreakdowns.reduce((acc, curr) => acc + curr.missedShifts, 0);
  
  const totalSalaryEarned = salaryBreakdowns.reduce((acc, curr) => acc + curr.salaryEarned, 0);
  const totalPendingSalary = salaryBreakdowns.reduce((acc, curr) => acc + (curr.finalPayable - curr.salaryEarned), 0);
  
  const averageAttendance = salaryBreakdowns.length > 0 
    ? salaryBreakdowns.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / salaryBreakdowns.length
    : 100;

  const cardConfig = [
    {
      id: "stat-working-days",
      title: "Working Days",
      value: `${totalWorkingDays} days`,
      description: "Mon - Sat this month",
      icon: <Calendar className="h-4 w-4" />,
      colorClass: "text-indigo-500",
      bgClass: "bg-indigo-50/50 dark:bg-indigo-950/20"
    },
    {
      id: "stat-present",
      title: "Present Shifts",
      value: totalPresentShifts,
      description: `Out of ${totalShifts} possible shifts`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      colorClass: "text-emerald-505 text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50/40 dark:bg-emerald-950/20"
    },
    {
      id: "stat-missed",
      title: "Missed Shifts",
      value: totalMissedShifts,
      description: `${totalMissedShifts} shift deductions applied`,
      icon: <XCircle className="h-4 w-4" />,
      colorClass: "text-rose-505 text-rose-600 dark:text-rose-400",
      bgClass: "bg-rose-50/40 dark:bg-rose-950/20"
    },
    {
      id: "stat-percentage",
      title: "Attendance Rate",
      value: `${averageAttendance.toFixed(1)}%`,
      description: "Household attendance avg",
      icon: <Activity className="h-4 w-4" />,
      colorClass: averageAttendance >= 90 ? "text-emerald-500" : averageAttendance >= 75 ? "text-amber-500" : "text-rose-500",
      bgClass: "bg-sky-50/50 dark:bg-sky-950/20"
    },
    {
      id: "stat-earned",
      title: "Earned Till Date",
      value: formatCurrency(totalSalaryEarned),
      description: "Accumulated daily salary",
      icon: <Wallet className="h-4 w-4" />,
      colorClass: "text-teal-600 dark:text-teal-400",
      bgClass: "bg-teal-50/40 dark:bg-teal-950/20"
    },
    {
      id: "stat-pending",
      title: "Remaining Balance",
      value: formatCurrency(Math.max(0, totalPendingSalary)),
      description: "Outstanding end-of-month payable",
      icon: <Wallet className="h-4 w-4" />,
      colorClass: "text-violet-605 text-violet-600 dark:text-violet-400",
      bgClass: "bg-violet-50/40 dark:bg-violet-950/20"
    }
  ];

  return (
    <div id="quick-overview-grid" className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {cardConfig.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className="p-5 sleek-card border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            <div className={`p-1.5 rounded-lg ${card.bgClass} ${card.colorClass}`}>
              {card.icon}
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <div className={`text-xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100`}>
              {card.value}
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-mono leading-tight">
              {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
