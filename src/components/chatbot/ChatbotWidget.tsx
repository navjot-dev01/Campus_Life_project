import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Calendar,
  BookOpen,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Flag,
  Maximize2,
  Minimize2,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { chatbotService } from '../../services/chatbotService';
import { ChatMessage, EventItem, Assignment } from '../../types';
import { ReportIncorrectModal } from './ReportIncorrectModal';

interface ChatbotWidgetProps {
  onNavigateTab?: (tab: string) => void;
  isEmbedded?: boolean; // When rendered directly inside StudentSupportPage
  onClose?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  "Is there any event today?",
  "Do I have an assignment due today?",
  "What events are happening this week?",
  "What assignments are pending?",
  "When is my next deadline?",
  "What is my next event?",
  "Which assignments are pending for me?",
  "What is the difference between TCP and UDP?",
  "How should I prepare for my DBMS exam?"
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onNavigateTab, isEmbedded = false, onClose }) => {
  const { currentUser } = useAuth();
  const { showToast } = useApp();

  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Search & Filter state inside the chatbot
  const [activeFilterTab, setActiveFilterTab] = useState<'chat' | 'events' | 'assignments'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'due_today' | 'submitted'>('all');

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItemDetails, setReportItemDetails] = useState<{ title: string; category?: any }>({ title: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount or user switch
  useEffect(() => {
    if (!currentUser) return;
    const stored = api.getChatMessages(currentUser.id);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      // Welcome message
      const welcomeMsg: ChatMessage = {
        id: 'msg_welcome_' + Date.now(),
        sender: 'bot',
        text: `Hello ${currentUser.name.split(' ')[0]}! I am your CampusLife Student Support Assistant.\n\nI can provide verified answers from official college databases for your events, assignments, deadlines, exams, and attendance, as well as educational guidance.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badgeType: 'verified',
        suggestedFollowUps: [
          "Is there any event today?",
          "Do I have an assignment due today?",
          "What events are happening this week?",
          "What assignments are pending?"
        ]
      };
      setMessages([welcomeMsg]);
      api.saveChatMessage(currentUser.id, welcomeMsg);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, activeFilterTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || !currentUser || isTyping) return;

    setInputValue('');
    setActiveFilterTab('chat');

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    api.saveChatMessage(currentUser.id, userMsg);

    setIsTyping(true);

    try {
      // Find the last bot message to pass for conversational follow-up context
      const lastBotMsg = [...messages].reverse().find(m => m.sender === 'bot');

      // Small natural delay for realism
      await new Promise(r => setTimeout(r, 450));

      const result = await chatbotService.processUserQuery(query, currentUser, lastBotMsg);

      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        sender: 'bot',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badgeType: result.badgeType,
        intent: result.intent,
        verifiedData: result.verifiedData,
        followUpContext: result.followUpContext,
        suggestedFollowUps: result.suggestedFollowUps,
        canReport: true
      };

      setMessages(prev => [...prev, botMsg]);
      api.saveChatMessage(currentUser.id, botMsg);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'bot',
        text: "I encountered a problem retrieving this information. Please try again or check the official tabs in the navigation menu.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        badgeType: 'verified'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (!currentUser) return;
    api.clearChatMessages(currentUser.id);
    const freshMsg: ChatMessage = {
      id: 'msg_welcome_' + Date.now(),
      sender: 'bot',
      text: `Chat cleared. How can I help you today, ${currentUser.name.split(' ')[0]}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badgeType: 'verified',
      suggestedFollowUps: [
        "Is there any event today?",
        "Do I have an assignment due today?",
        "What events are happening this week?",
        "When is my next deadline?"
      ]
    };
    setMessages([freshMsg]);
    api.saveChatMessage(currentUser.id, freshMsg);
    showToast({
      type: 'info',
      title: 'Chat Reset',
      message: 'Chat history cleared'
    });
  };

  const openReportModal = (title?: string, category?: any) => {
    setReportItemDetails({
      title: title || 'CampusLife Data Record',
      category: category || 'other'
    });
    setReportModalOpen(true);
  };

  // Filtered lists for the Instant Data Search tab
  const allEvents = api.getEvents();
  const allAssignments = api.getAssignments();

  const filteredEvents = allEvents.filter(e => {
    const matchesQuery =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = eventCategoryFilter === 'all' || e.category.toLowerCase() === eventCategoryFilter.toLowerCase();
    return matchesQuery && matchesCat;
  });

  const filteredAssignments = allAssignments.filter(a => {
    const matchesQuery =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (assignmentFilter === 'pending') return !a.isSubmitted && a.submissionStatus !== 'submitted';
    if (assignmentFilter === 'submitted') return a.isSubmitted || a.submissionStatus === 'submitted';
    if (assignmentFilter === 'due_today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return a.dueDate.startsWith(todayStr);
    }
    return true;
  });

  // If used purely in embedded mode (like StudentSupportPage)
  if (isEmbedded) {
    const handleCloseWidget = () => {
      setIsExpanded(false);
      if (onClose) {
        onClose();
      } else if (onNavigateTab) {
        onNavigateTab('dashboard');
      }
    };

    const content = (
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col ${
        isExpanded ? 'w-full h-full max-w-5xl shadow-2xl' : 'h-[calc(100vh-14rem)] min-h-[520px] max-h-[760px]'
      }`}>
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/90 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-semibold text-white">CampusLife Student Support Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Verified Data Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Directly connected to verified college databases</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* View Switcher Tabs */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveFilterTab('chat')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeFilterTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveFilterTab('events')}
                className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeFilterTab === 'events'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveFilterTab('assignments')}
                className={`px-2 sm:px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeFilterTab === 'assignments'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tasks
              </button>
            </div>

            {/* Expand / Minimize View Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Minimize View' : 'Fullscreen View'}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Prominent Always-Visible Close (X) Button */}
            <button
              type="button"
              id="close-support-panel-btn"
              onClick={handleCloseWidget}
              title="Close Student Support (Return to Dashboard)"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-rose-600/30 hover:text-rose-200 transition-colors ml-1"
            >
              <X className="w-5 h-5 text-slate-300 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Body content based on active tab */}
        {activeFilterTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender & Badge Info */}
                  <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400 px-1">
                    <span>{msg.sender === 'user' ? 'You' : 'CampusLife Assistant'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>

                    {msg.badgeType === 'verified' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ Verified College Information</span>
                      </span>
                    )}

                    {msg.badgeType === 'ai_guidance' && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>AI Guidance</span>
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line break-words">{msg.text}</div>

                    {/* Structured Verified College Record Card */}
                    {msg.verifiedData && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {/* Single Event or Assignment card */}
                        {msg.verifiedData.type === 'event' && msg.verifiedData.items && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                            <div className="font-semibold text-slate-900 text-sm flex items-center justify-between">
                              <span>{msg.verifiedData.headline}</span>
                              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Verified Event
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {msg.verifiedData.items.map((it, idx) => (
                                <div key={idx}>
                                  <span className="font-medium text-slate-500">{it.label}:</span>{' '}
                                  <span className="text-slate-900 font-medium">{it.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Events List card */}
                        {msg.verifiedData.type === 'events_list' && msg.verifiedData.items && (
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 text-xs">
                              {msg.verifiedData.headline}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {msg.verifiedData.items.map(evt => (
                                <div
                                  key={evt.id}
                                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-slate-900">{evt.title}</div>
                                    <div className="text-slate-500 text-[11px] flex items-center space-x-2 mt-0.5">
                                      <span className="font-medium text-indigo-600">{evt.weekday}</span>
                                      <span>•</span>
                                      <span>{evt.date}</span>
                                      <span>•</span>
                                      <span>{evt.time}</span>
                                    </div>
                                    <div className="text-slate-600 text-[11px] mt-0.5">
                                      📍 {evt.location} | Organized by {evt.organizer}
                                    </div>
                                  </div>
                                  {onNavigateTab && (
                                    <button
                                      onClick={() => onNavigateTab('events')}
                                      className="self-start sm:self-center px-2.5 py-1 text-[11px] font-medium bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg shrink-0 transition-colors"
                                    >
                                      View / RSVP
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Assignment card */}
                        {msg.verifiedData.type === 'assignment' && msg.verifiedData.items && (
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
                            <div className="font-semibold text-slate-900 text-sm flex items-center justify-between">
                              <span>{msg.verifiedData.headline}</span>
                              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Verified Assignment
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {msg.verifiedData.items.map((it, idx) => (
                                <div key={idx}>
                                  <span className="font-medium text-slate-500">{it.label}:</span>{' '}
                                  <span className="text-slate-900 font-medium">{it.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Assignments List card */}
                        {msg.verifiedData.type === 'assignments_list' && msg.verifiedData.items && (
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 text-xs">
                              {msg.verifiedData.headline}
                            </div>
                            <div className="space-y-2">
                              {msg.verifiedData.items.map(asg => (
                                <div
                                  key={asg.id}
                                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-slate-900">{asg.title}</div>
                                    <div className="text-slate-500 text-[11px]">
                                      {asg.course} • Max Marks: {asg.maxMarks}
                                    </div>
                                    <div className="text-amber-800 text-[11px] font-medium mt-0.5">
                                      ⏰ Due: {asg.dueDate} ({asg.dueTime})
                                    </div>
                                  </div>
                                  {onNavigateTab && (
                                    <button
                                      onClick={() => onNavigateTab('assignments')}
                                      className="self-start sm:self-center px-2.5 py-1 text-[11px] font-medium bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg shrink-0 transition-colors"
                                    >
                                      Open & Submit
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Exams List card */}
                        {msg.verifiedData.type === 'exams_list' && msg.verifiedData.items && (
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 text-xs">
                              {msg.verifiedData.headline}
                            </div>
                            <div className="space-y-2">
                              {msg.verifiedData.items.map(ex => (
                                <div key={ex.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                                  <div className="flex items-center justify-between font-semibold text-slate-900">
                                    <span>{ex.type}: {ex.subject} ({ex.code})</span>
                                    <span className="text-indigo-600">{ex.marks}</span>
                                  </div>
                                  <div className="text-slate-600 text-[11px] mt-1 flex flex-wrap gap-2">
                                    <span>📅 {ex.date}</span>
                                    <span>⏰ {ex.time}</span>
                                    <span>📍 {ex.room}</span>
                                  </div>
                                  {ex.instructions && (
                                    <div className="text-[11px] text-slate-500 mt-1 italic">
                                      Instructions: {ex.instructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attendance Report card */}
                        {msg.verifiedData.type === 'attendance' && msg.verifiedData.items && (
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 text-xs">
                              {msg.verifiedData.headline}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.verifiedData.items.map((sub, idx) => (
                                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                                  <div className="font-medium text-slate-900 truncate">{sub.subject}</div>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-slate-500">{sub.ratio}</span>
                                    <span className={`font-bold ${parseInt(sub.percentage) < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                      {sub.percentage}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Escalation Directory card */}
                        {msg.verifiedData.type === 'escalation' && msg.verifiedData.items && (
                          <div className="space-y-2">
                            <div className="font-semibold text-slate-900 text-xs flex items-center space-x-1.5 text-amber-700">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{msg.verifiedData.headline}</span>
                            </div>
                            <div className="space-y-1.5">
                              {msg.verifiedData.items.map((dir, idx) => (
                                <div key={idx} className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 text-xs">
                                  <div className="font-semibold text-slate-900">{dir.title}</div>
                                  <div className="text-slate-600 text-[11px] mt-0.5">{dir.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action link if defined */}
                        {msg.verifiedData.action && onNavigateTab && (
                          <div className="pt-2 flex items-center justify-end">
                            <button
                              onClick={() => onNavigateTab(msg.verifiedData!.action!.tab)}
                              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              <span>{msg.verifiedData.action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Disclaimer note on AI guidance */}
                    {msg.badgeType === 'ai_guidance' && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-100 text-[11px] text-slate-500 italic">
                        * Note: This response provides general educational and study guidance. It is not an official college administrative record.
                      </div>
                    )}
                  </div>

                  {/* Actions under bot message: Report inaccuracy */}
                  {msg.sender === 'bot' && msg.canReport && (
                    <div className="flex items-center space-x-2 mt-1 px-1 text-[11px]">
                      <button
                        onClick={() => openReportModal(msg.verifiedData?.headline || 'Chatbot Response')}
                        className="text-slate-400 hover:text-amber-600 flex items-center space-x-1 transition-colors"
                        title="Report incorrect information"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report incorrect info</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested follow-up quick chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 px-2.5 py-1 rounded-full border border-slate-200/90 shadow-2xs transition-all active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs px-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px]">Verifying college records...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Bar */}
            <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                Suggested:
              </span>
              {DEFAULT_SUGGESTIONS.slice(0, 5).map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sugg)}
                  className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-200/60"
                >
                  {sugg}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Ask about events, assignments, deadlines, exams, or study questions..."
                  className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 sm:px-4 sm:py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold">Send</span>
                </button>
              </form>
            </div>
          </div>
        ) : activeFilterTab === 'events' ? (
          /* SEARCH & FILTER: EVENTS TAB */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-4 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events by title, venue, or organizer..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={eventCategoryFilter}
                    onChange={e => setEventCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="seminar">Seminar</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setEventCategoryFilter('all');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Event results */}
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No verified events match your filter query.
                </div>
              ) : (
                filteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {evt.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{evt.name}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{evt.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span>📅 {evt.date}</span>
                          <span>⏰ {evt.time}</span>
                          <span>📍 {evt.location}</span>
                          <span>👥 {evt.organizer}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2 shrink-0 ml-3">
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('events')}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                          >
                            View / RSVP
                          </button>
                        )}
                        <button
                          onClick={() => openReportModal(evt.name, 'event')}
                          className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center space-x-1"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* SEARCH & FILTER: ASSIGNMENTS TAB */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-4 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search assignments by title or course..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={assignmentFilter}
                    onChange={e => setAssignmentFilter(e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Assignments</option>
                    <option value="due_today">Due Today</option>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setAssignmentFilter('all');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Assignments results */}
            <div className="space-y-3">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No verified assignments match your filter criteria.
                </div>
              ) : (
                filteredAssignments.map(asg => {
                  const isSubmitted = asg.isSubmitted || asg.submissionStatus === 'submitted';
                  return (
                    <div
                      key={asg.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                isSubmitted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isSubmitted ? 'Submitted' : 'Pending'}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">{asg.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{asg.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                            <span>📚 {asg.subjectName}</span>
                            <span>⏰ Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                            <span>🎯 {asg.maxMarks} Marks</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2 shrink-0 ml-3">
                          {onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('assignments')}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs"
                            >
                              {isSubmitted ? 'View Submission' : 'Submit Now'}
                            </button>
                          )}
                          <button
                            onClick={() => openReportModal(asg.title, 'assignment')}
                            className="text-[11px] text-slate-400 hover:text-amber-600 flex items-center space-x-1"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <ReportIncorrectModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          defaultTitle={reportItemDetails.title}
          defaultCategory={reportItemDetails.category}
        />
      </div>
    );

    if (isExpanded) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 p-2 sm:p-6 flex items-center justify-center animate-in fade-in duration-150">
          {content}
        </div>
      );
    }

    return content;
  }

  // FLOATING QUICK LAUNCHER WIDGET
  return (
    <>
      {/* Floating launcher trigger button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-indigo-300"
            aria-label="Open CampusLife Student Support Assistant"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full"></span>
            </div>
            <span className="text-xs font-semibold tracking-wide">CampusLife Assistant</span>
          </button>
        )}
      </div>

      {/* Floating conversational window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[85vh] max-h-[800px]'
              : 'w-[92vw] sm:w-[420px] h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-semibold text-xs text-white">CampusLife Assistant</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-slate-400">Verified College Information</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore window size' : 'Expand window'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 px-1">
                  <span>{msg.sender === 'user' ? 'You' : 'Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.badgeType === 'verified' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                      ✓ Verified
                    </span>
                  )}
                  {msg.badgeType === 'ai_guidance' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-100 text-indigo-800">
                      AI Guidance
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Verified data summary */}
                  {msg.verifiedData && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                      {msg.verifiedData.items && (
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70 space-y-1">
                          {msg.verifiedData.items.slice(0, 4).map((it: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-slate-500">{it.label || it.title}:</span>
                              <span className="font-medium text-slate-800 text-right truncate ml-2">
                                {it.value || it.time || it.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.verifiedData.action && onNavigateTab && (
                        <button
                          onClick={() => {
                            onNavigateTab(msg.verifiedData!.action!.tab);
                            setIsOpen(false);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 pt-1"
                        >
                          <span>{msg.verifiedData.action.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === 'bot' && msg.canReport && (
                  <button
                    onClick={() => openReportModal(msg.verifiedData?.headline)}
                    className="text-[10px] text-slate-400 hover:text-amber-600 mt-1 px-1 flex items-center space-x-1"
                  >
                    <Flag className="w-2.5 h-2.5" />
                    <span>Report inaccuracy</span>
                  </button>
                )}

                {msg.suggestedFollowUps && (
                  <div className="flex flex-wrap gap-1 mt-1.5 max-w-[90%]">
                    {msg.suggestedFollowUps.slice(0, 3).map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[10px] bg-white hover:bg-indigo-50 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="text-[11px] text-slate-400 flex items-center space-x-1 px-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                <span>Checking official records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div className="p-2 border-t border-slate-200 bg-white flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {DEFAULT_SUGGESTIONS.slice(0, 4).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200/70"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-1.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about events, assignments, or study..."
                className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      <ReportIncorrectModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        defaultTitle={reportItemDetails.title}
        defaultCategory={reportItemDetails.category}
      />
    </>
  );
};
