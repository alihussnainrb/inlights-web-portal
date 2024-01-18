import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import { socket } from "@/_services/socketio";
import { useSocketConnection } from "./hooks/useSocketCon";
import { useSignalsDataStore } from "@/_helpers/stores/useSignalsData";
import { Spinner } from "./ui/spinner";
import { useEffect, useState } from "react";


const modesList = ["manual", "smart", "blink", "testing"]

export function Navbar() {
  // const [activeMode, setactiveMode] = useState("manual");
  const { controllerConnected, socketConnected } = useSocketConnection()
  const { signalsData } = useSignalsDataStore()
  const [updatingMode, setUpdatingMode] = useState({ value: false, name: "" })



  const sendModeChangeEvent = async (mode: string) => {
    // setactiveMode(mode)
    setUpdatingMode({ value: true, name: mode })
    try {
      const res = await socket.timeout(5000).emitWithAck("mode-update", mode);
      if (res?.status !== "success") throw new Error("Failed on toggle state");
    } catch (error) {
      // toast.error("Got some error while processing your request.", {
      //   action: {
      //     label: "Try Again",
      //     onClick: () => sendModeChangeEvent(mode),
      //   },
      // });
    }
  }

  useEffect(() => {
    if (!updatingMode?.value) return;
    if (updatingMode.name === signalsData?.mode) {
      setUpdatingMode({ name: "", value: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalsData])


  return (
    <div>
      <nav>
        <button className="">
          <MenuIcon width={24} height={24} />
        </button>
        <h2 className="text-3xl font-bold">InLights - Traffic Controller</h2>
        <div>
          <p>
            Server Status:{" "}
            <span
              className={cn(
                "font-bold",
                socketConnected ? "text-green-500" : "text-red-500"
              )}
            >
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
          <p>
            Controller Status:{" "}
            <span
              className={cn(
                "font-bold",
                controllerConnected ? "text-green-500" : "text-red-500"
              )}
            >
              {controllerConnected ? "Connected" : "Disconnected"}
            </span>
          </p>
        </div>
      </nav>
      <div className="button-wrapper">

        {modesList.map((mode) => (
          <button
            type="button"
            disabled={updatingMode?.value}
            className={cn(
              "screens uppercase flex items-center justify-center h-10",
              mode === signalsData?.mode && !updatingMode?.value && "active"
            )}
            onClick={() => sendModeChangeEvent(mode)}
          >
            {updatingMode.value && updatingMode.name === mode ? <Spinner className="border-gray-500" /> : `${mode === "manual" ? "Pre-Time" : mode}`}
          </button>
        ))}

        {/* <a
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
        </a> */}
      </div>
    </div>
  );
}
