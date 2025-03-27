# Afroglot Setup

## Prerequisites
Before setting up Afroglot, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- [Git](https://git-scm.com/)
- A package manager (npm, yarn, or pnpm)

## Installation
1. **Clone the Afroglot repository**
   ```sh
   git clone https://github.com/e-dania/Afroglot_v0
   cd afroglot
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```
   _Alternatively, use:_
   ```sh
   yarn install
   ```
   or
   ```sh
   pnpm install
   ```

## Running Afroglot
1. **Start the development server**
   ```sh
   npm run dev
   ```
   or
   ```sh
   yarn dev
   ```
   or
   ```sh
   pnpm dev
   ```

2. **Open Afroglot in your browser**
   The development server will typically run at `http://localhost:5173/` (unless configured otherwise).

## Environment Variables
Afroglot requires environment variables for API keys and configurations. Ensure you have a `.env` file in the root directory. Copy `.env.example` if available:
```sh
cp .env.example .env
```
Update the variables according to your setup.

## Building for Production
To create an optimized production build of Afroglot, run:
```sh
npm run build
```
This generates the output in the `dist/` folder.

## Deployment
To deploy Afroglot, configure a hosting platform like Vercel or Netlify and push your changes to a GitHub repository.

## Additional Information
- **Linting & Formatting:** Run `npm run lint` to check code quality.
- **Testing:** Add test scripts as needed.
- **Custom Configuration:** Modify `vite.config.js` for build settings.

For more details, refer to the official documentation:
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)

