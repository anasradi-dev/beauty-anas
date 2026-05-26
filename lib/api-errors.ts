export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  const message = error.message;
  const lowerMessage = message.toLowerCase();

  if (message.includes("MONGODB_URI")) {
    return message;
  }

  if (
    lowerMessage.includes("ssl") ||
    lowerMessage.includes("tls") ||
    lowerMessage.includes("alert number 80")
  ) {
    return "MongoDB SSL connection failed. Check your MONGODB_URI: Atlas usually needs mongodb+srv://, while local MongoDB usually uses mongodb://127.0.0.1:27017/beauty_anas. Restart the dev server after changing .env.";
  }

  if (
    lowerMessage.includes("server selection timed out") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("querysrv") ||
    lowerMessage.includes("enotfound")
  ) {
    return "Cannot connect to MongoDB. Check that MONGODB_URI is correct, MongoDB is running, and your Atlas network access allows your IP.";
  }

  if (lowerMessage.includes("invalid mongodb_uri")) {
    return message;
  }

  if (lowerMessage.includes("validation")) {
    return "Please check the form fields and try again.";
  }

  return message || fallback;
}
