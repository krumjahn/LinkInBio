# Personal Links Page

A clean, modern personal links page built with Next.js and Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Social Media Integration**: Links to various social platforms
- **Fast Loading**: Optimized for performance with Next.js
- **Modern Styling**: Built with Tailwind CSS and shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd personal-links
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Customization

### Adding New Links

Edit `src/app/page.tsx` to add or modify links:

```tsx
<Button variant="outline" className="w-full" asChild>
  <Link href="https://your-link.com">
    Your Link Text
  </Link>
</Button>
```

### Changing Profile Information

Update the profile section in `src/app/page.tsx`:

```tsx
<h1 className="text-2xl font-bold">Your Name</h1>
<p className="text-muted-foreground mt-2">Your bio/description</p>
```

### Updating Social Media Links

Modify the social media section in `src/app/page.tsx` to add or change social links.

### Changing the Profile Image

Replace `/public/keith.jpg` with your own image and update the reference in `src/app/page.tsx`.

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **TypeScript**: For type safety
- **Icons**: Custom SVG icons

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       └── card.tsx
└── lib/
    └── utils.ts
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Railway

[Railway](https://railway.com?referralCode=rumjahn) is a modern platform that makes it easy to deploy your Next.js applications with just a few clicks. It offers a seamless deployment experience with built-in CI/CD, automatic HTTPS, and easy environment variable management.

### Benefits of Railway:
- **Simple Deployment**: Connect your GitHub repository and deploy with a single click
- **Automatic Updates**: Automatically deploy when you push to your repository
- **Built-in Databases**: Easily add PostgreSQL, MySQL, Redis, and more
- **Custom Domains**: Connect your own domain with automatic HTTPS
- **Monitoring & Logs**: Real-time logs and metrics for your application

### Get Started with Railway:
1. Sign up for Railway using [this referral link](https://railway.com?referralCode=rumjahn) to receive **$5 in free credits**
2. Connect your GitHub repository
3. Configure your environment variables
4. Deploy your application

Railway simplifies your infrastructure stack with a single, scalable, easy-to-use platform, allowing you to focus on building your application rather than managing infrastructure.
