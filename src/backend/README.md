Decentralib
===========

A Dockerized Django + PostgreSQL web application for a decentralized library system.

---

## 🧩 Project Overview
----------------

**Stack:**
- **Backend:** Django (Python)
- **Database:** PostgreSQL
- **Containerization:** Docker + Docker Compose

**Features:**
- Modular Django apps
- PostgreSQL for persistent storage
- Fully containerized for easy team setup

---

## Development

### Create Admin User

Run the following command:

```bash
docker-compose exec web python manage.py createsuperuser
```

Then open http://localhost:8000/admin to log in.

---

### Useful Commands

```bash
docker-compose up             # Start containers
docker-compose down           # Stop containers
docker-compose exec web bash  # Open shell inside Django container
docker-compose exec db psql -U decentralibuser -d decentralib  # Open PostgreSQL CLI
docker-compose logs -f        # View container logs
docker-compose exec web python manage.py shell  # Open Django shell
```

---

## Development Workflow

- Create Django apps:

```bash
docker-compose exec web python manage.py startapp <app_name>
```

- Add the app to `INSTALLED_APPS` in `backend/settings.py`
- Make migrations and apply them:

```bash
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate
```

- Query models in shell:

```bash
docker-compose exec web python manage.py shell
```

---

## Folder Structure

decentralib/
└── src/
    └── backend/
        ├── Dockerfile
        ├── docker-compose.yml
        ├── requirements.txt
        ├── manage.py
        ├── .env
        └── backend/
            ├── settings.py
            ├── urls.py
            ├── wsgi.py
            └── ...
        └── books/
            ├── models.py
            ├── views.py
            ├── admin.py
            └── ...

---

## Database Access

### 1️⃣ Via CLI

```bash
docker-compose exec db psql -U decentralibuser -d decentralib
```

Useful `psql` commands:

```bash
    \dt         # list tables
    \du         # list users
    SELECT * FROM auth_user;  # example query
    \q          # quit
```

### 2️⃣ Via GUI

Use a database client such as DBeaver, TablePlus, or pgAdmin:  
- Host: localhost  
- Port: 5433
- Database: decentralib  
- User: decentralibuser  
- Password: decentralibpass

---

## Running Tests

- Using Django test runner:

```bash
      docker-compose exec web python manage.py test
```

- Optionally, with pytest (if installed):

```bash
      docker-compose exec web pytest
```

---

## Troubleshooting

- Docker not running → Start Docker Desktop  
- Database connection error → Check that the `db` container is running with `docker ps`  
- Missing module (e.g., psycopg2) → Rebuild containers:

```bash
      docker-compose up --build
```

---

## ✅ Done!

Your local instance of **Decentralib** is now running. You can develop, migrate, and test the application inside Docker without installing PostgreSQL or Python locally.

**License:** MIT
