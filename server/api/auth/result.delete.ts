import { clearAuthCookies } from "../../utils/shopify-auth";

export default defineEventHandler((event) => {
  clearAuthCookies(event);

  return {
    ok: true,
  };
});
