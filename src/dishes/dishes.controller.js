const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;

  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish ${dishId} not found.`
    });
  }
}

function read(req, res, next) {
  const foundDish = res.locals.dish;
  if (foundDish) {
    res.json({ data: foundDish });
  } else {
    next({
      status: 404,
      message: "Dish not found.",
    });
  }
}

function validName(req, res, next) {
  const { name } = req.body.data;
  if (!name) {
    next({
      status: 400,
      message: "Dish must include a name."
    });
  } else {
    next();
  }
}

function validDescription(req, res, next) {
  const { description } = req.body.data;
  if (!description) {
    next({
      status: 400,
      message: "Dish must include a description."
    });
  } else {
    next();
  }
}

function validPrice(req, res, next) {
  const { price } = req.body.data;
  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price."
    });
  } else if (typeof price === "number" && price > 0) {
    next();
  } else {
    next({
      status: 400,
      message: "The price must be a number greater than 0."
    });
  }
}

function validUrl(req, res, next) {
  const { image_url } = req.body.data;
  if (!image_url) {
    next({
      status: 400,
      message: "image_url"
    });
  } else{
    next();
  }
}

function validId(req, res, next) {
  const { id } = req.body.data;
  const dishId = req.params.dishId;
  if (!id) {
    next();
  } else if (req.body.data.id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`,
    });
  } else {
    next();
  }
}

function update(req, res) {
  const dishId = req.params.dishId;
  const { name, description, price, image_url } = req.body.data;
  const updatedDish = {
    id: dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  return res.json({ data: updatedDish });
}

module.exports = {
  list,
  create: [
    validUrl,
    validName,
    validDescription,
    validPrice,
    create
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    validName,
    validDescription,
    validPrice,
    validUrl,
    validId,
    update
  ],
}