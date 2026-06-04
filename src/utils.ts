import { Staff, AttendanceRecord, DayAttendance, SalaryBreakdown, MonthStats } from './types';

// Default mock staff profiles
export const DEFAULT_STAFF: Staff[] = [
  {
    id: 'cook_1',
    role: 'Cooking',
    name: 'Sunita Devi',
    monthlySalary: 12000,
    joiningDate: '2025-01-10'
  },
  {
    id: 'cleaner_1',
    role: 'Cleaning',
    name: 'Raju Kumar',
    monthlySalary: 10000,
    joiningDate: '2025-02-15'
  }
];

// Seed initial attendance data for last month & current month to make the charts beautiful from day one
export function getSeedAttendance(staffList: Staff[]): AttendanceRecord {
  const record: AttendanceRecord = {};
  const today = new Date();
  
  // Let's seed for the current month and the previous month
  const monthsToSeed = [
    { year: today.getFullYear(), month: today.getMonth() }, // This month
    { year: today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear(), month: today.getMonth() === 0 ? 11 : today.getMonth() - 1 } // Last month
  ];

  staffList.forEach(staff => {
    record[staff.id] = {};
    
    monthsToSeed.forEach(({ year, month }) => {
      const daysCount = new Date(year, month + 1, 0).getDate();
      
      for (let d = 1; d <= daysCount; d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        
        if (dayOfWeek === 0) continue; // Skip Sunday

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        // Randomly assign some absences in the past to make charts look realistic and alive
        // Avoid future days (which should be unmarked)
        const isPast = date < today;
        if (isPast) {
          const rand = Math.random();
          let attendance: DayAttendance = { morning: 'present', night: 'present' };
          
          if (rand < 0.05) {
            attendance = { morning: 'absent', night: 'absent', note: 'Sick leave' };
          } else if (rand < 0.12) {
            attendance = { 
              morning: 'absent', 
              night: 'present', 
              note: Math.random() > 0.5 ? 'Morning shift missed - Urgent work' : 'Late arrival' 
            };
          } else if (rand < 0.16) {
            attendance = { 
              morning: 'present', 
              night: 'absent', 
              note: 'Festival celebration' 
            };
          }
          
          record[staff.id][dateStr] = attendance;
        }
      }
    });
  });

  return record;
}

// Helper to get total days and working days (Mon-Sat) for a specific year/month
export function getMonthStats(year: number, month: number): MonthStats {
  const totalDays = new Date(year, month + 1, 0).getDate();
  let workingDaysCount = 0;
  let sundaysCount = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0) {
      sundaysCount++;
    } else {
      workingDaysCount++;
    }
  }

  return {
    year,
    month,
    totalDays,
    workingDaysCount,
    sundaysCount
  };
}

// Generate an array of dates (YYYY-MM-DD) in a given month
export interface CalendarDayInfo {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: number;
  isSunday: boolean;
  isFuture: boolean;
  isToday: boolean;
}

export function getCalendarDays(year: number, month: number): CalendarDayInfo[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: CalendarDayInfo[] = [];
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dayOfWeek = currentDate.getDay();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSunday = dayOfWeek === 0;

    // Reset clock for accurate comparison
    const compareDate = new Date(year, month, d);
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    calendarDays.push({
      dateStr,
      dayNumber: d,
      dayOfWeek,
      isSunday,
      isFuture: compareDate > compareToday,
      isToday: dateStr === todayStr
    });
  }

  return calendarDays;
}

// Calculate the salary details and attendance percentages for a staff member for a specific month
export function calculateSalaryBreakdown(
  staff: Staff,
  attendance: Record<string, DayAttendance> = {},
  year: number,
  month: number
): SalaryBreakdown {
  const stats = getMonthStats(year, month);
  const totalWorkingDays = stats.workingDaysCount;
  const totalShifts = totalWorkingDays * 2;
  const perShiftRate = totalShifts > 0 ? staff.monthlySalary / totalShifts : 0;

  let missedShifts = 0;
  let presentShifts = 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Count past and current working days up to today
  let elapsedWorkingDays = 0;

  for (let d = 1; d <= stats.totalDays; d++) {
    const curDate = new Date(year, month, d);
    const dayOfWeek = curDate.getDay();
    
    if (dayOfWeek === 0) continue; // Skip Sunday

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Check if day has elapsed (is today or in the past)
    const isElapsed = curDate <= new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isElapsed) {
      elapsedWorkingDays++;
    }

    const dayRecord = attendance[dateStr];
    if (dayRecord) {
      if (dayRecord.morning === 'absent' || dayRecord.morning === 'leave_pending') {
        missedShifts++;
      } else {
        presentShifts++;
      }
      if (dayRecord.night === 'absent' || dayRecord.night === 'leave_pending') {
        missedShifts++;
      } else {
        presentShifts++;
      }
    } else {
      // Unmarked days:
      // If it's a past working day, we assume they were present by default unless explicitly marked absent
      // If it's a future working day, we don't count it as present yet for "till date" but it counts for perfect attendance
      if (isElapsed) {
        presentShifts += 2;
      }
    }
  }

  // Deductions are based on ALL missed shifts marked in the entire month (even if in future, though they haven't happened yet)
  const deductions = missedShifts * perShiftRate;
  const finalPayable = Math.max(0, staff.monthlySalary - deductions);

  // Salary earned till date includes elapsed shifts minus elapsed missed shifts
  // Note: presentShifts already holds shifts that are present or assumed present up to elapsed date
  // So, presentShifts is essentially the present shifts till date
  const salaryEarned = presentShifts * perShiftRate;

  const attendancePercentage = totalShifts > 0 ? (presentShifts / (elapsedWorkingDays > 0 ? elapsedWorkingDays * 2 : totalShifts)) * 100 : 100;

  return {
    staffId: staff.id,
    staffName: staff.name,
    role: staff.role,
    monthlySalary: staff.monthlySalary,
    totalWorkingDays,
    totalShifts,
    presentShifts,
    missedShifts,
    perShiftRate,
    salaryEarned: Number(salaryEarned.toFixed(2)),
    deductions: Number(deductions.toFixed(2)),
    finalPayable: Number(finalPayable.toFixed(2)),
    attendancePercentage: Math.min(100, Number(attendancePercentage.toFixed(1)))
  };
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Backup local data to a JSON download
export function downloadBackup(data: { staff: Staff[]; attendance: AttendanceRecord }) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `staff_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Validate imported JSON data integrity
export function validateBackup(json: any): { staff: Staff[]; attendance: AttendanceRecord } | null {
  try {
    if (!json || typeof json !== 'object') return null;
    if (!Array.isArray(json.staff)) return null;
    if (!json.attendance || typeof json.attendance !== 'object') return null;

    // Validate staff list
    const validStaff: Staff[] = [];
    json.staff.forEach((s: any) => {
      if (s && typeof s === 'object' && s.id && s.name && s.role && typeof s.monthlySalary === 'number' && s.joiningDate) {
        validStaff.push({
          id: String(s.id),
          name: String(s.name),
          role: s.role === 'Cleaning' ? 'Cleaning' : 'Cooking',
          monthlySalary: Number(s.monthlySalary),
          joiningDate: String(s.joiningDate)
        });
      }
    });

    if (validStaff.length === 0) return null;

    // Validate attendance
    const validAttendance: AttendanceRecord = {};
    Object.keys(json.attendance).forEach(staffId => {
      if (typeof json.attendance[staffId] === 'object' && json.attendance[staffId] !== null) {
        validAttendance[staffId] = {};
        Object.keys(json.attendance[staffId]).forEach(dateStr => {
          const dayData = json.attendance[staffId][dateStr];
          if (dayData && typeof dayData === 'object') {
            validAttendance[staffId][dateStr] = {
              morning: dayData.morning === 'absent' ? 'absent' : 
                       dayData.morning === 'leave_pending' ? 'leave_pending' :
                       dayData.morning === 'leave_approved' ? 'leave_approved' : 'present',
              night: dayData.night === 'absent' ? 'absent' : 
                     dayData.night === 'leave_pending' ? 'leave_pending' :
                     dayData.night === 'leave_approved' ? 'leave_approved' : 'present',
              note: dayData.note ? String(dayData.note) : undefined,
              morningApprovedBy: dayData.morningApprovedBy || undefined,
              nightApprovedBy: dayData.nightApprovedBy || undefined
            };
          }
        });
      }
    });

    return {
      staff: validStaff,
      attendance: validAttendance
    };
  } catch (e) {
    console.error('Failed to validate backup import', e);
    return null;
  }
}
