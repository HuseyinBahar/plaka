export interface PlakaPost {
  id: number;
  title: string;
  description: string;
  image_url: string;
  location?: string;
  plate_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface PlakaFormData {
  title: string;
  description: string;
  image: File | null;
  location: string;
  plateNumber: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  sortBy: 'newest' | 'oldest';
}
