----- DATABASE-- 
-- CREATE DATABASE IF NOT EXISTS pg_finder_db;
-- USE pg_finder_db;

-- -- USERS --

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(150) UNIQUE,
--     phone VARCHAR(20),

--     google_id VARCHAR(255) UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );



-- -- OWNERS-- 
-- CREATE TABLE owners (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(150),
--     phone VARCHAR(20),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );




-- -- PG LISTINGS--
-- CREATE TABLE pg_listings (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     owner_id INT NOT NULL,
--     name VARCHAR(150) NOT NULL,
--     address TEXT,
--     city VARCHAR(100),
--     area VARCHAR(100),
--     type ENUM('boys','girls','flat') NOT NULL,
--     rent DECIMAL(10,2) NOT NULL,
--     deposit DECIMAL(10,2),
--     food_available BOOLEAN DEFAULT FALSE,
--     rules TEXT,
--     accommodations TEXT,
--     total_beds INT DEFAULT 0,
--     vacant_beds INT DEFAULT 0,
--     rating DECIMAL(2,1) DEFAULT 0,
--     contact_phone VARCHAR(20),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
-- );



-- -- REVIEWS (Students Reviews) --
-- CREATE TABLE reviews (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     pg_id INT NOT NULL,
--     rating INT CHECK (rating BETWEEN 1 AND 5),
--     comment TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (pg_id) REFERENCES pg_listings(id) ON DELETE CASCADE
-- );


-- -- BOOKINGS -- 
-- CREATE TABLE bookings (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_name VARCHAR(100) NOT NULL,
--     user_phone VARCHAR(20) NOT NULL,
--     pg_id INT NOT NULL,
--     owner_id INT NOT NULL,
--     request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('pending','approved','rejected') DEFAULT 'pending',
--     owner_response_time TIMESTAMP NULL,
--     FOREIGN KEY (pg_id) REFERENCES pg_listings(id) ON DELETE CASCADE,
--     FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
-- );


-- -- PG IMAGES -- 
-- CREATE TABLE pg_images (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     pg_id INT NOT NULL,
--     image_url TEXT NOT NULL,
--     FOREIGN KEY (pg_id) REFERENCES pg_listings(id) ON DELETE CASCADE
-- );


-- -- BASIC INDEXES (Performance) --
-- CREATE INDEX idx_pg_city ON pg_listings(city);
-- CREATE INDEX idx_pg_area ON pg_listings(area);
-- CREATE INDEX idx_pg_rent ON pg_listings(rent);
-- CREATE INDEX idx_pg_type ON pg_listings(type);


-----------------------------------------------------------------------------------------

-- ----------------------------------DELETE ALL THE CONTENTS BELOW BEFORE PUBLISHING-----------------------------------------------------
-- modifications i did --

-- ALTER TABLE users
-- RENAME COLUMN phone TO password;
-- ALTER TABLE users 
-- MODIFY password TEXT NOT NULL;
-- ALTER TABLE users 
-- MODIFY password VARCHAR(255) NULL;

-- ALTER TABLE users 
-- MODIFY google_id VARCHAR(255) UNIQUE NULL;

-- ALTER TABLE users MODIFY password VARCHAR(255) NULL;

-- ALTER TABLE owners
-- RENAME COLUMN phone TO password;
-- ALTER TABLE owners
-- ADD COLUMN google_id VARCHAR(255) UNIQUE NULL;
 -- ALTER TABLE owners MODIFY password VARCHAR(255) NULL;
--  alter table pg_images add column  image_id text not null;
-- select * from  pg_listings;
--  select * from  owners;
--   truncate pg_images;
-- select * from reviews 
-- select * from pg_images;
-- SELECT pi.image_id 
-- --      FROM pg_images pi
-- --      JOIN pg_listings pl ON pi.pg_id = pl.id
-- --    WHERE pi.id =7 AND pl.owner_id = 1

------------------------------------------------------------------------------------------

-- ---playground to check the working------


-- SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE pg_images;
-- TRUNCATE TABLE reviews;
-- TRUNCATE TABLE bookings;
-- TRUNCATE TABLE pg_listings;
-- TRUNCATE TABLE owners;
-- TRUNCATE TABLE users;

-- SET FOREIGN_KEY_CHECKS = 1;

-- -- =====================================
-- -- USERS
-- -- =====================================

-- INSERT INTO users (name, email, password, google_id) VALUES
-- ('Aman Gupta', 'aman@gmail.com', 'pass1', NULL),
-- ('Riya Sharma', 'riya@gmail.com', 'pass2', NULL),
-- ('Karan Mehta', 'karan@gmail.com', NULL, 'google_karan'),
-- ('Sneha Jain', 'sneha@gmail.com', 'pass4', NULL),
-- ('Rahul Verma', 'rahul@gmail.com', NULL, 'google_rahul');

-- -- =====================================
-- -- OWNERS
-- -- =====================================

-- INSERT INTO owners (name, email, password, google_id) VALUES
-- ('Rajesh Malhotra', 'rajesh@owner.com', 'owner1', NULL),
-- ('Pooja Kapoor', 'pooja@owner.com', 'owner2', NULL),
-- ('Vikram Singh', 'vikram@owner.com', NULL, 'google_owner');

-- -- =====================================
-- -- PG LISTINGS
-- -- =====================================

-- INSERT INTO pg_listings
-- (owner_id, name, address, city, area, type, rent, deposit, food_available, rules, accommodations, total_beds, vacant_beds, rating, contact_phone)
-- VALUES

-- (1, 'Sunrise Boys PG', 'Rohini Sector 5', 'Delhi', 'Rohini', 'boys', 8000, 5000, TRUE,
-- 'No smoking', 'WiFi, Laundry, AC', 20, 5, 4.2, '9876543210'),

-- (1, 'Royal Girls Residency', 'Karol Bagh Main Road', 'Delhi', 'Karol Bagh', 'girls', 10000, 6000, TRUE,
-- 'No visitors after 9PM', 'AC, Food, WiFi', 18, 6, 4.5, '9876543222'),

-- (2, 'Comfort Stay PG', 'MG Road', 'Bangalore', 'Indiranagar', 'boys', 12000, 8000, TRUE,
-- 'No alcohol', 'AC, Gym, WiFi', 25, 7, 4.7, '9123456780'),

-- (2, 'Happy Homes PG', 'HSR Layout', 'Bangalore', 'HSR', 'girls', 11000, 7000, FALSE,
-- 'Entry before 9PM', 'WiFi, Laundry', 15, 3, 4.0, '9123456781'),

-- (3, 'Urban Flat Sharing', 'Andheri East', 'Mumbai', 'Andheri', 'flat', 15000, 10000, FALSE,
-- 'Couples allowed', 'Furnished Flat, Kitchen', 6, 1, 4.8, '9988776655');

-- -- =====================================
-- -- REVIEWS
-- -- =====================================

-- INSERT INTO reviews (user_id, pg_id, rating, comment) VALUES
-- (1, 1, 4, 'Good stay overall'),
-- (2, 1, 5, 'Very clean and safe'),
-- (3, 2, 4, 'Nice for girls'),
-- (4, 3, 5, 'Best PG in Bangalore'),
-- (5, 5, 5, 'Perfect flat sharing experience');

-- -- =====================================
-- -- BOOKINGS
-- -- =====================================

-- INSERT INTO bookings (user_name, user_phone, pg_id, owner_id, status) VALUES
-- ('Aman Gupta', '9999999991', 1, 1, 'pending'),
-- ('Riya Sharma', '9999999992', 2, 1, 'approved'),
-- ('Karan Mehta', '9999999993', 3, 2, 'pending'),
-- ('Sneha Jain', '9999999994', 4, 2, 'rejected'),
-- ('Rahul Verma', '9999999995', 5, 3, 'approved');

-- -- =====================================
-- -- PG IMAGES
-- -- =====================================

-- INSERT INTO pg_images (pg_id, image_url, image_id) VALUES
-- (1, 'https://example.com/pg1_1.jpg', 'img_pg1_1'),
-- (1, 'https://example.com/pg1_2.jpg', 'img_pg1_2'),
-- (2, 'https://example.com/pg2_1.jpg', 'img_pg2_1'),
-- (3, 'https://example.com/pg3_1.jpg', 'img_pg3_1'),
-- (4, 'https://example.com/pg4_1.jpg', 'img_pg4_1'),
-- (5, 'https://example.com/pg5_1.jpg', 'img_pg5_1');

-- select * from pg_listings;
--   SELECT r.user_id, r.rating, r.comment, r.created_at, u.name
--     FROM reviews r
--     JOIN users u ON r.user_id = u.id
--     WHERE r.pg_id = 1
    
 --  SET FOREIGN_KEY_CHECKS = 0;

--  TRUNCATE TABLE pg_images;
--  TRUNCATE TABLE reviews;
-- TRUNCATE TABLE bookings;
-- TRUNCATE TABLE pg_listings;
-- TRUNCATE TABLE owners;
-- TRUNCATE TABLE users;

