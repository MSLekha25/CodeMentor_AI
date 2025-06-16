import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Toast({ type, message, onClose }) {
    const colors = {
        success: 'green',
        loading: 'blue2',
        error: 'red-400',
    };
    const icons = {
        success: '✅',
        loading: '🔄',
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

function Navbar({ profileName }) {
    return (
        <nav className="w-full flex items-center justify-between px-6 py-4 shadow-md bg-blue4 text-white">
            <div className="text-2xl font-bold tracking-tight text-blue1">
                CodeMentor_AI
            </div>
            <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue2 to-blue3 text-white text-xl font-bold">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" fill="currentColor" className="text-blue1"/>
                        <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="currentColor" className="text-blue2"/>
                    </svg>
                </span>
                <span className="font-semibold text-lg text-blue1">{profileName}</span>
            </div>
        </nav>
    );
}

function Sidebar({ onNav }) {
    return (
        <aside className="flex flex-col gap-4 py-8 px-2 md:px-4 bg-blue3 min-w-[80px] w-full max-w-[220px] h-screen">
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-blue2 transition text-base w-full bg-blue2"
                onClick={() => onNav('exam')}
            >
                <span role="img" aria-label="edit">📝</span>
                <span className="hidden md:inline">Take Exam</span>
            </button>
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-blue2 transition text-base w-full bg-blue2"
                onClick={() => onNav('progress')}
            >
                <span role="img" aria-label="chart">📈</span>
                <span className="hidden md:inline">Progress</span>
            </button>
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-blue2 transition text-base w-full bg-blue2"
                onClick={() => onNav('chats')}
            >
                <span role="img" aria-label="chat">💬</span>
                <span className="hidden md:inline">Previous chats</span>
            </button>
        </aside>
    );
}

function CodeReviewForm() {
    const [code, setCode] = useState('');
    const [learningMode, setLearningMode] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [chat, setChat] = useState([]);
    const [hasPrompted, setHasPrompted] = useState(false);
    const chatContainerRef = useRef(null);

    // For navbar profile
    const profileName = "John Doe";

    const showToast = (type, message, duration = 2500) => {
        setToast({ type, message });
        if (type !== 'loading') {
            setTimeout(() => setToast(null), duration);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setError(null);
        setLoading(true);
        showToast('loading', 'Analyzing code…', 99999);

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
            setLoading(false);
            setToast(null);
            if (response.ok) {
                setFeedback(data.feedback);
                setChat(prev => [
                    ...prev,
                    { role: 'ai', content: Object.values(data.feedback).join('\n\n') }
                ]);
                showToast('success', 'Code submitted successfully!');
            } else {
                setError(data);
                showToast('error', 'Error: Couldn’t fetch response.');
            }
        } catch (err) {
            setLoading(false);
            setToast(null);
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

    // Responsive layout
    return (
        <div className="min-h-screen w-full h-screen flex flex-row overflow-hidden bg-blue1">
            <div className="hidden md:block min-w-[120px] bg-blue3">
                <Sidebar onNav={() => {}} />
            </div>
            <main className="flex-1 flex flex-col items-center justify-center w-full bg-blue1 relative">
                <div className="w-full flex flex-col items-center justify-center min-h-[100vh]">
                    {!hasPrompted && (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <h2 className="text-4xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg text-blue4">
                                Hey, what's on your mind today?
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                className="w-full max-w-2xl mx-auto rounded-3xl bg-dark border border-blue3 shadow-2xl p-8 flex flex-row gap-4 items-center backdrop-blur-md"
                            >
                                <input
                                    className="flex-1 bg-transparent text-white placeholder:text-slate-300 border border-blue2 outline-none text-lg px-4 py-3 rounded-xl focus:ring-2"
                                    placeholder="Message CodeMentor_AI"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl px-6 py-3 font-semibold text-white shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg drop-shadow-lg bg-gradient-to-r from-blue2 to-blue1 border-2 border-blue2"
                                    disabled={loading}
                                >
                                    <span className="ml-1">➤</span>
                                </button>
                            </form>
                        </div>
                    )}
                    {hasPrompted && (
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
                                            className="self-end max-w-xl w-fit rounded-2xl px-6 py-4 mb-2 shadow-lg text-base font-medium animate-fade-in bg-gradient-to-br from-blue2 to-blue3 text-white"
                                        >
                                            <span className="opacity-80 text-xs font-semibold tracking-wide text-blue1">You</span>
                                            <div className="whitespace-pre-line mt-1">{msg.content}</div>
                                        </div>
                                    ) : (
                                        <div
                                            key={idx}
                                            className="self-start max-w-2xl w-full border rounded-2xl px-8 py-6 mb-2 shadow-xl animate-fade-in bg-dark border-blue3 text-white"
                                        >
                                            <span className="text-xs font-semibold tracking-wide text-blue1">✨CodeMentor</span>
                                            <div className="prose prose-invert max-w-none text-base mt-1">
                                                <ReactMarkdown
                                                    children={msg.content}
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            if (inline) {
                                                                return <code className="bg-blue3 text-blue1 rounded px-1.5 py-0.5 font-mono text-[0.95em]">{children}</code>;
                                                            }
                                                            const codeString = String(children);
                                                            const highlighted = codeString.split('\n').map((line, idx) => {
                                                                if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
                                                                    return <span key={idx} className="text-green">{line + '\n'}</span>;
                                                                }
                                                                return <span key={idx}>{line + '\n'}</span>;
                                                            });
                                                            return (
                                                                <pre className="bg-blue4 border border-blue3 rounded-xl p-4 my-3 overflow-x-auto font-mono text-[15px] text-white relative">
                                                                    <button
                                                                        className="absolute top-2 right-2 text-xs text-blue1 bg-blue3 rounded px-2 py-0.5 border-none cursor-pointer hover:bg-blue2"
                                                                        onClick={() => navigator.clipboard.writeText(codeString)}
                                                                        type="button"
                                                                        title="Copy code"
                                                                    >Copy</button>
                                                                    <code {...props}>{highlighted}</code>
                                                                </pre>
                                                            );
                                                        },
                                                        h1: ({ node, ...props }) => <h1 className="text-blue1 font-bold text-2xl mt-4 mb-2" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-blue2 font-bold text-xl mt-3 mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-blue3 font-semibold text-lg mt-2 mb-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="text-blue2" {...props} />,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        {/* Fixed input at the bottom */}
                        <form
                            onSubmit={handleSubmit}
                            className="fixed bottom-0 left-0 right-0 w-full max-w-xl mx-auto rounded-3xl bg-dark border border-blue3 shadow-2xl p-6 flex flex-row gap-3 items-center backdrop-blur-md z-50"
                            style={{margin: '0 auto'}}
                        >
                            <textarea
                                className="flex-1 bg-transparent text-white placeholder:text-slate-300 border border-blue2 outline-none text-lg px-4 py-3 rounded-xl focus:ring-2 resize-y min-h-[48px] max-h-40"
                                placeholder="Message CodeMentor_AI"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="rounded-xl px-6 py-3 font-semibold text-white shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg drop-shadow-lg bg-gradient-to-r from-blue2 to-blue1 border-2 border-blue2"
                                disabled={loading}
                            >
                                <span className="ml-1">➤</span>
                            </button>
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
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

export default CodeReviewForm;