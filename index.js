const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser");
const db = require("./db");
const path = require("path");
const fs = require("fs");

const app = express()

app.use(bodyParser.json());

app.set("view engine","ejs")

app.get("/", (req,res) => {
  res.render("index", {
    replsPinged: db.abbreviate(db.replsPinged,2),
    alive: Math.floor(db.percent(db.alive, db.replsPinged)),
    totalPinged: db.abbreviate(db.dbdata.total,2)
  })
})

app.get("/@:user/:repl", (req,res) => {
  try {
    let data = db.dbdata.ping[req.params.user][req.params.repl]
    res.render("analytic", {
      data: data,
      user: req.params.user,
      repl: req.params.repl
    })
    return
  } catch(e) {
    res.redirect("/")
    return
  }
})

app.use(express.static(path.join(__dirname, "public/")))

require("./api")(app)




app.use(function(req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

setInterval(() => {
  db.pingAll()
}, 5000)

app.listen(3000, () => {
  console.log("listening on port 3000");
})