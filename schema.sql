DROP TABLE IF EXISTS moviesDB;

CREATE TABLE IF NOT EXISTS moviesDB (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    release_date VARCHAR(255),
    overview VARCHAR(1000)

);