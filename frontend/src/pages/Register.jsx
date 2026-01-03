import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useToast from "../hooks/useToast"; // Import the toast hook

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        username: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      showSuccess("Registration successful! Redirecting to login...", {
        autoClose: 2000,
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Wait for user to see success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.status === 400) {
        errorMessage =
          err.response.data?.message || "Email or username already exists";
      } else if (err.response?.status === 422) {
        errorMessage = "Invalid input data. Please check your information.";
      } else if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      }

      showError(errorMessage, {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Create Account</h3>

              <form onSubmit={submit} noValidate>
                {/* Name Field */}
                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Enter your full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="example@email.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="At least 6 characters"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                  <div className="form-text">
                    Password must be at least 6 characters long.
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-4">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Re-enter your password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  className="btn btn-success w-100 py-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              {/* Terms & Conditions */}
              <div className="mt-3 text-center">
                <small className="text-muted">
                  By registering, you agree to our Terms of Service and Privacy
                  Policy
                </small>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4 pt-3 border-top">
                <p className="mb-0">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-decoration-none fw-semibold"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    Login here
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Password Requirements Info */}
          <div className="card mt-3 border-info">
            <div className="card-body py-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Tips:</strong> Use a strong password with letters,
                numbers, and symbols.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
