DROP TABLE IF EXISTS moviesdb;

CREATE TABLE IF NOT EXISTS moviesdb (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    release_date VARCHAR(255),
    overview VARCHAR(1000)

);