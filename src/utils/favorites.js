import { API_BASE_URL } from '../config/api';

export const getFavorites = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/liked/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // API 응답이 배열이거나 래퍼 객체일 수 있음
        return Array.isArray(data) ? data : (data.content || data.data || []);
    } catch (error) {
        return [];
    }
};


export const toggleFavorite = async (userId, artId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/liked`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                userId: typeof userId === 'string' ? parseInt(userId) : userId,
                artId 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '관심 목록 토글에 실패했습니다.');
        }

        return true;
    } catch (error) {
        throw error;
    }
};


let favoritesCache = [];
let favoritesCacheUserId = null;

export const refreshFavoritesCache = async (userId) => {
    if (userId) {
        favoritesCache = await getFavorites(userId);
        favoritesCacheUserId = userId;
    }
};

export const isFavorite = (artId) => {
    // liked 객체에서 artId를 추출하여 비교
    return favoritesCache.some(liked => 
        liked.artId === artId || liked.art?.artId === artId
    );
};

export const addToFavorites = async (userId, artId) => {
    await toggleFavorite(userId, artId);
    // 캐시에서 해당 항목이 없으면 추가 (optimistic update)
    if (!isFavorite(artId)) {
        favoritesCache.push({ artId });
    }
};

export const removeFromFavorites = async (userId, artId) => {
    await toggleFavorite(userId, artId);
    // 캐시에서 해당 항목 제거 (optimistic update)
    favoritesCache = favoritesCache.filter(liked => 
        liked.artId !== artId && liked.art?.artId !== artId
    );
};

