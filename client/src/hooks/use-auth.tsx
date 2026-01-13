import { ReactNode, createContext, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  department: string;
  avatar?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  department?: string;
}

interface SetupData {
  user: {
    username: string;
    password: string;
  };
  company?: {
    name: string;
    primaryColor?: string;
  };
  department?: {
    name: string;
    description?: string;
  };
}

interface SetupStatus {
  needsSetup: boolean;
  userCount: number;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  setupStatus: SetupStatus | null;
  isSetupLoading: boolean;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  setupMutation: UseMutationResult<{ user: User; message: string }, Error, SetupData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      } catch {
        return null;
      }
    },
  });

  const {
    data: setupStatus,
    isLoading: isSetupLoading,
  } = useQuery<SetupStatus>({
    queryKey: ["/api/setup-status"],
    queryFn: async () => {
      const res = await fetch("/api/setup-status");
      if (!res.ok) throw new Error("Failed to check setup status");
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast.success("Welcome back!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (newUser: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", newUser);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast.success("Account created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries();
      toast.success("Logged out successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Logout failed");
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (setupData: SetupData) => {
      const res = await apiRequest("POST", "/api/setup", setupData);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Setup failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      queryClient.setQueryData(["/api/setup-status"], { needsSetup: false, userCount: 1 });
      toast.success("Setup completed! Welcome aboard.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Setup failed");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        setupStatus: setupStatus ?? null,
        isSetupLoading,
        loginMutation,
        logoutMutation,
        registerMutation,
        setupMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
