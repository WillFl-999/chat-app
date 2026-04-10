import React, { useState, useEffect } from 'react';
import './RoomList.css';

const defaultRooms = ['General', 'Sports', 'Technology', 'Gaming'];

const RoomList = ({ socket, onJoinRoom }) => {
  const [rooms, setRooms] = useState(defaultRooms);

  useEffect(() => {
    if (!socket) return;
    socket.emit('get_rooms');
    const handleRoomList = (activeRooms) => {
      const merged = [...new Set([...defaultRooms, ...activeRooms])];
      setRooms(merged);
    };
    socket.on('room_list', handleRoomList);
    return () => socket.off('room_list', handleRoomList);
  }, [socket]);

  return (
    <div className="roomlist-container">
      <div className="roomlist-header">
        <h2>Chat Rooms</h2>
      </div>
      <div className="roomlist-grid">
        {rooms.map((room) => (
          <div key={room} className="room-card" onClick={() => onJoinRoom(room)}>
            <span className="room-icon">#</span>
            <span className="room-name">{room}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;