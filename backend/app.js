import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" 

import authRoutes from "./Routers/auth.register.js"
import pg_info_Routes from "./Routers/pg_info.router.js"
import pg_image_routes from "./Routers/pg_images.router.js"
import pg_reviews from "./Routers/reviews.router.js"
import pg_filters from "./Routers/filter.route.js"
const app = express()
app.use(express.json())

// storing JWT as cookies
app.use(cookieParser())

// for cross platform operation with frontend and secure cookies
app.use(cors({
  origin: "http://localhost:5500",
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