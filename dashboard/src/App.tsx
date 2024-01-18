import { ManualView } from "./components/ManualView";
import { Toaster } from "sonner";
import SocketConnectionProvider from "./components/hooks/useSocketCon";

function App() {
  return (
    <SocketConnectionProvider>
      <div>
        <ManualView />
        <Toaster closeButton richColors position="top-right" />
      </div>
    </SocketConnectionProvider>
  );
}

export default App;
