import { useEffect, useState, useRef } from 'react';

export type Machine = {
    hostname: string;
    cpu_percent: number;
    cpu_freq_current: number;
    cpu_freq_max: number;
    cpu_cores_physical: number;
    cpu_cores_logical: number;

    ram_percent: number;
    ram_total: number;
    ram_used: number;
    swap_percent: number;
    swap_total: number;
    swap_used: number;

    disk_total: number;
    disk_used: number;
    disk_percent: number;
    disk_read_speed: number;
    disk_write_speed: number;

    net_sent_speed: number;
    net_recv_speed: number;

    uptime_seconds: number;
    process_count: number;
    os_info: string;

    gpu?: {
        name: string;
        load: number;
        memory_total: number;
        memory_used: number;
        temperature: number;
    };

    top_processes?: {
        pid: number;
        name: string;
        cpu_percent: number;
        memory_percent: number;
    }[];

    status: 'online' | 'offline';
    last_seen: string;
};

export const useSocket = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = () => {
        // In production, this URL should be configurable
        // Assuming backend is at localhost:8000
        const wsUrl = 'ws://localhost:8000/ws';

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'update') {
                    setMachines(message.data);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
            // Try to reconnect after 3 seconds
            if (!reconnectTimeoutRef.current) {
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket.close();
        };
    };

    useEffect(() => {
        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return { machines, isConnected };
};
