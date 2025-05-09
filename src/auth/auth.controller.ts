import express from "express";
import authService from "./auth.service";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const newUserData = req.body;

    const user = await authService.createUserService(newUserData);

    res.status(201).send({
      data: user,
      message: "User created successfully",
    });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { user, token } = await authService.loginUserService(email, password);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      })
      .status(200)
      .json({ data: user, message: "Login successful" });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
