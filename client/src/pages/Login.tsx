import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SakuraPetal = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute pointer-events-none animate-fall"
    style={ {
      width: '15px',
      height: '10px',
      backgroundColor: '#ffb7c5',
      borderRadius: '50% 0 50% 0',
      opacity: 0.6,
      ...style
    } }
  />
);

const LoginPage = () => {
  const [petals, setPetals] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPetals((prev) => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          style: {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 4}s`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          },
        },
      ]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#fff5f7] flex items-center justify-center relative overflow-hidden">
      {/* Falling Petals Background */}
      <div className="absolute inset-0 z-0">
        {petals.map((petal) => (
          <SakuraPetal key={petal.id} style={petal.style} />
        ))}
      </div>

      <Card className="w-full max-w-md z-10 border-pink-100 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#d44d5c]">Welcome to Sakura</CardTitle>
          <CardDescription className="text-pink-400">Please enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#d44d5c]">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                className="border-pink-200 focus-visible:ring-pink-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#d44d5c]">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="border-pink-200 focus-visible:ring-pink-300"
              />
            </div>
            <Button 
              className="w-full bg-[#ffb7c5] hover:bg-[#ffa0b0] text-white font-semibold py-6"
              onClick={() => window.location.href = "/"}
            >
              Sign In
            </Button>
            <div className="text-center text-sm text-pink-400">
              Don't have an account? <a href="#" className="underline font-medium hover:text-[#d44d5c]">Sign up</a>
            </div>
          </form>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={ { __html: `
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(110vh) rotate(360deg) translateX(50px);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      ` } } />
    </div>
  );
};

export default LoginPage;
