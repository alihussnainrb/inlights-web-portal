import { ManualView } from "./components/ManualView";
import { Toaster } from "sonner";

function App() {
  return (
    <div>
      <ManualView />
      <Toaster closeButton richColors position="top-right" />
    </div>
  );
}

export default App;
