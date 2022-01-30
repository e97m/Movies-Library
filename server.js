const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const movieData = require('./Movie Data/data.json');

app.get('/', movieDataHandler);
app.get('/favorite', favorateHandler);
app.get('*', notFoundHndler);
app.get('error', serverErrorHndler);    //not sure about this


//construtor
function Movies(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

function movieDataHandler(req, res) {
    let listOfMovies = [];
        let movie1 = new Movies(movieData.title, movieData.poster_path, movieData.overview)
        listOfMovies.push(movie1)
    console.log(listOfMovies)
    return res.status(200).json(listOfMovies);
}

function favorateHandler(req, res) {
    return res.status(200).send("Welcome to Favorite Page");
}

function notFoundHndler(req, res) {
    return res.status(404).send("Not Found!!");
}

function serverErrorHndler(req, res) {
    return res.status(500).send("Sorry, something went wrong");
}

app.listen(8080, ()=>{})