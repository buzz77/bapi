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

  // 普通用户核心功能菜单（5个主要功能）
  const coreItems = useMemo(() => {
    const items = [
      {
        text: '📊 ' + t('概览'),
        itemKey: 'detail',
        to: '/detail',
      },
      {
        text: '🔑 ' + t('API 密钥'),
        itemKey: 'token',
        to: '/token',
      },
      {
        text: '📈 ' + t('使用分析'),
        itemKey: 'log',
        to: '/log',
      },
      {
        text: '💰 ' + t('账户充值'),
        itemKey: 'topup',
        to: '/topup',
      },
      {
        text: '⚙️ ' + t('个人设置'),
        itemKey: 'personal',
        to: '/personal',
      },
    ];

    return items.filter((item) => {
      const section = ['detail', 'token', 'log'].includes(item.itemKey) ? 'console' : 'personal';
      const configVisible = isModuleVisible(section, item.itemKey);
      return configVisible;
    });
  }, [t, isModuleVisible]);

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

  // 管理员菜单（只有管理员可见）
  const adminItems = useMemo(() => {
    const items = [
      {
        text: '🔌 ' + t('渠道管理'),
        itemKey: 'channel',
        to: '/channel',
      },
      {
        text: '🤖 ' + t('模型管理'),
        itemKey: 'models',
        to: '/console/models',
      },
      {
        text: '🚀 ' + t('模型部署'),
        itemKey: 'deployment',
        to: '/deployment',
      },
      {
        text: '🎫 ' + t('兑换码'),
        itemKey: 'redemption',
        to: '/redemption',
      },
      {
        text: '👥 ' + t('用户管理'),
        itemKey: 'user',
        to: '/user',
      },
      {
        text: '🛠️ ' + t('系统设置'),
        itemKey: 'setting',
        to: '/setting',
        className: isRoot() ? '' : 'tableHiddle', // 只有 root 可见
      },
    ];

    return items.filter((item) => {
      // 检查是否是管理员
      if (!isAdmin() && !isRoot()) return false;

      // 系统设置只有 root 可见
      if (item.itemKey === 'setting' && !isRoot()) return false;

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

  const SELECTED_COLOR = '#F59E0B'; // Amber-500

  const renderNavItem = (item) => {
    if (item.className === 'tableHiddle') return null;

    const isSelected = selectedKeys.includes(item.itemKey);
    // Dark mode text color handling for selected item - use dark text on amber background
    const textColor = isSelected ? '#1F2937' : 'inherit';

    return (
      <Nav.Item
        key={item.itemKey}
        itemKey={item.itemKey}
        text={
          <span
            className={`truncate text-sm transition-all duration-200 ${
              isSelected
                ? 'font-semibold text-gray-900 dark:text-gray-900'
                : 'font-medium text-slate-700 dark:text-slate-300'
            }`}
            style={{ color: isSelected ? textColor : undefined }}
          >
            {item.text}
          </span>
        }
        icon={
          <div className={`sidebar-icon-container flex-shrink-0 transition-all duration-200 ${
            isSelected
              ? 'text-gray-900 dark:text-gray-900 scale-110'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {getLucideIcon(item.itemKey, isSelected)}
          </div>
        }
        className={`nav-item-custom ${item.className} ${isSelected ? 'nav-item-selected' : ''}`}
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
              className='truncate font-medium text-sm text-slate-700 dark:text-slate-300 transition-colors duration-200'
            >
              {item.text}
            </span>
          }
          icon={
            <div className='sidebar-icon-container flex-shrink-0 text-slate-500 dark:text-slate-400 transition-all duration-200'>
              {getLucideIcon(item.itemKey, isSelected)}
            </div>
          }
          className='nav-sub-custom'
        >
          {item.items.map((subItem) => {
            const isSubSelected = selectedKeys.includes(subItem.itemKey);
            const subTextColor = isSubSelected ? '#1F2937' : 'inherit';

            return (
              <Nav.Item
                key={subItem.itemKey}
                itemKey={subItem.itemKey}
                text={
                  <span
                    className={`truncate text-sm transition-all duration-200 ${
                      isSubSelected
                        ? 'font-semibold text-gray-900 dark:text-gray-900'
                        : 'font-medium text-slate-600 dark:text-slate-400'
                    }`}
                    style={{ color: isSubSelected ? subTextColor : undefined }}
                  >
                    {subItem.text}
                  </span>
                }
                className={`nav-item-custom ${isSubSelected ? 'nav-item-selected' : ''}`}
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
      className='sidebar-container'
      style={{
        width: 'var(--sidebar-current-width)',
        height: '100%',
        transition: 'width 0.2s ease',
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
            itemStyle={{
              borderRadius: '8px',
              margin: '3px 10px',
              padding: '8px 12px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            hoverStyle={{
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              transform: 'translateX(2px)'
            }}
            selectedStyle={{
              backgroundColor: '#F59E0B',
              color: '#1F2937',
              boxShadow: '0 1px 3px 0 rgba(245, 158, 11, 0.3), 0 1px 2px -1px rgba(245, 158, 11, 0.3)'
            }}
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
            {/* 普通用户：只显示核心功能 */}
            {!isAdmin() && !isRoot() && (
              <div className="px-1">
                {!collapsed && (
                  <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 pt-3 transition-colors duration-200'>{t('核心功能')}</div>
                )}
                {coreItems.map((item) => renderNavItem(item))}
              </div>
            )}

            {/* 管理员：显示完整菜单 */}
            {(isAdmin() || isRoot()) && (
              <>
                {/* Chat Section */}
                {hasSectionVisibleModules('chat') && (
                  <div className='sidebar-section px-1'>
                    {!collapsed && (
                      <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-3 pt-3 transition-colors duration-200'>{t('聊天')}</div>
                    )}
                    {chatMenuItems.map((item) => renderSubItem(item))}
                  </div>
                )}

                {/* Console Section */}
                {hasSectionVisibleModules('console') && (
                  <>
                    <div className="my-4 mx-3 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200"></div>
                    <div className="px-1">
                      {!collapsed && (
                        <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 pt-1 transition-colors duration-200'>{t('控制台')}</div>
                      )}
                      {workspaceItems.map((item) => renderNavItem(item))}
                    </div>
                  </>
                )}

                {/* Personal Section */}
                {hasSectionVisibleModules('personal') && (
                  <>
                    <div className="my-4 mx-3 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200"></div>
                    <div className="px-1">
                      {!collapsed && (
                        <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 pt-1 transition-colors duration-200'>{t('个人中心')}</div>
                      )}
                      {financeItems.map((item) => renderNavItem(item))}
                    </div>
                  </>
                )}

                {/* Admin Section */}
                {hasSectionVisibleModules('admin') && adminItems.length > 0 && (
                  <>
                    <div className="my-4 mx-3 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200"></div>
                    <div className="px-1">
                      {!collapsed && (
                        <div className='text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 px-3 pt-1 transition-colors duration-200 font-bold'>{t('管理员')}</div>
                      )}
                      {adminItems.map((item) => renderNavItem(item))}
                    </div>
                  </>
                )}
              </>
            )}
          </Nav>
        </div>
      </SkeletonWrapper>

      {/* Footer Collapse Button */}
      <div className='p-3 border-t border-slate-200 dark:border-slate-700 transition-colors duration-200'>
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
            className={`w-full hover:bg-slate-100 dark:hover:bg-slate-800 !rounded-lg transition-all duration-200 ${collapsed ? 'px-0 justify-center' : 'px-3 justify-start'}`}
            icon={
              <ChevronLeft
                size={18}
                className={`text-slate-500 dark:text-slate-400 transition-all duration-300 ease-in-out ${collapsed ? 'rotate-180' : ''}`}
              />
            }
            onClick={toggleCollapsed}
          >
            {!collapsed && <span className="ml-2 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors duration-200">{t('收起')}</span>}
          </Button>
        </SkeletonWrapper>
      </div>
    </div>
  );
};

export default SiderBar;
