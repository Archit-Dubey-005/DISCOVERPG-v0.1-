import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" 
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./Routers/auth.register.js"
import pg_info_Routes from "./Routers/pg_info.router.js"
import pg_image_routes from "./Routers/pg_images.router.js"
import pg_reviews from "./Routers/reviews.router.js"
import pg_filters from "./Routers/filter.route.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// storing JWT as cookies
app.use(cookieParser())

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")))

// for cross platform operation with frontend and secure cookies
app.use(cors({
  origin: ["http://localhost:5500","http://127.0.0.1:5500","http://localhost:3100"],
  credentials: true
}));

app.use("/api/auth",authRoutes)

app.use("/api/pg_info",pg_info_Routes)

app.use("/api/pg_info/images",pg_image_routes)

app.use("/api/reviews",pg_reviews)

app.use("/api/filter",pg_filters)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

export default app;