import express from "express"
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";

const router = express.Router()

router.get('/products',async (req,res)=>{
    let page = parseInt(req.query.page);
    if(!page) page=1;
    //Lean es crucial para mostrar en Handlebars, ya que evita la "hidratación" del documento de mongoose,
    //esto hace que a Handlebars llegue el documento como plain object y no como Document.
    let result = await productModel.paginate({},{page,limit:5,lean:true})
    result.prevLink = result.hasPrevPage?`http://localhost:8080/products?page=${result.prevPage}`:'';
    result.nextLink = result.hasNextPage?`http://localhost:8080/products?page=${result.nextPage}`:'';
    result.isValid= !(page<=0||page>result.totalPages)
    res.render('home',result)
})

router.get('/products/:pid',async (req, res)=>{
    let pid = req.params.pid
    let product = await productModel.findById(pid)
    res.render('productDetail', product)
})

router.get('/cart/:cid',async (req, res)=>{
    let cid = req.params.cid
    let cart = await cartModel.findById({_id: cid}).populate("products.product").lean()
    let cartProducts 
    let flag = false
    if(cart){
        cartProducts = cart.products
        flag = true
    }
    //console.log(cartProducts)
    res.render('cart',{ flag, cartProducts })
})

export default router