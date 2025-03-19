import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Faculty Time Report System</span>
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
