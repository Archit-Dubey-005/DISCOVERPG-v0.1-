import "dotenv/config"
import db from "../../dataBase/db.js"

//filter the pgs by string concatenation of sql queries
function getFilteredPgs(req, res) {
  const { city, area, type, minRent, maxRent } = req.query;

  let query = `SELECT * FROM pg_listings WHERE 1=1`;
  const values = [];

  if (city) {
    query += ` AND city = ?`;
    values.push(city);
  }

  if (area) {
    query += ` AND area = ?`;
    values.push(area);
  }

  if (type) {
    query += ` AND type = ?`;
    values.push(type);
  }

  if (minRent) {
    query += ` AND rent >= ?`;
    values.push(minRent);
  }

  if (maxRent) {
    query += ` AND rent <= ?`;
    values.push(maxRent);
  }

  db.execute(query, values, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.json(rows);
  });
}

export default {getFilteredPgs}