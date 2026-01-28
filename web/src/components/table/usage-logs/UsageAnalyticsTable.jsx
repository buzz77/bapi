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

import React, { useMemo } from 'react';
import { Empty, Pagination, Tag } from '@douyinfe/semi-ui';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import CardTable from '../../common/ui/CardTable';
import { renderQuota, renderModelTag } from '../../../helpers';
import { useIsMobile } from '../../../hooks/common/useIsMobile';

// Helper function to format relative time
const formatRelativeTime = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return `${Math.floor(diff / 2592000)}个月前`;
};

// Status indicator component
const StatusIndicator = ({ success, t }) => {
  if (success) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
        <CheckCircle size={16} />
        <span className="text-sm font-medium">{t('成功')}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
      <XCircle size={16} />
      <span className="text-sm font-medium">{t('失败')}</span>
    </div>
  );
};

// Use time component
const UseTimeIndicator = ({ seconds, t }) => {
  let color = 'green';
  if (seconds > 100) color = 'orange';
  if (seconds > 300) color = 'red';

  return (
    <div className="flex items-center gap-1.5">
      <Clock size={14} className="text-gray-400" />
      <Tag color={color} size="small" shape="circle">
        {seconds}s
      </Tag>
    </div>
  );
};

const UsageAnalyticsTable = ({
  logs,
  loading,
  activePage,
  pageSize,
  logCount,
  handlePageChange,
  handlePageSizeChange,
  copyText,
  t,
}) => {
  const isMobile = useIsMobile();

  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'time',
        title: t('时间'),
        dataIndex: 'created_at',
        width: isMobile ? 100 : 140,
        render: (timestamp) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatRelativeTime(timestamp)}
          </span>
        ),
      },
      {
        key: 'token',
        title: t('密钥名称'),
        dataIndex: 'token_name',
        width: isMobile ? 120 : 180,
        render: (text) => (
          <Tag
            color="grey"
            shape="circle"
            onClick={(event) => {
              copyText(event, text);
            }}
            className="cursor-pointer"
          >
            {text}
          </Tag>
        ),
      },
      {
        key: 'model',
        title: t('模型'),
        dataIndex: 'model_name',
        width: isMobile ? 150 : 200,
        render: (text, record) => {
          return record.type === 0 || record.type === 2 || record.type === 5 ? (
            renderModelTag(text, {
              onClick: (event) => {
                copyText(event, text).then(() => {});
              },
            })
          ) : (
            <span>-</span>
          );
        },
      },
      {
        key: 'status',
        title: t('状态'),
        dataIndex: 'type',
        width: 100,
        render: (type) => <StatusIndicator success={type === 2} t={t} />,
      },
      {
        key: 'use_time',
        title: t('耗时'),
        dataIndex: 'use_time',
        width: 100,
        render: (time, record) => {
          return record.type === 2 || record.type === 5 ? (
            <UseTimeIndicator seconds={parseInt(time)} t={t} />
          ) : (
            <span>-</span>
          );
        },
      },
      {
        key: 'cost',
        title: t('费用'),
        dataIndex: 'quota',
        width: 120,
        render: (quota, record) => {
          return record.type === 0 || record.type === 2 || record.type === 5 ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {renderQuota(quota, 6)}
            </span>
          ) : (
            <span>-</span>
          );
        },
      },
    ];

    return baseColumns;
  }, [isMobile, t, copyText]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('调用记录')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('共')} {logCount} {t('条记录')}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <CardTable
          columns={columns}
          dataSource={logs}
          rowKey="key"
          loading={loading}
          scroll={isMobile ? { x: 800 } : undefined}
          size="middle"
          empty={
            <Empty
              image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
              darkModeImage={
                <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
              }
              description={t('暂无数据')}
              style={{ padding: 40 }}
            />
          }
          hidePagination={true}
        />
      </div>

      {/* Pagination */}
      {logCount > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center sm:justify-end">
          <Pagination
            currentPage={activePage}
            pageSize={pageSize}
            total={logCount}
            pageSizeOpts={[10, 20, 50, 100]}
            showSizeChanger
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            size={isMobile ? 'small' : 'default'}
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default UsageAnalyticsTable;
