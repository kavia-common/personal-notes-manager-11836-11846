# Notes Frontend (React)

A modern, lightweight notes application with a light theme, sidebar navigation, and localStorage persistence.

## Features

- View list of notes with timestamps and tags
- Create new notes
- Edit note title, content, and tags
- Delete notes
- Search notes by title, content, or tags
- Modern light-themed UI with sidebar and responsive layout
- Persistence via browser localStorage
- Room for backend integration

## Colors

- Primary: `#1976d2`
- Secondary: `#424242`
- Accent: `#ffb300`

These are defined as CSS variables in `src/App.css`.

## Getting Started

In the project directory:

- `npm start` - start development server at http://localhost:3000
- `npm test` - run tests
- `npm run build` - production build

## Architecture Notes

- State and persistence:
  - Notes are stored in localStorage under `notes_app_items_v1`.
  - Public helpers `loadNotes`, `saveNotes`, `generateId` are provided in `App.js`.
- UI:
  - Sidebar lists and filters notes and provides create/clear actions.
  - Main editor allows editing the selected note with Save.
  - Empty state prompts to create the first note.

## Backend Integration

To integrate a backend later:
- Replace calls to `loadNotes`/`saveNotes` with API calls.
- Maintain the same note shape:
  ```
  {
    id: string,
    title: string,
    content: string,
    tags: string[],
    updatedAt: number
  }
  ```
- Ensure optimistic updates or refresh state after API responses.

## Accessibility

- Buttons and inputs are labeled and keyboard accessible.
