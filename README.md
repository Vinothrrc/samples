# Django Online Exam System

A comprehensive online examination platform built with Django as the frontend and PostgreSQL as the database backend. This system provides secure authentication, real-time monitoring, and detailed analytics for conducting online exams.

## Features

### 🔐 **Security**
- Built-in user authentication with role-based access control
- CSRF protection and secure session management
- Password validation and security middleware
- User roles: Student, Teacher, Admin

### 🗄️ **Database**
- PostgreSQL backend for robust data integrity
- Comprehensive ORM with complex relationship handling
- Schema versioning through Django migrations
- Optimized queries for performance

### 📊 **Admin Panel**
- Auto-generated Django admin interface
- CRUD operations for all models
- Bulk operations and filtering
- User management with profile integration

### 📈 **Analytics & Monitoring**
- Real-time exam progress tracking
- Detailed performance analytics
- Grade distribution reports
- Time-based statistics

### 📱 **User Experience**
- Modern, responsive Bootstrap 5 UI
- Mobile-friendly design
- Intuitive navigation
- Real-time notifications

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Django Web    │    │   PostgreSQL    │    │   Static Files  │
│   Application   │◄──►│    Database     │    │   & Media       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### Step 1: Clone and Setup Environment

```bash
# Navigate to project directory
cd /workspace/exam_project

# Activate virtual environment
source ../exam_env/bin/activate

# Install dependencies
pip install django psycopg2-binary pillow
```

### Step 2: Database Configuration

```bash
# Start PostgreSQL service
sudo service postgresql start

# Create database and user
sudo -u postgres createdb exam_db
sudo -u postgres psql -c "CREATE USER exam_user WITH PASSWORD 'exam_password';"
sudo -u postgres psql -c "ALTER USER exam_user WITH SUPERUSER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE exam_db TO exam_user;"
```

### Step 3: Django Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

## Database Models

### Core Models

1. **Subject** - Academic subjects for exams
2. **Question** - Individual exam questions with types (MCQ, True/False, Short Answer)
3. **Option** - Multiple choice options for questions
4. **Exam** - Exam configurations with timing and settings
5. **ExamResult** - Student exam results and scores
6. **StudentAnswer** - Individual student responses
7. **UserProfile** - Extended user information with roles

### Model Relationships

```
User ──┐
       ├── UserProfile
       ├── Question (created_by)
       ├── Exam (created_by)
       └── ExamResult (student)

Subject ──┐
          ├── Question
          └── Exam

Question ──┐
           ├── Option
           └── ExamQuestion

Exam ──┐
       ├── ExamResult
       └── ExamQuestion
```

## User Roles & Permissions

### Student
- View available exams
- Take exams with time limits
- View personal results and analytics
- Update profile information

### Teacher
- Create and manage exams
- Create questions and options
- View student results
- Manage exam settings

### Admin
- Full system access
- User management
- System-wide analytics
- Database administration

## URL Structure

```
/                          # Home page
/register/                 # User registration
/login/                    # User login
/logout/                   # User logout
/dashboard/                # Role-based dashboard
/exams/                    # Exam listing
/exams/<id>/               # Exam details
/exams/<id>/take/          # Take exam
/exams/<id>/submit/        # Submit exam
/exams/create/             # Create new exam
/results/<id>/             # View exam result
/my-results/               # Personal results
/subjects/                 # Subject listing
/subjects/<id>/            # Subject details
/profile/                  # User profile
/admin/                    # Django admin
```

## File Structure

```
exam_project/
├── exam_project/           # Project settings
│   ├── settings.py         # Django configuration
│   ├── urls.py             # Main URL routing
│   └── wsgi.py             # WSGI configuration
├── exam/                   # Main application
│   ├── models.py           # Database models
│   ├── views.py            # View functions
│   ├── forms.py            # Django forms
│   ├── admin.py            # Admin configuration
│   ├── urls.py             # App URL routing
│   └── migrations/         # Database migrations
├── templates/              # HTML templates
│   └── exam/               # App templates
│       ├── base.html       # Base template
│       ├── home.html       # Landing page
│       ├── login.html      # Authentication
│       └── ...             # Other templates
├── static/                 # Static files (CSS, JS, images)
├── media/                  # User uploads
└── manage.py               # Django management script
```

## Key Features Implementation

### Real-time Exam Timer
- JavaScript-based countdown timer
- Automatic submission when time expires
- Warning alerts for time remaining

### Secure Exam Environment
- Session-based authentication
- CSRF protection on all forms
- Time-based exam availability
- Prevention of multiple submissions

### Analytics Dashboard
- Performance metrics
- Grade distribution
- Time analysis
- Subject-wise statistics

### Mobile Responsiveness
- Bootstrap 5 responsive design
- Touch-friendly interface
- Adaptive layouts for all screen sizes

## API Endpoints

While primarily a web application, the system includes AJAX endpoints for:
- Real-time exam progress updates
- Dynamic question navigation
- Instant form validation
- Live timer synchronization

## Security Features

### Authentication
- Django's built-in authentication system
- Password hashing with PBKDF2
- Session management
- Login/logout functionality

### Authorization
- Role-based access control
- Permission decorators
- Object-level permissions
- Admin-only areas

### Data Protection
- CSRF tokens on all forms
- SQL injection prevention via ORM
- XSS protection in templates
- Secure password policies

## Performance Optimization

### Database
- Optimized queries with select_related()
- Database indexing on frequently queried fields
- Connection pooling
- Query result caching

### Frontend
- Minified CSS/JS assets
- Image optimization
- Lazy loading for large datasets
- Efficient template rendering

## Development Guidelines

### Code Style
- PEP 8 compliance
- Comprehensive docstrings
- Meaningful variable names
- Consistent formatting

### Testing
- Unit tests for models
- Integration tests for views
- Form validation tests
- Admin interface tests

### Deployment
- Environment variables for sensitive data
- Static file serving configuration
- Database connection pooling
- Error logging and monitoring

## Usage Instructions

### For Students
1. Register with student role
2. Login to access dashboard
3. View available exams
4. Take exams within time limits
5. View results and analytics

### For Teachers
1. Register with teacher role
2. Create subjects and questions
3. Design exams with question selection
4. Set exam timing and parameters
5. Monitor student performance

### For Administrators
1. Access Django admin panel
2. Manage users and permissions
3. Monitor system performance
4. Generate system reports
5. Configure global settings

## Configuration

### Database Settings
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'exam_db',
        'USER': 'exam_user',
        'PASSWORD': 'exam_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Email Configuration
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL service status
   - Verify database credentials
   - Ensure database exists

2. **Migration Errors**
   - Check database permissions
   - Run migrations in correct order
   - Reset migrations if needed

3. **Static Files Not Loading**
   - Run `python manage.py collectstatic`
   - Check STATIC_URL configuration
   - Verify file permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed description
- Contact the development team

## Changelog

### Version 1.0.0
- Initial release
- Basic exam functionality
- User authentication
- Admin interface
- PostgreSQL integration
- Responsive design

---

**Built with ❤️ using Django and PostgreSQL**
