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
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-2xl mt-14 border border-blue-200">
        <div className="flex flex-col items-center mb-8">
        <div className="bg-white rounded-full shadow-lg p-3 mb-3 animate-bounce-slow">
            <HeroIcon className="w-32 h-32" />
        </div>
        <h2 className="text-4xl font-extrabold text-blue-800 text-center tracking-tight drop-shadow mb-2">AI Code Review</h2>
        <p className="text-lg text-blue-600 text-center max-w-xl">Get instant, beginner-friendly feedback and explanations for your Python or JavaScript code. Powered by AI.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-7">
        <textarea
            className="w-full border-2 border-blue-300 rounded-xl p-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition shadow-sm bg-white resize-none placeholder:text-blue-300"
            rows={8}
            placeholder="Paste your code here..."
            value={code}
            onChange={e => setCode(e.target.value)}
            required
        />
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <label className="flex items-center gap-2 font-semibold text-blue-700">
            <input
                type="checkbox"
                checked={learningMode}
                onChange={e => setLearningMode(e.target.checked)}
                className="accent-blue-600 w-5 h-5 focus:ring-2 focus:ring-blue-500 transition"
            />
            Learning Mode
            </label>
        </div>
        <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xl font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
        >
            {loading && (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            )}
            {loading ? 'Submitting...' : 'Submit'}
        </button>
        </form>
        {feedback && (
        <div className="mt-10 flex justify-center animate-fade-in">
            <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-2xl shadow-xl p-8">
            <h3 className="font-bold text-blue-700 mb-4 text-2xl flex items-center gap-2">
                <span role="img" aria-label="sparkles">✨</span> Code Feedback
            </h3>
            <ul className="list-none space-y-4">
                {Object.entries(feedback).map(([key, value]) => (
                key !== 'learning' ? (
                    <li key={key} className="flex items-start gap-2">
                    <span className="inline-block mt-1 text-blue-500">
                        {key === 'style' && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>}
                        {key === 'bugs' && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2z" /></svg>}
                        {key === 'improvements' && <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1" /></svg>}
                    </span>
                    <span className="text-lg text-gray-800"><span className="font-semibold capitalize">{key}:</span> {value}</span>
                    </li>
                ) : null
                ))}
                {learningMode && feedback.learning && (
                <li className="flex items-start gap-2 bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                    <span className="text-2xl mt-0.5">📘</span>
                    <span className="text-blue-800 text-lg"><span className="font-semibold">Explanation:</span> {feedback.learning}</span>
                </li>
                )}
            </ul>
            </div>
        </div>
        )}
        {error && (
        <div className="mt-10 bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl text-red-700 shadow-md animate-fade-in">
            <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
        )}
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
    );
}

export default CodeReviewForm;