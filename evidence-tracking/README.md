# Evidence Tracking System

A blockchain-based evidence management system for securely tracking the chain of custody for physical and digital evidence.

## Overview

The Evidence Tracking System provides a secure, transparent, and tamper-proof platform for law enforcement agencies to track the lifecycle of evidence from collection to disposal. By leveraging blockchain technology, the system ensures immutability of records and maintains a verifiable chain of custody.

## Features

- **Secure Authentication:** Role-based access control with JWT authentication
- **Evidence Submission:** Digital upload of evidence with metadata
- **Chain of Custody:** Complete audit trail of all evidence transfers
- **Evidence Verification:** Supervisor verification workflow
- **Role-Based Access Control:** Different access levels for officers, detectives, supervisors, and administrators
- **Real-time Updates:** WebSocket-based notifications for evidence status changes
- **Responsive UI:** Mobile-friendly interface for field use

## Tech Stack

### Frontend
- **React.js:** UI library for building component-based interfaces
- **React Router:** For client-side routing and navigation
- **Context API:** For state management across components
- **Tailwind CSS:** Utility-first CSS framework for responsive design
- **Axios:** HTTP client for API communication
- **Socket.io-client:** For real-time WebSocket communication

### Backend
- **Node.js:** JavaScript runtime for server-side code
- **Express:** Web application framework
- **JWT:** JSON Web Tokens for secure authentication
- **Socket.io:** For real-time bidirectional event-based communication
- **Multer:** For handling file uploads
- **Hyperledger Fabric (planned):** Enterprise blockchain platform for production deployment

### Methodologies
- **Context-based Authentication:** Using React Context API for managing auth state
- **Protected Routes:** Route-based access control with role verification
- **RESTful API Design:** Structured endpoints for resource management
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Real-time Updates:** WebSocket implementation for instant notifications

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Docker and Docker Compose (for future blockchain implementation)

### Setup

1. Clone the repository
```bash
git clone https://github.com/Varu19Git/Blockchain-based-Evidence-Management-System.git
cd Blockchain-based-Evidence-Management-System
```

2. Install backend dependencies
```bash
cd evidence-tracking/web-app/backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Start the backend server
```bash
cd ../backend
npm start
```

5. Start the frontend development server
```bash
cd ../frontend
npm start
```

6. The application should be running at http://localhost:3000

## Running on This Device

To run the application on your current device:

1. Start the backend server:
```bash
cd /home/tuf/go/src/github.com/Varu19Git/fabric-samples/evidence-tracking/web-app/backend
npm start
```

2. In a separate terminal, start the frontend:
```bash
cd /home/tuf/go/src/github.com/Varu19Git/fabric-samples/evidence-tracking/web-app/frontend
npm start
```

## Test Credentials

You can use the following credentials to test the application:

### Admin User
- **Email:** admin@evidencetrack.org
- **Password:** admin123

### Officer
- **Email:** jsmith@police.gov
- **Password:** password123

### Supervisor
- **Email:** mjohnson@police.gov
- **Password:** password123

### Detective
- **Email:** dcooper@police.gov
- **Password:** password123

### Pending Approval User
- **Email:** rwilson@police.gov
- **Password:** password123

## Closing and Reopening the Project

### To Close the Project Safely:

1. Stop the frontend server by pressing `Ctrl+C` in its terminal
2. Stop the backend server by pressing `Ctrl+C` in its terminal
3. If running Docker containers for blockchain (future implementation):
```bash
docker-compose down
```

### To Reopen the Project:

1. Navigate to the project directory:
```bash
cd /home/tuf/go/src/github.com/Varu19Git/fabric-samples/evidence-tracking
```

2. Start the backend:
```bash
cd web-app/backend
npm start
```

3. In a new terminal, start the frontend:
```bash
cd /home/tuf/go/src/github.com/Varu19Git/fabric-samples/evidence-tracking/web-app/frontend
npm start
```

## Customizing the UI

The application uses React components and Tailwind CSS for styling, making it easy to customize:

1. Main UI components are located in:
```
evidence-tracking/web-app/frontend/src/components/
```

2. Page components are in:
```
evidence-tracking/web-app/frontend/src/pages/
```

3. To modify styles, edit the Tailwind configuration:
```
evidence-tracking/web-app/frontend/tailwind.config.js
```

## Adding or Modifying Test Data

The application includes mock data for testing. To modify this:

1. Edit the mock evidence data in:
```
evidence-tracking/web-app/backend/src/index.js
```

2. Edit the mock user data in:
```
evidence-tracking/web-app/backend/src/utils/auth.js
```

## Project Structure

```
evidence-tracking/
├── chaincode/                # Hyperledger Fabric smart contracts
├── chaincode-go/             # Go implementation of smart contracts
├── network/                  # Hyperledger Fabric network config
├── web-app/
│   ├── backend/              # Node.js Express server
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── utils/        # Utility functions
│   │   │   └── index.js      # Server entry point
│   │
│   └── frontend/             # React frontend
│       ├── public/
│       └── src/
│           ├── components/   # Reusable UI components
│           ├── context/      # React Context providers
│           ├── pages/        # Page components
│           └── App.js        # Main application component
```

## Authentication System

The system implements a robust role-based authentication system with JWT tokens:

- **JWT Token-based Auth:** Secure authentication with expiring tokens
- **Role-based Access Control:** Different privileges for different roles
- **User Management:** Admin interface for user approval and management

### User Roles

1. **Officer:** Can submit and view evidence
2. **Detective:** Can view and analyze evidence
3. **Supervisor:** Can verify and update evidence status
4. **Administrator:** Full system access, user management

### Login Credentials (Demo)

#### Admin User
- **Username:** admin
- **Password:** admin123

#### Officer
- **Username:** jsmith
- **Password:** password123

#### Supervisor
- **Username:** mjohnson
- **Password:** password123

#### Detective
- **Username:** dcooper
- **Password:** password123

## UI Components

The UI is built with a component-based architecture using React and styled with Tailwind CSS:

- **Navigation:** Responsive navigation bar with role-based menu items
- **Authentication:** Login and registration forms with validation
- **Dashboard:** Role-specific dashboard with activity overview
- **Evidence List:** Searchable and filterable evidence records
- **Evidence Detail:** Comprehensive view of evidence information
- **Evidence Submission:** Multi-step form for evidence upload
- **Profile Management:** User profile editing capabilities

## API Endpoints

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `GET /api/auth/me`: Get current user info

### Evidence Management
- `GET /api/evidence`: List all evidence
- `GET /api/evidence/:id`: Get specific evidence details
- `POST /api/evidence`: Submit new evidence
- `PUT /api/evidence/:id/status`: Update evidence status

## Future Enhancements

1. **Blockchain Integration:** Full implementation with Hyperledger Fabric
2. **Advanced Search:** Elasticsearch integration for complex queries
3. **Evidence Analytics:** Statistical analysis and reporting features
4. **Mobile App:** Native mobile applications for field use
5. **Digital Evidence Processing:** Automated analysis of digital evidence

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 