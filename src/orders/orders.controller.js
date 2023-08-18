const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function orderExists(req, res, next) {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({
      status: 404,
      message: `Order ${orderId} not found.`
    });
  }
}

function validId(req, res, next) {
  const { id } = req.body.data;
  const orderId = req.params.orderId;
  if (req.body.data.id === null || req.body.data.id === undefined || req.body.data.id === "") {
    return next();
  }
  if (req.body.data.id !== orderId) {
    next ({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  } else {
    next();
  }
}

function validStatus(req, res, next) {
  const { status } = req.body.data;

  if (
    status == "pending" ||
    status == "preparing" ||
    status == "out-for-delivery" ||
    status == "delivered"
  ) {
    if (status === "delivered") {
      next({
        status: 400,
        message: "A delivered order cannot be changed.",
      });
    } else {
      next();
    }
  } else {
    next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
    });
  }
}

// makes sure create perameters are met
function validCreate(req, res, next) {
  const { deliverTo, mobileNumber, dishes } = req.body.data;
  if (!deliverTo) {
    next({
      status: 400,
      message: "deliverTo",
    });
  } else if (!mobileNumber) {
    next({
      status: 400,
      message: "mobileNumber",
    });
  }
  if (!dishes) {
    next({
      status: 400,
      message: "dishes",
    });
  } 
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
   next({
     status: 400,
     message: "Dishes must include at least one dish."
   });
 } else {
    // Loop through each dish and validate quantity
    dishes.forEach((dish, index) => {
      if (
        !dish.quantity ||
        !Number.isInteger(dish.quantity) ||
        dish.quantity <= 0
      ) {
        return next({
          status: 400,
          message: "Invalid quantity for dish at index " + index,
        });
      }
    });
  }

  // If all checks pass, store the order data in res.locals.order
  res.locals.order = req.body.data;
  next();
}

function create(req, res) {
  const newOrder = { ...req.body.data, id: nextId() };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read (req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder) {
    res.json({ data: foundOrder });
  }
}

function update(req, res) {
  const orderId = req.params.orderId;
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;
  const updatedOrder = {
    id: orderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };

  return res.json({ data: updatedOrder });
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;
  
  const index = orders.findIndex((order) => order.id === orderId);

  if (index !== -1) {
    const orderToDelete = orders[index];

    if (orderToDelete.status === "pending") {
      orders.splice(index, 1);
      res.sendStatus(204);
    } else {
      next({
        status: 400,
        message: "An order cannot be deleted unless it is pending.",
      });
    }
  } else {
    next({
      status: 400,
      message: "pending",
    });
  }
}


module.exports = {
  list,
  create: [validCreate, create],
  read: [orderExists, read],
  update: [orderExists, validCreate, validId, validStatus, update],
  destroy: [orderExists, destroy],
}