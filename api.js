const fetch = require("node-fetch");
   const db  = require("quick.db");
const cheerio = require('cheerio');
const axios = require('axios');
const CryptoJS = require("crypto-js")
const binascii = require("binascii");
const regex = require("regex");
const https = require('https');
const request = require("request");


const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"
const Referer = "https://gogoplay.io/"
const BASE_URL = "https://gogoanime.fi"
const ajax_url = "https://ajax.gogo-load.com/"
const ENCRYPTION_KEYS_URL = "https://raw.githubusercontent.com/justfoolingaround/animdl-provider-benchmarks/master/api/gogoanime.json"

let iv = null;
let key = null;
let second_key = null;
const fetch_keys = async() => {
    const response = await axios.get(ENCRYPTION_KEYS_URL);
    const res = response.data;
    return {
        iv: CryptoJS.enc.Utf8.parse(res.iv),
        key: CryptoJS.enc.Utf8.parse(res.key),
        second_key: CryptoJS.enc.Utf8.parse(res.second_key)
    };
}
async function newSeason(page) {
    var anime_list = []


    res = await axios.get(`https://gogoanime.fi/new-season.html?page=${page}`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
    const body = await res.data;
    const $ = cheerio.load(body)

    $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name.html(), 'img_url': img, 'anime_id': link.slice(10,) }
        anime_list.push(anime_name)

    })

    return await (anime_list)
}
async function latest() {
   var anime_list = []
  let fet = db.fetch(`savesometime`);
  if(fet && fet[0].episode) {
    return fet;
  } else {
    return anime_list;
  }
  
 
    
  
   

}
setInterval(async() => {
  let anime_list = []
    res = await axios.get(`https://gogoanime.fi/`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
    const body = await res.data;
    const $ = cheerio.load(body)

   await $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div.img').find('a').attr('href')
        let episode = $elements.find("p.episode").html();
      let xx = $elements.find('div.ic-SUB').html();
    
        let duborsub =  !xx ? "DUB" : "SUB";
  

        anime_name = { 'name': name.html(), 'img_url': img, 'anime_id': link, 'subordub': duborsub, 'episode': episode }
   
        anime_list.push(anime_name)
       })
      db.set(`savesometime`, anime_list)
  console.log("Interval latest initiated");
}, 300000)
setInterval(async() => {
  let anime_list = [];
   res = await axios.get(`https://gogoanime.fi/popular.html`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
    const body = await res.data;
    const $ = cheerio.load(body)

   await $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a').html()
        name = name.replace("-", "")
        img = $elements.find('div').find('a').find('img').attr('src')
        released = $elements.find("p.released").html();
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name, 'img_url': img, 'anime_id': link.slice(10,), 'released' : released }
        anime_list.push(anime_name)

    })
  db.set(`trendsave`, anime_list);

    
}, 300000)
async function popular(page) {
   var anime_list = []
  let fet = db.fetch(`trendsave`);
  
  if(fet && fet[0].anime_id) {
    
    return fet;
  } else {
    return anime_list;
  }
}
 
async function search(query) {
    var anime_list = []

 try { 
    res = await axios.get(`https://gogoanime.fi/search.html?keyword=${query}`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
    const body = await res.data;
    const $ = cheerio.load(body)

    $('div.main_body div.last_episodes ul.items li').each((index, element) => {
        $elements = $(element)
        name = $elements.find('p').find('a')
        img = $elements.find('div').find('a').find('img').attr('src')
        link = $elements.find('div').find('a').attr('href')
        anime_name = { 'name': name.html(), 'img_url': img, 'anime_id': link.slice(10,) }
        anime_list.push(anime_name)

    })

    return await (anime_list)
 } catch(error) {
   console.log(error);
   return "Error";
 }
}

async function anime(_anime_name) {

try {
 
    episode_array = []
    
    res = await axios.get(`https://gogoanime.fi/category/${_anime_name}`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
    const body = await res.data;
    const $ = cheerio.load(body)

    img_url = $('div.anime_info_body_bg  img').attr('src')
    anime_name = $('div.anime_info_body_bg  h1').text()
    anime_about = $('div.main_body  div:nth-child(2) > div.anime_info_body_bg > p:nth-child(5)').text()
    anime_started = parseInt($('div.anime_info_body_bg p.type').eq(3).text().match(/\d+/g) , 10);
    let anime_genres = []; 
  $('div.anime_info_body_bg > p:nth-child(6) > a').each((i, elem) => {
            anime_genres.push($(elem).attr('title').trim())
        })
      othern = $('div.anime_info_body_bg > p.type').eq(6).text().replace('Other name: ', '').replace(/;/g, ',')
      type = $('div.anime_info_body_bg > p:nth-child(4) > a').text()
      status = $('div.anime_info_body_bg > p:nth-child(8) > a').text()
    //add the new code here
    el = $('#episode_page')

    ep_start = 0

    ep_end = el.children().last().find('a').attr('ep_end')
  const movie_id = $('#movie_id').attr('value')
        const alias = $('#alias_anime').attr('value')
  let epList = [];
    const html = await axios.get(`https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`)
        const $$ = cheerio.load(html.data);

   $$(" #episode_related > li").each(async(i, elem) => {

            epList.push({
                episodeId: $(elem).find("a").attr("href").split('/')[1],
                episodeNum: $(elem).find(`div.name`).text(),
                episodeUrl: "https://animeez.tk/watch" + $(elem).find(`a`).attr('href').trim(),
                episodesub: $(elem).find("a").find("div.cate").text()
            })
        })



    anime_result = { 'name': anime_name, 'img_url': img_url, 'about': anime_about, 'episode_id': epList, 'started': anime_started, 'genre': anime_genres, 'other': othern, "type": type, 'status' : status }

    return (anime_result)
} catch(error) {
  console.log(error);
}

}

async function watchAnime(episode_id) {
 try {
    res = await axios.get(`https://gogoanime.film/${episode_id}`, {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        })
  
    const body = await res.data;
  
    $ = cheerio.load(body)

  name = $("div.anime-info a").attr("href")
  if(!name) return "Error";
  name = name.replace("/category/", "")
     
   download =  $('li.dowloads > a').attr('href')
   
        el = $('#episode_page')

    ep_start = 1

    ep_end = el.children().last().find('a').attr('ep_end')
  const movie_id = $('#movie_id').attr('value')
        const alias = $('#alias_anime').attr('value')
  let epList = [];
    const html = await axios.get(`https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`)
        const $$ = cheerio.load(html.data);

   $$(" #episode_related > li").each(async(i, elem) => {

            epList.push({
                episodeId: $(elem).find("a").attr("href").split('/')[1],
                episodeNum: $(elem).find(`div.name`).text(),
                episodeUrl: "https://animeez.tk/watch" + $(elem).find(`a`).attr('href').trim(),
                episodesub: $(elem).find("a").find("div.cate").text()
            })
        })
    episode = episode_id.replace(`${name}-episode-`, "");
    about = name;
   
   if($('.anime_video_body_episodes_l a'))
   {
  prev = $('.anime_video_body_episodes_l a').attr('href');
  if(prev) {
  prev = prev.replace("/", "");
  }
   } else {
prev = "https://animeez.tk/watch/" + episode_id;
   } 
   if($('.anime_video_body_episodes_r a')) {
  next = $('.anime_video_body_episodes_r a').attr('href');
  if(next) {
  next = next.replace("/", "");
  }
   } else {
     next = "https://animeez.tk/watch/" + episode_id;
   }
  // watch1 = await removeAds(episode_link)
watch = new URL("https:" + $("#load_anime > div > div > iframe").attr("src"));
  let chek = db.fetch(`${watch.href}`);
   if(chek && chek.sources2) {
     xd = chek;
   } else {
   


 
 
     
//      xd = await scrapeMP4( watch);
     
   xd = await scrapeMP4(watch);
   }
     
   
 
   
     
   if(!watch) {
     name = "An Error Occured while fetching video link from database, so its using third party service which are having ads";
     
   }

    ep = {download: download, watch: xd, watch2: xd,  name: name, previous: prev, next: next, epi: episode, episodes: epList}
  
    return await (ep)
 } catch(error) {
   console.log(error);
   return "Error";
 }


}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function f_random(length) {
    var i = length,
        str = '';
    while (i > 0x0) {
        i--,
        str += getRandomInt(0, 9);
    }
    return str;
}

async function generateEncryptAjaxParameters($, id) {
 const keys = await fetch_keys();
    iv = keys.iv;
    key = keys.key;
    second_key = keys.second_key;

    const
        cryptVal = $("script[data-name='episode']").data().value,
        decryptedData = CryptoJS.AES['decrypt'](cryptVal, key, {
            'iv': iv
        }),
        decryptedStr = CryptoJS.enc.Utf8.stringify(decryptedData),
        videoId = decryptedStr.substring(0, decryptedStr.indexOf('&')),
        encryptedVideoId = CryptoJS.AES['encrypt'](videoId, key, {
            'iv': iv
        }).toString();

    return 'id=' + encryptedVideoId + decryptedStr.substring(decryptedStr.indexOf('&')) + '&alias=' + videoId;

}
 function decryptEncryptAjaxResponse(obj) {
    const decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(obj.data, second_key, {
        'iv': iv
    }));
    return JSON.parse(decrypted);
}
 const scrapeMP4 = async( serverUrl ) => {
let sources = []
  const goGoServerPage = await axios.get(serverUrl.href, { headers: { 'User-Agent': USER_AGENT } })
        const $$ = cheerio.load(goGoServerPage.data)

        const params = await generateEncryptAjaxParameters($$, serverUrl.searchParams.get('id'));


  console.log(params)
        const fetchRes = await axios.get(`
        ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': serverUrl.href,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })

        const res =  decryptEncryptAjaxResponse(fetchRes.data)

        if (!res.source) return { error: "No source found" };


 
        res.source_bk.forEach(source => sources.push(source))
 res.source.forEach(source => source.file.includes("m3u8") ? sources.push(source) : sources.push({
   file: ""
 }));
 
   let watch = sources[0].file;
   let test = db.fetch(`${serverUrl.href}`);
   if(!test)
   {
     db.set(`${serverUrl.href}`,  { Referer: serverUrl.href,
            sources: watch, sources2: sources[1] && sources[1].file.includes("m3u8") ? sources[1].file : null, });
   }
        return {
            Referer: serverUrl.href,
            sources: watch,
            sources2: sources[1] && sources[1].file.includes("m3u8") ? sources[1].file : "" ,
        }

   
 
    
}





async function setDownloadLink(watch, id, download) {
  if(watch) {
    db.set(`${id}`, { watch: watch, download: download});
  }
}
async function getDownloadLink(episode_link, name, episode) {
console.log(episode_link)
/* let res = await axios.get(`${episode_link}`);
let body = await res.data;
let $ = await cheerio.load(body);
let test = $("div.load-iframe").eq(3).attr("data-video");

console.log(test); */
}

async function latestm() {
  let res = await axios.get("https://manganato.com/", {
            headers: {
              
                'User-Agent': USER_AGENT,
                
            }
        });
  let body = await res.data;
 
  let $ = cheerio.load(body);
  let mangas = [];
  $("body > div.body-site > div.container-main > div.container-main-left > div.panel-content-homepage > div.content-homepage-item").each((i, el) => {
   
    let name = $(el).find("div.content-homepage-item-right h3.item-title a").html();
    let img = $(el).find("a.item-img img").attr("src");
    let ch = $(el).find("div.content-homepage-item-right p").eq(0).find("a").html();
   
 
    
     url = $(el).find("div.content-homepage-item-right p").eq(0).find("a").attr("href");
   ch = ch.toLowerCase().replace(" ", "-");
    mid = url.replace("https://readmanganato.com/", "");
    mid = mid.replace("/" + ch, "");
    url = url.replace("readmanganato.com", "animeez.tk/read");
   mangas.push({
     url: url,
     name: name,
     img_url: img,
     chno: ch,
     mid: mid,
   })
 
  })
  console.log(mangas);
     return await mangas
}
async function chs(chapterUrl) {
  console.log(chapterUrl)
  const chapterPage = await axios.get(chapterUrl)
        const $ = cheerio.load(chapterPage.data);
let list = [];
        $('body > div.body-site > div.container-chapter-reader > img').each((i, el) => {
            list.push({
                img: $(el).attr('src'),
                pageTitle: $(el).attr('title').replace(' - MangaNato.com', '').trim()
            })
        })
  let chs = [];
  let current = $("div.panel-navigation select.navi-change-chapter").eq(0).html();
  let id = current.replace("https://readmanganato.com/", "");
  id = id.replace(current, "");
  $('body> div.body-site > div.container > div.panel-navigation > select.navi-change-chapter option').each((i, el) => {
    let ch = $(el).attr("data-c");
    let uch = `chapter-${ch}`;
    chs.push({
      episodeNum: "Chapter " + ch,
      episodeUrl: "https://readmanganato.com/" + id + "/" + uch
    })
  })
  
        frret = {
          manga: list,
         others: chs,
          name: $("div.panel-breadcrumb ").eq(3).attr("title")
        }
        return frret

}





module.exports = {
    popular,
    newSeason,
    search,
    anime,
    watchAnime,
    latest,
latestm,
  chs
}
