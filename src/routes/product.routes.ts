import express from "express"
import multer from "multer"
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller"
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Rute publik
router.get("/", getAllProducts as express.RequestHandler)
router.get("/:id", getProductById as express.RequestHandler)

// Rute admin
router.post(
  "/",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  upload.single("image"),
  createProduct as express.RequestHandler,
)
router.put(
  "/:id",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  upload.single("image"),
  updateProduct as express.RequestHandler,
)
router.delete(
  "/:id",
  authenticate as express.RequestHandler,
  authorizeAdmin as express.RequestHandler,
  deleteProduct as express.RequestHandler,
)

export default router
