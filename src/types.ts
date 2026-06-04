export type RoleType = 'Cooking' | 'Cleaning';

export interface Staff {
  id: string;
  role: RoleType;
  name: string;
  monthlySalary: number;
  joiningDate: string; // YYYY-MM-DD
}

export type ShiftStatus = 'present' | 'absent' | 'leave_pending' | 'leave_approved';

export interface DayAttendance {
  morning: ShiftStatus;
  night: ShiftStatus;
  note?: string;
  morningApprovedBy?: 'Akash' | 'Alojyoti' | 'Sumanta';
  nightApprovedBy?: 'Akash' | 'Alojyoti' | 'Sumanta';
}

// Map from staff ID to a map of Date (YYYY-MM-DD) to DayAttendance
export type AttendanceRecord = Record<string, Record<string, DayAttendance>>;

export interface MonthStats {
  year: number;
  month: number; // 0-11
  totalDays: number;
  workingDaysCount: number;
  sundaysCount: number;
}

export interface SalaryBreakdown {
  staffId: string;
  staffName: string;
  role: RoleType;
  monthlySalary: number;
  totalWorkingDays: number;
  totalShifts: number;
  presentShifts: number;
  missedShifts: number;
  perShiftRate: number;
  salaryEarned: number;
  deductions: number;
  finalPayable: number;
  attendancePercentage: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}
