import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken'

const userSchema = new Schema(
    {
       username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true // index is used for Better Searching without indexing we can also search but it give more functionality in searching
       },
       email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
       },
       fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
       },
       avatar:{
        type:String,   // From cloudinary
        required:true
       },
       coverImage:{
        type:string   // From cloudinary
       },
       watchHistory:[
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
        }
       ],
       password:{
        type:String,
        required:[true,"Enter Password"],
       },
       refreshToken:{
        type:String
       }
    },{
        timestamps:true
    }
)
 // Pre is the middleware it is executed when we perform a specific task into database AND save is the parameter that is defined that when the data is going to be saved just before that just execute the pre Middle ware 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password,10);
    
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
             expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
             expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User',userSchema)