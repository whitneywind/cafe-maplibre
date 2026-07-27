// admin auth guard
export const adminAuth = (req, res, next) => {
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    console.error("admin var not set. no admin requests");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const secret = req.headers["x-admin-secret"];
  if (!secret || typeof secret !== "string") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};