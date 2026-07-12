import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const LoginPage = () => {
 const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ 
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // If already logged in, skip the login screen automatically
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setApiError("");
    setIsSubmitting(true);
    
    // 🔥 COMPLETE LOCAL HACKATHON DEV BYPASS 🔥
    if (data.email === "daksh@test.com") {
      // Direct mock session injection
      localStorage.setItem("transitops_token", "mock-hackathon-token");
      localStorage.setItem("transitops_user", JSON.stringify({ 
        name: "Daksh Sudo", 
        role: "Fleet Manager" // Grants full permission visibility to test every view!
      }));
      
      // Force immediate window refresh and direct navigation bypass
      window.location.href = "/dashboard";
      return;
    }

    // Standard backend database connection (runs normally for other emails)
    try {
      const result = await login(data);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setApiError(result.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      setApiError("Backend server offline. Use daksh@test.com to preview interface.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "#F8FAFC",
      padding: "1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#FFFFFF",
        padding: "2.5rem 2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
        border: "1px solid #E2E8F0"
      }}>
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#0F172A", margin: "0 0 0.5rem 0" }}>TransitOps</h2>
          <p style={{ color: "#64748B", margin: 0, fontSize: "0.95rem" }}>Sign in to manage your transport fleet</p>
        </div>

        {/* Dynamic API Communication Errors */}
        {apiError && (
          <div style={{
            background: "#FEE2E2",
            border: "1px solid #FCA5A5",
            color: "#DC2626",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email Inputs */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email syntax address",
                  },
                })}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem 0.625rem 2.5rem",
                  borderRadius: "6px",
                  border: `1px solid ${errors.email ? "#DC2626" : "#CBD5E1"}`,
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                placeholder="operator@transitops.com"
              />
            </div>
            {errors.email && (
              <p style={{ color: "#DC2626", fontSize: "0.75rem", marginTop: "0.375rem", marginBottom: 0 }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password Inputs */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                style={{
                  width: "100%",
                  padding: "0.625rem 3rem 0.625rem 2.5rem",
                  borderRadius: "6px",
                  border: `1px solid ${errors.password ? "#DC2626" : "#CBD5E1"}`,
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "#DC2626", fontSize: "0.75rem", marginTop: "0.375rem", marginBottom: 0 }}>{errors.password.message}</p>
            )}
          </div>

          {/* Action Trigger Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: isSubmitting ? "#60A5FA" : "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;