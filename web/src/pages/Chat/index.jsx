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
      <div className='fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[var(--semi-color-bg-0)] z-[1000]'>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--semi-color-primary)]/20 border-t-[var(--semi-color-primary)] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[var(--semi-color-primary)]/10 rounded-full blur-sm"></div>
          </div>
        </div>
        <span
          className='mt-6 text-lg font-medium text-[var(--semi-color-text-1)] animate-pulse'
        >
          {t('正在连接对话服务...')}
        </span>
      </div>
    );
  }

  if (error || !iframeSrc) {
    return (
      <div className='fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[var(--semi-color-bg-0)] z-[1000] p-4'>
        <div className="p-8 text-center max-w-md w-full rounded-xl bg-[var(--semi-color-bg-1)] border border-[var(--semi-color-border)]">
          <div className="w-16 h-16 bg-[var(--semi-color-danger-light-default)] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[var(--semi-color-danger)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--semi-color-text-0)] mb-2">{t('连接失败')}</h3>
          <p className="text-[var(--semi-color-text-2)] mb-6">
            {t('无法加载聊天界面，可能是配置错误或网络问题。')}
          </p>
          <Button
            onClick={() => navigate('/console')}
            theme='solid'
            type='primary'
            className='!rounded-xl'
            icon={<ArrowLeft size={16} />}
          >
            {t('返回控制台')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--semi-color-bg-0)] flex flex-col overflow-hidden">
      {/* 顶部导航条，用于返回 */}
      <div className="h-16 flex items-center px-4 fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <Button
          onClick={() => navigate('/console')}
          theme='solid'
          type='tertiary'
          className='!rounded-full pointer-events-auto bg-[var(--semi-color-bg-1)] border border-[var(--semi-color-border)] hover:bg-[var(--semi-color-fill-0)] transition-all'
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
        className="bg-[var(--semi-color-bg-0)]"
      />
    </div>
  );
};

export default ChatPage;
