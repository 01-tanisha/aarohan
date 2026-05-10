# AAROHAN

## Overview

AAROHAN is a full-stack school management system built with Django REST on the backend and React on the frontend. It provides APIs and a user interface for managing students, teachers, activities, and admin features, while supporting authentication, email-based password reset, and analytics-ready charts.

## Tech Stack

- Backend: Django 5.2.6, Django REST Framework
- Frontend: React 19, React Router, Bootstrap, Chart.js, Recharts
- Database: SQLite (default local development database)
- Authentication: Custom Django authentication with session and CSRF support
- Email: SMTP via Gmail for password reset flows
- CORS: django-cors-headers for React frontend integration

## Features

- User registration and login APIs
- Student management and student-related endpoints
- Teacher management and teacher-related endpoints
- Activity tracking and attendance management support
- Admin panel endpoints for administrative workflows
- Password reset support with email token flow
- React frontend for dashboarding and UI interactions
- Charts and calendars for reporting
- Local development proxy from React to Django backend

## Project Structure

- `manage.py`: Django administrative entrypoint
- `requirements.txt`: Python dependencies for backend
- `package.json`: top-level package dependencies used in project root
- `frontend/`: React application source code and frontend package config
- `aarohan/`: Django project configuration
  - `settings.py`: Django settings including CORS and REST framework config
  - `urls.py`: root URL routing for backend and API endpoints
- `students/`: student-related models, views, serializers, auth, and URLs
- `teachers/`: teacher-related models, views, serializers, and URLs
- `activities/`: activity-related APIs and serializers
- `admin_panel/`: administrative endpoints and dashboard functionality
- `core/`: shared utilities, routes, exception handling, and password reset views
- `db.sqlite3`: SQLite database file for local development

## Installation

### Backend

1. Create and activate a virtual environment:

```powershell
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

### Frontend

1. Install Node dependencies:

```powershell
cd frontend
npm install
```

## Environment Variables

The backend currently uses a few environment variables for email and frontend configuration. Create a `.env` file or set these in your environment:

- `EMAIL_HOST_USER` - SMTP username for outgoing emails
- `EMAIL_HOST_PASSWORD` - SMTP password for outgoing emails
- `DEFAULT_FROM_EMAIL` - default sender email address
- `FRONTEND_BASE_URL` - URL of the React frontend (default: `http://10.61.61.240:3000`)

> Note: `SECRET_KEY` and `DEBUG` are currently hardcoded in `aarohan/settings.py`, so for production use you should move those values into environment variables and update the settings accordingly.

## How to Run

### Start the Django backend

From the project root:

```powershell
python manage.py migrate
python manage.py runserver
```

The backend will start on [https://aarohan-nine.vercel.app](https://aarohan-nine.vercel.app) by default.

### Start the React frontend

From the `frontend` directory:

```powershell
npm start
```

The frontend will start on `http://localhost:3000` and proxy API requests to the backend.

## Usage

### General

- Open the React frontend at `http://localhost:3000`
- Authenticate using the login/register forms
- The frontend uses API routes under `/api/` to access backend features
- Password reset flows are available via `reset-password/<uidb64>/<token>/`

### Student

- Register or log in as a student
- View attendance summaries and personal profile details
- Check exam results and announcements
- Browse available activities and enroll using activity pick/unenroll flows
- Track leaderboard and activity participation from the student dashboard

### Teacher

- Log in as a teacher account
- View and manage assigned students
- Submit attendance records and track attendance entries
- Enter grades and review grade entries
- Create and list teacher announcements
- Use teacher leaderboard analytics for students

### Admin

- Log in with an admin account
- View dashboard analytics and summary data
- Manage hostels, classrooms, and overall results
- Supervise and update or delete user accounts by type
- Monitor school-level metrics and administrative reports

### Activity Management

- Create, update, and delete activities from the admin/activity interface
- Browse activity categories and manage available extracurricular options
- Students can enroll in or unenroll from activities through the frontend

## Future Improvements

- Add a dedicated `.env` configuration loader for secure environment management
- Replace SQLite with PostgreSQL or MySQL for production deployments
- Add full unit/integration tests for frontend and backend
- Harden authentication with JWT or OAuth support
- Improve admin dashboard layouts and chart/reporting capabilities
- Add deployment scripts for Docker or cloud hosting
- Add role-based access control and permissions per user type

## Authors

- AAROHAN project contributors
- Backend implementation by the Django team members in this repository
- Frontend implementation using React and supporting libraries

## Notes

- This README is based on the current workspace structure and available project files.
- If you add more apps or environment-specific settings, update `aarohan/settings.py` and the `.env` documentation accordingly.