import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import './ChatRoom.css';

const ChatRoom = ({ socket, username, room, onLeaveRoom }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_room', { username, room });

    const handlePrevious = (msgs) => setMessages(msgs);
    const handleNew = (msg) => setMessages(prev => [...prev, msg]);
    const handleUsers = (users) => setOnlineUsers(users);
    const handleJoined = (data) => setMessages(prev => [...prev, {
      _id: `system-${Date.now()}`,
      username: 'System',
      text: data.message,
      timestamp: new Date()
    }]);
    const handleLeft = (data) => setMessages(prev => [...prev, {
      _id: `system-${Date.now()}`,
      username: 'System',
      text: data.message,
      timestamp: new Date()
    }]);

    socket.on('previous_messages', handlePrevious);
    socket.on('new_message', handleNew);
    socket.on('online_users', handleUsers);
    socket.on('user_joined', handleJoined);
    socket.on('user_left', handleLeft);

    return () => {
      socket.off('previous_messages', handlePrevious);
      socket.off('new_message', handleNew);
      socket.off('online_users', handleUsers);
      socket.off('user_joined', handleJoined);
      socket.off('user_left', handleLeft);
    };
  }, [socket, room, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (text.trim()) socket.emit('send_message', { text });
  };

  return (
    <div className="chatroom">
      <div className="chat-header">
        <button className="back-btn" onClick={onLeaveRoom}>← Rooms</button>
        <div className="room-info">
          <h2>#{room}</h2>
          <span className="user-count">{onlineUsers.length} online</span>
        </div>
      </div>
      <div className="chat-main">
        <div className="messages-container">
          <MessageList messages={messages} currentUser={username} />
          <div ref={messagesEndRef} />
        </div>
        <OnlineUsers users={onlineUsers} />
      </div>
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};

export default ChatRoom;