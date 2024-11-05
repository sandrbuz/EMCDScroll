import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UserFeed from './UserFeed.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserFeed />
  </StrictMode>,
)
