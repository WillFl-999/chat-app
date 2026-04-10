import React, { useState } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import Landing from './components/Landing';
import RoomList from './components/RoomList';
import ChatRoom from './components/ChatRoom';
import './App.css';

const ChatApp = () => {
  const { socket, isConnected } = useSocket();
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);

  if (!isConnected || !socket) {
    return <div className="app loading">Conectando ao servidor...</div>;
  }

  if (!username) {
    return <Landing onNameSubmit={setUsername} />;
  }

  if (!currentRoom) {
    return <RoomList socket={socket} onJoinRoom={setCurrentRoom} />;
  }

  return (
    <ChatRoom
      socket={socket}
      username={username}
      room={currentRoom}
      onLeaveRoom={() => setCurrentRoom(null)}
    />
  );
};

const App = () => (
  <SocketProvider>
    <ChatApp />
  </SocketProvider>
);

export default App;