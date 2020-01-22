getCategoryList();

function getCategoryList(){
  fetch('/get-category-list',{
    method: 'POST'
  })
  .then(function(a){
    return a.text();
  })
  .then (function(b){
    showCategoryList(JSON.parse(b))
  })
}


function showCategoryList(data){

  let out = '';
  for(i=0; i < data.length; i++){
    out+=`<li><a href="/category?id=${data[i]['id']}">${data[i]['category']}</a></li>`
  }
  document.querySelector('.side-menu__links').innerHTML = out;
}