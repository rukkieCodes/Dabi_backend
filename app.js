require('dotenv').config();
const express = require('express')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser')
const Auth = require('./api/routes/auth');
const Template = require('./api/routes/template')
const Importations = require('./api/routes/importations')

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


app.use(morgan('dev'));

app.use('/auth', Auth);

app.use('/template', Template);

app.use('/import', Importations);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});

module.exports = app;