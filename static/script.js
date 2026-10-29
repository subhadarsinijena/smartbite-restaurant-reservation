
// ======================================
// SMARTBITE RESTAURANT - JAVASCRIPT
// ======================================


// Set the minimum booking date to today
const dateInput = document.getElementById("date");

if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.min = `${year}-${month}-${day}`;
}


// ======================================
// TABLE RESERVATION FORM
// ======================================

const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");

if (bookingForm) {
    bookingForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        bookingMessage.textContent = "Submitting your reservation...";
        bookingMessage.style.color = "#f5cc72";

        const submitButton = bookingForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;

        const formData = {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            guests: document.getElementById("guests").value,
            date: document.getElementById("date").value,
            time: document.getElementById("time").value
        };

        try {
            const response = await fetch("/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to submit your booking."
                );
            }

            bookingMessage.textContent =
                "✅ " + result.message;

            bookingMessage.style.color = "#75e6a2";

            bookingForm.reset();

            // Keep the date restriction after resetting the form
            if (dateInput) {
                const now = new Date();
                const minDate =
                    `${now.getFullYear()}-${String(
                        now.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        now.getDate()
                    ).padStart(2, "0")}`;

                dateInput.min = minDate;
            }

        } catch (error) {
            bookingMessage.textContent =
                "❌ " + error.message;

            bookingMessage.style.color = "#ff8585";

        } finally {
            submitButton.disabled = false;
        }
    });
}


// ======================================
// CHATBOT
// ======================================

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");


function addChatMessage(message, className) {
    const messageElement = document.createElement("p");

    // Use textContent to display text safely
    messageElement.textContent = message;
    messageElement.className = className;

    chatMessages.appendChild(messageElement);

    // Automatically scroll to the latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


if (chatForm) {
    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const message = chatInput.value.trim();

        if (!message) {
            return;
        }

        // Show the user's message
        addChatMessage(message, "user-message");

        chatInput.value = "";
        chatInput.focus();

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error("Chat service is unavailable.");
            }

            addChatMessage(
                result.reply || "Sorry, I could not understand.",
                "bot-message"
            );

        } catch (error) {
            addChatMessage(
                "Sorry, something went wrong. Please try again.",
                "bot-message"
            );
        }
    });
}


// ======================================
// WHATSAPP BOOKING HELPER
// ======================================

// This helper creates a WhatsApp message.
// It does not automatically send a message.

function openWhatsAppBooking() {
    const phoneNumber = "91XXXXXXXXXX";
    const message =
        "Hello SmartBite! I want to reserve a table.";

    const whatsappURL =
        "https://wa.me/" + phoneNumber +
        "?text=" + encodeURIComponent(message);

    window.open(whatsappURL, "_blank", "noopener");
}
