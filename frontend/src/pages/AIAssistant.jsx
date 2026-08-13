import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';
import { AIBotIllustration } from '../components/Illustrations.jsx';
import { AIAssistantHero } from '../assets/images/assistant/AIAssistantHero.jsx';

const AIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const suggestedPrompts = [
    'Where did I spend the most?',
    'Can I buy a bike this year?',
    'Show food expenses.',
    "Predict next month's spending.",
    'Suggest a budget.',
  ];

  const ask = async (prompt = question) => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    
    try {
      const response = await aiService.chat(prompt);
      const reply = response.reply || response.answer || 'I apologize, but I could not generate a response. Please try again.';
      setAnswer(reply);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      setAnswer(errorMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AIAssistantHero className="w-full h-auto max-h-[200px] object-cover rounded-3xl" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chat Assistant</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Ask spending, budget, savings, and prediction questions.</p>
      </div>

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`card p-5 ${msg.role === 'user' ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-accent-100 dark:bg-accent-900/30'}`}>
                  {msg.role === 'user' ? (
                    <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-accent-600 dark:text-accent-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {msg.role === 'assistant' && <Sparkles className="w-4 h-4 text-accent-600" />}
                    {msg.role === 'assistant' ? 'FinWise AI' : 'You'}
                  </div>
                  <p className="mt-2 text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AIBotIllustration className="w-16 h-16" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium text-accent-700 dark:text-accent-300">
              <Sparkles className="w-4 h-4" />
              FinWise AI
            </div>
            {loading ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            ) : messages.length === 0 && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Ask me anything about your finances! I can help you analyze spending, suggest budgets, track savings goals, and more.
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <input 
            className="input-field flex-1" 
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your finances..."
            disabled={loading}
          />
          <button 
            className="btn-primary flex items-center gap-2" 
            onClick={() => ask()}
            disabled={loading || !question.trim()}
          >
            <Send className="w-4 h-4" />
            Ask
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button 
                key={prompt} 
                onClick={() => { setQuestion(prompt); ask(prompt); }}
                className="btn-secondary"
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
