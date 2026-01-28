import React from 'react';
import { Card, Avatar, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
        {groupedStatsData.map((group, idx) => (
          <div
            key={idx}
            className="glass-card hover:scale-[1.02] transition-all duration-300"
          >
            <h3 className="text-sm font-semibold text-[var(--semi-color-text-1)] mb-4">{group.title}</h3>

            <div className='space-y-4'>
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className='flex items-center justify-between cursor-pointer'
                  onClick={item.onClick}
                >
                  <div className='flex items-center gap-3'>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110" style={{backgroundColor: item.avatarColor || 'var(--brand-color)'}}>
                      {item.icon}
                    </div>
                    <div>
                      <div className='text-xs text-[var(--semi-color-text-2)] mb-0.5'>{item.title}</div>
                      <div className='text-xl font-semibold text-[var(--semi-color-text-0)]'>
                        <Skeleton
                          loading={loading}
                          active
                          placeholder={
                            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          }
                        >
                          {item.value}
                        </Skeleton>
                      </div>
                    </div>
                  </div>

                  {item.title === t('当前余额') ? (
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/console/topup');
                      }}
                      title={t('充值')}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  ) : (
                    (loading || (item.trendData && item.trendData.length > 0)) && (
                      <div className='w-20 h-10 opacity-80 filter saturate-150'>
                        <VChart
                          spec={getTrendSpec(item.trendData, item.trendColor)}
                          option={{ ...CHART_CONFIG, animation: false }} // Disable heavy animation for performance
                        />
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
