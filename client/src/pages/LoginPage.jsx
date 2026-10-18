import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Logo from '../components/common/Logo';
import figmaIllustration from '../assets/figma-illustration.jpg';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('you@company.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      localStorage.setItem('leadflow_token', 'mock_jwt_token_for_phase2');
      localStorage.setItem(
        'leadflow_user',
        JSON.stringify({ name: 'John Doe', email, role: 'Admin' })
      );
      setLoading(false);
      navigate(ROUTES.DASHBOARD);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFF2FE] p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      {/* Main Container Card */}
      <div className="flex flex-col md:flex-row max-w-[960px] w-full min-h-[570px] bg-white rounded-[28px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(27,25,60,0.12),0_0_1px_1px_rgba(99,102,241,0.06)] border border-[#E2E8F0]/70">
        
        {/* Left Hero / Brand & 3D Illustration Panel */}
        <div className="w-full md:w-[46%] bg-[#1A1C32] bg-gradient-to-b from-[#1F213D] via-[#1A1C32] to-[#141528] text-white pt-8 sm:pt-10 px-8 sm:px-10 pb-0 flex flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Glow behind screen */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-[#6366F1]/15 rounded-full blur-[90px] pointer-events-none" />

          {/* Top Brand & Headlines */}
          <div className="relative z-10">
            {/* Logo Badge & Brand Name */}
            <div className="mb-6">
              <Logo theme="dark" size="md" />
            </div>

            {/* Headline */}
            <h1 className="font-bold text-3xl sm:text-[1.95rem] leading-[1.22] tracking-[-0.5px] mb-2.5 text-white">
              Smarter Leads<br />Bigger Opportunities
            </h1>

            {/* Subtitle */}
            <p className="text-[#A5B4FC]/90 text-[0.875rem] leading-relaxed">
              Manage your leads, companies and tasks all in one place.
            </p>
          </div>

          {/* 3D Isometric Illustration with Full Height & Seamless Blend */}
          <div className="relative z-10 flex justify-center items-end mt-auto pt-3 -mx-8 sm:-mx-10 overflow-hidden">
            <img
              src={figmaIllustration}
              alt="CRM 3D Analytics Workspace"
              className="w-full max-h-[310px] sm:max-h-[340px] object-contain object-bottom block"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 14%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 14%)'
              }}
            />
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-14 bg-white">
          <div className="mb-8">
            <h2 className="font-bold text-2xl sm:text-[1.75rem] text-[#1E293B] tracking-[-0.5px] mb-1.5">
              Welcome Back
            </h2>
            <p className="text-[0.88rem] text-[#64748B]">
              Sign in to your Mini CRM account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className="block font-semibold text-[0.825rem] text-[#1E293B] mb-2"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full h-[48px] pl-11 pr-4 rounded-[12px] border border-[#E2E8F0] bg-white text-[#1E293B] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label
                htmlFor="login-password"
                className="block font-semibold text-[0.825rem] text-[#1E293B] mb-2"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#94A3B8] pointer-events-none flex items-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full h-[48px] pl-11 pr-11 rounded-[12px] border border-[#E2E8F0] bg-white text-[#1E293B] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#64748B] focus:outline-none p-1 cursor-pointer transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-3.5 mb-7">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#CBD5E1] text-[#6366F1] focus:ring-[#6366F1]/20 accent-[#6366F1] cursor-pointer"
                />
                <span className="text-[0.84rem] font-medium text-[#475569]">
                  Remember me
                </span>
              </label>

              <a
                href="#"
                className="text-[0.84rem] font-semibold text-[#5046E5] hover:text-[#4338CA] hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-[12px] bg-[#5046E5] hover:bg-[#4338CA] active:translate-y-0 text-white font-semibold text-[0.95rem] shadow-[0_10px_22px_-3px_rgba(80,70,229,0.38)] hover:shadow-[0_12px_26px_-3px_rgba(80,70,229,0.48)] hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-7 text-center text-[0.84rem] text-[#64748B]">
            Don't have an account?{' '}
            <a
              href="#"
              className="font-semibold text-[#5046E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
            >
              Contact admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
