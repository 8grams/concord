import "dotenv/config";
import type { MiddlewareHandler } from "astro";
import { Db } from "./db";

export const onRequest: MiddlewareHandler = async (Astro, next) => {
  const user = await Astro.session.get("user");
  if (!user) {
    if (!["/login", "/google", "/login-admin"].includes(Astro.url.pathname)) {
      return Astro.redirect("/login");
    }
  } else {
    if (["/login", "/google", "/login-admin"].includes(Astro.url.pathname)) {
      return Astro.redirect("/graph");
    } else {
      const isAdmin = user.id === 0;
      if (
        !isAdmin &&
        [
          "/workspaces",
          "/users",
          "/new-workspace",
          "/new-user",
          "/delete-workspace",
          "/delete-user",
        ].includes(Astro.url.pathname)
      ) {
        return Astro.redirect("/graph");
      }
      Astro.locals.user = user;
      Astro.locals.isAdmin = isAdmin;
    }
  }
  if (!Db.isInitialized) {
    await Db.initialize();
  }
  return next();
};
