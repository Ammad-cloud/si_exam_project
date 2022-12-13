# System Integration Project

This project is a demonstration of various technologies and services being used together to create a fully functional system.

## Technologies Used
- Node.js with JWT for authentication
- Socket.io for websocket communication
- Swagger for API documentation
- Python3 with BeautifulSoup for web scraping
- GraphQL for querying the products.db file

## Getting Started

1. Clone this repositories.


2. Install dependencies:
```
npm i
```


3. Start the server:
```
npm start
```


4. Open the API documentation in your browser:
http://localhost:3000/swagger



## API Reference

The API reference can be found in the `/docs` directory or by visiting the `/swagger` endpoint after starting the server.

## Web Scraper

The web scraper is located in the `/scraper` directory. To run it, navigate to that directory and run:

```
python3 main.py
```

This will generate a products.db file in the directory products_file named products_{YYYY-MM-DD} where YYYY-MM-DD is replaced with the date of the scraping. 

