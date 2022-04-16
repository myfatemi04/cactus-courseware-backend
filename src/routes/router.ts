import express from 'express'
import Course from '../models/Course';
import mongoose from 'mongoose';

const router = express.Router()
router.use(express.json());

router.get('/', (req, res) => {
  return res.send('CourseWare API')
})

router.post('/course', async (req, res) => {
  console.log(req.body)
  const user = new Course({
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }],
    thumbnail: {
      type: String
    },
    authors: [{
      type: String
    }],
    markdown: {
      type: String,
      required: true
    }
  });
  
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    return res.status(500).json({
      "message": error
    });
  }

  return res.status(200).json({
    "user": user
  })
})

export default router;
