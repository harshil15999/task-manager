
const logger=(req,res,next) =>{
    console.log('New request to: '+req.method+' '+req.path)
    next()
}

module.exports=logger