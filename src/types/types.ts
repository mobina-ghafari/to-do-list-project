// src/types/types.ts

export enum priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
}

export enum status {
    PENDING = "PENDING",
    DOING = "DOING",
    DONE = "DONE",
    WARNING = "WARNING",
}

export interface TodoItem {
    id: number;
    title: string;
    priority: priority;
    datetime: Date;
    estimate: string;
    status: status;
    hash: string;
}
