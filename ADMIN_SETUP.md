# Admin Setup & Access Guide

## Hospital Owner / Admin Access

This guide explains how to securely access and manage the admin panel for your AI Diet Planner system.

---

## 1. Hidden Admin Login URL

Admin login is intentionally **not visible** in the main UI to keep the panel secure from unauthorized access.

### Access the Admin Login Page
- **Direct URL:** `http://localhost:3000/admin-login`
- **Production:** `https://yourdomain.com/admin-login`

### Secret Keyboard Shortcut
- From the landing page, press **`Ctrl + Shift + A`** to navigate to admin login
- This works only on the landing page (`/`)

---

## 2. Creating Your First Admin User

### Option A: Using the Admin Creation Script (Recommended)

Run this command from the server folder:

```bash
cd server
npm run create-admin -- --email=admin@hospital.com --name="Hospital Admin" --password="YourSecurePassword123"
```

**Parameters:**
- `--email`: Admin email address
- `--name`: Admin full name
- `--password`: Strong password (min 8 chars, include uppercase, numbers, special chars)
- `--secret`: (Optional) Your ADMIN_SECRET from `.env`

**Example:**
```bash
npm run create-admin -- --email=owner@hospital.com --name="John Hospital Owner" --password="SecurePass@2024"
```

### Option B: Manual Database Entry (Not Recommended)

If you prefer to add an admin directly in MongoDB:

```javascript
const bcrypt = require('bcryptjs');

const adminData = {
  name: "Hospital Admin",
  email: "admin@hospital.com",
  password: await bcrypt.hash("YourPassword", 10),  // Hash the password
  role: "admin"
};

// Insert into MongoDB users collection
db.users.insertOne(adminData);
```

---

## 3. Admin Login Process

1. Navigate to `/admin-login` or press **Ctrl+Shift+A** on landing page
2. Enter your admin email and password
3. Click "Sign in as admin"
4. You will be redirected to `/admin` (Admin Dashboard)

### Admin Dashboard Features
- **User Counts:** Total clients, nutritionists, admins
- **Nutritionist Directory:** View all nutritionists and their ratings
- **Patient Directory:** View all registered clients
- **Login Activity:** Track user login/logout events
- **Feedback Management:** View nutritionist feedback from clients
- **Nutritionist Profiles:** Detailed view of each nutritionist's clients and performance

---

## 4. Security Best Practices

### Password Security
- Use a **strong password** (min 12 characters)
- Include uppercase, lowercase, numbers, and special characters
- Change your admin password regularly
- Never share your admin credentials

### Access Control
- Admin panel is only accessible via JWT authentication
- Tokens expire after 1 day (configurable in `.env`)
- Backend validates all admin requests with `verifyAdmin` middleware
- Non-admin users are blocked from accessing `/admin` and API routes

### Environment Variables
Keep these secure in your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_SECRET=your-admin-creation-secret-key
JWT_EXPIRE=1d
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dietplanner
```

### Protecting the Admin URL
- The admin login URL is **hidden from navigation**
- Only users who know the URL can access it
- Share the URL only with authorized hospital owners
- Consider blocking the `/admin-login` URL at the firewall level if needed

---

## 5. Role-Based Access Control (RBAC)

### User Roles
1. **user** (Patient/Client)
   - Access: Dashboard, diet plans, calorie tracking, nutritionist contact
   - Cannot see: Admin panel, other users' data

2. **nutrenist** (Nutritionist)
   - Access: Nutritionist panel, client profiles, diet history
   - Cannot see: Admin panel, system-level data

3. **admin** (Hospital Owner)
   - Access: Complete admin dashboard, all user data, analytics
   - Can view: Login logs, nutritionist performance, patient directories
   - Manage: All system features

### Role Assignment
- Users register as "user" or "nutrenist" at signup
- Admin role can only be created via admin creation script
- Admin users cannot register via the normal signup form

---

## 6. Troubleshooting

### Forgot Admin Password?
1. Delete the admin user from MongoDB
2. Create a new admin user with the creation script
3. Login with the new credentials

### Cannot Login to Admin Panel?
- Verify email and password are correct
- Check that the admin user exists in MongoDB
- Ensure JWT_SECRET matches between frontend and backend
- Check browser console for error messages

### Admin Features Not Working?
- Verify the admin has a valid JWT token
- Check that the token is being sent in API requests
- Ensure backend `verifyAdmin` middleware is active
- Check server logs for 403 (Forbidden) errors

---

## 7. Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Set strong `JWT_SECRET` and `ADMIN_SECRET` in `.env`
- [ ] Disable the admin creation script in production (or require auth)
- [ ] Set `JWT_EXPIRE` to an appropriate value (e.g., "8h")
- [ ] Enable HTTPS/SSL
- [ ] Set `CORS` to allow only your domain
- [ ] Use environment-specific secrets (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Enable MongoDB IP whitelist
- [ ] Implement rate limiting on login endpoints
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up automated backups of admin activities

---

## 8. Support

For questions or issues:
1. Check server logs: `npm --prefix server run dev`
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB connection is active

---

**Last Updated:** May 2026  
**Version:** 1.0
