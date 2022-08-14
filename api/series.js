const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = `SELECT * FROM Series WHERE id = $seriesId`;
    const values = {$seriesId: seriesId};
    db.get(sql, values, (error, series) => {
        if (error) {
            next(error);
        } else if (series) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`, (error, series) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({series: series});
        }
    });
}); 

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const seriesToCreate = req.body.series;

    if (!seriesToCreate.name || !seriesToCreate.description) {
        return res.sendStatus(400);
    }
    db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`, {
        $name: seriesToCreate.name,
        $description: seriesToCreate.description
    }, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({series: series});
                }
            });
        }
    });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const seriesToCreate = req.body.series;

    if (!seriesToCreate.name || !seriesToCreate.description) {
        return res.sendStatus(400);
    }
    db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $seriesId`, {
        $name: seriesToCreate.name,
        $description: seriesToCreate.description,
        $seriesId: req.params.seriesId
    }, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (error,series) => {
                if (error) {
                    next(error);
                }
                res.status(200).json({series: series});
            });
        }
    });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = `SELECT * FROM Issue WHERE series_id = $seriesId`;
    const issueValues = {$seriesId: req.params.seriesId};

    db.get(issueSql, issueValues, (error, issue) => {
        if (error) {
            next(error);
        } else if (issue) {
            res.sendStatus(400);
        } else {
            const sql = `DELETE FROM Series WHERE id = $seriesId`;
            const values = {$seriesId: req.params.seriesId};

            db.run(sql, values, function(error) {
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = seriesRouter;