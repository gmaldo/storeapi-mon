import express from "express"
import productRouter from "./routes/products.router.js"
import viewRouter from "./routes/views.router.js"
import cartsRouter from "./routes/carts.router.js"
import handlebars from "express-handlebars"
import mongoose from "mongoose"
import __dirname from "./utils.js"
import dotenv from "dotenv"
import fs from "fs"
import productModel from "./models/product.model.js"

dotenv.config();

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))

app.use("/api", productRouter)
app.use("/api", cartsRouter)
app.use('/',viewRouter)

const enviroment = async () => {
    try{
        //await mongoose.connect("mongodb+srv://"+process.env.USERNAME+":"+process.env.PASSWORD+"@cluster0.flm1f.mongodb.net/TrabajoFinal?retryWrites=true&w=majority&appName=Cluster0")
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Conectado a la base de datos")
    }catch(error){
        console.log("Error al conectar a la base de datos")
        console.log(error.message)
    }
}


enviroment()



const port = parseInt(process.env.PORT) || 8080;


const httpServer = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
