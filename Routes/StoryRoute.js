import express from 'express'
import { createStory } from '../Controllers/StoriesController.js';

const router=express.Router();

router.post("/",createStory);


// https://www.instagram.com/stories/official_guri_pb19/3064782662249453964/

export default router