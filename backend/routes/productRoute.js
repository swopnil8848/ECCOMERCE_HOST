const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require('multer');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // console.log("this.file",file);
    cb(null, './uploads')
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // console.log("filename",this.file)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts)

router.route('/products').get(getAllProducts);
router.route('/products/new').post(createProduct);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single('images'), createProduct);


router.route('/product/:id').get(getProductDetails);

router
  .route('/product/:id')
  .put(updateProduct)
  .delete(deleteProduct)

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReview);

module.exports = router