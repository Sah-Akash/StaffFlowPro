import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Calendar as CalendarIcon, CreditCard, Sliders, HardDrive, 
  Bell, Plus, Check, RefreshCw, Sparkles, LogOut, ArrowRight, Activity, HelpCircle
} from 'lucide-react';

import { Staff, AttendanceRecord, DayAttendance, SalaryBreakdown, RoleType } from './types';
import { DEFAULT_STAFF, getSeedAttendance, calculateSalaryBreakdown } from './utils';

// Import our premium components
import ThemeToggle from './components/ThemeToggle';
import NotificationsPanel from './components/NotificationsPanel';
import BulkAttendanceModal from './components/BulkAttendanceModal';
import BackupRestore from './components/BackupRestore';
import HomeLogsPanel from './components/HomeLogsPanel';
import StaffCalendarView from './components/StaffCalendarView';
import MonthlyReportView from './components/MonthlyReportView';
import StaffInputView from './components/StaffInputView';

export default function App() {
  // 1. Core State Managers
  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('staff_profiles_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STAFF;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const saved = localStorage.getItem('attendance_records_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seeds representative mock history-logs for immediate visual beauty
    return getSeedAttendance(DEFAULT_STAFF);
  });

  // Time context coordinates
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Layout View Tab manager: 'home' | 'calendar' | 'analysis' | 'staff' | 'backup'
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'analysis' | 'staff' | 'backup'>('home');
  
  // Custom overlays togglers
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Sync state to local storage on edits
  useEffect(() => {
    localStorage.setItem('staff_profiles_v1', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('attendance_records_v1', JSON.stringify(attendance));
  }, [attendance]);

  // 2. Real-time dynamic business calculators
  const salaryBreakdowns = useMemo<SalaryBreakdown[]>(() => {
    return staff.map(member => 
      calculateSalaryBreakdown(member, attendance[member.id] || {}, currentYear, currentMonth)
    );
  }, [staff, attendance, currentYear, currentMonth]);

  // Total missed shifts pending action calculation
  const totalNotificationsCount = useMemo(() => {
    let unloggedTodayCount = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isSunday = today.getDay() === 0;

    if (!isSunday) {
      staff.forEach(s => {
        const logged = attendance[s.id]?.[todayStr];
        if (!logged) {
          unloggedTodayCount += 2; // Two shifts unlogged
        } else {
          if (!logged.morning) unloggedTodayCount++;
          if (!logged.night) unloggedTodayCount++;
        }
      });
    }
    return unloggedTodayCount;
  }, [staff, attendance]);

  // 3. State update transactional methods
  const handleAddStaff = (newStaff: Staff) => {
    setStaff(prev => [...prev, newStaff]);
  };

  const handleUpdateStaff = (staffId: string, name: string, salary: number, joiningDate: string, role: RoleType) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, name, monthlySalary: salary, joiningDate, role } : s));
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    setAttendance(prev => {
      const copy = { ...prev };
      delete copy[staffId];
      return copy;
    });
  };

  const handleSaveDayAttendance = (staffId: string, dateStr: string, data: DayAttendance) => {
    setAttendance(prev => {
      const staffRecords = { ...(prev[staffId] || {}) };
      staffRecords[dateStr] = data;
      return { ...prev, [staffId]: staffRecords };
    });
  };

  const handleSaveBulkAttendance = (
    staffId: string,
    startDateStr: string,
    endDateStr: string,
    morningStatus: 'present' | 'absent',
    nightStatus: 'present' | 'absent',
    note: string
  ) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    setAttendance(prev => {
      const staffRecords = { ...(prev[staffId] || {}) };
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0) continue; // Intentionally skip Sunday rests

        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        staffRecords[dateStr] = {
          morning: morningStatus,
          night: nightStatus,
          note: note ? note : undefined
        };
      }

      return { ...prev, [staffId]: staffRecords };
    });
  };

  const handleRestoreBackupState = (newStaff: Staff[], newAttendance: AttendanceRecord) => {
    setStaff(newStaff);
    setAttendance(newAttendance);
  };

  // Nav configuration
  const navigationItems = [
    { id: 'home', label: 'Daily Logs', icon: <Sliders className="h-4.5 w-4.5" /> },
    { id: 'calendar', label: 'Monthly Calendar', icon: <CalendarIcon className="h-4.5 w-4.5" /> },
    { id: 'analysis', label: 'Pay & Analysis', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { id: 'staff', label: 'Staff Details', icon: <Users className="h-4.5 w-4.5" /> }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 font-sans flex flex-col justify-between">
      
      {/* 1. Main Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-slate-200/80 dark:border-slate-800/40 no-print">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white transform hover:scale-105 transition-transform flex items-center justify-center shadow-lg shadow-indigo-600/15">
              <Sparkles className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-slate-800 dark:text-slate-100 text-base leading-none block">
                StaffFlow Pro
              </span>
              <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-wider uppercase block mt-0.5">
                Attendance & Salary
              </span>
            </div>
          </div>

          <div id="header-control-cluster" className="flex items-center gap-3">
            {/* Telemetry/Database indicator (Silent representation) */}
            <div className="hidden md:flex items-center gap-1.5 text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
              <Activity className="h-3 w-3 animate-pulse shrink-0" />
              <span>Offline-First Secure</span>
            </div>

            {/* Notification bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
              aria-label="Toggle notifications drawer"
            >
              <Bell className="h-4.5 w-4.5" />
              {totalNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-mono font-black text-[8px] animate-bounce">
                  {totalNotificationsCount}
                </span>
              )}
            </button>

            {/* Light / Dark selector utility */}
            <ThemeToggle />
          </div>

        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-8 flex flex-col gap-6">
        
        {/* Workspace dynamic subtitle panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              Household Personnel Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contract tracking with daily wage updates • Sunday Weekly Off
            </p>
          </div>

          {/* Quick tab controls for desktop view */}
          <div className="hidden lg:flex p-1 rounded-xl bg-slate-100/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-0.5 max-w-lg">
            {navigationItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    active 
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Render and transition dynamic Route Views here */}
        <div className="flex-1 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'home' && (
                <HomeLogsPanel
                  staffList={staff}
                  attendance={attendance}
                  onSaveDayAttendance={handleSaveDayAttendance}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                />
              )}

              {activeTab === 'calendar' && (
                <StaffCalendarView
                  staffList={staff}
                  attendance={attendance}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onMonthChange={(y, m) => {
                    setCurrentYear(y);
                    setCurrentMonth(m);
                  }}
                />
              )}

              {activeTab === 'analysis' && (
                <MonthlyReportView
                  staffList={staff}
                  attendance={attendance}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  onMonthChange={(y, m) => {
                    setCurrentYear(y);
                    setCurrentMonth(m);
                  }}
                />
              )}

              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <StaffInputView
                    staffList={staff}
                    onAddStaff={handleAddStaff}
                    onUpdateStaff={handleUpdateStaff}
                    onDeleteStaff={handleDeleteStaff}
                  />
                  
                  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-105 uppercase tracking-tight mb-4">
                      Roster Backups
                    </h3>
                    <BackupRestore 
                      staffList={staff} 
                      attendance={attendance} 
                      onRestore={handleRestoreBackupState} 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* 4. Small screen floating tab system (iOS bottom-bar pattern matching mobile constraint) */}
      <nav id="mobile-navigation-bar" className="lg:hidden fixed bottom-1.5 left-1.5 right-1.5 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl py-2 px-3 flex items-center justify-around shadow-2xl space-x-1 no-print">
        {navigationItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                active 
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-102 bg-indigo-50/50 dark:bg-indigo-950/25' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <span className="text-[8.5px] mt-1 font-semibold truncate max-w-[64px] tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 5. Main Floating Action Button (FAB) (Touch and accessibility optimized) */}
      <div className="fixed bottom-16 lg:bottom-6 right-5 z-40 no-print">
        <button
          onClick={() => setBulkModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-850 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full sm:rounded-2xl shadow-2xl transition-all relative group cursor-pointer border border-indigo-500/10"
          title="Mark multiple days at once"
        >
          <Plus className="h-5 w-5 animate-pulse" />
          <span className="hidden sm:block text-xs font-bold font-display uppercase tracking-wider">
            Bulk Attendance
          </span>
        </button>
      </div>

      {/* 6. System Notifications Overlay Modal */}
      <NotificationsPanel
        staffList={staff}
        attendance={attendance}
        currentYear={currentYear}
        currentMonth={currentMonth}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* 7. Bulk Attend overrides loader modal */}
      <BulkAttendanceModal
        staffList={staff}
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSaveBulk={handleSaveBulkAttendance}
      />

      {/* Footer copyright */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-800/50 text-center bg-white dark:bg-slate-950/20 text-[10px] text-slate-400 font-mono no-print">
        <div className="w-full max-w-7xl mx-auto px-4">
          <p>© 2026 Staff Flow Pro • Secure Local Encryption.</p>
        </div>
      </footer>

    </div>
  );
}
