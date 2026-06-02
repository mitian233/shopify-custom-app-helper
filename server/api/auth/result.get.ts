import { readAuthResult } from "../../utils/shopify-auth";

export default defineEventHandler((event) => {
  return {
    result: readAuthResult(event),
  };
});
