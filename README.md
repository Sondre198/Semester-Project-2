# Semester Project 2

This project is an auction platform where users can register, log in, and participate in listings by creating, editing, bidding, and viewing active auctions. The platform allows users to interact with the auction listings and place bids.

## Description

The auction platform enables users to:
- Register or log in to their account.
- Browse auction listings and view detailed information about each listing.
- Place bids on items.
- Create new auction listings and edit existing ones.
- Track their bids and credits.

The app integrates with a REST API for data management and uses client-side rendering to display and interact with listings.

## Built With

- **HTML/CSS**: For page structure and styling.
- **JavaScript**: For logic and interactions.
- **Bootstrap 5**: For responsive UI components.
  
## Getting Started

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/Sondre198/Semester-Project-2

2. Navigate to the project directory:

   ```bash
   cd auction-platform

3. Ensure you have a live server to serve the files or use an HTTP server. I recommend using the Live server plugin in VSCode.

### Running

To run the application, serve the HTML files through a local server, or open index.html in your browser. Use a tool like Live Server in VSCode for the best experience.

## Features

- User Authentication: Users can register, log in, and log out.
- Create Listings: Users can create new auction listings with titles, descriptions, and images.
- Bid on Listings: Logged-in users can place bids on available auctions.
- Search Listings: Users can search for specific listings using keywords.
- Edit Listings: Users can update or delete their auction listings.
- View Bids: View the bids on a specific auction, along with the bidders and amounts.
- Responsive Design: The platform is fully responsive, using Bootstrap 5 for layout and components.

## Javascript Modules

- module.messagebox.js: Displays modals for messages and errors.
- module.page.js: Handles URL parameters and page-related utilities.
- module.template.js: Builds HTML templates for dynamic content.
- module.user.js: Manages user authentication and profile-related operations.

## API

The application interacts with the Noroff Auction API, which handles:
- User authentication and registration.
- Creating, editing, and fetching auction listings.
- Handling bids on auctions.

## Acknowledgments
- Thanks to the Noroff Auction API for providing the backend services.
- Bootstrap 5 for helping with the responsive design.
