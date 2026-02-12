"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Machine } from "@/hooks/use-socket";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, Cpu, HardDrive, Network, Thermometer, Clock, ShieldCheck, AlertTriangle, XCircle, Sparkles, CheckCircle } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/format";
import { motion } from "framer-motion";

interface MachineDetailProps {
    machine: Machine | null;
    isOpen: boolean;
    onClose: () => void;
}

export function MachineDetail({ machine, isOpen, onClose }: MachineDetailProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (machine && isOpen) {
            setLoading(true);
            fetch(`http://222.255.180.225:8000/machines/${machine.hostname}/history`)
                .then(res => res.json())
                .then(data => {
                    // Format timestamps for formatting
                    const formatted = data.map((point: any) => ({
                        ...point,
                        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    }));
                    setHistory(formatted);
                })
                .finally(() => setLoading(false));
        }
    }, [machine, isOpen]);

    if (!machine) return null;

    // Calculate Health Score
    let score = 100;
    const penalties: string[] = [];

    if (machine.cpu_percent > 90) { score -= 20; penalties.push("Critical CPU Load"); }
    else if (machine.cpu_percent > 70) { score -= 10; penalties.push("High CPU Load"); }

    if (machine.ram_percent > 90) { score -= 20; penalties.push("Critical RAM Usage"); }
    else if (machine.ram_percent > 80) { score -= 10; penalties.push("High RAM Usage"); }

    if (machine.disk_percent > 90) { score -= 15; penalties.push("Disk Near Full"); }

    if (machine.status === 'offline') { score = 0; penalties.push("Machine Offline"); }

    let healthColor = "text-green-500";
    let healthStatus = "EXCELLENT";
    if (score < 80) { healthColor = "text-yellow-500"; healthStatus = "WARNING"; }
    if (score < 50) { healthColor = "text-red-500"; healthStatus = "CRITICAL"; }

    // AI Assessment Logic
    const getAiAssessment = () => {
        const issues: string[] = [];
        const improvements: string[] = [];

        if (machine.cpu_percent > 85) {
            issues.push("CPU is bottlenecking performance.");
            improvements.push("Upgrade Processor (CPU) or reduce background tasks.");
        }
        else if (machine.cpu_percent > 60) {
            improvements.push("Consider upgrading CPU for smoother multitasking.");
        }

        if (machine.ram_percent > 90) {
            issues.push("Critical Memory shortage.");
            improvements.push("Immediate RAM upgrade required (add 8GB+).");
        } else if (machine.ram_percent > 75) {
            improvements.push("RAM usage is high. Adding more memory will improve stability.");
        }

        if (machine.disk_percent > 90) {
            issues.push("Storage is critically low.");
            improvements.push("Free up space or add a new SSD.");
        }

        if (machine.gpu && machine.gpu.temperature > 85) {
            issues.push("GPU Overheating detected.");
            improvements.push("Check cooling system / thermal paste.");
        }

        if (issues.length === 0 && improvements.length === 0) {
            return {
                status: "OPTIMAL",
                message: "System is running at peak efficiency. No hardware upgrades needed at this time.",
                color: "text-green-400",
                borderColor: "border-green-500/30",
                icon: <CheckCircle className="w-4 h-4 text-green-400" />
            };
        }

        return {
            status: issues.length > 0 ? "ATTENTION NEEDED" : "SUGGESTION",
            message: issues.length > 0 ? `${issues[0]} ${improvements[0]}` : improvements[0],
            color: issues.length > 0 ? "text-red-400" : "text-yellow-400",
            borderColor: issues.length > 0 ? "border-red-500/30" : "border-yellow-500/30",
            icon: issues.length > 0 ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Sparkles className="w-4 h-4 text-yellow-400" />
        };
    };

    const aiAssessment = getAiAssessment();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-[#0a0a0f]/95 border-green-500/20 backdrop-blur-xl text-slate-200 p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 h-[80vh]">
                    {/* Sidebar Stats */}
                    <div className="col-span-1 bg-slate-900/50 border-r border-white/5 p-6 space-y-6 overflow-y-auto">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-widest">{machine.hostname}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`${machine.status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500'} uppercase`}>
                                    {machine.status}
                                </Badge>
                                <span className="text-xs text-slate-500 font-mono">{machine.os_info}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-2 opacity-10 ${healthColor}`}>
                                    <ShieldCheck className="w-16 h-16" />
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Health Score</div>
                                <div className={`text-4xl font-black ${healthColor}`}>{score}</div>
                                <div className={`text-xs font-bold mt-1 ${healthColor}`}>{healthStatus}</div>
                                {penalties.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {penalties.map((p, i) => (
                                            <li key={i} className="text-[10px] text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* AI Assessment Box */}
                            <div className={`p-4 rounded-xl bg-slate-950/50 border ${aiAssessment.borderColor} relative overflow-hidden transition-all duration-500 hover:bg-slate-900/80`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Analysis</span>
                                </div>
                                <div className={`text-xs font-bold mb-1 flex items-center gap-2 ${aiAssessment.color}`}>
                                    {aiAssessment.status}
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                    {aiAssessment.message}
                                </p>
                            </div>

                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-slate-500">Uptime</span>
                                    <span className="text-white">{formatDuration(machine.uptime_seconds)}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-slate-500">Processes</span>
                                    <span className="text-white">{machine.process_count}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-slate-500">Cores (P/L)</span>
                                    <span className="text-white">{machine.cpu_cores_physical} / {machine.cpu_cores_logical}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-slate-500">CPU Freq</span>
                                    <span className="text-white">{machine.cpu_freq_current?.toFixed(0)} MHz</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Charts */}
                    <div className="col-span-1 md:col-span-3 p-6 overflow-y-auto bg-black/20">
                        <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Real-time Performance Metrics
                        </h3>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-slate-900/50 border border-white/5 mb-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="gpu">GPU & Processes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                {/* CPU & RAM Chart */}
                                <Card className="bg-slate-900/40 border-white/5">
                                    <CardHeader className="py-3"><CardTitle className="text-sm text-slate-400">CPU & RAM History</CardTitle></CardHeader>
                                    <CardContent className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={history}>
                                                <defs>
                                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                                                <YAxis stroke="#475569" fontSize={10} tickLine={false} domain={[0, 100]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                                <Area type="monotone" dataKey="cpu_percent" stroke="#22c55e" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                                                <Area type="monotone" dataKey="ram_percent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRam)" name="RAM %" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Network Speed Chart */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-slate-900/40 border-white/5">
                                        <CardHeader className="py-3"><CardTitle className="text-sm text-slate-400">Network Traffic (KB/s)</CardTitle></CardHeader>
                                        <CardContent className="h-[150px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={history}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                                    <XAxis dataKey="time" stroke="#475569" fontSize={10} hide />
                                                    <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => (val / 1024).toFixed(0)} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                                    <Line type="monotone" dataKey="net_recv_speed" stroke="#06b6d4" dot={false} strokeWidth={2} name="Download" />
                                                    <Line type="monotone" dataKey="net_sent_speed" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Upload" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-900/40 border-white/5">
                                        <CardHeader className="py-3"><CardTitle className="text-sm text-slate-400">Disk I/O (KB/s)</CardTitle></CardHeader>
                                        <CardContent className="h-[150px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={history}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                                    <XAxis dataKey="time" stroke="#475569" fontSize={10} hide />
                                                    <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => (val / 1024).toFixed(0)} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                                                    <Line type="monotone" dataKey="disk_read_speed" stroke="#eab308" dot={false} strokeWidth={2} name="Read" />
                                                    <Line type="monotone" dataKey="disk_write_speed" stroke="#ec4899" dot={false} strokeWidth={2} name="Write" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="gpu" className="space-y-6">
                                {/* GPU Section */}
                                {machine.gpu ? (
                                    <Card className="bg-slate-900/40 border-purple-500/20">
                                        <CardHeader className="py-3 flex flex-row items-center justify-between">
                                            <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                                                <Cpu className="w-4 h-4" /> GPU: {machine.gpu.name}
                                            </CardTitle>
                                            <Badge variant="outline" className="border-purple-500/30 text-purple-400">{machine.gpu.temperature}°C</Badge>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400">Load</span>
                                                    <span className="text-purple-400 font-bold">{machine.gpu.load.toFixed(1)}%</span>
                                                </div>
                                                <Progress value={machine.gpu.load} className="h-2 bg-slate-800" indicatorClassName="bg-purple-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-400">VRAM</span>
                                                    <span className="text-purple-400 font-bold">{(machine.gpu.memory_used / 1024).toFixed(1)} / {(machine.gpu.memory_total / 1024).toFixed(1)} GB</span>
                                                </div>
                                                <Progress value={(machine.gpu.memory_used / machine.gpu.memory_total) * 100} className="h-2 bg-slate-800" indicatorClassName="bg-purple-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="bg-slate-900/40 border-white/5 border-dashed">
                                        <CardContent className="flex items-center justify-center h-[120px] text-slate-500 text-sm">
                                            No Dedicated GPU Detected
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Top Processes Table */}
                                <Card className="bg-slate-900/40 border-white/5">
                                    <CardHeader className="py-3"><CardTitle className="text-sm text-slate-400">Top Processes (by CPU)</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead>
                                                    <tr className="border-b border-white/10 text-slate-500">
                                                        <th className="py-2">PID</th>
                                                        <th className="py-2">Name</th>
                                                        <th className="py-2 text-right">CPU</th>
                                                        <th className="py-2 text-right">MEM</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {machine.top_processes?.map((proc) => (
                                                        <tr key={proc.pid} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                                            <td className="py-2 font-mono text-slate-400">{proc.pid}</td>
                                                            <td className="py-2 font-bold text-white max-w-[150px] truncate" title={proc.name}>{proc.name}</td>
                                                            <td className="py-2 text-right font-mono text-green-400">{proc.cpu_percent.toFixed(1)}%</td>
                                                            <td className="py-2 text-right font-mono text-blue-400">{proc.memory_percent.toFixed(1)}%</td>
                                                        </tr>
                                                    ))}
                                                    {(!machine.top_processes || machine.top_processes.length === 0) && (
                                                        <tr><td colSpan={4} className="py-4 text-center text-slate-500">No process data available</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
