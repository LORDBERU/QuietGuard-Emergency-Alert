import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Create Account</h1>
      </div>
      
      {error && (
        <div className="bg-danger/20 border border-danger text-red-200 p-4 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="password">Password (min 8 characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white p-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <p className="text-center mt-8 text-lg text-gray-400">
        Already have an account? <Link to="/login" className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">Sign in</Link>
      </p>
    </div>
  );
};