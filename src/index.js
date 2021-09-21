const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const logger=require('./middleware/logger')
const Task = require('./models/task')
const User=require('./models/user')
const app = express()
const port = process.env.PORT || 3000


// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

app.use(express.json())
app.use(logger)
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const main =async () => {
    // const task= await Task.findById("611d41cf83c50f728c8c071e");
    // await task.populate('owner').execPopulate();
    // console.log(task);
    
    //allows us to find all the tasks of an user using the virtual property
    const user=await User.findById("611d416f83c50f728c8c0714");
    await user.populate('tasks').execPopulate();
    console.log(user.tasks)

}
main()