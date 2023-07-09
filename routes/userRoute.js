const { isLogout, isLogin } = require("../middleware/userSession");
const {
  deleteFromCart,
  orderPlaced,
  placeOrder,
  addToCart,
  cartCount,
  loadCart,
} = require("../controllers/cartController");
const {
  emailVerificationPage,
  emailVerification,
  updatedPassword,
  addAddressPage,
  updatedProfile,
  updatedAddress,
  changePassword,
  manageAddress,
  deleteAddress,
  singleProduct,
  loginSuccess,
  loadRegister,
  editProfile,
  editAddress,
  userProfile,
  insertUser,
  loadLogout,
  addAddress,
  loadLogin,
  error500,
  loadHome,
  orders,
} = require("../controllers/userController");

const express = require("express");
const userRoute = express();
userRoute.set("views", "views/users");

/**
 * @swagger
 * /:
 *  get:
 *     tags:
 *     - Home
 *     description: user home of ecommerce webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/", loadHome);
/**
 * @swagger
 * /singleProduct:
 *  get:
 *     tags:
 *     - Product
 *     description: displays the page of single webpage
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/singleProduct", isLogin, singleProduct);
/**
 * @swagger
 * /login:
 *  get:
 *     tags:
 *     - Login
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/login", isLogout, loadLogin);
/**
 * @swagger
 * /login:
 *  post:
 *     tags:
 *     - Login
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/login", isLogout, loginSuccess);
/**
 * @swagger
 * /register:
 *  get:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/register",isLogout, loadRegister);
/**
 * @swagger
 * /register:
 *  post:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/register", insertUser);
/**
 * @swagger
 * /emailVerification:
 *  get:
 *     tags:
 *     - Register
 *     description: displays the page of email verification
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/emailVerification",isLogout, emailVerificationPage);
/**
 * @swagger
 * /emailVerification:
 *  post:
 *     tags:
 *     - Register
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/emailVerification", emailVerification);
/**
 * @swagger
 * /cart:
 *  get:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/cart", isLogin, loadCart);
/**
 * @swagger
 * /cart:
 *  post:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/cart",isLogin, addToCart);
/**
 * @swagger
 * /cart:
 *  put:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.put("/cart",isLogin, deleteFromCart);
/**
 * @swagger
 * /cartCount:
 *  put:
 *     tags:
 *     - Cart
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/cartCount", cartCount);
/**
 * @swagger
 * /userProfile:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/userProfile", isLogin, userProfile);
/**
 * @swagger
 * /orders:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/orders", isLogin, orders);
/**
 * @swagger
 * /editProfile:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/editProfile", isLogin, editProfile);
/**
 * @swagger
 * /manageAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/manageAddress", isLogin, manageAddress);
/**
 * @swagger
 * /addAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/addAddress", isLogin, addAddressPage);
/**
 * @swagger
 * /addAddress:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/addAddress", isLogin, addAddress);
/**
 * @swagger
 * /editAddress:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/editAddress", isLogin, editAddress);
/**
 * @swagger
 * /editAddress:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/editAddress", isLogin, updatedAddress);
/**
 * @swagger
 * /deleteAddress:
 *  put:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.put("/deleteAddress", isLogin, deleteAddress);
/**
 * @swagger
 * /editProfile:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/editProfile", isLogin, updatedProfile);
/**
 * @swagger
 * /changePassword:
 *  get:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/changePassword", isLogin, changePassword);
/**
 * @swagger
 * /changePassword:
 *  post:
 *     tags:
 *     - User
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.post("/changePassword", isLogin, updatedPassword);
/**
 * @swagger
 * /placeOrder:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/placeOrder", isLogin, placeOrder);
/**
 * @swagger
 * /orderPlaced:
 *  get:
 *     tags:
 *     - Orders
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/orderPlaced", isLogin, orderPlaced);
/**
 * @swagger
 * /logout:
 *  get:
 *     tags:
 *     - Logout
 *     description: displays the page of login
 *     responses:
 *       200:
 *         description:successful operation
 */
userRoute.get("/logout", isLogin, loadLogout);
/**
 * @swagger
 * /error500:
 *  get:
 *     tags:
 *     - Error
 *     description: displays the page of login
 *     responses:
 *       500:
 *        description:successful operation
 */
userRoute.get("/error500", error500);

module.exports = userRoute;
