"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Server, Lock, User, AlertCircle, Shield, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const { t, language, setLanguage } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (isLoggedIn === "true") {
            router.push("/");
        }
    }, [router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate network delay for effect
        setTimeout(() => {
            if (username === "admin" && password === "admin123") {
                localStorage.setItem("isLoggedIn", "true");
                router.push("/");
            } else {
                setError(t("Invalid credentials"));
                setLoading(false);
            }
        }, 800);
    };

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "vi" : "en");
    };

    return (
        <div className="min-h-screen grid place-items-center bg-[#050508] p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#050508] to-black font-mono relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-900/50 rounded-2xl border border-green-500/30 ring-1 ring-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)] mb-4">
                        <Server className="h-10 w-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">
                        NETCOMMAND <span className="text-sm align-top bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">ULTIMATE</span>
                    </h1>
                    <p className="text-slate-500 text-xs uppercase tracking-[0.2em] mt-2">{t("Access Restricted")}</p>
                </div>

                <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-center text-xl text-white font-bold">{t("Sign In")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder={t("Username")}
                                        className="pl-9 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="password"
                                        placeholder={t("Password")}
                                        className="pl-9 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-green-500/50"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="text-xs text-red-400 flex items-center gap-2 bg-red-500/10 p-2 rounded border border-red-500/20"
                                >
                                    <AlertCircle className="w-3 h-3" /> {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold tracking-wide shadow-lg shadow-green-900/20 border border-green-500/20 transition-all duration-300 transform hover:scale-[1.02]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Checking Credentials...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> {t("Login")}
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center border-t border-white/5 py-4">
                        <button
                            onClick={toggleLanguage}
                            className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                            Switch to {language === "en" ? "Tiếng Việt" : "English"}
                        </button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
