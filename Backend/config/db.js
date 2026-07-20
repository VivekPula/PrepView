import mongoose from "mongoose";
const connectDB = async (url)=>{
    try{
        await mongoose.connect(url);
        console.log("Db Connected");
    }
    catch(err){
        console.log("Error");
        console.error(err);
        process.exit(1);
    }
};

export default connectDB;