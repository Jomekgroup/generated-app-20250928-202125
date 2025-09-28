# Cleenly: The Future of Clean

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Jomekgroup/generated-app-20250928-202125)

Cleenly is a premium, minimalist web platform designed to seamlessly connect professional cleaning service providers with clients across Nigeria. The application will serve two primary user roles: Clients seeking cleaning services and Cleaners offering their expertise. Clients can browse detailed cleaner profiles, view available services, and book appointments through a secure, integrated system. Cleaners can create a professional profile, list their services and pricing, manage their bookings, and opt for a premium subscription to gain enhanced visibility and features. The platform will facilitate secure one-time payments for completed services and manage recurring monthly subscriptions for premium cleaners, creating a trusted and efficient marketplace for the cleaning industry.

## ✨ Key Features

-   **Cleaner Discovery:** Browse and search a gallery of professional cleaners.
-   **Advanced Filtering:** Filter cleaners by location, service type, and ratings.
-   **Detailed Profiles:** View comprehensive cleaner profiles with bios, services, pricing, and reviews.
-   **Seamless Booking:** An intuitive, multi-step booking flow for clients.
-   **Secure Payments:** (Mock) Integration for one-time service payments.
-   **User Dashboards:** Dedicated dashboards for clients and cleaners to manage bookings and profiles.
-   **Premium Subscriptions:** A subscription model for cleaners to unlock premium features.
-   **Minimalist & Modern UI:** A visually stunning and user-friendly interface built with the latest web technologies.

## 🚀 Technology Stack

-   **Frontend:** React, Vite, React Router, Tailwind CSS
-   **UI Components:** shadcn/ui, Radix UI
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **State Management:** Zustand
-   **Backend:** Hono on Cloudflare Workers
-   **Database:** Cloudflare Durable Objects
-   **Language:** TypeScript

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) logged into your Cloudflare account.

```bash
bun install -g wrangler
wrangler login
```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/cleenly.git
    cd cleenly
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

## 💻 Development

To start the local development server, which includes both the Vite frontend and the Wrangler server for the backend, run the following command:

```bash
bun dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will hot-reload on changes, and the worker backend will restart automatically.

## ☁️ Deployment

This project is configured for a one-command deployment to Cloudflare.

1.  **Build the application:**
    The deployment script handles the build process automatically.

2.  **Deploy to Cloudflare Workers:**
    Run the deploy command from the root of the project.

    ```bash
    bun deploy
    ```

This command will build the Vite frontend, bundle the Hono worker, and deploy the entire application to your Cloudflare account.

Alternatively, you can deploy your own version of this project with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Jomekgroup/generated-app-20250928-202125)

## 📂 Project Structure

```
.
├── src/                # Frontend React application source
│   ├── components/     # Shared React components (including shadcn/ui)
│   ├── pages/          # Page components for React Router
│   ├── lib/            # Utility functions and API client
│   └── main.tsx        # Application entry point
├── worker/             # Backend Hono application for Cloudflare Workers
│   ├── index.ts        # Worker entry point and middleware
│   ├── user-routes.ts  # Application-specific API routes
│   └── entities.ts     # Durable Object entity definitions
├── shared/             # TypeScript types shared between frontend and backend
│   └── types.ts
├── wrangler.jsonc      # Cloudflare Wrangler configuration
└── vite.config.ts      # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.