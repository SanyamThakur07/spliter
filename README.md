# Spliter

Spliter is a full-stack web application designed to help users track shared expenses and settle balances within groups. It simplifies the process of managing finances with friends, family, or roommates, making it easy to see who owes what.

## ✨ Features

- **User Authentication:** Secure sign-up and sign-in functionality using Clerk.
- **Group Management:** Create, join, and manage groups of users.
- **Expense Tracking:** Add new expenses, specifying the amount and participants.
- **Dashboard:** View a summary of your total balance, expenses, and group activities.
- **Balance Settlement:** Track and manage settlements between group members.
- **Responsive Design:** A clean and modern UI that works on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Backend & Database:** [Convex](https://www.convex.dev/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/)
- **Schema Validation:** [Zod](https://zod.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or later)
- [pnpm](https://pnpm.io/installation)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/spliter.git
    cd spliter
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up Convex:**

    - Start the Convex development server:
      ```bash
      npx convex dev
      ```
    - Follow the on-screen instructions to create a new Convex project.
    - Seed the database with initial data:
      ```bash
      npx convex run seed
      ```

4.  **Set up Clerk:**

    - Create a new project on the [Clerk Dashboard](https://dashboard.clerk.com/).
    - In your Clerk project settings, navigate to **JWT Templates** and create a new template using the "Convex" option.
    - Note down your Issuer URL from the template settings.

5.  **Environment Variables:**

    - Create a `.env.local` file in the root of the project.
    - Add the following environment variables from your Convex and Clerk projects:

      ```env
      # Convex
      NEXT_PUBLIC_CONVEX_URL="<your-convex-project-url>"

      # Clerk
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<your-clerk-publishable-key>"
      CLERK_SECRET_KEY="<your-clerk-secret-key>"
      NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
      NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
      ```

6.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
