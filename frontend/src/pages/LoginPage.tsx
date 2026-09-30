import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Sign In</h1>
      </div>
      
      {error && (
        <div className="bg-danger/20 border border-danger text-red-200 p-4 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
          <label className="block text-lg font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p className="text-center mt-8 text-lg text-gray-400">
        Don't have an account? <Link to="/register" className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">Register here</Link>
      </p>
    </div>
  );
};