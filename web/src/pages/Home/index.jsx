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
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Zhipu,
  Volcengine,
  Cohere,
  Claude,
  Gemini,
  Suno,
  Minimax,
  Wenxin,
  Spark,
  Qingyan,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
  Hunyuan,
  Xinference,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='relative w-full min-h-screen overflow-hidden'>
      {/* Gradient Background */}
      <div className='fixed inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent' />
        {/* Animated gradient orbs */}
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse' style={{ animationDelay: '1s' }} />
      </div>

      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />

      {homePageContentLoaded && homePageContent === '' ? (
        <div className='relative w-full'>
          {/* Hero Section */}
          <div className='w-full min-h-screen flex items-center justify-center px-4 py-20 md:py-24 lg:py-32'>
            <div className='flex flex-col items-center justify-center text-center max-w-6xl mx-auto space-y-8 md:space-y-12 animate-fade-in'>

              {/* Main Heading */}
              <div className='space-y-4 md:space-y-6'>
                <h1
                  className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight ${isChinese ? 'tracking-wide md:tracking-wider' : ''}`}
                >
                  <span className='text-white drop-shadow-2xl'>
                    {t('统一的')}
                  </span>
                  <br />
                  <span className='bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl gradient-text'>
                    {t('大模型接口网关')}
                  </span>
                </h1>

                <p className='text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed'>
                  {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
                </p>
              </div>

              {/* Glass Card for API Endpoint */}
              <div className='w-full max-w-3xl glass-card p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl'>
                <div className='flex flex-col md:flex-row items-center gap-4'>
                  <Input
                    readonly
                    value={serverAddress}
                    className='flex-1 !rounded-xl !bg-black/30 !border-white/20 !text-white'
                    size={isMobile ? 'default' : 'large'}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }}
                    suffix={
                      <div className='flex items-center gap-2'>
                        <ScrollList
                          bodyHeight={32}
                          style={{ border: 'unset', boxShadow: 'unset', backgroundColor: 'transparent' }}
                        >
                          <ScrollItem
                            mode='wheel'
                            cycled={true}
                            list={endpointItems}
                            selectedIndex={endpointIndex}
                            onSelect={({ index }) => setEndpointIndex(index)}
                          />
                        </ScrollList>
                        <Button
                          type='primary'
                          onClick={handleCopyBaseURL}
                          icon={<IconCopy />}
                          className='!rounded-xl !bg-gradient-to-r !from-amber-500 !to-yellow-500 !border-0 hover:!from-amber-600 hover:!to-yellow-600 transition-all duration-300'
                          size={isMobile ? 'default' : 'large'}
                        />
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Link to='/console'>
                  <Button
                    theme='solid'
                    type='primary'
                    size={isMobile ? 'large' : 'large'}
                    className='!rounded-2xl !px-10 !py-6 !text-lg !font-semibold !bg-gradient-to-r !from-amber-500 !to-yellow-500 !border-0 hover:!from-amber-600 hover:!to-yellow-600 !shadow-2xl hover:!shadow-amber-500/50 transition-all duration-300 transform hover:scale-105'
                    icon={<IconPlay size='large' />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'large' : 'large'}
                    className='!rounded-2xl !px-8 !py-6 !text-lg !font-semibold glass-card !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !shadow-xl transition-all duration-300 transform hover:scale-105'
                    icon={<IconGithubLogo size='large' />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/buzz',
                        '_blank',
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size={isMobile ? 'large' : 'large'}
                      className='!rounded-2xl !px-8 !py-6 !text-lg !font-semibold glass-card !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 !shadow-xl transition-all duration-300 transform hover:scale-105'
                      icon={<IconFile size='large' />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>

              {/* Provider Icons Section */}
              <div className='w-full max-w-6xl mt-16 md:mt-24'>
                <div className='glass-card rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 shadow-2xl'>
                  <div className='flex items-center justify-center mb-8 md:mb-12'>
                    <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white'>
                      {t('支持众多的大模型供应商')}
                    </h2>
                  </div>

                  <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10'>
                    {[
                      { Icon: Moonshot, size: isMobile ? 32 : 48 },
                      { Icon: OpenAI, size: isMobile ? 32 : 48 },
                      { Icon: XAI, size: isMobile ? 32 : 48 },
                      { Icon: Zhipu.Color, size: isMobile ? 32 : 48 },
                      { Icon: Volcengine.Color, size: isMobile ? 32 : 48 },
                      { Icon: Cohere.Color, size: isMobile ? 32 : 48 },
                      { Icon: Claude.Color, size: isMobile ? 32 : 48 },
                      { Icon: Gemini.Color, size: isMobile ? 32 : 48 },
                      { Icon: Suno, size: isMobile ? 32 : 48 },
                      { Icon: Minimax.Color, size: isMobile ? 32 : 48 },
                      { Icon: Wenxin.Color, size: isMobile ? 32 : 48 },
                      { Icon: Spark.Color, size: isMobile ? 32 : 48 },
                      { Icon: Qingyan.Color, size: isMobile ? 32 : 48 },
                      { Icon: DeepSeek.Color, size: isMobile ? 32 : 48 },
                      { Icon: Qwen.Color, size: isMobile ? 32 : 48 },
                      { Icon: Midjourney, size: isMobile ? 32 : 48 },
                      { Icon: Grok, size: isMobile ? 32 : 48 },
                      { Icon: AzureAI.Color, size: isMobile ? 32 : 48 },
                      { Icon: Hunyuan.Color, size: isMobile ? 32 : 48 },
                      { Icon: Xinference.Color, size: isMobile ? 32 : 48 },
                    ].map(({ Icon, size }, index) => (
                      <div
                        key={index}
                        className='icon-box w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-amber-500/20'
                      >
                        <Icon size={size} />
                      </div>
                    ))}
                    <div className='icon-box w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-amber-500/30'>
                      <Typography.Text className='!text-2xl md:!text-3xl lg:!text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent'>
                        30+
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px] px-4 text-white'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
