# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Calendar Booking SaaS

A modern calendar booking system similar to Cal.com, designed specifically for agencies and no-code platform users (Softr, Airtable, Webflow).

## 🚀 Features

- **Multi-user Agency Management** - Onboard multiple team members
- **Google Calendar Sync** - Seamless integration with existing calendars
- **Video Meeting Integration** - Google Meet and Zoom support
- **Availability Management** - Set available/unavailable time slots
- **Public Booking Pages** - Individual booking links for each team member
- **Payment Integration** - Stripe integration for bookings
- **No-code Platform Support** - Embed widgets for Softr, Webflow, and Airtable

## 🏗️ Project Structure

```
calendar/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility libraries (Supabase config)
│   │   └── ...
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/           # Node.js + Express API
│   ├── routes/           # API route handlers
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm or yarn
- Supabase account
- Google OAuth credentials
- Zoom OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar
   ```

2. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Set up Backend**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   
   Terminal 1 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```
   
   Terminal 2 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

### Environment Variables

**Frontend (.env.local)**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Backend (.env)**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

## 🎯 Target Market

- **Agencies** using Softr + Airtable
- **Webflow** developers and users
- **Small to medium businesses** looking for Cal.com alternatives
- **No-code enthusiasts** needing calendar booking functionality

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/zoom/callback` - Zoom OAuth callback

### Health Check
- `GET /api/health` - API health status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@calendarpro.com or join our Discord community.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
