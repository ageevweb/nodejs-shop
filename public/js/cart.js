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
                <div class="cart-item__left">
                  <div class="cart-item__minus" data-goods_id="${data[key]['id']}">
                    <svg viewBox="0 0 512 512" xmlns:xlink="http://www.w3.org/1999/xlink">
                      <path d="M417.4,224H94.6C77.7,224,64,238.3,64,256c0,17.7,13.7,32,30.6,32h322.8c16.9,0,30.6-14.3,30.6-32  C448,238.3,434.3,224,417.4,224z"/>
                    </svg>               
                  </div>
                  <div class="cart-item__count"> ${cart[key]}</div>
                  <div class="cart-item__plus" data-goods_id="${data[key]['id']}">
                    <svg viewBox="0 0 32 32" xmlns:xlink="http://www.w3.org/1999/xlink">
                      <path d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z"/>
                    </svg>
                  </div>
                </div>
                <div class="cart-item__right">
                  <div class="cart-item__summ">$ ${formatPrice(data[key]['cost'] * cart[key])}</div>
                </div>      
              </div>
            </div>`      
    total += cart[key] * data[key]['cost'];
  }
  out += `<div class="cart-item__totalSumm">total summ: $ ${formatPrice(total)}</div>`
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

function formatPrice(price){
  return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ')
}
