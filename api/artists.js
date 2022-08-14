const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id = $artistId`, {
        $artistId: artistId
    }, (error, artist) => {
        if (error) {
            next(error);
        } else if (artist) {
            req.artist = artist;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

artistsRouter.get('/', (req, res, next) => {    // /artists
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, artists) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    const artistToCreate = req.body.artist;
    const isCurrentlyEmployed = artistToCreate.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!artistToCreate.name || !artistToCreate.dateOfBirth || !artistToCreate.biography) {
        return res.sendStatus(400);
    }

    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
    VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`, {
        $name: artistToCreate.name,
        $dateOfBirth: artistToCreate.dateOfBirth,
        $biography: artistToCreate.biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    }, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {
                if (error) {
                    next(error);
                }
                res.status(201).json({artist: artist});
            });
        }
    });
});

artistsRouter.put('/:artistId', (req, res, next) => {
    const artistToCreate = req.body.artist;

    if (!artistToCreate.name || !artistToCreate.dateOfBirth || !artistToCreate.biography) {
        return res.sendStatus(400);
    }

    db.run(`UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography,
    is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId`, {
        $name: artistToCreate.name,
        $dateOfBirth: artistToCreate.dateOfBirth,
        $biography: artistToCreate.biography,
        $isCurrentlyEmployed: artistToCreate.isCurrentlyEmployed,
        $artistId: req.params.artistId
    }, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (error, artist) => {
                if (error) {
                    next(error);
                }
                res.status(200).json({artist: artist});
            });
        }
    });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId`, {
        $artistId: req.params.artistId
    }, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (error, artist) => {
                if (error) {
                    next(error);
                }
                res.status(200).json({artist: artist});
            });
        }
    });
});

module.exports = artistsRouter;