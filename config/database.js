import mongoose from "mongoose";

export const connectToDb = () => {
    mongoose.connect(process.env.DB_URI,{
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    }).then((conn)=>{
        console.log(`mongoDb connected to db ${conn.connection.host}`);
    }).catch((err)=>{
        console.log(`Error connecting database..${err}`);
    })
}

