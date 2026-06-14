import React from "react";

export default function QuickStatsCard({ icon: Icon, label, value, unit, color, bgColor, percentage }) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white text-xl`}>
          {Icon && <Icon />}
        </div>
        {percentage && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value} <span className="text-lg text-gray-500">{unit}</span>
      </p>
    </div>
  );
}
