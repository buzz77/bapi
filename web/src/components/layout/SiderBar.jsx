import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLucideIcon } from '../../helpers/render';
import { ChevronLeft } from 'lucide-react';
import { useSidebarCollapsed } from '../../hooks/common/useSidebarCollapsed';
import { useSidebar } from '../../hooks/common/useSidebar';
import { useMinimumLoadingTime } from '../../hooks/common/useMinimumLoadingTime';
import { isAdmin, isRoot, showError } from '../../helpers';
import SkeletonWrapper from './components/SkeletonWrapper';

import { Nav, Divider, Button } from '@douyinfe/semi-ui';

const routerMap = {
  home: '/',
  channel: '/console/channel',
  token: '/console/token',
  redemption: '/console/redemption',
  topup: '/console/topup',
  user: '/console/user',
  log: '/console/log',
  midjourney: '/console/midjourney',
  setting: '/console/setting',
  about: '/about',
  detail: '/console',
  pricing: '/pricing',
  task: '/console/task',
  models: '/console/models',
  deployment: '/console/deployment',
  playground: '/console/playground',
  personal: '/console/personal',
};

const SiderBar = ({ onNavigate = () => {} }) => {
  const { t } = useTranslation();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const {
    isModuleVisible,
    hasSectionVisibleModules,
    loading: sidebarLoading,
  } = useSidebar();

  const showSkeleton = useMinimumLoadingTime(sidebarLoading, 200);

  const [selectedKeys, setSelectedKeys] = useState(['home']);
  const [chatItems, setChatItems] = useState([]);
  const [openedKeys, setOpenedKeys] = useState([]);
  const location = useLocation();
  const [routerMapState, setRouterMapState] = useState(routerMap);

  const workspaceItems = useMemo(() => {
    const items = [
      {
        text: t('数据看板'),
        itemKey: 'detail',
        to: '/detail',
        className:
          localStorage.getItem('enable_data_export') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('令牌管理'),
        itemKey: 'token',
        to: '/token',
      },
      {
        text: t('使用日志'),
        itemKey: 'log',
        to: '/log',
      },
      {
        text: t('绘图日志'),
        itemKey: 'midjourney',
        to: '/midjourney',
        className:
          localStorage.getItem('enable_drawing') === 'true'
            ? ''
            : 'tableHiddle',
      },
      {
        text: t('任务日志'),
        itemKey: 'task',
        to: '/task',
        className:
          localStorage.getItem('enable_task') === 'true' ? '' : 'tableHiddle',
      },
    ];

    return items.filter((item) => {
      const configVisible = isModuleVisible('console', item.itemKey);
      return configVisible;
    });
  }, [
    localStorage.getItem('enable_data_export'),
    localStorage.getItem('enable_drawing'),
    localStorage.getItem('enable_task'),
    t,
    isModuleVisible,
  ]);

  const financeItems = useMemo(() => {
    const items = [
      {
        text: t('钱包管理'),
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
      },
    ];

    return items.filter((item) => {
      const configVisible = isModuleVisible('personal', item.itemKey);
      return configVisible;
    });
  }, [t, isModuleVisible]);

  const adminItems = useMemo(() => {
    const items = [
      {
        text: t('渠道管理'),
        itemKey: 'channel',
        to: '/channel',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型管理'),
        itemKey: 'models',
        to: '/console/models',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('模型部署'),
        itemKey: 'deployment',
        to: '/deployment',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('兑换码管理'),
        itemKey: 'redemption',
        to: '/redemption',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('用户管理'),
        itemKey: 'user',
        to: '/user',
        className: isAdmin() ? '' : 'tableHiddle',
      },
      {
        text: t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        className: isRoot() ? '' : 'tableHiddle',
      },
    ];

    return items.filter((item) => {
      const configVisible = isModuleVisible('admin', item.itemKey);
      return configVisible;
    });
  }, [isAdmin(), isRoot(), t, isModuleVisible]);

  const chatMenuItems = useMemo(() => {
    const items = [
      {
        text: t('操练场'),
        itemKey: 'playground',
        to: '/playground',
      },
      {
        text: t('聊天'),
        itemKey: 'chat',
        items: chatItems,
      },
    ];

    return items.filter((item) => {
      const configVisible = isModuleVisible('chat', item.itemKey);
      return configVisible;
    });
  }, [chatItems, t, isModuleVisible]);

  const updateRouterMapWithChats = (chats) => {
    const newRouterMap = { ...routerMap };

    if (Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        newRouterMap['chat' + i] = '/console/chat/' + i;
      }
    }

    setRouterMapState(newRouterMap);
    return newRouterMap;
  };

  useEffect(() => {
    let chats = localStorage.getItem('chats');
    if (chats) {
      try {
        chats = JSON.parse(chats);
        if (Array.isArray(chats)) {
          let chatItems = [];
          for (let i = 0; i < chats.length; i++) {
            let shouldSkip = false;
            let chat = {};
            for (let key in chats[i]) {
              let link = chats[i][key];
              if (typeof link !== 'string') continue;
              if (link.startsWith('fluent')) {
                shouldSkip = true;
                break;
              }
              chat.text = key;
              chat.itemKey = 'chat' + i;
              chat.to = '/console/chat/' + i;
            }
            if (shouldSkip || !chat.text) continue;
            chatItems.push(chat);
          }
          setChatItems(chatItems);
          updateRouterMapWithChats(chats);
        }
      } catch (e) {
        showError('聊天数据解析失败');
      }
    }
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    let matchingKey = Object.keys(routerMapState).find(
      (key) => routerMapState[key] === currentPath,
    );

    if (!matchingKey && currentPath.startsWith('/console/chat/')) {
      const chatIndex = currentPath.split('/').pop();
      if (!isNaN(chatIndex)) {
        matchingKey = 'chat' + chatIndex;
      } else {
        matchingKey = 'chat';
      }
    }

    if (matchingKey) {
      setSelectedKeys([matchingKey]);
    }
  }, [location.pathname, routerMapState]);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  const SELECTED_COLOR = 'var(--brand-color)';

  const renderNavItem = (item) => {
    if (item.className === 'tableHiddle') return null;

    const isSelected = selectedKeys.includes(item.itemKey);
    // Dark mode text color handling for selected item
    const textColor = isSelected ? '#1A1A1A' : 'inherit';

    return (
      <Nav.Item
        key={item.itemKey}
        itemKey={item.itemKey}
        text={
          <span
            className={`truncate font-medium text-sm transition-colors ${isSelected ? 'font-bold' : ''}`}
            style={{ color: textColor }}
          >
            {item.text}
          </span>
        }
        icon={
          <div className={`sidebar-icon-container flex-shrink-0 transition-colors ${isSelected ? 'text-[#1A1A1A]' : 'text-slate-500 dark:text-slate-400'}`}>
            {getLucideIcon(item.itemKey, isSelected)}
          </div>
        }
        className={`${item.className} ${isSelected ? 'shadow-sm' : ''}`}
      />
    );
  };

  const renderSubItem = (item) => {
    if (item.items && item.items.length > 0) {
      const isSelected = selectedKeys.includes(item.itemKey);

      return (
        <Nav.Sub
          key={item.itemKey}
          itemKey={item.itemKey}
          text={
            <span
              className='truncate font-medium text-sm text-slate-700 dark:text-slate-300'
            >
              {item.text}
            </span>
          }
          icon={
            <div className='sidebar-icon-container flex-shrink-0 text-slate-500 dark:text-slate-400'>
              {getLucideIcon(item.itemKey, isSelected)}
            </div>
          }
        >
          {item.items.map((subItem) => {
            const isSubSelected = selectedKeys.includes(subItem.itemKey);
            const subTextColor = isSubSelected ? '#1A1A1A' : 'inherit';

            return (
              <Nav.Item
                key={subItem.itemKey}
                itemKey={subItem.itemKey}
                text={
                  <span
                    className={`truncate font-medium text-sm transition-colors ${isSubSelected ? 'font-bold' : ''}`}
                    style={{ color: subTextColor }}
                  >
                    {subItem.text}
                  </span>
                }
              />
            );
          })}
        </Nav.Sub>
      );
    } else {
      return renderNavItem(item);
    }
  };

  return (
    <div
      className='sidebar-container glass m-3 rounded-2xl border border-white/20 dark:border-white/5 overflow-hidden flex flex-col'
      style={{
        width: 'var(--sidebar-current-width)',
        height: 'calc(100vh - 24px)', // Leave margin top/bottom
        transition: 'width 0.3s ease',
      }}
    >
      <SkeletonWrapper
        loading={showSkeleton}
        type='sidebar'
        className='flex-1 overflow-hidden flex flex-col'
        collapsed={collapsed}
        showAdmin={isAdmin()}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          <Nav
            className='sidebar-nav !bg-transparent'
            defaultIsCollapsed={collapsed}
            isCollapsed={collapsed}
            onCollapseChange={toggleCollapsed}
            selectedKeys={selectedKeys}
            // Overriding styles via classNames defined in index.css
            itemStyle={{ borderRadius: '12px', margin: '4px 8px' }}
            hoverStyle={{ backgroundColor: 'rgba(var(--semi-grey-1), 0.5)' }}
            selectedStyle={{ backgroundColor: 'var(--brand-color)', color: '#1A1A1A' }}
            renderWrapper={({ itemElement, props }) => {
              const to =
                routerMapState[props.itemKey] || routerMap[props.itemKey];

              if (!to) return itemElement;

              return (
                <Link
                  style={{ textDecoration: 'none' }}
                  to={to}
                  onClick={onNavigate}
                >
                  {itemElement}
                </Link>
              );
            }}
            onSelect={(key) => {
              if (openedKeys.includes(key.itemKey)) {
                setOpenedKeys(openedKeys.filter((k) => k !== key.itemKey));
              }
              setSelectedKeys([key.itemKey]);
            }}
            openKeys={openedKeys}
            onOpenChange={(data) => {
              setOpenedKeys(data.openKeys);
            }}
          >
            {/* Chat Section */}
            {hasSectionVisibleModules('chat') && (
              <div className='sidebar-section px-2'>
                {!collapsed && (
                  <div className='sidebar-group-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2'>{t('聊天')}</div>
                )}
                {chatMenuItems.map((item) => renderSubItem(item))}
              </div>
            )}

            {/* Console Section */}
            {hasSectionVisibleModules('console') && (
              <>
                <div className="my-2 mx-4 border-t border-slate-200/50 dark:border-slate-700/50"></div>
                <div className="px-2">
                  {!collapsed && (
                    <div className='sidebar-group-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2'>{t('控制台')}</div>
                  )}
                  {workspaceItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}

            {/* Personal Section */}
            {hasSectionVisibleModules('personal') && (
              <>
                <div className="my-2 mx-4 border-t border-slate-200/50 dark:border-slate-700/50"></div>
                <div className="px-2">
                  {!collapsed && (
                    <div className='sidebar-group-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2'>{t('个人中心')}</div>
                  )}
                  {financeItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}

            {/* Admin Section */}
            {isAdmin() && hasSectionVisibleModules('admin') && (
              <>
                <div className="my-2 mx-4 border-t border-slate-200/50 dark:border-slate-700/50"></div>
                <div className="px-2">
                  {!collapsed && (
                    <div className='sidebar-group-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 pt-2'>{t('管理员')}</div>
                  )}
                  {adminItems.map((item) => renderNavItem(item))}
                </div>
              </>
            )}
          </Nav>
        </div>
      </SkeletonWrapper>

      {/* Footer Collapse Button */}
      <div className='p-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-black/20 backdrop-blur-sm'>
        <SkeletonWrapper
          loading={showSkeleton}
          type='button'
          width={collapsed ? 36 : '100%'}
          height={32}
          className='w-full'
        >
          <Button
            theme='borderless'
            type='tertiary'
            className={`w-full hover:bg-black/5 dark:hover:bg-white/10 !rounded-lg transition-colors ${collapsed ? 'px-0 justify-center' : 'px-4 justify-start'}`}
            icon={
              <ChevronLeft
                size={18}
                className={`text-slate-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              />
            }
            onClick={toggleCollapsed}
          >
            {!collapsed && <span className="ml-2 text-slate-600 dark:text-slate-300 font-medium">{t('收起侧边栏')}</span>}
          </Button>
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default SiderBar;
