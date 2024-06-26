import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {

    videoFile:{
        type:String, //from cloudinary
        required:true,
    },
    thumbnail:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,  // from cloudinary Url
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true,
    }
   },
   {
    timestamps:true,
   }
)

videoSchema.plugin(mongooseAggregatePaginate) // To  write aggrigation pipeline

export const Video = mongoose.model("Video",videoSchema)