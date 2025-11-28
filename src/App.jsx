import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import Signup from './pages/Signup.jsx'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <>
      <Header />
      
      <Routes>
        <Route path="/"/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}

export default App
