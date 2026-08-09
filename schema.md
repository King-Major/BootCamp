# API and Database Schema

## Registration Collection (`Registration`)

Fields:
- `firstName` (String, required)
- `middleName` (String, optional)
- `lastName` (String, required)
- `email` (String, required, unique)
- `dateOfBirth` (Date, required)
- `course` (String, required)
- `hasLaptop` (Boolean, required)
- `status` (String, enum: `pending`, `confirmed`, `checked-in`, default `confirmed`)
- `qrCode` (String, data URL for QR code image)
- `paymentReference` (String)
- `amountPaid` (Number)
- `paidAt` (Date)
- `createdAt` (Date)

## API Endpoints

### `POST /api/payment/initialize`
Request body:
- `firstName` (string)
- `middleName` (string, optional)
- `lastName` (string)
- `email` (string)
- `dateOfBirth` (string, ISO date)
- `course` (string)
- `hasLaptop` (boolean)

Response:
- `success` (boolean)
- `reference` (string)
- `publicKey` (string)
- `amount` (number, in kobo)

### `POST /api/payment/verify`
Request body:
- `reference` (string)

Response:
- `success` (boolean)
- `verified` (boolean)
- `registrationId` (string)

### Optional webhook
- `POST /api/payment/webhook`
- A webhook endpoint can be added to receive Paystack `charge.success` events and save registrations if front-end verification is missed.
