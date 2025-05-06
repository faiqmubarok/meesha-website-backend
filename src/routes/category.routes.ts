import express from "express"
import multer from "multer"
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller"
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Rute publik
router.get("/", getAllCategories as express.RequestHandler)
router.get("/:id", getCategoryById as express.RequestHandler)

// Rute admin
router.post(
  "/",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  upload.single("image"),
  createCategory as express.RequestHandler,
)
router.put(
  "/:id",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  upload.single("image"),
  updateCategory as express.RequestHandler,
)
router.delete(
  "/:id",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  deleteCategory as express.RequestHandler,
)

export default router
