export type ApiResult<T = unknown> = {
    ok: boolean;
    data?: T;
    error?: string;
    requestId: string;
};
export interface FetchResult<T> {
    data: T | null;
    error: string | null;
    headers: Headers;
    status: number;
}
export interface UserPrefs {
    density: 'compact' | 'normal' | 'comfortable';
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
}
//# sourceMappingURL=api.d.ts.map