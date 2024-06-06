# MoneyHub Test

## Routes

### Generate and Send CSV Report

- **Endpoint**: `/investments/generate-csv/:id?`
- **Method**: `GET`
- **Description**: Generates a CSV report of user investment holdings and sends it to the investments service. If a user ID is provided, the report will include only that user's investments.

### Get Investment by ID

- **Endpoint**: `/investments/:id`
- **Method**: `GET`
- **Description**: Fetches an investment record by its ID.

## Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```sh
   cd admin
   ```

3. Install dependencies:

   ```sh
   npm i
   ```

## Running the Project

1. Start the admin service:

   ```sh
   npm start
   ```

   or for development with hot-reloading:

   ```sh
   npm run develop
   ```

2. The service will be running on the port specified in the configuration (default: 8083).

## Running Tests

To run the tests, use the following command:

```sh
npm test
```

## Security Improvements

- I would implement some form of authentication, such as OAuth2 or JWT to ensure only authorized users can access the endpoints.
- Validate user inputs to prevent injection attacks.
- Implement some form of rate limiting to prevent abuse and denial of service attacks.

## Scalability Improvements

- For larger datasets, process the data in batches to avoid memory overload via batch processing.
- Use streaming to handle large CSV files efficiently.
- Deploy the service behind a load balancer to distribute traffic evenly across multiple instances.

## Potential Improvements with More Time

- Enhance error handling with more specific error messages and codes.
- Increase test coverage for edge cases and different scenarios.
- Make use on Ramda
- Use TypeScript over standard JavaScript to make it more Type-strict and consistent.
- Integrate Continuous Integration and Continuous Deployment pipelines for automated testing and deployment.
- Further refactor the code to improve readability and maintainability.
