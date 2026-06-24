import { useMemo, useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

const navItems = [
  { id: 'wallet', label: 'Кошелёк', icon: Wallet },
  { id: 'topup', label: 'Пополнение', icon: Plus },
  { id: 'offer', label: 'Оферта', icon: FileText },
];

function Header({ title, subtitle, backTo, screen, setScreen, setSmsCode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-sm font-medium text-slate-500">{subtitle}</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 lg:text-5xl">{title}</h1>
      </div>
      <div className="flex gap-3">
        {backTo && (
          <button
            onClick={() => setScreen(backTo)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ChevronLeft size={18} /> Назад
          </button>
        )}
        {screen !== 'login' && screen !== 'sms' && (
          <button
            onClick={() => {
              setSmsCode('');
              setScreen('login');
            }}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Выйти
          </button>
        )}
      </div>
    </div>
  );
}

function AppShell({ children, screen, setScreen }) {
  return (
    <div className="min-h-screen bg-[#F4F5F8]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-[#FF0032] text-white shadow-sm">
              <span className="absolute left-2 top-1 text-lg font-bold">M</span>
              <span className="absolute right-2 top-1 text-lg font-bold">T</span>
              <span className="absolute bottom-1 right-3 text-lg font-bold">C</span>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">МТС ID</div>
              <div className="text-lg font-semibold text-slate-950">Мобильный кошелёк</div>
            </div>
          </div>
          {screen !== 'login' && screen !== 'sms' && (
            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active ? 'bg-[#FF0032] text-white shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={17} /> {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

function MtsPayLogo() {
  return (
    <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-lg bg-[#FF0032] text-white">
      <span className="absolute left-1 top-0.5 text-[9px] font-bold">M</span>
      <span className="absolute right-1 top-0.5 text-[9px] font-bold">T</span>
      <span className="absolute bottom-0 right-1.5 text-[9px] font-bold">C</span>
    </span>
  );
}

function MtsPayModal({ status, amount, onDone }) {
  const formattedAmount = new Intl.NumberFormat('ru-RU').format(Number(amount) || 0);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-[#FFF1F4] px-4 py-2 text-sm font-semibold text-[#FF0032]">
          <MtsPayLogo /> МТС Pay
        </div>

        {status === 'processing' ? (
          <>
            <Loader2 size={48} className="mx-auto mb-5 animate-spin text-[#FF0032]" />
            <h3 className="text-xl font-semibold text-slate-950">Обработка платежа</h3>
            <p className="mt-2 text-slate-500">Пополнение на {formattedAmount} ₽</p>
          </>
        ) : (
          <>
            <CheckCircle2 size={48} className="mx-auto mb-5 text-emerald-500" />
            <h3 className="text-xl font-semibold text-slate-950">Платёж выполнен</h3>
            <p className="mt-2 text-slate-500">Кошелёк пополнен на {formattedAmount} ₽</p>
            <button
              onClick={onDone}
              className="mt-6 w-full rounded-[20px] bg-[#FF0032] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-red-500/20"
            >
              Готово
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MobileWalletMTS() {
  const [screen, setScreen] = useState('login');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [paymentSource, setPaymentSource] = useState('card');
  const [balance, setBalance] = useState(24580);
  const [topupModal, setTopupModal] = useState('closed');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (topupModal !== 'processing') return;
    const timer = setTimeout(() => setTopupModal('success'), 1400);
    return () => clearTimeout(timer);
  }, [topupModal]);

  useEffect(() => {
    if (screen !== 'sms') return;

    const timers = [0, 80, 180].map((delay) =>
      setTimeout(() => {
        const firstInput = inputsRef.current[0];
        firstInput?.focus();
        firstInput?.select?.();
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [screen]);

  useEffect(() => {
    if (smsCode === '1111') {
      const timer = setTimeout(() => setScreen('wallet'), 150);
      return () => clearTimeout(timer);
    }
  }, [smsCode]);

  const transactions = useMemo(
    () => [
      { id: 1, title: 'Пополнение кошелька', subtitle: 'Сегодня, 12:47', amount: '+ 3 000 ₽' },
      { id: 2, title: 'Списание App Store', subtitle: `Покупка в приложении\nСегодня, 12:50`, amount: '- 799 ₽' },
      { id: 3, title: 'Списание App Store', subtitle: `Подписка\nВчера, 20:11`, amount: '- 299 ₽' },
      { id: 4, title: 'Пополнение кошелька', subtitle: 'Вчера, 19:30', amount: '+ 2 000 ₽' },
      { id: 5, title: 'Привязка к App Store', subtitle: `Код подтверждения: 482193\nВчера, 12:45`, amount: '' },
    ],
    []
  );

  const formatPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '').replace(/^7/, '').slice(0, 10);
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean);

    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${parts[0]}`;
    if (digits.length <= 6) return `(${parts[0]}) ${parts[1] || ''}`.trim();
    if (digits.length <= 8) return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
    return `(${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
  };

  const handlePhoneChange = (value) => {
    const digits = String(value || '').replace(/\D/g, '').replace(/^7/, '').slice(0, 10);
    setPhone(digits);
  };

  const formatAmount = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return '';
    return new Intl.NumberFormat('ru-RU').format(Number(digits));
  };

  const handleAmountChange = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
    setTopupAmount(digits);
  };

  const handleSmsDigitChange = (index, value) => {
    const digit = String(value || '').replace(/\D/g, '').slice(-1);
    const next = Array.from({ length: 4 }, (_, i) => smsCode[i] || '');
    next[index] = digit;
    const newCode = next.join('').slice(0, 4);
    setSmsCode(newCode);

    if (digit && index < 3) {
      requestAnimationFrame(() => {
        const nextInput = inputsRef.current[index + 1];
        nextInput?.focus();
        nextInput?.select?.();
      });
    }
  };

  const cleanDigits = phone;
  const canContinue = cleanDigits.length === 10;
  const canTopup = Number(topupAmount) > 0;
  const canConfirmCode = smsCode.length === 4;
  const isValidCode = smsCode === '1111';

  const handleStartTopup = () => {
    if (!canTopup) return;
    setTopupModal('processing');
  };

  const handleTopupDone = () => {
    setBalance((prev) => prev + Number(topupAmount));
    setTopupAmount('');
    setTopupModal('closed');
    setScreen('wallet');
  };

  const allowedRanges = [
    [910, 919],
    [980, 989],
  ];

  const getCode = (digits) => Number(String(digits || '').slice(0, 3));
  const isAllowedCode = (digits) => {
    const code = getCode(digits);
    return allowedRanges.some(([start, end]) => code >= start && code <= end);
  };

  const generateMtsNumber = (digits) => {
    const fallback = '9101234567';
    const normalized = String(digits || fallback).padEnd(10, '0').slice(0, 10);

    if (isAllowedCode(normalized)) return normalized;

    const suffix = normalized.slice(3);
    const codes = [];
    for (let code = 910; code <= 919; code += 1) codes.push(String(code));
    for (let code = 980; code <= 989; code += 1) codes.push(String(code));

    const index = Number(suffix.slice(0, 3) || '0') % codes.length;
    return codes[index] + suffix;
  };

  const displayNumber = generateMtsNumber(cleanDigits || '9001234567');
  const showPaymentNumber = canContinue && !isAllowedCode(cleanDigits);

  const sourceOptions = [
    {
      id: 'card',
      title: 'Карта другого банка',
      subtitle: 'Списание с банковской карты',
      icon: CreditCard,
    },
    {
      id: 'sbp',
      title: 'СБП',
      subtitle: 'Быстрое пополнение через Систему быстрых платежей',
      icon: 'sbp',
    },
  ];

  return (
    <>
      <AppShell screen={screen} setScreen={setScreen}>
      <AnimatePresence mode="wait">
        {screen === 'login' ? (
          <motion.section
            key="login"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.25 }}
            className="grid min-h-[calc(100vh-150px)] items-center gap-10 lg:grid-cols-[1fr_520px]"
          >
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                <ShieldCheck size={17} className="text-[#FF0032]" /> Безопасный вход через МТС ID
              </div>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-slate-950 xl:text-7xl">
                Электронный кошелёк для оплаты цифровых сервисов
              </h1>
              <p className="mt-6 max-w-xl text-xl leading-8 text-slate-600">
                Войдите по номеру телефона, подтвердите кодом из СМС и управляйте балансом, пополнениями и операциями в едином веб-кабинете.
              </p>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-200">
              <div className="mb-8 flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#FF0032] text-white">
                  <span className="absolute left-2 top-1 text-xl font-bold">M</span>
                  <span className="absolute right-2 top-1 text-xl font-bold">T</span>
                  <span className="absolute bottom-1 right-3 text-xl font-bold">C</span>
                </div>
                <div className="text-5xl font-medium tracking-tight text-[#1F2329]">ID</div>
              </div>

              <h2 className="mb-2 text-3xl font-semibold text-slate-950">Вход</h2>
              <p className="mb-8 text-slate-500">Введите номер телефона любого оператора.</p>

              <div className="mb-6 rounded-[24px] border-2 border-[#D7DBE3] bg-[#ECEEF2] px-5 py-5 shadow-inner">
                <label className="mb-2 block text-sm font-medium text-slate-500">Номер телефона</label>
                <div className="flex items-center gap-3 text-[#1F2329]">
                  <span className="text-3xl text-[#77808E]">+7</span>
                  <input
                    value={formatPhone(phone)}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    inputMode="numeric"
                    placeholder="(900) 123-45-67"
                    className="w-full bg-transparent text-2xl outline-none placeholder:text-[#A0A8B3]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (canContinue) {
                    setSmsCode('');
                    setScreen('sms');
                  }
                }}
                className={`flex w-full items-center justify-center gap-3 rounded-[24px] px-6 py-5 text-base font-semibold uppercase tracking-wide transition ${
                  canContinue
                    ? 'bg-[#FF0032] text-white shadow-lg shadow-red-500/20 hover:translate-y-[-1px]'
                    : 'bg-[#DFE2E8] text-[#AEB5BF]'
                }`}
              >
                Далее
                {canContinue && <ArrowRight size={22} />}
              </button>
            </div>
          </motion.section>
        ) : screen === 'sms' ? (
          <motion.section
            key="sms"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.25 }}
            className="mx-auto grid min-h-[calc(100vh-150px)] max-w-3xl place-items-center"
          >
            <div className="w-full rounded-[32px] bg-white p-8 shadow-2xl shadow-slate-200/80 ring-1 ring-slate-200 lg:p-10">
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSmsCode('');
                    setScreen('login');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  <ChevronLeft size={18} /> Назад
                </button>
                <div className="rounded-2xl bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">МТС ID</div>
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-semibold text-slate-950 lg:text-5xl">Введите код из СМС</h1>
                <p className="mt-4 text-xl text-slate-500">Отправили его на +7 {formatPhone(cleanDigits || '9001234567')}</p>
              </div>

              <div className="my-10 flex justify-center gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    value={smsCode[index] || ''}
                    onChange={(e) => handleSmsDigitChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
                        inputsRef.current[index - 1]?.focus();
                      }
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    autoFocus={index === 0}
                    className={`h-24 w-20 rounded-[28px] border-2 bg-[#ECEEF2] text-center text-4xl text-[#6B7280] outline-none transition focus:border-[#1E6FFF] ${
                      index === Math.min(smsCode.length, 3) ? 'border-[#1E6FFF]' : 'border-[#D7DBE3]'
                    }`}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-lg text-slate-500">Получить код ещё раз через 20 сек.</p>
                <button
                  onClick={() => {
                    setSmsCode('');
                    setScreen('login');
                  }}
                  className="mt-4 text-xl font-semibold text-[#1E6FFF]"
                >
                  Войти с другим номером
                </button>
              </div>

              {!isValidCode && canConfirmCode && (
                <div className="mt-6 text-center text-sm text-red-500">Неверный код. Для демо используйте 1111.</div>
              )}

              <button
                onClick={() => canConfirmCode && isValidCode && setScreen('wallet')}
                className={`mt-8 flex w-full items-center justify-center gap-3 rounded-[24px] px-6 py-5 text-base font-semibold uppercase tracking-wide transition ${
                  canConfirmCode ? 'bg-[#FF0032] text-white shadow-lg shadow-red-500/20' : 'bg-[#DFE2E8] text-[#AEB5BF]'
                }`}
              >
                Подтвердить
                {canConfirmCode && <ArrowRight size={22} />}
              </button>
            </div>
          </motion.section>
        ) : screen === 'wallet' ? (
          <motion.section key="wallet" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <Header
              title="Электронный кошелёк"
              subtitle="Авторизованный пользователь"
              screen={screen}
              setScreen={setScreen}
              setSmsCode={setSmsCode}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <div className="rounded-[36px] bg-gradient-to-br from-[#1B1E28] via-[#2A2E3A] to-[#4A4F63] p-8 text-white shadow-2xl shadow-slate-300/50">
                  <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-white/60">Баланс</div>
                      <div className="mt-3 text-6xl font-semibold tracking-tight">{new Intl.NumberFormat('ru-RU').format(balance)} ₽</div>
                      <div className="mt-4 text-white/70">Номер входа: +7 {formatPhone(cleanDigits || '9001234567')}</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm text-white/80">Wallet • 001</div>
                  </div>
                  {showPaymentNumber && (
                    <div className="mt-14 text-sm text-white/75">Номер для оплаты: +7 {formatPhone(displayNumber)}</div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setScreen('topup')}
                    className="flex items-center justify-center gap-3 rounded-[28px] bg-[#FF0032] px-6 py-6 text-lg font-semibold text-white shadow-lg shadow-red-500/20 transition hover:scale-[1.01]"
                  >
                    <Plus size={22} /> Пополнить
                  </button>
                  <button
                    onClick={() => setScreen('offer')}
                    className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 text-lg font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    Оферта
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-slate-950">История операций</h3>
                  <span className="text-sm text-slate-400">{transactions.length} записей</span>
                </div>
                <div className="space-y-3">
                  {transactions.map((item) => {
                    const positive = item.amount.trim().startsWith('+');
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.id * 0.04 }}
                        className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-slate-950">{item.title}</div>
                          <div className="whitespace-pre-line text-sm text-slate-500">{item.subtitle}</div>
                        </div>
                        <div className={`shrink-0 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-slate-950'}`}>
                          {item.amount && item.amount}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        ) : screen === 'topup' ? (
          <motion.section key="topup" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <Header
              title="Пополнить кошелёк"
              subtitle="Страница пополнения"
              backTo="wallet"
              screen={screen}
              setScreen={setScreen}
              setSmsCode={setSmsCode}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
              <div className="space-y-6">
                <div className="rounded-[36px] bg-gradient-to-br from-[#1B1E28] via-[#2A2E3A] to-[#4A4F63] p-8 text-white shadow-2xl shadow-slate-300/50">
                  <div className="flex justify-between gap-6">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-white/60">Пополняемый кошелёк</div>
                      <div className="mt-3 text-6xl font-semibold tracking-tight">{new Intl.NumberFormat('ru-RU').format(balance)} ₽</div>
                    </div>
                    <div className="h-fit rounded-2xl bg-white/10 px-5 py-4 text-sm text-white/80">Wallet • 001</div>
                  </div>
                  <div className="mt-14 text-sm text-white/75">Номер для оплаты: +7 {formatPhone(displayNumber)}</div>
                </div>

                <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                  <label className="mb-3 block text-sm font-medium text-slate-500">Сумма пополнения</label>
                  <div className="flex items-center rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-6">
                    <input
                      value={formatAmount(topupAmount)}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      inputMode="numeric"
                      placeholder="Введите сумму"
                      className="w-full bg-transparent text-4xl font-semibold text-slate-950 outline-none placeholder:font-medium placeholder:text-slate-300"
                    />
                    <span className="text-3xl font-semibold text-slate-500">₽</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-400">до 15 000 ₽</div>
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-slate-950">Источник списания</h3>
                  <span className="text-sm text-slate-400">2 варианта</span>
                </div>

                <div className="space-y-3">
                  {sourceOptions.map((option) => {
                    const Icon = option.icon;
                    const active = paymentSource === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => setPaymentSource(option.id)}
                        className={`flex w-full items-center justify-between gap-4 rounded-[24px] border px-5 py-5 text-left transition ${
                          active ? 'border-[#FF0032] bg-[#FFF4F6] shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-2xl bg-white p-3 ${active ? 'text-[#FF0032]' : 'text-slate-600'}`}>
                            {option.icon === 'sbp' ? (
                              <img src="/sbp.png" alt="СБП" className="h-5 w-5 object-contain" />
                            ) : (
                              <Icon size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-950">{option.title}</div>
                            <div className="text-sm text-slate-500">{option.subtitle}</div>
                          </div>
                        </div>
                        <CircleDot size={20} className={active ? 'text-[#FF0032]' : 'text-slate-300'} />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleStartTopup}
                  className={`mt-6 flex w-full items-center justify-center gap-3 rounded-[28px] px-6 py-5 text-lg font-semibold transition ${
                    canTopup ? 'bg-[#FF0032] text-white shadow-lg shadow-red-500/20' : 'bg-[#DFE2E8] text-[#AEB5BF]'
                  }`}
                >
                  Пополнить кошелёк
                  {canTopup && <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section key="offer" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <Header
              title="Условия открытия кошелька"
              subtitle="Публичная оферта"
              backTo="wallet"
              screen={screen}
              setScreen={setScreen}
              setSmsCode={setSmsCode}
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[32px] bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                <div className="space-y-5 text-base leading-8 text-slate-700">
                  <p>Я подтверждаю своё согласие на открытие электронного кошелька, использование сервиса и обработку персональных данных в объёме, необходимом для идентификации, проведения операций и сопровождения продукта.</p>
                  <p>Я разрешаю открытие кошелька на указанный мною номер и соглашаюсь с тем, что номер может использоваться для пополнения, оплаты, уведомлений и подтверждения операций внутри сервиса.</p>
                  <p>Я подтверждаю, что ознакомлен с условиями обслуживания, тарифами, порядком проведения платежей, ограничениями по операциям и правилами безопасности при использовании электронного кошелька.</p>
                  <p>Сервис вправе использовать технические и идентификационные данные для предотвращения мошенничества, повышения безопасности, исполнения требований законодательства и улучшения качества обслуживания.</p>
                  <p>Я понимаю, что отдельные операции могут сопровождаться лимитами, дополнительными проверками, а также комиссиями согласно действующим условиям обслуживания.</p>
                  <p>Подтверждая согласие, я действую добровольно, в своих интересах и принимаю условия использования электронного кошелька в рамках данного цифрового сервиса.</p>
                </div>
              </div>

              <div className="h-fit rounded-[32px] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
                <div className="mb-4 rounded-2xl bg-[#FFF1F4] p-4 text-[#FF0032]">
                  <FileText size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-950">Согласие пользователя</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">Нажимая «Принять», пользователь подтверждает условия открытия и использования электронного кошелька.</p>
                <button
                  onClick={() => setScreen('wallet')}
                  className="mt-6 w-full rounded-[24px] bg-[#FF0032] px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-red-500/20"
                >
                  Принять
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      </AppShell>
      <AnimatePresence>
        {topupModal !== 'closed' && (
          <MtsPayModal status={topupModal} amount={topupAmount} onDone={handleTopupDone} />
        )}
      </AnimatePresence>
    </>
  );
}
