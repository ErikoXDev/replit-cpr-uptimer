
const db = require("./db")


module.exports = function(app){

  app.post('/api/repl', function(req, res){
    console.log(req.body)
    let action = req.body.action
    let url = req.body.url
    if (!db.stringIsAValidUrl(url)) {
      res.status(400).json({ success: false, message: "Malformed URL" })
      return
    }
    if (action == "add") {
      let [repl, owner] = db.getReplData(url)
      if (repl == "") {
        res.status(400).json({ success: false, message: "Malformed URL" })
        return
      } else {
        if (!db.dbdata.ping[owner]) db.dbdata.ping[owner] = {}
        if (db.dbdata.ping[owner][repl]) {
          res.status(400).json({ success: false, message:`Repl is already being pinged! <a href='/@${owner}/${repl}' target='_blank' class='underline text-gray-500'>Look at analytics</a>` })
          return
        } else {
          db.dbdata.ping[owner][repl] = {pings:0,lastPing:0,lastUpdate:0,stats:[0,0,0,0,0,0]}
          res.status(200).json({ success: true, message:"Repl is now getting pinged!" })
          return
        }
      }
    } else {
      res.status(400).json({ success: false, message: "Invalid Action" })
      return
    }
  });

  app.get("/api/getdata", (req, res) => {
    res.json(db.dbdata)
  })

  //other routes..
}