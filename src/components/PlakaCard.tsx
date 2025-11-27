import { MapPin, Calendar } from 'lucide-react';
import type { PlakaPost } from '../types';
import { formatDate, truncateText } from '../utils/helpers';
import { apiService } from '../services/api';

interface PlakaCardProps {
  post: PlakaPost;
  onClick?: () => void;
}

export const PlakaCard = ({ post, onClick }: PlakaCardProps) => {
  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img 
          src={apiService.getImageUrl(post.image_url)} 
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Resim yüklenemezse placeholder göster
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EResim yüklenemedi%3C/text%3E%3C/svg%3E';
            target.onerror = null; // Sonsuz döngüyü önle
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
          {truncateText(post.description, 120)}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{post.location || 'Konum belirtilmemiş'}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.created_at)}</span>
          </div>
        </div>
        
        {post.plate_number && (
          <div className="mt-3">
            <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded text-sm font-medium">
              {post.plate_number}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
