import "dotenv/config";
import db from "../../dataBase/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {OAuth2Client} from "google-auth-library"



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)


// Registering users
function RegisterUser(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
        });
      }

      if (rows.length > 0) {
        const user = rows[0];

        if (user.google_id && !user.password) {
          return res.status(400).json({
            message:
              "This email is registered with Google. Please continue with Google.",
          });
        }

        return res.status(400).json({
          message: "User already exists",
        });
      }

     
      bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) {
          return res.status(500).json({
            message: "Error hashing password",
          });
        }

        db.execute(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [username, email, hash],
          (insertErr, result) => {
            if (insertErr) {
              return res.status(500).json({
                message: "Error inserting user",
                err: insertErr.message,
              });
            }

            const token = jwt.sign(
              { id: result.insertId ,role:"User"},
              process.env.JWT_SECRET,
              { expiresIn: "3d" }
            );

            res.cookie("token", token);

            return res.status(201).json({
              message: "Registered successfully",
            });
          }
        );
      });
    }
  );
}



// Login Users
function LoginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          message: "Server error",
          err: err.message,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      bcrypt.compare(password, rows[0].password, (compareErr, isMatch) => {

        if (compareErr) {
          return res.status(500).json({
            message: "Error comparing passwords",
            err: compareErr.message,
          });
        }

        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid credentials",
          });
        }

        const token = jwt.sign(
          { id: rows[0].id,role:"User" },
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );

        res.cookie("token", token);

        return res.status(200).json({
          message: `Welcome back ${rows[0].name}`,
        });
      });
    }
  );
}



//Google log in





async function GoogleRegister(req,res){

    const token=req.body.token;
console.log(req.body.token)
if(!token){
     return res.status(400).json({
      message: "Google token required",
    });
}

try{

const ticket = await client.verifyIdToken({
    idToken:token,
    audience:process.env.GOOGLE_CLIENT_ID
})
  

    const payload = ticket.getPayload();

 if (!payload.email_verified) {
      return res.status(400).json({
        message: "Google email not verified",
      });
    }




    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
db.execute("select * from users where email=?",[email],(err,result)=>{


     if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }
   

 if(result.length>0){
const user=result[0]

if(!user.google_id){
    db.execute("update users set google_id=? where email=?",[googleId,email],(err)=>{
        if (err) {
                  return res.status(500).json({
                    message: "Error linking account",
                  });
                }

const token = jwt.sign(
    { id: user.id ,role:"User"},
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res.cookie("token", token);

  return res.status(200).json({
    message: "Authentication successful",
  });





    })
}else{
    const token = jwt.sign(
    { id: user.id,role:"User" },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res.cookie("token", token);

  return res.status(200).json({
    message: "Authentication successful",
  });
}







    }else{
        console.log(name,email,googleId)
db.execute(
          "INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)",
          [name, email, googleId],
          
          (insertErr, insertResult) => {
            if (insertErr) {
              return res.status(500).json({
                message: "Error creating user",
                err:insertErr.message
              });
            }

            const jwtToken = jwt.sign(
              { id: insertResult.insertId ,role:"User"},
              process.env.JWT_SECRET,
              { expiresIn: "3d" }
            );

            res.cookie("token", jwtToken);

            return res.status(201).json({
              message: "Google account created and logged in",
            });
          }
        );


    }

})
}
catch(err){
    console.log(err)
return res.status(401).json({
      message: "Invalid Google token",

    });
}
}


/*
Below is owner register and login
 */






// Registering owners
function RegisterOwner(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  db.execute(
    "SELECT * FROM owners WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
        });
      }

      if (rows.length > 0) {
        const user = rows[0];

        if (user.google_id && !user.password) {
          return res.status(400).json({
            message:
              "This email is registered with Google. Please continue with Google.",
          });
        }

        return res.status(400).json({
          message: "User already exists",
        });
      }

      bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) {
          return res.status(500).json({
            message: "Error hashing password",
          });
        }

        db.execute(
          "INSERT INTO owners (name, email, password) VALUES (?, ?, ?)",
          [username, email, hash],
          (insertErr, result) => {
            if (insertErr) {
              return res.status(500).json({
                message: "Error inserting user",
                err: insertErr.message,
              });
            }

            const token = jwt.sign(
              { id: result.insertId ,role:"Owner"},
              process.env.JWT_SECRET,
              { expiresIn: "3d" }
            );

            res.cookie("token", token);

            return res.status(201).json({
              message: "Registered successfully",
            });
          }
        );
      });
    }
  );
}



// Login Owners
function LoginOwner(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  db.execute(
    "SELECT * FROM owners WHERE email = ?",
    [email],
    (err, rows) => {

      if (err) {
        return res.status(500).json({
          message: "Server error",
          err: err.message,
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      bcrypt.compare(password, rows[0].password, (compareErr, isMatch) => {

        if (compareErr) {
          return res.status(500).json({
            message: "Error comparing passwords",
            err: compareErr.message,
          });
        }

        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid credentials",
          });
        }

        const token = jwt.sign(
          { id: rows[0].id ,role:"Owner"},
          process.env.JWT_SECRET,
          { expiresIn: "3d" }
        );

        res.cookie("token", token);

        return res.status(200).json({
          message: `Welcome back ${rows[0].name}`,
        });
      });
    }
  );
}



//Google log in for owners





async function GoogleRegisterOwner(req,res){

    const token=req.body.token;
console.log(req.body.token)
if(!token){
     return res.status(400).json({
      message: "Google token required",
    });
}

try{

const ticket = await client.verifyIdToken({
    idToken:token,
    audience:process.env.GOOGLE_CLIENT_ID
})
  

    const payload = ticket.getPayload();

 if (!payload.email_verified) {
      return res.status(400).json({
        message: "Google email not verified",
      });
    }




    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
db.execute("select * from owners where email=?",[email],(err,result)=>{


     if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }
   

 if(result.length>0){
const user=result[0]

if(!user.google_id){
    db.execute("update owners set google_id=? where email=?",[googleId,email],(err)=>{
        if (err) {
                  return res.status(500).json({
                    message: "Error linking account",
                  });
                }

const token = jwt.sign(
    { id: user.id ,role:"Owner"},
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res.cookie("token", token);

  return res.status(200).json({
    message: "Authentication successful",
  });





    })
}else{
    
    const token = jwt.sign(
    { id: user.id ,role:"Owner"},
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  res.cookie("token", token);

  return res.status(200).json({
    message: "Authentication successful",
  });
}







    }else{
        console.log(name,email,googleId)
db.execute(
          "INSERT INTO owners (name, email, google_id) VALUES (?, ?, ?)",
          [name, email, googleId],
          
          (insertErr, insertResult) => {
            if (insertErr) {
              return res.status(500).json({
                message: "Error creating user",
                err:insertErr.message
              });
            }

            const jwtToken = jwt.sign(
              { id: insertResult.insertId ,role:"Owner"},
              process.env.JWT_SECRET,
              { expiresIn: "3d" }
            );

            res.cookie("token", jwtToken);

            return res.status(201).json({
              message: "Google account created and logged in",
            });
          }
        );


    }

       






})
    







}
catch(err){
    console.log(err)
return res.status(401).json({
      message: "Invalid Google token",

    });
}








}
















































export default { RegisterUser, LoginUser,GoogleRegister,RegisterOwner, LoginOwner,GoogleRegisterOwner };
