const express = require("express");
const app = express();

const path = require("path");
const api = require("./api.js");
const db = require("quick.db");
const axios = require("axios");
const cheerio = require("cheerio")



app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));





app.get("/", async(req, res) => {

  const recent = await api.latest();
//   const recentm = await api.latestm();
  const trending = await api.popular();
   if(recent === "Error" || trending === "Error") {
    return res.send("THere is an error")
  }
  res.render("index.ejs", {recent: recent, recentm: [], trend: trending});
})
app.get("/anime/:anime", async(req, res) => {
   
  const details = await api.anime(req.params.anime);
   if(details === "Error") {
    return res.send("THere is an error")
  }
   res.render("anime.ejs", {details: details})
})

app.get("/watch/:id",  async(req, res) => {

  const details = await api.watchAnime(req.params.id);
  if(details === "Error") {
    return res.send("THere is an error")
}

  res.render("watch.ejs", {details: details, scrapeMP4: api.scrapeMP4, api: api, cheerio: function load(data) {
    return cheerio.load(data);
  }})
})

app.get("/search", async(req, res) => {
  const keyword = req.query.keyword;
  if(!keyword) return res.send("Keyword not given!"); 
 
  let details = await api.search(keyword);
   if(details === "Error") {
    return res.send("THere is an error")
  }
  res.render("search.ejs", {details: details});
})

app.listen("8000");