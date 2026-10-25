import React, { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  badge?: string;
  tooltip?: string;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon,
  badge,
  tooltip,
  variant = 'blue',
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
      valueColor: 'text-emerald-900 dark:text-emerald-300',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800/60',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400',
      valueColor: 'text-rose-900 dark:text-rose-300',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/60',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
      valueColor: 'text-amber-900 dark:text-amber-300',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800/60',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
      valueColor: 'text-blue-900 dark:text-blue-300',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800/60',
      iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
      valueColor: 'text-purple-900 dark:text-purple-300',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    },
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-800/40',
      border: 'border-slate-200 dark:border-slate-700',
      iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      valueColor: 'text-slate-900 dark:text-slate-100',
      badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${
        colorStyles.border
      } ${colorStyles.bg} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : 'shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {tooltip && (
              <span className="group relative cursor-help" title={tooltip}>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </span>
            )}
          </div>
          <div className={`text-2xl font-extrabold tracking-tight ${colorStyles.valueColor}`}>
            {value}
          </div>
        </div>

        {icon && (
          <div className={`p-2.5 rounded-xl ${colorStyles.iconBg} shrink-0 shadow-xs`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtext && (
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={subtext}>
            {subtext}
          </span>
        )}
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-medium ${colorStyles.badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
