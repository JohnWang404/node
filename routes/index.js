const express = require('express');
const cheerio=require('cheerio');
const superagent=require('superagent');
const router = express.Router();
const WXeasy = require('node-wxeasy');
const bodyparser = require('body-parser')
const request = require('request')
const app = express()

const weixin = new WXeasy({
  app: app,
  appid: 'wx8b89f967968602de',
  appsecret: '5c0ccc5cc089181dc4a5d9c611842605',
  token: 'appwechat',
  access_token_apiurl: ''
});

let accesstoken = ''
let arr = []

weixin.getAccessToken(function(data) {
  accesstoken = data.access_token;
});

//热词接口
router.get('/getHotWord',function(req,res,next){
  arr = []
  getHotWord('http://www.sina.com.cn/mid/search-list.shtml',res);
});

//WX 域名检测
router.post('/getWxIsable',function(req,res,next){
  let longurl = req.query.longurl;
  var wxapi = "https://api.weixin.qq.com/cgi-bin/shorturl?access_token="+accesstoken;
  var json = {
    'action':'long2short',
    'long_url':longurl
  }
  weixin.getShortUrl({
    action: "long2short",
    long_url: longurl
}, function(data) {
    if(data.errmsg == "ok"){
      let shorturl = data.short_url;

          superagent.get(shorturl).end(function(err,sres){
          console.log(sres)
          let str = "https://weixin110.qq.com";
          let redirects = "";
          try {
            redirects = JSON.stringify(sres.redirects);  
          } catch (error) {
            res.send("输入域名不正确，请重新输入");
            return
          }
          let flag = (redirects.indexOf(str) != -1)
          let arr = [];
          if(flag){
            let arr = [{
              "value":"0",
              "falg":"该域名已被封"
            }];  
            res.send(arr);  
          } else {
            let arr = [{
              "value":"1",
              "falg":"该域名未被封"
            }];
            res.send(arr);  
          }
      })
    } else {
      res.send("输入域名不正确，请重新输入");
    }
    
});

});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function getHotWord(url,res){
  superagent.get(url)//请求页面地址
  .end(function(err,sres){
    if(err) return next(err);
    var $=cheerio.load(sres.text);
    $(".phblist li").each(function(index,element){
        var $eleItem=$(element).find('.keyword a');
        var str = $eleItem.text().match(/#(\S*)#/)[1];
        arr.push(
            {
                title: str,
            }
        );
    });
    res.send(arr);  
  })
}



module.exports = router;
