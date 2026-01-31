// server/storage/index.ts
import { DatabaseStorage } from "../storage";

export const storage = new DatabaseStorage();

export { IStorage } from "../storage";
export { storage };
export { logDiagnostic } from "../storage";