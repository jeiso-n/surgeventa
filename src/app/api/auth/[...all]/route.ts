import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth";

export const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler((request) =>
  getAuth().handler(request),
);
