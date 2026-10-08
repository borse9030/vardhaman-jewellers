'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminLoggedIn } = useAuth();

  const [email, setEmail] = useState('jaynam27@gmail.com');
  const [password, setPassword] = useState('JaYnAm@147');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      router.push('/admin');
    }
  }, [isAdminLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setError(res.message || 'Invalid credentials. Access restricted to authorized personnel.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1818] flex flex-col justify-center items-center p-4 selection:bg-[#581825] selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#581825]/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Emblem */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-3" aria-label="Return to Store">
            <Image
              src="/logo-gold.png"
              alt="Vardhaman Jewellers"
              width={220}
              height={70}
              priority
              className="h-16 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
            Administration & Bullion Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#2B2625] rounded-2xl border border-[#C5A880]/20 shadow-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10 text-white">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            <h2 className="font-serif text-base font-bold">Secure Administrative Access</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#D6D3D1] font-semibold mb-1">Admin Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jaynam27@gmail.com"
                  className="w-full bg-[#1A1818] text-white p-3 pl-10 rounded-xl border border-white/15 focus:outline-none focus:border-[#C5A880]"
                />
                <Mail className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[#D6D3D1] font-semibold mb-1">Administrative Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1A1818] text-white p-3 pl-10 rounded-xl border border-white/15 focus:outline-none focus:border-[#C5A880]"
                />
                <Lock className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#581825] hover:bg-[#7E2638] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2 border border-[#C5A880]/30"
            >
              <span>{loading ? 'Authenticating Role...' : 'Enter Admin Console'}</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </button>
          </form>

          {/* Provisioning Credential Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-[#A8A29E]">
              Super Admin Provisioned: <strong className="text-[#DFCDAE]">jaynam27@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
