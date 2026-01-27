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
          className='text-3xl font-bold text-slate-800 dark:text-slate-100 transition-opacity duration-1000 ease-in-out tracking-tight'
          style={{ opacity: greetingVisible ? 1 : 0 }}
        >
          {getGreeting}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          这里是您的项目概览与关键指标
        </p>
      </div>

      <div className='flex gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50'>
        <Button
          type='tertiary'
          icon={<Search size={18} />}
          onClick={showSearchModal}
          className='!bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-600 dark:!text-slate-300 !rounded-xl h-10 w-10'
          aria-label="搜索"
        />
        <div className="w-px bg-slate-200 dark:bg-slate-700 my-2"></div>
        <Button
          type='tertiary'
          icon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
          onClick={refresh}
          disabled={loading}
          className='!bg-transparent hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-primary-600 !rounded-xl h-10 w-10'
          aria-label="刷新"
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
