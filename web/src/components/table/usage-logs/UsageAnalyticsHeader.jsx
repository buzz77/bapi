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
import { Typography, Button, Space } from '@douyinfe/semi-ui';
import { IconDownload } from '@douyinfe/semi-icons';

const UsageAnalyticsHeader = ({ t, logs }) => {
  const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <Typography.Title heading={3} style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
          {t('使用分析')}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {t('查看和分析 API 调用记录')}
        </Typography.Text>
      </div>

      {/* Export Buttons */}
      <Space>
        <Button
          icon={<IconDownload />}
          theme="light"
          type="tertiary"
          onClick={() => handleExport('csv')}
          className="glass-button"
        >
          {t('导出 CSV')}
        </Button>
        <Button
          icon={<IconDownload />}
          theme="light"
          type="tertiary"
          onClick={() => handleExport('excel')}
          className="glass-button"
        >
          {t('导出 Excel')}
        </Button>
      </Space>
    </div>
  );
};

export default UsageAnalyticsHeader;
