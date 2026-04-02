import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'dreamcode_bot_friends';

function loadFriends(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveFriends(ids: string[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // ignore storage errors silently
    }
}

export function useBotFriends() {
    const [friends, setFriends] = useState<string[]>(() => loadFriends());

    // Sync from localStorage on mount (in case another tab changed it)
    useEffect(() => {
        setFriends(loadFriends());
    }, []);

    const isFriend = useCallback(
        (id: string): boolean => friends.includes(id),
        [friends]
    );

    const toggleFriend = useCallback((id: string): void => {
        setFriends(prev => {
            const next = prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id];
            saveFriends(next);
            return next;
        });
    }, []);

    return { friends, isFriend, toggleFriend };
}
