import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Ativos from "./pages/Ativos";
import Metas from "./pages/Metas";
import { UIProvider } from "./contexts/UIContext";

function App() {
  return (
    <UIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="ativos" element={<Ativos />} />
            <Route path="metas" element={<Metas />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UIProvider>
  );
}

export default App;
