// 관심 목록 관리 API 함수
import { API_BASE_URL } from '../config/api';

/**
 * 사용자별 관심 목록 조회
 * @param {number|string} userId - 사용자 ID
 * @returns {Promise<Array>} - 관심 목록 배열
 */
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
        console.error('Failed to fetch favorites:', error);
        return [];
    }
};

/**
 * 관심 목록 토글 (추가/삭제)
 * @param {number|string} userId - 사용자 ID
 * @param {string} artId - 작품 ID
 * @returns {Promise<boolean>} - 성공 여부
 */
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
        console.error('Failed to toggle favorite:', error);
        throw error;
    }
};

// 하위 호환성을 위한 함수들 (로컬 상태 관리를 위해)
let favoritesCache = [];
let favoritesCacheUserId = null;

/**
 * 관심 목록 캐시 업데이트
 * @param {number|string} userId - 사용자 ID
 */
export const refreshFavoritesCache = async (userId) => {
    if (userId) {
        favoritesCache = await getFavorites(userId);
        favoritesCacheUserId = userId;
    }
};

/**
 * 관심 목록에 작품 ID가 있는지 확인 (캐시 사용)
 * @param {string} artId - 작품 ID
 * @returns {boolean} - 관심 목록에 포함되어 있는지 여부
 */
export const isFavorite = (artId) => {
    // liked 객체에서 artId를 추출하여 비교
    return favoritesCache.some(liked => 
        liked.artId === artId || liked.art?.artId === artId
    );
};

/**
 * 관심 목록에 추가 (API 호출)
 * @param {number|string} userId - 사용자 ID
 * @param {string} artId - 작품 ID
 */
export const addToFavorites = async (userId, artId) => {
    await toggleFavorite(userId, artId);
    // 캐시에서 해당 항목이 없으면 추가 (optimistic update)
    if (!isFavorite(artId)) {
        favoritesCache.push({ artId });
    }
};

/**
 * 관심 목록에서 제거 (API 호출)
 * @param {number|string} userId - 사용자 ID
 * @param {string} artId - 작품 ID
 */
export const removeFromFavorites = async (userId, artId) => {
    await toggleFavorite(userId, artId);
    // 캐시에서 해당 항목 제거 (optimistic update)
    favoritesCache = favoritesCache.filter(liked => 
        liked.artId !== artId && liked.art?.artId !== artId
    );
};

