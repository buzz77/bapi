import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/User';
import { StatusContext } from '../../context/Status';
import {
  API,
  getLogo,
  showError,
  showInfo,
  showSuccess,
  updateAPI,
  getSystemName,
  setUserData,
  onGitHubOAuthClicked,
  onDiscordOAuthClicked,
  onOIDCClicked,
  onLinuxDOOAuthClicked,
  prepareCredentialRequestOptions,
  buildAssertionResult,
  isPasskeySupported,
} from '../../helpers';
import Turnstile from 'react-turnstile';
import { Button, Checkbox, Divider, Form, Icon, Modal } from '@douyinfe/semi-ui';
import Title from '@douyinfe/semi-ui/lib/es/typography/title';
import Text from '@douyinfe/semi-ui/lib/es/typography/text';
import TelegramLoginButton from 'react-telegram-login';

import {
  IconGithubLogo,
  IconMail,
  IconLock,
  IconKey,
} from '@douyinfe/semi-icons';
import OIDCIcon from '../common/logo/OIDCIcon';
import WeChatIcon from '../common/logo/WeChatIcon';
import LinuxDoIcon from '../common/logo/LinuxDoIcon';
import TwoFAVerification from './TwoFAVerification';
import { useTranslation } from 'react-i18next';
import { SiDiscord } from 'react-icons/si';

const LoginForm = () => {
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
    wechat_verification_code: '',
  });
  const { username, password } = inputs;
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [userState, userDispatch] = useContext(UserContext);
  const [statusState] = useContext(StatusContext);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showWeChatLoginModal, setShowWeChatLoginModal] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);
  const [linuxdoLoading, setLinuxdoLoading] = useState(false);
  const [emailLoginLoading, setEmailLoginLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [otherLoginOptionsLoading, setOtherLoginOptionsLoading] =
    useState(false);
  const [wechatCodeSubmitLoading, setWechatCodeSubmitLoading] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
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

  useEffect(() => {
    if (status?.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(status.turnstile_site_key);
    }

    setHasUserAgreement(status?.user_agreement_enabled || false);
    setHasPrivacyPolicy(status?.privacy_policy_enabled || false);
  }, [status]);

  useEffect(() => {
    isPasskeySupported()
      .then(setPasskeySupported)
      .catch(() => setPasskeySupported(false));

    return () => {
      if (githubTimeoutRef.current) {
        clearTimeout(githubTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('expired')) {
      showError(t('未登录或登录已过期，请重新登录'));
    }
  }, []);

  const onWeChatLoginClicked = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
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
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setSubmitted(true);
    setLoginLoading(true);
    try {
      if (username && password) {
        const res = await API.post(
          `/api/user/login?turnstile=${turnstileToken}`,
          {
            username,
            password,
          },
        );
        const { success, message, data } = res.data;
        if (success) {
          if (data && data.require_2fa) {
            setShowTwoFA(true);
            setLoginLoading(false);
            return;
          }

          userDispatch({ type: 'login', payload: data });
          setUserData(data);
          updateAPI();
          showSuccess('登录成功！');
          if (username === 'root' && password === '123456') {
            Modal.error({
              title: '您正在使用默认密码！',
              content: '请立刻修改默认密码！',
              centered: true,
            });
          }
          navigate('/console');
        } else {
          showError(message);
        }
      } else {
        showError('请输入用户名和密码！');
      }
    } catch (error) {
      showError('登录失败，请重试');
    } finally {
      setLoginLoading(false);
    }
  }

  const onTelegramLoginClicked = async (response) => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    const fields = [
      'id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash', 'lang',
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

  const handleGitHubClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (githubButtonDisabled) return;
    setGithubLoading(true);
    setGithubButtonDisabled(true);
    setGithubButtonState('redirecting');
    if (githubTimeoutRef.current) clearTimeout(githubTimeoutRef.current);
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
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setDiscordLoading(true);
    try {
      onDiscordOAuthClicked(status.discord_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setDiscordLoading(false), 3000);
    }
  };

  const handleOIDCClick = () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
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
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    setLinuxdoLoading(true);
    try {
      onLinuxDOOAuthClicked(status.linuxdo_client_id, { shouldLogout: true });
    } finally {
      setTimeout(() => setLinuxdoLoading(false), 3000);
    }
  };

  const handleEmailLoginClick = () => {
    setEmailLoginLoading(true);
    setShowEmailLogin(true);
    setEmailLoginLoading(false);
  };

  const handlePasskeyLogin = async () => {
    if ((hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms) {
      showInfo(t('请先阅读并同意用户协议和隐私政策'));
      return;
    }
    if (!passkeySupported) {
      showInfo('当前环境无法使用 Passkey 登录');
      return;
    }
    if (!window.PublicKeyCredential) {
      showInfo('当前浏览器不支持 Passkey');
      return;
    }

    setPasskeyLoading(true);
    try {
      const beginRes = await API.post('/api/user/passkey/login/begin');
      const { success, message, data } = beginRes.data;
      if (!success) {
        showError(message || '无法发起 Passkey 登录');
        return;
      }

      const publicKeyOptions = prepareCredentialRequestOptions(
        data?.options || data?.publicKey || data,
      );
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });
      const payload = buildAssertionResult(assertion);
      if (!payload) {
        showError('Passkey 验证失败，请重试');
        return;
      }

      const finishRes = await API.post(
        '/api/user/passkey/login/finish',
        payload,
      );
      const finish = finishRes.data;
      if (finish.success) {
        userDispatch({ type: 'login', payload: finish.data });
        setUserData(finish.data);
        updateAPI();
        showSuccess('登录成功！');
        navigate('/console');
      } else {
        showError(finish.message || 'Passkey 登录失败，请重试');
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        showInfo('已取消 Passkey 登录');
      } else {
        showError('Passkey 登录失败，请重试');
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleResetPasswordClick = () => {
    setResetPasswordLoading(true);
    navigate('/reset');
    setResetPasswordLoading(false);
  };

  const handleOtherLoginOptionsClick = () => {
    setOtherLoginOptionsLoading(true);
    setShowEmailLogin(false);
    setOtherLoginOptionsLoading(false);
  };

  const handle2FASuccess = (data) => {
    userDispatch({ type: 'login', payload: data });
    setUserData(data);
    updateAPI();
    showSuccess('登录成功！');
    navigate('/console');
  };

  const handleBackToLogin = () => {
    setShowTwoFA(false);
    setInputs({ username: '', password: '', wechat_verification_code: '' });
  };

  const renderOAuthOptions = () => {
    return (
      <div className='flex flex-col items-center justify-center min-h-[500px]'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-10'>
             <img src={logo} alt='Logo' className='h-16 w-16 rounded-2xl shadow-lg mx-auto mb-4 hover:scale-105 transition-transform duration-300' />
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
              {systemName}
            </h2>
            <p className='mt-2 text-slate-500 dark:text-slate-400'>
              {t('欢迎回来，请登录您的账户')}
            </p>
          </div>

          <div className='modern-card glass p-8 animate-fade-in-up'>
            <div className='space-y-4'>
              {status.wechat_login && (
                <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-green-50'
                  type='tertiary'
                  icon={<Icon svg={<WeChatIcon />} style={{ color: '#07C160' }} />}
                  onClick={onWeChatLoginClicked}
                  loading={wechatLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>{t('微信快捷登录')}</span>
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
                  icon={<SiDiscord style={{ color: '#5865F2', width: '20px', height: '20px' }} />}
                  onClick={handleDiscordClick}
                  loading={discordLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>Discord 登录</span>
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
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>OIDC 登录</span>
                </Button>
              )}

              {status.linuxdo_oauth && (
                <Button
                   className='w-full h-12 !rounded-xl !font-medium shadow-sm hover:!bg-orange-50'
                  type='tertiary'
                  icon={<LinuxDoIcon style={{ color: '#E95420', width: '20px', height: '20px' }} />}
                  onClick={handleLinuxDOClick}
                  loading={linuxdoLoading}
                >
                   <span className='ml-2 text-slate-700 dark:text-slate-200'>LinuxDO 登录</span>
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

              {status.passkey_login && passkeySupported && (
                 <Button
                  className='w-full h-12 !rounded-xl !font-medium shadow-sm'
                  type='tertiary'
                  icon={<IconKey size='large' />}
                  onClick={handlePasskeyLogin}
                  loading={passkeyLoading}
                >
                  <span className='ml-2 text-slate-700 dark:text-slate-200'>Passkey 登录</span>
                </Button>
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
                icon={<IconMail />}
                onClick={handleEmailLoginClick}
                loading={emailLoginLoading}
              >
                {t('使用邮箱/账号登录')}
              </Button>
            </div>

            {(hasUserAgreement || hasPrivacyPolicy) && (
                <div className='mt-6 flex justify-center'>
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

            {!status.self_use_mode_enabled && (
               <div className='mt-6 text-center'>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  {t('还没有账户？')}
                  <Link
                    to='/register'
                    className='ml-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors'
                  >
                    {t('立即注册')}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmailLoginForm = () => {
    return (
      <div className='flex flex-col items-center justify-center min-h-[500px]'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-10'>
            <img src={logo} alt='Logo' className='h-16 w-16 rounded-2xl shadow-lg mx-auto mb-4' />
             <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>
              {t('账号登录')}
            </h2>
             <p className='mt-2 text-slate-500 dark:text-slate-400'>
              {t('请输入您的认证信息以继续')}
            </p>
          </div>

          <div className='modern-card glass p-8 animate-fade-in-up'>
            {status.passkey_login && passkeySupported && (
              <Button
                type='tertiary'
                className='w-full h-12 !rounded-xl mb-6 bg-slate-50 dark:bg-slate-800'
                icon={<IconKey size='large' />}
                onClick={handlePasskeyLogin}
                loading={passkeyLoading}
              >
                <span className='ml-2 font-medium'>{t('使用 Passkey 快速登录')}</span>
              </Button>
            )}

            <Form className='space-y-5'>
              <Form.Input
                field='username'
                label={t('用户名 / 邮箱')}
                placeholder={t('请输入用户名或邮箱')}
                name='username'
                size='large'
                className='!rounded-xl'
                onChange={(value) => handleChange('username', value)}
                prefix={<IconMail className='text-slate-400' />}
              />

              <Form.Input
                field='password'
                label={t('密码')}
                placeholder={t('请输入密码')}
                name='password'
                mode='password'
                size='large'
                 className='!rounded-xl'
                onChange={(value) => handleChange('password', value)}
                prefix={<IconLock className='text-slate-400' />}
              />

              <div className="flex items-center justify-between">
                {(hasUserAgreement || hasPrivacyPolicy) && (
                   <Checkbox
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    >
                      <span className='text-xs text-slate-500'>{t('同意协议')}</span>
                    </Checkbox>
                )}
                 <Button
                    theme='borderless'
                    type='tertiary'
                    className='!text-slate-500 hover:!text-primary-600 !p-0'
                    onClick={handleResetPasswordClick}
                    loading={resetPasswordLoading}
                  >
                    {t('忘记密码？')}
                  </Button>
              </div>

              <Button
                theme='solid'
                type='primary'
                htmlType='submit'
                className='w-full h-12 !rounded-xl !text-base !font-bold shadow-glow mt-4'
                onClick={handleSubmit}
                loading={loginLoading}
                disabled={(hasUserAgreement || hasPrivacyPolicy) && !agreedToTerms}
              >
                {t('登录')}
              </Button>

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
                    onClick={handleOtherLoginOptionsClick}
                    loading={otherLoginOptionsLoading}
                  >
                    {t('其他登录方式')}
                  </Button>
                </>
              )}
            </Form>

              {!status.self_use_mode_enabled && (
               <div className='mt-8 text-center'>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  {t('还没有账户？')}
                  <Link
                    to='/register'
                    className='ml-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors'
                  >
                    {t('注册新账户')}
                  </Link>
                </p>
              </div>
            )}
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
            size='large'
            className='!rounded-lg'
            value={inputs.wechat_verification_code}
            onChange={(value) =>
              handleChange('wechat_verification_code', value)
            }
          />
        </div>
      </Modal>
    );
  };

  const render2FAModal = () => {
    return (
      <Modal
        title={
          <div className='flex items-center text-slate-800 dark:text-slate-200'>
            <IconLock className="mr-2 text-primary" size="large" />
            <span className="font-bold">两步验证 (2FA)</span>
          </div>
        }
        visible={showTwoFA}
        onCancel={handleBackToLogin}
        footer={null}
        width={420}
        centered
        className="!rounded-2xl"
      >
        <div className="pt-4">
           <TwoFAVerification
            onSuccess={handle2FASuccess}
            onBack={handleBackToLogin}
            isModal={true}
          />
        </div>
      </Modal>
    );
  };

  return (
    <div className='relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-surface-light dark:bg-surface-dark transition-colors duration-300'>
      {/* 动态背景球 - 使用品牌色 Amber + 互补色 */}
      <div className='absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-300/20 blur-[120px] animate-pulse-slow pointer-events-none mix-blend-multiply dark:mix-blend-screen'></div>
      <div className='absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[140px] animate-pulse-slow pointer-events-none mix-blend-multiply dark:mix-blend-screen' style={{animationDelay: '2s'}}></div>

      <div className='w-full relative z-10 px-4'>
        {showEmailLogin ||
        !(
          status.github_oauth ||
          status.discord_oauth ||
          status.oidc_enabled ||
          status.wechat_login ||
          status.linuxdo_oauth ||
          status.telegram_oauth
        )
          ? renderEmailLoginForm()
          : renderOAuthOptions()}
        {renderWeChatLoginModal()}
        {render2FAModal()}

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

        <div className="absolute bottom-4 w-full text-center">
             <Text className="text-xs text-slate-400 opacity-60">
                &copy; {new Date().getFullYear()} {systemName}. All rights reserved.
             </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
