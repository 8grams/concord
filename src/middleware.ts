import type { MiddlewareHandler } from "astro";
import { Db } from "./db";

export const onRequest: MiddlewareHandler = async (_, next) => {
  if (!Db.isInitialized) {
    await Db.initialize();
  }
  return next();
};
