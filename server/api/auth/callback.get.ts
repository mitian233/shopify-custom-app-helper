import { completeAuth, storeErrorResult } from "../../utils/shopify-auth";

export default defineEventHandler(async (event) => {
  try {
    await completeAuth(event);
    return sendRedirect(event, "/?auth=success", 302);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Shopify OAuth callback failed";
    storeErrorResult(event, message);

    return sendRedirect(
      event,
      `/?auth=error&message=${encodeURIComponent(message)}`,
      302,
    );
  }
});
