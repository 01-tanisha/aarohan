import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm AAROHAN Assistant. Ask me about Five-Fold activities, attendance, registration, or anything else!",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Text-to-Speech function
  const speakText = (text) => {
    if (!speechEnabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.includes("Female") ||
        voice.name.includes("Zira") ||
        voice.name.includes("Samantha")
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Get chatbot response from backend
  const getBotResponse = async (userMessage) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Chatbot API error:", error);
      return "Sorry, I'm having trouble connecting. Please try again later.";
    }
  };

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Get bot response
    const botResponseText = await getBotResponse(inputValue);

    const botMessage = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: "bot",
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);

    // Speak the response
    speakText(botResponseText);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle chatbot
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      stopSpeaking();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h4>AAROHAN Assistant</h4>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className={`speech-toggle ${speechEnabled ? "active" : ""}`}
                onClick={() => setSpeechEnabled(!speechEnabled)}
                title={speechEnabled ? "Disable voice" : "Enable voice"}
              >
                {speechEnabled ? "🔊" : "🔇"}
              </button>
              {isSpeaking && (
                <button
                  className="stop-speech"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  ⏹️
                </button>
              )}
              <button className="close-btn" onClick={toggleChat}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
              >
                {msg.sender === "bot" && <span className="bot-icon">🤖</span>}
                <div className="message-content">
                  <p>{msg.text}</p>
                  {msg.sender === "bot" && (
                    <button
                      className="speak-btn"
                      onClick={() => speakText(msg.text)}
                      title="Read aloud"
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <span className="bot-icon">🤖</span>
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
            >
              ➤
            </button>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button onClick={() => setInputValue("What are Five-Fold activities?")}>
              Five-Fold Activities
            </button>
            <button onClick={() => setInputValue("How to check attendance?")}>
              Attendance
            </button>
            <button onClick={() => setInputValue("How to register?")}>
              Registration
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChat}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default Chatbot;
