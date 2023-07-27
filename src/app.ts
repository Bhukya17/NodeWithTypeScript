import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3002; //server will listen at 3002 port number for incoming requests.

app.use(cors());
app.use(bodyParser.json());

const directoryPath = '/home/access/Downloads/logs'; //  directory path (your directory path)

  interface LogEntry {
    timestamp: string;
    endpoint: string;
    statusCode: number;
  }
  
  // Helper function to parse a single log entry
  function parseLogEntry(entry: string): LogEntry | null {

    // specific parts from a string that follows the pattern of having text within square brackets(timestamp),
    // after that text within double quotes (endpoint)
    // last one captures a three-digit number (statusCode)
    const matches = entry.match(/\[(.*?)\] "(.*?)".* (\d{3})/);
    if (!matches) return null;
  
    const [_, timestamp, endpoint, statusCode] = matches;
    return { timestamp, endpoint, statusCode: parseInt(statusCode) };
  }
  
  // Read the contents of the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    // Process files one by one
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      // Read the content of the file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file "${filePath}":`, err);
        } else {
          console.log(`Content of file "${filePath}":`);
          // Parse the log data and filter out any invalid entries
          const logEntries: LogEntry[] = data.split('\n').map(parseLogEntry).filter((entry): entry is LogEntry => entry !== null);
        
          // 1. Which endpoint is called how many times
          const endpointCounts: { [endpoint: string]: number } = {};
          for (const entry of logEntries) {
            let { endpoint } = entry; // example: entry is 'GET /api/user/profile?username=12427 HTTP/1.1';
            const parts = endpoint.split(' '); // Split the string by spaces
            endpoint = parts[1]; // Extract the path (second element) to get endpoint "/api/user/profile?username=12427"
            endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
          }
      
          const endpointCountsTableData = Object.keys(endpointCounts).map(endpoint => {
            return {
              'Endpoint': endpoint,
              'count': endpointCounts[endpoint],
            };
          });

          console.log('\nEndpoint Counts:');
          console.table(endpointCountsTableData);


          // Find the endpoint with the highest count
          let highestCount = 0;
          let highestCountEndpoint = '';
          for (const endpoint in endpointCounts) {
            if (endpointCounts[endpoint] > highestCount) {
              highestCount = endpointCounts[endpoint];
              highestCountEndpoint = endpoint;
            }
          }

          console.log('\nHighest Count Endpoint:');
          console.log(`Endpoint: ${highestCountEndpoint}, Count: ${highestCount}`);
        
          // 2. How many API calls were being made on a per-minute basis
          const apiCallsPerMinute: { [minute: string]: number } = {};
          for (const entry of logEntries) {
            const { timestamp } = entry;
            const minute = timestamp.substring(0, 16); // Considering only the minute part
            apiCallsPerMinute[minute] = (apiCallsPerMinute[minute] || 0) + 1;
          }
          const apiCallsPerMinuteTableData = Object.keys(apiCallsPerMinute).map(minute => {
            return {
              'Minute': minute,
              'count': apiCallsPerMinute[minute],
            };
          });

          console.log('\napiCallsPerMinute:');
          console.table(apiCallsPerMinuteTableData);
        
          // 3. How many API calls are there in total for each HTTP status code
          const statusCounts: { [statusCode: string]: number } = {};
          for (const entry of logEntries) {
            const { statusCode } = entry;
            statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
          }
          
          // Convert the statusCounts object to an array of objects for console.table
          function getStatusText(statusCode: string): string {
            switch (statusCode) {
              case '200':
                return 'OK';
              case '206':
                return 'Partial Content';
              case '304':
                return 'Not changed';
              case '401':
                return 'Unauthorized';
              case '404':
                return 'Not found';
              case '422':
                return 'Unprocessable Entity';
              case '500':
                return 'Server Error';
              default:
                return 'Unknown';
            }
          }

          // Helper function to map status codes to corresponding text
          const statusTableData = Object.keys(statusCounts).map(statusCode => {
            return {
              'status': getStatusText(statusCode),
              'statusCode': statusCode,
              'count': statusCounts[statusCode],
            };
          }); 
          console.log('\statusTableData:'); 
          console.table(statusTableData);
        }
      });
    });
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
