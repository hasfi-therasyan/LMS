'use client';

/**
 * Professional Stat Card Component
 * 
 * Modern stat card with gradient background and icon
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

const gradientClasses = {
  primary: 'from-primary-500 to-primary-600',
  accent: 'from-accent-500 to-accent-600',
  success: 'from-success-500 to-success-600',
  warning: 'from-warning-500 to-warning-600',
  danger: 'from-danger-500 to-danger-600',
};

const iconBgClasses = {
  primary: 'bg-primary-100 text-primary-600',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
};

export default function StatCard({ title, value, icon, gradient, trend, subtitle }: StatCardProps) {
  return (
    <div className="card-stat group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`stat-icon ${iconBgClasses[gradient]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center space-x-1 pt-3 border-t border-gray-100">
          <svg
            className={`w-4 h-4 ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={trend.isPositive ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M13 17l5-5m0 0l-5-5m5 5H6"}
            />
          </svg>
          <span className={`text-xs font-semibold ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
