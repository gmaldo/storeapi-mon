import fs from "fs"
import mongoose from "mongoose"
import productModel from "./models/product.model.js"
import dotenv from "dotenv"


dotenv.config();

const enviroment = async () => {
    //await mongoose.connect("mongodb+srv://"+process.env.USERNAME+":"+process.env.PASSWORD+"@cluster0.flm1f.mongodb.net/TrabajoFinal?retryWrites=true&w=majority&appName=Cluster0")
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Conectado a la base de datos")    
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo JSON:', err);
          return;
        }
      
        const jsonData = JSON.parse(data);
        for (let producto of jsonData) {
          console.log(`Nombre: ${producto.title}, Precio: ${producto.price}`);
          productModel.create(producto)
          .then(product => {
            console.log(product)
          })
          .catch(err => {
            console.log(err)
          })    
        }

        //console.log(jsonData);
      })

}


enviroment()