// Augment the NodeJS namespace to include Buffer
declare global {
    namespace NodeJS {
        interface Global {
            Buffer: typeof Buffer;
        }
    }
}

export {};