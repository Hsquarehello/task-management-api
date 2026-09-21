import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.body,req.params,req.query တို့ကို validation စစ်ဆေးခြင်း
      const parsed = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      })) as any;

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) Object.assign(req.query, parsed.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Validation Error တက်ပါက Clean Response ပြန်ပေးမည်
        res.status(400).json({
          message: "Validation Error",
          errors: error.issues.map((e) => ({
            field: e.path.join(".").replace(/^(body|params|query)\./, ""),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
