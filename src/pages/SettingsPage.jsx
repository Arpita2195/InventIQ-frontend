import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    shopName: user?.shopName || "",
    phone: user?.phone || "",
    language: user?.language || "hindi",
    password: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match" });
    }
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const payload = {
        name: form.name,
        shopName: form.shopName,
        phone: form.phone,
        language: form.language,
      };
      if (form.password) payload.password = form.password;
      const { data } = await authApi.updateProfile(payload);
      updateUser(data);
      setMsg({ type: "success", text: "Profile updated successfully!" });
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (e) {
      setMsg({
        type: "error",
        text: e.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Settings
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Manage your shop profile and preferences
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Profile form */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 28,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            Shop Profile
          </div>

          {msg.text && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
                background:
                  msg.type === "success"
                    ? "rgba(5,150,105,0.1)"
                    : "rgba(225,29,72,0.1)",
                border: `1px solid ${msg.type === "success" ? "rgba(5,150,105,0.3)" : "rgba(225,29,72,0.3)"}`,
                color:
                  msg.type === "success" ? "var(--green-l)" : "var(--coral-l)",
              }}
            >
              {msg.text}
            </div>
          )}

          <form
            onSubmit={save}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Field
              label="Your Name"
              value={form.name}
              onChange={set("name")}
              placeholder="Ramesh Patel"
            />
            <Field
              label="Shop Name"
              value={form.shopName}
              onChange={set("shopName")}
              placeholder="Patel General Store"
            />
            <Field
              label="Phone Number"
              value={form.phone}
              onChange={set("phone")}
              placeholder="9876543210"
            />

            <div>
              <label style={labelStyle}>Preferred Language</label>
              <select
                value={form.language}
                onChange={set("language")}
                style={{ ...inputStyle, appearance: "none" }}
              >
                <option value="hindi">Hindi — हिंदी</option>
                <option value="gujarati">Gujarati — ગુજરાતી</option>
                <option value="english">English</option>
              </select>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}
              >
                AI will respond in this language
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 16,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 12,
                  color: "var(--text)",
                }}
              >
                Change Password
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <Field
                  label="New Password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Leave blank to keep current"
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px",
                borderRadius: 10,
                background: "var(--purple)",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Syne',sans-serif",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Account info + app info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Account card */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              Account Info
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: "var(--purple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Syne',sans-serif",
                }}
              >
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {user?.email}
                </div>
              </div>
            </div>
            {[
              ["Shop", user?.shopName],
              [
                "Language",
                user?.language?.charAt(0).toUpperCase() +
                  user?.language?.slice(1),
              ],
              ["Email", user?.email],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{k}</span>
                <span style={{ color: "var(--text)", fontWeight: 500 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid rgba(225,29,72,0.3)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--coral-l)",
                marginBottom: 10,
              }}
            >
              Danger Zone
            </div>
            <div
              style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}
            >
              These actions cannot be undone.
            </div>
            <button
              onClick={() => {
                if (window.confirm("Clear all chat history?"))
                  alert("Feature coming soon");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(225,29,72,0.4)",
                color: "var(--coral-l)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear Chat History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "var(--muted)",
  marginBottom: 6,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const inputStyle = {
  width: "100%",
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  transition: "border .15s",
};

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--purple)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
