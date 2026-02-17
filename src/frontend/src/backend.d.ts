import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Prompt {
    id: string;
    categories: Array<string>;
    title: string;
    content: string;
    tags: Array<string>;
    author: string;
}
export interface Category {
    id: string;
    name: string;
    description: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(categoryId: string): Promise<void>;
    deletePrompt(promptId: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllPrompts(): Promise<Array<Prompt>>;
    getCallerUserRole(): Promise<UserRole>;
    getCategory(categoryId: string): Promise<Category | null>;
    getPrompt(promptId: string): Promise<Prompt | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCategory(category: Category): Promise<void>;
    savePrompt(prompt: Prompt): Promise<void>;
    searchPrompts(searchTerm: string): Promise<Array<Prompt>>;
}
