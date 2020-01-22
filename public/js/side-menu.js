getCategoryList();

function getCategoryList(){

  console.log("==============")
  console.log('data')
  console.log("==============")
  fetch('/get-category-list',{
    method: 'POST'
  })
  .then(function(a){
    return a.text();
  })
  .then (function(b){
    console.log(b)
    showCategoryList(JSON.parse(b))
  })
}


function showCategoryList(data){

  console.log("==============")
  console.log(data)
  console.log("==============")


  let out = '';
  for(i=0; i < data.length; i++){
    out+=`<li><a href="/category?id=${data[i]['id']}">${data[i]['category']}</a></li>`
  }
  document.querySelector('.side-menu__links').innerHTML = out;
}