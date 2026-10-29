
from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

DATABASE = "restaurant.db"


# Create database and table
def init_db():
    conn = sqlite3.connect(DATABASE)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            guests INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Save restaurant reservation
@app.route("/book", methods=["POST"])
def book():
    data = request.get_json(silent=True) or request.form

    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    guests = str(data.get("guests", "")).strip()
    date = str(data.get("date", "")).strip()
    time = str(data.get("time", "")).strip()

    if not all([name, phone, guests, date, time]):
        return jsonify({
            "success": False,
            "message": "Please fill in all fields."
        }), 400

    if not guests.isdigit() or not 1 <= int(guests) <= 20:
        return jsonify({
            "success": False,
            "message": "Guests must be between 1 and 20."
        }), 400

    try:
        booking_date = datetime.strptime(date, "%Y-%m-%d").date()
        if booking_date < datetime.now().date():
            return jsonify({
                "success": False,
                "message": "Please select today or a future date."
            }), 400
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Please enter a valid date."
        }), 400

    if len(phone) < 10 or len(phone) > 15:
        return jsonify({
            "success": False,
            "message": "Please enter a valid phone number."
        }), 400

    conn = sqlite3.connect(DATABASE)

    conn.execute("""
        INSERT INTO reservations
        (name, phone, guests, date, time, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        name,
        phone,
        int(guests),
        date,
        time,
        datetime.now().isoformat(timespec="seconds")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Thank you {name}! Your reservation request has been saved."
    })


# Simple restaurant chatbot
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).lower().strip()

    if any(word in message for word in ["book", "reservation", "table"]):
        reply = "You can reserve a table using our booking form."
    elif any(word in message for word in ["time", "open", "hours"]):
        reply = "Please contact the restaurant to confirm today's opening hours."
    elif any(word in message for word in ["menu", "food", "dish"]):
        reply = "Please check our menu on the home page."
    elif any(word in message for word in ["hello", "hi", "hey"]):
        reply = "Hello! Welcome to SmartBite Restaurant. How can I help you?"
    else:
        reply = "I can help with table bookings, menu questions and restaurant information."

    return jsonify({"reply": reply})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
