import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    console.log("🛡️ User ID:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found in request",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    console.log("🛡️ User Role:", user.privateMetadata?.role);

    if (user.privateMetadata?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    next();
  } catch (error) {
    console.error("Error in protectAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while checking admin role",
    });
  }
};
