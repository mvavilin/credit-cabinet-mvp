import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Outcome = 'approved' | 'more_info' | 'alternative' | 'rejected' | null
export type Stage = 'need' | 'profile' | 'products' | 'application' | 'review' | 'result'
export type BusinessProfile = {
  company: string; inn: string; companyCreatedAt: string; purpose: string; amount: number; term: number;
  revenue: number; expenses: number; existingPayments: number; monthsInBusiness: number;
  docsReady: boolean; overdue: boolean; guarantorAvailable: boolean; bkiConsent: boolean
}
export type Application = {
  id: string; createdAt: string; profile: BusinessProfile; productId: string;
  status: string; outcome: Outcome; message: string
}
export type Borrower = { company: string; inn: string; monthsInBusiness: number; companyCreatedAt: string }
export type RegistrationCompany = { company: string; inn: string; companyCreatedAt: string }

export const initialProfile: BusinessProfile = {
  company: '', inn: '', companyCreatedAt: '', purpose: 'working_capital', amount: 2000000,
  term: 12, revenue: 0, expenses: 0, existingPayments: 0,
  monthsInBusiness: 0, docsReady: false, overdue: false, guarantorAvailable: false, bkiConsent: false
}

export const purposes = [
  { id: 'working_capital', label: 'Пополнение оборотных средств', description: 'Закупка сырья и товаров, зарплата и текущие расходы' },
  { id: 'investments', label: 'Финансирование инвестиций и капвложений', description: 'Оборудование, техника, недвижимость, модернизация' },
  { id: 'cash_gaps', label: 'Закрытие кассовых разрывов', description: 'Временная нехватка денег из-за сезонности или задержек оплат' },
  { id: 'refinancing', label: 'Рефинансирование действующих кредитов', description: 'Замена дорогих займов или объединение платежей' },
  { id: 'expansion', label: 'Расширение бизнеса', description: 'Новые направления, рынки, штат или мощности' },
  { id: 'other', label: 'Другое', description: 'Если цель не подходит под перечисленные варианты' },
]

export const products = [
  { id: 'investment', name: 'Инвестиционный кредит', description: 'Для оборотного и основного капитала. Часто требуется залог; длительный срок и сравнительно невысокая ставка.', max: 10000000, rate: 0.195, term: 36, tag: 'Для развития', fee: 0, purposes: ['working_capital','investments','refinancing','expansion','other'] },
  { id: 'overdraft', name: 'Овердрафт', description: 'Для краткосрочных кассовых разрывов. До 2 месяцев; доступность зависит от расчётного счёта в банке.', max: 3000000, rate: 0.22, term: 2, tag: 'Кассовый разрыв', fee: 0, purposes: ['cash_gaps'] },
  { id: 'credit-line', name: 'Кредитная линия', description: 'Для сезонных закупок и поэтапного финансирования. Вид линии (ВКЛ/НКЛ) определяется при проверке документов.', max: 10000000, rate: 0.205, term: 24, tag: 'Гибкое использование', fee: 0, purposes: ['working_capital','expansion','other'] },
  { id: 'cfa', name: 'ЦФА — цифровые финансовые активы', description: 'Вариант привлечения инвестиций на срок до года при соответствии критериям выпуска.', max: 5000000, rate: 0.23, term: 12, tag: 'До 1 года', fee: 0, purposes: ['investments','expansion','other'] },
]

export function monthsSince(date: string) {
  if (!date) return 0
  const start = new Date(`${date}T00:00:00`)
  if (Number.isNaN(start.getTime())) return 0
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() - (now.getDate() < start.getDate() ? 1 : 0))
}

function decide(profile: BusinessProfile, productId: string): { outcome: Outcome; status: string; message: string } {
  if (!profile.docsReady) return { outcome: 'more_info', status: 'Нужны данные', message: 'Для продолжения проверки необходимо подтвердить обязательные сведения и документы.' }
  if (profile.overdue || profile.revenue <= 0 || profile.expenses >= profile.revenue) return { outcome: 'rejected', status: 'Отказ', message: 'По демонстрационным правилам заявка не проходит предварительную проверку финансовых показателей или платёжной дисциплины.' }
  const operatingCashFlow = profile.revenue - profile.expenses
  const monthly = monthlyPayment(profile.amount, products.find(p => p.id === productId)?.rate ?? 0.205, profile.term)
  const debtServiceCoverage = operatingCashFlow / Math.max(1, profile.existingPayments + monthly)
  if (debtServiceCoverage < 1.3) return { outcome: 'alternative', status: 'Альтернативные условия', message: 'Расчётная нагрузка высока относительно свободного денежного потока. Предлагается рассмотреть меньшую сумму или больший срок.' }
  return { outcome: 'approved', status: 'Одобрено (демо)', message: 'Заявка прошла демонстрационные правила. Это симуляция, а не реальное решение банка.' }
}

export function monthlyPayment(principal: number, annualRate: number, months: number) {
  if (months <= 0) return 0
  const r = annualRate / 12
  if (r === 0) return principal / months
  return principal * r / (1 - Math.pow(1 + r, -months))
}

function nextId() { return `MVP-${Math.floor(100000 + Math.random() * 900000)}` }

type CabinetState = {
  stage: Stage; profile: BusinessProfile; selectedProductId: string; chat: { role: 'assistant' | 'user'; text: string }[];
  applications: Application[]; activeApplicationId: string | null; borrowers: Borrower[];
  setStage: (stage: Stage) => void; updateProfile: (patch: Partial<BusinessProfile>) => void;
  selectProduct: (id: string) => void; sendMessage: (text: string) => void;
  setActiveApplication: (id: string | null) => void;
  addBorrower: (borrower: Borrower) => void; saveBorrower: (borrower: Borrower) => void;
  applyRegistrationCompany: (company?: RegistrationCompany) => void;
  submitApplication: () => string | null; processApplication: () => void; resetDemo: () => void;
}

const defaultChat = [{ role: 'assistant' as const, text: 'Опишите, на что бизнесу нужны деньги. Я помогу собрать параметры заявки и сравнить варианты финансирования.' }]

export const useCabinet = create<CabinetState>()(persist((set, get) => ({
  stage: 'need', profile: initialProfile, selectedProductId: products[0].id,
  chat: defaultChat,
  applications: [], activeApplicationId: null, borrowers: [],
  setStage: stage => set({ stage }),
  updateProfile: patch => set(state => {
    const next = { ...state.profile, ...patch }
    if (patch.companyCreatedAt !== undefined) next.monthsInBusiness = monthsSince(patch.companyCreatedAt)
    return { profile: next }
  }),
  addBorrower: borrower => set(state => state.borrowers.some(b => b.inn === borrower.inn) ? state : ({ borrowers: [...state.borrowers, borrower] })),
  saveBorrower: borrower => set(state => ({ borrowers: [...state.borrowers.filter(b => b.inn !== borrower.inn), borrower] })),
  applyRegistrationCompany: company => {
    if (!company) return
    const months = monthsSince(company.companyCreatedAt)
    const borrower: Borrower = { ...company, monthsInBusiness: months }
    set(state => ({
      profile: {
        ...state.profile,
        company: borrower.company,
        inn: borrower.inn,
        companyCreatedAt: borrower.companyCreatedAt,
        monthsInBusiness: months,
      },
      borrowers: state.borrowers.some(b => b.inn === borrower.inn) ? state.borrowers : [...state.borrowers, borrower],
    }))
  },
  selectProduct: id => { const selected = products.find(p => p.id === id); if (!selected) return; set(state => ({ selectedProductId: id, profile: { ...state.profile, amount: Math.min(state.profile.amount, selected.max), term: Math.min(state.profile.term, selected.term) } })) },
  sendMessage: text => {
    const clean = text.trim(); if (!clean) return
    const p = get().profile
    const updates: Partial<BusinessProfile> = {}
    const amountMatch = clean.match(/(\d[\d\s]*(?:[.,]\d+)?)\s*(млн|тыс|руб|₽)?/i)
    if (/кассов|разрыв/i.test(clean)) updates.purpose = 'cash_gaps'; else if (/оборуд|инвест|капвлож/i.test(clean)) updates.purpose = 'investments'; else if (/рефинанс/i.test(clean)) updates.purpose = 'refinancing'; else if (/расшир/i.test(clean)) updates.purpose = 'expansion'; else if (/закуп|товар|оборот/i.test(clean)) updates.purpose = 'working_capital'
    if (amountMatch) {
      const n = Number(amountMatch[1].replace(/\s/g, '').replace(',', '.'))
      updates.amount = Math.min(5000000, n * (/млн/i.test(amountMatch[2] || '') ? 1000000 : /тыс/i.test(amountMatch[2] || '') ? 1000 : 1))
    }
    const next = { ...p, ...updates }
    const response = `Зафиксировал потребность: ${(purposes.find(x => x.id === next.purpose)?.label ?? next.purpose).toLowerCase()}, сумма ${new Intl.NumberFormat('ru-RU').format(next.amount)} ₽. Для предварительного подбора нужны выручка, расходы и действующие платежи. Проверьте финансовый профиль перед продолжением.`
    set(state => ({ profile: next, chat: [...state.chat, { role: 'user', text: clean }, { role: 'assistant', text: response }] }))
  },
  setActiveApplication: id => set({ activeApplicationId: id }),
  submitApplication: () => {
    const { profile, selectedProductId } = get()
    const selected = products.find(p => p.id === selectedProductId)
    if (!profile.company.trim() || !/^\d{10}(?:\d{2})?$/.test(profile.inn) || profile.amount <= 0 || profile.revenue <= 0 || profile.term <= 0 || !profile.bkiConsent || !selected || profile.amount > selected.max || profile.term > selected.term) return null
    const app: Application = { id: nextId(), createdAt: new Date().toISOString(), profile: { ...profile }, productId: selectedProductId, status: 'Подана', outcome: null, message: 'Заявка зарегистрирована. Проверки ещё не запускались.' }
    set(state => ({ applications: [app, ...state.applications], activeApplicationId: app.id, stage: 'review' }))
    return app.id
  },
  processApplication: () => {
    const state = get(); const app = state.applications.find(a => a.id === state.activeApplicationId)
    if (!app) return
    const result = decide(app.profile, app.productId)
    set(s => ({ applications: s.applications.map(a => a.id === app.id ? { ...a, status: result.status, outcome: result.outcome, message: result.message } : a), stage: 'result' }))
  },
  resetDemo: () => set({ stage: 'need', profile: initialProfile, selectedProductId: products[0].id, chat: defaultChat, applications: [], activeApplicationId: null }),
}), { name: 'credit-cabinet-mvp-v3' }))