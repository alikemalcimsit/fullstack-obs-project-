require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Route imports
const authRoutes = require('./routes/auth.routes');
const ogrenciRoutes = require('./routes/ogrenci.routes');
const ogretmenRoutes = require('./routes/ogretmen.routes');
const dersRoutes = require('./routes/ders.routes');
const duyuruRoutes = require('./routes/duyuru.routes');
const mesajRoutes = require('./routes/mesaj.routes');
const yoklamaRoutes = require('./routes/yoklama.routes');
const notRoutes = require('./routes/not.routes');
const bolumRoutes = require('./routes/bolum.routes');
const adminRoutes = require('./routes/admin.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Tüm origin'lere izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ogrenciler', ogrenciRoutes);
app.use('/api/ogretmenler', ogretmenRoutes);
app.use('/api/ogretmen', ogretmenRoutes); // Alternatif route
app.use('/api/dersler', dersRoutes);
app.use('/api/duyurular', duyuruRoutes);
app.use('/api/mesajlar', mesajRoutes);
app.use('/api/yoklama', yoklamaRoutes);
app.use('/api/notlar', notRoutes);
app.use('/api/bolumler', bolumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OBS API çalışıyor', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Öğrenci Bilgi Sistemi API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      ogrenciler: '/api/ogrenciler',
      ogretmenler: '/api/ogretmenler',
      dersler: '/api/dersler',
      duyurular: '/api/duyurular',
      mesajlar: '/api/mesajlar',
      yoklama: '/api/yoklama',
      notlar: '/api/notlar',
      bolumler: '/api/bolumler',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).json({ 
    error: 'Sunucu hatası', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎓 Öğrenci Bilgi Sistemi - Backend API                 ║
║   📍 Server: http://localhost:${PORT}                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
