# Canva-style-Design-Editor-with-Review-Feedback-Feature
It is a full stack assignment 
/canva-editor
  /frontend (Next.js application)
  /backend (Node.js/Express server)
This is a full-stack design editor application inspired by Canva, with added collaboration features that allow designers and brand teams to work together seamlessly. The application provides a canvas-based editor where designers can create designs, and brand teams can provide specific feedback on design elements. All feedback is synchronized in real-time using WebSockets.

Features
Core Features
Canvas-based Design Editor:

Create and edit designs using Fabric.js

Add and customize text elements (font size, color, alignment)

Upload and position images

Drag-and-drop functionality for all elements

Real-time Collaboration:

Brand team members can click on any design element to leave feedback

Comments appear as markers on the canvas

Designers receive feedback instantly via Socket.io

Comment resolution tracking

Design Management:

Save designs to the database

Export final designs as PNG

Technical Features
Frontend:

Built with Next.js (React) and TypeScript

Fabric.js for canvas manipulation

Socket.io-client for real-time communication

Responsive UI with Tailwind CSS

Backend:

Node.js with Express

MongoDB for data persistence

Socket.io for real-time updates

REST API for design and comment management

Tech Stack
Frontend:

Next.js

React

TypeScript

Fabric.js

Socket.io-client

Tailwind CSS

React Icons

Backend:

Node.js

Express

Socket.io

MongoDB

Mongoose

Installation
Prerequisites
Node.js (v14 or later)

MongoDB (local or cloud instance)

npm or yarn

Setup Instructions
Clone the repository:


git clone https://github.com/your-username/canva-style-editor.git
cd canva-style-editor
Set up the backend:


cd backend
npm install
Set up the frontend:


cd ../frontend
npm install
Configure environment variables:

Create a .env file in both backend and frontend directories:

Backend (.env):

MONGODB_URI=mongodb://localhost:27017/design-editor
PORT=5000
Frontend (.env.local):


NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
Run the application:

In separate terminal windows:

# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm run dev
Access the application:
Open http://localhost:3000 in your browser.

Deployment
The application is configured for deployment on Vercel:

Frontend:

Push to GitHub and import into Vercel as a Next.js project

Set environment variables in Vercel dashboard

Backend:

Push to GitHub and import into Vercel as a Node.js project

Set environment variables in Vercel dashboard

Configure the build command as npm run build

Set the output directory as dist

Usage
Designer Mode:

Create designs using the toolbar (add text, images, etc.)

Save designs to the database

View and resolve feedback from brand teams

Export final designs as PNG

Brand Team Mode:

Click on any part of the design to leave feedback

View existing comments

See design updates in real-time

Project Structure
Copy
/canva-editor
  /frontend
    /pages          # Next.js pages
    /public         # Static assets
    /styles         # CSS files
    /components     # React components
    /api            # API routes

  /backend
    /src
      /models       # MongoDB models
      /routes       # API routes
      index.ts      # Main server file
Future Enhancements
User authentication and authorization

Version control for designs

More advanced design tools (shapes, layers, etc.)

Team management features

Design templates

Enhanced export options (PDF, JPG, etc.)

License
This project is licensed under the MIT License. See the LICENSE file for details.
