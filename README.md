# decentralib
Decentralized Library

### 1️⃣ Prerequisites

Make sure you have these installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / Mac / Linux)
- Git

---

### 2️⃣ Clone the repository

```bash
git clone https://github.com/LeLukasH/decentralib
```

---

### 3️⃣ Run Backend

Run the following command:

```bash
cd decentralib/src/backend
docker-compose up --build
docker-compose exec web python manage.py migrate
```

This will:
- Build the Django image
- Start the PostgreSQL container
- Start the Django web container
- Apply Database Migrations

Django will be available at: http://localhost:8000

