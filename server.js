const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const apiRouter = require('./api/api');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json()); // all information is being parsed as json
app.use(cors());            // allows other domains to make request to our web api (security)
app.use(morgan('dev'));     // login purposes, logs, requests made

app.use('/api', apiRouter); // other server code, set our paths with /api
app.use(errorHandler());    // good practice to leave at the end/bottom

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;