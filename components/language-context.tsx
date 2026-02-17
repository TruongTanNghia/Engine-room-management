"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "vi";

type Dictionary = {
    [key: string]: {
        en: string;
        vi: string;
    };
};

const dictionary: Dictionary = {
    // General
    "SYSTEM STATUS": { en: "SYSTEM STATUS", vi: "TRẠNG THÁI HỆ THỐNG" },
    "ONLINE": { en: "ONLINE", vi: "TRỰC TUYẾN" },
    "DISCONNECTED": { en: "DISCONNECTED", vi: "MẤT KẾT NỐI" },
    "Overview": { en: "Overview", vi: "Tổng quan" },

    // Login
    "Login": { en: "Login", vi: "Đăng nhập" },
    "Username": { en: "Username", vi: "Tài khoản" },
    "Password": { en: "Password", vi: "Mật khẩu" },
    "Sign In": { en: "Sign In", vi: "Đăng nhập" },
    "Logout": { en: "Logout", vi: "Đăng xuất" },
    "Invalid credentials": { en: "Invalid credentials", vi: "Sai tài khoản hoặc mật khẩu" },
    "Welcome back, Commander": { en: "Welcome back, Commander", vi: "Chào mừng trở lại, Chỉ huy" },
    "Access Restricted": { en: "Access Restricted", vi: "Truy cập bị hạn chế" },
    "Remove": { en: "Remove", vi: "Xóa" },
    "GPU & Processes": { en: "GPU & Processes", vi: "GPU & Tiến trình" },
    "AI Analysis": { en: "AI Analysis", vi: "Phân tích AI" },

    // Stats
    "Avg CPU Load": { en: "Avg CPU Load", vi: "CPU Trung bình" },
    "Total RAM Used": { en: "Total RAM Used", vi: "RAM Đang dùng" },
    "Network Down": { en: "Network Down", vi: "Tải xuống" },
    "Network Up": { en: "Network Up", vi: "Tải lên" },
    "Uptime": { en: "Uptime", vi: "Thời gian chạy" },
    "Processes": { en: "Processes", vi: "Tiến trình" },
    "Cores (P/L)": { en: "Cores (P/L)", vi: "Nhân (Thực/Ảo)" },
    "CPU Freq": { en: "CPU Freq", vi: "Xung nhịp CPU" },

    // Machine Card
    "CPU Load": { en: "CPU Load", vi: "Tải CPU" },
    "Memory": { en: "Memory", vi: "Bộ nhớ" },
    "Storage": { en: "Storage", vi: "Lưu trữ" },
    "NET I/O": { en: "NET I/O", vi: "Mạng I/O" },
    "PROCS": { en: "PROCS", vi: "Số tiến trình" },

    // Detail Modal
    "Health Score": { en: "Health Score", vi: "Điểm Sức Khỏe" },
    "EXCELLENT": { en: "EXCELLENT", vi: "TUYỆT VỜI" },
    "WARNING": { en: "WARNING", vi: "CẢNH BÁO" },
    "CRITICAL": { en: "CRITICAL", vi: "NGUY HIỂM" },
    "Real-time Performance Metrics": { en: "Real-time Performance Metrics", vi: "Hiệu năng Thời gian thực" },
    "CPU & RAM History": { en: "CPU & RAM History", vi: "Lịch sử CPU & RAM" },
    "Network Traffic (KB/s)": { en: "Network Traffic (KB/s)", vi: "Lưu lượng Mạng (KB/s)" },
    "Disk I/O (KB/s)": { en: "Disk I/O (KB/s)", vi: "Đọc/Ghi Đĩa (KB/s)" },
    "No Data": { en: "No Data", vi: "Không có dữ liệu" },
    "Loading History...": { en: "Loading History...", vi: "Đang tải lịch sử..." },
    "No historical data available. Wait for the agent to send reports...": {
        en: "No historical data available. Wait for the agent to send reports...",
        vi: "Chưa có dữ liệu lịch sử. Vui lòng đợi thiết bị gửi báo cáo..."
    },

    // GPU
    "Load": { en: "Load", vi: "Tải" },
    "VRAM": { en: "VRAM", vi: "VRAM" },
    "No Dedicated GPU Detected": { en: "No Dedicated GPU Detected", vi: "Không tìm thấy Card rời" },
    "Top Processes (by CPU)": { en: "Top Processes (by CPU)", vi: "Top Tiến trình (Theo CPU)" },
    "PID": { en: "PID", vi: "PID" },
    "Name": { en: "Name", vi: "Tên" },
    "CPU": { en: "CPU", vi: "CPU" },
    "MEM": { en: "MEM", vi: "MEM" },
    "No process data available": { en: "No process data available", vi: "Không có dữ liệu tiến trình" },

    // AI Messages
    "OPTIMAL": { en: "OPTIMAL", vi: "TỐI ƯU" },
    "System is running at peak efficiency. No hardware upgrades needed at this time.": {
        en: "System is running at peak efficiency. No hardware upgrades needed at this time.",
        vi: "Hệ thống đang hoạt động hiệu quả tối đa. Chưa cần nâng cấp phần cứng."
    },
    "ATTENTION NEEDED": { en: "ATTENTION NEEDED", vi: "CẦN CHÚ Ý" },
    "SUGGESTION": { en: "SUGGESTION", vi: "GỢI Ý" },

    // Config
    "Change Language": { en: "Language", vi: "Ngôn ngữ" },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string) => {
        if (!dictionary[key]) return key;
        return dictionary[key][language];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
