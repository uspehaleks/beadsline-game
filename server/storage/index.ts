// server/storage/index.ts
import { DatabaseStorage } from "./DatabaseStorage.js";

export const storage = new DatabaseStorage();

export { IStorage } from "./IStorage.js";
export { storage };
export { logDiagnostic } from "../storage.js";