import { useState } from "react";
import { signin, register, setToken } from "../services/api";

interface AuthScreenProps {
    onAuth: () => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [canvasToken, setCanvasToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
        if (isLogin) {
            const data = await signin(email, password);
            if (data.access_token) {
                setToken(data.access_token);
                onAuth();
            } else {
                setError(data.detail || "Invalid credentials");
            }
        } else {
            const data = await register(email, password, name, canvasToken);
            if (data.email) {
            const loginData = await signin(email, password);
                if (loginData.access_token) {
                    setToken(loginData.access_token);
                    onAuth();
                }
            } else {
                setError(data.detail || "Registration failed");
            }
        }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Kanban Board
                </h1>
                <p className="mb-6 text-center text-sm text-gray-500">
                    {isLogin ? "Sign in to your account" : "Create a new account"}
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Canvas API token"
                                value={canvasToken}
                                onChange={(e) => setCanvasToken(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Found in Canvas → Account → Settings → New Access Token
                            </p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-700 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : isLogin ? "Sign In" : "Register"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-600 hover:underline"
                    >
                        {isLogin ? "Register" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}