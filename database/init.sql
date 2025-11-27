-- Plaka Bulma Platformu - SQLite Veritabanı Başlatma Scripti
-- Bu dosya veritabanı tablolarını oluşturur ve örnek veriler ekler

-- Plaka posts tablosu - Ana tablo
CREATE TABLE IF NOT EXISTS plaka_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    location TEXT,
    plate_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcılar tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Yorumlar tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plaka_id INTEGER NOT NULL,
    user_id INTEGER,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaka_id) REFERENCES plaka_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Beğeniler tablosu (gelecekte kullanım için)
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plaka_id INTEGER NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaka_id) REFERENCES plaka_posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(plaka_id, user_id)
);

-- Örnek veriler kaldırıldı - Production için hazır

-- İndeksler oluştur (tablolar oluşturulduktan sonra)
CREATE INDEX IF NOT EXISTS idx_plaka_posts_created_at ON plaka_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_plaka_posts_location ON plaka_posts(location);
CREATE INDEX IF NOT EXISTS idx_plaka_posts_plate_number ON plaka_posts(plate_number);
CREATE INDEX IF NOT EXISTS idx_comments_plaka_id ON comments(plaka_id);
CREATE INDEX IF NOT EXISTS idx_likes_plaka_id ON likes(plaka_id);

-- Veritabanı bilgilerini göster
SELECT 'Veritabanı başarıyla oluşturuldu!' as message;
SELECT COUNT(*) as plaka_sayisi FROM plaka_posts;