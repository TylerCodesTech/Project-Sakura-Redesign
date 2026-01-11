import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

// 1. Artistic Branch Component (SVG)
const SakuraBranch = () => (
  <div className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none z-0 opacity-90">
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="branchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#5d4037', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8d6e63', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Main Branch Structure - Stylized like an ink painting */}
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

      {/* Static Flower Clusters on Tree */}
      <circle cx="80" cy="180" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="70" cy="175" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="310" cy="220" r="8" fill="#ffb7c5" opacity="0.8" />
      <circle cx="320" cy="210" r="6" fill="#ffcdd2" opacity="0.8" />
      <circle cx="150" cy="230" r="7" fill="#ffb7c5" opacity="0.8" />
    </svg>
  </div>
);

// 2. Realistic Petal Component
const SakuraPetal = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute pointer-events-none z-0"
    style={{ ...style }}
  >
    <svg viewBox="0 0 30 30" className="w-full h-full opacity-90">
      <defs>
        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff9a9e', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fecfef', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Realistic Cleft Petal Shape */}
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

  useEffect(() => {
    const createPetal = () => {
      // Logic: Petals start mostly from the right side (where the tree is)
      // and drift towards the left
      const startX = Math.random() * 60 + 40; // Start between 40% and 100% width
      const scale = Math.random() * 0.5 + 0.5; // Scale between 0.5 and 1.0

      return {
        id: Math.random(),
        style: {
          left: `${startX}%`,
          top: '-20px',
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          animationName: 'fall-diagonal, rotate-3d', // Custom diagonal fall
          animationDuration: `${Math.random() * 5 + 6}s, ${Math.random() * 4 + 2}s`,
          animationDelay: '0s',
          animationTimingFunction: 'linear, ease-in-out',
        }
      };
    };

    const interval = setInterval(() => {
      setPetals((prev) => {
        const cleaned = prev.filter(p => {
            // Simple cleanup approximation (in real app, use ref or timestamp)
            return true; 
        }).slice(-35); // Max 35 petals to keep DOM light but lush
        return [...cleaned, createPetal()];
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    // 3. Background: Professional Light Gradient (Sunrise/Morning)
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-blue-50 flex items-center justify-center relative overflow-hidden font-sans text-slate-800">

      {/* The Tree Branch */}
      <SakuraBranch />

      {/* Falling Petals Layer (Behind Card) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {petals.map((petal) => (
          <SakuraPetal key={petal.id} style={petal.style} />
        ))}
      </div>

      {/* 4.  Login Card */}
      <Card className="w-full max-w-sm z-10 border border-white/60 shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
            {/* Minimalist Logo Mark */}
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
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 h-10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Password
                </Label>
                <a href="#" className="text-xs text-rose-500 hover:text-rose-600 font-medium">Forgot?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="bg-white/50 border-slate-200 focus-visible:ring-rose-400 focus-visible:border-rose-400 h-10 transition-all"
              />
            </div>

            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 shadow-md transition-all mt-2 group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-slate-400">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-10 border-slate-200 hover:bg-white hover:text-rose-600">
                    Google
                </Button>
                <Button variant="outline" className="h-10 border-slate-200 hover:bg-white hover:text-rose-600">
                    SSO
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 5. CSS for Wind Physics */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall-diagonal {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            /* Move down AND left to simulate wind from the right */
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