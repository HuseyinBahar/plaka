import type { PlakaPost } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface CreatePlakaData {
  title: string;
  description: string;
  location?: string;
  plate_number?: string;
  image: File;
}

export interface SearchFilters {
  q?: string;
  location?: string;
  sortBy?: 'newest' | 'oldest';
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Network hatası kontrolü
      if (!response.ok && response.status === 0) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      // Network hatası
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.');
      }
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Get all plakalar
  async getPlakalar(): Promise<ApiResponse<PlakaPost[]>> {
    return this.request<PlakaPost[]>('/plakalar');
  }

  // Get single plaka
  async getPlaka(id: number): Promise<ApiResponse<PlakaPost>> {
    return this.request<PlakaPost>(`/plakalar/${id}`);
  }

  // Create new plaka
  async createPlaka(data: CreatePlakaData): Promise<ApiResponse<PlakaPost>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('image', data.image);
    
    if (data.location) {
      formData.append('location', data.location);
    }
    if (data.plate_number) {
      formData.append('plateNumber', data.plate_number);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/plakalar`, {
        method: 'POST',
        body: formData,
      });

      // Network hatası kontrolü
      if (!response.ok && response.status === 0) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create plaka');
      }

      return result;
    } catch (error: any) {
      console.error('Create Plaka Error:', error);
      // Network hatası
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.');
      }
      throw error;
    }
  }

  // Update plaka
  async updatePlaka(id: number, data: Partial<CreatePlakaData>): Promise<ApiResponse<PlakaPost>> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.plate_number) formData.append('plateNumber', data.plate_number);
    if (data.image) formData.append('image', data.image);

    try {
      const response = await fetch(`${API_BASE_URL}/plakalar/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update plaka');
      }

      return result;
    } catch (error) {
      console.error('Update Plaka Error:', error);
      throw error;
    }
  }

  // Delete plaka
  async deletePlaka(id: number): Promise<ApiResponse> {
    return this.request(`/plakalar/${id}`, {
      method: 'DELETE',
    });
  }

  // Search plakalar
  async searchPlakalar(filters: SearchFilters): Promise<ApiResponse<PlakaPost[]>> {
    const params = new URLSearchParams();
    
    if (filters.q) params.append('q', filters.q);
    if (filters.location) params.append('location', filters.location);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    return this.request<PlakaPost[]>(`/plakalar/search?${params.toString()}`);
  }

  // Get image URL
  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }
    // Eğer zaten tam URL ise direkt dön
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Backend'den gelen image_url zaten /uploads/... formatında
    // API_BASE_URL'den /api'yi kaldırıp base URL'i alıyoruz
    const baseUrl = API_BASE_URL.replace('/api', '');
    // Eğer imageUrl zaten / ile başlıyorsa direkt ekle, değilse / ekle
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${path}`;
  }
}

export const apiService = new ApiService();
