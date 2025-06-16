import React, { useState } from 'react';
import { ReactComponent as HeroIcon } from './HeroIcon.svg';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Toast({ type, message, onClose }) {
    const colors = {
        success: 'bg-green-600',
        loading: 'bg-blue-600',
        error: 'bg-red-600',
    };
    const icons = {
        success: '✅',
        loading: '🔄',
        error: '❌',
    };
    return (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-white flex items-center gap-3 text-lg ${colors[type]} animate-fade-in`}>
            <span className="text-2xl">{icons[type]}</span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white text-xl font-bold hover:opacity-70">×</button>
        </div>
    );
}

function CodeReviewForm() {
    const [code, setCode] = useState('');
    const [learningMode, setLearningMode] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [chat, setChat] = useState([]); // [{role: 'user'|'ai', content: string}]
    const [hasPrompted, setHasPrompted] = useState(false);

    const showToast = (type, message, duration = 2500) => {
        setToast({ type, message });
        if (type !== 'loading') {
            setTimeout(() => setToast(null), duration);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        showToast('loading', 'Analyzing code…', 99999);
        setChat(prev => [...prev, { role: 'user', content: code }]);
        setHasPrompted(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/code-review/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'python', learning_mode: learningMode })
            });
            const data = await response.json();
            setLoading(false);
            setToast(null);
            if (response.ok) {
                setFeedback(data.feedback);
                setChat(prev => [...prev, { role: 'ai', content: Object.values(data.feedback).join('\n\n') }]);
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
        setCode('');
    };

    return (
        <div className="min-h-screen w-full h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex flex-col overflow-hidden">
            <div className="main-container">
                {/* Left Sidebar */}
                <aside className="left-sidebar">
                    <button className="flex items-center gap-2 border-2 border-blue-400 rounded-lg px-4 py-2 font-semibold text-blue-700 bg-white hover:bg-blue-50 shadow transition text-base w-full">
                        Take Exam
                        <span role="img" aria-label="edit">📝</span>
                    </button>
                    <button className="flex items-center gap-2 border-2 border-blue-400 rounded-lg px-4 py-2 font-semibold text-blue-700 bg-white hover:bg-blue-50 shadow transition text-base w-full">
                        Progress
                        <span role="img" aria-label="chart">📈</span>
                    </button>
                </aside>
                {/* Right Content */}
                <main className="right-content">
                    {/* Feedback/Chat Area */}
                    <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
                        {!hasPrompted && (
                            <>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-10 text-center drop-shadow-lg">Hey, what's on your mind today?</h2>
                                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto rounded-3xl bg-[#181f2a] border border-blue-900 shadow-2xl px-8 py-8 flex flex-col gap-4 items-center backdrop-blur-md">
                                    <input
                                        className="w-full bg-transparent text-slate-100 placeholder:text-slate-400 border-none outline-none text-lg mb-4"
                                        placeholder="Message CodeMentor_AI"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="self-end border-2 border-blue-400 rounded-2xl px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg drop-shadow-lg"
                                        disabled={loading}
                                    >
                                        Submit
                                        <span className="ml-1">➤</span>
                                    </button>
                                </form>
                            </>
                        )}
                        {hasPrompted && (
                            <div className="w-full flex flex-col gap-6 items-center">
                                <div className="w-full flex flex-col gap-4 px-2">
                                    {chat.map((msg, idx) =>
                                        msg.role === 'user' ? (
                                            <div key={idx} className="self-end max-w-2xl w-fit bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-2xl px-6 py-4 mb-2 shadow-lg text-base font-medium animate-fade-in">
                                                <span className="opacity-80 text-xs font-semibold tracking-wide">You</span>
                                                <div className="whitespace-pre-line mt-1">{msg.content}</div>
                                            </div>
                                        ) : (
                                            <div key={idx} className="self-start max-w-3xl w-full md:w-[80%] bg-[#181f2a] border border-blue-900 text-slate-100 rounded-2xl px-8 py-6 mb-2 shadow-xl animate-fade-in">
                                                <span className="text-blue-400 text-xs font-semibold tracking-wide">AI</span>
                                                <div className="prose prose-invert prose-blue max-w-none text-base mt-1">
                                                    <ReactMarkdown
                                                        children={msg.content}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({ node, inline, className, children, ...props }) {
                                                                if (inline) {
                                                                    return <code className="bg-blue-900/40 text-blue-200 rounded px-1 font-mono text-sm">{children}</code>;
                                                                }
                                                                const codeString = String(children);
                                                                const highlighted = codeString.split('\n').map((line, idx) => {
                                                                    if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
                                                                        return <span key={idx} style={{ color: 'lightgreen' }}>{line + '\n'}</span>;
                                                                    }
                                                                    return <span key={idx}>{line + '\n'}</span>;
                                                                });
                                                                return (
                                                                    <pre className="bg-[#232b3a] border border-blue-900 rounded-xl p-4 my-2 overflow-x-auto text-sm font-mono shadow-inner">
                                                                        <code {...props}>{highlighted}</code>
                                                                    </pre>
                                                                );
                                                            },
                                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-blue-300 mt-4 mb-2" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-blue-200 mt-3 mb-2" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-blue-400 mt-2 mb-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="text-blue-200" {...props} />,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                {/* Input at the bottom after prompt */}
                                <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto rounded-3xl bg-[#181f2a] border border-blue-900 shadow-2xl px-6 py-4 flex flex-row gap-3 items-center backdrop-blur-md mt-8">
                                    <input
                                        className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-400 border-none outline-none text-lg px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-400 shadow-inner transition-all duration-200"
                                        placeholder="Message CodeMentor_AI"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="border-2 border-blue-400 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg drop-shadow-lg"
                                        disabled={loading}
                                    >
                                        <span className="ml-1">➤</span>
                                    </button>
                                </form>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl text-red-700 shadow animate-fade-in">
                                <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CodeReviewForm;