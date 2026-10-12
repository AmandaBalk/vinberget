import { defineConfig } from "vite";
import { handler } from "./netlify/functions/prices.mjs";

export default defineConfig({
  plugins: [
    {
      name: "local-netlify-prices-function",
      configureServer(server) {
        const priceFunctionMiddleware = async (request, response, next) => {
          const requestUrl = new URL(request.url ?? "/", "http://localhost");
          if (
            request.method !== "GET" ||
            requestUrl.pathname !== "/.netlify/functions/prices"
          ) {
            next();
            return;
          }

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
        };

        server.middlewares.stack.unshift({
          route: "",
          handle: priceFunctionMiddleware,
        });
      },
    },
  ],
});
