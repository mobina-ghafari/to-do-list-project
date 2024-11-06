import {TodoItem , status , priority} from '../types/types';


// تابع فرمت دهی estimate
export const formatEstimate = (hours: number): string => {
    if (hours >= 40) return `${Math.floor(hours / 40)}w`;
    if (hours >= 8) return `${Math.floor(hours / 8)}d`;
    return `${hours}h`;
};

// تابع تولید hash
export const generateHash = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// دریافت hash‌ها از localStorage
export const getStoredHashes = (): Record<number, string> => {
    const storedHashes = localStorage.getItem("todoHashes");
    return storedHashes ? JSON.parse(storedHashes) : {};
};

// ذخیره hash‌ها در localStorage
export const saveHashes = (hashes: Record<number, string>) => {
    localStorage.setItem("todoHashes", JSON.stringify(hashes));
};

// تابع ایجاد آیتم
export const createData = (
    id: number,
    title: string,
    priority: priority,
    datetime: Date,
    status: status,
): TodoItem => {
    const hoursElapsed = Math.floor((new Date().getTime() - datetime.getTime()) / (1000 * 60 * 60));
    const initialEstimate = formatEstimate(hoursElapsed);
    const storedHashes = getStoredHashes();
    const hash = storedHashes[id] || generateHash();
    console.log(hash);
    if (!storedHashes[id]) {
        storedHashes[id] = hash;
        saveHashes(storedHashes);
    }
    
    return { id, title, priority, datetime, estimate: initialEstimate, status, hash };
};