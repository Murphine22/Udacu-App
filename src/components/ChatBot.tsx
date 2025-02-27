import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, User, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ChatBotProps {
    onClose: () => void;
}

interface Message {
    text: string;
    isUser: boolean;
    id: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        { 
            text: "Hello! How can I help you today? You can ask me about members, dues, contributions, donations, expenses, or any other information about our department.", 
            isUser: false,
            id: 'welcome'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            text: input,
            isUser: true,
            id: `user-${Date.now()}`
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Process the user's message and generate a response
        const userMessageText = input.toLowerCase();
        let response = '';

        // Check for different types of queries
        if (userMessageText.includes('monthly dues') || userMessageText.includes('dues amount')) {
            response = "The monthly dues amount is ₦500 per month. You can make payments through our bank accounts.";
        }
        else if (userMessageText.includes('bank') || userMessageText.includes('account') || userMessageText.includes('payment')) {
            response = "You can make payments to our bank accounts:\n\nStandard Chartered Bank\nAccount Name: Arome And Rosemary\nAccount Number: 0004926342";
        }
        else if (userMessageText.includes('member') || userMessageText.includes('search')) {
            response = "You can search for members and view their dues payment history using the search bar at the top of the page.";
        }
        else if (userMessageText.includes('contact') || userMessageText.includes('support') || userMessageText.includes('help')) {
            response = "Would you like to visit our support page to get in touch with our leadership team?";
            
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    text: "Click here to go to the support page", 
                    isUser: false,
                    id: `bot-support-${Date.now()}`
                }]);
            }, 1500);
        }
        else {
            response = "I'm not sure about that. Would you like to speak with our support team? They can help you with more specific information.";
        }

        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { 
                text: response, 
                isUser: false,
                id: `bot-${Date.now()}`
            }]);
        }, 1000);
    };

    const handleMessageClick = (message: string) => {
        if (message === "Click here to go to the support page") {
            navigate('/support');
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700"
        >
            <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white flex justify-between items-center">
                <div className="flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">Chat Support</h3>
                </div>
                <motion.button 
                    onClick={onClose}
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    <X size={20} />
                </motion.button>
            </div>

            <div className="h-96 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!message.isUser && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 flex-shrink-0">
                                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                            
                            <div
                                onClick={() => !message.isUser && handleMessageClick(message.text)}
                                className={`max-w-[80%] p-3 rounded-lg ${
                                    message.isUser
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                                }`}
                            >
                                {message.text}
                            </div>
                            
                            {message.isUser && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-2 flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex mb-4"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 flex-shrink-0">
                                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex space-x-1">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop' }}
                                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.15 }}
                                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.3 }}
                                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <motion.button
                        onClick={handleSend}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        disabled={!input.trim()}
                    >
                        <Send size={20} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatBot;