import React, { useState } from 'react';
import { Mail, Send, Search, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
}

const MessageCenter = () => {
  const [messages] = useState<Message[]>([
    {
      id: '1',
      from: 'HopeCare Team',
      subject: 'Thank you for your recent donation',
      content: 'Dear donor, thank you for your generous contribution...',
      date: '2024-03-15',
      read: false
    },
    {
      id: '2',
      from: 'Project Coordinator',
      subject: 'Project Update: Education Initiative',
      content: 'We wanted to share the latest progress...',
      date: '2024-03-10',
      read: true
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
        {/* Message List */}
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 ${
                  !message.read ? 'bg-rose-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{message.from}</span>
                  <span className="text-sm text-gray-500">{message.date}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{message.subject}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="col-span-2 flex flex-col h-[600px]">
          {selectedMessage ? (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedMessage.subject}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>From: {selectedMessage.from}</span>
                  <span>{selectedMessage.date}</span>
                </div>
              </div>
              <div className="prose prose-rose max-w-none">
                {selectedMessage.content}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}

          {/* Reply Box */}
          <div className="border-t p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                  rows={3}
                />
              </div>
              <div className="flex flex-col justify-end space-y-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700 transition"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;