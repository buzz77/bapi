/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Card, Skeleton } from '@douyinfe/semi-ui';
import { Activity, DollarSign, CheckCircle } from 'lucide-react';
import { renderQuota } from '../../../helpers';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

const UsageMetricsCards = ({ stat, loadingStat, showStat, logs, t }) => {
  const showSkeleton = useMinimumLoadingTime(loadingStat);
  const needSkeleton = !showStat || showSkeleton;

  // Calculate success rate
  const successRate = logs.length > 0
    ? ((logs.filter(log => log.type === 2).length / logs.length) * 100).toFixed(1)
    : 0;

  const metrics = [
    {
      icon: Activity,
      title: t('总调用次数'),
      value: needSkeleton ? null : `${stat.rpm || 0}`,
      color: 'rgb(251, 191, 36)',
      bgColor: 'rgba(251, 191, 36, 0.1)',
    },
    {
      icon: DollarSign,
      title: t('总费用'),
      value: needSkeleton ? null : renderQuota(stat.quota || 0),
      color: 'rgb(251, 191, 36)',
      bgColor: 'rgba(251, 191, 36, 0.1)',
    },
    {
      icon: CheckCircle,
      title: t('平均成功率'),
      value: needSkeleton ? null : `${successRate}%`,
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {metric.title}
                </div>
                {needSkeleton ? (
                  <Skeleton.Title style={{ width: 120, height: 32, borderRadius: 8 }} />
                ) : (
                  <div
                    className="text-3xl font-bold"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </div>
                )}
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: metric.bgColor }}
              >
                <Icon
                  size={24}
                  style={{ color: metric.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsageMetricsCards;
