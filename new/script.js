document.addEventListener('DOMContentLoaded', function() {
    console.log('Webpage loaded!');
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', showUserAuthModal);
    }
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminAuthModal);
    }
});

function showUserAuthModal() {
    // Remove existing modal if any
    const oldModal = document.getElementById('userAuthModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'userAuthModal';
    modal.innerHTML = `
        <div class="modal-bg"></div>
        <div class="modal-content">
            <button class="close-modal" onclick="document.getElementById('userAuthModal').remove()">&times;</button>
            <h2>User Login</h2>
            <form id="loginForm">
                <input type="text" name="username" placeholder="Username or Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <p class="switch-auth">New user? <a href="#" id="showSignup">Sign up</a></p>
            <div id="authMsg"></div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('loginForm').onsubmit = handleLogin;
    document.getElementById('showSignup').onclick = function(e) {
        e.preventDefault();
        showSignupForm();
    };
}

function showSignupForm() {
    const modal = document.getElementById('userAuthModal');
    if (!modal) return;
    modal.querySelector('.modal-content').innerHTML = `
        <button class="close-modal" onclick="document.getElementById('userAuthModal').remove()">&times;</button>
        <h2>User Sign Up</h2>
        <form id="signupForm">
            <input type="text" name="username" placeholder="Username" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
        </form>
        <p class="switch-auth">Already have an account? <a href="#" id="showLogin">Login</a></p>
        <div id="authMsg"></div>
    `;
    document.getElementById('signupForm').onsubmit = handleSignup;
    document.getElementById('showLogin').onclick = function(e) {
        e.preventDefault();
        showUserAuthModal();
    };
}

function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const usernameOrEmail = form.username.value.trim();
    const password = form.password.value;
    const payload = usernameOrEmail.includes('@') ? { email: usernameOrEmail, password } : { username: usernameOrEmail, password };
    const BASE_URL = 'http://10.10.85.137:3001';
    fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            document.getElementById('userAuthModal').remove();
            showUserUploadPage(usernameOrEmail, password);
        } else {
            document.getElementById('authMsg').textContent = data.error || 'Login failed.';
        }
    })
    .catch(() => {
        document.getElementById('authMsg').textContent = 'Server error.';
    });
}

function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!isStrongPassword(password)) {
        document.getElementById('authMsg').textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and symbol.';
        return;
    }
    const BASE_URL = 'http://10.10.85.137:3001';
    fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            document.getElementById('authMsg').textContent = 'Registration successful! You can now log in.';
        } else {
            document.getElementById('authMsg').textContent = data.error || 'Registration failed.';
        }
    })
    .catch(() => {
        document.getElementById('authMsg').textContent = 'Server error.';
    });
}

function isStrongPassword(password) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

function showUserUploadPage(usernameOrEmail, password) {
    document.body.innerHTML = `
        <div class="logo-text">Docky</div>
        <div class="container">
            <header><h1>Upload your document here</h1></header>
            <main>
                <form id="uploadForm">
                    <div class="file-preview" id="filePreview">No file selected</div>
                    <input type="file" id="fileInput" name="file" style="margin:1rem 0;" required />
                    <div class="upload-actions">
                        <button type="submit">Upload</button>
                        <button type="button" id="cancelBtn">Cancel</button>
                        <button type="button" id="logoutBtn">Logout</button>
                    </div>
                    <div id="uploadMsg"></div>
                </form>
            </main>
        </div>
    `;
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        document.getElementById('filePreview').textContent = file ? file.name : 'No file selected';
    });
    document.getElementById('uploadForm').onsubmit = function(e) {
        e.preventDefault();
        const file = document.getElementById('fileInput').files[0];
        if (!file) {
            document.getElementById('uploadMsg').textContent = 'Please select a file.';
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        // Pass credentials for authentication
        if (usernameOrEmail.includes('@')) {
            formData.append('email', usernameOrEmail);
        } else {
            formData.append('username', usernameOrEmail);
        }
        formData.append('password', password);
        const BASE_URL = 'http://10.10.85.137:3001';
        fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                document.getElementById('uploadMsg').textContent = 'File uploaded successfully!';
            } else {
                document.getElementById('uploadMsg').textContent = data.error || 'Upload failed.';
            }
        })
        .catch(() => {
            document.getElementById('uploadMsg').textContent = 'Server error.';
        });
    };
    document.getElementById('logoutBtn').onclick = function() {
        window.location.reload();
    };
    document.getElementById('cancelBtn').onclick = function() {
        window.location.reload();
    };
}

// --- ADMIN AUTH ---
function showAdminAuthModal() {
    // Remove existing modal if any
    const oldModal = document.getElementById('adminAuthModal');
    if (oldModal) oldModal.remove();
    const modal = document.createElement('div');
    modal.id = 'adminAuthModal';
    modal.innerHTML = `
        <div class="modal-bg"></div>
        <div class="modal-content">
            <button class="close-modal" onclick="document.getElementById('adminAuthModal').remove()">&times;</button>
            <h2>Admin Login</h2>
            <form id="adminLoginForm">
                <input type="text" name="username" placeholder="Admin Name" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <div id="adminAuthMsg"></div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('adminLoginForm').onsubmit = handleAdminLogin;
}

function handleAdminLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    const BASE_URL = 'http://10.10.85.137:3001';
    fetch(`${BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            document.getElementById('adminAuthMsg').textContent = 'Admin login successful!';
            setTimeout(() => {
                document.getElementById('adminAuthModal').remove();
                showAdminDashboard(username, password);
            }, 700);
        } else {
            document.getElementById('adminAuthMsg').textContent = data.error || 'Login failed.';
        }
    })
    .catch(() => {
        document.getElementById('adminAuthMsg').textContent = 'Server error.';
    });
}

function showAdminDashboard(username, password) {
    document.body.innerHTML = `
        <div class="logo-text">Docky</div>
        <div class="container">
            <header><h1>Admin Dashboard</h1></header>
            <main>
                <div id="adminFilesTable">Loading files...</div>
                <button class="role-btn" id="logoutBtn">Logout</button>
            </main>
        </div>
    `;
    const BASE_URL = 'http://10.10.85.137:3001';
    fetch(`${BASE_URL}/admin-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.files && data.files.length > 0) {
            const rows = data.files.map(f => `
                <tr>
                    <td>${f.username}</td>
                    <td>${f.originalname}</td>
                    <td>${new Date(f.upload_time).toLocaleString()}</td>
                    <td><button class="download-btn" data-id="${f.id}" data-name="${f.originalname}">Download</button></td>
                </tr>
            `).join('');
            document.getElementById('adminFilesTable').innerHTML = `
                <table class="admin-table">
                    <thead><tr><th>User</th><th>Filename</th><th>Uploaded At</th><th>Download</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.onclick = function() {
                    const fileId = btn.getAttribute('data-id');
                    const fileName = btn.getAttribute('data-name');
                    const BASE_URL = 'http://10.10.85.137:3001';
                    fetch(`${BASE_URL}/download`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password, fileId })
                    })
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    });
                };
            });
        } else {
            document.getElementById('adminFilesTable').innerHTML = '<p>No files uploaded yet.</p>';
        }
    })
    .catch(() => {
        document.getElementById('adminFilesTable').innerHTML = '<p>Server error loading files.</p>';
    });
    document.getElementById('logoutBtn').onclick = function() {
        window.location.reload();
    };
} 