import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { useSocketConnection } from "@/_services/socketio";

export function Navbar() {
  const mode =
    new URLSearchParams(window.location.search).get("mode") || "manual";
  const socketConnected = useSocketConnection();

  return (
    <div>
      <nav>
        <button className="">
          <MenuIcon width={24} height={24} />
        </button>
        <h2 className="text-3xl font-bold">InLights - Traffic Controller</h2>
        <div>
          <p>
            Status:{" "}
            <span
              className={cn(
                "font-bold",
                socketConnected ? "text-green-500" : "text-red-500"
              )}
            >
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
        </div>
      </nav>
      <div className="button-wrapper">
        <a
          href="?mode=manual"
          className={cn("screens", mode === "manual" && "active")}
          id="manual"
        >
          Manual
        </a>
        <a
          href="?mode=smart"
          className={cn("screens", mode === "smart" && "active")}
          id="smart"
        >
          Smart
        </a>
        <a
          href="?mode=blink"
          className={cn("screens", mode === "blink" && "active")}
          id="blink"
        >
          Blink
        </a>
        <a
          href="?mode=testing"
          className={cn("screens", mode === "testing" && "active")}
          id="testing"
        >
          Testing
        </a>
      </div>
    </div>
  );
}
