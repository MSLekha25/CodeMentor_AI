import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaEdit, FaUser, FaEye, FaEyeSlash, FaCog } from 'react-icons/fa';
import { HiOutlineViewBoards } from 'react-icons/hi';
import { RxDashboard } from 'react-icons/rx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// Custom SidebarIcon SVG component
function SidebarIcon({ className = "w-7 h-7", theme = "night" }) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="4" y="4" width="40" height="40" rx="12" stroke={theme === 'day' ? '#1A237E' : '#FFFFFF'} strokeWidth="4" fill="none" />
            <line x1="24" y1="6" x2="24" y2="42" stroke={theme === 'day' ? '#1A237E' : '#FFFFFF'} strokeWidth="3" />
            <rect x="10" y="12" width="10" height="3" rx="1.5" fill={theme === 'day' ? '#1A237E' : '#FFFFFF'} />
            <rect x="10" y="20" width="10" height="3" rx="1.5" fill={theme === 'day' ? '#1A237E' : '#FFFFFF'} />
            <rect x="10" y="28" width="10" height="3" rx="1.5" fill={theme === 'day' ? '#1A237E' : '#FFFFFF'} />
        </svg>
    );
}

function Sidebar({ isOpen, chats, onChatSelect, currentChatId, theme }) {
    // Group chats by date: Today, Yesterday, or date
    const grouped = {};
    chats.forEach((chat, idx) => {
        const date = chat.updated_at ? dayjs(chat.updated_at) : null;
        let group = 'Unknown';
        if (date) {
            if (date.isSame(dayjs(), 'day')) group = 'Today';
            else if (date.isSame(dayjs().subtract(1, 'day'), 'day')) group = 'Yesterday';
            else group = date.format('MMMM D, YYYY');
        }
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push({ ...chat, idx });
    });
    return (
        <aside className={`fixed top-16 left-0 h-[calc(100vh-64px)] z-40 transition-all duration-300 shadow-lg ${isOpen ? 'w-72' : 'w-0'} overflow-hidden ${theme === 'day' ? 'bg-[#E3ECF7] border-r border-[#B0BEC5]' : 'bg-[#1B2A4B]'}`}>
            <div className="flex flex-col h-full">
                <div className={`p-4 text-sm font-medium ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}>Previous Chats</div>
                <div className="flex-1 overflow-y-auto">
                    {Object.entries(grouped).map(([group, chats]) => (
                        <div key={group}>
                            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${theme === 'day' ? 'text-[#3B4A6B]' : 'text-slate-300'}`}>{group}</div>
                            {chats.map(chat => (
                                <button
                                    key={chat.id || chat.idx}
                                    onClick={() => onChatSelect(chat.idx)}
                                    className={`w-full text-left px-4 py-3 transition-colors rounded-lg ${theme === 'day' ? 'hover:bg-[#CFD8DC] text-[#1A237E]' : 'hover:bg-[#2C3B5C] text-white'} ${currentChatId === chat.idx ? (theme === 'day' ? 'bg-[#CFD8DC]' : 'bg-[#2C3B5C]') : ''}`}
                                >
                                    <div className={`flex items-center ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}>
                                        <span role="img" aria-label="chat" className="mr-3">💬</span>
                                        <span className="text-sm truncate">{chat.name || `Chat ${chat.idx + 1}`}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

function Navbar({ onToggleSidebar, onNewChat, isSidebarOpen, mobileMenuOpen, setMobileMenuOpen, userSignedUp, setUserSignedUp, onLogin, onSignup, theme, setTheme }) {
    const [signupOpen, setSignupOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const settingsButtonRef = useRef(null);
    const settingsMenuRef = useRef(null);
    const themeMenuRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                settingsMenuRef.current &&
                !settingsMenuRef.current.contains(e.target) &&
                settingsButtonRef.current &&
                !settingsButtonRef.current.contains(e.target) &&
                (!themeMenuRef.current || !themeMenuRef.current.contains(e.target))
            ) {
                setSettingsOpen(false);
                setThemeMenuOpen(false);
            }
            if (
                themeMenuRef.current &&
                !themeMenuRef.current.contains(e.target)
            ) {
                setThemeMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
        <nav className={`fixed top-0 left-0 right-0 z-50 shadow-lg transition-colors duration-300 ${theme === 'day' ? 'bg-white' : 'bg-[#0A192F]'}`}>
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex items-center h-16 justify-between w-full">
                    {/* Hamburger on mobile, icons in drawer */}
                    <div className="flex items-center flex-shrink-0">
                        <button
                            className={`block sm:hidden p-2 ml-1 focus:outline-none ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        {/* Desktop icons */}
                        <div className="hidden sm:flex items-center gap-2 h-16 pl-2 relative">
                            <button
                                onClick={onToggleSidebar}
                                className={`p-2 rounded-lg transition-colors ${theme === 'day' ? 'hover:bg-[#CFD8DC]' : 'hover:bg-[#2C3B5C]'} ${isSidebarOpen ? (theme === 'day' ? 'bg-[#CFD8DC]' : 'bg-[#2C3B5C]') : ''}`}
                                title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                            >
                                <SidebarIcon className="w-7 h-7" theme={theme} />
                            </button>
                            <button
                                onClick={onNewChat}
                                className={`p-2 rounded-lg hover:${theme === 'day' ? 'bg-[#E3ECF7]' : 'bg-[#2C3B5C]'}`}
                                title="New chat"
                            >
                                <FaEdit className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} w-7 h-7`} />
                            </button>
                            {/* Settings Icon with Dropdown */}
                            <div className="relative">
                                <button
                                    ref={settingsButtonRef}
                                    className={`p-2 rounded-lg hover:${theme === 'day' ? 'bg-[#E3ECF7]' : 'bg-[#2C3B5C]'}`}
                                    title="Settings"
                                    type="button"
                                    aria-label="Settings"
                                    onClick={() => { setSettingsOpen(v => !v); setThemeMenuOpen(false); }}
                                >
                                    <FaCog className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} w-7 h-7`} />
                                </button>
                                {settingsOpen && (
                                    <div
                                        ref={settingsMenuRef}
                                        className={`absolute right-0 mt-2 w-44 rounded-xl shadow-xl z-50 flex flex-col border animate-fade-in ${theme === 'day' ? 'bg-white border-[#B0BEC5]' : 'bg-[#192B45] border-[#233554]'}`}
                                        style={{ top: '110%', minWidth: '176px', boxShadow: theme === 'day' ? '0 8px 32px 0 #B0BEC5' : '0 8px 32px 0 rgba(16,30,54,0.25)' }}
                                    >
                                        {!themeMenuOpen && (
                                            <button
                                                className={`px-4 py-3 text-left rounded-t-xl transition-colors ${theme === 'day' ? 'text-[#1A237E] hover:bg-[#E3ECF7]' : 'text-white hover:bg-[#233554]'}`}
                                                type="button"
                                                onClick={() => setThemeMenuOpen(true)}
                                            >
                                                Theme
                                            </button>
                                        )}
                                        {/* Theme Submenu */}
                                        {themeMenuOpen && (
                                            <div ref={themeMenuRef} className={`w-48 border rounded-xl shadow-xl py-2 flex flex-col animate-fade-in ${theme === 'day' ? 'bg-[#F6F8FA] border-[#B0BEC5]' : 'bg-[#1A2E4C] border-[#233554]'}`}
                                                style={{boxShadow: theme === 'day' ? '0 4px 24px 0 #B0BEC5' : '0 8px 32px 0 rgba(16,30,54,0.25)', marginTop: '-8px'}}
                                            >
                                                <button
                                                    className={`flex items-center gap-3 px-5 py-3 text-base rounded-xl font-semibold transition-all duration-200 mb-1 ${theme === 'day' ? (theme === 'day' ? 'bg-[#E5F0FF] text-[#1A237E] shadow border border-[#B0BEC5]' : 'text-[#1A237E]') : (theme === 'night' ? 'bg-[#233554] text-[#60A5FA] shadow border border-[#233554]' : 'text-white')}`}
                                                    style={{boxShadow: theme === 'day' && theme === 'day' ? '0 2px 8px 0 #B0BEC5' : undefined, outline: theme === 'day' && theme === 'day' ? '2px solid #B0BEC5' : undefined}}
                                                    onClick={() => { setTheme('day'); setThemeMenuOpen(false); setSettingsOpen(false); }}
                                                >
                                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FFD700" stroke="#FFD700" strokeWidth="1.5"/><g stroke="#FFD700" strokeWidth="1.5"><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g></svg>
                                                    Day
                                                </button>
                                                <button
                                                    className={`flex items-center gap-3 px-5 py-3 text-base rounded-xl font-semibold transition-all duration-200 ${theme === 'night' ? 'bg-[#233554] text-[#60A5FA] shadow border border-[#233554]' : 'text-white hover:bg-[#233554] hover:text-[#60A5FA]'}`}
                                                    style={{marginTop: '2px'}}
                                                    onClick={() => { setTheme('night'); setThemeMenuOpen(false); setSettingsOpen(false); }}
                                                >
                                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                                                    Night
                                                </button>
                                            </div>
                                        )}
                                        {userSignedUp && !themeMenuOpen && (
                                            <button
                                                className={`px-4 py-3 text-left rounded-b-xl transition-colors ${theme === 'day' ? 'text-[#1A237E] hover:bg-[#E3ECF7]' : 'text-white hover:bg-[#233554]'}`}
                                                type="button"
                                            >
                                                Signout
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Centered app title, responsive font and spacing */}
                    <div className="flex-1 flex justify-center items-center min-w-0">
                        <span className={`text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold ml-1 sm:ml-2 truncate text-center ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}>CodeMentor AI</span>
                    </div>
                    {/* Signup button and user icon on the right, visible on all screens */}
                    <div className="flex items-center gap-2 sm:gap-4 pr-2 sm:pr-0">
                        {!userSignedUp && (
                            <button
                                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-2xl font-bold shadow-md transition-colors text-sm sm:text-base md:text-lg ${theme === 'day' ? 'text-[#1A237E] bg-white hover:bg-[#E3ECF7]' : 'text-white bg-transparent hover:bg-[#233554]'}`}
                                style={{ minWidth: 80, border: 'none' }}
                                onClick={() => setSignupOpen(true)}
                            >
                                <FaUser className={`w-5 h-5 ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`} />
                                Signup
                            </button>
                        )}
                    </div>
                </div>
                {/* Mobile drawer menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                        <div className={`h-full shadow-xl flex flex-col p-4 relative ${theme === 'day' ? 'bg-white' : 'bg-[#112240]'} w-64 max-w-full`} onClick={e => e.stopPropagation()}>
                            {/* Close (X) button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className={`absolute top-3 right-3 text-2xl font-bold hover:opacity-70 ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                            <div className="flex flex-col gap-4 mt-12">
                                <button
                                    onClick={() => { onToggleSidebar(); setMobileMenuOpen(false); }}
                                    className={`flex items-center gap-2 p-3 rounded-lg w-full ${theme === 'day' ? 'text-[#1A237E] hover:bg-[#E3ECF7]' : 'text-white hover:bg-[#2C3B5C]'}`}
                                >
                                    <SidebarIcon className="w-7 h-7" theme={theme} />
                                    <span>Sidebar</span>
                                </button>
                                <button
                                    onClick={() => { onNewChat(); setMobileMenuOpen(false); }}
                                    className={`flex items-center gap-2 p-3 rounded-lg w-full ${theme === 'day' ? 'text-[#1A237E] hover:bg-[#E3ECF7]' : 'text-white hover:bg-[#2C3B5C]'}`}
                                >
                                    <FaEdit className="w-7 h-7" />
                                    <span>New Chat</span>
                                </button>
                                {/* Settings Icon - No functionality */}
                                <button
                                    className={`flex items-center gap-2 p-3 rounded-lg w-full ${theme === 'day' ? 'text-[#1A237E] hover:bg-[#E3ECF7]' : 'text-white hover:bg-[#2C3B5C]'}`}
                                >
                                    <FaCog className="w-7 h-7" />
                                    <span>Settings</span>
                                </button>
                                {!userSignedUp && (
                                    <button
                                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold transition-colors text-sm mt-2 w-full justify-center ${theme === 'day' ? 'text-[#1A237E] bg-white hover:bg-[#E3ECF7]' : 'text-white bg-transparent hover:bg-[#233554]'}`}
                                        style={{ minWidth: 80, border: 'none' }}
                                        onClick={() => setSignupOpen(true)}
                                    >
                                        <FaUser className={`w-5 h-5 ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`} />
                                        Signup
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
        <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} onSubmit={onSignup} onLogin={onLogin} theme={theme} />
        </>
    );
}

function Toast({ type, message, onClose }) {
    const colors = {
        error: 'red-400',
    };
    const icons = {
        error: '❌',
    };
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-white flex items-center gap-3 text-lg animate-fade-in bg-${colors[type]}`}
        >
            <span className="text-2xl">{icons[type]}</span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white text-xl font-bold hover:opacity-70">×</button>
        </div>
    );
}

function CodeReviewForm() {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [chat, setChat] = useState([]);
    const [hasPrompted, setHasPrompted] = useState(false);
    const [copiedButton, setCopiedButton] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [allChats, setAllChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userSignedUp, setUserSignedUp] = useState(false);
    const [sessionId, setSessionId] = useState(() => {
        // Try to load from localStorage for chat continuity
        return localStorage.getItem('cm_session_id') || '';
    });
    const [userEmail, setUserEmail] = useState('');
    const [theme, setTheme] = useState('night'); // 'night' (default) or 'day'
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (theme === 'day') {
            document.body.classList.add('cm-day');
            document.body.classList.remove('cm-night');
        } else {
            document.body.classList.add('cm-night');
            document.body.classList.remove('cm-day');
        }
    }, [theme]);

    const showToast = (type, message, duration = 2500) => {
        if (type === 'error') {
            setToast({ type, message });
            setTimeout(() => setToast(null), duration);
        }
    };

    const handleCopy = async (text, buttonId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedButton(buttonId);
            setTimeout(() => {
                setCopiedButton(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim() || loading) return;
        setError(null);
        setLoading(true);
        const newChat = [...chat, { role: 'user', content: code }];
        setChat(newChat);
        setHasPrompted(true);
        setCode('');
        try {
            // Send session_id for chat continuity, and user email if signed in
            const body = { messages: newChat, session_id: sessionId };
            if (userEmail) body.email = userEmail;
            const response = await fetch('http://127.0.0.1:8000/api/code-review/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (response.ok) {
                const updatedChat = [
                    ...newChat,
                    { role: 'assistant', content: Object.values(data.feedback).join('\n\n') }
                ];
                setChat(updatedChat);
                setAllChats(prev => {
                    // Always update the full conversation (user + assistant messages)
                    if (currentChatId !== null && prev[currentChatId]) {
                        const updated = [...prev];
                        updated[currentChatId] = {
                            ...updated[currentChatId],
                            messages: updatedChat, // Save the entire conversation
                            updated_at: new Date().toISOString(),
                        };
                        return updated;
                    } else {
                        // If starting a new chat, add the full conversation
                        const newAll = [...prev, { messages: updatedChat, name: null, updated_at: new Date().toISOString() }];
                        setCurrentChatId(newAll.length - 1);
                        return newAll;
                    }
                });
                // Persist the updated chat to the backend immediately after assistant response
                if (userEmail) {
                    await fetch('http://127.0.0.1:8000/api/code-review/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: updatedChat, session_id: data.session_id || sessionId, email: userEmail })
                    });
                    await fetchUserChats(userEmail);
                }
                if (data.session_id && data.session_id !== sessionId) {
                    setSessionId(data.session_id);
                    localStorage.setItem('cm_session_id', data.session_id);
                }
                // Refresh chats after new message if signed in
                if (userEmail) await fetchUserChats(userEmail);
            } else {
                setError(data);
                showToast('error', 'Error: Couldn’t fetch response.');
            }
        } catch (err) {
            setError('Network error');
            showToast('error', 'Error: Couldn’t fetch response.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user chats after sign-in
    const fetchUserChats = async (email) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/fetch-user-chats/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok && data.chats) {
                setAllChats(data.chats);
            } else {
                setAllChats([]);
            }
        } catch (err) {
            setAllChats([]);
        }
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat, hasPrompted]);

    // New chat handler
    const handleNewChat = () => {
        // Only save chat if it has at least one user and one assistant message
        if (chat.length > 1 && chat.some(m => m.role === 'user') && chat.some(m => m.role === 'assistant')) {
            // Save the whole conversation as a new chat
            setAllChats(prev => [...prev, { messages: chat, name: null, updated_at: new Date().toISOString() }]);
        }
        setChat([]);
        setHasPrompted(false);
        setCurrentChatId(null);
        setSessionId('');
        localStorage.removeItem('cm_session_id');
    };

    // Chat selection handler
    const handleChatSelect = (chatId) => {
        const selected = allChats[chatId];
        if (selected && selected.messages && selected.messages.length > 0) {
            setChat(selected.messages);
            setCurrentChatId(chatId);
            setHasPrompted(true);
        }
    };

    // Login handler
    const handleLogin = async ({ email, password }) => {
        setUserSignedUp(true);
        setUserEmail(email);
        await fetchUserChats(email);
    };

    // Signup handler
    const handleSignup = async (data) => {
        await fetch('http://127.0.0.1:8000/api/signup/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        setUserSignedUp(true);
        setUserEmail(data.email);
        await fetchUserChats(data.email);
    };

    // Filter out empty chats from display
    const filteredChats = allChats.filter(
        c => c && c.messages && c.messages.length > 1 && c.messages.some(m => m.role === 'user') && c.messages.some(m => m.role === 'assistant')
    );

    // Responsive layout
    return (
        <div className={`min-h-screen w-full h-screen flex flex-col ${theme === 'day' ? 'bg-[#F6F8FA] text-[#1A237E]' : 'bg-[#0A192F] text-white'}`}>
            <Navbar
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onNewChat={handleNewChat}
                isSidebarOpen={sidebarOpen}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                userSignedUp={userSignedUp}
                setUserSignedUp={setUserSignedUp}
                onLogin={handleLogin}
                onSignup={handleSignup}
                theme={theme}
                setTheme={setTheme}
            />
            <div className="flex-1 flex flex-row w-full overflow-hidden pt-16">
                <Sidebar isOpen={sidebarOpen} chats={filteredChats} onChatSelect={handleChatSelect} currentChatId={currentChatId} theme={theme} />
                <main
                    className={`flex-1 flex flex-col items-center w-full relative transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'} ${theme === 'day' ? 'bg-[#F6F8FA]' : 'bg-[#0A192F]'}`}
                >
                    <div className={`w-full flex flex-col items-center justify-start min-h-[calc(100vh-64px)] p-2 sm:p-4 ${theme === 'day' ? 'bg-[#F6F8FA]' : ''}`}>
                        {!hasPrompted ? (
                            <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto">
                                {/* Tagline */}
                                <div className="mb-8 w-full flex flex-col items-center">
                                    <div className={`flex items-center gap-2 mb-2 ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}> 
                                        <span className="text-2xl md:text-3xl font-bold drop-shadow-lg tracking-tight">Stuck on something?  Let’s crack it together.</span>
                                    </div>
                                </div>
                                {/* Input area before first prompt */}
                                <form
                                    onSubmit={handleSubmit}
                                    className={`w-full max-w-xl mx-auto rounded-3xl border p-0 flex flex-row items-center backdrop-blur-md shadow-2xl ${theme === 'day' ? 'bg-white border-[#B0BEC5]' : 'bg-gradient-to-br from-[#1A2E4C] via-[#112240] to-[#233554] border-[#60A5FA]'}`}
                                    style={{ boxShadow: theme === 'day' ? '0 0 0 1.5px #B0BEC5, 0 2px 16px 0 #B0BEC5' : '0 0 0 1.5px #60A5FA, 0 2px 16px 0 #112240', pointerEvents: 'auto', minHeight: 72 }}
                                >
                                    <div className="flex-1 flex items-center relative">
                                        <textarea
                                            className={`w-full bg-transparent outline-none text-xl px-6 py-5 rounded-3xl transition-colors pr-16 border-none focus:border-none focus:ring-0 font-mono break-all whitespace-pre font-mono overflow-wrap break-words word-break resize-none overflow-y-auto text-left ${theme === 'day' ? 'text-[#1A237E] placeholder:text-slate-500' : 'text-white placeholder:text-slate-300'}`}
                                            placeholder="Ask me anything about your code..."
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                            disabled={loading}
                                            rows={1}
                                            style={{ minHeight: 56, maxHeight: 168, height: '56px', boxShadow: 'none', wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre', scrollbarWidth: 'none', msOverflowStyle: 'none', fontFamily: 'Fira Mono, Menlo, monospace', textAlign: 'left' }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit(e);
                                                }
                                            }}
                                            ref={el => {
                                                if (el) {
                                                    el.style.height = '56px';
                                                    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
                                                    el.style.overflowY = el.scrollHeight > 168 ? 'auto' : 'hidden';
                                                    el.style.scrollbarWidth = 'none'; // Firefox
                                                    el.style.msOverflowStyle = 'none'; // IE/Edge
                                                    el.style.wordBreak = 'break-all';
                                                    el.style.overflowWrap = 'break-word';
                                                    el.style.whiteSpace = 'pre';
                                                    el.style.fontFamily = 'Fira Mono, Menlo, monospace';
                                                    el.style.textAlign = 'left';
                                                }
                                            }}
                                            onInput={e => {
                                                const el = e.target;
                                                el.style.height = '56px';
                                                el.style.height = Math.min(el.scrollHeight, 168) + 'px';
                                                el.style.overflowY = el.scrollHeight > 168 ? 'auto' : 'hidden';
                                                el.style.scrollbarWidth = 'none';
                                                el.style.msOverflowStyle = 'none';
                                                el.style.wordBreak = 'break-all';
                                                el.style.overflowWrap = 'break-word';
                                                el.style.whiteSpace = 'pre';
                                                el.style.fontFamily = 'Fira Mono, Menlo, monospace';
                                                el.style.textAlign = 'left';
                                            }}
                                        />
                                        {loading ? (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                                                <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="#60A5FA" strokeWidth="4" opacity="0.2" />
                                                    <path d="M22 12a10 10 0 0 1-10 10" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                                                </svg>
                                            </span>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-2xl bg-transparent border-none shadow-none hover:bg-[#233554] transition-colors"
                                                tabIndex={0}
                                                style={{ padding: 0, margin: 0 }}
                                            >
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 16H24" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M18 10L24 16L18 22" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <>
                            <div
                                ref={chatContainerRef}
                                className="w-full flex flex-col gap-6 items-center overflow-y-auto max-h-[calc(100vh-120px)] pb-40 px-2 scrollbar-thin"
                                style={{scrollBehavior: 'smooth', minHeight: '0'}}
                            >
                                <div className="w-full flex flex-col gap-4">
                                    {chat.map((msg, idx) =>
                                        msg.role === 'user' ? (
                                            <div
                                                key={idx}
                                                className={`self-end max-w-2xl w-fit rounded-2xl px-6 py-4 mb-2 shadow-lg text-base font-medium animate-fade-in break-all whitespace-pre-line overflow-wrap break-words word-break ${theme === 'day' ? 'bg-[#E3ECF7] text-[#1A237E]' : 'bg-[#1A2E4C] text-white'}`}
                                                style={{ wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}
                                            >
                                                <span className={`opacity-80 text-xs font-semibold tracking-wide ${theme === 'day' ? 'text-[#3B4A6B]' : 'text-slate-300'}`}>You</span>
                                                <pre className="mt-2 font-mono text-[1.08em] text-left bg-transparent border-none p-0 m-0 leading-relaxed whitespace-pre break-words" style={{fontFamily: 'Fira Mono, Menlo, monospace', background: 'none', border: 'none', textAlign: 'left', whiteSpace: 'pre'}}>{msg.content}</pre>
                                            </div>
                                        ) : (
                                            <div
                                                key={idx}
                                                className={`self-start max-w-4xl w-full border rounded-2xl px-8 py-6 mb-2 shadow-xl animate-fade-in ${theme === 'day' ? 'border-[#B0BEC5] text-[#1A237E] bg-gradient-to-b from-[#F6F8FA] to-[#E3ECF7]' : 'border-[#233554] text-white bg-gradient-to-b from-[#112240] to-[#0A192F]'}`}
                                            >
                                                <span className={`text-xs font-semibold tracking-wide flex items-center gap-2 ${theme === 'day' ? 'text-[#1A237E]' : 'text-[#64FFDA]'}`}> 
                                                    <span className="text-lg">✨</span>
                                                    CodeMentor
                                                </span>
                                                <div className={`prose max-w-none text-base mt-3 ${theme === 'day' ? 'prose-invert text-[#1A237E]' : 'prose-invert text-white'}`}>
                                                    <ReactMarkdown
                                                        children={msg.content}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                if (inline) {
                                                                    return <code className={`${theme === 'day' ? 'bg-[#F3F6FA] text-[#1A237E]' : 'bg-[#1E1E1E] text-[#9CDCFE]'} rounded px-1.5 py-0.5 font-mono text-[0.95em]`}>{children}</code>;
                                                                }
                                                                const codeString = String(children);
                                                                const buttonId = `copy-${idx}`;
                                                                const isCopied = copiedButton === buttonId;
                                                                return (
                                                                    <pre className={`${theme === 'day' ? 'bg-[#F3F6FA] border-[#B0BEC5] text-[#1A237E]' : 'bg-[#1E1E1E] border-[#2D2D2D] text-[#D4D4D4]'} border rounded-xl p-4 my-3 overflow-x-auto font-mono text-[15px] relative group`}>
                                                                        <button
                                                                            className={`absolute top-2 right-2 text-xs ${isCopied ? (theme === 'day' ? 'bg-[#B0BEC5] text-[#388E3C]' : 'bg-[#2D2D2D] text-[#6A9955]') : (theme === 'day' ? 'bg-[#B0BEC5] text-[#1A237E] hover:bg-[#CFD8DC]' : 'bg-[#2D2D2D] text-[#D4D4D4] hover:bg-[#3E3E3E]')} rounded px-2 py-0.5 border border-[#3E3E3E] cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100`}
                                                                            onClick={() => handleCopy(codeString, buttonId)}
                                                                        >
                                                                            {isCopied ? 'Copied!' : 'Copy'}
                                                                        </button>
                                                                        <code {...props}>{codeString}</code>
                                                                    </pre>
                                                                );
                                                            },
                                                            h1: ({ node, ...props }) => <h1 className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} font-bold text-2xl mt-4 mb-2`} {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} font-bold text-xl mt-3 mb-2`} {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} font-bold text-lg mt-2 mb-1`} {...props} />,
                                                            strong: ({ node, ...props }) => <strong className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} font-bold`} {...props} />,
                                                            em: ({ node, ...props }) => <em className={`${theme === 'day' ? 'text-[#1A237E]' : 'text-white'} font-bold italic`} {...props} />,
                                                            p: ({ node, ...props }) => <p className={`${theme === 'day' ? 'text-[#3B4A6B]' : 'text-[#CCD6F6]'} mb-4 leading-relaxed`} {...props} />,
                                                            li: ({ node, ...props }) => <li className={`${theme === 'day' ? 'text-[#3B4A6B]' : 'text-[#CCD6F6]'} mb-1`} {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                                                            blockquote: ({ node, ...props }) => (
                                                                <blockquote className={`border-l-4 pl-4 my-4 italic ${theme === 'day' ? 'border-[#1A237E] text-[#3B4A6B]' : 'border-[#64FFDA] text-[#CCD6F6]'}`} {...props} />
                                                            ),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            {/* Copilot/ChatGPT style input box, unified for before/after first prompt */}
                            <form
                                onSubmit={handleSubmit}
                                className="fixed bottom-0 left-0 w-full z-50 flex justify-center transition-all duration-300"
                                style={sidebarOpen ? { marginLeft: '18rem', width: 'calc(100% - 18rem)' } : {}}
                            >
                                <div
                                    className={`w-full max-w-xl mx-auto rounded-3xl border shadow-2xl p-3 flex flex-row items-center backdrop-blur-md mb-8 ${theme === 'day' ? 'bg-white border-[#B0BEC5]' : 'bg-gradient-to-br from-[#1A2E4C] via-[#112240] to-[#233554] border-[#60A5FA]'}`}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div className="flex-1 flex items-center relative">
                                        <textarea
                                            className={`w-full outline-none text-lg px-3 py-4 rounded-2xl transition-colors shadow-lg backdrop-blur-md pr-12 border-none focus:border-none focus:ring-0 resize-none overflow-y-auto break-all whitespace-pre-line overflow-wrap break-words word-break ${theme === 'day' ? 'bg-[#F6F8FA] text-[#1A237E] placeholder:text-slate-500' : 'bg-[#192B45]/80 text-white placeholder:text-slate-300'}`}
                                            placeholder="Ask me anything about your code..."
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                            rows={1}
                                            disabled={loading}
                                            style={{ minHeight: '56px', maxHeight: '168px', scrollbarWidth: 'none', msOverflowStyle: 'none', wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre-line' }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit(e);
                                                }
                                            }}
                                            ref={el => {
                                                if (el) {
                                                    el.style.height = '56px';
                                                    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
                                                    el.style.overflowY = el.scrollHeight > 168 ? 'auto' : 'hidden';
                                                    el.style.scrollbarWidth = 'none'; // Firefox
                                                    el.style.msOverflowStyle = 'none'; // IE/Edge
                                                    el.style.wordBreak = 'break-all';
                                                    el.style.overflowWrap = 'break-word';
                                                    el.style.whiteSpace = 'pre-line';
                                                }
                                            }}
                                            onInput={e => {
                                                const el = e.target;
                                                el.style.height = '56px';
                                                el.style.height = Math.min(el.scrollHeight, 168) + 'px';
                                                el.style.overflowY = el.scrollHeight > 168 ? 'auto' : 'hidden';
                                                el.style.scrollbarWidth = 'none';
                                                el.style.msOverflowStyle = 'none';
                                                el.style.wordBreak = 'break-all';
                                                el.style.overflowWrap = 'break-word';
                                                el.style.whiteSpace = 'pre-line';
                                            }}
                                        />
                                        {loading ? (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                                                <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="#60A5FA" strokeWidth="4" opacity="0.2" />
                                                    <path d="M22 12a10 10 0 0 1-10 10" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                                                </svg>
                                            </span>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none"
                                                tabIndex={0}
                                            >
                                                <span className="ml-1 text-3xl text-[#60A5FA]">➤</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                            </>
                        )}
                        {error && (
                            <div
                                className={`border-l-4 p-4 rounded-xl shadow animate-fade-in ${theme === 'day' ? 'text-red-700 bg-red-50 border-[#EF9A9A]' : 'text-red-700 bg-red-50 border-red-400'}`}
                            >
                                <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {toast && toast.type === 'error' && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

function SignupModal({ isOpen, onClose, onSubmit, onLogin, theme }) {
    const [isLogin, setIsLogin] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await onLogin({ email, password });
            } else {
                await onSubmit({ name, email, password });
            }
            setName('');
            setEmail('');
            setPassword('');
            onClose();
        } catch (err) {
            setError(isLogin ? 'Login failed.' : 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-md relative transition-colors duration-300 ${theme === 'day' ? 'bg-white' : 'bg-[#112240]'}`}>
                <button onClick={onClose} className={`absolute top-3 right-4 text-2xl font-bold hover:opacity-70 ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}>×</button>
                <h2 className={`text-2xl font-bold mb-6 text-center ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Name"
                            className={`rounded-lg px-4 py-3 focus:outline-none ${theme === 'day' ? 'bg-[#E3ECF7] text-[#1A237E] placeholder:text-slate-500' : 'bg-[#1B2A4B] text-white placeholder:text-slate-400'}`}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className={`rounded-lg px-4 py-3 focus:outline-none ${theme === 'day' ? 'bg-[#E3ECF7] text-[#1A237E] placeholder:text-slate-500' : 'bg-[#1B2A4B] text-white placeholder:text-slate-400'}`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <div className="relative flex items-center">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className={`rounded-lg px-4 py-3 focus:outline-none w-full pr-12 ${theme === 'day' ? 'bg-[#E3ECF7] text-[#1A237E] placeholder:text-slate-500' : 'bg-[#1B2A4B] text-white placeholder:text-slate-400'}`}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl focus:outline-none ${theme === 'day' ? 'text-[#1A237E]' : 'text-white'}`}
                            tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {error && <div className="text-red-400 text-sm text-center">{error}</div>}
                    <button
                        type="submit"
                        className={`mt-2 rounded-xl font-bold py-3 text-lg transition-colors ${theme === 'day' ? 'bg-[#60A5FA] text-[#1A237E] hover:bg-[#3B82F6]' : 'bg-[#60A5FA] text-[#0A192F] hover:bg-[#3B82F6]'}`}
                        disabled={loading}
                    >
                        {loading ? (isLogin ? 'Signing in...' : 'Signing up...') : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                    <div className={`text-center text-sm mt-2 ${theme === 'day' ? 'text-[#3B4A6B]' : 'text-slate-300'}`}>
                        {isLogin ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <button type="button" className={`text-[#60A5FA] hover:underline font-bold`} onClick={() => { setIsLogin(false); }}>
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button type="button" className={`text-[#60A5FA] hover:underline font-bold`} onClick={() => { setIsLogin(true); }}>
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CodeReviewForm;