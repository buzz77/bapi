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

import React, { useState } from 'react';
import { Button, DatePicker } from '@douyinfe/semi-ui';
import { timestamp2string, getTodayStartTimestamp } from '../../../helpers';

const UsageTimeFilter = ({ formApi, refresh, loading, t }) => {
  const [activeFilter, setActiveFilter] = useState('today');

  const getTimeRange = (filter) => {
    const now = new Date();
    let start;

    switch (filter) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return null;
    }

    return [
      timestamp2string(start.getTime() / 1000),
      timestamp2string(now.getTime() / 1000 + 3600),
    ];
  };

  const handleQuickFilter = (filter) => {
    setActiveFilter(filter);
    const range = getTimeRange(filter);
    if (range && formApi) {
      formApi.setValue('dateRange', range);
      setTimeout(() => {
        refresh();
      }, 100);
    }
  };

  const handleCustomChange = (value) => {
    setActiveFilter('custom');
    if (formApi && value) {
      formApi.setValue('dateRange', value);
      setTimeout(() => {
        refresh();
      }, 100);
    }
  };

  const filterButtons = [
    { key: 'today', label: t('今天') },
    { key: 'week', label: t('本周') },
    { key: 'month', label: t('本月') },
  ];

  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              type={activeFilter === btn.key ? 'primary' : 'tertiary'}
              theme="light"
              onClick={() => handleQuickFilter(btn.key)}
              disabled={loading}
              className={activeFilter === btn.key ? 'brand-button' : 'glass-button'}
              size="small"
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-2 flex-1">
          <DatePicker
            type="dateTimeRange"
            placeholder={[t('开始时间'), t('结束时间')]}
            onChange={handleCustomChange}
            density="compact"
            className="flex-1 max-w-md"
            style={{
              backgroundColor: activeFilter === 'custom' ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageTimeFilter;
