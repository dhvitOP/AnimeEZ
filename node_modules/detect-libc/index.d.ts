export const GLIBC: string = 'glibc';
export const MUSL: string = 'musl';

export function family(): Promise<string | null>;
export function familySync(): string | null;

export function isNonGlibcLinux(): Promise<boolean>;
export function isNonGlibcLinuxSync(): boolean;

export function version(): Promise<string | null>;
export function versionSync(): string | null;
