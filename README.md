# SecurePass

A responsive password generator built with React, Vite, and Tailwind CSS. Passwords are generated in the browser with the Web Crypto API; the app does not send passwords to a server.

## Features

- Generate passwords from 8 to 40 characters with selectable lowercase, uppercase, number, and symbol sets.
- Rate password strength with a visual meter.
- Copy or regenerate a password.
- Save labeled passwords locally, then reveal, copy, or delete them.
- Responsive, keyboard-accessible controls.

## Get started

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

Run the linter with `npm run lint`.

## Important storage note

Saved passwords are stored in this browser's `localStorage`. Browser storage is **not encrypted** and should not be treated as a secure password vault. Anyone with access to this browser profile may be able to access saved entries. Avoid saving sensitive passwords on shared devices; use a trusted password manager for real credentials. Clearing browser data also removes saved entries.
