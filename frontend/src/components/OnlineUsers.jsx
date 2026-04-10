import React from 'react';
import './OnlineUsers.css';

const OnlineUsers = ({ users }) => {
  return (
    <div className="online-users">
      <h3>Online — {users.length}</h3>
      <ul>
        {users.map((user, idx) => (
          <li key={idx}>
            <span className="online-dot"></span>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;