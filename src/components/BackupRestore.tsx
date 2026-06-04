import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import { Staff, AttendanceRecord } from '../types';
import { downloadBackup, validateBackup } from '../utils';

interface BackupRestoreProps {
  staffList: Staff[];
  attendance: AttendanceRecord;
  onRestore: (staff: Staff[], attendance: AttendanceRecord) => void;
}

export default function BackupRestore({
  staffList,
  attendance,
  onRestore
}: BackupRestoreProps) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    downloadBackup({ staff: staffList, attendance });
    setStatus({
      type: 'success',
      message: 'JSON spreadsheet backup file has been generated and downloaded successfully.'
    });
    setTimeout(() => setStatus(null), 5000);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setStatus({
        type: 'error',
        message: 'Invalid file type. Please upload a valid .json snapshot file.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const validated = validateBackup(json);
        
        if (validated) {
          onRestore(validated.staff, validated.attendance);
          setStatus({
            type: 'success',
            message: `Backup loaded! Restored ${validated.staff.length} staff profiles and their attendance logs.`
          });
          setTimeout(() => setStatus(null), 6000);
        } else {
          setStatus({
            type: 'error',
            message: 'Failed to validate backup. File format structure is incorrect or corrupted.'
          });
        }
      } catch (err) {
        setStatus({
          type: 'error',
          message: 'Error compiling backup file. Ensure it is a valid JSON document.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="backup-restore-panel" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="font-display font-bold text-gray-950 dark:text-gray-50 text-xl">
            System Database Logs & Snapshots
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Download your tracker data locally, or restore from a saved backup snapshot.
          </p>
        </div>
        
        <button
          onClick={handleBackup}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-md transition-all cursor-pointer shadow-indigo-600/15"
        >
          <Download className="h-4 w-4" />
          Export Live Snapshot (.json)
        </button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 text-sm animate-fadeIn ${
            status.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30'
              : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/30'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
            : 'border-gray-200 dark:border-gray-800 hover:border-indigo-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="hidden"
        />
        
        <div className="max-w-md mx-auto space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400">
            <Upload className="h-6 w-6" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Drag file here or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload a previously exported tracker backup file (JSON) to restore records.
            </p>
          </div>
          
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono">
            <RefreshCcw className="h-3 w-3" />
            <span>Overwrites current local state</span>
          </div>
        </div>
      </div>
    </div>
  );
}
