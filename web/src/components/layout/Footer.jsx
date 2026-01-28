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

import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@douyinfe/semi-ui';
import { getFooterHTML, getLogo, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';

const FooterBar = () => {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(getFooterHTML());
  const systemName = getSystemName();
  const logo = getLogo();
  const [statusState] = useContext(StatusContext);
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  const currentYear = new Date().getFullYear();

  const customFooter = useMemo(
    () => (
      <footer className='w-full py-8 px-6 md:px-10 bg-transparent border-t border-[var(--semi-color-border)]'>
        <div className='max-w-[1200px] mx-auto'>
          {/* 顶部区域 */}
          <div className='flex flex-wrap gap-6 items-center justify-between mb-6'>
            {/* Logo 和标语 */}
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center gap-2.5'>
                <span className='text-lg font-extrabold gradient-text'>BUZZ</span>
                <span className='text-sm font-semibold text-[var(--semi-color-text-0)]'>· AI 中转</span>
              </div>
              <p className='text-[13px] text-[var(--semi-color-text-2)] m-0'>
                稳定、可控的模型请求转发服务
              </p>
            </div>

            {/* 服务状态链接 */}
            {isDemoSiteMode && (
              <div className='flex flex-wrap gap-3 items-center'>
                <a
                  href='https://t.me/buzzapi'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[rgba(255,213,42,0.08)] border border-[rgba(255,213,42,0.25)] text-[var(--brand-color)] text-xs font-semibold no-underline transition-all hover:bg-[rgba(255,213,42,0.12)]'
                >
                  <span className='w-1.5 h-1.5 bg-[var(--brand-color)] rounded-full shadow-[0_0_8px_var(--brand-color)]'></span>
                  服务状态 · Telegram
                </a>
              </div>
            )}
          </div>

          {isDemoSiteMode && (
            <div className='flex flex-col md:flex-row justify-between w-full mb-6 gap-8'>
              <div className='flex-shrink-0 hidden md:block'>
                <img
                  src={logo}
                  alt={systemName}
                  className='w-12 h-12 rounded-xl object-contain opacity-80'
                />
              </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full'>
              <div className='text-left'>
                <p className='text-[var(--semi-color-text-0)] font-semibold mb-3 text-sm'>
                  {t('关于我们')}
                </p>
                <div className='flex flex-col gap-2.5'>
                  <a
                    href='https://docs.newapi.pro/wiki/project-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('关于项目')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/support/community-interaction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('联系我们')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/wiki/features-introduction/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('功能特性')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='text-[var(--semi-color-text-0)] font-semibold mb-3 text-sm'>
                  {t('文档')}
                </p>
                <div className='flex flex-col gap-2.5'>
                  <a
                    href='https://docs.newapi.pro/getting-started/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('快速开始')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/installation/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('安装指南')}
                  </a>
                  <a
                    href='https://docs.newapi.pro/api/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    {t('API 文档')}
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='text-[var(--semi-color-text-0)] font-semibold mb-3 text-sm'>
                  {t('相关项目')}
                </p>
                <div className='flex flex-col gap-2.5'>
                  <a
                    href='https://github.com/songquanpeng/one-api'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    One API
                  </a>
                  <a
                    href='https://github.com/novicezk/midjourney-proxy'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    Midjourney-Proxy
                  </a>
                  <a
                    href='https://github.com/Calcium-Ion/neko-api-key-tool'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    neko-api-key-tool
                  </a>
                </div>
              </div>

              <div className='text-left'>
                <p className='text-[var(--semi-color-text-0)] font-semibold mb-3 text-sm'>
                  {t('友情链接')}
                </p>
                <div className='flex flex-col gap-2.5'>
                  <a
                    href='https://github.com/Calcium-Ion/new-api-horizon'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    new-api-horizon
                  </a>
                  <a
                    href='https://github.com/coaidev/coai'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    CoAI
                  </a>
                  <a
                    href='https://www.gpt-load.com/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] text-xs transition-colors no-underline'
                  >
                    GPT-Load
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* 底部版权区域 */}
          <div className='pt-5 border-t border-[rgba(148,163,184,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-xs text-[var(--semi-color-text-2)] m-0'>
              © {currentYear} Buzz · AI 中转
            </p>
            <div className='flex gap-5'>
              <a href='/about' className='text-xs text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] no-underline transition-colors'>
                {t('关于我们')}
              </a>
              <a href='https://buzzapi.apifox.cn/' className='text-xs text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] no-underline transition-colors'>
                {t('使用文档')}
              </a>
              <a href='/pricing' className='text-xs text-[var(--semi-color-text-2)] hover:text-[var(--semi-color-primary)] no-underline transition-colors'>
                {t('价格方案')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    ),
    [logo, systemName, t, currentYear, isDemoSiteMode],
  );

  useEffect(() => {
    loadFooter();
  }, []);

  return (
    <div className='w-full'>
      {footer ? (
        <div className='relative'>
          <div
            className='custom-footer'
            dangerouslySetInnerHTML={{ __html: footer }}
          ></div>
          <div className='absolute bottom-2 right-4 text-xs !text-semi-color-text-2 opacity-70'>
            <span>Powered by </span>
            <span className='!text-semi-color-primary font-medium'>
              Buzz · AI中转
            </span>
          </div>
        </div>
      ) : (
        customFooter
      )}
    </div>
  );
};

export default FooterBar;
