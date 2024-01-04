import { RequestHandler } from "express";
import { ZodSchema, z } from "zod";

export function validateRequest<
  TBody extends ZodSchema,
  TQuery extends ZodSchema,
  TParams extends ZodSchema,
  TResp extends ZodSchema
>(opts?: {
  validate?: {
    body?: TBody;
    query?: TQuery;
    params?: TParams;
  };
}): RequestHandler<
  z.infer<TParams>,
  IApiResponse<z.infer<TResp>>,
  z.infer<TBody>,
  z.infer<TQuery>
> {
  return async (req, res, next) => {
    if (opts?.validate?.body) {
      const parsedBody = await opts?.validate.body?.safeParseAsync(req.body);
      if (!parsedBody.success) {
        return res.send({
          succeed: false,
          reason: "BAD_REQUEST",
        });
      }
      req.body = parsedBody.data;
    }
    if (opts?.validate?.query) {
      const parsedQuery = await opts?.validate.query?.safeParseAsync(req.query);
      if (!parsedQuery.success) {
        return res.send({
          succeed: false,
          reason: "BAD_REQUEST",
        });
      }
      req.query = parsedQuery.data;
    }
    if (opts?.validate?.params) {
      const parsedParams = await opts?.validate.params?.safeParseAsync(
        req.params
      );
      if (!parsedParams.success) {
        return res.send({
          succeed: false,
          reason: "BAD_REQUEST",
        });
      }
      req.params = parsedParams.data;
    }
    next();
  };
}
