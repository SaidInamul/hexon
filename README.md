# 📍 Hexon - Location Management System

A full-stack web application designed for managing, uploading, and visualizing geospatial data. Users can securely log in, bulk upload location data via ZIP archives, and visualize points on an interactive map.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

* **🔐 Secure Authentication:** JWT-based registration and login system protected with bcrypt.
* **📂 Bulk Data Upload:** Upload `.zip` files containing location data (CSV/Text format).
* **🛡️ Smart File Parsing:** Robust backend logic that filters out system files (e.g., `__MACOSX`, `.DS_Store`) and validates coordinate data.
* **🗺️ Interactive Map:** Visualize uploaded locations dynamically using Leaflet.
* **📱 Responsive UI:** Clean interface built with React and Bootstrap 5.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React (Vite)
* **Styling:** Bootstrap 5, Custom CSS
* **Map Library:** React-Leaflet / Leaflet
* **State Management:** Zustand
* **HTTP Client:** Axios

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL (Sequelize ORM)
* **Authentication:** JSON Web Tokens (JWT)
* **File Processing:** Multer (Memory Storage) & Adm-Zip

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL installed and running
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/SaidInamul/hexon.git](https://github.com/SaidInamul/hexon.git)
cd hexon
cd backend
npm install

# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=hexon_db
DB_DIALECT=postgres

# Security (JWT)
# Use a long, random string for the secret
JWT_SECRET=change_this_to_a_secure_secret_key
JWT_EXPIRE=24h

# File Upload Constraints
MAX_FILE_SIZE=5242880  # 5MB in bytes

npm run dev

cd frontend
npm install

VITE_API_URL=http://localhost:5001/api

npm run dev
