
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');

    // If menu is open and click is outside nav or hamburger
    if (nav.classList.contains('show') && 
        !nav.contains(event.target) && 
        !hamburger.contains(event.target)) {
        nav.classList.remove('show');
    }
});





// Show popup only if not registered
window.onload = function () {
    if (!localStorage.getItem("registered")) {
        document.getElementById("popupForm").style.display = "block";
    }
};

// Handle form submission
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const visitorData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        company: document.getElementById("company").value
    };

    console.log("Visitor Registered:", visitorData);
    alert("Thank you for registering at TechByHaneef!");

    // Save registration status so popup won't show again
    localStorage.setItem("registered", "true");

    // Hide popup after registration
    document.getElementById("popupForm").style.display = "none";
});

// Cancel button hides popup (but does not save "registered")
document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("popupForm").style.display = "none";
});






// Show textarea only when "complaint" is selected
  document.getElementById("subject").addEventListener("change", function() {
    const complaintBox = document.getElementById("complaintBox");
    if (this.value === "complaint") {
      complaintBox.style.display = "block";
      document.getElementById("message").setAttribute("required", "true");
    } else {
      complaintBox.style.display = "none";
      document.getElementById("message").removeAttribute("required");
    }
  });





 