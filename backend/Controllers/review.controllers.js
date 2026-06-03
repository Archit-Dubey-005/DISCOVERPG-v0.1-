import "dotenv/config"
import db from "../../database/db.js";

function createReview(req, res) {
  const userId = req.user.id;
  console.log(userId)
  const { rating, comment } = req.body;
  const { pgId } = req.params;
  console.log(pgId)

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const query = `
    INSERT INTO reviews (user_id, pg_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.execute(query, [userId, pgId, rating, comment], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(201).json({ message: "Review added successfully" });
  });
}





function getReviewsByPg(req, res) {
  const { pgId } = req.params;

  const query = `
    SELECT r.user_id, r.rating, r.comment, r.created_at, u.name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.pg_id = ?
  `;

  db.execute(query, [pgId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(rows);
  });
}


export default {getReviewsByPg,createReview}