import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

const DebugToken = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const logInfo = async () => {
      const token = await getToken();
      console.log("🔐 Clerk JWT Token:\n", token);
      console.log("👤 User Info:\n", user);
      console.log("🛡️ User Role:", user?.privateMetadata?.role);
    };

    logInfo();
  }, [getToken, user]);

  return (
    <div style={{ padding: "1rem", background: "#eee", marginTop: "1rem" }}>
      <h2>Debug Info Logged to Console</h2>
      <p>Check your browser dev console (F12 or right-click → Inspect → Console).</p>
    </div>
  );
};

export default DebugToken;
