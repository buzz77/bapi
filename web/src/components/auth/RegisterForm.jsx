import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
  getSystemName,
  setUserData,
  onDiscordOAuthClicked,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Icon,
  Modal,
} from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import {
  IconGithubLogo,
  IconMail,
  IconUser,
  IconLock,
  IconKey,
} from '@douyinfe/semi-icons';
import {
  onGitHubOAuthClicked,
  onLinuxDOOAuthClicked,
  onOIDCClicked,
} from '../../helpers';
import OIDCIcon from '../common/logo/OIDCIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import TelegramLoginButton from 'react-telegram-login/src';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';

const RegisterForm = () => {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const githubButtonTextKeyByState = {
    idle: '使用 GitHub 继续',
    redirecting: '正在跳转 GitHub...',
    timeout: '请求超时，请重试',
  };
  const [inputs, setInputs] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    verification_code: '',
    wechat_verification_code: '',
  });
  const { username, password, password2 } = inputs;
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [showEmailRegister, setShowEmailRegister] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [emailRegisterLoading, setEmailRegisterLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verificationCodeLoading, setVerificationCodeLoading] = useState(false);
  const [otherRegisterOptionsLoading, setOtherRegisterOptionsLoading] =
    useState(false);
  const [wechatCodeSubmitLoading, setWechatCodeSubmitLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [hasUserAgreement, setHasUserAgreement] = useState(false);
  const [hasPrivacyPolicy, setHasPrivacyPolicy] = useState(false);
  const [githubButtonState, setGithubButtonState] = useState('idle');
  const [githubButtonDisabled, setGithubButtonDisabled] = useState(false);
  const githubTimeoutRef = useRef(null);
  const githubButtonText = t(githubButtonTextKeyByState[githubButtonState]);

  const logo = getLogo();
  const systemName = getSystemName();

  let affCode = new URLSearchParams(window.location.search).get('aff');
  if (affCode) {
    localStorage.setItem('aff', affCode);
  }

  const status = useMemo(() => {
    if (statusState?.status) return statusState.status;
    const savedStatus = localStorage.getItem('status');
    if (!savedStatus) return {};
    try {
      return JSON.parse(savedStatus) || {};
    } catch (err) {
      return {};
    }
  }, [statusState?.status]);

  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    setShowEmailVerification(!!status?.email_verification);
    if (status?.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(status.turnstile_site_key);
    }

    setHasUserAgreement(status?.user_agreement_enabled || false);
    setHasPrivacyPolicy(status?.privacy_policy_enabled || false);
  }, [status]);

  useEffect(() => {
    let countdownInterval = null;
    if (disableButton && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => clearInterval(countdownInterval);
  }, [disableButton, countdown]);

  useEffect(() => {
    return () => {
      if (githubTimeoutRef.current) {
        clearTimeout(githubTimeoutRef.current);
      }
    };
  }, []);

  const onWeChatLoginClicked = () => {
    setWechatLoading(true);
    setShowWeChatLoginModal(true);
    setWechatLoading(false);
  };

  const onSubmitWeChatVerificationCode = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setWechatCodeSubmitLoading(true);
    try {
      const res = await API.get(
        `/api/oauth/wechat?code=${inputs.wechat_verification_code}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        setUserData(data);
        updateAPI();
        navigate('/');
        showSuccess('登录成功！');
        setShowWeChatLoginModal(false);
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    } finally {
      setWechatCodeSubmitLoading(false);
    }
  };

  function handleChange(name, value) {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  async function handleSubmit(e) {
    if (password.length < 8) {
      showInfo('密码长度不得小于 8 位！');
      return;
    }
    if (password !== password2) {
      showInfo('两次输入的密码不一致');
      return;
    }
    if (username && password) {
      if (turnstileEnabled && turnstileToken === '') {
        showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
        return;
      }
      setRegisterLoading(true);
      try {
        if (!affCode) {
          affCode = localStorage.getItem('aff');
        }
        inputs.aff_code = affCode;
        const res = await API.post(
          `/api/user/register?turnstile=${turnstileToken}`,
          inputs,
        );
        const { success, message } = res.data;
        if (success) {
          navigate('/login');
          showSuccess('注册成功！');
        } else {
          showError(message);
        }
      } catch (error) {
        showError('注册失败，请重试');
      } finally {
        setRegisterLoading(false);
      }
    }
  }

  const sendVerificationCode = async () => {
    if (inputs.email === '') return;
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setVerificationCodeLoading(true);
    try {
      const res = await API.get(
        `/api/verification?email=${encodeURIComponent(inputs.email)}&turnstile=${turnstileToken}`,
      );
      const { success, message } = res.data;
      if (success) {
        showSuccess('验证码发送成功，请检查你的邮箱！');
        setDisableButton(true);
      } else {
        showError(message);
      }
    } catch (error) {
      showError('发送验证码失败，请重试');
    } finally {
      setVerificationCodeLoading(false);
    }
  };

  const handleGitHubClick = () => {
    if (githubButtonDisabled) {
      return;
    }
    setGithubLoading(true);
    setGithubButtonDisabled(true);
    setGithubButtonState('redirecting');
    if (githubTimeoutRef.current) {
      clearTimeout(githubTimeoutRef.current);
    }
    githubTimeoutRef.current = setTimeout(() => {
      setGithubLoading(false);
      setGithubButtonState('timeout');
      setGithubButtonDisabled(true);
    }, 20000);
    try {
      onGitHubOAuthClicked(status.github_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setGithubLoading(false), 3000);
    }
  };

  const handleDiscordClick = () => {
    setDiscordLoading(true);
    try {
      onDiscordOAuthClicked(status.discord_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setDiscordLoading(false), 3000);
    }
  };

  const handleOIDCClick = () => {
    setOidcLoading(true);
    try {
      onOIDCClicked(
        status.oidc_authorization_endpoint,
        status.oidc_client_id,
        false,
        { shouldLogout: true },
      );
    } finally {
      setTimeout(() => setOidcLoading(false), 3000);
    }
  };

  const handleLinuxDOClick = () => {
    setLinuxdoLoading(true);
    try {
      onLinuxDOOAuthClicked(status.linuxdo_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setLinuxdoLoading(false), 3000);
    }
  };

  const handleEmailRegisterClick = () => {
    setEmailRegisterLoading(true);
    setShowEmailRegister(true);
    setEmailRegisterLoading(false);
  };

  const handleOtherRegisterOptionsClick = () => {
    setOtherRegisterOptionsLoading(true);
    setShowEmailRegister(false);
    setOtherRegisterOptionsLoading(false);
  };

  const onTelegramLoginClicked = async (response) => {
    const fields = [
      'id',
      'first_name',
      'last_name',
      'username',
      'photo_url',
      'auth_date',
      'hash',
      'lang',
    ];
    const params = {};
    fields.forEach((field) => {
      if (response[field]) {
        params[field] = response[field];
      }
    });
    try {
      const res = await API.get(`/api/oauth/telegram/login`, { params });
      const { success, message, data } = res.data;
      if (success) {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        showSuccess('登录成功！');
        setUserData(data);
        updateAPI();
        navigate('/');
      } else {
        showError(message);
      }
    } catch (error) {
      showError('登录失败，请重试');
    }
  };

  const renderOAuthOptions = () => {
    return (
      <div className='flex flex-col items-center justify-center min-h-[500px]'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-10'>
            <img src={logo} alt='Logo' className='h-16 w-16 rounded-2xl shadow-lg mx-auto mb-4' />
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
              {systemName}
            </h2>
            <p className='mt-2 text-slate-500 dark:text-slate-400'>
              {t('创建新账户以开启您的旅程')}
            </p>
          </div>

          <div className='modern-card glass p-8 animate-fade-in-up'>
            <div className='space-y-4'>
              {status.wechat_login && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-green-50'
                  type='tertiary'
                  icon={
                    <Icon svg={<WeChatIcon />} style={{ color: '#07C160' }} />
                  }
                  onClick={onWeChatLoginClicked}
                  loading={wechatLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{t('使用 微信 注册')}</span>
                </Button>
              )}

              {status.github_oauth && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-slate-50 dark:hover:!bg-slate-800'
                  type='tertiary'
                  icon={<IconGithubLogo size='large' />}
                  onClick={handleGitHubClick}
                  loading={githubLoading}
                  disabled={githubButtonDisabled}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{githubButtonText}</span>
                </Button>
              )}

              {status.discord_oauth && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-indigo-50'
                  type='tertiary'
                  icon={
                    <SiDiscord
                      style={{
                        color: '#5865F2',
                        width: '20px',
                        height: '20px',
                      }}
                    />
                  }
                  onClick={handleDiscordClick}
                  loading={discordLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{t('使用 Discord 注册')}</span>
                </Button>
              )}

              {status.oidc_enabled && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-blue-50'
                  type='tertiary'
                  icon={<OIDCIcon style={{ color: '#1877F2' }} />}
                  onClick={handleOIDCClick}
                  loading={oidcLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{t('使用 OIDC 注册')}</span>
                </Button>
              )}

              {status.linuxdo_oauth && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-orange-50'
                  type='tertiary'
                  icon={
                    <LinuxDoIcon
                      style={{
                        color: '#E95420',
                        width: '20px',
                        height: '20px',
                      }}
                    />
                  }
                  onClick={handleLinuxDOClick}
                  loading={linuxdoLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{t('使用 LinuxDO 注册')}</span>
                </Button>
              )}

              {status.telegram_oauth && (
                <div className='flex justify-center my-2'>
                  <TelegramLoginButton
                    dataOnauth={onTelegramLoginClicked}
                    botName={status.telegram_bot_name}
                  />
                </div>
              )}

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">{t('或')}</span>
                  </div>
              </div>

              <Button
                theme='solid'
                type='primary'
                className='w-full h-12 !rounded-xl !text-base !font-bold shadow-glow hover:scale-[1.02] transition-transform'
                icon={<IconMail size='large' />}
                onClick={handleEmailRegisterClick}
                loading={emailRegisterLoading}
              >
                {t('使用 用户名/邮箱 注册')}
              </Button>
            </div>

            <div className='mt-8 text-center'>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {t('已有账户？')}{' '}
                <Link
                  to='/login'
                  className='ml-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors'
                >
                  {t('立即登录')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailRegisterForm = () => {
    return (
      <div className='flex flex-col items-center justify-center min-h-[500px]'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-10'>
            <img src={logo} alt='Logo' className='h-16 w-16 rounded-2xl shadow-lg mx-auto mb-4' />
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
              {t('注册账号')}
            </h2>
            <p className='mt-2 text-slate-500 dark:text-slate-400'>
              {t('请填写以下信息以完成注册')}
            </p>
          </div>

          <div className='modern-card glass p-8 animate-fade-in-up'>
            <Form className='space-y-4'>
              <Form.Input
                field='username'
                label={t('用户名')}
                placeholder={t('设置一个用户名')}
                name='username'
                size='large'
                className='!rounded-xl'
                onChange={(value) => handleChange('username', value)}
                prefix={<IconUser className='text-slate-400' />}
              />

              <Form.Input
                field='password'
                label={t('密码')}
                placeholder={t('设置密码 (8-20位)')}
                name='password'
                mode='password'
                size='large'
                className='!rounded-xl'
                onChange={(value) => handleChange('password', value)}
                prefix={<IconLock className='text-slate-400' />}
              />

              <Form.Input
                field='password2'
                label={t('确认密码')}
                placeholder={t('再次输入密码')}
                name='password2'
                mode='password'
                size='large'
                className='!rounded-xl'
                onChange={(value) => handleChange('password2', value)}
                prefix={<IconLock className='text-slate-400' />}
              />

              {showEmailVerification && (
                <>
                  <Form.Input
                    field='email'
                    label={t('邮箱')}
                    placeholder={t('your@email.com')}
                    name='email'
                    type='email'
                    size='large'
                    className='!rounded-xl'
                    onChange={(value) => handleChange('email', value)}
                    prefix={<IconMail className='text-slate-400' />}
                    suffix={
                      <Button
                        type='tertiary'
                        className='!text-primary-600 !font-medium'
                        onClick={sendVerificationCode}
                        loading={verificationCodeLoading}
                        disabled={disableButton || verificationCodeLoading}
                      >
                        {disableButton
                          ? `${t('重发')} (${countdown})`
                          : t('获取验证码')}
                      </Button>
                    }
                  />
                  <Form.Input
                    field='verification_code'
                    label={t('验证码')}
                    placeholder={t('请输入邮箱验证码')}
                    name='verification_code'
                    size='large'
                    className='!rounded-xl'
                    onChange={(value) =>
                      handleChange('verification_code', value)
                    }
                    prefix={<IconKey className='text-slate-400' />}
                  />
                </>
              )}

              {(hasUserAgreement || hasPrivacyPolicy) && (
                <div className='pt-2 flex justify-center'>
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  >
                    <Text size='small' className='text-slate-500 dark:text-slate-400'>
                      {t('我已阅读并同意')}
                      {hasUserAgreement && (
                          <a
                            href='/user-agreement'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-600 hover:text-primary-700 font-medium mx-1'
                          >
                            {t('用户协议')}
                          </a>
                      )}
                      {hasUserAgreement && hasPrivacyPolicy && t('和')}
                      {hasPrivacyPolicy && (
                          <a
                            href='/privacy-policy'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-600 hover:text-primary-700 font-medium mx-1'
                          >
                            {t('隐私政策')}
                          </a>
                      )}
                    </Text>
                  </Checkbox>
                </div>
              )}

              <Button
                theme='solid'
                type='primary'
                htmlType='submit'
                className='w-full h-12 !rounded-xl !text-base !font-bold shadow-glow mt-4'
                onClick={handleSubmit}
                loading={registerLoading}
                disabled={
                  (hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms
                }
              >
                {t('注册账户')}
              </Button>
            </Form>

            {(status.github_oauth ||
              status.discord_oauth ||
              status.oidc_enabled ||
              status.wechat_login ||
              status.linuxdo_oauth ||
              status.telegram_oauth) && (
              <>
                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">{t('或')}</span>
                    </div>
                </div>

                <Button
                  theme='outline'
                  type='tertiary'
                  className='w-full h-12 !rounded-xl'
                  onClick={handleOtherRegisterOptionsClick}
                  loading={otherRegisterOptionsLoading}
                >
                  {t('使用其他方式注册')}
                </Button>
              </>
            )}

            <div className='mt-8 text-center'>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {t('已有账户？')}{' '}
                <Link
                  to='/login'
                  className='ml-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors'
                >
                  {t('立即登录')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeChatLoginModal = () => {
    return (
      <Modal
        title={t('微信扫码登录')}
        visible={showWeChatLoginModal}
        maskClosable={true}
        onOk={onSubmitWeChatVerificationCode}
        onCancel={() => setShowWeChatLoginModal(false)}
        okText={t('登录')}
        centered={true}
        okButtonProps={{
          loading: wechatCodeSubmitLoading,
          className: '!bg-primary !text-black !rounded-lg'
        }}
      >
        <div className='flex flex-col items-center p-4'>
           <div className="p-2 border-2 border-primary rounded-xl mb-4">
             <img src={status.wechat_qrcode} alt='微信二维码' className='w-48 h-48' />
          </div>
          <p className='text-slate-500 text-center text-sm mb-6'>
            {t('请使用微信扫描二维码关注公众号，回复「验证码」获取登录验证码')}
          </p>
          <Form.Input
            field='wechat_verification_code'
            placeholder={t('请输入6位验证码')}
            label={t('验证码')}
            value={inputs.wechat_verification_code}
            size='large'
             className='!rounded-lg'
            onChange={(value) =>
              handleChange('wechat_verification_code', value)
            }
          />
        </div>
      </Modal>
    );
  };

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-surface-light dark:bg-surface-dark transition-colors duration-300'>
       {/* 动态背景球 */}
       <div className='absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-300/20 blur-[120px] animate-pulse-slow pointer-events-none mix-blend-multiply dark:mix-blend-screen'></div>
       <div className='absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[140px] animate-pulse-slow pointer-events-none mix-blend-multiply dark:mix-blend-screen' style={{animationDelay: '3s'}}></div>

      <div className='w-full relative z-10 px-4 mt-8 mb-8'>
        {showEmailRegister ||
        !(
          status.github_oauth ||
          status.discord_oauth ||
          status.oidc_enabled ||
          status.wechat_login ||
          status.linuxdo_oauth ||
          status.telegram_oauth
        )
          ? renderEmailRegisterForm()
          : renderOAuthOptions()}
        {renderWeChatLoginModal()}

        {turnstileEnabled && (
          <div className='flex justify-center mt-8 opacity-80'>
            <Turnstile
              sitekey={turnstileSiteKey}
              onVerify={(token) => {
                setTurnstileToken(token);
              }}
            />
          </div>
        )}
         <div className="absolute -bottom-6 w-full text-center">
             <Text className="text-xs text-slate-400 opacity-60">
                &copy; {new Date().getFullYear()} {systemName}. All rights reserved.
             </Text>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
