import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Lock, User, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";

const FloatingShape = ({ delay, duration, size, left, top, color }: { 
  delay: number; 
  duration: number; 
  size: number; 
  left: number;
  top: number;
  color: string;
}) => {
  return (
    <div
      className="absolute rounded-full blur-2xl opacity-30 animate-float"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
};

const Particle = ({ delay, duration, left, color }: { 
  delay: number; 
  duration: number; 
  left: number;
  color: string;
}) => {
  return (
    <div
      className="absolute w-1 h-1 rounded-full animate-particle"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: 0,
      }}
    />
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { user, loginMutation, setupStatus, isLoading, isSetupLoading } = useAuth();
  const { settings } = useSystemSettings();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (setupStatus?.needsSetup) {
      setLocation("/setup");
    } else if (user) {
      setLocation("/");
    }
  }, [user, setupStatus, setLocation]);

  // Handle card click for ripple effect
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickRipple({ x, y });
      setTimeout(() => setClickRipple(null), 600);
    }
  };

  if (isLoading || isSetupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const companyName = settings.companyName || "Credit Union";

  // Generate floating shapes with more variety
  const shapes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    duration: 12 + Math.random() * 15,
    size: 150 + Math.random() * 250,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 3 === 0 ? 'rgb(147, 51, 234)' : i % 3 === 1 ? 'rgb(236, 72, 153)' : 'rgb(59, 130, 246)',
  }));

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    duration: 8 + Math.random() * 12,
    left: Math.random() * 100,
    color: i % 3 === 0 ? 'rgba(147, 51, 234, 0.6)' : i % 3 === 1 ? 'rgba(236, 72, 153, 0.6)' : 'rgba(59, 130, 246, 0.6)',
  }));

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background with moving gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 animate-gradient-shift">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.15),transparent_60%)] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_60%)] animate-float-bg-1" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_60%)] animate-float-bg-2" />
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {shapes.map((shape) => (
          <FloatingShape key={shape.id} {...shape} />
        ))}
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>

      {/* Grid Pattern Overlay with animation */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] animate-grid-move"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card 
          ref={cardRef}
          onClick={handleCardClick}
          className="relative border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.01] overflow-hidden"
        >
          {/* Ripple Effect */}
          {clickRipple && (
            <div
              className="absolute rounded-full bg-primary/20 pointer-events-none animate-ripple"
              style={{
                left: `${clickRipple.x}px`,
                top: `${clickRipple.y}px`,
                width: '0px',
                height: '0px',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          <CardHeader className="space-y-4 text-center pb-6 relative z-10">
            {/* Logo/Icon with pulse animation */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-110 animate-pulse-gentle">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-gradient-text">
                {companyName}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sign in to your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="username" 
                  className={`text-sm font-medium text-foreground transition-all duration-300 ${
                    isFocused === 'username' ? 'text-primary scale-105' : ''
                  }`}
                >
                  Username
                </Label>
                <div className="relative group">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ${
                    isFocused === 'username' ? 'text-primary scale-110' : 'group-hover:text-primary/70'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <Input 
                    id="username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setIsFocused('username')}
                    onBlur={() => setIsFocused(null)}
                    placeholder="Enter your username" 
                    className={`pl-10 h-12 bg-background/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 ${
                      isFocused === 'username' ? 'scale-[1.02] shadow-lg shadow-primary/10' : 'hover:border-primary/30'
                    }`}
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className={`text-sm font-medium text-foreground transition-all duration-300 ${
                    isFocused === 'password' ? 'text-primary scale-105' : ''
                  }`}
                >
                  Password
                </Label>
                <div className="relative group">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ${
                    isFocused === 'password' ? 'text-primary scale-110' : 'group-hover:text-primary/70'
                  }`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused(null)}
                    placeholder="Enter your password"
                    className={`pl-10 h-12 bg-background/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 ${
                      isFocused === 'password' ? 'scale-[1.02] shadow-lg shadow-primary/10' : 'hover:border-primary/30'
                    }`}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button with animations */}
              <Button 
                type="submit"
                disabled={loginMutation.isPending || !username || !password}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="relative z-10">Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>

              {/* Helper Text */}
              <p className="text-xs text-center text-muted-foreground pt-2 animate-fade-in">
                Accounts are managed by the system administrator, Reach out to the Helpdesk for assistance.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground mt-6 animate-fade-in">
          Secure authentication system
        </p>
      </div>

      {/* Animated Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(20px) scale(1.1) rotate(5deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-60px) translateX(-15px) scale(0.9) rotate(-5deg);
            opacity: 0.35;
          }
          75% {
            transform: translateY(-30px) translateX(10px) scale(1.05) rotate(3deg);
            opacity: 0.4;
          }
        }

        @keyframes particle {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-20vh) translateX(calc(var(--random-x) * 50px)) scale(1);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0% {
            width: 0px;
            height: 0px;
            opacity: 0.5;
          }
          100% {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float-bg-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.9);
          }
        }

        @keyframes float-bg-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-25px, 25px) scale(0.95);
          }
          66% {
            transform: translate(20px, -15px) scale(1.05);
          }
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes pulse-gentle {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(147, 51, 234, 0);
          }
        }

        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float infinite ease-in-out;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        .animate-float-bg-1 {
          animation: float-bg-1 20s ease-in-out infinite;
        }

        .animate-float-bg-2 {
          animation: float-bg-2 25s ease-in-out infinite;
        }

        .animate-grid-move {
          animation: grid-move 20s linear infinite;
        }

        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }

        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradient-text 3s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      ` }} />
    </div>
  );
};

export default LoginPage;
