import React, { useState } from 'react';
import './Landing.css';

const Landing = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Name cannot exceed 20 characters');
      return;
    }
    onNameSubmit(trimmed);
  };

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1 className="landing-title">💬 ChatSphere</h1>
        <p className="landing-subtitle">Join the conversation</p>
        <form onSubmit={handleSubmit} className="landing-form">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className={`landing-input ${error ? 'error' : ''}`}
            autoFocus
            maxLength={20}
          />
          {error && <span className="error-message">{error}</span>}
          <button type="submit" className="landing-button">Enter Chat</button>
        </form>
      </div>
    </div>
  );
};

export default Landing;