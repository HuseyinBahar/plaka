import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Hash, FileText, ArrowLeft } from 'lucide-react';
import type { PlakaFormData } from '../types';
import { apiService } from '../services/api';
import { 
  validateImageFile, 
  validateTitle, 
  validateDescription, 
  validateLocation,
  validatePlateNumber,
  sanitizeInput,
  RateLimiter 
} from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingButton } from '../components/LoadingSpinner';

export const PlakaBildirPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [rateLimiter] = useState(() => new RateLimiter(3, 60000)); // 3 deneme/dakika
  
  const [formData, setFormData] = useState<PlakaFormData>({
    title: '',
    description: '',
    image: null,
    location: '',
    plateNumber: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PlakaFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showNotification({
          type: 'error',
          title: 'Dosya Hatası',
          message: validation.error
        });
        return;
      }
      
      handleInputChange('image', file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Başlık validasyonu
    const titleValidation = validateTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!;
    }
    
    // Açıklama validasyonu
    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error!;
    }
    
    // Fotoğraf validasyonu
    if (!formData.image) {
      newErrors.image = 'Fotoğraf gereklidir';
    }
    
    // Plaka numarası validasyonu (opsiyonel)
    if (formData.plateNumber.trim()) {
      if (!validatePlateNumber(formData.plateNumber)) {
        newErrors.plateNumber = 'Geçerli bir plaka numarası girin (örn: 34 ABC 123)';
      }
    }
    
    // Konum validasyonu (opsiyonel)
    if (formData.location.trim()) {
      const locationValidation = validateLocation(formData.location);
      if (!locationValidation.isValid) {
        newErrors.location = locationValidation.error!;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Rate limiting kontrolü
    if (!rateLimiter.canAttempt('submit')) {
      showNotification({
        type: 'warning',
        title: 'Çok Fazla Deneme',
        message: 'Lütfen 1 dakika bekleyip tekrar deneyin.'
      });
      return;
    }
    
    if (!validateForm()) {
      showNotification({
        type: 'error',
        title: 'Form Hatası',
        message: 'Lütfen tüm hataları düzeltin.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const createData = {
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        image: formData.image!,
        location: formData.location ? sanitizeInput(formData.location) : undefined,
        plate_number: formData.plateNumber ? sanitizeInput(formData.plateNumber.toUpperCase()) : undefined
      };
      
      await apiService.createPlaka(createData);
      
      // Rate limiter'ı sıfırla
      rateLimiter.reset('submit');
      
      showNotification({
        type: 'success',
        title: 'Başarılı!',
        message: 'Plaka başarıyla eklendi.'
      });
      
      // 2 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error?.message || 'Bir hata oluştu. Lütfen backend sunucusunun çalıştığından emin olun.';
      showNotification({
        type: 'error',
        title: 'Hata',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Plaka Bildir
              </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fotoğraf Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Fotoğraf
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-32 w-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            handleInputChange('image', null);
                          }}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Fotoğrafı Kaldır
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">
                            <span>Fotoğraf Yükle</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, JPEG (max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
                )}
              </div>

              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Başlık
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Örn: 34 ABC 123 - Kadıköy'de Bulundu"
                  className="input-field"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Plaka Numarası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Plaka Numarası (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                  placeholder="34 ABC 123"
                  className="input-field"
                />
              </div>

              {/* Konum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Konum (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Kadıköy, İstanbul"
                  className="input-field"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Plakayı nerede, ne zaman buldunuz? Detaylı açıklama yazın..."
                  rows={4}
                  className="input-field resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Gönder Butonu */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <LoadingButton
                  type="submit"
                  className="btn-primary"
                  loading={isSubmitting}
                >
                  Gönder
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
