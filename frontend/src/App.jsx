import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/context";

import Login from "./pages/account/login";
import Home from "./pages/home/Home";
import DefaultLayout from "./layouts/default_layout/default_layout";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DefaultLayout />}><Route index element={<Home />} /></Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
