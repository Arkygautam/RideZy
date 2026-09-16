# RideZy — Campus Ride-Sharing Platform

> A real-time campus ride-sharing platform built for IIM Shillong students.

Live Demo:(https://ridezy-app.web.app/)

## 🚀 Problem

Students often coordinate shared cabs through fragmented WhatsApp groups, making it difficult to discover rides, track seats, and manage cancellations.

RideZy provides a centralized platform for discovering and coordinating campus rides.

## 💡 Key Features

* 🔐 IIM Shillong institute email authentication
* 🔑 Email/Password & Microsoft SSO
* 👤 Student profile and phone setup
* 🚕 Create and discover rides
* 💺 Transaction-safe seat management
* 🤝 Join and leave rides
* ❌ Ride cancellation
* 🔔 Push notifications for relevant ride updates
* ☁️ Firebase-powered backend

## 📸 Screenshots

### Login & Authentication

![RideZy Login](screenshots/login.png)

### Ride Dashboard

![RideZy Dashboard](screenshots/dashboard.png)

### Create a Ride

![Create Ride](screenshots/create-ride.png)

### Available Rides

![Available Rides](screenshots/available-rides.png)

### Join Ride

![Join Ride](screenshots/join-ride.png)

### Notifications

![Notifications](screenshots/notifications.png)

## ⚙️ Engineering Highlights

### Transaction-Safe Seat Management

RideZy uses Firestore transactions when students join or leave rides.

This ensures seat counts remain consistent even when multiple users interact with the same ride.

Join:
`Validate Ride → Check Seats → Increment bookedSeats → Create Joiner`

Leave:
`Validate Joiner → Decrement bookedSeats → Remove Joiner`

### 🔔 Notification System

RideZy uses Firebase Cloud Messaging (FCM) to deliver relevant ride notifications without unnecessarily notifying the entire student community.

### 🔒 Access Control

Firebase Authentication and Firestore Security Rules control access to user profiles, rides, and ride participation data.

## 🏗️ Tech Stack

| Layer          | Technology               |
| -------------- | ------------------------ |
| Frontend       | HTML, CSS, JavaScript    |
| Authentication | Firebase Authentication  |
| Database       | Cloud Firestore          |
| Notifications  | Firebase Cloud Messaging |
| Hosting        | Firebase Hosting         |

## 📂 Project Structure

```text
RideZy/
├── index.html
├── app.v2.js
├── style.v2.css
├── firebase.json
├── firebase-messaging-sw.js
└── 404.html
```

## 🔄 Ride Lifecycle

Create → Discover → Join → Leave / Cancel

The ride creator is automatically counted as one booked seat.

## 🎯 Why RideZy?

RideZy was built to solve a real campus mobility problem while applying software engineering concepts to a real-world product.

The project combines authentication, database design, transactions, access control, notifications, and product development in a production-deployed application.

## 👨‍💻 Author

Akar Gautam
PGP26 | IIM Shillong
