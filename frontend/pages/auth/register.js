import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verification states
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(300);

  const handleGoogleLoginSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const idToken = response.credential;
      const res = await api.auth.googleLogin(idToken);
      
      localStorage.setItem('fh_token', res.token);
      localStorage.setItem('fh_user', JSON.stringify(res.user));
      
      window.dispatchEvent(new Event('auth-changed'));
      
      router.push('/profile');
    } catch (err) {
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fh_token');
    if (token) {
      router.push('/profile');
      return;
    }

    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1047128637508-yourclientid.apps.googleusercontent.com';

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: client_id,
          callback: handleGoogleLoginSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignUpButton"),
          { theme: "outline", size: "large", width: "382", text: "signup_with" }
        );
      }
    };

    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    }
  }, [requiresVerification]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (requiresVerification && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [requiresVerification, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Restrict registration strictly to @gmail.com
    if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
      setError('Registration requires a valid Google Mail (@gmail.com) address.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.register(name, email, phone, password, role, requiresVerification ? verificationCode : undefined);
      
      if (response.requiresVerification) {
        setRequiresVerification(true);
        setTimer(300);
        setSuccess('Verification code sent to your email.');
        setLoading(false);
        return;
      }

      localStorage.setItem('fh_token', response.token);
      localStorage.setItem('fh_user', JSON.stringify(response.user));
      
      window.dispatchEvent(new Event('auth-changed'));
      router.push('/profile');
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.auth.register(name, email, phone, password, role);
      setTimer(300);
      setSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register Account | FashionHub</title>
      </Head>

      <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-neutral-50 dark:bg-neutral-900/10">
        <div className="max-w-md w-full bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 p-8 rounded-sm shadow-md space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="font-serif font-bold text-3xl text-neutral-850 dark:text-white">Register Account</h1>
            <p className="text-xs text-neutral-400 font-light">Create a profile to unlock personal styling logs and orders.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 text-xs font-semibold rounded-sm border border-red-100 dark:border-red-950">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-750 dark:text-green-400 text-xs font-semibold rounded-sm border border-green-100 dark:border-green-950">
              {success}
            </div>
          )}

          {!requiresVerification ? (
            <form onSubmit={handleRegister} className="space-y-4 font-light text-sm">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Account Role</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input 
                      type="radio" 
                      name="role" 
                      value="buyer" 
                      checked={role === 'buyer'}
                      onChange={() => setRole('buyer')}
                      className="accent-luxury-accent"
                    />
                    <span>Buyer (Customer)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input 
                      type="radio" 
                      name="role" 
                      value="seller" 
                      checked={role === 'seller'}
                      onChange={() => setRole('seller')}
                      className="accent-luxury-accent"
                    />
                    <span>Seller (Brand Owner)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-100 dark:border-neutral-800"></div>
                </div>
                <span className="relative px-3 bg-white dark:bg-neutral-950 text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">or</span>
              </div>

              <div id="googleSignUpButton" className="w-full flex justify-center"></div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 font-light text-sm animate-fade-in">
              <div className="text-center space-y-2 py-2">
                <div className="mx-auto w-12 h-12 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center text-luxury-accent">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="font-serif font-bold text-xl text-neutral-850 dark:text-white">Security Verification</h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  To complete registration, please enter the 6-digit verification code sent to <strong className="font-medium text-neutral-700 dark:text-neutral-200">{email}</strong>.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block text-center">Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="------"
                  className="w-full px-3 py-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 text-center text-2xl font-bold tracking-[0.5em] placeholder-neutral-300 dark:placeholder-neutral-700"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-neutral-400">
                  {timer > 0 ? `Expires in ${formatTime(timer)}` : 'Code expired'}
                </span>
                <button
                  type="button"
                  disabled={timer > 0 || loading}
                  onClick={handleResendCode}
                  className={`font-semibold uppercase tracking-wider text-[10px] ${timer > 0 ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed' : 'text-luxury-accent hover:underline'}`}
                >
                  Resend Code
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setRequiresVerification(false);
                    setVerificationCode('');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-1/3 py-2.5 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-center"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-2/3 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-neutral-400 pt-2 font-light">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-luxury-accent hover:underline font-semibold uppercase tracking-wider">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
