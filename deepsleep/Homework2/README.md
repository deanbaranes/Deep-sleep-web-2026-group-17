# DeepSleep Project

## Project Description
DeepSleep is a platform designed for sleep research management. It allows students to log their sleep data and researchers/teachers to manage and view reports.

## Getting Started

### Prerequisites
- Node.js installed on your machine.
- npm (comes with Node.js).

### Installation
1. Clone the repository or download the project files.
2. Open a terminal in the project folder and install the dependencies:
   ```bash
   npm install
   ```

### Configuration
1. Create a `.env` file in the root directory.
2. Add the following configuration (ensure it matches your local setup):
   ```env
   PORT=3333
   VITE_API_URL=http://localhost:3333
   ```
   *Note: The server defaults to port 3333.*

### Running the Application
To run the full application, you need to start both the backend server and the frontend client.

**1. Start the Backend Server:**
Open a terminal in the project root and run:
```bash
npm start
```
The server will start on `http://localhost:3333`.

**2. Start the Frontend Client:**
Open a **separate** terminal in the project root and run:
```bash
npm run dev
```
The application will usually run on `http://localhost:5173` (check the terminal output for the exact address).

## Resources
- [Live Site Link (if available)](your-link-here)
