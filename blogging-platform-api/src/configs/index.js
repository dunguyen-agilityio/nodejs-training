import { config } from "dotenv";

config({ path: [".env.local"] });

export * from "./data-source.js";
