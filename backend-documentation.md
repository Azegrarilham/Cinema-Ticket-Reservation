# Backend Documentation

## Overview

This document provides a comprehensive overview of the backend architecture for the cinema management system. The application is built using Laravel PHP framework with MySQL database, following MVC design pattern and RESTful API principles.

## Tech Stack

- **Framework**: Laravel
- **Language**: PHP
- **Database**: MySQL
- **Authentication**: Laravel's built-in authentication with guards for multi-role support
- **API**: RESTful API endpoints
- **Frontend Integration**: Inertia.js
- **File Storage**: Laravel's Storage facade

## Architecture

The backend follows a layered architecture with clear separation of concerns:

```
app/
├── Console/              # Console commands
├── Exceptions/           # Exception handlers
├── Http/
│   ├── Controllers/      # Request handlers
│   │   ├── Admin/        # Admin area controllers
│   │   ├── Api/          # API controllers
│   │   ├── Auth/         # Authentication controllers
│   │   └── Settings/     # Settings controllers
│   ├── Middleware/       # HTTP middleware
│   └── Requests/         # Form requests for validation
├── Models/               # Database models
├── Notifications/        # Notification classes
├── Policies/             # Authorization policies
├── Providers/            # Service providers
└── Services/             # Business logic services
```

## Database Schema

The application uses a relational database with the following main tables:

- **users**: Stores user authentication and profile data
- **films**: Stores movie information
- **screenings**: Stores screening schedule information
- **seats**: Stores seat information per screening
- **reservations**: Stores ticket booking information
- **reservation_seats**: Maps reservations to specific seats
- **payments**: Stores payment information for reservations

## Models and Relationships

### Entity Relationship Diagram

```mermaid
erDiagram
    FILM {
        id int PK
        title string
        description text
        duration int
        poster_image string
        genre string
        release_date date
        director string
        is_featured boolean
        created_at timestamp
        updated_at timestamp
    }

    SCREENING {
        id int PK
        film_id int FK
        start_time datetime
        room string
        total_seats int
        price decimal
        is_active boolean
        created_at timestamp
        updated_at timestamp
    }

    SEAT {
        id int PK
        screening_id int FK
        row string
        number int
        status string
        created_at timestamp
        updated_at timestamp
    }

    RESERVATION {
        id int PK
        user_id int FK
        screening_id int FK
        status string
        total_amount decimal
        confirmation_code string
        created_at timestamp
        updated_at timestamp
    }

    RESERVATION_SEAT {
        id int PK
        reservation_id int FK
        seat_id int FK
        price decimal
        created_at timestamp
        updated_at timestamp
    }

    PAYMENT {
        id int PK
        reservation_id int FK
        amount decimal
        payment_method string
        status string
        transaction_id string
        created_at timestamp
        updated_at timestamp
    }

    USER {
        id int PK
        name string
        email string
        password string
        role string
        is_admin boolean
        email_verified_at timestamp
        last_login_at timestamp
        created_at timestamp
        updated_at timestamp
    }

    FILM ||--o{ SCREENING : "has many"
    SCREENING ||--o{ SEAT : "has many"
    SCREENING ||--o{ RESERVATION : "has many"
    USER ||--o{ RESERVATION : "has many"
    RESERVATION ||--o{ RESERVATION_SEAT : "has many"
    RESERVATION ||--o{ PAYMENT : "has many"
    SEAT ||--o{ RESERVATION_SEAT : "belongs to many"
```

## Controller Structure

The application follows RESTful controller patterns with specialized controllers for different domains:

### Class Hierarchy

```mermaid
classDiagram
    class Controller {
        +__construct()
    }

    class FilmController {
        +index(Request request)
        +show(Film film)
        +home()
    }

    class ReservationController {
        +seatSelection(Screening screening)
        +store(Request request, Screening screening)
        +payment(Reservation reservation)
        +processPayment(Request request, Reservation reservation)
        +confirmation(Reservation reservation)
        +downloadTicket(Reservation reservation)
        +userReservations()
        +show(Reservation reservation)
    }

    class AccountController {
        +index()
        +settings()
        +updateProfile(Request request)
        +updatePassword(Request request)
    }

    class AdminFilmController {
        +index(Request request)
        +create()
        +store(Request request)
        +edit(Film film)
        +update(Request request, Film film)
        +destroy(Film film)
    }

    class AdminReservationController {
        +index(Request request)
        +show(Reservation reservation)
        +updateStatus(Request request, Reservation reservation)
        +destroy(Reservation reservation)
    }

    class ScreeningController {
        +index(Request request)
        +create()
        +store(Request request)
        +edit(Screening screening)
        +update(Request request, Screening screening)
        +destroy(Screening screening)
        +filmScreenings(Film film)
        +repairSeats(Screening screening)
    }

    class AuthController {
        +login()
        +authenticate(Request request)
        +logout(Request request)
    }

    Controller <|-- FilmController
    Controller <|-- ReservationController
    Controller <|-- AccountController
    Controller <|-- AdminFilmController
    Controller <|-- AdminReservationController
    Controller <|-- ScreeningController
    Controller <|-- AuthController
```

## Authentication Flow

The application uses Laravel's authentication system with multiple guards for different user roles:

```mermaid
graph TD
    A[User Visits Login Page] --> B{Has Account?}
    B -->|Yes| C[Enter Credentials]
    B -->|No| D[Register New Account]
    D --> E[Verify Email]
    E --> C
    C --> F{Valid Credentials?}
    F -->|No| G[Show Error]
    G --> C
    F -->|Yes| H{User Role?}
    H -->|Admin| I[Redirect to Admin Dashboard]
    H -->|Client| J[Redirect to Client Dashboard]

    style A fill:#f9f9f9,stroke:#333,stroke-width:1px
    style B fill:#e6f7ff,stroke:#333,stroke-width:1px
    style C fill:#f0f0f0,stroke:#333,stroke-width:1px
    style F fill:#e6f7ff,stroke:#333,stroke-width:1px
    style H fill:#e6f7ff,stroke:#333,stroke-width:1px
    style I fill:#f0f0f0,stroke:#333,stroke-width:1px
    style J fill:#f0f0f0,stroke:#333,stroke-width:1px
```

## Middleware Pipeline

The application uses middleware to handle authentication, authorization, and other cross-cutting concerns:

```mermaid
graph LR
    A[Client Request] --> B[HandleInertiaRequests]
    B --> C{Route Group?}
    C -->|Admin Routes| D[EnsureUserIsAdmin]
    C -->|Client Routes| E[EnsureUserIsClient]
    D --> F[Admin Controller]
    E --> G[Client Controller]
    F --> H[Response]
    G --> H

    style A fill:#f9f9f9,stroke:#333,stroke-width:1px
    style B fill:#e6f7ff,stroke:#333,stroke-width:1px
    style C fill:#f0f0f0,stroke:#333,stroke-width:1px
    style D fill:#f5f5f5,stroke:#333,stroke-width:1px
    style E fill:#f5f5f5,stroke:#333,stroke-width:1px
    style F fill:#e6f7ff,stroke:#333,stroke-width:1px
    style G fill:#e6f7ff,stroke:#333,stroke-width:1px
    style H fill:#f9f9f9,stroke:#333,stroke-width:1px
```

## Reservation Flow

The reservation process follows a multi-step flow with transaction handling:

```mermaid
sequenceDiagram
    participant User
    participant ReservationController
    participant ScreeningModel
    participant ReservationModel
    participant PaymentModel
    participant EmailNotification

    User->>ReservationController: Select Screening
    ReservationController->>ScreeningModel: Get Available Seats
    ScreeningModel-->>ReservationController: Available Seats
    ReservationController-->>User: Seat Selection UI

    User->>ReservationController: Select Seats & Submit
    ReservationController->>ReservationModel: Create Reservation
    ReservationModel->>ReservationModel: Lock Selected Seats
    ReservationModel-->>ReservationController: Reservation Created
    ReservationController-->>User: Payment Page

    User->>ReservationController: Submit Payment Details
    ReservationController->>PaymentModel: Process Payment
    PaymentModel-->>ReservationController: Payment Result

    alt Payment Successful
        ReservationController->>ReservationModel: Confirm Reservation
        ReservationController->>EmailNotification: Send Confirmation
        EmailNotification-->>User: Email with Tickets
        ReservationController-->>User: Confirmation Page
    else Payment Failed
        ReservationController->>ReservationModel: Release Seats
        ReservationController-->>User: Payment Failed Page
    end
```

## Key Files and Their Responsibilities

### Models

- **Film.php**: Manages film data with relationships to screenings and reservations
- **Screening.php**: Handles screening schedules with seat availability tracking
- **Seat.php**: Manages individual seats for screenings
- **Reservation.php**: Handles booking data with payment processing
- **User.php**: Manages user authentication and profile data

### Controllers

- **FilmController.php**: Handles film listing and details for customers
- **ReservationController.php**: Manages the reservation process flow
- **Admin/FilmController.php**: Provides CRUD operations for films in admin area
- **Admin/ScreeningController.php**: Manages screening schedules in admin area
- **Admin/ReservationController.php**: Handles reservation management in admin area

### Middleware

- **EnsureUserIsAdmin.php**: Protects admin routes from unauthorized access
- **EnsureUserIsClient.php**: Ensures user has appropriate client role
- **HandleInertiaRequests.php**: Prepares data for Inertia.js frontend

## API Endpoints

The application provides API endpoints for internal use by the frontend:

### Film Endpoints

- `GET /api/films`: Get list of films with pagination
- `GET /api/films/{id}`: Get details of a specific film
- `POST /api/films` (Admin): Create a new film
- `PUT /api/films/{id}` (Admin): Update film details
- `DELETE /api/films/{id}` (Admin): Delete a film

### Screening Endpoints

- `GET /api/screenings`: Get list of screenings
- `GET /api/films/{id}/screenings`: Get screenings for a specific film
- `GET /api/screenings/{id}/seats`: Get seat availability for a screening
- `POST /api/screenings` (Admin): Create a new screening
- `PUT /api/screenings/{id}` (Admin): Update screening details

### Reservation Endpoints

- `POST /api/reservations`: Create a new reservation
- `GET /api/reservations/{code}`: Get reservation details by confirmation code
- `GET /api/user/reservations`: Get all reservations for the authenticated user
- `POST /api/reservations/{id}/payment`: Process payment for a reservation

## Security Considerations

The backend implements these security measures:

1. **Authentication**: Laravel's secure authentication system
2. **Authorization**: Policy-based access control for resources
3. **CSRF Protection**: Cross-site request forgery protection
4. **Validation**: Input validation using Form Request classes
5. **Database**: Parameterized queries to prevent SQL injection
6. **Sessions**: Secure session handling with regeneration
7. **File Uploads**: Validation of uploaded files and secure storage

## Error Handling

The application uses Laravel's exception handling system with customized responses:

1. **Validation Errors**: Returned as structured JSON for API requests
2. **Authentication Errors**: Redirect to login or return 401 responses
3. **Authorization Errors**: Return 403 responses with appropriate messages
4. **Not Found Errors**: Return 404 responses or redirect to fallback routes
5. **Server Errors**: Logged for debugging and generic error shown to users

## Database Transactions

Critical operations are wrapped in database transactions to ensure data integrity:

1. **Reservation Creation**: Seats reservation and payment processing
2. **Screening Management**: Seat creation and management
3. **User Registration**: User creation and initial settings

## Performance Optimizations

The application implements these performance optimizations:

1. **Eager Loading**: Avoid N+1 query issues with relationships
2. **Caching**: Cache frequently accessed data like film listings
3. **Pagination**: Paginate large result sets
4. **Indexing**: Database indexes on frequently queried columns
5. **Query Optimization**: Optimized queries for performance

## Admin Features

The admin area provides these management capabilities:

1. **Dashboard**: Overview with key metrics and statistics
2. **Film Management**: CRUD operations for films
3. **Screening Management**: Schedule management with seat setup
4. **Reservation Management**: View, update, and cancel reservations
5. **Report Generation**: Box office, revenue, and attendance reports

## Conclusion

The backend architecture provides a robust foundation for the cinema management system with a focus on security, performance, and maintainability. The MVC design pattern with clear separation of concerns allows for easy extension and modification as requirements evolve.
