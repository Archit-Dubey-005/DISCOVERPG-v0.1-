import db from "../../dataBase/db.js";
import imageService from "../Services/pg_image.storage.services.js";


// add images
async function addImage(req, res) {
  const { pgId } = req.params;
  const ownerId = req.owner.id;
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" 
        
    });
  }

console.log(ownerId)
console.log(req.file.originalname)
console.log(pgId)
console.log(req.file.buffer)


  db.execute(
    "SELECT id FROM pg_listings WHERE id = ? AND owner_id = ?",
    [pgId, ownerId],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (results.length === 0) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      try {
        const uploaded = await imageService.uploadImages(
          req.file.buffer,
          req.file.originalname,
          pgId
        );

        db.execute(
          "INSERT INTO pg_images ( pg_id,image_url,image_id) VALUES (?,?,?)",
          [ pgId,uploaded.url,uploaded.fileId],
          (err, result) => {
            if (err)
              return res.status(500).json({ message: "Image DB insert failed",
            err:err.message });

            res.status(201).json({
              message: "Image uploaded",
              imageId: result.insertId,
              url: uploaded.url,
            });
          }
        );
      } catch (error) {
        res.status(500).json({ message: "Image upload failed" ,
            error:error.message
        });
      }
    }
  );
}


// get pg images
function getImages(req, res) {
  const { pgId } = req.params;

  db.execute(
    "SELECT id, image_url FROM pg_images WHERE pg_id = ?",
    [pgId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.status(200).json(results);
    }
  );
}


// delete image
async function deleteImage(req, res) {
  const  {imageId }= req.params;
  const ownerId = req.owner.id;
  
console.log("ownerId:", ownerId);
console.log("imageId:", imageId);



  db.execute(
    `SELECT pi.image_id 
     FROM pg_images pi
     JOIN pg_listings pl ON pi.pg_id = pl.id
     WHERE pi.id = ? AND pl.owner_id = ?`,
    [imageId, ownerId],


    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" ,err:err.message});
console.log("DB results:", results);

      if (results.length === 0) {
        return res.status(403).json({ message: "Unauthorized" });
      } 

      const fileId = results[0].image_id;
      console.log(fileId)

      try {
        await imageService.deleteImage(fileId);

        db.execute(
          "DELETE FROM pg_images WHERE id = ?",
          [imageId],
          (err) => {
            if (err)
              return res.status(500).json({ message: "DB delete failed" });

            res.status(200).json({ message: "Image deleted" });
          }
        );
      } catch (error) {
        res.status(500).json({ message: "ImageKit delete failed",
            err:error.message
         });
      }
    }
  );
}

export default {
  addImage,
  getImages,
  deleteImage,
};
