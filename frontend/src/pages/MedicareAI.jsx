import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { mockAIChatHistory } from '../data/mockData';
import { Button } from '../components/ui/Button';
import './pages.css';

export const MedicareAI = () => {
  const [messages, setMessages] = useState(mockAIChatHistory);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simulate smart AI response
    setTimeout(() => {
      let botResponseText = "Based on your clinical record, please ensure to follow dosage instructions closely. If symptoms persist for over 48 hours, consider consulting a specialist.";

      const lower = text.toLowerCase();
      if (lower.includes('antibiotic') || lower.includes('amoxicillin')) {
        botResponseText = "Amoxicillin is prescribed for bacterial infections. Make sure to complete the entire 7-day course even if you feel better earlier. Common mild side effects include slight stomach upset.";
      } else if (lower.includes('headache') || lower.includes('fatigue') || lower.includes('symptom')) {
        botResponseText = "Headache combined with mild fatigue can stem from dehydration, tension, or initial viral exposure. Ensure to drink 2-3 liters of fluids today. If severe throbbing occurs, check your blood pressure.";
      } else if (lower.includes('remind') || lower.includes('pill')) {
        botResponseText = "Your next scheduled dose is **Amoxicillin 500mg** & **Metformin 850mg** at **08:00 PM** this evening. Would you like me to set a push notification?";
      } else if (lower.includes('clinic') || lower.includes('hospital') || lower.includes('emergency')) {
        botResponseText = "The nearest facility is **MetroCare Emergency Hospital** (1.2 km away, 24/7 Trauma Unit available). You can call emergency response at **911** directly from the top bar.";
      }

      const botMsg = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedChips: [
          "Check drug interactions",
          "Log health vitals",
          "Book clinic visit"
        ]
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="ai-page-container fade-in">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-header-info">
          <div className="ai-avatar-icon">
            <Bot size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>MediCare AI Clinical Assistant</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary-200)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span>
              24/7 Active • Powered by Healthcare Knowledge Engine
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => setMessages(mockAIChatHistory)}
          style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          Reset Chat
        </Button>
      </div>

      {/* Messages Feed */}
      <div className="ai-chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.35rem', display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              {msg.time}
            </span>

            {msg.suggestedChips && (
              <div className="suggested-chips-wrapper">
                {msg.suggestedChips.map((chip, idx) => (
                  <button
                    key={idx}
                    className="chip"
                    style={{ fontSize: '0.775rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--neutral-100)' }}
                    onClick={() => handleSendMessage(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble bot fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} className="animate-spin text-primary" />
            <span>MediCare AI is formulating medical insights...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        className="ai-chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          type="text"
          placeholder="Ask MediCare AI about symptoms, dosage, side effects, or lab results..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          icon={Send}
          disabled={!inputValue.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
