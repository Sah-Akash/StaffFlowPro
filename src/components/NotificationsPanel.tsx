import { Bell, Check, AlertCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Staff, AttendanceRecord } from '../types';

interface NotificationsPanelProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  currentYear: number;
  currentMonth: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({
  staffList,
  attendance,
  currentYear,
  currentMonth,
  isOpen,
  onClose
}: NotificationsPanelProps) {
  // Generate smart dynamic notifications
  const notifications: { id: string; title: string; desc: string; type: 'info' | 'warning' | 'success' }[] = [];
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dayOfWeek = today.getDay();

  // 1. Check if today is Sunday (weekly off)
  const isSunday = dayOfWeek === 0;

  if (isSunday) {
    notifications.push({
      id: 'sunday_off',
      title: 'Weekly Off (Sunday)',
      desc: 'Today is Sunday. Staff are on their weekly off. No attendance is required.',
      type: 'info'
    });
  } else {
    // 2. Check current attendance gaps for today
    staffList.forEach(staff => {
      const todayRecord = attendance[staff.id]?.[todayStr];
      const hour = today.getHours();

      // Check morning shift (typically tracked any time of day, but notified if afternoon/evening and still missing)
      if (!todayRecord || !todayRecord.morning) {
        if (hour >= 9) { // Nudge after 9 AM
          notifications.push({
            id: `morning_${staff.id}`,
            title: `Morning Attendance Pending`,
            desc: `Log morning shift attendance for ${staff.name} (${staff.role}).`,
            type: 'warning'
          });
        }
      }

      // Check night shift (notified if evening or night, e.g., after 5 PM and still missing)
      if (!todayRecord || !todayRecord.night) {
        if (hour >= 17) { // Nudge after 5 PM
          notifications.push({
            id: `night_${staff.id}`,
            title: `Night Attendance Pending`,
            desc: `Log night shift attendance for ${staff.name} (${staff.role}).`,
            type: 'warning'
          });
        }
      }
    });
  }

  // 3. Check if month-end is ready for payroll
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  
  const isSelectedMonthCurrent = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  if (isSelectedMonthCurrent && dayOfMonth >= 25) {
    notifications.push({
      id: 'payroll_ready',
      title: 'Month-End Salary Ready',
      desc: `Today is the ${dayOfMonth}th. Attendance tracking is mostly complete. You can now generate the monthly report.`,
      type: 'success'
    });
  }

  // 4. Default persistent system notification
  notifications.push({
    id: 'local_storage',
    title: 'Offline-First Security Active',
    desc: 'All data is stored directly inside your browser cache. No account is needed.',
    type: 'success'
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            id="notifications-overlay"
            onClick={onClose} 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 backdrop-blur-xs transition-opacity"
          />

          {/* Panel */}
          <motion.div
            id="notifications-panel-container"
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 z-50 flex flex-col no-print"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-500" />
                <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100 text-base">
                  Real-time Notifications
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Check className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No attendance tasks pending.</p>
                </div>
              ) : (
                notifications.map(notif => {
                  let iconBg = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400';
                  let icon = <Sparkles className="h-4 w-4" />;

                  if (notif.type === 'warning') {
                    iconBg = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
                    icon = <AlertCircle className="h-4 w-4" />;
                  } else if (notif.type === 'success') {
                    iconBg = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
                    icon = <Check className="h-4 w-4" />;
                  }

                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-850 flex gap-3 shadow-xs hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                    >
                      <div className={`p-2 rounded-lg shrink-0 self-start ${iconBg}`}>
                        {icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                          {notif.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-55/10 dark:bg-gray-950/20">
              <p className="text-[10px] text-center text-gray-450 dark:text-gray-500 font-mono">
                Version 1.1 • Local Storage Active
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
