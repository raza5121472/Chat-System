import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Chat } from "./components/Chat";
import { Register } from "./components/Register";
import "./Style.scss";

function App() {
  const isLog = localStorage.getItem("loggedIn");
  const [isLoggedIn, setIsLoggedIn] = useState(isLog);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/" element={<Navigate to={"/login"} />} />
              <Route path="*" element={<Navigate to={"/login"} />} />

              <Route
                path="/login"
                element={<Register onLogin={() => setIsLoggedIn(true)} />}
              />
            </>
          ) : (
            <>
              <Route path="*" element={<Navigate to="/chat" />} />
              <Route path="/" element={<Navigate to="/chat" />} />
              <Route
                path="/chat"
                element={<Chat onLogout={() => setIsLoggedIn(false)} />}
              />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
