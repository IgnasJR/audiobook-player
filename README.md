# Audiobook Player

A full-stack audiobook player built using **React** for the frontend and **Node.js** for the backend.

## Features

- **Stream Audiobooks**: Users can stream audiobooks in-browser.
- **Progress Sync**: Resume listening across devices - progress is automatically saved.
- **Admin Panel**: Admins can upload and manage audiobooks, users.
- **Responsive UI**: Works on desktop and mobile browsers.

---

## Technologies Used

### Frontend

- React
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- MySQL
- JWT for authentication
- Multer for file uploads

---

## Planned Enhancements

- Integrate **Redis** to:
  - Cache frequently accessed data (e.g., audiobook metadata).
  - Lower the number of writes to the database (e.g., updating user audiobook listening progress).
  - Manage user sessions, allowing for server-side invalidation of tokens (e.g., on logout or change of password).
- Add OpenAPI documentation.

---

## Getting Started

### Prerequisites

1. Docker installed
2. MySQL running

---

### Installation

1. Clone this repository and open the project directory:

```sh
git clone https://github.com/IgnasJR/audiobook-player
cd audiobook-player
```

2. Create an environment variable file - run `touch .env` and in the newly created file add these parameters:

```
host=your.db.host
port=your-db-port (usually 3306 for mysql and mariadb. if youre running a docker container, use "host.docker.internal")
user=your-db-user
password=your-db-pass
database=audiobooks
SALT_SECRET=a-randomly-generated-string
Registration_Disabled=false
JWT_SECRET=another-randomly-generated-string
AUDIO_STORAGE_DIR=../audio
admin_password=initial-password-for-admin-user
```

3. Build the image:

```sh
docker build -t audiobook-player .
```

4. Start a container:

```sh
docker run -p 3001:3001 --env-file .env audiobook-player
```

5.  Open http://localhost:3001/ to view the project
