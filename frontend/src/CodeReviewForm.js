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

    const showToast = (type, message, duration = 2500) => {
        setToast({ type, message });
        if (type !== 'loading') {
            setTimeout(() => setToast(null), duration);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFeedback(null);
        setLoading(true);
        showToast('loading', 'Analyzing code…', 99999);
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
                    <div className="w-full max-w-3xl flex flex-col gap-4 mb-36">
                        {feedback && (
                            <div className="bg-white/90 border-2 border-blue-300 rounded-2xl shadow-2xl p-8 animate-fade-in max-w-2xl self-center">
                                <h3 className="font-extrabold text-2xl text-blue-800 mb-4 flex items-center gap-2 tracking-wide">
                                    <span role="img" aria-label="sparkles">✨</span> Code Feedback
                                </h3>
                                <div className="prose prose-blue max-w-none">
                                    <ReactMarkdown
                                        children={Object.values(feedback).join('\n\n')}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-blue-900 mt-4 mb-2" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-blue-800 mt-3 mb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-blue-700 mt-2 mb-1" {...props} />,
                                            code: ({ node, inline, className, children, ...props }) =>
                                                !inline ? (
                                                    <pre className="bg-slate-100 rounded-md p-3 my-2 overflow-x-auto text-sm"><code {...props}>{children}</code></pre>
                                                ) : (
                                                    <code className="bg-slate-200 rounded px-1">{children}</code>
                                                ),
                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-blue-900" {...props} />,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl text-red-700 shadow animate-fade-in">
                                <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
                            </div>
                        )}
                    </div>
                    {/* Sticky Input Bar */}
                    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 w-full flex justify-center z-40 bg-gradient-to-t from-white/90 to-white/60 py-6 shadow-2xl">
                        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 items-end">
                            <textarea
                                className="flex-1 border-2 border-blue-400 rounded-2xl p-4 text-base font-mono bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 transition shadow-sm resize-none min-h-[80px] max-h-[180px] placeholder:text-slate-400"
                                placeholder="Paste your code here..."
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="border-2 border-blue-400 rounded-2xl px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg"
                                disabled={loading}
                            >
                                Submit
                                <span className="ml-1">➤</span>
                            </button>
                        </div>
                    </form>
                    {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
                </main>
            </div>
        </div>
    );
}

export default CodeReviewForm;