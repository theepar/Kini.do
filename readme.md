# Kini.do

**Kini.do** is a premium, beautifully designed Task Reminder App built with **React Native (Expo)**. It focuses on aesthetics ("Soft Dark Mode", Glassmorphism) and seamless user experience with realtime data updates.

![Kini.do Banner](https://via.placeholder.com/800x400?text=Kini.do+App+Preview)

## Key Features

- **Realtime Task Management**: Add, edit, and complete tasks instantly with global state management.
- **Interactive Calendar**: Visualize your schedule with a monthly calendar view. Select dates to filter tasks dynamically.
- **Smart Search**: Quickly find tasks by title. Text-based filtering works in realtime.
- **Premium UI/UX**:
  - **Soft Dark Theme**: Optimized for OLED screens (`#000000` & `#1C1C1E`).
  - **Floating Tab Bar**: Custom glassmorphism-style bottom navigation.
  - **Smooth Animations**: Interactive elements and polished transitions.
- **Google Sync (Beta)**: Integration with Google Calendar for seamless scheduling.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: React Context API (`TaskContext`)
- **Persistence**: `AsyncStorage` for local data caching
- **Icons**: `@expo/vector-icons` (MaterialIcons)

## Quick Start

### Prerequisites
- Node.js (LTS recommended)
- Expo Go app on your physical device OR Android Studio / Xcode for emulators.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/kini-do.git
    cd kini-do
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the App**
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator**
    - **Physical Device**: Scan the QR code with the **Expo Go** app.
    - **Emulator**: Press `a` for Android or `i` for iOS in the terminal.

## Project Structure

```bash
Kini/
├── app/                    # Expo Router screens & layout
│   ├── (tabs)/             # Main Tab Navigation
│   │   ├── index.tsx       # Home Screen (Task List)
│   │   ├── calendar.tsx    # Calendar Screen
│   │   ├── search.tsx      # Search Screen
│   │   └── settings.tsx    # Settings Screen
│   ├── task/               # Task specific screens
│   │   ├── [id].tsx        # Task Details
│   │   └── share.tsx       # Share Task
│   ├── modal.tsx           # Add Task Modal
│   └── welcome.tsx         # Welcome / Onboarding
├── components/             # Reusable UI Components
│   └── ThemedView.tsx      # Theme-aware container
├── context/                # Global State
│   └── TaskContext.tsx     # Task CRUD & Realtime logic
├── constants/              # App Constants
│   └── Colors.ts           # Theme colors (Light/Dark)
├── hooks/                  # Custom React Hooks
└── assets/                 # Images & Fonts
```

## Google Calendar Setup (Optional)

1.  Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2.  Enable **Google Calendar API**.
3.  Create **OAuth 2.0 Client ID** (Web Application).
4.  Copy `.env.example` to `.env` and add your Client ID:
    ```env
    EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
    ```

## Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK (Android)
eas build --platform android --profile preview
```

---

