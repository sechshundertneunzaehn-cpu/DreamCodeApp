export const FEATURE_FLAGS = {
    SHOW_BOT_USERS: false,
    CULTURAL_DATABASE_ENABLED: true,
    ENABLE_GRAPH: import.meta.env.VITE_ENABLE_GRAPH === 'true',
} as const;
