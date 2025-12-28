const express = require('express')
const prisma = require('../config/database')

const router = express.Router()

// Bölüme ait öğrenci sayısı ve ortalama AGNO (fonksiyonlar üzerinden)
router.get('/bolum/:bolumId', async (req, res) => {
  const bolumId = parseInt(req.params.bolumId, 10)
  if (Number.isNaN(bolumId)) {
    return res.status(400).json({ error: 'Geçersiz bolumId' })
  }

  try {
    const [row] = await prisma.$queryRaw`SELECT dbo.BolumdekiOgrenciSayisi(${bolumId}) AS ogrenciSayisi, dbo.OrtalamaAGNOBolum(${bolumId}) AS ortalamaAgno`
    return res.json({ bolumId, ogrenciSayisi: row?.ogrenciSayisi ?? 0, ortalamaAgno: row?.ortalamaAgno ?? 0 })
  } catch (err) {
    console.error('Bolum stats hata:', err)
    return res.status(500).json({ error: 'İç hata', detail: process.env.NODE_ENV === 'development' ? err.message : undefined })
  }
})

// Döneme ait ders sayısı (fonksiyon üzerinden)
router.get('/donem/:donemId/ders-sayisi', async (req, res) => {
  const donemId = parseInt(req.params.donemId, 10)
  if (Number.isNaN(donemId)) {
    return res.status(400).json({ error: 'Geçersiz donemId' })
  }

  try {
    const [row] = await prisma.$queryRaw`SELECT dbo.DonemdekiDersSayisi(${donemId}) AS dersSayisi`
    return res.json({ donemId, dersSayisi: row?.dersSayisi ?? 0 })
  } catch (err) {
    console.error('Donem ders sayısı hata:', err)
    return res.status(500).json({ error: 'İç hata', detail: process.env.NODE_ENV === 'development' ? err.message : undefined })
  }
})

module.exports = router
