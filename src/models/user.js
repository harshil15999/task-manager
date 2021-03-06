const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task=require('../models/task').default
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps:true
})



userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}
//generating the token and appeding it to user.tokens array
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//when the function has to be applied on the model 
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    console.log(user)
    if (!user) {
        throw new Error('Unable to find user')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Password is invalid')
    }

    return user
}

// Hash the plain text password before saving thus it changes the user password in the req - res lifecycle
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})
//deletes an user  
//delete is an action on the mongoose Model itself
userSchema.pre('remove',async function(next){
    //deletes all the tasks associated with the owner
    const user=this
    await Task.deleteMany({'owner':req.user._id})
    next()
})

userSchema.post('save',function() {
    console.log('user has been saved');
})
//creates a virtual field referencing the Tasks in the database
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

const User = mongoose.model('User', userSchema)

module.exports = User