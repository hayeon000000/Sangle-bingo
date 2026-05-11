import React from 'react'
import { GameProvider, useGame } from './contexts/GameContext'
import HomePage from './pages/HomePage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import MasterLobbyPage from './pages/MasterLobbyPage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'

function Router() {
  const { state } = useGame()

  switch (state.view) {
    case 'home':          return <HomePage />
    case 'create-room':   return <CreateRoomPage />
    case 'join-room':     return <JoinRoomPage />
    case 'master-lobby':  return <MasterLobbyPage />
    case 'game':          return <GamePage />
    case 'results':       return <ResultsPage />
    default:              return <HomePage />
  }
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  )
}
