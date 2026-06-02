import { beginAuth, type StartAuthPayload } from "../../utils/shopify-auth";

export default defineEventHandler(async (event) => {
  const body = await readBody<StartAuthPayload>(event);
  await beginAuth(event, body);
});
