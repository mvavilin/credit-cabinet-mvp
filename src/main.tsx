import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import LoginPage from './LoginPage'
import './index.css'

type LoginData = {
  email: string
  mode: 'login' | 'register'
  company?: string
  inn?: string
  monthsInBusiness?: number
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
