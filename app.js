let express = require('express');
let app = express();
app.use(express.static('public'));

app.set('view engine', 'pug');

app.use(express.json())

// add mysql modul : npm install mysql
let mysql = require('mysql');
let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'datalist'
});

app.listen(3000, function(){
  console.log('node express works on 3000');
});



// main page
app.get('/', function(req, res){
  con.query('SELECT * FROM goods', function(error, result){
      if (error) throw error;
      // console.log(result);

      // repack obj important
      let goods = {};
      for(let i=0; i<result.length; i++){
        goods[result[i]['id']] = result[i];
      }
      // console.log(goods[5]['name'])
      res.render('main', {
        title: 'Home',
        goods: JSON.parse(JSON.stringify(goods))
      });
      // console.log(JSON.parse(JSON.stringify(goods)));
    }
  );
});



// category page
app.get('/category', function(req, res){

  // console.log(req.query.id);

  let catId = req.query.id;

  let cat = new Promise(function(resolve, reject){
    con.query(
      'SELECT * FROM category WHERE id='+catId, 
      function(error, result){
        if (error) reject(error);
        resolve(result);
      });
  });

  let goods = new Promise(function(resolve, reject){
    con.query(
      'SELECT * FROM goods WHERE category='+catId, 
      function(error, result){
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function(value){
    res.render('category', {
      title: value[0][0]['category'],
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    });
  });
});



// single-item page
app.get('/item', function(req, res){
  let itemId = req.query.id;

  con.query('SELECT * FROM goods WHERE id='+itemId, 
  
  function(error, result, fields){
    if (error) reject(error);

    res.render('single', {
      title: result[0]['name'],
      item: JSON.parse(JSON.stringify(result))
    });
  });
});


app.post('/get-category-list', function(req,res){
  con.query('SELECT id, category FROM category', function(error, result, fields){
    if (error) throw error;
    res.json(result);
  });
});


app.post('/get-goods-info', function(req,res){
  // console.log(req.body);

  if(req.body.key.length != 0){
    con.query('SELECT id,name,cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function(error, result, fields){
      if (error) throw error;
      let goods = {};
      for(let i = 0; i<result.length; i++){
        goods[result[i]['id']] = result[i];
      }
      res.json(goods); 
      // console.log(goods);
    });
  } else {
    res.send('0');
  }
});



