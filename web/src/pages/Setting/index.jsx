import React, { useEffect, useState } from 'react';
import { Layout, TabPane, Tabs } from '@douyinfe/semi-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Calculator,
  Gauge,
  Shapes,
  Cog,
  MoreHorizontal,
  LayoutDashboard,
  MessageSquare,
  Palette,
  CreditCard,
  Server,
} from 'lucide-react';

import SystemSetting from '../../components/settings/SystemSetting';
import { isRoot } from '../../helpers';
import OtherSetting from '../../components/settings/OtherSetting';
import OperationSetting from '../../components/settings/OperationSetting';
import RateLimitSetting from '../../components/settings/RateLimitSetting';
import ModelSetting from '../../components/settings/ModelSetting';
import DashboardSetting from '../../components/settings/DashboardSetting';
import RatioSetting from '../../components/settings/RatioSetting';
import ChatsSetting from '../../components/settings/ChatsSetting';
import DrawingSetting from '../../components/settings/DrawingSetting';
import PaymentSetting from '../../components/settings/PaymentSetting';
import ModelDeploymentSetting from '../../components/settings/ModelDeploymentSetting';

const Setting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabActiveKey, setTabActiveKey] = useState('1');
  let panes = [];

  if (isRoot()) {
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={16} />
          {t('运营设置')}
        </span>
      ),
      content: <OperationSetting />,
      itemKey: 'operation',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={16} />
          {t('仪表盘设置')}
        </span>
      ),
      content: <DashboardSetting />,
      itemKey: 'dashboard',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} />
          {t('聊天设置')}
        </span>
      ),
      content: <ChatsSetting />,
      itemKey: 'chats',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={16} />
          {t('绘图设置')}
        </span>
      ),
      content: <DrawingSetting />,
      itemKey: 'drawing',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} />
          {t('支付设置')}
        </span>
      ),
      content: <PaymentSetting />,
      itemKey: 'payment',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={16} />
          {t('分组与模型定价')}
        </span>
      ),
      content: <RatioSetting />,
      itemKey: 'ratio',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={16} />
          {t('速率限制')}
        </span>
      ),
      content: <RateLimitSetting />,
      itemKey: 'ratelimit',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shapes size={16} />
          {t('模型相关')}
        </span>
      ),
      content: <ModelSetting />,
      itemKey: 'models',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={16} />
          {t('模型部署')}
        </span>
      ),
      content: <ModelDeploymentSetting />,
      itemKey: 'model-deployment',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cog size={16} />
          {t('系统设置')}
        </span>
      ),
      content: <SystemSetting />,
      itemKey: 'system',
    });
    panes.push({
      tab: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MoreHorizontal size={16} />
          {t('其他设置')}
        </span>
      ),
      content: <OtherSetting />,
      itemKey: 'other',
    });
  }
  const onChangeTab = (key) => {
    setTabActiveKey(key);
    navigate(`?tab=${key}`);
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setTabActiveKey(tab);
    } else {
      onChangeTab('operation');
    }
  }, [location.search]);

  return (
    <div className='h-full px-2 md:px-6 pb-6'>
      <Layout>
        <Layout.Content>
          <div className="bg-[var(--semi-color-bg-1)] rounded-lg border border-[var(--semi-color-border)] p-2 md:p-6 min-h-[calc(100vh-100px)]">
            <Tabs
              type='line'
              activeKey={tabActiveKey}
              onChange={(key) => onChangeTab(key)}
              tabPaneMotion={false}
              className="settings-tabs"
            >
              {panes.map((pane) => (
                <TabPane itemKey={pane.itemKey} tab={pane.tab} key={pane.itemKey}>
                  <div className="pt-4 md:pt-6 animate-fade-in">
                    {tabActiveKey === pane.itemKey && pane.content}
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </div>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export default Setting;
