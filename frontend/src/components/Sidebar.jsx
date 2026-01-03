import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="d-flex">
      <div className="p-3 border-end" style={{ width: "200px" }}>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link" to="/map">
              Map
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/upload">
              Upload
            </Link>
          </li>
          <li className="nav-item">
            <button className="btn btn-danger w-100" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
