import express from "express";

export const createHomeRouter = () => {
  const router = express.Router();

  router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
  });
  return router;
};

export default createHomeRouter;

export * from "#routes/category";
export * from "#routes/post";
export * from "#routes/auth";
export * from "#routes/user";
