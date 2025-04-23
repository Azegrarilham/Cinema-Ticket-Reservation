# Class Diagram Documentation

## Overview

This document provides a comprehensive overview of the class structure for the cinema management system. It illustrates the relationships between different classes in the application, their properties, methods, and how they interact with each other.

## Application Architecture Class Diagram

```mermaid
classDiagram
    %% Core Models
    class Model {
        <<Abstract>>
        +timestamps()
        +find()
        +create()
        +update()
        +delete()
        +save()
    }

    class User {
        -id: int
        -name: string
        -email: string
        -password: string
        -email_verified_at: timestamp
        -role: string
        -is_admin: boolean
        -last_login_at: timestamp
        -remember_token: string
        -created_at: timestamp
        -updated_at: timestamp
        +reservations()
        +isAdmin(): boolean
        +hasVerifiedEmail(): boolean
    }

    class Film {
        -id: int
        -title: string
        -description: text
        -duration: int
        -poster_image: string
        -genre: string
        -release_date: date
        -director: string
        -is_featured: boolean
        -created_at: timestamp
        -updated_at: timestamp
        +screenings()
        +futureScreenings()
        +reservations()
        +getFeatured(): Collection
    }

    class Screening {
        -id: int
        -film_id: int
        -start_time: datetime
        -room: string
        -total_seats: int
        -price: decimal
        -is_active: boolean
        -created_at: timestamp
        -updated_at: timestamp
        +film()
        +seats()
        +reservations()
        +getAvailableSeatsCountAttribute(): int
        +getIsFullyBookedAttribute(): boolean
        +getEndTimeAttribute(): datetime
        +reservationSeats()
    }

    class Seat {
        -id: int
        -screening_id: int
        -row: string
        -number: int
        -status: string
        -created_at: timestamp
        -updated_at: timestamp
        +screening()
        +reservationSeats()
        +isAvailable(): boolean
        +getLabel(): string
    }

    class Reservation {
        -id: int
        -user_id: int
        -screening_id: int
        -status: string
        -total_amount: decimal
        -confirmation_code: string
        -created_at: timestamp
        -updated_at: timestamp
        +user()
        +screening()
        +reservationSeats()
        +seats()
        +payments()
        +isPaid(): boolean
        +isConfirmed(): boolean
        +generateConfirmationCode()
    }

    class ReservationSeat {
        -id: int
        -reservation_id: int
        -seat_id: int
        -price: decimal
        -created_at: timestamp
        -updated_at: timestamp
        +reservation()
        +seat()
    }

    class Payment {
        -id: int
        -reservation_id: int
        -amount: decimal
        -payment_method: string
        -status: string
        -transaction_id: string
        -created_at: timestamp
        -updated_at: timestamp
        +reservation()
        +isCompleted(): boolean
        +markAsCompleted()
    }

    %% Controllers
    class Controller {
        <<Abstract>>
    }

    class FilmController {
        +index(Request request)
        +show(Film film)
        +home()
    }

    class AdminFilmController {
        +index(Request request)
        +create()
        +store(Request request)
        +edit(Film film)
        +update(Request request, Film film)
        +destroy(Film film)
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
        +searchForm()
        +search(Request request)
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

    class AccountController {
        +index()
        +settings()
        +updateProfile(Request request)
        +updatePassword(Request request)
    }

    class DashboardController {
        +index()
    }

    class ReportController {
        +films()
        +revenue()
        +screenings()
    }

    %% Services
    class PaymentService {
        +processPayment(Reservation reservation, array paymentDetails)
        +generateTransactionId(): string
        +validatePayment(array paymentDetails): bool
        +recordPayment(Reservation reservation, array paymentDetails): Payment
    }

    class ReservationService {
        +createReservation(Screening screening, array seatIds, User user): Reservation
        +calculateTotalAmount(Screening screening, array seatIds): decimal
        +reserveSeats(Reservation reservation, array seatIds)
        +releaseSeats(Reservation reservation)
        +generateConfirmationCode(): string
    }

    class PDFService {
        +generateTicket(Reservation reservation): PDF
        +generateHeader(): void
        +generateTicketDetails(Reservation reservation): void
        +generateQRCode(string confirmationCode): void
        +generateFooter(): void
    }

    class NotificationService {
        +sendTicketConfirmation(Reservation reservation)
        +sendPaymentConfirmation(Payment payment)
        +sendReservationReminder(Reservation reservation)
    }

    %% Middleware
    class Middleware {
        <<Interface>>
        +handle(Request request, Closure next)
    }

    class EnsureUserIsAdmin {
        +handle(Request request, Closure next)
    }

    class EnsureUserIsClient {
        +handle(Request request, Closure next)
    }

    class HandleInertiaRequests {
        +handle(Request request, Closure next)
        +share(Request request)
    }

    %% Model Relationships
    Model <|-- User
    Model <|-- Film
    Model <|-- Screening
    Model <|-- Seat
    Model <|-- Reservation
    Model <|-- ReservationSeat
    Model <|-- Payment

    User "1" -- "0..*" Reservation : has
    Film "1" -- "0..*" Screening : has
    Screening "1" -- "0..*" Seat : contains
    Screening "1" -- "0..*" Reservation : has
    Reservation "1" -- "0..*" ReservationSeat : has
    Reservation "1" -- "0..*" Payment : has
    Seat "1" -- "0..*" ReservationSeat : included in

    %% Controller Relationships
    Controller <|-- FilmController
    Controller <|-- AdminFilmController
    Controller <|-- ReservationController
    Controller <|-- AdminReservationController
    Controller <|-- ScreeningController
    Controller <|-- AccountController
    Controller <|-- DashboardController
    Controller <|-- ReportController

    %% Controller to Model Dependencies
    FilmController --> Film
    AdminFilmController --> Film
    ReservationController --> Reservation
    ReservationController --> Screening
    ReservationController --> Seat
    AdminReservationController --> Reservation
    ScreeningController --> Screening
    ScreeningController --> Film
    ScreeningController --> Seat
    AccountController --> User

    %% Controller to Service Dependencies
    ReservationController --> PaymentService
    ReservationController --> ReservationService
    ReservationController --> PDFService
    ReservationController --> NotificationService
    AdminReservationController --> ReservationService

    %% Middleware Dependencies
    Middleware <|-- EnsureUserIsAdmin
    Middleware <|-- EnsureUserIsClient
    Middleware <|-- HandleInertiaRequests
    EnsureUserIsAdmin --> User
    EnsureUserIsClient --> User
```

## Model Layer Class Diagram

```mermaid
classDiagram
    class Model {
        <<Abstract>>
        +timestamps()
        +find()
        +create()
        +update()
        +delete()
        +save()
    }

    class User {
        -id: int
        -name: string
        -email: string
        -password: string
        -email_verified_at: timestamp
        -role: string
        -is_admin: boolean
        -last_login_at: timestamp
        -remember_token: string
        -created_at: timestamp
        -updated_at: timestamp
        +reservations()
        +isAdmin(): boolean
        +hasVerifiedEmail(): boolean
    }

    class Film {
        -id: int
        -title: string
        -description: text
        -duration: int
        -poster_image: string
        -genre: string
        -release_date: date
        -director: string
        -is_featured: boolean
        -created_at: timestamp
        -updated_at: timestamp
        +screenings()
        +futureScreenings()
        +reservations()
        +getFeatured(): Collection
    }

    class Screening {
        -id: int
        -film_id: int
        -start_time: datetime
        -room: string
        -total_seats: int
        -price: decimal
        -is_active: boolean
        -created_at: timestamp
        -updated_at: timestamp
        +film()
        +seats()
        +reservations()
        +getAvailableSeatsCountAttribute(): int
        +getIsFullyBookedAttribute(): boolean
        +getEndTimeAttribute(): datetime
        +reservationSeats()
    }

    class Seat {
        -id: int
        -screening_id: int
        -row: string
        -number: int
        -status: string
        -created_at: timestamp
        -updated_at: timestamp
        +screening()
        +reservationSeats()
        +isAvailable(): boolean
        +getLabel(): string
    }

    class Reservation {
        -id: int
        -user_id: int
        -screening_id: int
        -status: string
        -total_amount: decimal
        -confirmation_code: string
        -created_at: timestamp
        -updated_at: timestamp
        +user()
        +screening()
        +reservationSeats()
        +seats()
        +payments()
        +isPaid(): boolean
        +isConfirmed(): boolean
        +generateConfirmationCode()
    }

    class ReservationSeat {
        -id: int
        -reservation_id: int
        -seat_id: int
        -price: decimal
        -created_at: timestamp
        -updated_at: timestamp
        +reservation()
        +seat()
    }

    class Payment {
        -id: int
        -reservation_id: int
        -amount: decimal
        -payment_method: string
        -status: string
        -transaction_id: string
        -created_at: timestamp
        -updated_at: timestamp
        +reservation()
        +isCompleted(): boolean
        +markAsCompleted()
    }

    Model <|-- User
    Model <|-- Film
    Model <|-- Screening
    Model <|-- Seat
    Model <|-- Reservation
    Model <|-- ReservationSeat
    Model <|-- Payment

    User "1" -- "0..*" Reservation : has
    Film "1" -- "0..*" Screening : has
    Screening "1" -- "0..*" Seat : contains
    Screening "1" -- "0..*" Reservation : has
    Reservation "1" -- "0..*" ReservationSeat : has
    Reservation "1" -- "0..*" Payment : has
    Seat "1" -- "0..*" ReservationSeat : included in
```

## Controller Layer Class Diagram

```mermaid
classDiagram
    class Controller {
        <<Abstract>>
    }

    class FilmController {
        +index(Request request)
        +show(Film film)
        +home()
    }

    class AdminFilmController {
        +index(Request request)
        +create()
        +store(Request request)
        +edit(Film film)
        +update(Request request, Film film)
        +destroy(Film film)
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
        +searchForm()
        +search(Request request)
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

    class AccountController {
        +index()
        +settings()
        +updateProfile(Request request)
        +updatePassword(Request request)
    }

    class DashboardController {
        +index()
    }

    class ReportController {
        +films()
        +revenue()
        +screenings()
    }

    class AuthController {
        +login()
        +authenticate(Request request)
        +logout(Request request)
        +register()
        +store(Request request)
        +verifyEmail(string id, string hash)
        +forgotPassword()
        +sendResetLink(Request request)
        +resetPassword(string token)
        +updatePassword(Request request)
    }

    Controller <|-- FilmController
    Controller <|-- AdminFilmController
    Controller <|-- ReservationController
    Controller <|-- AdminReservationController
    Controller <|-- ScreeningController
    Controller <|-- AccountController
    Controller <|-- DashboardController
    Controller <|-- ReportController
    Controller <|-- AuthController
```

## Service Layer Class Diagram

```mermaid
classDiagram
    class PaymentService {
        +processPayment(Reservation reservation, array paymentDetails)
        +generateTransactionId(): string
        +validatePayment(array paymentDetails): bool
        +recordPayment(Reservation reservation, array paymentDetails): Payment
    }

    class ReservationService {
        +createReservation(Screening screening, array seatIds, User user): Reservation
        +calculateTotalAmount(Screening screening, array seatIds): decimal
        +reserveSeats(Reservation reservation, array seatIds)
        +releaseSeats(Reservation reservation)
        +generateConfirmationCode(): string
    }

    class PDFService {
        +generateTicket(Reservation reservation): PDF
        +generateHeader(): void
        +generateTicketDetails(Reservation reservation): void
        +generateQRCode(string confirmationCode): void
        +generateFooter(): void
    }

    class NotificationService {
        +sendTicketConfirmation(Reservation reservation)
        +sendPaymentConfirmation(Payment payment)
        +sendReservationReminder(Reservation reservation)
    }

    class FilmService {
        +getFiltered(array filters): Collection
        +getFeatured(): Collection
        +storeImage(UploadedFile image): string
        +deleteImage(string path): bool
    }

    class ScreeningService {
        +createWithSeats(array data): Screening
        +setupSeats(Screening screening)
        +getUpcoming(): Collection
        +checkAvailability(Screening screening): bool
    }

    class ReportService {
        +getFilmsStats(DatePeriod period): array
        +getRevenueStats(DatePeriod period): array
        +getScreeningsStats(DatePeriod period): array
        +getDashboardStats(): array
    }

    PaymentService --> Payment
    ReservationService --> Reservation
    ReservationService --> Seat
    PDFService --> Reservation
    NotificationService --> Reservation
    NotificationService --> Payment
    FilmService --> Film
    ScreeningService --> Screening
    ScreeningService --> Seat
    ReportService --> Film
    ReportService --> Screening
    ReportService --> Reservation
    ReportService --> Payment
```

## Middleware Class Diagram

```mermaid
classDiagram
    class Middleware {
        <<Interface>>
        +handle(Request request, Closure next)
    }

    class EnsureUserIsAdmin {
        +handle(Request request, Closure next)
    }

    class EnsureUserIsClient {
        +handle(Request request, Closure next)
    }

    class HandleInertiaRequests {
        +handle(Request request, Closure next)
        +share(Request request)
    }

    class Authenticate {
        +handle(Request request, Closure next)
        +redirectTo(Request request): string
    }

    class VerifyCsrfToken {
        +handle(Request request, Closure next)
        +tokensMatch(Request request): bool
    }

    class HandleAppearance {
        +handle(Request request, Closure next)
    }

    Middleware <|-- EnsureUserIsAdmin
    Middleware <|-- EnsureUserIsClient
    Middleware <|-- HandleInertiaRequests
    Middleware <|-- Authenticate
    Middleware <|-- VerifyCsrfToken
    Middleware <|-- HandleAppearance
```

## Authentication System Class Diagram

```mermaid
classDiagram
    class Authenticatable {
        <<Interface>>
        +getAuthIdentifierName(): string
        +getAuthIdentifier()
        +getAuthPassword(): string
        +getRememberToken(): string
        +setRememberToken(string value)
        +getRememberTokenName(): string
    }

    class User {
        -id: int
        -name: string
        -email: string
        -password: string
        -email_verified_at: timestamp
        -role: string
        -is_admin: boolean
        -last_login_at: timestamp
        -remember_token: string
        -created_at: timestamp
        -updated_at: timestamp
        +reservations()
        +isAdmin(): boolean
        +hasVerifiedEmail(): boolean
    }

    class AuthController {
        +login()
        +authenticate(Request request)
        +logout(Request request)
        +register()
        +store(Request request)
        +verifyEmail(string id, string hash)
        +forgotPassword()
        +sendResetLink(Request request)
        +resetPassword(string token)
        +updatePassword(Request request)
    }

    class Auth {
        <<Static>>
        +guard(string name): Guard
        +check(): bool
        +guest(): bool
        +user(): ?Authenticatable
        +id(): ?int
        +validate(array credentials): bool
        +attempt(array credentials, bool remember): bool
        +login(Authenticatable user, bool remember): void
        +logout(): void
    }

    class SessionGuard {
        -provider: UserProvider
        -session: Session
        -request: Request
        +check(): bool
        +guest(): bool
        +user(): ?Authenticatable
        +id(): ?int
        +validate(array credentials): bool
        +attempt(array credentials, bool remember): bool
        +login(Authenticatable user, bool remember): void
        +logout(): void
    }

    class DatabaseUserProvider {
        -hasher: Hasher
        -model: string
        +retrieveById(string identifier): ?Authenticatable
        +retrieveByToken(string identifier, string token): ?Authenticatable
        +updateRememberToken(Authenticatable user, string token): void
        +retrieveByCredentials(array credentials): ?Authenticatable
        +validateCredentials(Authenticatable user, array credentials): bool
    }

    Authenticatable <|.. User
    Auth --> SessionGuard
    SessionGuard --> DatabaseUserProvider
    DatabaseUserProvider --> User
    AuthController --> Auth
```

## Detailed Class Descriptions

### Models

#### User

Represents a user in the system with authentication information and role-based permissions.

- **Relations**: One-to-many with Reservations
- **Key Methods**: `isAdmin()`, `hasVerifiedEmail()`

#### Film

Represents a movie that can be screened in the cinema.

- **Relations**: One-to-many with Screenings, Has-many-through with Reservations
- **Key Methods**: `screenings()`, `futureScreenings()`, `getFeatured()`

#### Screening

Represents a scheduled showing of a film at a specific time and room.

- **Relations**: Belongs-to Film, One-to-many with Seats and Reservations
- **Key Methods**: `getAvailableSeatsCountAttribute()`, `getIsFullyBookedAttribute()`, `getEndTimeAttribute()`

#### Seat

Represents an individual seat for a screening.

- **Relations**: Belongs-to Screening, One-to-many with ReservationSeats
- **Key Methods**: `isAvailable()`, `getLabel()`

#### Reservation

Represents a booking made by a user for one or more seats at a screening.

- **Relations**: Belongs-to User and Screening, One-to-many with ReservationSeats and Payments
- **Key Methods**: `isPaid()`, `isConfirmed()`, `generateConfirmationCode()`

#### ReservationSeat

Represents the association between a reservation and a specific seat.

- **Relations**: Belongs-to Reservation and Seat

#### Payment

Represents a payment transaction for a reservation.

- **Relations**: Belongs-to Reservation
- **Key Methods**: `isCompleted()`, `markAsCompleted()`

### Controllers

#### FilmController

Handles client-facing film-related requests.

- **Key Methods**: `index()`, `show()`, `home()`

#### AdminFilmController

Handles admin film management operations.

- **Key Methods**: `index()`, `create()`, `store()`, `edit()`, `update()`, `destroy()`

#### ReservationController

Handles the reservation process for clients.

- **Key Methods**: `seatSelection()`, `store()`, `payment()`, `processPayment()`, `confirmation()`, `downloadTicket()`

#### AdminReservationController

Handles reservation management for admins.

- **Key Methods**: `index()`, `show()`, `updateStatus()`, `destroy()`

#### ScreeningController

Handles admin screening management operations.

- **Key Methods**: `index()`, `store()`, `update()`, `filmScreenings()`, `repairSeats()`

#### AccountController

Handles user account management operations.

- **Key Methods**: `index()`, `settings()`, `updateProfile()`, `updatePassword()`

### Services

#### PaymentService

Handles payment processing logic.

- **Key Methods**: `processPayment()`, `validatePayment()`, `recordPayment()`

#### ReservationService

Handles reservation business logic.

- **Key Methods**: `createReservation()`, `calculateTotalAmount()`, `reserveSeats()`, `releaseSeats()`

#### PDFService

Handles PDF generation for tickets.

- **Key Methods**: `generateTicket()`, `generateQRCode()`

#### NotificationService

Handles notification delivery for various events.

- **Key Methods**: `sendTicketConfirmation()`, `sendPaymentConfirmation()`, `sendReservationReminder()`

### Middleware

#### EnsureUserIsAdmin

Ensures that the authenticated user has admin privileges.

- **Key Methods**: `handle()`

#### EnsureUserIsClient

Ensures that the user has appropriate client role.

- **Key Methods**: `handle()`

#### HandleInertiaRequests

Prepares data for Inertia.js frontend.

- **Key Methods**: `handle()`, `share()`
