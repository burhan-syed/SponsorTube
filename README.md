# SponsorTube

A Next.js application that integrates with YouTube's API and SponsorBlock to provide enhanced video sponsorship management and analytics.

# ⚠️ Project No Longer Maintained

This project is no longer actively maintained. It was created as a proof of concept and may contain outdated dependencies or security vulnerabilities. Use at your own risk.

## Description

SponsorTube is a web application that allows users to:
- Analyze YouTube video sponsorships
- Track and manage sponsorship segments
- View detailed analytics about video sponsorships
- Integrate with SponsorBlock API for community-driven sponsorship data

## Tech Stack

### Core Technologies
- **T3 Stack** - Full-stack framework combining:
  - **Next.js** - React framework for server-rendered applications
  - **TypeScript** - Type-safe JavaScript
  - **Prisma** - ORM
  - **tRPC** - End-to-end typesafe APIs
  - **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **Zustand** - State management

### Key Dependencies
- **youtubei.js** - YouTube API integration
- **sponsorblock-api** - SponsorBlock integration
- **@tanstack/react-query** - Data fetching and caching
- **next-auth** - Authentication
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **framer-motion** - Animations


## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Copy `.env-example` to `.env` and fill in required environment variables
4. Migrate and seed database with prisma
5. Run the development server:
   ```bash
   yarn dev
   ```

## Disclaimer

This project is provided as-is, without any warranty or support. The code may contain outdated dependencies or security vulnerabilities. Users are encouraged to:
- Update dependencies to their latest versions
- Implement proper security measures
- Conduct thorough testing before deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.
