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

import React, { useEffect, useState, useContext } from 'react';
import {
  API,
  showError,
  showSuccess,
  renderQuota,
} from '../../helpers';
import { Button, Input, Table, Card, Radio, RadioGroup, Spin, Typography, Space } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import { IconAlipay, IconWechatpay, IconCreditCard, IconTick, IconClock as IconTime, IconClose as IconClear } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

const TopUp = () => {
  const { t } = useTranslation();
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);

  // 充值状态
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 配置信息
  const [priceRatio, setPriceRatio] = useState(1);
  const [payMethods, setPayMethods] = useState([]);
  const [topupHistory, setTopupHistory] = useState([]);

  // 预设金额选项
  const amountOptions = [
    { value: 50, label: '¥50' },
    { value: 100, label: '¥100' },
    { value: 500, label: '¥500' },
    { value: 'custom', label: t('自定义金额') },
  ];

  // 支付方式图标映射
  const paymentIcons = {
    alipay: <IconAlipay size="large" />,
    wxpay: <IconWechatpay size="large" />,
    stripe: <IconCreditCard size="large" />,
  };

  // 支付方式名称映射
  const paymentNames = {
    alipay: t('支付宝'),
    wxpay: t('微信支付'),
    stripe: t('银行卡'),
  };

  // 状态图标映射
  const statusIcons = {
    success: <IconTickCircle style={{ color: 'var(--semi-color-success)' }} />,
    pending: <IconClock style={{ color: 'var(--semi-color-warning)' }} />,
    failed: <IconClose style={{ color: 'var(--semi-color-danger)' }} />,
  };

  // 获取用户信息
  const getUserQuota = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
      } else {
        showError(message);
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
  };

  // 获取充值配置
  const getTopupConfig = async () => {
    try {
      const res = await API.get('/api/user/topup/info');
      const { success, data } = res.data;
      if (success) {
        setPriceRatio(data.price || 1);

        // 处理支付方式
        let methods = data.pay_methods || [];
        if (typeof methods === 'string') {
          methods = JSON.parse(methods);
        }
        methods = methods.filter(m => m.name && m.type);
        setPayMethods(methods);

        if (methods.length > 0) {
          setPaymentMethod(methods[0].type);
        }
      }
    } catch (err) {
      console.error('获取充值配置失败:', err);
    }
  };

  // 获取充值记录
  const getTopupHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get('/api/user/topup/history?p=0&size=10');
      const { success, data } = res.data;
      if (success && data) {
        setTopupHistory(data.data || []);
      }
    } catch (err) {
      console.error('获取充值记录失败:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 处理充值
  const handleTopup = async () => {
    const amount = selectedAmount === 'custom'
      ? parseFloat(customAmount)
      : selectedAmount;

    if (!amount || amount <= 0) {
      showError(t('请输入有效的充值金额'));
      return;
    }

    if (!paymentMethod) {
      showError(t('请选择支付方式'));
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/pay', {
        amount: amount,
        payment_method: paymentMethod,
      });

      if (res?.data?.message === 'success') {
        const { data, url } = res.data;

        // 提交支付表单
        const form = document.createElement('form');
        form.action = url;
        form.method = 'POST';
        form.target = '_blank';

        for (let key in data) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        showSuccess(t('正在跳转到支付页面...'));
      } else {
        showError(res?.data?.data || t('支付请求失败'));
      }
    } catch (err) {
      showError(t('支付请求失败'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 计算预计可用次数（假设平均每次调用消耗0.01元）
  const calculateUsageCount = (quota) => {
    const avgCostPerCall = 0.01;
    return Math.floor((quota / 500000) / avgCostPerCall);
  };

  // 充值记录表格列
  const columns = [
    {
      title: t('时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time * 1000).toLocaleString('zh-CN'),
    },
    {
      title: t('金额'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount}`,
    },
    {
      title: t('方式'),
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => paymentNames[method] || method,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Space>
          {statusIcons[status]}
          <Text>{status === 'success' ? t('成功') : status === 'pending' ? t('处理中') : t('失败')}</Text>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getUserQuota();
    getTopupConfig();
    getTopupHistory();
  }, []);

  const currentAmount = selectedAmount === 'custom'
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  const actualPayment = currentAmount * priceRatio;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 余额卡片 */}
      <div className="relative overflow-hidden rounded-2xl p-8 backdrop-blur-xl bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-yellow-500/20 border border-amber-400/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
        <div className="relative z-10">
          <Text className="text-amber-100/80 text-sm mb-2 block">{t('当前余额')}</Text>
          <div className="flex items-baseline gap-3 mb-4">
            <Title heading={1} className="text-white font-bold m-0">
              {renderQuota(userState?.user?.quota || 0)}
            </Title>
          </div>
          <div className="flex items-center gap-2 text-amber-100/70">
            <Text className="text-sm">
              {t('预计可用次数')}：约 {calculateUsageCount(userState?.user?.quota || 0).toLocaleString()} {t('次')}
            </Text>
          </div>
        </div>
      </div>

      {/* 充值表单 */}
      <Card
        className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
        bodyStyle={{ padding: '32px' }}
      >
        <Space vertical spacing="loose" className="w-full">
          {/* 充值金额选择 */}
          <div>
            <Title heading={5} className="text-white mb-4">{t('选择充值金额')}</Title>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amountOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAmount(option.value)}
                  className={`
                    relative p-4 rounded-xl transition-all duration-200
                    backdrop-blur-xl border-2
                    ${selectedAmount === option.value
                      ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <Text className={`text-lg font-semibold ${selectedAmount === option.value ? 'text-amber-300' : 'text-white/80'}`}>
                    {option.label}
                  </Text>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义金额输入 */}
          {selectedAmount === 'custom' && (
            <div>
              <Input
                prefix="¥"
                size="large"
                placeholder={t('请输入充值金额')}
                value={customAmount}
                onChange={setCustomAmount}
                type="number"
                className="backdrop-blur-xl bg-white/10 border-white/20 text-white"
              />
            </div>
          )}

          {/* 支付方式选择 */}
          <div>
            <Title heading={5} className="text-white mb-4">{t('选择支付方式')}</Title>
            <RadioGroup
              type="button"
              buttonSize="large"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {payMethods.map((method) => (
                  <Radio
                    key={method.type}
                    value={method.type}
                    className={`
                      relative p-4 rounded-xl transition-all duration-200
                      backdrop-blur-xl border-2
                      ${paymentMethod === method.type
                        ? 'bg-amber-500/30 border-amber-400'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }
                    `}
                  >
                    <Space align="center">
                      {paymentIcons[method.type]}
                      <Text className={`font-medium ${paymentMethod === method.type ? 'text-amber-300' : 'text-white/80'}`}>
                        {method.name}
                      </Text>
                    </Space>
                  </Radio>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* 金额显示 */}
          {currentAmount > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <Space className="w-full justify-between">
                <Text className="text-white/70">{t('实付金额')}</Text>
                <Text className="text-amber-300 text-xl font-bold">¥{actualPayment.toFixed(2)}</Text>
              </Space>
            </div>
          )}

          {/* 充值按钮 */}
          <Button
            size="large"
            block
            onClick={handleTopup}
            loading={loading}
            disabled={!currentAmount || currentAmount <= 0}
            className="h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-0 shadow-lg shadow-amber-500/30"
          >
            {loading ? t('处理中...') : t('立即充值')}
          </Button>
        </Space>
      </Card>

      {/* 充值记录 */}
      <Card
        className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
        title={<Title heading={5} className="text-white m-0">{t('充值记录')}</Title>}
        bodyStyle={{ padding: 0 }}
      >
        <Spin spinning={historyLoading}>
          <Table
            columns={columns}
            dataSource={topupHistory}
            pagination={false}
            empty={
              <div className="py-8 text-center">
                <Text className="text-white/50">{t('暂无充值记录')}</Text>
              </div>
            }
            className="topup-history-table"
            rowKey="id"
          />
        </Spin>
      </Card>

      <style jsx global>{`
        .topup-history-table .semi-table {
          background: transparent;
        }
        .topup-history-table .semi-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        .topup-history-table .semi-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
        }
        .topup-history-table .semi-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05);
        }
        .topup-history-table .semi-table-row:last-child > td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default TopUp;
