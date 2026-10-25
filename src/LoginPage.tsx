import { useState, type FormEvent } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

type RegistrationCompany = { company: string; inn: string; companyCreatedAt: string }
type LoginPageProps = {
  onSuccess?: (data: { email: string; mode: 'login' | 'register'; company?: RegistrationCompany }) => void
  onBack?: () => void
}

export default function LoginPage({ onSuccess, onBack }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@company.ru')
  const [password, setPassword] = useState('Demo1234')
  const [company, setCompany] = useState('ООО «Дом и уют»')
  const [inn, setInn] = useState('7701234567')
  const [companyCreatedAt, setCompanyCreatedAt] = useState('2023-08-21')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов.')
      return
    }
    let companyData: RegistrationCompany | undefined
    if (mode === 'register') {
      const normalizedInn = inn.replace(/\D/g, '')
      if (!company.trim()) { setError('Укажите название компании или ИП.'); return }
      if (!/^\d{10}(?:\d{2})?$/.test(normalizedInn)) { setError('ИНН должен содержать 10 или 12 цифр.'); return }
      if (!companyCreatedAt || Number.isNaN(new Date(companyCreatedAt).getTime()) || new Date(companyCreatedAt) > new Date()) { setError('Укажите корректную дату создания компании.'); return }
      companyData = { company: company.trim(), inn: normalizedInn, companyCreatedAt }
    }
    onSuccess?.({ email: email.trim(), mode, ...(companyData ? { company: companyData } : {}) })
    if (!onSuccess) setSubmitted(true)
  }

  return <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#a9162b] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-[#a9162b]">A</div><div><div className="font-bold">Бизнес-финансирование</div><div className="text-sm text-white/70">Умный кредитный кабинет</div></div></div>
        <div className="max-w-lg"><div className="mb-5 inline-flex rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold">Финансовые инструменты для бизнеса</div><h1 className="text-4xl font-bold leading-tight">Управляйте финансированием в одном кабинете</h1><p className="mt-5 max-w-md text-base leading-7 text-white/75">Соберите финансовый профиль, сравните варианты и отслеживайте ход заявки.</p><div className="mt-8 flex items-center gap-3 text-sm text-white/80"><ShieldCheck size={20}/> Демонстрационный прототип</div></div>
        <p className="text-xs text-white/60">Данные и решения в прототипе не являются банковской услугой.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a9162b] text-lg font-black text-white">A</div><div><div className="font-bold">Бизнес-финансирование</div><div className="text-xs text-slate-500">Умный кредитный кабинет</div></div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {!submitted ? <>
              <div className="mb-6"><p className="text-sm font-semibold text-[#a9162b]">Личный кабинет</p><h2 className="mt-2 text-2xl font-bold">{mode === 'login' ? 'Вход в аккаунт' : 'Создать аккаунт'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Введите данные для входа в кабинет предпринимателя.' : 'Зарегистрируйте профиль для работы с финансовыми инструментами.'}</p></div>
              <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setMode('login'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Вход</button><button type="button" onClick={() => { setMode('register'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Регистрация</button></div>
              <form onSubmit={submit} className="space-y-4">
                <label className="block"><span className="mb-1.5 block text-sm font-medium">Электронная почта</span><span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#a9162b]"><Mail size={17} className="text-slate-400"/><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.ru" className="min-w-0 flex-1 py-3 text-sm outline-none"/></span></label>
                {mode === 'register' && <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div><h3 className="font-semibold text-slate-900">Данные компании</h3><p className="mt-1 text-xs leading-5 text-slate-500">Эти сведения будут переданы вместе с данными регистрации.</p></div>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium">Название компании или ИП</span><input required value={company} onChange={e => setCompany(e.target.value)} placeholder="ООО «Компания» или ИП Иванов И.И." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#a9162b]" /></label>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium">ИНН</span><input required value={inn} onChange={e => setInn(e.target.value.replace(/\D/g, '').slice(0, 12))} inputMode="numeric" maxLength={12} placeholder="10 или 12 цифр" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#a9162b]" /></label>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium">Дата создания компании</span><input required type="date" value={companyCreatedAt} max={new Date().toISOString().slice(0, 10)} onChange={e => setCompanyCreatedAt(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#a9162b]" /></label>
                </div>}
                <label className="block"><span className="mb-1.5 block text-sm font-medium">Пароль</span><span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#a9162b]"><LockKeyhole size={17} className="text-slate-400"/><input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Не менее 8 символов" className="min-w-0 flex-1 py-3 text-sm outline-none"/></span></label>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a9162b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800">{mode === 'login' ? 'Войти' : 'Зарегистрироваться'} <ArrowRight size={17}/></button>
              </form>
              <p className="mt-5 text-center text-xs leading-5 text-slate-400">Демо-экран: реальная проверка учётных данных и создание аккаунта не подключены.</p>
              {onBack && <button type="button" onClick={onBack} className="mt-4 w-full text-sm font-medium text-slate-500 hover:text-slate-900">Вернуться в кабинет</button>}
            </> : <div className="py-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck size={28}/></div><h2 className="mt-5 text-2xl font-bold">{mode === 'login' ? 'Форма входа отправлена' : 'Регистрация подготовлена'}</h2><p className="mt-3 text-sm leading-6 text-slate-500">Это демонстрационный экран. Серверная авторизация не настроена, поэтому аккаунт не создан и вход не выполнен.</p><button type="button" onClick={() => setSubmitted(false)} className="mt-6 rounded-xl bg-[#a9162b] px-4 py-3 text-sm font-semibold text-white">Вернуться к форме</button>{onBack && <button type="button" onClick={onBack} className="mt-3 block w-full text-sm text-slate-500">Вернуться в кабинет</button>}</div>}
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">© Бизнес-финансирование · Прототип</p>
        </div>
      </section>
    </div>
  </main>
}