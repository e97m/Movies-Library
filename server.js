'use strict';

//require packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

//declaring my port constant and the app
const PORT = process.env.PORT;
const app = express();
app.use(cors());

//creat websit pages
app.get('/', movieDataHandler);
app.get('/favorite', favorateHandler);
app.get('/trending', trendingHandler)
app.get('/search', searchHandler)
app.get('/popular', popularHandler)
app.get('/tv', tvDataHandler)
app.get('*', notFoundHndler);
app.get(serverErrorHndler);


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
function TrendMovies(id, original_title, release_date, poster_path, overview) {
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
    // let url=`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`   *** did not work ***
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=abb2fd3d9eb8c561dbf599a20e3ca490&language=en-US`
    axios.get(url)
        .then(
            (result) => {
                // console.log(result)   was done to know the imported arr
                result.data.results.forEach(trendingMovies => {
                    let myMovie = new TrendMovies(trendingMovies.id, trendingMovies.title, trendingMovies.release_date, trendingMovies.poster_path, trendingMovies.overview)
                    listOfMovies.push(myMovie)
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
        .catch((err) => { console.log(err) })
}

//search page
function searchHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/search/movie?api_key=abb2fd3d9eb8c561dbf599a20e3ca490&language=en-US&query=The&page=2`
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
        .catch((err) => { console.log(err) })
}

// popular page
function popularHandler(req, res) {
    let listOfMovies = [];
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=abb2fd3d9eb8c561dbf599a20e3ca490&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`
    axios.get(url)
        .then(
            (result) => {
                result.data.results.forEach(popularMovies => {
                    let myMovie = new TrendMovies(popularMovies.id, popularMovies.original_title, popularMovies.release_date, popularMovies.poster_path, popularMovies.overview)
                    listOfMovies.push(myMovie)
                }
                )
                res.status(200).json(listOfMovies);
            }
        )
        .catch((err) => { console.log(err) })
    }

    // tv page
    function tvDataHandler(req, res) {
        let listOfMovies = [];
        let url = `https://api.themoviedb.org/3/search/tv?api_key=abb2fd3d9eb8c561dbf599a20e3ca490&language=en-US&query=The&page=1`
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
            .catch((err) => { console.log(err) })
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

    //listining to the port
    app.listen(PORT, () => { console.log('listining') })