# Log Data Analysis Server

This Node.js server reads log files from a specified directory and performs analysis on the log data to provide insights on API usage. The server uses Express.js for handling HTTP requests and CORS middleware to enable cross-origin requests.

## Getting Started

1. Clone this repository or copy the server code into your own project.
2. Make sure you have Node.js and npm (Node Package Manager) installed in your environment.

## Installation

1. Run `npm install` to install the required dependencies (Express, CORS, and Body Parser).

## Starting the Server

1. Set the `directoryPath` variable to the absolute path of the directory containing your log files. Ensure that the log files are in the expected format for parsing.
2. Run `npx tsc` command to convert TypeScript code to JavaScript will be placed in the "dist" directory.
2. Run the server using the command: `node dist/app.js`.

## Log Entry Interface

The `LogEntry` interface defines the structure of each log entry, including properties for timestamp, endpoint, and status code.

## Parsing Log Entries

The `parseLogEntry` function is a helper function that extracts relevant information (timestamp, endpoint, and status code) from a single log entry using regular expressions.

## Analysis

The server performs the following analysis on the log data:
1. Counts how many times each API endpoint is called and displays the result in a formatted table using `console.table()`.
2. Identifies the API endpoint with the highest call count and displays it along with the count value.
3. Calculates how many API calls are made on a per-minute basis and displays the result in a formatted table.
4. Counts the total number of API calls for each HTTP status code and displays the result in a formatted table.

The analysis results are displayed in the console when the server is started.

