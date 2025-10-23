# Travody - Travel Platform

A modern travel platform built with Next.js that connects travelers with local guides across India.

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **UI Components**: Custom components with Headless UI

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── traveler/      # Traveler auth (login/signup)
│   │   └── guider/        # Guider auth (login/signup)
│   ├── guider/            # Guider dashboard pages
│   ├── explore/           # Explore tours page
│   ├── become-guide/      # Become a guide page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Header.tsx         # Dynamic header component
│   ├── HeroSection.tsx    # Landing page hero
│   ├── FeaturedTours.tsx  # Featured tours section
│   ├── ExploreCategories.tsx # Tour categories
│   ├── VerifiedGuides.tsx # Guide verification section
│   ├── Testimonials.tsx   # Customer testimonials
│   ├── Footer.tsx         # Footer component
│   ├── AuthSidebar.tsx    # Auth page sidebar
│   ├── TravelerLoginForm.tsx    # Traveler login form
│   ├── TravelerSignupForm.tsx  # Traveler signup form
│   ├── GuiderLoginForm.tsx     # Guider login form
│   ├── GuiderSignupForm.tsx    # Guider signup form
│   ├── GuiderDashboard.tsx     # Guider dashboard
│   └── GuiderVerification.tsx  # Guider verification process
```


