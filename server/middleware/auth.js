import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    const user = await clerkClient.users.getUser(userId);

    const adminEmail = process.env.ADMIN_EMAIL || "ram9998sharma@gmail.com";
    const userEmails = user.emailAddresses?.map((e) => e.emailAddress) || [];
    const isOwner = userEmails.includes(adminEmail);

    if (user.privateMetadata?.role !== "admin" && !isOwner) {
      return res.json({ success: false, message: "not authorized" });
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: "not authorized" });
  }
};
