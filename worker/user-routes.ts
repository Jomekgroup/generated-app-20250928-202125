import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import type { Env } from './core-utils';
import { UserEntity, ServiceEntity, BookingEntity, ReviewEntity, PaymentEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { CleanerProfile, User, Booking, Review, Service, Payment } from "@shared/types";
// MOCK AUTH MIDDLEWARE
const MOCK_TOKEN = 'secret-token'; // Kept for login/register compatibility
const MOCK_CLIENT_TOKEN = 'client-secret-token';
const MOCK_CLEANER_TOKEN = 'cleaner-secret-token';
const MOCK_ADMIN_TOKEN = 'admin-secret-token';
const mockAuthMiddleware = bearerAuth({
  verifyToken: async (token, c) => {
    const users = (await UserEntity.list(c.env)).items;
    const clientUser = users.find(u => u.role === 'client');
    const cleanerUser = users.find(u => u.role === 'cleaner');
    const adminUser = users.find(u => u.role === 'admin');
    if (token === MOCK_CLIENT_TOKEN || token === MOCK_TOKEN) {
      c.set('userId', clientUser?.id || 'client-1');
      c.set('userRole', 'client');
      return true;
    }
    if (token === MOCK_CLEANER_TOKEN) {
      c.set('userId', cleanerUser?.id || 'cleaner-1');
      c.set('userRole', 'cleaner');
      return true;
    }
    if (token === MOCK_ADMIN_TOKEN) {
      c.set('userId', adminUser?.id || 'admin-1');
      c.set('userRole', 'admin');
      return true;
    }
    return false;
  },
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present on first load
  app.use('/api/*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await ServiceEntity.ensureSeed(c.env);
    await BookingEntity.ensureSeed(c.env);
    await ReviewEntity.ensureSeed(c.env);
    await PaymentEntity.ensureSeed(c.env);
    await next();
  });
  // AUTH ROUTES
  app.post('/api/auth/register', async (c) => {
    const body = await c.req.json();
    const { name, email, password, role = 'client', cleanerType, companyName, specialties, state, city, idImageUrl, workGallery, companyRegistrationUrl, avatarUrl } = body;
    if (!isStr(name) || !isStr(email) || !isStr(password)) {
      return bad(c, 'Name, email, and password are required');
    }
    const users = (await UserEntity.list(c.env)).items;
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return bad(c, 'User with this email already exists');
    }
    let newUser: User | CleanerProfile;
    if (role === 'cleaner') {
      newUser = {
        id: crypto.randomUUID(), name, email, role, passwordHash: `mock_${password}`,
        avatarUrl: `https://api.dicebear.com/8.x/lorelei/svg?seed=${name}`,
        bio: "I'm new here, ready to make your space shine!",
        location: city && state ? `${city}, ${state}` : "Nigeria",
        state: state || undefined,
        city: city || undefined,
        rating: 0,
        reviewsCount: 0,
        services: [],
        cleanerType: cleanerType || 'individual',
        companyName: companyName || undefined,
        specialties: specialties || [],
        idImageUrl: idImageUrl || undefined,
        workGallery: workGallery || [],
        companyRegistrationUrl: companyRegistrationUrl || undefined,
      };
    } else {
      newUser = {
        id: crypto.randomUUID(), name, email, role, passwordHash: `mock_${password}`,
        avatarUrl: avatarUrl || `https://api.dicebear.com/8.x/adventurer/svg?seed=${name}`,
        idImageUrl: idImageUrl || undefined,
      };
    }
    const createdUser = await UserEntity.create(c.env, newUser);
    const { passwordHash, ...userResponse } = createdUser;
    let token = MOCK_CLIENT_TOKEN;
    if (userResponse.role === 'cleaner') token = MOCK_CLEANER_TOKEN;
    if (userResponse.role === 'admin') token = MOCK_ADMIN_TOKEN;
    return ok(c, { ...userResponse, token });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required');
    }
    const users = (await UserEntity.list(c.env)).items;
    const user = users.find(u => u.email === email);
    if (!user || user.passwordHash !== `mock_${password}`) {
      return notFound(c, 'Invalid credentials');
    }
    const { passwordHash, ...userResponse } = user;
    let token = MOCK_CLIENT_TOKEN;
    if (user.role === 'cleaner') token = MOCK_CLEANER_TOKEN;
    if (user.role === 'admin') token = MOCK_ADMIN_TOKEN;
    return ok(c, { ...userResponse, token });
  });
  // SUPPORT ROUTE
  app.post('/api/support', async (c) => {
    const body = await c.req.json();
    console.log('Support Request Received:', body);
    // In a real app, you would send an email or create a ticket here.
    return ok(c, { message: 'Your message has been received. We will get back to you shortly.' });
  });
  // CLEANER ROUTES
  app.get('/api/cleaners', async (c) => {
    const { limit, specialties: specialtiesQuery, state, city, q: searchQuery } = c.req.query();
    const allUsers = (await UserEntity.list(c.env)).items;
    let cleaners = allUsers.filter(u => u.role === 'cleaner') as CleanerProfile[];
    if (specialtiesQuery) {
      const selectedSpecialties = specialtiesQuery.split(',');
      cleaners = cleaners.filter(cleaner =>
        selectedSpecialties.every(spec => cleaner.specialties?.includes(spec))
      );
    }
    if (state) {
      cleaners = cleaners.filter(c => c.state === state);
    }
    if (city) {
      cleaners = cleaners.filter(c => c.city === city);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      cleaners = cleaners.filter(c =>
        c.name.toLowerCase().includes(lowercasedQuery) ||
        c.city?.toLowerCase().includes(lowercasedQuery) ||
        c.state?.toLowerCase().includes(lowercasedQuery)
      );
    }
    // Sort featured cleaners to the top
    cleaners.sort((a, b) => {
        const aIsFeatured = a.featuredUntil && new Date(a.featuredUntil) > new Date();
        const bIsFeatured = b.featuredUntil && new Date(b.featuredUntil) > new Date();
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        return 0;
    });
    const cleanersWithStartingPrice = cleaners.map(cleaner => {
        const startingPrice = cleaner.services?.[0]?.price ?? 5000;
        return { ...cleaner, startingPrice };
    });
    if (limit) {
        return ok(c, cleanersWithStartingPrice.slice(0, parseInt(limit, 10)));
    }
    return ok(c, cleanersWithStartingPrice);
  });
  app.get('/api/cleaners/:id', async (c) => {
    const id = c.req.param('id');
    const user = new UserEntity(c.env, id);
    if (!(await user.exists()) || (await user.getState()).role !== 'cleaner') {
      return notFound(c, 'Cleaner not found');
    }
    const cleanerProfile = await user.getState() as CleanerProfile;
    const allServices = (await ServiceEntity.list(c.env)).items;
    const cleanerServices = allServices.filter(s => s.cleanerId === id);
    const allReviews = (await ReviewEntity.list(c.env)).items;
    const cleanerReviews = allReviews.filter(r => r.cleanerId === id);
    const fullProfile = {
      ...cleanerProfile,
      services: cleanerServices,
      reviews: cleanerReviews,
    };
    return ok(c, fullProfile);
  });
  // PROTECTED ROUTES
  const protectedApp = new Hono<{ Bindings: Env, Variables: { userId: string, userRole: 'client' | 'cleaner' | 'admin' } }>();
  protectedApp.use('/*', mockAuthMiddleware);
  // PAYMENT NOTIFICATION
  protectedApp.post('/payments/notify', async (c) => {
    const cleanerId = c.get('userId');
    const userRole = c.get('userRole');
    if (userRole !== 'cleaner') return c.json({ success: false, error: 'Permission denied.' }, 403);
    const { type, amount } = await c.req.json<{ type: 'premium' | 'featured', amount: number }>();
    if (!type || !amount) return bad(c, 'Missing payment details.');
    const cleanerEntity = new UserEntity(c.env, cleanerId);
    const cleaner = await cleanerEntity.getState() as CleanerProfile;
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      cleanerId,
      cleanerName: cleaner.name,
      amount,
      type,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await PaymentEntity.create(c.env, newPayment);
    const updatedCleaner = await cleanerEntity.mutate(current => {
      if (current.role === 'cleaner') {
        if (type === 'premium') (current as CleanerProfile).premiumPaymentStatus = 'pending';
        if (type === 'featured') (current as CleanerProfile).featuredPaymentStatus = 'pending';
      }
      return current;
    });
    return ok(c, updatedCleaner);
  });
  // ADMIN ROUTES
  protectedApp.get('/admin/payments', async (c) => {
    const userRole = c.get('userRole');
    if (userRole !== 'admin') return c.json({ success: false, error: 'Permission denied.' }, 403);
    const allPayments = (await PaymentEntity.list(c.env)).items;
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    return ok(c, pendingPayments);
  });
  protectedApp.put('/admin/payments/:id/approve', async (c) => {
    const userRole = c.get('userRole');
    if (userRole !== 'admin') return c.json({ success: false, error: 'Permission denied.' }, 403);
    const paymentId = c.req.param('id');
    const { status } = await c.req.json<{ status: 'approved' | 'declined' }>();
    if (!status) return bad(c, 'Status is required.');
    const paymentEntity = new PaymentEntity(c.env, paymentId);
    if (!(await paymentEntity.exists())) return notFound(c, 'Payment not found.');
    const payment = await paymentEntity.getState();
    if (payment.status !== 'pending') return bad(c, 'Payment has already been processed.');
    const updatedPayment = await paymentEntity.mutate(p => ({ ...p, status }));
    const cleanerEntity = new UserEntity(c.env, payment.cleanerId);
    if (await cleanerEntity.exists()) {
      await cleanerEntity.mutate(current => {
        if (current.role === 'cleaner') {
          const profile = current as CleanerProfile;
          if (status === 'approved') {
            if (payment.type === 'premium') {
              profile.isPremium = true;
              profile.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              profile.premiumPaymentStatus = 'approved';
            } else if (payment.type === 'featured') {
              profile.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
              profile.featuredPaymentStatus = 'approved';
            }
          } else { // declined
            if (payment.type === 'premium') profile.premiumPaymentStatus = 'declined';
            if (payment.type === 'featured') profile.featuredPaymentStatus = 'declined';
          }
        }
        return current;
      });
    }
    return ok(c, updatedPayment);
  });
  // BOOKING ROUTES
  protectedApp.post('/bookings', async (c) => {
    const clientId = c.get('userId');
    const { cleanerId, serviceId, bookingDate, address, totalCost } = await c.req.json<Partial<Booking>>();
    if (!cleanerId || !serviceId || !bookingDate || !address || totalCost === undefined) {
      return bad(c, 'Missing required booking information.');
    }
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      clientId,
      cleanerId,
      serviceId,
      bookingDate,
      address,
      totalCost,
      status: 'pending',
    };
    await BookingEntity.create(c.env, newBooking);
    return ok(c, newBooking);
  });
  protectedApp.get('/bookings/client', async (c) => {
    const clientId = c.get('userId');
    const allBookings = (await BookingEntity.list(c.env)).items;
    const clientBookings = allBookings.filter(b => b.clientId === clientId);
    const allUsers = (await UserEntity.list(c.env)).items;
    const allServices = (await ServiceEntity.list(c.env)).items;
    const enrichedBookings = clientBookings.map(booking => {
      const cleaner = allUsers.find(u => u.id === booking.cleanerId);
      const service = allServices.find(s => s.id === booking.serviceId);
      return {
        ...booking,
        cleaner: { name: cleaner?.name || 'Unknown Cleaner', id: cleaner?.id || '' },
        service: { name: service?.name || 'Unknown Service' },
      };
    });
    return ok(c, enrichedBookings);
  });
  protectedApp.put('/bookings/:id/status', async (c) => {
    const cleanerId = c.get('userId');
    const bookingId = c.req.param('id');
    const { status } = await c.req.json<{ status: Booking['status'] }>();
    let newStatus: Booking['status'] = status;
    if (status === 'completed') {
      newStatus = 'awaiting_approval';
    }
    const allowedStatuses: Booking['status'][] = ['confirmed', 'declined', 'awaiting_approval'];
    if (!newStatus || !allowedStatuses.includes(newStatus)) {
      return bad(c, 'Invalid status provided.');
    }
    const bookingEntity = new BookingEntity(c.env, bookingId);
    if (!(await bookingEntity.exists())) {
      return notFound(c, 'Booking not found.');
    }
    const booking = await bookingEntity.getState();
    if (booking.cleanerId !== cleanerId) {
      return c.json({ success: false, error: 'You do not have permission to update this booking.' }, 403);
    }
    const updatedBooking = await bookingEntity.mutate(b => ({ ...b, status: newStatus }));
    return ok(c, updatedBooking);
  });
  protectedApp.put('/bookings/:id/approve', async (c) => {
    const clientId = c.get('userId');
    const bookingId = c.req.param('id');
    const bookingEntity = new BookingEntity(c.env, bookingId);
    if (!(await bookingEntity.exists())) return notFound(c, 'Booking not found.');
    const booking = await bookingEntity.getState();
    if (booking.clientId !== clientId) return c.json({ success: false, error: 'Permission denied.' }, 403);
    if (booking.status !== 'awaiting_approval') return bad(c, 'This booking is not awaiting approval.');
    const updatedBooking = await bookingEntity.mutate(b => ({ ...b, status: 'approved' }));
    return ok(c, updatedBooking);
  });
  protectedApp.put('/bookings/:id/cancel', async (c) => {
    const clientId = c.get('userId');
    const bookingId = c.req.param('id');
    const bookingEntity = new BookingEntity(c.env, bookingId);
    if (!(await bookingEntity.exists())) {
      return notFound(c, 'Booking not found.');
    }
    const booking = await bookingEntity.getState();
    if (booking.clientId !== clientId) {
      return c.json({ success: false, error: 'You do not have permission to cancel this booking.' }, 403);
    }
    const updatedBooking = await bookingEntity.mutate(b => ({ ...b, status: 'cancelled' }));
    return ok(c, updatedBooking);
  });
  // CLEANER DASHBOARD
  protectedApp.get('/dashboard/cleaner/stats', async (c) => {
    const cleanerId = c.get('userId');
    const cleaner = await new UserEntity(c.env, cleanerId).getState() as CleanerProfile;
    const allBookings = (await BookingEntity.list(c.env)).items;
    const cleanerBookings = allBookings.filter(b => b.cleanerId === cleanerId);
    const completedBookings = cleanerBookings.filter(b => b.status === 'approved');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalCost, 0);
    const newClients = 5;
    return ok(c, {
      totalRevenue,
      completedBookings: completedBookings.length,
      rating: cleaner.rating,
      reviewsCount: cleaner.reviewsCount,
      newClients,
    });
  });
  protectedApp.get('/dashboard/cleaner/bookings', async (c) => {
    const cleanerId = c.get('userId');
    const allBookings = (await BookingEntity.list(c.env)).items;
    const cleanerBookings = allBookings.filter(b => b.cleanerId === cleanerId);
    const allUsers = (await UserEntity.list(c.env)).items;
    const allServices = (await ServiceEntity.list(c.env)).items;
    const enrichedBookings = cleanerBookings.map(booking => {
      const client = allUsers.find(u => u.id === booking.clientId);
      const service = allServices.find(s => s.id === booking.serviceId);
      return { ...booking, client: { name: client?.name || 'Unknown Client' }, service: { name: service?.name || 'Unknown Service' } };
    });
    return ok(c, enrichedBookings);
  });
  // PROFILE MANAGEMENT
  protectedApp.put('/profile/client', async (c) => {
    const clientId = c.get('userId');
    const { name, email, avatarUrl, idImageUrl } = await c.req.json<Partial<User>>();
    const userEntity = new UserEntity(c.env, clientId);
    if (!(await userEntity.exists())) return notFound(c, 'User not found');
    const updatedUser = await userEntity.mutate(current => ({ ...current, name, email, avatarUrl, idImageUrl }));
    return ok(c, updatedUser);
  });
  protectedApp.put('/profile/cleaner', async (c) => {
    const cleanerId = c.get('userId');
    const body = await c.req.json<Partial<CleanerProfile>>();
    const userEntity = new UserEntity(c.env, cleanerId);
    if (!(await userEntity.exists())) {
      return notFound(c, 'Cleaner not found');
    }
    const updatedUser = await userEntity.mutate(current => {
      if (current.role !== 'cleaner') {
        return current;
      }
      const updatedProfile: CleanerProfile = { ...current };
      // Apply updates from the request body safely
      if (body.name) updatedProfile.name = body.name;
      if (body.bio) updatedProfile.bio = body.bio;
      if (body.state) updatedProfile.state = body.state;
      if (body.city) updatedProfile.city = body.city;
      if (body.cleanerType) updatedProfile.cleanerType = body.cleanerType;
      if (body.companyName !== undefined) updatedProfile.companyName = body.companyName;
      if (body.specialties) updatedProfile.specialties = body.specialties;
      if (body.idImageUrl) updatedProfile.idImageUrl = body.idImageUrl;
      if (body.workGallery) updatedProfile.workGallery = body.workGallery;
      if (body.companyRegistrationUrl) updatedProfile.companyRegistrationUrl = body.companyRegistrationUrl;
      // Safely construct location string from potentially updated fields
      const city = updatedProfile.city;
      const state = updatedProfile.state;
      if (city && state) {
        updatedProfile.location = `${city}, ${state}`;
      } else if (city) {
        updatedProfile.location = city;
      } else if (state) {
        updatedProfile.location = state;
      }
      return updatedProfile;
    });
    // Definitive type guard after mutation
    if (updatedUser.role !== 'cleaner') {
      return bad(c, 'Profile update failed: user is not a cleaner.');
    }
    return ok(c, updatedUser);
  });
  // REVIEW MANAGEMENT
  protectedApp.post('/reviews', async (c) => {
    const clientId = c.get('userId');
    const { bookingId, cleanerId, rating, comment } = await c.req.json<Partial<Review>>();
    if (!bookingId || !cleanerId || !rating || !comment) return bad(c, 'Missing required review fields.');
    const client = await new UserEntity(c.env, clientId).getState();
    const newReview: Review = {
      id: crypto.randomUUID(),
      bookingId,
      clientId,
      cleanerId,
      rating,
      comment,
      authorName: client.name,
      authorAvatarUrl: client.avatarUrl,
      date: new Date().toISOString(),
    };
    await ReviewEntity.create(c.env, newReview);
    const bookingEntity = new BookingEntity(c.env, bookingId);
    await bookingEntity.mutate(b => ({ ...b, reviewId: newReview.id }));
    return ok(c, newReview);
  });
  // SERVICE MANAGEMENT (for cleaners)
  protectedApp.get('/services', async (c) => {
    const cleanerId = c.get('userId');
    const allServices = (await ServiceEntity.list(c.env)).items;
    const cleanerServices = allServices.filter(s => s.cleanerId === cleanerId);
    return ok(c, cleanerServices);
  });
  protectedApp.post('/services', async (c) => {
    const cleanerId = c.get('userId');
    const serviceData = await c.req.json<Omit<Service, 'id' | 'cleanerId'>>();
    const newService: Service = { ...serviceData, id: crypto.randomUUID(), cleanerId };
    await ServiceEntity.create(c.env, newService);
    return ok(c, newService);
  });
  protectedApp.put('/services/:id', async (c) => {
    const cleanerId = c.get('userId');
    const serviceId = c.req.param('id');
    const serviceData = await c.req.json<Partial<Service>>();
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!(await serviceEntity.exists()) || (await serviceEntity.getState()).cleanerId !== cleanerId) {
      return notFound(c, 'Service not found or you do not have permission to edit it.');
    }
    const updatedService = await serviceEntity.mutate(s => ({ ...s, ...serviceData }));
    return ok(c, updatedService);
  });
  protectedApp.delete('/services/:id', async (c) => {
    const cleanerId = c.get('userId');
    const serviceId = c.req.param('id');
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!(await serviceEntity.exists()) || (await serviceEntity.getState()).cleanerId !== cleanerId) {
      return notFound(c, 'Service not found or you do not have permission to delete it.');
    }
    await ServiceEntity.delete(c.env, serviceId);
    return ok(c, { message: 'Service deleted successfully' });
  });
  app.route('/api', protectedApp);
}