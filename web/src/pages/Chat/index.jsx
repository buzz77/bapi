import React from 'react';
import { useTokenKeys } from '../../hooks/chat/useTokenKeys';
import { Spin, Empty, Button } from '@douyinfe/semi-ui';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ChatPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { keys, serverAddress, isLoading, error } = useTokenKeys(id);

  const comLink = (key) => {
    if (!serverAddress || !key) return '';
    let link = '';
    if (id) {
      let chats = localStorage.getItem('chats');
      if (chats) {
        chats = JSON.parse(chats);
        if (Array.isArray(chats) && chats.length > 0) {
          for (let k in chats[id]) {
            link = chats[id][k];
            link = link.replaceAll(
              '{address}',
              encodeURIComponent(serverAddress),
            );
            link = link.replaceAll('{key}', 'sk-' + key);
          }
        }
      }
    }
    return link;
  };

  const iframeSrc = keys.length > 0 ? comLink(keys[0]) : '';

  if (isLoading) {
    return (
      <div className='fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark z-[1000]'>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full blur-sm"></div>
          </div>
        </div>
        <span
          className='mt-6 text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse'
        >
          {t('正在连接对话服务...')}
        </span>
      </div>
    );
  }

  if (error || !iframeSrc) {
    return (
      <div className='fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark z-[1000] p-4'>
        <div className="modern-card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('连接失败')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {t('无法加载聊天界面，可能是配置错误或网络问题。')}
          </p>
          <Button
            onClick={() => navigate('/console')}
            theme='solid'
            type='primary'
            className='!rounded-xl shadow-glow'
            icon={<ArrowLeft size={16} />}
          >
            {t('返回控制台')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-surface-light dark:bg-surface-dark flex flex-col overflow-hidden">
      {/* 顶部简单的玻璃导航条，用于返回 */}
      <div className="h-16 flex items-center px-4 fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <Button
          onClick={() => navigate('/console')}
          theme='solid'
          type='tertiary'
          className='!rounded-full pointer-events-auto bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-white/20 hover:bg-white/80 dark:hover:bg-black/70 transition-all'
          icon={<ArrowLeft size={20} />}
          aria-label={t('返回')}
        />
      </div>

      <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title='Chat Interface'
        allow='camera;microphone;clipboard-read;clipboard-write'
        className="bg-white dark:bg-black"
      />
    </div>
  );
};

export default ChatPage;
