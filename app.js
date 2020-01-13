let express = require('express');
let app = express();
app.use(express.static('public'));

app.set('view engine', 'pug');

app.listen(3000, function(){
  console.log('node express works on 3000');
});

app.get('/', function(req, res){
  // console.log('/ loaded');
  res.render('main', {
    title: 'titleFIRST'
  });
});



// app.get('/cat', function(req, res){
//   res.end('hello22');
// });



