const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Banner = require("../models/bannerModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const sharp = require("sharp");
const path = require("path");
require("dotenv").config();

const credentials = {
  adminemail: process.env.ADMIN_EMAIL,
  adminpassword: process.env.ADMIN_PASSWORD,
};

const loadLogin = async (req, res, next) => {
  try {
    let { message } = req.session;
    if (req.session.adminSession) {
      res.locals.session = req.session.adminSession;
      res.redirect("/admin/dashboard");
    } else {
      req.session.message = "";
      res.render("adminLogin", { message });
    }
  } catch (err) {
    next(err);
  }
};
const loadDashboard = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { adminemail, adminpassword } = credentials;
    if (adminemail === email && adminpassword === password) {
      req.session.adminSession = adminemail;
      res.redirect("/admin/dashboard");
    } else {
      req.session.message = "Invalid Admin Details";
      res.redirect("/admin");
    }
  } catch (err) {
    next(err);
  }
};
const dashboard = async (req, res, next) => {
  try {
    let usersData = [];
    let currentSalesYear = new Date(new Date().getFullYear(), 0, 1);
    let usersByYear = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: currentSalesYear },
          blocked: { $ne: true },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let j = 0; j < usersByYear.length; j++) {
        result = false;
        if (usersByYear[j]._id == i) {
          usersData.push(usersByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) usersData.push({ _id: i, count: 0 });
    }
    let userData = [];
    for (let i = 0; i < usersData.length; i++) {
      userData.push(usersData[i].count);
    }
    let sales = [];
    let salesByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentSalesYear },
          orderStatus: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    for (let i = 1; i <= 12; i++) {
      let result = true;
      for (let j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) sales.push({ _id: i, total: 0, count: 0 });
    }
    let salesData = [];
    for (let i = 0; i < sales.length; i++) {
      salesData.push(sales[i].total);
    }
    const profitMargin = 0.5;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user");
    const currentYearProfit = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
          $expr: { $eq: [{ $year: "$createdAt" }, currentYear] },
        },
      },
      {
        $group: {
          _id: null,
          profit: {
            $sum: { $multiply: [profitMargin, "$grandTotal"] },
          },
        },
      },
    ]);
    const revenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "Delivered" },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$grandTotal" } } },
    ]);
    const monthlyEarning = await Order.aggregate([
      {
        $match: {
          orderStatus: "Delivered",
          $expr: { $eq: [{ $month: "$createdAt" }, currentMonth] },
        },
      },
      { $group: { _id: null, earning: { $sum: "$grandTotal" } } },
    ]);
    const latestUsers = await User.find().sort({ createdAt: -1 }).limit(4);
    const pendingOrder = await Order.countDocuments({ orderStatus: "Pending" });
    const placedOrder = await Order.countDocuments({ orderStatus: "Placed" });
    const cancelledOrder = await Order.countDocuments({
      orderStatus: "Cancelled",
    });
    const deliveredOrder = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const countProduct = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    res.render("adminDashboard", {
      currentYearProfit,
      monthlyEarning,
      cancelledOrder,
      deliveredOrder,
      categoryCount,
      pendingOrder,
      countProduct,
      latestOrders,
      latestUsers,
      placedOrder,
      salesData,
      userData,
      revenue,
    });
  } catch (err) {
    next(err);
  }
};
const loadLogout = async (req, res, next) => {
  try {
    req.session.adminSession = null;
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
};
const usersList = async (req, res, next) => {
  try {
    const usersList = await User.find({ verified: true });
    res.render("usersList", { users: usersList });
  } catch (err) {
    next(err);
  }
};
const usersBlocked = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const usersBlocked = await User.findById({ _id: userId });
    if (usersBlocked.blocked === false) {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { blocked: true } }
      );
      res.status(201).json({
        message: true,
      });
    } else {
      await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { blocked: false } }
      );
      res.status(201).json({
        message: false,
      });
    }
  } catch (err) {
    next(err);
  }
};
const categories = async (req, res, next) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    const categoryDetails = await Category.find();
    res.render("categories", { message, category: categoryDetails });
  } catch (err) {
    next(err);
  }
};
const addCategory = async (req, res, next) => {
  try {
    const { category_name, category_description } = req.body;
    const existingCategory = await Category.find({
      name: { $regex: new RegExp(`^${category_name}$`, "i") },
    });
    if (!existingCategory.length) {
      const categ = new Category({
        name: category_name,
        description: category_description,
      });
      await categ.save();
      res.redirect("/admin/categories");
    } else {
      req.session.message = "This category is already defined";
      res.redirect("/admin/categories");
    }
  } catch (err) {
    next(err);
  }
};
const editCategory = async (req, res, next) => {
  try {
    const { id } = req.query;
    const category = await Category.findById({ _id: id });
    res.render("editCategory", { category });
  } catch (err) {
    next(err);
  }
};
const updatedCategory = async (req, res, next) => {
  try {
    const { id, category_name, category_description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: category_name, description: category_description } }
    );
    await updatedCategory.save();
    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
};
const listCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findById({ _id: categoryId });
    if (category.list === true) {
      await Category.updateOne({ _id: categoryId }, { $set: { list: false } });
      res.status(201).json({ message: true });
    } else {
      await Category.updateOne({ _id: categoryId }, { $set: { list: true } });
      res.status(201).json({ message: false });
    }
  } catch (err) {
    next(err);
  }
};

const productAddPage = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.render("productAddPage", { categories });
  } catch (err) {
    next(err);
  }
};
const productList = async (req, res, next) => {
  try {
    const product = await Product.find().populate("category");
    res.render("productList", { product });
  } catch (err) {
    next(err);
  }
};
const productAdd = async (req, res, next) => {
  try {
    const {
      product_name,
      product_description,
      product_price,
      product_quantity,
      product_category,
      product_brand,
    } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/images",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 250, height: 250 })
          .toFile(filePath);
        imageArr.push(req.files[i].filename);
      }
    }
    const product = new Product({
      name: product_name,
      description: product_description,
      price: product_price,
      quantity: product_quantity,
      category: product_category,
      image: imageArr,
      brand: product_brand,
      stock: true,
    });
    await product.save();
    res.redirect("/admin/productList");
  } catch (err) {
    next(err);
  }
};
const listProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById({ _id: productId });
    if (product.list === true) {
      await Product.updateOne({ _id: productId }, { $set: { list: false } });
      res.status(201).json({ unlistSuccess: true });
    } else {
      await Product.updateOne({ _id: productId }, { $set: { list: true } });
      res.status(201).json({ listSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};
const productEditPage = async (req, res, next) => {
  try {
    const { id } = req.query;
    const product = await Product.findById({ _id: id });
    const category = await Category.find();
    res.render("productEditPage", {
      categories: category,
      product_id: id,
      product,
    });
  } catch (err) {
    next(err);
  }
};
const productUpdated = async (req, res, next) => {
  try {
    const {
      product_description,
      product_quantity,
      product_category,
      product_price,
      product_brand,
      product_name,
      product_id,
    } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/images",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 250, height: 250 })
          .toFile(filePath);
        imageArr.push(req.files[i].filename);
      }
    }
    if (req.files.length) {
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: product_name,
            price: product_price,
            quantity: product_quantity,
            category: product_category,
            description: product_description,
            brand: product_brand,
            image: imageArr,
          },
        }
      );
      res.redirect("/admin/productList");
    } else {
      await Product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: product_name,
            quantity: product_quantity,
            price: product_price,
            description: product_description,
            category: product_category,
          },
        }
      );
      res.redirect("/admin/productList");
    }
  } catch (err) {
    next(err);
  }
};
const orders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user").sort({ createdAt: -1 });
    res.render("ordersList", { orders: orders });
  } catch (err) {
    next(err);
  }
};
const viewOrdered = async (req, res, next) => {
  try {
    const { id } = req.query;
    const order = await Order.findById({ _id: id })
      .populate("user")
      .populate("items.product");
    res.render("viewOrdered", { order: order });
  } catch (err) {
    next(err);
  }
};
const changeStatus = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 10);
    const dateInTenDays = currentDate.toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "Asia/Kolkata",
    });
    if (status === "Delivered") {
      await Order.updateOne(
        { _id: orderId },
        { $set: { orderStatus: status, expiredDate: dateInTenDays } }
      );
    } else {
      await Order.updateOne(
        { _id: orderId },
        { $set: { orderStatus: status } }
      );
    }
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
};
const cancelOrder = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { orderStatus: status } }
    );
    if (order) {
      const orders = await Order.findById({ _id: orderId });
      for (let order of orders.items) {
        await Product.updateOne(
          { _id: order.product },
          { $inc: { quantity: order.quantity } }
        );
      }
      res.status(201).json({ message: "Succefull and modified" });
    } else {
      res.status(400).json({ message: "Seems like there is an error" });
    }
  } catch (err) {
    next(err);
  }
};
const salesReport = async (req, res, next) => {
  try {
    const moment = require("moment");
    const firstOrder = await Order.find().sort({ createdAt: 1 });
    const lastOrder = await Order.find().sort({ createdAt: -1 });
    const salesReport = await Order.find({ orderStatus: "Delivered" })
      .populate("user")
      .sort({ createdAt: -1 });
    res.render("salesReport", {
      firstOrder: moment(firstOrder[0].createdAt).format("YYYY-MM-DD"),
      lastOrder: moment(lastOrder[0].createdAt).format("YYYY-MM-DD"),
      salesReport,
    });
  } catch (err) {
    next(err);
  }
};
const datePicker = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    const selectedDate = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
          orderStatus: "Delivered",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);
    res.status(200).json({ selectedDate: selectedDate });
  } catch (err) {
    next(err);
  }
};
const banner = async (req, res, next) => {
  try {
    const banner = await Banner.find();
    res.render("banner", { banner });
  } catch (err) {
    next(err);
  }
};
const bannerAdd = async (req, res) => {
  try {
    res.render("bannerAdd");
  } catch (err) {
    next(err);
  }
};
const bannerAdded = async (req, res, next) => {
  try {
    const { bannerName, bannerDescription, bannerField } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/images",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 1000, height: 1000 })
          .toFile(filePath);
        imageArr.push(req.files[i].filename);
      }
    }
    const banner = new Banner({
      title: bannerName,
      description: bannerDescription,
      field: bannerField,
      image: imageArr,
    });
    await banner.save();
    res.redirect("/admin/banner");
  } catch (err) {
    next(err);
  }
};
const bannerEdit = async (req, res, next) => {
  try {
    const { id } = req.query;
    const banner = await Banner.findById({ _id: id });
    res.render("bannerEdit", { banner, bannerId: banner._id });
  } catch (err) {
    next(err);
  }
};
const bannerUpdated = async (req, res, next) => {
  try {
    const { bannerId, bannerName, bannerField, bannerDescription } = req.body;
    const imageArr = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filePath = path.join(
          __dirname,
          "../public/images",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize({ width: 1000, height: 1000 })
          .toFile(filePath);
        imageArr.push(req.files[i].filename);
      }
    }

    if (req.files.length) {
      await Banner.findByIdAndUpdate(
        { _id: bannerId },
        {
          $set: {
            title: bannerName,
            field: bannerField,
            description: bannerDescription,
            image: imageArr,
          },
        }
      );
      res.redirect("/admin/banner");
    } else {
      await Product.findByIdAndUpdate(
        { _id: bannerId },
        {
          $set: {
            name: bannerName,
            field: bannerField,
            description: bannerDescription,
          },
        }
      );
      res.redirect("/admin/banner");
    }
  } catch (err) {
    next(err);
  }
};
const listBanner = async (req, res, next) => {
  try {
    const { bannerId } = req.body;
    const banner = await Banner.findById({ _id: bannerId });
    if (banner.list === true) {
      await Banner.updateOne({ _id: bannerId }, { $set: { list: false } });
      res.status(201).json({ unlistSuccess: true });
    } else {
      await Banner.updateOne({ _id: bannerId }, { $set: { list: true } });
      res.status(201).json({ listSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};
const coupon = async (req, res, next) => {
  try {
    let { message } = req.session;
    req.session.message = "";
    const coupon = await Coupon.find();
    res.render("coupon", { coupon, message });
  } catch (err) {
    next(err);
  }
};
const couponAdded = async (req, res, next) => {
  try {
    const { code, percentage, description, applicableLimit, expireDate } =
      req.body;
    const date = expireDate.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const lowerCode = code.toLowerCase();
    const sameCoupon = await Coupon.findOne({ code: lowerCode });
    if (!sameCoupon) {
      const makeCoupon = new Coupon({
        code: code,
        percentage: percentage,
        description: description,
        applicableLimit: applicableLimit,
        expireDate: date,
      });
      await makeCoupon.save();
    } else {
      req.session.message = "This code has been already used";
    }
    res.redirect("/admin/coupon");
  } catch (err) {
    next(err);
  }
};
const editCoupon = async (req, res, next) => {
  try {
    const { id } = req.query;
    const coupon = await Coupon.findById({ _id: id });
    res.render("editCoupon", { coupon });
  } catch (err) {
    next(err);
  }
};
const updatedCoupon = async (req, res, next) => {
  try {
    const { id, code, description, percentage, applicableLimit, expireDate } =
      req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          code: code,
          description: description,
          percentage: percentage,
          applicableLimit: applicableLimit,
          expireDate: expireDate,
        },
      }
    );
    await updatedCoupon.save();
    res.redirect("/admin/coupon");
  } catch (err) {
    next(err);
  }
};
const listCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.body;
    const coupon = await Coupon.findById({ _id: couponId });
    if (coupon.list === true) {
      await Coupon.updateOne({ _id: couponId }, { $set: { list: false } });
      res.status(201).json({ unlistSuccess: true });
    } else {
      await Coupon.updateOne({ _id: couponId }, { $set: { list: true } });
      res.status(201).json({ listSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};
module.exports = {
  productEditPage,
  updatedCategory,
  productAddPage,
  productUpdated,
  updatedCoupon,
  loadDashboard,
  bannerUpdated,
  editCategory,
  usersBlocked,
  listCategory,
  changeStatus,
  viewOrdered,
  bannerAdded,
  productList,
  salesReport,
  addCategory,
  cancelOrder,
  listProduct,
  couponAdded,
  listCoupon,
  editCoupon,
  loadLogout,
  productAdd,
  datePicker,
  categories,
  listBanner,
  bannerEdit,
  bannerAdd,
  loadLogin,
  dashboard,
  usersList,
  coupon,
  banner,
  orders,
};
