const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth=require('../middleware/auth')

//creating a task
router.post('/tasks',auth,async (req, res) => {
    // const task = new Task(req.body)
    const task=new Task({
        ...req.body,
        'owner':req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//get all the task in the list
router.get('/tasks',auth, async (req, res) => {
    try {
        const match={}
        const sort={}
        const id=req.user._id
        const tasks = await Task.find({'owner':id})

        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        //sorting the user data 
        if(req.query.sortBy) {
            const parts=req.query.split(":")
            sort[parts[0]]=sort[parts[1]]==="desc"?-1:1;
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
            }
            }).execPopulate()

        res.status(200).send(req.user.tasks);

    } catch (e) {
        
        res.status(500).send(e)
    }
})

router.get('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id,'owner':req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
   

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const _id=req.params.id;
        const task = await Task.findOne({_id,'owner':req.user._id});

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth,async (req, res) => {
    try {
        const _id=req.params.id
        const task = await Task.findByIdAndDelete({_id,'owner':req.user._id})

        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router