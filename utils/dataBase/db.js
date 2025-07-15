
import mongoose from 'mongoose'
import "dotenv/config"

const str = process.env.DBCONNECTSTR

async function db () {
    if(str){
        const con = await mongoose.connect(str)
        if(con){
            console.log("DB is Connected!!!")
        }
    } else{
        console.log('DB is not Connected!!!')
    }
}

export default db;