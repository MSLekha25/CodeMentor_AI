import React, { useState } from 'react';
import { ReactComponent as HeroIcon } from './HeroIcon.svg';

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
        <div className="min-h-screen w-full h-screen bg-slate-100 flex flex-col overflow-hidden">
            {/* Remove the duplicate header in the right container, add AI Agent image and tagline */}
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
                    <div className="flex flex-col items-center mb-8">
                        <img src="/ai-agent.png" alt="AI Agent" className="w-24 h-24 mb-2 drop-shadow-lg" />
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-1">Your Personal AI Code Mentor</h2>
                        <p className="text-base md:text-lg text-slate-600 text-center max-w-xl">Empowering you to write better code, learn faster, and grow as a developer—instantly, with AI.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-6">
                        <textarea
                            className="w-full border-2 border-blue-400 rounded-2xl p-4 text-base font-mono bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400 transition shadow-sm resize-none min-h-[120px] placeholder:text-slate-400"
                            placeholder="Paste your code here..."
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required
                            style={{ maxHeight: '200px' }}
                        />
                        <button
                            type="submit"
                            className="self-end border-2 border-blue-400 rounded-2xl px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-lg"
                            disabled={loading}
                        >
                            Submit
                            <span className="ml-1">▶</span>
                        </button>
                    </form>
                    {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
                    {feedback && (
                        <div className="mt-8 bg-cyan-50 border border-blue-200 rounded-xl shadow p-6 overflow-auto max-h-40 w-full max-w-3xl">
                            <h3 className="font-bold text-blue-700 mb-4 text-xl flex items-center gap-2">
                                <span role="img" aria-label="sparkles">✨</span> Code Feedback
                            </h3>
                            <ul className="list-none space-y-4">
                                {Object.entries(feedback).map(([key, value]) => (
                                    key !== 'learning' ? (
                                        <li key={key} className="flex items-start gap-2">
                                            <span className="inline-block mt-1 text-blue-500">
                                                {key === 'style' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>}
                                                {key === 'bugs' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2z" /></svg>}
                                                {key === 'improvements' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1" /></svg>}
                                            </span>
                                            <span className="text-base text-slate-800"><span className="font-semibold capitalize">{key}:</span> {value}</span>
                                        </li>
                                    ) : null
                                ))}
                                {learningMode && feedback.learning && (
                                    <li className="flex items-start gap-2 bg-blue-50 border-l-4 border-cyan-400 rounded-lg p-4">
                                        <span className="text-xl mt-0.5">📘</span>
                                        <span className="text-cyan-800 text-base"><span className="font-semibold">Explanation:</span> {feedback.learning}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                    {error && (
                        <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-xl text-red-700 shadow animate-fade-in w-full max-w-3xl">
                            <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default CodeReviewForm;