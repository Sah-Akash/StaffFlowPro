import React, { useState } from 'react';
import { Staff, RoleType } from '../types';
import { formatCurrency } from '../utils';
import { UserPlus, Edit2, Trash2, Check, X, Users, DollarSign, Calendar, Sparkles } from 'lucide-react';

interface StaffInputViewProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Staff) => void;
  onUpdateStaff: (staffId: string, name: string, salary: number, joiningDate: string, role: RoleType) => void;
  onDeleteStaff: (staffId: string) => void;
}

export default function StaffInputView({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff
}: StaffInputViewProps) {
  // Add Staff State variables
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<RoleType>('Cooking');
  const [newSalary, setNewSalary] = useState<number>(10000);
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Edit Staff State variables
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<RoleType>('Cooking');
  const [editSalary, setEditSalary] = useState<number>(0);
  const [editDate, setEditDate] = useState('');

  // Notifications or simple feedback
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const triggerAlert = (text: string, type: 'success' | 'info' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Create/Add handler
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      triggerAlert("Please enter a valid name for the new staff.", "info");
      return;
    }
    if (newSalary <= 0) {
      triggerAlert("Salary must be a positive number.", "info");
      return;
    }

    const created: Staff = {
      id: `staff_${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      monthlySalary: newSalary,
      joiningDate: newDate
    };

    onAddStaff(created);
    setNewName('');
    setNewSalary(10000);
    triggerAlert(`Successfully recruited ${created.name} into the household roster!`);
  };

  // Start editing mode
  const startEdit = (s: Staff) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditRole(s.role);
    setEditSalary(s.monthlySalary);
    setEditDate(s.joiningDate);
  };

  // Save changes
  const saveChange = (id: string) => {
    if (!editName.trim()) {
      triggerAlert("Staff name cannot be left blank.", "info");
      return;
    }
    if (editSalary <= 0) {
      triggerAlert("Monthly salary must be positive.", "info");
      return;
    }

    onUpdateStaff(id, editName.trim(), editSalary, editDate, editRole);
    setEditingId(null);
    triggerAlert(`Updated employee profile details!`);
  };

  // Delete option
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to remove ${name} from your household profiles? All respective monthly attendance and payouts will be halted.`)) {
      onDeleteStaff(id);
      triggerAlert(`Removed ${name} from the roster.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Feedback Alert */}
      {alertMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold font-mono text-center shadow-xs border transition duration-200 ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400'
        }`}>
          {alertMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5/12): Add New Staff Form */}
        <div className="lg:col-span-5 sleek-card p-6 h-fit">
          <div className="space-y-4 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
              <UserPlus className="h-4.5 w-4.5 text-indigo-600" />
              Recruit New Staff
            </h2>
            <p className="text-xs text-slate-400">Add cooking, cleaning, or custom household help profiles</p>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Employee Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Alka Bose"
                className="mt-1 w-full p-2.5 text-xs border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Specialty Role select */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Specialty Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as RoleType)}
                className="mt-1 w-full p-2.5 text-xs border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Cooking">Cooking Specialty</option>
                <option value="Cleaning">Cleaning Specialty</option>
              </select>
            </div>

            {/* Wage & Contract commencement row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Monthly Wage (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-xs font-mono font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 pl-6 text-xs border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Joining Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 w-full p-2 text-xs border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 text-slate-850 dark:text-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-750 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer shadow-xs"
            >
              Add Staff Member
            </button>

          </form>
        </div>

        {/* Right Column (7/12): Current Staff Profiles Audit List */}
        <div className="lg:col-span-7 sleek-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-indigo-600" />
                Active Personnel Directory
              </h2>
              <p className="text-xs text-slate-400">Manage names, payroll contracts and specialties inline</p>
            </div>

            {/* Profiles Loop */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {staffList.map((member) => {
                const isEditing = editingId === member.id;
                
                return (
                  <div 
                    key={member.id} 
                    className={`p-4 rounded-xl border transition-colors ${
                      isEditing 
                        ? 'border-indigo-500 bg-indigo-55/10 dark:bg-indigo-950/20' 
                        : 'border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Editor UI */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Edit Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="mt-1 w-full p-2 text-xs border border-indigo-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden font-sans"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Edit Specialty</label>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as RoleType)}
                              className="mt-1 w-full p-2 text-xs border border-indigo-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden"
                            >
                              <option value="Cooking">Cooking</option>
                              <option value="Cleaning">Cleaning</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Monthly Wage (₹)</label>
                            <input
                              type="number"
                              value={editSalary}
                              onChange={(e) => setEditSalary(parseInt(e.target.value) || 0)}
                              className="mt-1 w-full p-2 text-xs border border-indigo-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-805 dark:text-slate-200 rounded-lg focus:outline-hidden font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Commenced on</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="mt-1 w-full p-2 text-xs border border-indigo-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-805 dark:text-slate-200 rounded-lg focus:outline-hidden font-mono"
                            />
                          </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => saveChange(member.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" /> Save Changes
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Standard Details Row */
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center ${
                            member.role === 'Cooking' 
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' 
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400'
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{member.name}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-450 dark:text-slate-400 mt-1">
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 rounded font-bold">{member.role}</span>
                              <span>• Contracted at <b className="font-mono text-indigo-600 dark:text-indigo-400">{formatCurrency(member.monthlySalary)}/mo</b></span>
                              <span>• Joined {new Date(member.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Controls triggers */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => startEdit(member)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Edit contract info"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* Disable deleting Sunita/Raju by default or warn heavily to uphold safety */}
                          <button
                            onClick={() => handleDelete(member.id, member.name)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500 hover:bg-rose-50/20 text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
                            title="Decommission member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-mono text-center shrink-0 mt-6 pt-3 border-t border-slate-100 dark:border-slate-850">
            © Household Directory Ledger • Real-time Wage Updates Enabled
          </p>
        </div>

      </div>

    </div>
  );
}
