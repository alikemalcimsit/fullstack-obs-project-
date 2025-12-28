const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

// .env dosyasını yükle
dotenv.config()

// Yeni Route'lar
const authRoutes = require("./routes/auth")
const ogrenciRoutes = require("./routes/ogrenci")
const bolumRoutes = require("./routes/bolum")
const dersRoutes = require("./routes/ders")
const mesajRoutes = require("./routes/mesaj")
const duyuruRoutes = require("./routes/duyuru")
const yoklamaRoutes = require("./routes/yoklama")
const ogretmenRoutes = require("./routes/ogretmen")
const notlarRoutes = require("./routes/notlar")
const adminRoutes = require("./routes/admin")

const app = express()

// CORS - Tüm URL'lere izin ver
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
)

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cookieParser())

// =====================================================
// YENİ API ROUTE'LARI (/api prefix'li)
// =====================================================
app.use("/api/auth", authRoutes)
app.use("/api/ogrenciler", ogrenciRoutes)
app.use("/api/bolumler", bolumRoutes)
app.use("/api/dersler", dersRoutes)
app.use("/api/mesajlar", mesajRoutes)
app.use("/api/duyurular", duyuruRoutes)
app.use("/api/yoklama", yoklamaRoutes)
app.use("/api/ogretmen", ogretmenRoutes)
app.use("/api/notlar", notlarRoutes)
app.use("/api/admin", adminRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("server is running on port : ", PORT)
})