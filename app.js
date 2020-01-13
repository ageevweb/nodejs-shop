let express = require('express');
let app = express();
app.use(express.static('public'));

app.set('view engine', 'pug');

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


app.get('/', function(req, res){
  con.query('SELECT * FROM goods', function(error, result){
      if (error) throw err;
      // console.log(result);
      
      // repack obj important
      let goods = {};
      for(let i=0; i<result.length; i++){
        goods[result[i]['id']] = result[i];
      }
      // console.log(goods[5]['name'])
      res.render('main', {
        title: 'titleFIRST',
        goods: JSON.parse(JSON.stringify(goods))
      });
      // console.log(JSON.parse(JSON.stringify(goods)));
    }
  );
  
});


