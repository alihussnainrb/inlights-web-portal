type IRequestFailReason =
  | "NOT_FOUND"
  | "WRONG_PASSWORD"
  | "DUPLICATE"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED";

type IApiResponse<TData = any> = {
  message?: string;
} & (
  | { succeed: false; data?: TData | null; reason: IRequestFailReason }
  | { succeed: true; data: TData }
);
