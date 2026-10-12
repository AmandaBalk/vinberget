import { defineConfig } from "vite";
import { handler } from "./netlify/functions/prices.mjs";

export default defineConfig({
  plugins: [
    {
      name: "local-netlify-prices-function",
      configureServer(server) {
        server.middlewares.use(
          "/.netlify/functions/prices",
          async (request, response, next) => {
            if (request.method !== "GET") {
              next();
              return;
            }

            const requestUrl = new URL(
              request.url ?? "/",
              "http://localhost",
            );
            const result = await handler({
              queryStringParameters: Object.fromEntries(
                requestUrl.searchParams,
              ),
            });

            response.statusCode = result.statusCode;
            for (const [name, value] of Object.entries(result.headers ?? {})) {
              response.setHeader(name, value);
            }
            response.end(result.body);
          },
        );
      },
    },
  ],
});
