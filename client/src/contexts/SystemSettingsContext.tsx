import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { systemSettingsDefaults } from "@shared/schema";

type SystemSettings = typeof systemSettingsDefaults;

interface SystemSettingsContextType {
  settings: SystemSettings;
  isLoading: boolean;
  updateSetting: (key: keyof SystemSettings, value: string) => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<void>;
  refetch: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<Record<string, string>>({
    queryKey: ["/api/system-settings"],
    queryFn: async () => {
      const res = await fetch("/api/system-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const settings: SystemSettings = Object.assign({}, systemSettingsDefaults, data || {});

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await apiRequest("PATCH", `/api/system-settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<SystemSettings>) => {
      await apiRequest("PATCH", "/api/system-settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
    },
  });

  const updateSetting = async (key: keyof SystemSettings, value: string) => {
    await updateSettingMutation.mutateAsync({ key, value });
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    await updateSettingsMutation.mutateAsync(updates);
  };

  useEffect(() => {
    if (settings.companyName) {
      document.title = settings.platformName || settings.companyName;
    }

    if (settings.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.faviconUrl;
      }
    }

    if (settings.primaryColor && settings.primaryColor !== "#7c3aed") {
      const root = document.documentElement;
      const hsl = hexToHSL(settings.primaryColor);
      if (hsl) {
        root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
  }, [settings.companyName, settings.platformName, settings.faviconUrl, settings.primaryColor]);

  return (
    <SystemSettingsContext.Provider value={{ settings, isLoading, updateSetting, updateSettings, refetch }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error("useSystemSettings must be used within a SystemSettingsProvider");
  }
  return context;
}

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
