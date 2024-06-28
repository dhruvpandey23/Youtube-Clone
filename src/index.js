import dotenv from 'dotenv'
import connectDB from './db/db_connect.js'
import {app} from './app.js'

dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`App is running on PORT ${process.env.PORT}`)
    })
})
.catch((error)=>{
 console.log("Mongo db connection Failed!!",error) 
})