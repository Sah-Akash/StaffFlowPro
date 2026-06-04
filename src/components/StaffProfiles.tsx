import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3, Check, X, Calendar, DollarSign, Briefcase, Eye } from 'lucide-react';
import { Staff } from '../types';
import { formatCurrency } from '../utils';

interface StaffProfilesProps {
  staffList: Staff[];
  onUpdateStaff: (staffId: string, name: string, salary: number, joiningDate: string) => void;
}

export default function StaffProfiles({ staffList, onUpdateStaff }: StaffProfilesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Local edit states
  const [editName, setEditName] = useState('');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editJoiningDate, setEditJoiningDate] = useState('');

  const startEdit = (staff: Staff) => {
    setEditingId(staff.id);
    setEditName(staff.name);
    setEditSalary(staff.monthlySalary);
    setEditJoiningDate(staff.joiningDate);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (staffId: string) => {
    if (!editName.trim()) return;
    if (editSalary <= 0) return;
    if (!editJoiningDate) return;

    onUpdateStaff(staffId, editName, editSalary, editJoiningDate);
    setEditingId(null);
  };

  return (
    <div id="staff-profiles-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {staffList.map((staff, idx) => {
        const isEditing = editingId === staff.id;
        const isCook = staff.role === 'Cooking';

        return (
          <motion.div
            key={staff.id}
            initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`sleek-card overflow-hidden relative border ${
              isEditing 
                ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Design accents */}
            <div className={`h-2.5 w-full ${isCook ? 'bg-indigo-600' : 'bg-teal-400'}`} />

            <div className="p-6 space-y-5">
              
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    isCook 
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30' 
                      : 'bg-teal-50 text-teal-600 dark:bg-teal-950/30'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                      {staff.role} Specialist
                    </span>
                    <h4 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-50 mt-0.5">
                      {isEditing ? 'Editing Profile' : staff.name}
                    </h4>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => startEdit(staff)}
                    className="p-2 rounded-xl border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-950 transition-all cursor-pointer"
                    aria-label="Edit employee profile"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Editable / Viewer body */}
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing-inputs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-1"
                  >
                    {/* Name Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        Employee Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                        placeholder="e.g. Kamala Devi"
                      />
                    </div>

                    {/* Salary & Date in row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Monthly Salary Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Monthly Salary (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={editSalary || ''}
                            onChange={(e) => setEditSalary(Number(e.target.value))}
                            className="w-full text-sm p-2.5 pl-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                            placeholder="12000"
                          />
                        </div>
                      </div>

                      {/* Joining Date Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          Contract Start Date
                        </label>
                        <input
                          type="date"
                          value={editJoiningDate}
                          onChange={(e) => setEditJoiningDate(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer font-sans"
                        />
                      </div>
                    </div>

                    {/* Profile Foot Controls */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-855 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(staff.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                          isCook ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-teal-600 hover:bg-teal-500'
                        }`}
                      >
                        <Check className="h-4.5 w-4.5" />
                        Save Changes
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Visual Highlights metrics inside cards */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100/50 dark:border-gray-900/30">
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Contract Salary
                        </span>
                        <p className="text-base font-display font-bold text-gray-950 dark:text-gray-50 mt-1 font-mono">
                          {formatCurrency(staff.monthlySalary)}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100/50 dark:border-gray-900/30">
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Anniversary
                        </span>
                        <p className="text-xs font-sans font-semibold text-gray-950 dark:text-gray-50 mt-2 truncate">
                          {new Date(staff.joiningDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="pt-2 border-t border-gray-50 dark:border-gray-850 flex items-center justify-between text-[11px] text-gray-405 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Contract Status Active
                      </span>
                      <span className="font-mono text-[10px] bg-gray-100/50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        ID: {staff.id}
                      </span>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
