// Input sanitization için HTML escape fonksiyonu
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// XSS koruması için input temizleme
export const sanitizeInput = (input: string): string => {
  return escapeHtml(input.trim());
};

// Plaka numarası formatı kontrolü
export const validatePlateNumber = (plateNumber: string): boolean => {
  // Türk plaka formatı: 34 ABC 123 veya 34 ABC 1234
  const plateRegex = /^[0-9]{2}\s*[A-Z]{1,3}\s*[0-9]{2,4}$/;
  return plateRegex.test(plateNumber.toUpperCase());
};

// Dosya tipi kontrolü
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Sadece JPEG, PNG ve WebP formatları desteklenir.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' 
    };
  }

  return { isValid: true };
};

// Başlık validasyonu
export const validateTitle = (title: string): { isValid: boolean; error?: string } => {
  const sanitizedTitle = sanitizeInput(title);
  
  if (sanitizedTitle.length < 5) {
    return { 
      isValid: false, 
      error: 'Başlık en az 5 karakter olmalıdır.' 
    };
  }

  if (sanitizedTitle.length > 100) {
    return { 
      isValid: false, 
      error: 'Başlık en fazla 100 karakter olabilir.' 
    };
  }

  return { isValid: true };
};

// Açıklama validasyonu
export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  const sanitizedDescription = sanitizeInput(description);
  
  if (sanitizedDescription.length < 10) {
    return { 
      isValid: false, 
      error: 'Açıklama en az 10 karakter olmalıdır.' 
    };
  }

  if (sanitizedDescription.length > 1000) {
    return { 
      isValid: false, 
      error: 'Açıklama en fazla 1000 karakter olabilir.' 
    };
  }

  return { isValid: true };
};

// Konum validasyonu
export const validateLocation = (location: string): { isValid: boolean; error?: string } => {
  if (!location.trim()) return { isValid: true }; // Opsiyonel alan
  
  const sanitizedLocation = sanitizeInput(location);
  
  if (sanitizedLocation.length < 3) {
    return { 
      isValid: false, 
      error: 'Konum en az 3 karakter olmalıdır.' 
    };
  }

  if (sanitizedLocation.length > 100) {
    return { 
      isValid: false, 
      error: 'Konum en fazla 100 karakter olabilir.' 
    };
  }

  return { isValid: true };
};

// Rate limiting için basit kontrol
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Zaman penceresi geçmişse sıfırla
    if (now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return true;
    }

    // Limit aşılmışsa
    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    // Deneme sayısını artır
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
