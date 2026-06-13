# 🚀 Quick Start Guide - Landing Page Setup

## Step 1: Save Your Image ⬇️

1. **Download the hero image** from the designer/attachment
2. **Save it as:** `landing-hero.jpg`
3. **Place it in:** 
   ```
   client/public/assets/landing-hero.jpg
   ```
   (The folder already exists, just drop the image in there)

## Step 2: Start Your App ▶️

```bash
# Open terminal in your project root
cd client
npm start
```

Your app will start at `http://localhost:3000`

## Step 3: Test the Flow! 🎯

### Landing Page
- See your hero image with a green "Get Started" button centered on it
- Click the button → goes to Auth Entry page

### Auth Entry Page
You'll see **3 beautiful cards**:

**1. Sign In** 🔵
- For existing users
- Goes to login form

**2. Register** 🟢
- For new users
- Goes to registration form

**3. Create Plan as Guest** 🟣
- No sign-up needed
- Try the platform instantly

### Guest Plan Mode
- Fill in: Name, Age, Weight, Height, Goal, Activity Level
- Click "Generate Plan"
- Get a personalized 4-meal daily plan
- Can create account to save it

## What You Get 📦

✅ **Professional Landing Page** - Your image as full-screen background  
✅ **Centered Button** - Eye-catching "Get Started" CTA  
✅ **Three User Paths** - Sign In / Register / Guest  
✅ **Guest Experience** - Try before signup  
✅ **Smooth Navigation** - Hidden navbar for better UX  
✅ **Responsive Design** - Works on all devices  
✅ **Modern Styling** - Tailwind CSS with hover effects  

## File Where Image Goes

```
your-project/
└── client/
    └── public/
        └── assets/
            └── landing-hero.jpg  ← PUT YOUR IMAGE HERE
```

## Troubleshooting

### "Image not showing on landing page?"
- Make sure file name is exactly: `landing-hero.jpg`
- File should be in: `client/public/assets/`
- Supported formats: JPG, PNG
- Try clearing browser cache (Ctrl+F5 / Cmd+Shift+R)

### Styling looks off?
- Make sure Tailwind CSS is working elsewhere in your app
- If it's working on other pages, new components will work too

### NavBar appearing on landing page?
- This is fixed already - it should be hidden
- Refresh the page

## Next Steps 🎨

You can enhance the landing page by:
1. **Custom Message Text** - Edit the button or add tagline
2. **Different Colors** - Change button colors in LandingPage.jsx
3. **Add Logo** - Add your app logo to the landing page
4. **Animations** - Add entrance animations to button
5. **Testimonials** - Add user testimonials before footer

## File Changed/Created

```
✅ CREATED:
- client/src/pages/LandingPage.jsx
- client/src/pages/AuthEntry.jsx
- client/src/pages/GuestDietPlan.jsx
- client/public/assets/ (folder)

✅ UPDATED:
- client/src/App.js (added 3 new routes)
- client/src/components/NavBar.jsx (hide on landing/auth)
```

## Support

Having issues? Check:
1. Image file is named exactly: `landing-hero.jpg`
2. Image is in: `client/public/assets/`
3. App compiled without errors (`npm start` worked)
4. You cleared browser cache

---

**That's it!** Your landing page is ready to go. Just add the image file and you're done! 🎉
