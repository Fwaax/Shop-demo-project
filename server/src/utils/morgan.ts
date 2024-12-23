import {Request, Response} from "express";
import {TokenIndexer} from "morgan";

export default function colorfulMorganFormat(
  tokens: TokenIndexer,
  req: Request,
  res: Response
) {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens["response-time"](req, res);
  const requestBody = JSON.stringify(req.body);
  const responseBody = JSON.stringify(res.locals.body);

  // Set colors for different parts of the log
  const colors: Record<string, string> = {
    GET: "\x1b[36m", // Cyan
    POST: "\x1b[32m", // Green
    PUT: "\x1b[33m", // Yellow
    DELETE: "\x1b[31m", // Red
    status:
      Number(status) >= 500
        ? "\x1b[31m"
        : Number(status) >= 400
        ? "\x1b[33m"
        : "\x1b[32m", // Red for server errors, Yellow for client errors, Green for success
    responseTime: Number(responseTime) >= 1000 ? "\x1b[31m" : "\x1b[32m", // Red for response time over 1000ms, Green otherwise
    reset: "\x1b[0m", // Reset color
  };

  // Format log message
  return [
    colors[method] + method, // Method color
    url,
    "Request Body: " + requestBody,
    "Response Body: " + responseBody,
    colors.status + status, // Status color
    res.getHeader("content-length") || 0,
    "-",
    colors.responseTime + responseTime + "ms", // Response time color
    colors.reset, // Reset color
  ].join(" ");
}
