import db from "../../dataBase/db.js";

//  pg info
async function createPgListing(req, res) {

const owner_id=req.owner.id

console.log(owner_id)
  const {
    
    name,
    address,
    city,
    area,
    type,
    rent,
    deposit,
    food_available,
    rules,
    accommodations,
    total_beds,
    vacant_beds,
    contact_phone,
  } = req.body;

  if ( !name || !type || !rent) {
    return res.status(400).json({
      message: " name, type and rent are required",
    });
  }

  const query = `
    INSERT INTO pg_listings 
    (owner_id, name, address, city, area, type, rent, deposit, food_available, rules, accommodations, total_beds, vacant_beds, contact_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.execute(
    query,
    [
      owner_id,
      name,
      address,
      city,
      area,
      type,
      rent,
      deposit,
      food_available || false,
      rules,
      accommodations,
      total_beds || 0,
      vacant_beds || 0,
      contact_phone,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error creating listing",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "PG listing created successfully",
        listingId: result.insertId,
      });
    }
  );
}


// show all pgs
async function getAllPgListings(req, res) {
  db.execute("SELECT * FROM pg_listings", (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching listings",
      });
    }

    return res.status(200).json(rows);
  });
}



// Get single pg
async function getPgListingById(req, res) {
  const { id } = req.params;

  db.execute(
    "SELECT * FROM pg_listings WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Error fetching listing",
        });
      }

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      return res.status(200).json(rows[0]);
    }
  );
}


// delete pg
async function deletePgListing(req, res) {
  const { id } = req.params;
const owner_id=req.owner.id
  db.execute(
    "DELETE FROM pg_listings WHERE id = ? AND owner_id=?",
    [id,owner_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error deleting listing",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }

      return res.status(200).json({
        message: "Listing deleted successfully",
      });
    }
  );
}


// update pg info
async function updatePg(req, res) {
  const { id } = req.params;
  const owner_id=req.owner.id

  const query = `
    UPDATE pg_listings SET ?
    WHERE id = ? AND owner_id=?
  `;

  db.query(query, [req.body, id,owner_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating PG" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PG not found" });
    }

    res.json({ message: "PG updated successfully" });
  });
}

export default {createPgListing,getAllPgListings,deletePgListing,getPgListingById,updatePg}