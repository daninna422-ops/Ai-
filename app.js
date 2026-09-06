// Verification & Initialization
const loggedUserRaw = localStorage.getItem('LOGGED_IN_USER');

if (!loggedUserRaw) {
  window.location.href = "login.html";
}

const user = JSON.parse(loggedUserRaw);

// Render User Info Directly
document.addEventListener("DOMContentLoaded", () => {
  if (user) {
    document.getElementById('userName').innerText = user.full_name || "Aboki";
    document.getElementById('accountNumber').innerText = user.account_number || "3120000000";
    
    // Format Balance with Currency (₦)
    const formattedBalance = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(user.balance || 0);
    
    document.getElementById('userBalance').innerText = formattedBalance;
  }
});

function logout() {
  localStorage.removeItem('LOGGED_IN_USER');
  window.location.href = "login.html";
}
