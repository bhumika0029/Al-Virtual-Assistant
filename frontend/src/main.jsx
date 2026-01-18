import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// 🔴 CHANGE THIS LINE (lowercase 'u')
// import UserContext from './context/userContext.jsx'

// ✅ TO THIS LINE (Capital 'U')
import UserContext from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserContext>
      <App />
    </UserContext>
  </BrowserRouter>
)