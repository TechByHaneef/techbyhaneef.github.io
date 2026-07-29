
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', function (event) {
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
    const popup = document.getElementById("popupForm");

    if (popup && !localStorage.getItem("registered")) {
        popup.style.display = "block";
    }
};

// Handle form submission
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
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
    const cancelBtn = document.getElementById("cancelBtn");

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            document.getElementById("popupForm").style.display = "none";
        });
    }





    // Show textarea only when "complaint" is selected
    const subject = document.getElementById("subject");

    if (subject) {
        const complaintBox = document.getElementById("complaintBox");
        subject.addEventListener("change", function () {
            if (this.value === "complaint") {
                complaintBox.style.display = "block";
                document.getElementById("message").setAttribute("required", "true");
            } else {
                complaintBox.style.display = "none";
                document.getElementById("message").removeAttribute("required");
            }
        });
    }
}
// shareCourse
document.getElementById("shareBtn1")?.addEventListener("click", function () {
    shareCourse('MS Word');
});

document.getElementById("shareBtn2")?.addEventListener("click", function () {
    shareCourse('MS Excel');
});

document.getElementById("shareBtn3")?.addEventListener("click", function () {
    shareCourse('250 + Shortcut Keys');
});

function shareCourse(courseName) {
    const links = {
        'MS Word': 'https://youtube.com/playlist?list=PLZUR1p6Q90fnjh1-p9gRMCPjDToAq5nDd&si=44bU8UGf1yGK5qEj',
        'MS Excel': 'https://youtube.com/playlist?list=PLWbmLrWaVHKE&si=a-BeStlJWT-PDom_',
        '250 + Shortcut Keys': 'https://techbyhaneef.github.io/MS%20Word%20Shortcuts%20Book%20.pdf'
    };
    const shareData = {
        title: `${courseName} | TechByHaneef`,
        text: `Check out this ${courseName} course on TechByHaneef!`,
        url: links[courseName]
    };
    navigator.share(shareData);
}


// data submission
function submitForm(formId, action) {

    const form = document.getElementById(formId);

    if (!form) return;

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(this);

        // Tell Apps Script which form this is
        formData.append("action", action);

        // Register form doesn't have these fields
        if (action === "register") {
            formData.append("phone", "");
            formData.append("subject", "");
            formData.append("message", "");
        }

        try {

            await fetch("https://script.google.com/macros/s/AKfycbySYnrc86brCB0ipf3NQXpBRif7eFEgK_nFCrmsYIrxhkxyXKmXazrTv-1fJ-xvcY1XdQ/exec", {
                method: "POST",
                mode: "no-cors",
                body: formData
            });

            if (action === "contact") {
                alert("Thank you for your message!");
            } else {
                alert("Registration successful!");
                localStorage.setItem("registered", "true");

                const popup = document.getElementById("popupForm");
                if (popup) popup.style.display = "none";
            }

            this.reset();

        } catch (err) {

            console.error(err);
            alert("Something went wrong!");

        }

    });

}

// Contact Form
submitForm("contactForm", "contact");

// Register Form
submitForm("registerForm", "register");