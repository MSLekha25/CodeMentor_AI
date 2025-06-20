import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaRegSquare, FaEdit, FaCog } from 'react-icons/fa';
import { HiOutlineViewBoards } from 'react-icons/hi';
import { RxDashboard } from 'react-icons/rx';
import { FiEdit, FiTrendingUp } from 'react-icons/fi';

// Custom SidebarIcon SVG component
function SidebarIcon({ className = "w-7 h-7" }) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="4" y="4" width="40" height="40" rx="12" stroke="#FFFFFF" strokeWidth="4" fill="none" />
            <line x1="24" y1="6" x2="24" y2="42" stroke="#FFFFFF" strokeWidth="3" />
            <rect x="10" y="12" width="10" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="10" y="20" width="10" height="3" rx="1.5" fill="#FFFFFF" />
            <rect x="10" y="28" width="10" height="3" rx="1.5" fill="#FFFFFF" />
        </svg>
    );
}

// Custom ActionsMenuIcon SVG component
function ActionsMenuIcon({ className = "w-7 h-7" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            <rect x="15" y="3" width="6" height="6" rx="1.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            <rect x="3" y="15" width="6" height="6" rx="1.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            <rect x="15" y="15" width="6" height="6" rx="1.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        </svg>
    );
}

function ActionMenu({ isOpen, onClose, onAction }) {
    if (!isOpen) return null;
    return (
        <div className="absolute left-0 mt-2 w-48 bg-[#1B2A4B] rounded-lg shadow-lg border border-[#233554] z-50">
            <button
                onClick={() => { onAction('exam'); onClose(); }}
                className="flex items-center w-full px-4 py-3 text-white hover:bg-[#2C3B5C] transition-colors gap-2"
            >
                <FiEdit className="text-[#64FFDA] text-lg" /> Take Exam
            </button>
            <button
                onClick={() => { onAction('progress'); onClose(); }}
                className="flex items-center w-full px-4 py-3 text-white hover:bg-[#2C3B5C] transition-colors gap-2"
            >
                <FiTrendingUp className="text-[#FFD700] text-lg" /> Progress
            </button>
        </div>
    );
}

function Sidebar({ isOpen, chats, onChatSelect, currentChatId }) {
    return (
        <aside className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#1B2A4B] z-40 transition-all duration-300 shadow-lg ${isOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
            <div className="flex flex-col h-full">
                <div className="p-4 text-white text-sm font-medium">Previous Chats</div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat, idx) => {
                        let chatTitle = '';
                        if (chat[0]?.content) {
                            const content = chat[0].content;
                            const cleanContent = content.replace(/```[\s\S]*?```/g, '').replace(/[^a-zA-Z0-9\s]/g, ' ');
                            chatTitle = cleanContent.split(/[.!?]|\n/)[0].trim().slice(0, 40) + '...';
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => onChatSelect(idx)}
                                className={`w-full text-left px-4 py-3 hover:bg-[#2C3B5C] transition-colors ${currentChatId === idx ? 'bg-[#2C3B5C]' : ''}`}
                            >
                                <div className="flex items-center text-white">
                                    <span role="img" aria-label="chat" className="mr-3">💬</span>
                                    <span className="text-sm truncate">{chatTitle || 'Chat ' + (idx + 1)}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

function Navbar({ onToggleSidebar, onNewChat, onOpenActions, isSidebarOpen, isActionsOpen, mobileMenuOpen, setMobileMenuOpen, handleActionMenu }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A192F] shadow-lg">
            <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4">
                <div className="flex items-center h-16 justify-between md:justify-between">
                    {/* Hamburger on mobile, icons in drawer */}
                    <div className="flex items-center flex-shrink-0">
                        <button
                            className="block sm:hidden p-2 ml-1 text-white focus:outline-none"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        {/* Desktop icons */}
                        <div className="hidden sm:flex items-center gap-2 h-16 pl-2 relative">
                            <button
                                onClick={onToggleSidebar}
                                className={`p-2 rounded-lg hover:bg-[#2C3B5C] ${isSidebarOpen ? 'bg-[#2C3B5C]' : ''}`}
                                title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                            >
                                <SidebarIcon className="w-7 h-7" />
                            </button>
                            <button
                                onClick={onNewChat}
                                className="p-2 rounded-lg hover:bg-[#2C3B5C]"
                                title="New chat"
                            >
                                <FaEdit className="text-white w-7 h-7" />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={onOpenActions}
                                    className={`p-2 rounded-lg hover:bg-[#2C3B5C] ${isActionsOpen ? 'bg-[#2C3B5C]' : ''}`}
                                    title="Open Actions Menu"
                                >
                                    <ActionsMenuIcon className="w-7 h-7" />
                                </button>
                                {/* Show ActionMenu dropdown below the button */}
                                {isActionsOpen && (
                                    <div className="absolute left-0 top-full mt-2 z-50">
                                        <ActionMenu isOpen={isActionsOpen} onClose={onOpenActions} onAction={handleActionMenu} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Centered app title */}
                    <div className="flex-1 flex justify-center items-center min-w-0">
                        <span className="text-2xl">✨</span>
                        <span className="text-white text-2xl font-bold ml-1 sm:ml-2 truncate">CodeMentor AI</span>
                    </div>
                    {/* Hide right spacer on mobile, keep for desktop */}
                    <div className="w-4 sm:w-[120px] hidden sm:block"></div>
                </div>
                {/* Mobile drawer menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                        <div className="bg-[#112240] w-56 h-full shadow-xl flex flex-col p-4 relative" onClick={e => e.stopPropagation()}>
                            {/* Close (X) button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-3 right-3 text-white text-2xl font-bold hover:opacity-70 focus:outline-none"
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                            <button
                                onClick={() => { onToggleSidebar(); setMobileMenuOpen(false); }}
                                className="mb-4 flex items-center gap-2 p-2 rounded-lg hover:bg-[#2C3B5C] text-white mt-8"
                            >
                                <SidebarIcon className="w-7 h-7" />
                                <span>Sidebar</span>
                            </button>
                            <button
                                onClick={() => { onNewChat(); setMobileMenuOpen(false); }}
                                className="mb-4 flex items-center gap-2 p-2 rounded-lg hover:bg-[#2C3B5C] text-white"
                            >
                                <FaEdit className="w-7 h-7" />
                                <span>New Chat</span>
                            </button>
                            <button
                                onClick={() => { onOpenActions(); setMobileMenuOpen(false); }}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2C3B5C] text-white"
                            >
                                <ActionsMenuIcon className="w-7 h-7" />
                                <span>Actions</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
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
    const [learningMode, setLearningMode] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [chat, setChat] = useState([]);
    const [hasPrompted, setHasPrompted] = useState(false);
    const [copiedButton, setCopiedButton] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const [allChats, setAllChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const chatContainerRef = useRef(null);

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
        if (!code.trim()) return;
        setError(null);

        setChat(prev => [...prev, { role: 'user', content: code }]);
        setHasPrompted(true);
        const prompt = code;
        setCode(''); // Clear input immediately

        try {
            const response = await fetch('http://127.0.0.1:8000/api/code-review/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: prompt, language: 'python', learning_mode: learningMode })
            });
            const data = await response.json();
            
            if (response.ok) {
                setChat(prev => [
                    ...prev,
                    { role: 'ai', content: Object.values(data.feedback).join('\n\n') }
                ]);
            } else {
                setError(data);
                showToast('error', 'Error: Couldn’t fetch response.');
            }
        } catch (err) {
            setError('Network error');
            showToast('error', 'Error: Couldn’t fetch response.');
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
        if (chat.length > 0) setAllChats(prev => [...prev, chat]);
        setChat([]);
        setHasPrompted(false);
        setCurrentChatId(null);
    };

    // Chat selection handler
    const handleChatSelect = (chatId) => {
        if (chat.length > 0 && currentChatId === null) setAllChats(prev => [...prev, chat]);
        setChat(allChats[chatId]);
        setCurrentChatId(chatId);
        setHasPrompted(true);
    };

    // Action menu handler
    const handleActionMenu = (action) => {
        if (action === 'exam') showToast('error', 'Take Exam clicked!');
        if (action === 'progress') showToast('error', 'Progress clicked!');
    };

    // Responsive layout
    return (
        <div className="min-h-screen w-full h-screen flex flex-col bg-[#0A192F]">
            <Navbar
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onNewChat={handleNewChat}
                onOpenActions={() => setActionsOpen(!actionsOpen)}
                isSidebarOpen={sidebarOpen}
                isActionsOpen={actionsOpen}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                handleActionMenu={handleActionMenu}
            />
            <div className="flex-1 flex flex-row w-full overflow-hidden pt-16">
                <Sidebar isOpen={sidebarOpen} chats={allChats} onChatSelect={handleChatSelect} currentChatId={currentChatId} />
                <main
                    className={`flex-1 flex flex-col items-center w-full bg-[#0A192F] relative transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}
                >
                    <div className="w-full flex flex-col items-center justify-start min-h-[calc(100vh-64px)] p-2 sm:p-4">
                        {!hasPrompted ? (
                            <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto">
                                {/* Tagline */}
                                <div className="mb-8 w-full flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-tight">Stuck on something?  Let’s crack it together.</span>
                                    </div>
                                </div>
                                <form
                                    onSubmit={handleSubmit}
                                    className="w-full max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#1A2E4C] via-[#112240] to-[#233554] border border-[#60A5FA] shadow-2xl p-3 flex flex-row items-center backdrop-blur-md mb-8"
                                >
                                    <div className="flex-1 flex items-center relative">
                                        <input
                                            className="w-full bg-[#192B45]/80 text-white placeholder:text-slate-300 outline-none text-lg px-3 py-2 rounded-2xl transition-colors shadow-lg backdrop-blur-md pr-12 border-none focus:border-none focus:ring-0"
                                            placeholder="Ask me anything about your code..."
                                            value={code}
                                            onChange={e => setCode(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent focus:outline-none"
                                            tabIndex={0}
                                        >
                                            <span className="ml-1 text-3xl text-[#60A5FA]">➤</span>
                                        </button>
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
                                                className="self-end max-w-2xl w-fit rounded-2xl px-6 py-4 mb-2 shadow-lg text-base font-medium animate-fade-in bg-[#1A2E4C] text-white"
                                            >
                                                <span className="opacity-80 text-xs font-semibold tracking-wide text-slate-300">You</span>
                                                <div className="whitespace-pre-line mt-1">{msg.content}</div>
                                            </div>
                                        ) : (
                                            <div
                                                key={idx}
                                                className="self-start max-w-4xl w-full border rounded-2xl px-8 py-6 mb-2 shadow-xl animate-fade-in border-[#233554] text-white bg-gradient-to-b from-[#112240] to-[#0A192F]"
                                            >
                                                <span className="text-xs font-semibold tracking-wide text-[#64FFDA] flex items-center gap-2">
                                                    <span className="text-lg">✨</span>
                                                    CodeMentor
                                                </span>
                                                <div className="prose prose-invert max-w-none text-base mt-3">
                                                    <ReactMarkdown
                                                        children={msg.content}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                if (inline) {
                                                                    return <code className="bg-[#1E1E1E] text-[#9CDCFE] rounded px-1.5 py-0.5 font-mono text-[0.95em]">{children}</code>;
                                                                }
                                                                const codeString = String(children);
                                                                const buttonId = `copy-${idx}`;
                                                                const isCopied = copiedButton === buttonId;
                                                                
                                                                const highlighted = codeString.split('\n').map((line, lineIdx) => {
                                                                    const tokens = line.split(/([a-zA-Z_]\w*|[(){}[\],"'`.]+|[\s]+|\d+)/g).filter(Boolean);
                                                                    return (
                                                                        <span key={lineIdx} className="text-[#D4D4D4]">
                                                                            {tokens.map((token, tokenIdx) => {
                                                                                // Keywords (purple/blue)
                                                                                if (/^(public|private|protected|class|static|void|String)$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#569CD6]">{token}</span>;
                                                                                }
                                                                                // Built-in types (blue)
                                                                                if (/^(System)$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#4EC9B0]">{token}</span>;
                                                                                }
                                                                                // Method calls (yellow)
                                                                                if (/^(println|print|out)$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#DCDCAA]">{token}</span>;
                                                                                }
                                                                                // Strings (bright green)
                                                                                if (/^["'].*["']$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#6A9955]">{token}</span>;
                                                                                }
                                                                                // Class names (starting with uppercase, not keywords)
                                                                                if (/^[A-Z][a-zA-Z0-9_]*$/.test(token) && !/^(String|System)$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#4EC9B0]">{token}</span>;
                                                                                }
                                                                                // Parameters and variables (light blue)
                                                                                if (/^[a-z][a-zA-Z0-9_]*$/.test(token)) {
                                                                                    return <span key={tokenIdx} className="text-[#9CDCFE]">{token}</span>;
                                                                                }
                                                                                // Return token as is for spaces and other characters
                                                                                return <span key={tokenIdx}>{token}</span>;
                                                                            })}
                                                                            {'\n'}
                                                                        </span>
                                                                    );
                                                                });
                                                                
                                                                return (
                                                                    <pre className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-xl p-4 my-3 overflow-x-auto font-mono text-[15px] relative group">
                                                                        <button
                                                                            className={`absolute top-2 right-2 text-xs ${
                                                                                isCopied 
                                                                                    ? 'bg-[#2D2D2D] text-[#6A9955]' 
                                                                                    : 'bg-[#2D2D2D] text-[#D4D4D4] hover:bg-[#3E3E3E]'
                                                                            } rounded px-2 py-0.5 border border-[#3E3E3E] cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100`}
                                                                            onClick={() => handleCopy(codeString, buttonId)}
                                                                        >
                                                                            {isCopied ? 'Copied!' : 'Copy'}
                                                                        </button>
                                                                        <code {...props}>{highlighted}</code>
                                                                    </pre>
                                                                );
                                                            },
                                                            h1: ({ node, ...props }) => <h1 className="text-white font-bold text-2xl mt-4 mb-2" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-white font-bold text-xl mt-3 mb-2" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-white font-bold text-lg mt-2 mb-1" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                                            em: ({ node, ...props }) => <em className="text-white font-bold italic" {...props} />,
                                                            p: ({ node, ...props }) => <p className="text-[#CCD6F6] mb-4 leading-relaxed" {...props} />,
                                                            li: ({ node, ...props }) => <li className="text-[#CCD6F6] mb-1" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                                                            blockquote: ({ node, ...props }) => (
                                                                <blockquote className="border-l-4 border-[#64FFDA] pl-4 my-4 text-[#CCD6F6] italic" {...props} />
                                                            ),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <form
                                onSubmit={handleSubmit}
                                className="fixed bottom-0 left-0 w-full z-50 flex justify-center transition-all duration-300"
                                style={sidebarOpen ? { marginLeft: '18rem', width: 'calc(100% - 18rem)', pointerEvents: 'none' } : { pointerEvents: 'none' }}
                            >
                                <div
                                    className="w-full max-w-4xl mx-auto rounded-3xl bg-[#112240] border border-[#233554] shadow-2xl p-6 flex flex-row gap-3 items-center backdrop-blur-md"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <textarea
                                        className="flex-1 bg-[#1A2E4C] text-white placeholder:text-slate-300 border border-[#233554] outline-none text-lg px-4 py-3 rounded-xl focus:ring-2 resize-y min-h-[48px] max-h-40"
                                        placeholder="Message CodeMentor_AI"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-xl px-6 py-3 font-semibold text-white shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg drop-shadow-lg bg-gradient-to-r from-[#233554] to-[#1A2E4C] border-2 border-[#233554]"
                                    >
                                        <span className="ml-1">➤</span>
                                    </button>
                                </div>
                            </form>
                            </>
                        )}
                        {error && (
                            <div
                                className="border-l-4 p-4 rounded-xl text-red-700 shadow animate-fade-in bg-red-50 border-red-400"
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

export default CodeReviewForm;