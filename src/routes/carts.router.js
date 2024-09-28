import express from "express"
import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"
import mongoose from "mongoose"


const router = express.Router()

router.post('/carts', (req, res) => {
    cartModel.create({})
    .then(newCart => res.status(201).json(newCart))
    .catch(error => {
        res.status(501).json({error:"error al crear el carrito"})
    })
})

router.get('/carts/:cid', (req, res) => {
    let id =req.params.cid
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({error:"id de carrito invalido"})
        return
    }
    cartModel.findById({_id: id}).populate("products.product")
    .then(cart => {
        if (cart) {
            res.status(200).json(cart.products)
        } else {
            res.status(400).json({ error: "Carrito no encontrado" })
        }
    })
})

router.post('/carts/:cid/product/:pid', (req, res) => {
    let cartId = req.params.cid
    let productId = req.params.pid
    if(!mongoose.Types.ObjectId.isValid(cartId)){
        res.status(400).json({error:"id de carrito invalido"})
        return
    }
    if(!mongoose.Types.ObjectId.isValid(productId)){
        res.status(400).json({error:"id de producto invalido"})
        return
    }
    productModel.findById({_id: productId})
    .then(product => {
        if (product) {
           // console.log(product)
            cartModel.findById({_id: cartId})
            .then(cart => {
                if (cart) {
                    let cartProduct = cart.products.find(prod => prod.product.equals(productId))
                    if (cartProduct) {
                        cartProduct.quantity++
                    } else {
                        cart.products.push({ product: productId, quantity: 1 })
                    }
                    cart.save()
                    .then(updatedCart => {
                        res.status(200).json(updatedCart.products)
                    })
                    .catch(error => {
                        res.status(501).json({error:"error al actualizar el carrito en el Servidor"})
                    })
                    //console.log(cart)
                } else {
                    res.status(400).json({ error: "Carrito no encontrado" })
                }
            })
        } else {
            res.status(400).json({ error: "Producto no encontrado" })
        }
    })
    .catch(error => {
        res.status(501).json({error:error})
    })
   
})
//PUT api/carts/:cid/products/:pid deberá poder actualizar SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body
//ya
// { quantity : 3}
router.put('/carts/:cid/product/:pid',async (req, res)=>{
    const cid = req.params.cid
    const pid = req.params.pid
    let quantity = req.body.quantity
    //validaciones 

    if(!mongoose.Types.ObjectId.isValid(cid)){
        res.status(400).json({error:"id de carrito invalido"})
        return
    }
    if(!mongoose.Types.ObjectId.isValid(pid)){
        res.status(400).json({error:"id de producto invalido"})
        return
    }
    if(!quantity || quantity <= 0){
        res.status(400).json({error:"cantidad invalida"})
        return
    }
    //busco el carro
    let cart = await cartModel.findById({_id: cid})
    if(!cart){
        res.send({status: "error", message: "Carrito no encontrado"})
    }
    let product = cart.products.find(product => product.product._id == pid)
    //si esta el producto le actualizo la cantidad
    if(product){
        product.quantity=quantity
        cart.save()
        .then(cart => res.send(cart))
        .catch(error => res.send(error))
        return
    }
    //si no esta lo busco y lo agrego
    productModel.findById({_id: pid}).
    then(product => {
        if (product) {
            cart.products.push({ product: pid, quantity: quantity })
            cart.save()
            .then(cart => res.send(cart))
            .catch(error => res.send(error))
        } else {
            res.status(400).json({ error: "Producto no encontrado" })
        }
    })
    
})

function validateArray(arr) {
    // Verifica que sea un array
    if (!Array.isArray(arr)) {
      return false;
    }
  
    // Verifica que cada objeto en el array tenga la estructura correcta
    for (const item of arr) {
        //console.log("q"+item)
        if (
            !mongoose.Types.ObjectId.isValid(item.product) ||         // Verifica que 'product' sea un object id de moongose
            typeof item.quantity !== 'number' ||        // Verifica que 'quantity' sea un número
            item.quantity <= 0                          // Asegura que 'quantity' sea un número positivo
        ) {
            console.log(mongoose.Types.ObjectId.isValid(item.product))
            console.log(typeof item.quantity !== 'number')
            console.log(item.quantity <= 0)
            console.log(typeof item.quantity)
            return false;
        }
    }
  
    return true;
  }

function checkUniqueProducts(arr) {
    const productsSet = new Set();
  
    for (const item of arr) {
        if (productsSet.has(item.product)) {
            // Si el producto ya existe en el set, significa que no es único
            return false;
        }
        productsSet.add(item.product);
    }
  
    return true;
}

//PUT api/carts/:cid deberá actualizar el carrito con un arreglo de productos con el formato especificado arriba.
//supongo que llegara algo asi: 
// [
//     {
//           "product": "66f02daf959b0d4589c344e6",
//           "quantity": 2
//     },
//     {   
//           "product": "66f02daf959b04b589c344e6",
//           "quantity":6
//     }
// ] 
//}



router.put('/carts/:cid',async (req, res)=>{
    const cid = req.params.cid
    if(!mongoose.Types.ObjectId.isValid(cid)){
        res.status(400).json({error:"id de carrito invalido"})
        return
    }
    // Verifica si req.body está vacío
    //console.log('req body\n' + req.body)
    //Validaciones
    //Que no venga vacio
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío' });
    }
    //Que el carrito exista
    let cart = await cartModel.findById({_id: cid})
    if(!cart){
        res.send({status: "error", message: "Carrito no encontrado"})
        return
    }

    const products = req.body
    //Que el array este bien formado
    if(!validateArray(products)){
        res.status(400).json({error:"array invalido"})
        return
    }
    //Que los productos no sean repetidos
    if(!checkUniqueProducts(products)){
        res.status(400).json({error:"productos repetidos"})
        return
    }
    //Que los productos existan en la base de datos
    for (const item of products) {
        let product = await productModel.findById({_id: item.product})
        if(!product){
            res.status(400).json({error: item.product+" producto no encontrado"})
            return
        }
    }
 
    for (const item of products) {
        const productId = item.product
        const quantity = item.quantity
        //console.log(productId + " " + quantity)
        let cartProduct = cart.products.find(prod => prod.product.equals(productId))
        if (cartProduct) {
            cartProduct.quantity = quantity
        } else {
            cart.products.push({ product: productId, quantity: quantity })
        }
    }
    cartModel.updateOne({_id: cid}, cart)
    .then(resp => res.send(resp))
    .catch(error => res.send(error))


})

//DELETE api/carts/:cid/products/:pid deberá eliminar del carrito el producto seleccionado.
//ya (?)
router.delete('/carts/:cid/product/:pid',async (req, res)=>{
    let cid = req.params.cid
    let pid = req.params.pid

    if(!mongoose.Types.ObjectId.isValid(cid)){
        res.status(400).json({error:"id de carrito invalido"})
        return
    }
    if(!mongoose.Types.ObjectId.isValid(pid)){
        res.status(400).json({error:"id de producto invalido"})
        return
    }
    
    let cart = await cartModel.findById({_id: cid})
    let index = cart.products.findIndex(product => product.product._id == pid)
    if(index === -1){
        res.send({status: "error", message: "Producto no encontrado en el carrito"})
        return
    }
    cart.products.splice(index, 1)
    cart.save()
    .then(cart => res.send(cart))
    .catch(error => res.send(error))
    //res.send({status: "success"})
})

//DELETE api/carts/:cid deberá eliminar todos los productos del carrito 
//ya
router.delete('/carts/:cid',async (req, res)=>{
    let cid = req.params.cid

    if(!mongoose.Types.ObjectId.isValid(cid)){
        res.status(400).json({status:"error",message:"id de carrito invalido"})
        return
    }

    let cart = await cartModel.findById({_id: cid})
    if(!cart){
        res.send({status: "error", message: "Carrito no encontrado"})
        return
    }
    //console.log(cart)
    cart.products = []
    cart.save()
    .then(cart => res.send(cart))
    .catch(error => res.send({message:"error al borrar los productos del carrito",error:error}))
   
})

export default router