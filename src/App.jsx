import './App.css'
import {Routes, Route} from 'react-router-dom'
import Today from './components/Today'
import Plans from './components/Plans'
import Progress from './components/Progress'
import Navigation from './components/Navigation'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      <Navigation />
    </>
  );
}

export default App
