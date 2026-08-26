import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Clients from "./pages/Clients";

const Dashboard = () => <div>Dashboard Page</div>; // still a placeholder for now, that's fine

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
                  <Route path="/clients" element={<ProtectedRoute>
              <Clients/>
            </ProtectedRoute>}
/>
    </Routes>
  );
};

export default App;