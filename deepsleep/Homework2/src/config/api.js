// In unified Vercel deployment (Option 2), we always use relative paths.
// - In Production: Vercel rewrites /api to the backend.
// - In Development: Vite proxy forwards /api to localhost:3000.
// This completely eliminates configuration errors and double-slash issues.
export const API_BASE_URL = "";
console.log("DEBUG: Current API_BASE_URL is:", API_BASE_URL, "| If you see /api/api, check source map.");

/**
 * Wrapper around fetch to handle common API tasks
 * @param {string} endpoint - The API endpoint (e.g., '/api/users/login')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 */
export async function apiClient(endpoint, { body, ...customConfig } = {}) {
    const headers = {
        "Content-Type": "application/json",
    };

    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Allow the caller to handle specific non-200 statuses if needed
        // by attaching the status to the error object if the response is not ok
        if (!response.ok) {
            let errorDetails = {};
            try {
                // Read text ONCE to avoid "body stream already read" errors
                const errorText = await response.text();
                try {
                    errorDetails = JSON.parse(errorText);
                } catch {
                    // Fallback if parsing fails (e.g. HTML error page)
                    errorDetails = { message: errorText || response.statusText };
                }
            } catch (e) {
                // If we can't even read the text (e.g. network error mid-stream)
                errorDetails = { message: "Could not read error response body" };
            }

            // Cleaned up console log for production
            // console.error("API Error Detailed:", errorDetails);

            const error = new Error(errorDetails.message || `API Error: ${response.statusText}`);
            error.status = response.status;
            error.details = errorDetails; // Attach so consumer can use it
            throw error;
        }

        return response.json();
    } catch (error) {
        // Re-throw to be handled by the service
        throw error;
    }
}
