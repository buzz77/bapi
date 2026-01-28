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

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { Empty } from '@douyinfe/semi-ui';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@douyinfe/semi-illustrations';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const currentYear = new Date().getFullYear();

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout(t('加载关于内容失败...'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  const emptyStyle = {
    padding: '24px',
  };

  const customDescription = (
    <div style={{ textAlign: 'center' }}>
      <p>{t('可在设置页面设置关于内容，支持 HTML & Markdown')}</p>
      <p>
        <span className='!text-semi-color-primary font-semibold'>
          Buzz · AI中转
        </span>{' '}
        {t('© {{currentYear}}', { currentYear })}{' '}
        <span className='!text-semi-color-text-1'>
          QuantumNous
        </span>
      </p>
      <p>
        {t('本项目根据')}
        <a
          href='https://www.gnu.org/licenses/agpl-3.0.html'
          target='_blank'
          rel='noopener noreferrer'
          className='!text-semi-color-primary'
        >
          {t('AGPL v3.0协议')}
        </a>
        {t('授权使用。')}
      </p>
    </div>
  );

  // 默认关于页面内容（采用参考风格）
  const defaultAboutContent = (
    <div className='w-full min-h-screen py-16 px-6 md:px-8'>
      <div className='max-w-[800px] mx-auto animate-fade-in'>
        {/* 页面标题 */}
        <div className='text-center mb-12'>
          <span className='inline-flex items-center gap-2 px-3.5 py-1.5 mb-5 text-[11px] font-semibold tracking-wider uppercase text-[#60A5FA] bg-[rgba(96,165,250,0.1)] border border-[rgba(96,165,250,0.25)] rounded-full'>
            关于我们
          </span>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight'>
            <span className='gradient-text'>Buzz</span>
            <span className='text-[var(--semi-color-text-0)]'> 中转服务</span>
          </h1>
          <p className='text-sm md:text-base text-[var(--semi-color-text-2)] max-w-[550px] mx-auto leading-relaxed'>
            专注于稳定性与透明性的模型中转服务，提供可预测、可审计的请求转发能力
          </p>
        </div>

        {/* 原则卡片 */}
        <div className='glass-card mb-5'>
          <div className='flex items-center gap-3 mb-3.5'>
            <div className='icon-box'>⚖️</div>
            <div className='text-[17px] font-bold text-[var(--semi-color-text-0)]'>我们的原则</div>
          </div>
          <p className='text-sm text-[var(--semi-color-text-2)] mb-3.5 leading-relaxed'>
            所有模型请求均遵循以下原则：
          </p>
          <div className='flex flex-col gap-2.5'>
            <div className='feature-item'>
              <span className='text-[var(--brand-color)]'>✓</span>
              <span className='text-sm text-[var(--semi-color-text-1)]'>不裁剪请求内容</span>
            </div>
            <div className='feature-item'>
              <span className='text-[var(--brand-color)]'>✓</span>
              <span className='text-sm text-[var(--semi-color-text-1)]'>不修改原始字段</span>
            </div>
            <div className='feature-item'>
              <span className='text-[var(--brand-color)]'>✓</span>
              <span className='text-sm text-[var(--semi-color-text-1)]'>不注入任何隐藏提示或系统指令</span>
            </div>
          </div>
        </div>

        {/* 服务定位卡片 */}
        <div className='glass-card mb-5'>
          <div className='flex items-center gap-3 mb-3.5'>
            <div className='w-10 h-10 rounded-[10px] bg-[linear-gradient(135deg,rgba(96,165,250,0.15),rgba(96,165,250,0.05))] border border-[rgba(96,165,250,0.2)] flex items-center justify-center text-lg'>
              🎯
            </div>
            <div className='text-[17px] font-bold text-[var(--semi-color-text-0)]'>服务定位</div>
          </div>
          <p className='text-sm text-[var(--semi-color-text-2)] leading-relaxed m-0'>
            Buzz 面向需要高可控性与稳定输出的用户场景，适用于自动化任务、代理系统、对话产品及各类模型集成需求。
          </p>
        </div>

        {/* 公告与状态通知卡片 */}
        <div className='p-7 rounded-2xl border border-[rgba(59,130,246,0.3)] bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(59,130,246,0.03))] mb-5'>
          <div className='flex items-center gap-3 mb-3.5'>
            <div className='w-10 h-10 rounded-[10px] bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.08))] border border-[rgba(59,130,246,0.25)] flex items-center justify-center text-lg'>
              📢
            </div>
            <div className='text-[17px] font-bold text-[var(--semi-color-text-0)]'>公告与状态通知</div>
          </div>
          <p className='text-sm text-[var(--semi-color-text-2)] mb-3 leading-relaxed'>
            服务状态变更、异常通知、维护说明等，将统一发布在 Telegram 频道：
          </p>
          <a
            href='https://t.me/buzzapi'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 px-4.5 py-2.5 rounded-[10px] bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] text-[#60A5FA] no-underline font-semibold text-sm transition-all hover:bg-[rgba(59,130,246,0.2)]'
          >
            📱 t.me/buzzapi
          </a>
          <p className='text-xs text-[var(--semi-color-text-3)] mt-3 mb-0'>
            建议所有用户加入频道以第一时间获取重要信息
          </p>
        </div>

        {/* 底部标语 */}
        <div className='text-center py-8 border-t border-[rgba(148,163,184,0.1)] mt-8'>
          <p className='text-[15px] leading-relaxed text-[var(--semi-color-text-2)] m-0'>
            Buzz 不追求复杂包装，<br className='md:hidden' />
            只专注把中转这件事做到{' '}
            <span className='text-[var(--brand-color)] font-semibold'>稳定</span>、
            <span className='text-[var(--brand-color)] font-semibold'>干净</span>、
            <span className='text-[var(--brand-color)] font-semibold'>可预期</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className='mt-[60px]'>
      {aboutLoaded && about === '' ? (
        <div className='flex justify-center items-center min-h-[calc(100vh-60px)] p-8'>
          <Empty
            image={
              <IllustrationConstruction style={{ width: 150, height: 150 }} />
            }
            darkModeImage={
              <IllustrationConstructionDark
                style={{ width: 150, height: 150 }}
              />
            }
            description={t('管理员暂时未设置任何关于内容')}
            style={emptyStyle}
          >
            {customDescription}
          </Empty>
        </div>
      ) : about ? (
        <>
          {about.startsWith('https://') ? (
            <iframe
              src={about}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div
              className='px-4 py-8'
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: about }}
            ></div>
          )}
        </>
      ) : (
        defaultAboutContent
      )}
    </div>
  );
};

export default About;
