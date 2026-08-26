import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import TimeSessions from "./pages/TimeSessions";
import InvoiceBuilder from "./pages/InvoiceBuilder";
import Invoices from "./pages/Invoices";

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

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />


      <Route
  path="/time-sessions"
  element={
    <ProtectedRoute>
      <TimeSessions />
    </ProtectedRoute>
  }
/>

<Route
  path="/invoices/new"
  element={
    <ProtectedRoute>
      <InvoiceBuilder />
    </ProtectedRoute>
  }
/>
<Route
  path="/invoices"
  element={
    <ProtectedRoute>
      <Invoices />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
};

export default App;