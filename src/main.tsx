import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LoginPage from './LoginPage'
import './index.css'
import type { RegistrationCompany } from './store'

type LoginData = {
  email: string
  mode: 'login' | 'register'
  company?: RegistrationCompany
}

function Root() {
  const [loginData, setLoginData] = useState<LoginData | null>(null)

  if (!loginData) {
    return <LoginPage onSuccess={data => setLoginData(data)} />
  }

  return <App loginData={loginData} onLogout={() => setLoginData(null)} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)