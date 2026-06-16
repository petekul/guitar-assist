import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import ChordsByNote from './pages/ChordsByNote'
import TabInput from './pages/TabInput'
import Visualiser from './pages/Visualiser'
import FretboardVisualiser from './pages/FretboardVisualiser'
import TabLibrary from './pages/TabLibrary'
import ScaleBrowser from './pages/ScaleBrowser'
import { SelectedChordsProvider } from './context/SelectedChordsContext'

export default function App() {
  return (
    <SelectedChordsProvider>
    <HashRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chords" element={<Navigate to="/chords/C" replace />} />
        <Route path="/chords/:note" element={<ChordsByNote />} />
        <Route path="/tab" element={<TabInput />} />
        <Route path="/visualiser" element={<Visualiser />} />
        <Route path="/fretboard" element={<FretboardVisualiser />} />
        <Route path="/library" element={<TabLibrary />} />
        <Route path="/scales" element={<ScaleBrowser />} />
      </Routes>
    </HashRouter>
    </SelectedChordsProvider>
  )
}
