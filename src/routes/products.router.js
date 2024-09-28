import express from "express"
import productsModel from "../models/product.model.js"
import mongoose from "mongoose"

const router = express.Router()

router.get("/products", async (req, res) => {
    const { limit = 10, page = 1, sort } = req.query;
    
    const query = req.body
    
    let prevLink
    let sortFlag
    if(sort === 'asc'){
        prevLink = '&sort=asc'
        sortFlag = 1
    }else if(sort === 'desc'){
        sortFlag = -1
        prevLink = '&sort=desc'
    }else{
        prevLink = ''
        sortFlag = undefined
    }
    try {
        
        const options = {
            page: page,
            limit: limit,
            lean: true,
            sort: sortFlag ? {price: sortFlag} : undefined
        };
        
        let products = await productsModel.paginate(query,options)
        res.status(200).json({  
            status: "success",
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `localhost:8080/api/products?page=${products.prevPage}&limit=${limit}${prevLink}` : null,
            nextLink: products.hasNextPage ? `localhost:8080/api/products?page=${products.nextPage}&limit=${limit}${prevLink}` : null
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/products/:pid', (req, res) => {
    let id = req.params.pid
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({error:"id invalido"})
        return
    }
    productsModel.findById({_id: id})
    .then(product => {
        if (product) {
            res.json(product)
        } else {
            res.status(400).json({ error: "Producto no encontrado" })
        }
    })
    .catch(error => {
        res.status(501).json({error:"error"})
    })
})

router.post('/products/', (req, res) => {
    const { title, description, code, price, stock, category, status } = req.body;  
    let errors = [];

    if (!title) {
        errors.push("El campo 'title' es obligatorio.");
    }
    if (!description) {
        errors.push("El campo 'description' es obligatorio.");
    }
    if (!code) {
        errors.push("El campo 'code' es obligatorio.");
    }
    if (price === undefined) {
        errors.push("El campo 'price' es obligatorio.");
    } else if (typeof price !== 'number') {
        errors.push("El campo 'price' debe ser un número.");
    }
    if (stock === undefined) {
        errors.push("El campo 'stock' es obligatorio.");
    } else if (typeof stock !== 'number') {
        errors.push("El campo 'stock' debe ser un número.");
    }
    if (!category) {
        errors.push("El campo 'category' es obligatorio.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const productStatus = status !== undefined ? status : true;

    const newProduct = {
        title,
        description,
        code,
        price,
        stock,
        category,
        status: productStatus,
        thumbnails: req.body.thumbnails || []
    }
    
    productsModel.create(newProduct)
    .then(product => {
        res.status(201).json(product)
    })
    .catch(error => {
        res.status(501).json({error:"error en el servidor al guardar nuevo producto"})
    })
})

router.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
        res.status(400).json({error:"id invalido"})
        return
    }
    productsModel.findById(productId)
    .then(product => {
        if (product) {
            product.title = req.body.title || product.title;
            product.description = req.body.description || product.description;
            product.code = req.body.code || product.code;
            product.price = req.body.price || product.price;
            product.stock = req.body.stock || product.stock;
            product.category = req.body.category || product.category;
            product.status = req.body.status !== undefined ? req.body.status : product.status;
            product.thumbnails = req.body.thumbnails || product.thumbnails;

            product.save()
            .then(updatedProduct => {
                res.json(updatedProduct);
            })
            .catch(error => {
                res.status(500).json({ error: "Error al actualizar el producto" });
            });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    })
    .catch(error => {
        res.status(501).json({error:"error al obtener el producto de mongo"})
    })

})

router.delete('/products/:pid', (req, res) => {
    let id = req.params.pid
    if(!mongoose.Types.ObjectId.isValid(id)){
        res.status(400).json({error:"id invalido"})
        return
    }
    productsModel.findByIdAndDelete(id)
    .then(deleted => {
        if (deleted) {
            res.json({ message: "Producto eliminado" })
        } else {
            res.status(400).json({ error: "Producto no encontrado" })
        }
    })
    .catch(error => {
        res.status(501).json({error:"error al eliminar el producto de mongo"})
    })
})
export default router