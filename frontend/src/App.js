import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#e3f2fd" }}>
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary py-4">
        <div className="container">
          <span className="navbar-brand mb-0 fw-bold fs-1">
            NSCC Faculty Time Report System
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <AdminDashboard />
      </div>
    </div>
  );
}

export default App;
