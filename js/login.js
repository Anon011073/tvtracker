document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  fetch('api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json().then(data => ({ status: response.status, body: data })))
  .then(res => {
    messageEl.textContent = res.body.message;
    if (res.status === 200) {
      messageEl.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      messageEl.style.color = 'red';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    messageEl.textContent = 'An unexpected error occurred.';
    messageEl.style.color = 'red';
  });
});
