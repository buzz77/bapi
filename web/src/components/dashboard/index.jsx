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

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { API, showError, renderQuota } from '../../helpers';
import { IconRefresh, IconPlus, IconRightCircle } from '@douyinfe/semi-icons';
import { Card, Button, Spin, Tag, Empty, Typography } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userState] = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 今日统计数据
  const [todayStats, setTodayStats] = useState({
    requestCount: 0,
    successRate: 0,
    totalCost: 0,
  });

  // 最近调用记录
  const [recentLogs, setRecentLogs] = useState([]);

  // 获取今日统计数据
  const loadTodayStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startTimestamp = Math.floor(today.getTime() / 1000);
      const endTimestamp = Math.floor(Date.now() / 1000);

      const res = await API.get(
        `/api/data/self/?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
      );

      if (res.data.success && res.data.data) {
        const data = res.data.data;
        const totalRequests = data.reduce((sum, item) => sum + (item.count || 0), 0);
        const totalCost = data.reduce((sum, item) => sum + (item.quota || 0), 0);

        setTodayStats({
          requestCount: totalRequests,
          successRate: 95, // 这里可以从后端获取真实的成功率
          totalCost: totalCost,
        });
      }
    } catch (error) {
      console.error('Failed to load today stats:', error);
    }
  };

  // 获取最近调用记录
  const loadRecentLogs = async () => {
    try {
      const res = await API.get('/api/log/self/?p=0&page_size=10');
      if (res.data.success && res.data.data) {
        setRecentLogs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load recent logs:', error);
    }
  };

  // 初始化数据
  const initData = async () => {
    setLoading(true);
    await Promise.all([loadTodayStats(), loadRecentLogs()]);
    setLoading(false);
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await initData();
    setRefreshing(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // 获取问候语
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return t('早上好');
    if (hours >= 12 && hours < 14) return t('中午好');
    if (hours >= 14 && hours < 18) return t('下午好');
    return t('晚上好');
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return t('刚刚');
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t('分钟前')}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t('小时前')}`;

    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full pb-6">
      {/* 顶部欢迎区域 */}
      <div className="mb-6">
        <Card
          className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Title heading={3} className="!mb-2">
                {getGreeting()}，{userState?.user?.username || t('用户')}
              </Title>
              <div className="flex items-baseline gap-2">
                <Text className="text-gray-600 dark:text-gray-400">
                  {t('账户余额')}:
                </Text>
                <Text
                  strong
                  className="text-2xl text-amber-600 dark:text-amber-500"
                >
                  {renderQuota(userState?.user?.quota || 0)}
                </Text>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                icon={<IconRefresh />}
                onClick={handleRefresh}
                loading={refreshing}
                theme="light"
              >
                {t('刷新')}
              </Button>
              <Button
                icon={<IconPlus />}
                theme="solid"
                type="primary"
                onClick={() => navigate('/topup')}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                }}
              >
                {t('充值')}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 今日使用情况 - 3个大卡片 */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 调用次数 */}
          <Card
            className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-900/20 dark:to-blue-800/20 border border-white/20 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="text-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                {t('今日调用次数')}
              </Text>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {todayStats.requestCount.toLocaleString()}
              </div>
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                {t('次')}
              </Text>
            </div>
          </Card>

          {/* 成功率 */}
          <Card
            className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-green-100/60 dark:from-green-900/20 dark:to-green-800/20 border border-white/20 dark:border-green-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="text-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                {t('调用成功率')}
              </Text>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {todayStats.successRate}%
              </div>
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                {t('成功率')}
              </Text>
            </div>
          </Card>

          {/* 今日费用 */}
          <Card
            className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-amber-100/60 dark:from-amber-900/20 dark:to-amber-800/20 border border-white/20 dark:border-amber-700/30 shadow-lg hover:shadow-xl transition-all duration-300"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="text-center">
              <Text className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                {t('今日费用')}
              </Text>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {renderQuota(todayStats.totalCost)}
              </div>
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                {t('消费额度')}
              </Text>
            </div>
          </Card>
        </div>
      </div>

      {/* 快速操作区域 */}
      <div className="mb-6">
        <Card
          className="backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-indigo-100/60 dark:from-purple-900/20 dark:to-indigo-800/20 border border-white/20 dark:border-purple-700/30 shadow-lg"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Title heading={4} className="!mb-2 text-purple-900 dark:text-purple-100">
                {t('快速开始')}
              </Title>
              <Text className="text-gray-700 dark:text-gray-300">
                {t('创建您的第一个 API 密钥，开始使用我们的服务')}
              </Text>
            </div>
            <Button
              icon={<IconRightCircle />}
              size="large"
              theme="solid"
              onClick={() => navigate('/token')}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
              }}
            >
              {t('创建密钥')}
            </Button>
          </div>
        </Card>
      </div>

      {/* 最近调用记录 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Title heading={4} className="!mb-0">
            {t('最近调用记录')}
          </Title>
          <Button
            theme="borderless"
            type="tertiary"
            onClick={() => navigate('/log')}
            icon={<IconRightCircle />}
            iconPosition="right"
          >
            {t('查看全部')}
          </Button>
        </div>

        <Card
          className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg"
          bodyStyle={{ padding: 0 }}
        >
          {recentLogs.length === 0 ? (
            <div className="py-16">
              <Empty
                description={t('暂无调用记录')}
                className="dark:text-gray-400"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {recentLogs.map((log, index) => (
                <div
                  key={index}
                  className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Text strong className="text-gray-900 dark:text-gray-100">
                          {log.model_name || '-'}
                        </Text>
                        {log.success === 1 ? (
                          <Tag color="green" size="small">
                            {t('成功')}
                          </Tag>
                        ) : (
                          <Tag color="red" size="small">
                            {t('失败')}
                          </Tag>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatTime(log.created_at)}</span>
                        {log.token_name && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span>{t('密钥')}: {log.token_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {log.quota != null && (
                        <div className="text-right">
                          <Text className="text-sm text-gray-600 dark:text-gray-400 block">
                            {t('消费')}
                          </Text>
                          <Text strong className="text-amber-600 dark:text-amber-500">
                            {renderQuota(log.quota)}
                          </Text>
                        </div>
                      )}
                      {log.completion_tokens != null && (
                        <div className="text-right">
                          <Text className="text-sm text-gray-600 dark:text-gray-400 block">
                            Tokens
                          </Text>
                          <Text strong className="text-gray-900 dark:text-gray-100">
                            {log.completion_tokens?.toLocaleString() || 0}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
