const express = require('express')
const router = express.Router()
const mysql = require('mysql');


const pool = require('../database/dbConnPool')


router.post('/registraAzienda', function (req, res) {

  let azienda = req.body.azienda;

  let insertQuery = 'INSERT INTO ?? (??,??) VALUES (?,?)';

  let query = mysql.format(insertQuery, ["aziende", "nome", "indirizzo", azienda.nome, azienda.toponimo + " " + azienda.indirizzo + " " + azienda.civico]);

  pool.query(query, (err, response) => {

    if (err) {

      if (err.errno == 1062) {
        return res.status(500).send({ type: "input", msg: "Nome azienda gia inserito" });
      }
      return res.status(500).send({ type: err.code, msg: err.message })
    }


    var categorie = [];
    var prodotti = [];
    var servizi = [];

    azienda.categorie.forEach(categoria => {
      categorie.push([response.insertId, categoria])
    });

    azienda.prodotti.forEach(prodotto => {
      prodotti.push([response.insertId, prodotto])
    });

    azienda.servizi.forEach(servizio => {
      servizi.push([response.insertId, servizio])
    });

    let insertCat = 'INSERT INTO aziende_categorie (id_azienda,categoria) VALUES ?';
    let insertProd = 'INSERT INTO aziende_prodotti (id_azienda,prodotto) VALUES ?';
    let insertServ = 'INSERT INTO aziende_servizi (id_azienda,servizio) VALUES ?';

    let queryCat = mysql.format(insertCat, [categorie]);
    let queryProd = mysql.format(insertProd, [prodotti]);
    let queryServ = mysql.format(insertServ, [servizi]);

    // pool.config.multipleStatements = true;


    insertOptions(queryCat, function (err, resp) {

      if (err) {
        if (err.errno != 1064)
          return res.status(500).send({ type: err.code, msg: err.message })
      }

      insertOptions(queryProd, function (err, resp) {

        if (err) {
          if (err.errno != 1064)
            return res.status(500).send({ type: err.code, msg: err.message })
        }

        insertOptions(queryServ, function (err, resp) {

          if (err) {
            if (err.errno != 1064) {
              return res.status(500).send({ type: err.code, msg: err.message })
            }
          }

          return res.json("Azienda inserita correttamente");

        })

      })
    })


    // return res.json("Azienda inserita correttamente");

  });


});

function insertOptions(query, callback) {

  pool.query(query, (err, response) => {

    if (err) {
      return callback(err, null)
    }

    return callback(null, response)
  });
}

router.post('/cercaAziendaByCatProdServ', function (req, res) {

  let baseCat = 'SELECT  DISTINCT aziende.*, aziende_categorie.* FROM  aziende, aziende_categorie WHERE (aziende.id = aziende_categorie.id_azienda) AND '
  let optionsCat = []

  let baseProd = 'SELECT  DISTINCT aziende.*, aziende_prodotti.* FROM  aziende, aziende_prodotti WHERE (aziende.id = aziende_prodotti.id_azienda) AND '
  let optionsProd = []

  let baseServ = 'SELECT  DISTINCT aziende.*, aziende_servizi.* FROM  aziende, aziende_servizi WHERE (aziende.id = aziende_servizi.id_azienda) AND '
  let optionsServ = []

  let order = 'ORDER BY nome'

  if (req.body.filtri.categorie.length <= 0)
    req.body.filtri.categorie.push(null)

  if (req.body.filtri.prodotti.length <= 0)
    req.body.filtri.prodotti.push(null)

  if (req.body.filtri.servizi.length <= 0)
    req.body.filtri.servizi.push(null)

  req.body.filtri.categorie.forEach((element, index, arr) => {
    optionsCat.push("aziende_categorie.categoria = ?")
  });

  req.body.filtri.prodotti.forEach((element, index, arr) => {
    optionsProd.push("aziende_prodotti.prodotto = ?")
  });

  req.body.filtri.servizi.forEach((element, index, arr) => {
    optionsServ.push("aziende_servizi.servizio = ?")
  });

  let selectQueryCat = baseCat + "(" + optionsCat.join(" OR ") + ")" + order;
  let selectQueryProd = baseProd + "(" + optionsProd.join(" OR ") + ")" + order;
  let selectQueryServ = baseServ + "(" + optionsServ.join(" OR ") + ")" + order;

  let queryCat = mysql.format(selectQueryCat, req.body.filtri.categorie);
  let queryProd = mysql.format(selectQueryProd, req.body.filtri.prodotti);
  let queryServ = mysql.format(selectQueryServ, req.body.filtri.servizi);

  // console.log(queryCat)
  // console.log(queryProd)
  // console.log(queryServ)

  let filtri = [];


  req.body.filtri.categorie.forEach(element => {
    filtri.push({ categoria: element, aziende: [] })
  });

  req.body.filtri.prodotti.forEach(element => {
    filtri.push({ prodotto: element, aziende: [] })
  });

  req.body.filtri.servizi.forEach(element => {
    filtri.push({ servizio: element, aziende: [] })
  });

  getBy(queryCat, function (err, resp) {

    if (err) { if (err.errno != 1064) return res.status(500).send({ type: err.code, msg: err.message }) }

    resp.forEach(azienda => {
      filtri.forEach(filtro => {
        if (filtro.categoria == azienda.categoria) {
          filtro.aziende.push(azienda)
        }
      });
    });

    getBy(queryProd, function (err, resp) {

      if (err) { if (err.errno != 1064) return res.status(500).send({ type: err.code, msg: err.message }) }

      resp.forEach(azienda => {
        filtri.forEach(filtro => {
          if (filtro.prodotto == azienda.prodotto) {
            filtro.aziende.push(azienda)
          }
        });
      });

      getBy(queryServ, function (err, resp) {

        if (err) { if (err.errno != 1064) return res.status(500).send({ type: err.code, msg: err.message }) }

        resp.forEach(azienda => {
          filtri.forEach(filtro => {
            if (filtro.servizio == azienda.servizio) {
              filtro.aziende.push(azienda)
            }
          });
        });

        return res.send(filtri)

      });


    });

  });


})

function getBy(query, callback) {

  pool.query(query, (err, response) => {

    if (err) {
      return callback(err, null)
    }

    return callback(null, response)
  });
}


module.exports = router;