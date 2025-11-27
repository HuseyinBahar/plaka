const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  getAllPlakalar, 
  getPlakaById, 
  addPlaka, 
  updatePlaka, 
  deletePlaka, 
  searchPlakalar 
} = require('../utils/database');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plaka-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  }
});

// GET /api/plakalar/search - Plaka ara (/:id'den önce olmalı)
router.get('/search', async (req, res) => {
  try {
    const { q, location, sortBy = 'newest' } = req.query;
    
    const plakalar = await searchPlakalar(q, location, sortBy);

    res.json({
      success: true,
      data: plakalar,
      count: plakalar.length
    });

  } catch (error) {
    console.error('Error searching plakalar:', error);
    res.status(500).json({
      success: false,
      error: 'Arama yapılırken hata oluştu'
    });
  }
});

// GET /api/plakalar - Tüm plakaları getir
router.get('/', async (req, res) => {
  try {
    const plakalar = await getAllPlakalar();
    res.json({
      success: true,
      data: plakalar,
      count: plakalar.length
    });
  } catch (error) {
    console.error('Error fetching plakalar:', error);
    res.status(500).json({
      success: false,
      error: 'Plakalar getirilirken hata oluştu'
    });
  }
});

// GET /api/plakalar/:id - Tek plaka getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plaka = await getPlakaById(id);
    
    if (!plaka) {
      return res.status(404).json({
        success: false,
        error: 'Plaka bulunamadı'
      });
    }

    res.json({
      success: true,
      data: plaka
    });
  } catch (error) {
    console.error('Error fetching plaka:', error);
    res.status(500).json({
      success: false,
      error: 'Plaka getirilirken hata oluştu'
    });
  }
});

// POST /api/plakalar - Yeni plaka ekle
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, plateNumber } = req.body;
    const imageFile = req.file;

    // Validation
    if (!title || !description || !imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Başlık, açıklama ve resim gereklidir'
      });
    }

    // Image URL oluştur
    const imageUrl = `/uploads/${imageFile.filename}`;

    // Database'e kaydet
    const newId = await addPlaka(title, description, imageUrl, location || null, plateNumber || null);
    
    // Eklenen kaydı getir
    const newPlaka = await getPlakaById(newId);

    res.status(201).json({
      success: true,
      message: 'Plaka başarıyla eklendi',
      data: newPlaka
    });

  } catch (error) {
    console.error('Error creating plaka:', error);
    res.status(500).json({
      success: false,
      error: 'Plaka eklenirken hata oluştu'
    });
  }
});

// PUT /api/plakalar/:id - Plaka güncelle
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, plateNumber } = req.body;
    const imageFile = req.file;

    // Mevcut plakayı kontrol et
    const existingPlaka = await getPlakaById(id);
    
    if (!existingPlaka) {
      return res.status(404).json({
        success: false,
        error: 'Plaka bulunamadı'
      });
    }

    let imageUrl = existingPlaka.image_url;
    
    // Yeni resim yüklendiyse güncelle
    if (imageFile) {
      imageUrl = `/uploads/${imageFile.filename}`;
      
      // Eski resmi sil
      const oldImagePath = path.join(__dirname, '../../', existingPlaka.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Database'i güncelle
    await updatePlaka(id, title, description, imageUrl, location || null, plateNumber || null);
    
    // Güncellenmiş kaydı getir
    const updatedPlaka = await getPlakaById(id);

    res.json({
      success: true,
      message: 'Plaka başarıyla güncellendi',
      data: updatedPlaka
    });

  } catch (error) {
    console.error('Error updating plaka:', error);
    res.status(500).json({
      success: false,
      error: 'Plaka güncellenirken hata oluştu'
    });
  }
});

// DELETE /api/plakalar/:id - Plaka sil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mevcut plakayı kontrol et
    const existingPlaka = await getPlakaById(id);
    
    if (!existingPlaka) {
      return res.status(404).json({
        success: false,
        error: 'Plaka bulunamadı'
      });
    }

    // Resmi sil
    const imagePath = path.join(__dirname, '../../', existingPlaka.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Database'den sil
    await deletePlaka(id);

    res.json({
      success: true,
      message: 'Plaka başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting plaka:', error);
    res.status(500).json({
      success: false,
      error: 'Plaka silinirken hata oluştu'
    });
  }
});

module.exports = router;
