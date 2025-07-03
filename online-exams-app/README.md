# Online Exams Application

A modern, responsive web application built with Angular 20 for conducting online examinations. This application provides a complete solution for creating, managing, and taking online exams with real-time timer functionality and comprehensive result analysis.

## 🌟 Features

### For Students
- **User Authentication**: Secure login with role-based access control
- **Dashboard**: View available exams, completed exams, and performance statistics
- **Exam Taking**: 
  - Real-time countdown timer
  - Question navigation sidebar
  - Progress tracking
  - Auto-submit when time expires
  - Confirmation before final submission
- **Results**: Detailed result analysis with question-by-question review
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### For Administrators
- **Admin Dashboard**: Comprehensive overview with statistics
- **Exam Management**: Create, edit, activate/deactivate, and delete exams
- **Question Management**: Add multiple-choice questions with customizable points
- **Results Monitoring**: View all student results and performance analytics
- **Real-time Statistics**: Track exam attempts, average scores, and pass rates

## 🛠 Technology Stack

- **Frontend**: Angular 20 with standalone components
- **Styling**: Bootstrap 5 + Custom SCSS
- **Icons**: Font Awesome 6
- **State Management**: RxJS for reactive programming
- **Forms**: Angular Reactive Forms
- **Routing**: Angular Router with lazy loading
- **HTTP Client**: Angular HttpClient

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (version 9 or higher)
- **Angular CLI** (version 20 or higher)

## 🚀 Getting Started

### 1. Clone or Navigate to the Project
```bash
cd online-exams-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm start
# or
ng serve
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:4200`

## 👥 Demo Accounts

The application comes with pre-configured demo accounts for testing:

### Student Account
- **Email**: `student@example.com`
- **Password**: `password`

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `password`

## 📚 Application Structure

```
online-exams-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── admin/           # Admin dashboard and exam management
│   │   │   ├── dashboard/       # Student dashboard
│   │   │   ├── exam/           # Exam taking interface
│   │   │   ├── header/         # Navigation header
│   │   │   ├── login/          # Authentication
│   │   │   └── results/        # Exam results display
│   │   ├── services/
│   │   │   ├── auth.service.ts  # Authentication service
│   │   │   └── exam.service.ts  # Exam and results service
│   │   ├── app.component.ts     # Root component
│   │   └── app.routes.ts        # Application routing
│   ├── styles.scss              # Global styles
│   └── index.html              # Main HTML file
├── package.json
├── angular.json
└── tsconfig.json
```

## 🔧 Key Components

### Authentication Service
- Manages user login/logout
- Role-based access control (Student/Admin)
- Session persistence with localStorage

### Exam Service
- CRUD operations for exams
- Question management
- Result tracking and analytics
- Mock data for demonstration

### Exam Component
- Real-time timer with auto-submit
- Question navigation
- Answer tracking
- Progress indicators

### Results Component
- Detailed score breakdown
- Question-by-question review
- Performance analysis
- Print functionality

### Admin Component
- Exam creation and editing
- Question management with form arrays
- Student results overview
- Statistics dashboard

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Optimized for all screen sizes
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark/Light Themes**: Automatic theme detection
- **Print Support**: Optimized print styles for results
- **Loading States**: Skeleton screens and spinners for better UX

## 📊 Sample Exams

The application includes pre-loaded sample exams:

1. **JavaScript Fundamentals** (5 questions, 30 minutes)
2. **Angular Framework** (4 questions, 45 minutes)
3. **HTML & CSS Basics** (3 questions, 25 minutes)

## 🔒 Security Features

- **Input Validation**: Client-side form validation
- **XSS Protection**: Sanitized user inputs
- **Session Management**: Secure authentication state
- **Role-based Access**: Protected admin routes

## 📱 Mobile Support

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Streamlined mobile experience

## 🧪 Testing Scenarios

### Student Workflow
1. Login with student credentials
2. View available exams on dashboard
3. Start an exam and navigate through questions
4. Submit exam and view results
5. Review detailed answer analysis

### Admin Workflow
1. Login with admin credentials
2. View statistics on admin dashboard
3. Create a new exam with questions
4. Manage existing exams (edit/activate/delete)
5. Monitor student results

## 🔄 Future Enhancements

- **Backend Integration**: Connect to a real API/database
- **Question Types**: Support for multiple question formats
- **File Uploads**: Image support for questions
- **Email Notifications**: Automated result notifications
- **Advanced Analytics**: Detailed reporting and charts
- **Exam Scheduling**: Time-based exam availability
- **User Management**: Full user registration and management

## 🐛 Troubleshooting

### Common Issues

1. **Port 4200 already in use**
   ```bash
   ng serve --port 4201
   ```

2. **npm install errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Angular CLI not found**
   ```bash
   npm install -g @angular/cli
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ using Angular 20 and modern web technologies.
