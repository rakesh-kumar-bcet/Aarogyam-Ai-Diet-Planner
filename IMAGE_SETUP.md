# Image Setup Instructions

## How to Add the Landing Page Background Image

1. **Save the image file:**
   - Download or save the provided landing page image (the diet planner hero image with people)
   - Name it: `landing-hero.jpg`

2. **Place it in the correct location:**
   - Save the image to: `client/public/assets/landing-hero.jpg`
   - The `assets` folder has already been created for you

3. **That's it!**
   - The landing page will automatically use this image as the background
   - The "Get Started" button will appear centered on top of the image with a semi-transparent overlay

## What the Landing Page Flow Does

1. **Landing Page (`/`)** - Shows your hero image with "Get Started" button
2. **Auth Entry (`/auth-entry`)** - After clicking "Get Started", users see three options:
   - **Sign In** - For existing users → goes to `/login`
   - **Register** - For new users → goes to `/register` 
   - **Create Plan as Guest** - For users who want to try without signup → goes to `/guest-diet-plan`

3. **Guest Mode (`/guest-diet-plan`)** - Users can:
   - Fill in basic health info (age, weight, height, goal, activity level)
   - Get an auto-generated meal plan
   - Try the platform without creating an account
   - Option to create account to save their plan

## File Changes Made

- ✅ Created `LandingPage.jsx` - Hero image with centered "Get Started" button
- ✅ Created `AuthEntry.jsx` - Sign In / Register / Guest options page
- ✅ Created `GuestDietPlan.jsx` - Guest meal plan generator
- ✅ Updated `App.js` - Added new routes
- ✅ Updated `NavBar.jsx` - Hides navbar on landing/auth pages for cleaner UX
- ✅ Created `public/assets/` folder - Ready for your image

## Quick Testing

1. npm start the client
2. Navigate to `http://localhost:3000`
3. You should see the landing page with your image (once saved)
4. Click "Get Started" to test the flow
