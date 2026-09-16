const CP_API_BASE = "http://localhost:8000/api/v1";

document.addEventListener('DOMContentLoaded', async () => {
    const loginSection = document.getElementById('login-section');
    const userSection = document.getElementById('user-section');
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if user is already logged in
    const data = await chrome.storage.local.get(["access_token"]);
    if (data.access_token) {
        showUserSection();
    }

    async function showUserSection() {
        loginSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        
        // Validate token and get user info
        try {
            const response = await fetch(`${CP_API_BASE}/auth/validate`, {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            });
            if (response.ok) {
                const user = await response.json();
                userInfo.innerText = `User: ${user.full_name} (${user.email})`;
            } else {
                logout();
            }
        } catch (err) {
            console.error("Validation error:", err);
            logout();
        }
    }

    async function logout() {
        chrome.runtime.sendMessage({ type: "LOGOUT" }, () => {
            chrome.storage.local.clear();
            loginSection.classList.remove('hidden');
            userSection.classList.add('hidden');
        });
    }

    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) return alert("Please fill in all fields");

        try {
            const response = await fetch(`${CP_API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'username': email,
                    'password': password
                })
            });

            if (response.ok) {
                const result = await response.json();
                chrome.runtime.sendMessage({ 
                    type: "LOGIN_SUCCESS", 
                    token: result.access_token 
                }, () => {
                    showUserSection();
                });
            } else {
                const err = await response.json();
                alert(`Login failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (err) {
            alert("Error connecting to Control Plane");
        }
    });

    logoutBtn.addEventListener('click', logout);
});
