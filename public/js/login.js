document.querySelector('.hamburger-menu').style.opacity = 0;


function sendLogin(){
  fetch('/login', {
    method: 'POST',
    body:  JSON.stringify({
      'login' : document.querySelector('#login').value,
      'password' : document.querySelector('#password').value
    }),
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  })
}


document.querySelector('.login-form').onsubmit = function(e){
  e.preventDefault();
  sendLogin();
}
