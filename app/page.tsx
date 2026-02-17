"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket, Machine } from "@/hooks/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Server, Activity, Monitor, HardDrive, Network, Clock, Settings, Upload, Download, Languages, LogOut, X } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import { MachineDetail } from "@/components/machine-detail";
import { useLanguage } from "@/components/language-context";

export default function Home() {
  const router = useRouter();
  const { machines, isConnected } = useSocket();
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const { t, language, setLanguage } = useLanguage();
  const [authorized, setAuthorized] = useState(false);
  const [hiddenMachines, setHiddenMachines] = useState<Set<string>>(new Set());

  const removeMachine = (hostname: string) => {
    setHiddenMachines(prev => {
      const next = new Set(prev);
      next.add(hostname);
      return next;
    });
  };

  // Filter out hidden machines
  const visibleMachines = machines.filter(m => {
    if (hiddenMachines.has(m.hostname) && m.status !== 'online') return false;
    return true;
  });

  // Auto-restore: if a hidden machine comes back online, remove it from hidden set
  useEffect(() => {
    const restored = machines.filter(m => hiddenMachines.has(m.hostname) && m.status === 'online');
    if (restored.length > 0) {
      setHiddenMachines(prev => {
        const next = new Set(prev);
        restored.forEach(m => next.delete(m.hostname));
        return next;
      });
    }
  }, [machines, hiddenMachines]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en");
  };

  const onlineCount = visibleMachines.filter((m) => m.status === "online").length;

  // Aggregate stats (only from visible machines)
  const totalCpuLoad = visibleMachines.reduce((acc, m) => acc + (m.status === 'online' ? m.cpu_percent : 0), 0) / (onlineCount || 1);
  const totalRamUsed = visibleMachines.reduce((acc, m) => acc + (m.status === 'online' ? m.ram_used : 0), 0);
  const totalNetDown = visibleMachines.reduce((acc, m) => acc + (m.status === 'online' ? m.net_recv_speed : 0), 0);
  const totalNetUp = visibleMachines.reduce((acc, m) => acc + (m.status === 'online' ? m.net_sent_speed : 0), 0);

  if (!authorized) {
    return null; // Or a loading spinner
  }

  return (
    <main className="min-h-screen bg-[#050508] text-foreground font-mono p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050508] to-black">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative p-3 bg-slate-900/50 rounded-xl border border-green-500/30 ring-1 ring-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Server className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                NETCOMMAND <span className="text-xs align-top bg-green-500/20 text-green-400 px-1 py-0.5 rounded border border-green-500/30">ULTIMATE</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {t("SYSTEM STATUS")}: <span className={isConnected ? 'text-green-400' : 'text-red-500'}>{isConnected ? t("ONLINE") : t("DISCONNECTED")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Logout Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-500"
            >
              <LogOut className="w-4 h-4" />
            </Button>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="bg-slate-900/50 border-white/10 hover:bg-white/10 text-white"
            >
              <Languages className="w-4 h-4 mr-2" />
              {language === "en" ? "Tiếng Việt" : "English"}
            </Button>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
              <div className="p-3 rounded-lg bg-slate-900/30 border border-white/5 backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t("Avg CPU Load")}</div>
                <div className="text-xl font-bold text-green-400">{totalCpuLoad.toFixed(1)}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/30 border border-white/5 backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t("Total RAM Used")}</div>
                <div className="text-xl font-bold text-blue-400">{formatBytes(totalRamUsed)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/30 border border-white/5 backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t("Network Down")}</div>
                <div className="text-xl font-bold text-cyan-400">{formatBytes(totalNetDown)}/s</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/30 border border-white/5 backdrop-blur-sm">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t("Network Up")}</div>
                <div className="text-xl font-bold text-purple-400">{formatBytes(totalNetUp)}/s</div>
              </div>
            </div>
          </div>
        </header>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {visibleMachines.map((machine) => (
              <motion.div
                key={machine.hostname}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedMachine(machine)}
                className="cursor-pointer"
              >
                <Card
                  className={`h-full border transition-all duration-300 bg-slate-900/40 backdrop-blur-md overflow-hidden group relative
                ${machine.status === 'online'
                      ? 'border-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:-translate-y-1'
                      : 'border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] opacity-60 grayscale-[0.5]'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${machine.status === 'online' ? 'from-green-500/5 to-transparent' : 'from-red-500/5 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                  <div className={`h-1 w-full ${machine.status === 'online' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-red-900'}`} />

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${machine.status === 'online' ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20' : 'bg-red-500/10 text-red-500'}`}>
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-100">{machine.hostname}</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] h-4 px-1 ${machine.status === 'online' ? 'bg-green-950/30 text-green-400 border-green-500/30' : 'bg-red-950/30 text-red-400 border-red-500/30'}`}>
                            {machine.status}
                          </Badge>
                          {machine.status === 'online' && (
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDuration(machine.uptime_seconds || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {machine.status !== 'online' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMachine(machine.hostname);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 border border-red-500/20 hover:border-red-500/40 z-10"
                        title={t("Remove")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    {/* CPU */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> {t("CPU Load")}</span>
                        <span className={`font-mono font-bold ${machine.cpu_percent > 80 ? 'text-red-400' : 'text-green-400'}`}>
                          {machine.cpu_percent.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={machine.cpu_percent} className="h-1.5 bg-slate-800" indicatorClassName={machine.cpu_percent > 80 ? 'bg-red-500' : 'bg-green-500'} />
                    </div>

                    {/* RAM */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> {t("Memory")}</span>
                        <span className="text-slate-300 font-mono">
                          <span className="text-blue-400">{machine.ram_percent.toFixed(0)}%</span>
                          <span className="text-slate-600 mx-1">/</span>
                          {formatBytes(machine.ram_used || 0)}
                        </span>
                      </div>
                      <Progress value={machine.ram_percent} className="h-1.5 bg-slate-800" indicatorClassName="bg-blue-500" />
                    </div>

                    {/* DISK */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> {t("Storage")}</span>
                        <span className="text-slate-300 font-mono text-[10px]">
                          {formatBytes(machine.disk_used || 0)} <span className="text-slate-600">of</span> {formatBytes(machine.disk_total || 0)}
                        </span>
                      </div>
                      <Progress value={machine.disk_percent || 0} className="h-1.5 bg-slate-800" indicatorClassName="bg-purple-500" />
                    </div>

                    {/* Network & Processes Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex flex-col justify-between">
                        <div className="text-[10px] text-slate-500 flex items-center gap-1"><Network className="w-3 h-3" /> {t("NET I/O")}</div>
                        <div className="flex justify-between items-end mt-1 text-[10px] font-mono">
                          <div className="text-cyan-400 flex items-center gap-0.5"><Download className="w-3 h-3" />{formatBytes(machine.net_recv_speed || 0)}/s</div>
                          <div className="text-purple-400 flex items-center gap-0.5"><Upload className="w-3 h-3" />{formatBytes(machine.net_sent_speed || 0)}/s</div>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-white/5 flex flex-col justify-between">
                        <div className="text-[10px] text-slate-500 flex items-center gap-1"><Settings className="w-3 h-3" /> {t("PROCS")}</div>
                        <div className="text-right font-mono text-white text-sm">{machine.process_count || 0}</div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <MachineDetail
          machine={selectedMachine}
          isOpen={!!selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      </div>
    </main>
  );
}
