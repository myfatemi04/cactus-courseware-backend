import express from "express";
import course from './course'

const router = express.Router();

router.get("/", (req, res) => {
  return res.send("Cacti Courseware API");
});

router.use('/course', course)

export default router;
