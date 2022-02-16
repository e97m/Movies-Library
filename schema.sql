DROP TABLE IF EXISTS moviestable;

CREATE TABLE IF NOT EXISTS moviestable (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    release_date VARCHAR(255),
    poster_path VARCHAR (255),
    overview VARCHAR(1000)

);