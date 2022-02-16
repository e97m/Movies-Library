'use strict';

//require packages
require('dotenv').config();         // for separate the important variables
const express = require('express'); // server environment
const cors = require('cors');       // connect frontend with backend
const axios = require('axios');     // to import data from 3rd party API
const pg = require('pg');           // to use postgrss SQL database

//importing the database
const client = new pg.Client({                  // for localhost:::: const client = new pg.Client(process.env.DATABASE_URL);
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
        //some properties you can add instid of URL :
        // user: 'dbuser',
        // host: 'database.server.com',
        // database: 'mydb',
        // password: 'secretpassword',
        // port: 3211,  *** usually 5432***
})    

//declaring the app and the port
const PORT = process.env.PORT;
const app = express();   
app.use(cors());         
app.use(express.json())  // to convert data(fetched data for example) from JSON to normal

//creat websit pages
app.get('/', movieDataHandler);
app.get('/favorite', favorateHandler);
app.get('/trending', trendingHandler)
app.get('/search', searchHandler)
app.get('/popular', popularHandler)
app.get('/tv', tvDataHandler)
app.post('/addMovie', addMovieHandler)
app.get('/getMovie', getMoviedHandler)
app.get('/getMovie/:id', getMovieByIdHandler)
app.put('/updateMovie/:id/', updateMovieHandler)
app.delete('/deleteMovie/:id', deletMovieHandler)
app.use('*', notFoundHndler);
app.use(serverErrorHndler);


//construtor for main page
function Movies(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

//constructor for trending and search pages
function TrendMovies(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date
    this.poster_path = poster_path;
    this.overview = overview;
}

//constructor for popular page
function PopularMovies(id, original_title, release_date, poster_path, overview) {
    this.id = id;
    this.original_title = original_title;
    this.release_date = release_date
    this.poster_path = poster_path;
    this.overview = overview;
}

//constructor for tv page
function TvMovies(id, name, first_air_date, poster_path, overview) {
    this.id = id;
    this.name = name;
    this.first_air_date = first_air_date
    this.poster_path = poster_path;
    this.overview = overview;
}

//the data on main page
const movieData = require('./Movie Data/data.json');
function movieDataHandler(req, res) {
    let listOfMovies = [];
    let myMovie = new Movies(movieData.title, movieData.poster_path, movieData.overview)
    listOfMovies.push(myMovie)
    return res.status(200).json(listOfMovies);
}

//favorate page
function favorateHandler(req, res) {
    return res.status(200).send("Welcome to Favorite Page");
}

// the data on trending page
function trendingHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.APIKEY}&language=en-US`
    axios.get(url)
        .then(       // then is a promise that stop the inner finction untill the inner statements finished, but the compiler will compleat after the function untill it became ready
            (result) => {
                result.data.results.forEach(trendingMovies => {
                    let myMovie = new TrendMovies(trendingMovies.id, trendingMovies.title, trendingMovies.release_date, trendingMovies.poster_path, trendingMovies.overview)
                    listOfMovies.push(myMovie)
                })
                res.status(200).json(listOfMovies);
            })
        .catch((err) => { serverErrorHndler(err, req, res) });
}
//onther way to promise: asynce await: it stops the program untill thr inner function done
// try {
//    async function trendingHandler(req, res) {
//    let result = await result.data.results.forEach(trendingMovies => {
//                        let myMovie = new TrendMovies(trendingMovies.id, trendingMovies.title, trendingMovies.release_date, trendingMovies.poster_path, trendingMovies.overview)
//                        listOfMovies.push(myMovie)
//                    }
//    res.status(200).json(listOfMovies);
//    }
// }
// catch(error){
//    serverErrorHndler(err, req, res)
//}


//search page
function searchHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&language=en-US&query=The&page=2`
    axios.get(url)
        .then(
            (result) => {
                result.data.results.forEach(searchMovies => {
                    let myMovie = new TrendMovies(searchMovies.id, searchMovies.title, searchMovies.release_date, searchMovies.poster_path, searchMovies.overview)
                    listOfMovies.push(myMovie)
                })
                res.status(200).json(listOfMovies);
            })
        .catch((err) => { serverErrorHndler(err, req, res) });
}

// popular page
function popularHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.APIKEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`
    axios.get(url)
        .then(
            (result) => {
                result.data.results.forEach(popularMovies => {
                    let myMovie = new PopularMovies(popularMovies.id, popularMovies.original_title, popularMovies.release_date, popularMovies.poster_path, popularMovies.overview)
                    listOfMovies.push(myMovie)
                })
                res.status(200).json(listOfMovies);
            })
        .catch((err) => { serverErrorHndler(err, req, res) });
}

// tv page
function tvDataHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.APIKEY}&language=en-US&query=The&page=1`
    axios.get(url)
        .then(
            (result) => {
                result.data.results.forEach(tvMovies => {
                    let myMovie = new TvMovies(tvMovies.id, tvMovies.name, tvMovies.first_air_date, tvMovies.poster_path, tvMovies.overview)
                    listOfMovies.push(myMovie)
                })
                res.status(200).json(listOfMovies);
            })
        .catch((err) => { serverErrorHndler(err, req, res) });
}

//add movies request
function addMovieHandler(req, res) {
    let sql = `INSERT INTO moviestable(title, release_date, overview) VALUES ($1,$2,$3,$4) RETURNING *;`
    let values = [req.body.title || req.body.original_title || '', req.body.release_date || '', req.body.poster_path || '', req.body.overview || ''];
        // or 
        // let {title, original_title, release_date, overview} = req.body;  ***destructuring***
        // let values = [title || original_title || '', release_date || '', overview || ''];
    client.query(sql, values).then(data => {
        res.status(201).json(data.rows);  // or res.status(201).json(data.rows[0])
    }).catch(error => {
        serverErrorHndler(error, req, res)
    });
}

//get movies page
function getMoviedHandler(req, res) {
    let sql = `SELECT * FROM moviestable;`;
    client.query(sql).then(data => {
        res.status(200).json(data.rows);
    }).catch(error => {
        serverErrorHndler(error, req, res)
    });
}

//get movi by id request
function getMovieByIdHandler(req, res) {
    let movieid = req.params.id
    let sql = `SELECT * FROM moviestable WHERE id= ${movieid};`;
    client.query(sql).then(data => {
        res.status(200).json(data.rows)
    }).catch(error => {
        serverErrorHndler(error, req, res)
    });
}

//update all data by id request 
function updateMovieHandler(req, res) {
    const sql = `UPDATE moviestable SET title = $1, release_date = $2, overview = $3  WHERE id=$4 RETURNING *;`;
    let values = [req.body.title || req.body.original_title, req.body.release_date, req.body.overview, req.params.id]; // here you can control what parameters to update
        //or
        // let b = req.body
        // let values = [b.title || b.original_title, b.release_date, b.overview, req.params.id];
    client.query(sql, values).then(data => {
        res.status(200).json(data.rows);  // or res.status(204).json(data.rows);  becoause we dont want to send any thing to body
    }).catch(error => {
        serverErrorHndler(error, req, res)
    });
}

//delete by id request
function deletMovieHandler(req, res) {
    const movieid = req.params.id;
    const sql = `DELETE FROM moviestable WHERE id=${movieid};`
    client.query(sql).then(() => {
        res.status(200).send("The movie has been deleted");
    }).catch(error => {
        serverErrorHndler(error, req, res)
    });
}

//errores
function notFoundHndler(req, res) {
    return res.status(404).send("Not Found!!");
}
function serverErrorHndler(error, req, res) {
    let err = {
        status: 500,
        message: "Sorry, something went wrong"
    }
    return res.status(500).send(err);
}

//listining to the port and connect the database
client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('listining')
    })
})