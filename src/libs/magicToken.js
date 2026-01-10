import crypto from "crypto";

export const generateMagicToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
