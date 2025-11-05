import { useState } from 'react';
import { useLoginMutation } from '../services/queries/useLoginQuery';
import { useNavigate } from 'react-router-dom';
import { BsShieldFill } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { encrypt } from '../hooks/crypt';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useLoginMutation(
    (data) => {
      toast.success(data.message);
      encrypt("User", data?.user);
      navigate('/home');
      window.location.reload();
    },
    (err) => {
      setError(err?.response?.data?.message || 'Login failed');
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white via-gray-100 to-blue-100">

      <div className="hidden md:flex md:w-1/2 bg-blue-700 text-white items-center justify-center px-10">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Invader</h1>
          <p className="text-lg font-light">
            Your test automation hub to manage QA efficiently and at scale.
          </p>
          <img
            src="/login-illustration.svg"
            alt="Login Illustration"
            className="mt-10 max-w-xs mx-auto drop-shadow-lg"
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

          <div className="flex flex-col items-center mb-8">
            <BsShieldFill className="text-blue-600 w-12 h-12 mb-2 drop-shadow-sm" />
            <h2 className="text-2xl font-semibold text-gray-800">Sign in to Invader</h2>
            <p className="text-sm text-gray-500 mt-1">Access your testing workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-md font-medium text-gray-600">Email</label>
              <input
                type="email"
                className="mt-1 w-full bg-white rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-600">Password</label>
              <input
                type="password"
                className="mt-1 w-full bg-white rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              {loginMutation.isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="py-3 text-center text-sm text-gray-500">
            Don’t have an account?{' '}
            <span className="text-blue-600 font-medium cursor-pointer">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
