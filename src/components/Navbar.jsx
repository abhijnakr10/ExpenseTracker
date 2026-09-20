import { Link, useLocation } from "react-router-dom";

function Navbar({ user, setUser }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (setUser) setUser(null);
  };

  return (
    <nav>
      <Link to="/" className="nav-brand">
        <div className="brand-icon">💳</div>
        <div>
          <h2 className="brand-title">ExpenseTracker</h2>
        </div>
        <span className="brand-badge">MERN</span>
      </Link>

      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/expenses" 
          className={`nav-link ${location.pathname === "/expenses" ? "active" : ""}`}
        >
          All Transactions
        </Link>

        {user ? (
          <div className="nav-auth-group">
            <div className="user-badge">
              <span className="user-dot"></span>
              <span>{user.name || "Student"}</span>
            </div>
            <button className="btn-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-auth-group">
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
