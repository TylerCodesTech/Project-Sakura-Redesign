import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const SakuraBranch = () => (
  <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none z-0 opacity-90">
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#5d4037', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8d6e63', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M420,-20 C350,50 380,80 300,100 C250,112 200,80 150,120 C120,144 100,180 80,180" 
        stroke="url(#branchGradient)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M300,100 C280,150 320,180 310,220" 
        stroke="url(#branchGradient)" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M150,120 C140,160 160,190 150,230" 
        stroke="url(#branchGradient)" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round"
      />
      <circle cx="80" cy="180" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="70" cy="175" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="310" cy="220" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="320" cy="210" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="150" cy="230" r="7" fill="#ffb7c5" opacity="0.8" />
    </svg>
  </div>
);

const SakuraPetal = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute pointer-events-none z-0" style={{ ...style }}>
    <svg viewBox="0 0 30 30" className="w-full h-full opacity-90">
      <defs>
        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff9a9e', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fecfef', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M15,0 C9,0 2,7 2,15 C2,22 9,30 15,30 C21,30 28,22 28,15 C28,7 21,0 15,0 M15,5 C15,5 17,2 15,0 C13,2 15,5 15,5" 
        fill="url(#petalGradient)" 
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))' }}
      />
    </svg>
  </div>
);

const LoginPage = () => {
  const [petals, setPetals] = useState<{ id: number; style: React.CSSProperties }[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, loginMutation, setupStatus, isLoading, isSetupLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const createPetal = () => {
      const startX = Math.random() * 60 + 40;
      const scale = Math.random() * 0.5 + 0.5;
      return {
        id: Math.random(),
        style: {
          left: `${startX}%`,
          top: '-20px',
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          animationName: 'fall-diagonal, rotate-3d',
          animationDuration: `${Math.random() * 5 + 6}s, ${Math.random() * 4 + 2}s`,
          animationDelay: '0s',
          animationTimingFunction: 'linear, ease-in-out',
        }
      };
    };

    const interval = setInterval(() => {
      setPetals((prev) => {
        const cleaned = prev.slice(-35);
        return [...cleaned, createPetal()];
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (setupStatus?.needsSetup) {
      setLocation("/setup");
    } else if (user) {
      setLocation("/");
    }
  }, [user, setupStatus, setLocation]);

  if (isLoading || isSetupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-blue-50 flex items-center justify-center relative overflow-hidden font-sans text-slate-800">
      <SakuraBranch />

      <div className="absolute inset-0 z-0 overflow-hidden">
        {petals.map((petal) => (
          <SakuraPetal key={petal.id} style={petal.style} />
        ))}
      </div>

      <Card className="w-full max-w-sm z-10 border border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-rose-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white" strokeWidth="2">
              <path d="M12 2L12 22" />
              <path d="M12 12L18 6" />
              <path d="M12 12L6 6" />
              <path d="M12 17L16 13" />
              <path d="M12 17L8 13" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-800">
            Project Sakura
          </CardTitle>
          <CardDescription className="text-slate-500">
            Log in to your workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Username
              </Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 h-10 transition-all"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Password
              </Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 h-10 transition-all"
                autoComplete="current-password"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 shadow-md transition-all mt-2 group"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall-diagonal {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translate(-30vw, 105vh);
            opacity: 0;
          }
        }

        @keyframes rotate-3d {
          0% { transform: rotate3d(1, 1, 1, 0deg); }
          100% { transform: rotate3d(1, 1, 1, 360deg); }
        }
      ` }} />
    </div>
  );
};

export default LoginPage;
