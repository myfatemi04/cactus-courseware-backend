import express from "express";
import cors from "cors";
import course from "./course";

const router = express.Router();

router.use(cors());

router.get("/", (req, res) => {
  return res.send("Cacti Courseware API");
});

router.use("/course", course);

export default router;
