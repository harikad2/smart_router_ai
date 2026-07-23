import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import InputPage from "./pages/InputPage";

export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "input"

  return (
    <div className="app-root">
      {page === "landing" && <LandingPage onStart={() => setPage("input")} />}
      {page === "input" && <InputPage />}
    </div>
  );
}