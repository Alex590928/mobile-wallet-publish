
const state = {
  screen: 'login',
  phone: '',
  smsCode: ['', '', '', ''],
  topupAmount: '',
  paymentSource: 'card',
};

const transactions = [
  { id: 1, title: 'Пополнение кошелька', subtitle: 'Сегодня, 12:47', amount: '+ 3 000 ₽' },
  { id: 2, title: 'Списание App Store', subtitle: 'Покупка в приложении\nСегодня, 12:50', amount: '- 799 ₽' },
  { id: 3, title: 'Списание App Store', subtitle: 'Подписка\nВчера, 20:11', amount: '- 299 ₽' },
  { id: 4, title: 'Пополнение кошелька', subtitle: 'Вчера, 19:30', amount: '+ 2 000 ₽' },
  { id: 5, title: 'Привязка к App Store', subtitle: 'Код подтверждения: 482193\nВчера, 12:45', amount: '' },
];

const els = {
  screens: document.querySelectorAll('.screen'),
  phoneInput: document.getElementById('phoneInput'),
  toSmsBtn: document.getElementById('toSmsBtn'),
  smsLead: document.getElementById('smsLead'),
  otpInputs: Array.from(document.querySelectorAll('.otp-input')),
  smsError: document.getElementById('smsError'),
  confirmSmsBtn: document.getElementById('confirmSmsBtn'),
  changePhoneBtn: document.getElementById('changePhoneBtn'),
  walletLoginNumber: document.getElementById('walletLoginNumber'),
  walletPaymentNumber: document.getElementById('walletPaymentNumber'),
  topupPaymentNumber: document.getElementById('topupPaymentNumber'),
  historyList: document.getElementById('historyList'),
  historyCount: document.getElementById('historyCount'),
  toTopupBtn: document.getElementById('toTopupBtn'),
  toOfferBtn: document.getElementById('toOfferBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  amountInput: document.getElementById('amountInput'),
  topupBtn: document.getElementById('topupBtn'),
  sourceOptions: Array.from(document.querySelectorAll('.source-option')),
};

function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '').replace(/^7/, '').slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${parts[0]}`;
  if (digits.length <= 6) return `(${parts[0]}) ${parts[1] || ''}`.trim();
  if (digits.length <= 8) return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}-${parts[3]}`;
}

function formatAmount(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
  if (!digits) return '';
  return new Intl.NumberFormat('ru-RU').format(Number(digits));
}

function isAllowedCode(digits) {
  const code = Number(String(digits || '').slice(0, 3));
  return (code >= 910 && code <= 919) || (code >= 980 && code <= 989);
}

function generateMtsNumber(digits) {
  const fallback = '9101234567';
  const normalized = String(digits || fallback).padEnd(10, '0').slice(0, 10);
  if (isAllowedCode(normalized)) return normalized;
  const suffix = normalized.slice(3);
  const codes = [];
  for (let code = 910; code <= 919; code += 1) codes.push(String(code));
  for (let code = 980; code <= 989; code += 1) codes.push(String(code));
  const index = Number(suffix.slice(0, 3) || '0') % codes.length;
  return codes[index] + suffix;
}

function getSmsCode() {
  return state.smsCode.join('');
}

function renderHistory() {
  els.historyCount.textContent = `${transactions.length} записей`;
  els.historyList.innerHTML = '';
  transactions.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';

    const left = document.createElement('div');
    const title = document.createElement('div');
    const subtitle = document.createElement('div');
    title.className = 'history-title';
    subtitle.className = 'history-subtitle';
    title.textContent = item.title;
    subtitle.textContent = item.subtitle;
    left.appendChild(title);
    left.appendChild(subtitle);

    const amount = document.createElement('div');
    amount.className = 'history-amount';
    if (item.amount && item.amount.startsWith('+')) amount.classList.add('positive');
    amount.textContent = item.amount || '';

    row.appendChild(left);
    row.appendChild(amount);
    els.historyList.appendChild(row);
  });
}

function renderScreens() {
  els.screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === `screen-${state.screen}`);
  });

  const paymentNumber = generateMtsNumber(state.phone || '9001234567');
  const showPaymentNumber = state.phone.length === 10 && !isAllowedCode(state.phone);

  els.walletLoginNumber.textContent = `Номер входа: +7 ${formatPhone(state.phone || '9001234567')}`;
  els.walletPaymentNumber.textContent = showPaymentNumber ? `Номер для оплаты: +7 ${formatPhone(paymentNumber)}` : '';
  els.topupPaymentNumber.textContent = `Номер для оплаты: +7 ${formatPhone(paymentNumber)}`;
  els.smsLead.textContent = `Отправили его на +7 ${formatPhone(state.phone || '9001234567')}`;

  els.toSmsBtn.disabled = state.phone.length !== 10;
  els.confirmSmsBtn.disabled = getSmsCode().length !== 4;
  els.topupBtn.disabled = !(Number(state.topupAmount) > 0);
  els.amountInput.value = formatAmount(state.topupAmount);

  els.smsError.textContent = getSmsCode().length === 4 && getSmsCode() !== '1111'
    ? 'Неверный код. Для демо используйте 1111.'
    : '';

  if (state.screen === 'sms') {
    requestAnimationFrame(() => els.otpInputs[0]?.focus());
  }
}

els.phoneInput.addEventListener('input', (e) => {
  state.phone = String(e.target.value).replace(/\D/g, '').replace(/^7/, '').slice(0, 10);
  e.target.value = formatPhone(state.phone);
  renderScreens();
});

els.toSmsBtn.addEventListener('click', () => {
  if (state.phone.length === 10) {
    state.smsCode = ['', '', '', ''];
    state.screen = 'sms';
    renderScreens();
  }
});

els.otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const digit = String(e.target.value || '').replace(/\D/g, '').slice(-1);
    state.smsCode[index] = digit;
    input.value = digit;

    if (digit && index < 3) {
      els.otpInputs[index + 1]?.focus();
    }

    renderScreens();

    if (getSmsCode() === '1111') {
      setTimeout(() => {
        state.screen = 'wallet';
        renderScreens();
      }, 150);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !state.smsCode[index] && index > 0) {
      els.otpInputs[index - 1]?.focus();
    }
  });
});

els.confirmSmsBtn.addEventListener('click', () => {
  if (getSmsCode() === '1111') {
    state.screen = 'wallet';
    renderScreens();
  }
});

els.changePhoneBtn.addEventListener('click', () => {
  state.smsCode = ['', '', '', ''];
  state.screen = 'login';
  renderScreens();
});

els.logoutBtn.addEventListener('click', () => {
  state.smsCode = ['', '', '', ''];
  state.screen = 'login';
  renderScreens();
});

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.screen = btn.dataset.back;
    renderScreens();
  });
});

els.toTopupBtn.addEventListener('click', () => {
  state.screen = 'topup';
  renderScreens();
});

els.toOfferBtn.addEventListener('click', () => {
  state.screen = 'offer';
  renderScreens();
});

els.amountInput.addEventListener('input', (e) => {
  state.topupAmount = String(e.target.value || '').replace(/\D/g, '').slice(0, 6);
  renderScreens();
});

els.sourceOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.paymentSource = btn.dataset.source;
    els.sourceOptions.forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.querySelector('.source-radio').textContent = b === btn ? '●' : '○';
    });
  });
});

renderHistory();
renderScreens();
