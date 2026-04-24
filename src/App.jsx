import './App.css'
import {Routes, Route} from 'react-router-dom'
import Today from './components/Today'
import Plan from './components/Plan'
import Progress from './components/Progress'

function App() {

 
  return (
    <Routes>
    <Route path="/" element={<Today/>}/>
    <Route path="/plan" element={<Plan/>}/>
    <Route path="/progress" element={<Progress/>}/>
  </Routes>

  )
}

export default App
