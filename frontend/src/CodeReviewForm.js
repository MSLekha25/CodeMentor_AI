import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function Sidebar({ onNav }) {
    return (
        <aside className="flex flex-col gap-4 py-8 px-2 md:px-4 bg-[#1B2A4B] min-w-[120px] w-full max-w-[280px] h-screen">
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-[#2C3B5C] transition text-base w-full bg-[#243351]"
                onClick={() => onNav('exam')}
            >
                <span role="img" aria-label="edit" className="text-xl">📝</span>
                <span className="hidden md:inline">Take Exam</span>
            </button>
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-[#2C3B5C] transition text-base w-full bg-[#243351]"
                onClick={() => onNav('progress')}
            >
                <span role="img" aria-label="chart" className="text-xl">📈</span>
                <span className="hidden md:inline">Progress</span>
            </button>
            <button
                className="flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-white hover:bg-[#2C3B5C] transition text-base w-full bg-[#243351]"
                onClick={() => onNav('chats')}
            >
                <span role="img" aria-label="chat" className="text-xl">💬</span>
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
    const [toast, setToast] = useState(null);
    const [chat, setChat] = useState([]);
    const [hasPrompted, setHasPrompted] = useState(false);
    const [copiedStates, setCopiedStates] = useState({});
    const chatContainerRef = useRef(null);

    const showToast = (type, message, duration = 2500) => {
        if (type === 'error') {
            setToast({ type, message });
            setTimeout(() => setToast(null), duration);
        }
    };

    const handleCopy = (text, buttonId) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [buttonId]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [buttonId]: false }));
        }, 2000);
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
                setFeedback(data.feedback);
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

    // Responsive layout
    return (
        <div className="min-h-screen w-full h-screen flex flex-row overflow-hidden bg-[#0A192F]">
            <div className="hidden md:block min-w-[120px] bg-[#05101F]">
                <Sidebar onNav={() => {}} />
            </div>
            <main className="flex-1 flex flex-col items-center justify-center w-full bg-[#0A192F] relative">
                <div className="w-full flex flex-col items-center justify-center min-h-[100vh]">
                    {!hasPrompted && (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <h2 className="text-4xl md:text-5xl font-bold mb-10 text-center drop-shadow-lg text-white">
                                Hey, what's on your mind today?
                            </h2>
                            <form
                                onSubmit={handleSubmit}
                                className="w-full max-w-4xl mx-auto rounded-3xl bg-[#112240] border border-[#233554] shadow-2xl p-8 flex flex-row gap-4 items-center backdrop-blur-md"
                            >
                                <input
                                    className="flex-1 bg-[#1A2E4C] text-white placeholder:text-slate-300 border border-[#233554] outline-none text-lg px-4 py-3 rounded-xl focus:ring-2"
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
                                                                return <code className="bg-[#1A2E4C] text-[#64FFDA] rounded px-1.5 py-0.5 font-mono text-[0.95em]">{children}</code>;
                                                            }
                                                            const codeString = String(children);
                                                            const buttonId = `copy-button-${idx}-${Math.random().toString(36).substr(2, 9)}`;
                                                            const highlighted = codeString.split('\n').map((line, idx) => {
                                                                if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
                                                                    return <span key={idx} className="text-[#64FFDA]">{line + '\n'}</span>;
                                                                }
                                                                return <span key={idx}>{line + '\n'}</span>;
                                                            });
                                                            return (
                                                                <pre className="bg-[#1A2E4C] border border-[#233554] rounded-xl p-4 my-3 overflow-x-auto font-mono text-[15px] text-white relative group">
                                                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                                                        {copiedStates[buttonId] && (
                                                                            <span className="text-xs text-[#64FFDA] bg-[#112240] rounded px-2 py-0.5 animate-fade-in">
                                                                                Copied!
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            id={buttonId}
                                                                            className="text-xs text-[#64FFDA] bg-[#112240] rounded px-2 py-0.5 border-none cursor-pointer hover:bg-[#1A2E4C] transition-colors opacity-0 group-hover:opacity-100"
                                                                            onClick={() => handleCopy(codeString, buttonId)}
                                                                            type="button"
                                                                            title="Copy code"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                    </div>
                                                                    <code {...props} className="text-[#CCD6F6]">{highlighted}</code>
                                                                </pre>
                                                            );
                                                        },
                                                        h1: ({ node, ...props }) => <h1 className="text-[#64FFDA] font-bold text-2xl mt-4 mb-2" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-[#64FFDA] font-bold text-xl mt-3 mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-[#64FFDA] font-semibold text-lg mt-2 mb-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1 text-[#CCD6F6]" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="text-[#64FFDA]" {...props} />,
                                                        p: ({ node, ...props }) => <p className="text-[#CCD6F6] mb-4" {...props} />,
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
                            className="fixed bottom-0 left-0 right-0 w-full max-w-4xl mx-auto rounded-3xl bg-[#112240] border border-[#233554] shadow-2xl p-6 flex flex-row gap-3 items-center backdrop-blur-md z-50"
                            style={{margin: '0 auto'}}
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
            {toast && toast.type === 'error' && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
        </div>
    );
}

export default CodeReviewForm;