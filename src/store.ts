import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Outcome = 'approved' | 'more_info' | 'alternative' | 'rejected' | null
export type Stage = 'need' | 'profile' | 'products' | 'application' | 'review' | 'result'
export type BusinessProfile = {
  company: string; inn: string; purpose: string; amount: number; term: number;
  revenue: number; expenses: number; existingPayments: number; monthsInBusiness: number;
  docsReady: boolean; overdue: boolean
}
export type Application = {
  id: string; createdAt: string; profile: BusinessProfile; productId: string;
  status: string; outcome: Outcome; message: string
}

export const initialProfile: BusinessProfile = {
  company: 'ООО «Дом и уют»', inn: '7701234567', purpose: 'Закупка товара', amount: 2000000,
  term: 12, revenue: 1500000, expenses: 1100000, existingPayments: 50000,
  monthsInBusiness: 24, docsReady: true, overdue: false
}

export const products = [
  { id: 'working-capital', name: 'Кредит на пополнение оборотных средств', description: 'Для закупки товара и текущих расходов бизнеса', max: 5000000, rate: 0.145, term: 12, tag: 'Рекомендуем', fee: 0 },
  { id: 'credit-line', name: 'Возобновляемая кредитная линия', description: 'Для нескольких закупок по мере необходимости', max: 5000000, rate: 0.16, term: 24, tag: 'Гибкое использование', fee: 0 }
]

function decide(profile: BusinessProfile): { outcome: Outcome; status: string; message: string } {
  if (!profile.docsReady) return { outcome: 'more_info', status: 'Нужны данные', message: 'Для продолжения проверки необходимо подтвердить обязательные сведения и документы.' }
  if (profile.overdue || profile.revenue <= 0 || profile.expenses >= profile.revenue) return { outcome: 'rejected', status: 'Отказ', message: 'По демонстрационным правилам заявка не проходит предварительную проверку финансовых показателей или платёжной дисциплины.' }
  const available = profile.revenue - profile.expenses - profile.existingPayments
  const monthly = monthlyPayment(profile.amount, 0.145, profile.term)
  if (available < monthly * 1.3) return { outcome: 'alternative', status: 'Альтернативные условия', message: 'Расчётная нагрузка высока относительно свободного денежного потока. Предлагается рассмотреть меньшую сумму или больший срок.' }
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
  applications: Application[]; activeApplicationId: string | null;
  setStage: (stage: Stage) => void; updateProfile: (patch: Partial<BusinessProfile>) => void;
  selectProduct: (id: string) => void; sendMessage: (text: string) => void;
  submitApplication: () => string | null; processApplication: () => void; resetDemo: () => void;
}

export const useCabinet = create<CabinetState>()(persist((set, get) => ({
  stage: 'need', profile: initialProfile, selectedProductId: products[0].id,
  chat: [{ role: 'assistant', text: 'Опишите, на что бизнесу нужны деньги. Я помогу собрать параметры заявки и сравнить варианты финансирования.' }],
  applications: [], activeApplicationId: null,
  setStage: stage => set({ stage }),
  updateProfile: patch => set(state => ({ profile: { ...state.profile, ...patch } })),
  selectProduct: id => set({ selectedProductId: id }),
  sendMessage: text => {
    const clean = text.trim(); if (!clean) return
    const p = get().profile
    const updates: Partial<BusinessProfile> = {}
    const amountMatch = clean.match(/(\d[\d\s]*(?:[.,]\d+)?)\s*(млн|тыс|руб|₽)?/i)
    if (/закуп|товар|оборот/i.test(clean)) updates.purpose = 'Закупка товара'
    if (amountMatch) {
      const n = Number(amountMatch[1].replace(/\s/g, '').replace(',', '.'))
      updates.amount = Math.min(5000000, n * (/млн/i.test(amountMatch[2] || '') ? 1000000 : /тыс/i.test(amountMatch[2] || '') ? 1000 : 1))
    }
    const next = { ...p, ...updates }
    const response = `Зафиксировал потребность: ${next.purpose.toLowerCase()}, сумма ${new Intl.NumberFormat('ru-RU').format(next.amount)} ₽. Для предварительного подбора нужны выручка, расходы и действующие платежи. Проверьте финансовый профиль перед продолжением.`
    set(state => ({ profile: next, chat: [...state.chat, { role: 'user', text: clean }, { role: 'assistant', text: response }] }))
  },
  submitApplication: () => {
    const { profile, selectedProductId } = get()
    if (!profile.company.trim() || !/^\d{10,12}$/.test(profile.inn) || profile.amount <= 0 || profile.revenue <= 0 || profile.term <= 0) return null
    const app: Application = { id: nextId(), createdAt: new Date().toISOString(), profile: { ...profile }, productId: selectedProductId, status: 'Подана', outcome: null, message: 'Заявка зарегистрирована. Проверки ещё не запускались.' }
    set(state => ({ applications: [app, ...state.applications], activeApplicationId: app.id, stage: 'review' }))
    return app.id
  },
  processApplication: () => {
    const state = get(); const app = state.applications.find(a => a.id === state.activeApplicationId)
    if (!app) return
    const result = decide(app.profile)
    set(s => ({ applications: s.applications.map(a => a.id === app.id ? { ...a, status: result.status, outcome: result.outcome, message: result.message } : a), stage: 'result' }))
  },
  resetDemo: () => set({ stage: 'need', profile: initialProfile, selectedProductId: products[0].id, chat: [{ role: 'assistant', text: 'Опишите, на что бизнесу нужны деньги. Я помогу собрать параметры заявки и сравнить варианты финансирования.' }], applications: [], activeApplicationId: null })
}), { name: 'credit-cabinet-mvp-v1' }))
