# Kerala Tourist Finder

A full-stack web application that helps users find nearby tourist attractions in Kerala, India, based on their location, with map directions.

## Tech Stack
- **Backend:** Django REST Framework, PostgreSQL, Redis
- **Frontend:** React (Vite), Leaflet.js, Leaflet Routing Machine
- **Auth:** JWT (djangorestframework-simplejwt)
- **Containerization:** Docker + Docker Compose

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your system.
- A [Geoapify](https://www.geoapify.com/) API Key.

### 1. Clone & Configure
1. Clone the repository.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your `GEOAPIFY_API_KEY`. You can also change database credentials or the Django Secret Key if deploying to production.

### 2. Run with Docker Compose
Build and start the application containers in detached mode:
```bash
docker-compose up --build -d
```

### 3. Database Initialization
Once the containers are running, run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

### 4. Seed the Database
Populate the database with curated Kerala tourist attractions:
```bash
docker-compose exec backend python manage.py seed_places
```

### 5. Create a Superuser (Optional)
To access the Django Admin panel:
```bash
docker-compose exec backend python manage.py createsuperuser
```

### 6. Access the Application
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/
