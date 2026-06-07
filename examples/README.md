# Examples

This directory contains integration examples for the `@keeratita/card` package.

## Vanilla JavaScript Example

Located in `./vanilla/`, this is a fully functional demonstration showcasing the iOS 17 glassmorphic credit card visual design, input masking, CVC 3D card flips, dynamic field loading, and asynchronous checkout vaulting callbacks (direct Stripe & Omise integration).

### Running the Example Locally

Because the example leverages ES Modules (`<script type="module">`), modern browsers restrict loading it directly over the local file system (`file://` protocol) due to CORS security policies.

To run the example correctly, you must serve it over an HTTP server:

1. **Build the Library**:
   Ensure you compile the package outputs in the root folder first:
   ```bash
   npm run build
   ```

2. **Start a Local HTTP Server**:
   Start a simple server from the root of the project. You can use Python's built-in module:
   ```bash
   python3 -m http.server 8000
   ```
   Or use Node's `serve` package:
   ```bash
   npx serve -p 8000
   ```

3. **Browse the Demo**:
   Open your browser and navigate to:
   [http://localhost:8000/examples/vanilla/index.html](http://localhost:8000/examples/vanilla/index.html)
