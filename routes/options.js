const express = require('express')
const router = express.Router()
const mysql     =    require('mysql');


const pool = require('../database/dbConnPool')


router.get('/getCategorie', function (req, res) {
 
    let selectQuery = 'SELECT * FROM ??';    
    let query = mysql.format(selectQuery,["categorie"]);

    pool.query(query,(err, data) => {

        if(err) {
            return res.status(500).send({type:err.errno, msg:err.message});
        }

        return res.send(data);
    });
});

router.get('/getProdotti', function (req, res) {
 
    let selectQuery = 'SELECT * FROM ??';    
    let query = mysql.format(selectQuery,["prodotti"]);

    pool.query(query,(err, data) => {

        if(err) {
            return res.status(500).send({type:err.errno, msg:err.message});
        }

        return res.send(data);
    });

});

router.get('/getServizi', function (req, res) {
 
    let selectQuery = 'SELECT * FROM ??';    
    let query = mysql.format(selectQuery,["servizi"]);

    pool.query(query,(err, data) => {

        if(err) {
            return res.status(500).send({type:err.errno, msg:err.message});
        }

        return res.send(data);
    });

});

router.get('/getToponimi', function (req, res) {
 
    let selectQuery = 'SELECT * FROM ??';    
    let query = mysql.format(selectQuery,["toponimi"]);

    pool.query(query,(err, data) => {

        if(err) {
            return res.status(500).send({type:err.errno, msg:err.message});
        }

        return res.send(data);
    });

});


module.exports = router;