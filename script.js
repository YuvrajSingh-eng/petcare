if ("IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("scroll-reveal-enabled");

    const revealElements = document.querySelectorAll(
        "main > section, .service-card, .doctor-card, #appointment-form, " +
        "#inquiry-form, .more-details, .more-card, .tips-list"
    );
    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.1
    });

    revealElements.forEach(function (element) {
        const siblings = Array.from(element.parentElement.children).filter(function (sibling) {
            return sibling.matches(
                ".service-card, .doctor-card, .more-details"
            );
        });
        const order = siblings.indexOf(element);
        if (order >= 0) {
            element.style.setProperty("--reveal-delay", `${Math.min(order, 5) * 70}ms`);
        }

        element.classList.add("scroll-reveal");
        revealObserver.observe(element);
    });
}

const moreMenuOverlay = document.getElementById("more-menu-overlay");
const moreMenu = document.getElementById("more-menu");
const moreMenuToggle = document.querySelector(".more-menu-toggle");
let moreMenuPreviousFocus = null;

window.openMoreMenu = function () {
    if (!moreMenuOverlay || !moreMenu || !moreMenuToggle) {
        return;
    }

    moreMenuPreviousFocus = document.activeElement;
    moreMenuOverlay.hidden = false;
    moreMenu.setAttribute("aria-hidden", "false");
    moreMenuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("more-menu-open");
    moreMenu.querySelector(".more-menu-close").focus();
};

window.closeMoreMenu = function () {
    if (!moreMenuOverlay || !moreMenu || !moreMenuToggle || moreMenuOverlay.hidden) {
        return;
    }

    moreMenuOverlay.hidden = true;
    moreMenu.setAttribute("aria-hidden", "true");
    moreMenuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("more-menu-open");

    if (moreMenuPreviousFocus instanceof HTMLElement) {
        moreMenuPreviousFocus.focus();
    }
};

if (moreMenu && moreMenuOverlay && moreMenuToggle) {
    moreMenu.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            event.preventDefault();
            window.closeMoreMenu();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableElements = Array.from(
            moreMenu.querySelectorAll("a[href], button:not([disabled])")
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });

    moreMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", window.closeMoreMenu);
    });
}

const petProfileForm = document.getElementById("pet-profile-form");
const dashboardPets = document.getElementById("dashboard-pets");

if (petProfileForm && dashboardPets) {
    petProfileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("dashboard-pet-name").value.trim();
        const type = document.getElementById("dashboard-pet-type").value;

        if (!name || !type) {
            return;
        }

        const emptyMessage = dashboardPets.querySelector(".dashboard-empty");
        if (emptyMessage) {
            emptyMessage.remove();
        }

        const petCard = document.createElement("article");
        petCard.className = "dashboard-pet-card";

        const petName = document.createElement("h3");
        petName.textContent = name;

        const petType = document.createElement("p");
        petType.textContent = `${type} · Demo profile`;

        petCard.append(petName, petType);
        dashboardPets.append(petCard);
        petProfileForm.reset();
    });
}

const chatbotForm = document.getElementById("chatbot-form");
const chatbotQuestion = document.getElementById("chatbot-question");
const chatbotResponse = document.getElementById("chatbot-response");

if (chatbotForm && chatbotQuestion && chatbotResponse) {
    chatbotForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const question = chatbotQuestion.value.trim().toLowerCase();
        let response =
            "For advice specific to your pet, please ask a veterinarian. You can use the Contact page to send a demo inquiry.";

        if (question.includes("emergency") || question.includes("urgent")) {
            response =
                "This demo cannot assess emergencies. Contact an emergency veterinary clinic immediately if your pet may need urgent care.";
        } else if (question.includes("appointment") || question.includes("bring")) {
            response =
                "For a visit, bring any available medical or vaccination records and a list of questions or medications.";
        } else if (question.includes("food") || question.includes("diet") || question.includes("nutrition")) {
            response =
                "Food needs vary by pet. Ask your veterinarian before making major diet changes, especially if your pet has health concerns.";
        } else if (question.includes("vaccine") || question.includes("vaccination")) {
            response =
                "A veterinarian can discuss vaccines based on your pet's age, health, lifestyle, and medical history.";
        }

        chatbotResponse.textContent = response;
        chatbotQuestion.value = "";
    });
}

const appointmentForm = document.getElementById("appointment-form");
const appointmentDate = document.getElementById("appointment-date");
const formMessage = document.getElementById("form-message");

if (appointmentForm && appointmentDate && formMessage) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const minimumDate = `${year}-${month}-${day}`;

    appointmentDate.min = minimumDate;

    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const ownerName = document.getElementById("owner-name").value.trim();
        const petName = document.getElementById("pet-name").value.trim();
        const petType = document.getElementById("pet-type").value;
        const service = document.getElementById("service").value;
        const date = appointmentDate.value;
        const time = document.getElementById("appointment-time").value;

        if (!ownerName || !petName || !petType || !service || !date || !time) {
            formMessage.textContent = "Please complete all required fields.";
            formMessage.style.color = "#b42318";
            return;
        }

        if (date < minimumDate) {
            formMessage.textContent = "Please choose today or a future date.";
            formMessage.style.color = "#b42318";
            return;
        }

        formMessage.textContent =
            `Thank you, ${ownerName}! Your appointment request for ` +
            `${petName} (${petType}) for ${service} on ${date} at ${time} ` +
            "has been received in this demo.";
        formMessage.style.color = "#287849";

        appointmentForm.reset();
        appointmentDate.min = minimumDate;
    });
}

const inquiryForm = document.getElementById("inquiry-form");
const inquiryFormMessage = document.getElementById("inquiry-form-message");

if (inquiryForm && inquiryFormMessage) {
    inquiryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("inquiry-name").value.trim();
        const subject = document.getElementById("inquiry-subject").value.trim();

        if (!name || !subject) {
            inquiryFormMessage.textContent = "Please complete all required fields.";
            inquiryFormMessage.style.color = "#b42318";
            return;
        }

        inquiryFormMessage.textContent =
            `Thank you, ${name}! Your inquiry about "${subject}" has been received in this demo.`;
        inquiryFormMessage.style.color = "#287849";
        inquiryForm.reset();
    });
}

const loginPage = document.getElementById("login-page");
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

window.showSignup = function () {
    if (loginBox && signupBox) {
        loginBox.classList.add("hidden");
        signupBox.classList.remove("hidden");
    }
    if (loginPage) {
        loginPage.style.display = "flex";
    }
};

window.showLogin = function () {
    if (loginBox && signupBox) {
        signupBox.classList.add("hidden");
        loginBox.classList.remove("hidden");
    }
    if (loginPage) {
        loginPage.style.display = "flex";
    }
};

if (loginPage) {
    loginPage.style.display =
        localStorage.getItem("petcareLoggedIn") === "true" ? "none" : "flex";
}

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        localStorage.setItem("petcareUser", JSON.stringify({ name, email, password }));
        alert("Account Created Successfully!");
        window.showLogin();
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const savedUser = localStorage.getItem("petcareUser");
        const message = document.getElementById("login-message");
        const user = savedUser ? JSON.parse(savedUser) : null;

        if (user && user.email === email && user.password === password) {
            localStorage.setItem("petcareLoggedIn", "true");
            loginPage.style.display = "none";
        } else {
            message.textContent = "Invalid Email or Password";
        }
    });
}
