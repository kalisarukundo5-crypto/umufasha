import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Sliders,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { runAcceptanceTests, TestCaseResult } from '../../utils/acceptanceTest';
import { formatRWF } from '../../utils/calculations';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackupJson,
    importBackupJson,
    loadAcceptanceScenario,
    resetAllData,
    auditLogs,
    t,
  } = useFinance();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [openingCash, setOpeningCash] = useState<number | ''>(settings.openingCashBalance);
  const [allowNegativeStock, setAllowNegativeStock] = useState(settings.allowNegativeStock);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Automated Tests State
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      contactPhone: contactPhone.trim(),
      openingCashBalance: typeof openingCash === 'number' ? openingCash : 0,
      allowNegativeStock,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunTests = () => {
    const results = runAcceptanceTests();
    setTestResults(results);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setRestoreStatus('Data restored successfully!');
      } else {
        setRestoreStatus('Error: Failed to restore backup. Invalid JSON file format.');
      }
      setTimeout(() => setRestoreStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const allPassed = testResults?.every((r) => r.passed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('settings')} &amp; Audit Verification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure business profile, audit financial calculation formulas, export backups, and inspect audit logs.
        </p>
      </div>

      {/* Automated Accounting Validation Suite (Section 11 & 12) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Automated Financial Formula &amp; Acceptance Test Suite
              </h2>
              <p className="text-xs text-slate-500">
                Verifies exact Section 12 formulas: 100kg Rice, 10k transport, 30kg sale, 5k expense, 10k savings transfer = 22k net profit.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunTests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Automated Test Suite</span>
          </button>
        </div>

        {testResults && (
          <div className="space-y-4 pt-2">
            <div
              className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
                allPassed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {allPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
                <span>
                  {allPassed
                    ? `100% Passed! All 10 Accounting Formulas & Acceptance Assertions Verified.`
                    : 'Some test cases failed.'}
                </span>
              </div>
              <span className="font-mono">
                {testResults.filter((r) => r.passed).length} / {testResults.length} Tests Passed
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Test ID</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Formula Assertion</th>
                    <th className="px-3 py-2 text-right">Expected</th>
                    <th className="px-3 py-2 text-right">Actual</th>
                    <th className="px-3 py-2 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {testResults.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tc.id}
                      </td>
                      <td className="px-3 py-2 text-slate-500">{tc.category}</td>
                      <td className="px-3 py-2">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {tc.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{tc.explanation}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {typeof tc.expected === 'number' ? formatRWF(tc.expected) : tc.expected}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {typeof tc.actual === 'number' ? formatRWF(tc.actual) : tc.actual}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tc.passed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {tc.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Business Profile &amp; Policies
            </h2>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business Trading Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opening Cash Balance (RWF)
              </label>
              <input
                type="number"
                min="0"
                value={openingCash}
                onChange={(e) =>
                  setOpeningCash(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400">Baseline cash in physical drawer / momo at app start</span>
            </div>

            {/* Inventory Oversell Policy Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Strict Inventory Guard (Prevent Negative Stock)
                </span>
                <span className="text-[11px] text-slate-500">
                  When enabled, sales are blocked if requested quantity exceeds available warehouse stock.
                </span>
              </div>
              <input
                type="checkbox"
                checked={!allowNegativeStock}
                onChange={(e) => setAllowNegativeStock(!e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              Save Profile &amp; Settings
            </button>
          </form>
        </div>

        {/* Data Persistence, Backups & Restoration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            Data Backup, Export &amp; Restoration
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            All your financial transactions are securely saved locally on this device. You can download a complete JSON backup at any time to preserve your records or transfer to another computer or phone.
          </p>

          {restoreStatus && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {restoreStatus}
            </div>
          )}

          <div className="space-y-3 pt-1">
            <button
              onClick={exportBackupJson}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download Full Data Backup (.JSON)
            </button>

            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-bold text-xs shadow-xs cursor-pointer">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Restore from JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Data Management
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data and start completely fresh?')) {
                    resetAllData();
                  }
                }}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
              >
                Clear All Data (Start Fresh)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Trail (Section 10 Requirement) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Immutable Financial Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} logged events</span>
        </div>

        <p className="text-xs text-slate-500">
          Maintains a tamper-evident audit history of all recorded purchases, sales, debt collections, and expense activities.
        </p>

        <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No audit events recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action === 'DELETE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.summary}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {log.entityId}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
