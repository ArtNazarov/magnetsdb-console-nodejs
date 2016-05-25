var Page = function(a){this.html = a;};
Page.prototype.z = function(h) {this.setHtml(this.getHtml() + h);};
Page.prototype.getHtml = function(){return this.html;};
Page.prototype.setHtml = function(h){this.html = h;};

var sqlite3 = require("sqlite3").verbose();
var express = require('express');
var bodyParser = require('body-parser');
var db = new sqlite3.Database('main-sqlite.db');
var port = 44444;


var fetching = function (request)
                    {        
                        this.done = false;
                        this.page = new Page("");
                        this.header = 'Search:'+request+"</hr>";  
                        this.footer = '</table><hr><a href="/">Search again?</a>';                                              
                        this.page.setHtml("");
                        this.page.z('<table><tr><th>Category</th><th>Caption</th><th>Labels</th><th>Link&Hash</th></tr>');                                                                                                                                                                                             
                    };        
                    
fetching.prototype.getFetcher = function()
{
    var h = this;
    var r =  function(row) {    
                                                      
                            h.page.z('<tr>');
                            h.page.z('<td>'+row.category+'</td>');
                            h.page.z('<td>'+row.caption+'</td>');
                            h.page.z('<td>'+row.labels+'</td>');
                            h.page.z('<td><a rel="nofollow" href="magnet:?xt=urn:btih:'+row.hash+'">'+row.hash+'</td>');
                            h.page.z('</tr>'); 
                                                        
                            
    };
    return r;
}
 




// Создаем инстанс приложения
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// По умолчанию 'GET' на /

app.set('view engine', 'jade');

app.get('/', function(req, res){
  // Обработчик представления для маршрута '/' и метода GET 
  // Представление с результатами обращения к базе вернем с помощью `app.post('/', ...`
  
   var html = '<form action="/" method="post">' +
               'Введи запрос:' +
               '<input type="text" name="request" placeholder="Delta Force" />' +
               '<br>' +
               '<button type="submit">Искать</button>' +
            '</form>';    
    
  res.render('index', { title: 'Magnet links search engine', message: html});   
    
  
               
 
});

// Обработчик для отправки результатов выборки из базы
// Обращение к 'body-parser' предполагает
// что `req.body` был уже заполнен значениями из элементов управления формы

app.post('/', function(req, res){
  var request = req.body.request;
  var Render = new fetching(request);  
   var func = Render.getFetcher(Render);    
    Render.counter = 0;
    Render.done = false;
    db.all("SELECT * FROM data WHERE caption LIKE '%"+request+"%' ORDER BY caption LIMIT 10 ", 
            function(err, rows) {
                
                    rows.forEach(
                                    Render.getFetcher()
                                );
  
                    res.render('results', 
                { title: 'Magnet links search engine', 
                  results: Render.header+Render.page.getHtml()+Render.footer                    
                });   
                
                
            });
  
});

app.listen(port);
