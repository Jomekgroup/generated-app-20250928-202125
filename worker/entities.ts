import { IndexedEntity } from "./core-utils";
import type { User, Service, Booking, CleanerProfile, Review, Payment } from "@shared/types";
import { MOCK_USERS, MOCK_SERVICES, MOCK_BOOKINGS, MOCK_REVIEWS, MOCK_PAYMENTS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user (client or cleaner)
export class UserEntity extends IndexedEntity<User | CleanerProfile> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    name: "",
    email: "",
    role: "client",
    passwordHash: "" // In a real app, this would be a securely hashed password
  };
  static seedData = MOCK_USERS;
}
// SERVICE ENTITY: one DO instance per service
export class ServiceEntity extends IndexedEntity<Service> {
  static readonly entityName = "service";
  static readonly indexName = "services";
  static readonly initialState: Service = {
    id: "",
    cleanerId: "",
    name: "",
    description: "",
    price: 0,
    priceUnit: "flat_rate",
  };
  static seedData = MOCK_SERVICES;
}
// BOOKING ENTITY: one DO instance per booking
export class BookingEntity extends IndexedEntity<Booking> {
  static readonly entityName = "booking";
  static readonly indexName = "bookings";
  static readonly initialState: Booking = {
    id: "",
    clientId: "",
    cleanerId: "",
    serviceId: "",
    bookingDate: "",
    status: "pending",
    address: "",
    totalCost: 0,
  };
  static seedData = MOCK_BOOKINGS;
}
// REVIEW ENTITY: one DO instance per review
export class ReviewEntity extends IndexedEntity<Review> {
  static readonly entityName = "review";
  static readonly indexName = "reviews";
  static readonly initialState: Review = {
    id: "",
    bookingId: "",
    clientId: "",
    cleanerId: "",
    authorName: "",
    rating: 0,
    comment: "",
    date: "",
  };
  static seedData = MOCK_REVIEWS;
}
// PAYMENT ENTITY: one DO instance per payment notification
export class PaymentEntity extends IndexedEntity<Payment> {
  static readonly entityName = "payment";
  static readonly indexName = "payments";
  static readonly initialState: Payment = {
    id: "",
    cleanerId: "",
    cleanerName: "",
    amount: 0,
    type: "premium",
    status: "pending",
    createdAt: "",
  };
  static seedData = MOCK_PAYMENTS;
}