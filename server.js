'use strict';

//require packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pg = require('pg');

//declaring the app, the port, and the database
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json())

//creat websit pages
app.get('/', movieDataHandler);
app.get('/favorite', favorateHandler);
app.get('/trending', trendingHandler)
app.get('/search', searchHandler)
app.get('/popular', popularHandler)
app.get('/tv', tvDataHandler)
app.get('/getMovie', getMoviedHandler)
app.post('/addMovie', addMovieHandler)
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
        .then(
            (result) => {
                result.data.results.forEach(trendingMovies => {
                    let myMovie = new TrendMovies(trendingMovies.id, trendingMovies.title, trendingMovies.release_date, trendingMovies.poster_path, trendingMovies.overview)
                    listOfMovies.push(myMovie)
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
        .catch((err) => { serverErrorHndler(err, req, res) });
}

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
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
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
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
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
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
        .catch((err) => { serverErrorHndler(err, req, res) });
}

//add movies page
function addMovieHandler (req,res){
  let sql = `INSERT INTO moviesdb(title, release_date, overview) VALUES ($1,$2,$3) RETURNING *;`
  let values=[req.body.title || '', req.body.release_date || '', req.body.overview || ''];
  client.query(sql,values).then(data =>{
      res.status(200).json(data.rows);
  }).catch(error=>{
    serverErrorHndler(error,req,res)
  });
}

//get movies page
function getMoviedHandler (req,res){
    let sql = `SELECT * FROM moviesdb;`;
    client.query(sql).then(data=>{
       res.status(200).json(data.rows);
    }).catch(error=>{
        serverErrorHndler(error,req,res)
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