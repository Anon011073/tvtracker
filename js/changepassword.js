document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('changePasswordForm');
    const messageEl = document.getElementById('message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current_password').value;
        const newPassword = document.getElementById('new_password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (newPassword !== confirmPassword) {
            messageEl.textContent = 'New passwords do not match.';
            messageEl.style.color = 'red';
            return;
        }

        fetch('api/change_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageEl.textContent = 'Password changed successfully!';
                messageEl.style.color = 'green';
                form.reset();
            } else {
                messageEl.textContent = data.error || 'An error occurred.';
                messageEl.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageEl.textContent = 'An unexpected error occurred.';
            messageEl.style.color = 'red';
        });
    });
});
