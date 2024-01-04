import { cn } from "@/lib/utils";

export function Spinner({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={cn(
        "border-slate-200 rounded-full animate-spin",
        size === "sm" ? "w-5 border-2" : "w-20 border-4",
        "h-auto aspect-square",
        className,
        "!border-t-transparent"
      )}
    />
  );
}
