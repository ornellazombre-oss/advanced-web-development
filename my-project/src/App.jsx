import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PortfolioPage from './pages/PortfolioPage'
import FormPage from './pages/FormPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/form" element={<FormPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App