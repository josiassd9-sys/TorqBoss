// Lightweight stubs for firebase exports used across the app during type-check/build.
// These are intentionally permissive; replace with real implementations when restoring full firebase setup.
export const auth: any = null;
export const db: any = null;
export const doc = (...args: any[]) => ({} as any);
export const getDoc = async (..._args: any[]) => ({ exists: false } as any);
export const setDoc = async (..._args: any[]) => ({} as any);
export const onAuthStateChanged = (authArg: any, cb?: any) => { if (typeof cb === 'function') cb(null); return () => {}; };
export type User = any;
export const onSnapshot = (_ref: any, next?: any, error?: any) => { if (typeof next === 'function') next({}); if (typeof error === 'function') error(null); return () => {}; };
export const increment = (n: number) => n as any;
export const arrayUnion = (...items: any[]) => items as any;

