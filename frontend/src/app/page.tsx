"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

// Simple markdown renderer since ReactMarkdown isn't available
const SimpleMarkdown = ({ children }) => {
  const formatText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Handle code blocks (```code```)
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-3 border"><code class="text-gray-800">$1</code></pre>');
    
    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm text-red-600 font-mono">$1</code>');
    
    // Handle bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');
    
    // Handle italic (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
    
    // Handle headers
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-blue-700">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-3 text-blue-800">$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-blue-900">$1</h1>');
    
    // Handle bullet points
    text = text.replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    text = text.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    
    // Handle numbered lists
    text = text.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>');
    
    // Handle line breaks and paragraphs
    text = text.replace(/\n\n/g, '</p><p class="mb-3">');
    text = text.replace(/\n/g, '<br>');
    
    return text;
  };

  return (
    <div 
      className="prose prose-sm max-w-none text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-2">${formatText(children)}</p>` 
      }} 
    />
  );
};

export default function ChatbotUI() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi I'm Reddit Agent! I can help you:\n\n1. Search any subreddit for the latest posts\n2. Create summaries of the most interesting discussions\n3. Find threads with high engagement\n4. Draft relevant comments for those threads\n\nJust type a subreddit name (e.g., 'programming' or 'technology') to get started!", 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Call your FastAPI backend
      const response = await fetch('http://localhost:8000/search_reddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Optional: Show step-by-step logs
      const stepMessages = {
        id: Date.now(),
        text: data.steps,
        sender: 'bot'
      };
    
      // Final Output
      const finalBotMessage = {
        id: Date.now() + 1000,
        text: data.final_output || "No final output was generated.",
        sender: 'bot'
      };

      setMessages(prev => [...prev, stepMessages, finalBotMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Fallback message if API call fails
      const errorMessage = {
        id: Date.now(),
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto shadow-lg border p-5 border-2 rounded-xl">
      {/* Header */}
      <div className=" text-black p-4 border-b border-gray-300">
        <h1 className="text-3xl font-semibold text-center text-[#111111]">REDDIT AGENT</h1>

      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] lg:max-w-[85%] px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#FF8C00] text-white  rounded-br-none' 
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
              }`}
            >
              <SimpleMarkdown>
                {message.text}
              </SimpleMarkdown>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md rounded-lg rounded-bl-none border border-gray-200 px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#EDEAE0] border-t border-gray-200 p-4 rounded-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type subreddit you want to search.. (eg. AI_agents)"
            className="flex-1 border border-gray-300 text-[#111111] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-[#FF8C00] hover:bg-[#BF5700] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}