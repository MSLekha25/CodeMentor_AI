import React from 'react';
import logo from './logo.svg';
import './App.css';
import CodeReviewForm from './CodeReviewForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 text-center text-3xl font-bold">
        CodeMentor_AI
      </header>
      <main className="py-8">
        <CodeReviewForm />
      </main>
    </div>
  );
}

export default App;
