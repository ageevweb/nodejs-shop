document.querySelector('#order-submit').onclick = function(e)  {
    e.preventDefault();

    let userName = document.querySelector('#order-name').value.trim();
    let userEmail = document.querySelector('#order-email').value.trim();
    let userPhone = document.querySelector('#order-phone').value.trim();
    let userAddress = document.querySelector('#order-address').value.trim();

    if(!document.querySelector('#order-check').checked){

    }

    if(userName=='' || userEmail=='' || userPhone=='' || userAddress==''){

    }

    fetch('/finish-order', {
        method: 'POST',
        body:  JSON.stringify({
            'userName' : userName,
            'userEmail' : userEmail,
            'userPhone' : userPhone, 
            'userAddress' : userAddress,
            'key' : JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        }
    })
    .then(function(response){
        return response.text();
    })
    .then(function(body){
        // return response.text();
        if (body == 1){

        } else {

        }
    })
}
