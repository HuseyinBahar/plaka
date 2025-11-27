const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database dosyası yolu
const dbPath = path.join(__dirname, '../../plaka.db');

// Database bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
  } else {
    console.log('✅ SQLite database connected');
  }
});

// Tabloları oluştur
const createTables = async () => {
  return new Promise((resolve, reject) => {
    // Önce ana tabloları oluştur
    const createTablePromises = [
      // Plaka posts tablosu
      new Promise((resolveTable, rejectTable) => {
        db.run(`CREATE TABLE IF NOT EXISTS plaka_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          location TEXT,
          plate_number TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) rejectTable(err);
          else resolveTable();
        });
      }),
      
      // Users tablosu
      new Promise((resolveTable, rejectTable) => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) rejectTable(err);
          else resolveTable();
        });
      }),
      
      // Comments tablosu
      new Promise((resolveTable, rejectTable) => {
        db.run(`CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plaka_id INTEGER NOT NULL,
          user_id INTEGER,
          comment_text TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plaka_id) REFERENCES plaka_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        )`, (err) => {
          if (err) rejectTable(err);
          else resolveTable();
        });
      }),
      
      // Likes tablosu
      new Promise((resolveTable, rejectTable) => {
        db.run(`CREATE TABLE IF NOT EXISTS likes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plaka_id INTEGER NOT NULL,
          user_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (plaka_id) REFERENCES plaka_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(plaka_id, user_id)
        )`, (err) => {
          if (err) rejectTable(err);
          else resolveTable();
        });
      })
    ];
    
    // Tabloları oluştur
    Promise.all(createTablePromises)
      .then(() => {
        console.log('✅ Ana tablolar oluşturuldu');
        
        // İndeksleri oluştur
        const indexPromises = [
          db.run('CREATE INDEX IF NOT EXISTS idx_plaka_posts_created_at ON plaka_posts(created_at)'),
          db.run('CREATE INDEX IF NOT EXISTS idx_plaka_posts_location ON plaka_posts(location)'),
          db.run('CREATE INDEX IF NOT EXISTS idx_plaka_posts_plate_number ON plaka_posts(plate_number)'),
          db.run('CREATE INDEX IF NOT EXISTS idx_comments_plaka_id ON comments(plaka_id)'),
          db.run('CREATE INDEX IF NOT EXISTS idx_likes_plaka_id ON likes(plaka_id)')
        ];
        
        Promise.all(indexPromises)
          .then(() => {
            console.log('✅ İndeksler oluşturuldu');
            console.log('✅ Veritabanı başarıyla oluşturuldu');
            resolve();
          })
          .catch(err => {
            console.error('❌ İndeks oluşturma hatası:', err);
            resolve(); // Hata olsa bile devam et
          });
      })
      .catch(err => {
        console.error('❌ Tablo oluşturma hatası:', err);
        reject(err);
      });
  });
};

// Tüm plakaları getir
const getAllPlakalar = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM plaka_posts ORDER BY created_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Tek plaka getir
const getPlakaById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM plaka_posts WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Yeni plaka ekle
const addPlaka = (title, description, imageUrl, location, plateNumber) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO plaka_posts (title, description, image_url, location, plate_number) VALUES (?, ?, ?, ?, ?)',
      [title, description, imageUrl, location, plateNumber],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

// Plaka güncelle
const updatePlaka = (id, title, description, imageUrl, location, plateNumber) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE plaka_posts SET title = ?, description = ?, image_url = ?, location = ?, plate_number = ? WHERE id = ?',
      [title, description, imageUrl, location, plateNumber, id],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

// Plaka sil
const deletePlaka = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM plaka_posts WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

// Plaka ara
const searchPlakalar = (query, location, sortBy) => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM plaka_posts WHERE 1=1';
    const params = [];

    if (query) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR plate_number LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    sql += sortBy === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  createTables,
  getAllPlakalar,
  getPlakaById,
  addPlaka,
  updatePlaka,
  deletePlaka,
  searchPlakalar
};
