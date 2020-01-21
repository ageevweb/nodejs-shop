let express = require('express');
let app = express();

var cookieParser = require('cookie-parser');

app.use(express.static('public'));

app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded());

const nodemailer = require('nodemailer');

// add mysql modul : npm install mysql
let mysql = require('mysql');

// let con = mysql.createConnection({

let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'datalist'
});


// delete on prod
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;





app.listen(3000, function(){
  console.log('node express works on 3000');
});



// main page
app.get('/', function(req, res){
  
  let cat = new Promise(function(resolve, reject){
    con.query(
      "select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 4", 
      function(error, result){
        if (error) reject(error);
        resolve(result);
      });
  });

  let catDescr = new Promise(function(resolve, reject){
    con.query(
      'SELECT * FROM category', 
      function(error, result){
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, catDescr]).then(function(value){
    res.render('main', {
      title: 'Home',
      cat: JSON.parse(JSON.stringify(value[1])),
      goods: JSON.parse(JSON.stringify(value[0]))
    });
  });
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


app.get('/order', function(req, res){
    res.render('order', {
      title: 'Order'
    });
});



app.post('/finish-order', function(req,res){
  // console.log(req.body);
  if(req.body.key.length != 0){

    let key = Object.keys(req.body.key)

    con.query('SELECT id,name,cost FROM goods WHERE id IN (' + key.join(',')+')', 
    function(error, result, fields){
      if (error) throw error;
      sendMail(req.body, result).catch(console.error);
      saveOrder(req.body, result);
      res.send('1');
    });
  } else {
    res.send('0');
  }
});

async function sendMail(data, result){

  let res = '<h2>Order from PrototypeShop</h2>';
  let total = 0;

  for (let i = 0; i < result.length; i++){
    res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - $ ${result[i]['cost'] * data.key[result[i]['id']]} </p>`;
    total += result[i]['cost'] * data.key[result[i]['id']];
  }

  res += `
    <div>Total:  $ ${total}</div> 
    <div>Phone:  ${data.userPhone}</div> 
    <div>Name:  ${data.userName}</div> 
    <div>Address:  ${data.userAddress}</div> 
    <div>Email:  ${data.userEmail}</div> 
  `
  console.log(res);

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  let mailOption = {
    from: '<ageevweb@gmail.com>',
    to: "ageevweb@gmail.com,"+ data.userEmail,
    subject: "PrototypeShop order",
    text: 'hello world 222',
    html: res
  };

  let info = await transporter.sendMail(mailOption);
  console.log("MessageSent: %s", info.messageId);
  console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
  return true;
}

function saveOrder(data, result) {
  // data - info about user
  // result info about goods

  let sql;
  sql = "INSERT INTO user_info (user_name, user_phone, user_email,address) VALUES ('" + data.userName + "', '" + data.userPhone + "', '" + data.userEmail + "','" + data.userAddress + "')";
  con.query(sql, function (error, resultQuery) {
    if (error) throw error;
    console.log("1 user record inserted");

    let userId = resultQuery.insertId;
    date = new Date() / 1000;
    for (let i = 0; i < result.length; i++) {
      sql = "INSERT INTO shop_order (date, user_id, goods_id, goods_cost, goods_amount, total) VALUES (" + date + "," + userId +","+ result[i]['id'] + ", " + result[i]['cost'] + "," + data.key[result[i]['id']] + ", " + data.key[result[i]['id']] * result[i]['cost'] + ")";
      con.query(sql, function (error, resultQuery) {
        if (error) throw error;
        console.log("1 record inserted");
      });
    }
  });
}

app.get('/admin-order', function(req, res){
  con.query(`
    SELECT 
      shop_order.id as id,
      shop_order.user_id as user_id,
      shop_order.goods_id as goods_id,
      shop_order.goods_cost as goods_cost,
      shop_order.goods_amount as goods_amount,
      shop_order.total as total,
      from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
      user_info.user_name as user,
      user_info.user_phone as phone,
      user_info.address as address
    FROM 
      shop_order
    LEFT JOIN	
      user_info
    ON shop_order.user_id = user_info.id ORDER BY id DESC`,
  function(error, result, fields){
    if (error) reject(error);
    res.render('admin-order', {
      title: 'admin-order',
      order: JSON.parse(JSON.stringify(result))
    });
  });
});



app.get('/admin', function(req, res){
  res.render('admin', {
    // title: 'admin'
  });
});


app.post('/login', function(req, res){
  con.query('SELECT * FROM user WHERE login="'+req.body.login + '" and password="'+req.body.password+'"',
  function(error, result, fields){
    if (error) reject(error);
    // console.log(result.length);
    
    if(result.length == 0){
      console.log('error user')
    } else {
      // enter user in assount
      result = JSON.parse(JSON.stringify(result));
      res.cookie('hash', 'blablabla');
      // write hash in db
      sql = "UPDATE user SET hash='bala123' WHERE id="+result[0]['id'];
      con.query(sql, function (error, resultQuery) {
        if (error) throw error;
        res.redirect('/admin');
      });
    };
  });
});


app.get('/login', function(req, res){
  res.render('login', {
    title: 'login'
  });
});








