import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { registerUser } from "../api/authApi";

const roles = [
  { id: 1, name: "Fleet Manager" },
  { id: 2, name: "Driver" },
  { id: 3, name: "Safety Officer" },
  { id: 4, name: "Financial Analyst" },
];

const inputStyle = (hasError, leftPadding = "0.75rem") => ({
  width: "100%",
  padding: `0.625rem 0.75rem 0.625rem ${leftPadding}`,
  borderRadius: "6px",
  border: `1px solid ${hasError ? "#DC2626" : "#CBD5E1"}`,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
});

const RegisterPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: "", email: "", roleId: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const onSubmit = async ({ name, email, password, roleId }) => {
    setApiError("");
    setIsSubmitting(true);
    try {
      const result = await registerUser({ name, email, password, roleId: Number(roleId) });
      if (result.success) {
        navigate("/login", { replace: true, state: { message: "Account created. Please sign in." } });
        return;
      }
      setApiError(result.message || "Registration failed");
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || "Unable to connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (error) => error && <p style={{ color: "#DC2626", fontSize: "0.75rem", margin: "0.375rem 0 0" }}>{error.message}</p>;
  const fieldLabel = (label) => <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500", color: "#334155" }}>{label}</label>;
  const icon = (Icon) => <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}><Icon size={18} /></span>;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F8FAFC", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#FFFFFF", padding: "2.5rem 2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#0F172A", margin: "0 0 0.5rem" }}>Create your account</h2>
          <p style={{ color: "#64748B", margin: 0, fontSize: "0.95rem" }}>Join TransitOps to manage your transport fleet</p>
        </div>

        {apiError && <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "6px", marginBottom: "1.25rem", fontSize: "0.9rem", fontWeight: "500" }}>{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: "1.1rem" }}>
            {fieldLabel("Full Name")}
            <div style={{ position: "relative" }}>{icon(UserRound)}<input {...register("name", { required: "Name is required" })} style={inputStyle(errors.name, "2.5rem")} placeholder="Alex Morgan" autoComplete="name" /></div>
            {fieldError(errors.name)}
          </div>
          <div style={{ marginBottom: "1.1rem" }}>
            {fieldLabel("Email Address")}
            <div style={{ position: "relative" }}>{icon(Mail)}<input type="email" {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Enter a valid email address" } })} style={inputStyle(errors.email, "2.5rem")} placeholder="operator@transitops.com" autoComplete="email" /></div>
            {fieldError(errors.email)}
          </div>
          <div style={{ marginBottom: "1.1rem" }}>
            {fieldLabel("Role")}
            <select {...register("roleId", { required: "Select a role" })} style={{ ...inputStyle(errors.roleId), color: "#334155", background: "#FFFFFF" }}>
              <option value="">Select your role</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            {fieldError(errors.roleId)}
          </div>
          <div style={{ marginBottom: "1.1rem" }}>
            {fieldLabel("Password")}
            <div style={{ position: "relative" }}>
              {icon(Lock)}
              <input type={showPassword ? "text" : "password"} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} style={{ ...inputStyle(errors.password, "2.5rem"), paddingRight: "3rem" }} placeholder="At least 8 characters" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", padding: 0 }}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {fieldError(errors.password)}
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            {fieldLabel("Confirm Password")}
            <input type="password" {...register("confirmPassword", { required: "Please confirm your password", validate: (value, values) => value === values.password || "Passwords do not match" })} style={inputStyle(errors.confirmPassword)} placeholder="Repeat your password" autoComplete="new-password" />
            {fieldError(errors.confirmPassword)}
          </div>
          <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "0.75rem", background: isSubmitting ? "#60A5FA" : "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.95rem", cursor: isSubmitting ? "not-allowed" : "pointer" }}>{isSubmitting ? "Creating account..." : "Create Account"}</button>
          <p style={{ color: "#64748B", fontSize: "0.875rem", margin: "1.25rem 0 0", textAlign: "center" }}>Already have an account? <Link to="/login" style={{ color: "#2563EB", fontWeight: "600", textDecoration: "none" }}>Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
