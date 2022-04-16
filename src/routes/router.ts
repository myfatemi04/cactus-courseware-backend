import express from 'express'
import Course from '../models/Course';
import { v4 as uuid } from 'uuid';

const router = express.Router()

router.get('/', (req, res) => {
  return res.send('CourseWare API')
})

router.post('/course', async (req, res) => {
  const gh = req.body.githubUrl;

  const user = new Course({
    id: uuid(),
    title: gh,
    tags: ['math', 'highschool'],
    thumbnail: '',
    authors: ['Jane Doe', 'Joe Bo'],
    markdown: '## Test',
    rootModuleId: 'random id'
  });
  
  try {
    await user.save();
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
