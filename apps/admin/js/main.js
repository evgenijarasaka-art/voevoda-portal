    // Auth
    function doLogin() {
        const pass = document.getElementById('password').value;
        const err = document.getElementById('login-error');
        if (pass === 'voevoda2024') {
        sessionStorage.setItem('admin_auth', '1');
        window.location.href = 'dashboard.html';
        } else {
        err.style.display = 'block';
        document.getElementById('password').style.borderColor = '#EF4444';
        }
    }
    
    // Allow Enter key
    document.addEventListener('DOMContentLoaded', () => {
        const pw = document.getElementById('password');
        if (pw) {
        pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
        pw.addEventListener('input', () => {
            pw.style.borderColor = '';
            const err = document.getElementById('login-error');
            if (err) err.style.display = 'none';
        });
        }
    });