import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Hash, Clock, Trash2 } from 'lucide-react';
import type { PlakaPost } from '../types';
import { apiService } from '../services/api';
import { formatDate } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

export const PlakaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [plaka, setPlaka] = useState<PlakaPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlaka(parseInt(id));
    }
  }, [id]);

  const loadPlaka = async (plakaId: number) => {
    setIsLoading(true);
    try {
      const response = await apiService.getPlaka(plakaId);
      setPlaka(response.data || null);
      
      if (!response.data) {
        showNotification({
          type: 'error',
          title: 'Plaka Bulunamadı',
          message: 'Aradığınız plaka bulunamadı.'
        });
        navigate('/bulunan-plakalar');
      }
    } catch (error) {
      console.error('Error loading plaka:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: 'Plaka yüklenirken bir hata oluştu.'
      });
      navigate('/bulunan-plakalar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!plaka) return;

    // Onay mesajı
    const confirmed = window.confirm(
      'Bu plakayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await apiService.deletePlaka(plaka.id);
      
      showNotification({
        type: 'success',
        title: 'Başarılı',
        message: 'Plaka başarıyla silindi.'
      });

      // Bulunan plakalar sayfasına yönlendir
      navigate('/bulunan-plakalar');
    } catch (error: any) {
      console.error('Error deleting plaka:', error);
      showNotification({
        type: 'error',
        title: 'Hata',
        message: error?.message || 'Plaka silinirken bir hata oluştu.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Plaka yükleniyor..." />
      </div>
    );
  }

  if (!plaka) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/bulunan-plakalar')}
          className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Geri Dön</span>
        </button>

        {/* Main Content */}
        <div className="card overflow-hidden">
          {/* Image */}
          <div className="w-full aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
            <img 
              src={apiService.getImageUrl(plaka.image_url)} 
              alt={plaka.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Eğer hata oluşursa placeholder göster
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e5e7eb" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EResim yüklenemedi%3C/text%3E%3C/svg%3E';
                target.onerror = null; // Sonsuz döngüyü önle
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {plaka.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {plaka.plate_number && (
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plaka.plate_number}
                  </span>
                </div>
              )}
              
              {plaka.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {plaka.location}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {formatDate(plaka.created_at)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Açıklama
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {plaka.description}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {plaka.updated_at && plaka.updated_at !== plaka.created_at 
                    ? `Son güncelleme: ${formatDate(plaka.updated_at)}`
                    : `Oluşturulma: ${formatDate(plaka.created_at)}`
                  }
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? 'Siliniyor...' : 'Plakayı Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

