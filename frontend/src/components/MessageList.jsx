import React from 'react';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageList = ({ messages, currentUser }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {messages.map((msg) => {
        const isSystem = msg.username === 'System';
        const isOwn = msg.username === currentUser;
        return (
          <div key={msg._id || msg.timestamp} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start'
          }}>
            {!isSystem && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{msg.username}</span>
                <span style={{ color: '#888' }}>{formatTime(msg.timestamp)}</span>
              </div>
            )}
            <div style={{
              backgroundColor: isSystem ? '#334155' : (isOwn ? '#3b82f6' : '#1e293b'),
              color: isSystem ? '#ccc' : '#fff',
              padding: '8px 12px',
              borderRadius: '16px',
              maxWidth: '70%',
              wordBreak: 'break-word',
              fontStyle: isSystem ? 'italic' : 'normal'
            }}>
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;