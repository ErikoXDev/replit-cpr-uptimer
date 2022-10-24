
const db = require("./db")


module.exports = function(app){

  app.post('/api/repl', function(req, res){
    let action = req.body.action || " "
    let url = req.body.url || " "
    if (action == "add") {
      let url = req.body.url
      let [repl, owner] = db.getReplData(url)
      if (repl == "") {
        res.status(400).json({ success: false, message: "Malformed URL" })
        return
      } else {
        if (!db.dbdata.ping[owner]) db.dbdata.ping[owner] = {}
        if (db.dbdata.ping[owner][repl]) {
          res.status(400).json({ success: false, message:"Repl is already being pinged!" })
          return
        } else {
          db.dbdata.ping[owner][repl] = {pings:0,lastPing:0,lastUpdate:0,stats:[0,0,0,0,0,0]}
          res.status(200).json({ success: true, message:"Repl is now getting pinged!" })
          return
        }
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid Action" })
    }
  });

  //other routes..
}