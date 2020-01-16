let cart = {}


document.querySelectorAll('.add-to-cart').forEach(elem => {
  elem.onclick = addToCart;
});

if(localStorage.getItem('cart')){
  cart = JSON.parse(localStorage.getItem('cart'));
  ajaxGetGoodsInfo();
}


function addToCart(){
  let id = this.getAttribute('data-goods_id');
  if(cart[id]){
    cart[id]++
  } else {
    cart[id] = 1;
  }
  console.log(cart);
  ajaxGetGoodsInfo();
}


function ajaxGetGoodsInfo() {
  updateLS();
  fetch('/get-goods-info', {
    method: 'POST',
    body:  JSON.stringify({key: Object.keys(cart)}),
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  })
  .then(function(response){
    return response.text();
  })
  .then(function(body){
    console.log(body);
    showCart(JSON.parse(body));
  })
}


function showCart(data){
  let total = 0;
  let out = '';

  for(let key in cart){
    out += `<div class="cart-item">
              <div class="cart-item__title"> ${data[key]['name']}</div>
              <div class="cart-item__row"> 
                <div class="cart-item__minus" data-goods_id="${data[key]['id']}"> [-] </div>
                <div class="cart-item__count"> 99</div>
                <div class="cart-item__plus" data-goods_id="${data[key]['id']}"> [+] </div>
              </div>
              <div class="cart-item__summ">$ ${data[key]['cost'] * cart[key]}</div>
            </div>      
    `
    total += cart[key] * data[key]['cost'];
  }
  out += `<div class="cart-item__totalSumm"> ${total}</div>`
  document.querySelector('.side-menu__cart').innerHTML = out;

  document.querySelectorAll('.cart-item__minus').forEach(elem => {
    elem.onclick = cartMinus;
  });

  document.querySelectorAll('.cart-item__plus').forEach(elem => {
    elem.onclick = cartPlus;
  });
}

function cartPlus(){
  let id = this.getAttribute('data-goods_id');
  cart[id]++;
  ajaxGetGoodsInfo();
}

function cartMinus(){
  let id = this.getAttribute('data-goods_id');
  if(cart[id]-1 > 0){
    cart[id]--;
  } else {
    delete(cart[id]);
  }
  ajaxGetGoodsInfo();
}

function updateLS(){
  localStorage.setItem('cart', JSON.stringify(cart));
}
