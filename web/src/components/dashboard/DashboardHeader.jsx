import React from 'react';
import { Button } from '@douyinfe/semi-ui';
import { RefreshCw, Search } from 'lucide-react';

const DashboardHeader = ({
  getGreeting,
  greetingVisible,
  showSearchModal,
  refresh,
  loading,
  t,
}) => {
  return (
    <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4'>
      <div className='flex flex-col'>
        <h2
          className='text-2xl text-[var(--semi-color-text-0)] font-medium transition-opacity duration-1000 ease-in-out'
          style={{ opacity: greetingVisible ? 1 : 0 }}
        >
          {getGreeting}
        </h2>
        <p className="text-[var(--semi-color-text-2)] mt-1 text-sm">
          这里是您的项目概览与关键指标
        </p>
      </div>

      <div className='flex gap-2 bg-[var(--semi-color-bg-1)] p-1.5 rounded-lg border border-[var(--semi-color-border)]'>
        <Button
          type='tertiary'
          icon={<Search size={18} />}
          onClick={showSearchModal}
          className='!bg-transparent hover:!bg-[var(--semi-color-fill-0)] !text-[var(--semi-color-text-1)] !rounded-md h-9 w-9'
          aria-label="搜索"
        />
        <div className="w-px bg-[var(--semi-color-border)] my-1.5"></div>
        <Button
          type='tertiary'
          icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
          onClick={refresh}
          disabled={loading}
          className='!bg-transparent hover:!bg-[var(--semi-color-fill-0)] !text-[var(--semi-color-primary)] !rounded-md h-9 w-9'
          aria-label="刷新"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
