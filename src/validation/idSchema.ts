import { generateId, isId } from "@/utils";
import * as yup from "yup";

export const idSchema = yup
  .string()
  .optional()
  .default(generateId)
  .test(isId);
