# Krishi Sahayak 🌾

A mobile-first farming companion app built with Next.js, supporting multiple Indian languages to help farmers with agriculture, weather, crops, and market information.

## Features

- **Multi-language Support**: Available in 9 major Indian languages
  - English, Hindi, Punjabi, Kannada, Tamil, Telugu, Bengali, Gujarati, Marathi
- **Mobile-First Design**: Optimized for mobile devices with intuitive UI
- **Farmer-Friendly Interface**: Clean, simple design suitable for all age groups
- **Form Validation**: Comprehensive client-side validation
- **Responsive Design**: Works seamlessly across all device sizes
- **Language Persistence**: Remembers user's language preference

## Supported Languages

- 🇺🇸 English
- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 ਪੰਜਾਬੀ (Punjabi)
- 🇮🇳 ಕನ್ನಡ (Kannada)
- 🇮🇳 தமிழ் (Tamil)
- 🇮🇳 తెలుగు (Telugu)
- 🇮🇳 বাংলা (Bengali)
- 🇮🇳 ગુજરાતી (Gujarati)
- 🇮🇳 मराठी (Marathi)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and custom CSS
│   ├── layout.js            # Root layout with LanguageProvider
│   └── page.js              # Main page component
├── components/
│   ├── AuthForm.js          # Main sign up/login form
│   └── LanguageSwitcher.js  # Language selection component
└── contexts/
    └── LanguageContext.js   # Language management context
```

## Technologies Used

- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **Tailwind CSS 4** - Styling framework
- **Context API** - State management for language switching

## Key Components

### LanguageContext
Manages language state and provides translations across the app.

### AuthForm
Main authentication form with:
- Sign up/Login toggle
- Form validation
- Multi-language support
- Mobile-optimized design
- Agricultural theme

### LanguageSwitcher
Dropdown component for language selection with flag icons.

## Customization

To add more languages:
1. Add translations to the `translations` object in `LanguageContext.js`
2. Add language options to the `languages` array
3. Update the CSS for proper text rendering if needed

## Deployment

The app is ready for deployment on Vercel, Netlify, or any other platform that supports Next.js.

```bash
npm run build
npm start
```

## Contributing

This project is designed to help Indian farmers access agricultural information in their native languages. Contributions are welcome!