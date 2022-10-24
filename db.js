const axios = require("axios")
const Filter = require("bad-words")
const fs = require("fs")
const path = require("path")

const filter = new Filter()
filter.addWords(..."miner.free.nitro.always.on.discord.pro.giveaway.cloud.livestream.proxy.crypto.btc.bitcoin.youtube.token.nuke.ddos.peer2peer".split("."))
const dbPath = path.join(process.cwd(), "db.json")

var replsPinged = 100
var alive = 100


function percent(part, total) {
  return (100 * part) / total;
} 

function abbreviate(num,decimals){
  let numLen=(String(num)).length
  decimals=Math.pow(10,decimals)
  numLen-=numLen%3
  return Math.round(num*decimals/Math.pow(10,numLen))/decimals+" kMGTPE"[numLen/3]
}


function getReplData(url) {
  let clean = filter.clean(url.replace("https://","").replace("/","").replace(".repl.co",""))
  if (clean.includes("*")) {
    return ["","URL includes profanity or blacklisted words"]
  }
  let split = clean.split(".")
  if (split.length == 2) {
    let repl = split[0]
    let owner = split[1]
    if (repl != "" && owner != "") {
      // Repl exists
      return [repl.toLowerCase(), owner.toLowerCase()]
    } else {
      return ["","Malformed URL"]
    }
  } else {
    return ["","Malformed URL"]
  }
}

function getUnix() {
  return Math.floor(Date.now()/1000)
}

function readDB() {
  let unparsed = fs.readFileSync(dbPath, "utf8")
  return JSON.parse(unparsed)
}

function writeDB(json) {
  fs.writeFileSync(dbPath, JSON.stringify(json))
}

let accept = [200, 304, 100, 201, 202, 206, 302]

async function ping(url, urldata) {
  if (getUnix()-300 > urldata.lastPing) {
    axios({
      method: "GET",
      url: url,
      timeout: 5000
    }).then((res) => {
      console.log("Pinged " + url)
      dbdata.total++
      urldata.lastPing = getUnix()
      
      let [repl, owner] = getReplData(url)
      if (repl == "") {return}

      let status = res.status
      if (!(accept.includes(status))) {status = 500} else {
        alive++
      }

      if (getUnix()-7200 > urldata.lastUpdate) {
        urldata.stats.shift()
        urldata.stats.push(status)
        urldata.lastUpdate = getUnix()
      }

      urldata.pings++

      return urldata
      
    }).catch(e=>{"Well, something exceeded the timeout huh!"})
  } else {
    return {}
  }
}

function pingAll() {
  replsPinged = 0
  alive = 0
  let plsPing = dbdata.ping
  for (var key in plsPing) {
    let user = plsPing[key]
    for (var key2 in user) {
      replsPinged++
      ping("https://"+key2+"."+key+".repl.co", plsPing[key][key2]).then((b) => {
        
      })
    }
  }
}

let dbdata = readDB()


setInterval(() => {
  writeDB(dbdata)
}, 5000)


module.exports = { getReplData, dbdata, pingAll, abbreviate, replsPinged, alive, percent }