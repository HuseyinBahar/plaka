import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import type { PlakaPost, SearchFilters } from '../types';
import { apiService } from '../services/api';
import { PlakaCard } from '../components/PlakaCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

export const BulunanPlakalarPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [posts, setPosts] = useState<PlakaPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PlakaPost[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    sortBy: 'newest'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Sadece posts yüklendikten sonra filtreleme yap
    if (!isLoading) {
      filterPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, filters, isLoading]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getPlakalar();
      const loadedPosts = response.data || [];
      setPosts(loadedPosts);
      
      if (loadedPosts.length === 0) {
        showNotification({
          type: 'info',
          title: 'Henüz Plaka Yok',
          message: 'Henüz hiç plaka eklenmemiş. İlk plakayı siz ekleyin!'
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      showNotification({
        type: 'error',
        title: 'Veri Yükleme Hatası',
        message: 'Plakalar yüklenirken bir hata oluştu. Lütfen backend sunucusunun çalıştığından emin olun.'
      });
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    // Eğer query ve location boşsa, sadece client-side filtreleme yap
    if (!filters.query && !filters.location) {
      let filtered = [...posts];

      filtered.sort((a, b) => {
        if (filters.sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
      });

      setFilteredPosts(filtered);
      return;
    }

    // Query veya location varsa API'ye istek at
    apiService.searchPlakalar({
      q: filters.query || undefined,
      location: filters.location || undefined,
      sortBy: filters.sortBy
    })
      .then(response => {
        setFilteredPosts(response.data || []);
      })
      .catch(error => {
        console.error('Error filtering posts:', error);
        // Fallback to client-side filtering
        let filtered = [...posts];

        if (filters.query) {
          const query = filters.query.toLowerCase();
          filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.description.toLowerCase().includes(query) ||
            (post.plate_number && post.plate_number.toLowerCase().includes(query))
          );
        }

        if (filters.location) {
          const location = filters.location.toLowerCase();
          filtered = filtered.filter(post => 
            post.location && post.location.toLowerCase().includes(location)
          );
        }

        filtered.sort((a, b) => {
          if (filters.sortBy === 'newest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          } else {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
        });

        setFilteredPosts(filtered);
      });
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      sortBy: 'newest'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Plakalar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulunan Plakalar
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredPosts.length} plaka bulundu
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Plaka ara..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Konum */}
            <div className="relative">
              <input
                type="text"
                placeholder="Konum ara..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Sıralama */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as 'newest' | 'oldest')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
              </select>
            </div>

            {/* Temizle */}
            <div>
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Plaka bulunamadı
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Arama kriterlerinize uygun plaka bulunamadı. Filtreleri değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PlakaCard
                key={post.id}
                post={post}
                onClick={() => {
                  navigate(`/plaka/${post.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
