# storeapi-mon
Implementacion de endpoints para un store en node utilizando express y persistencia en mongo.
# Librerias usadas
- dotenv
- express
- express-handlebars
- mongoose
- mongoose-paginate-v2

# Uso
Para instalar las librerias ```npm install```.

Para levantar el servidor correr el comando ```npm start``` o el comando ```node src/app.js```
# Datos
Se provee un ```products.json``` con productos de muestra, se puede cargar en mongo atlas copiando y pegando o bien ejectuar ```node src/utils2.js``` para cargar los datos de muestra a mongo.

# ENV File
Ejemplo
```
PORT = 8080
MONGOURL = mongodb+srv://myDatabaseUser:Password@cluster0.example.mongodb.net/Trabajo?retryWrites=true&w=majority

```
donde MONGOURL es el string de conexion a mongo sacado de Mongo Atlasm
# Mongo Atlas config
Al conectarse a mongo atlas desde una IP nueva, debe autorizarce dicha IP. Si no esta autorizada en Mongo Atlas tirara un error:
```
Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/
```
Si se desea probar recomiendo crear una db propia en tu propia cuenta de mongo atlas y cargar los datos utilizando lo mencionado en la seccion DATOS.

# Vistas
## Lista de productos
Muestra los productos paginados de a 5. Ruta: localhost:8080/products
![Lista de Productos](https://i.ibb.co/Srgv9mb/Captura-de-pantalla-2024-10-01-a-la-s-11-49-12-a-m.png
)
## Detalle de producto
Detalle de producto, muestra el detalle del producto mas un boton agregar al carro, que al tocarlo pregunta a que carrito agregar (ya que no hay contexto de carrito). Utiliza uno de los endpoints para agregar producto al carrito Ruta: localhost:8080/products/:id
![Detalle de producto](https://i.ibb.co/X8fYrk9/Captura-de-pantalla-2024-10-01-a-la-s-11-49-21-a-m.png
)
## Ruta carrito
Muestra un resumen del carrito con las unidades que posee cada producto

![Vista del carrito](https://i.ibb.co/SfQZtTB/Captura-de-pantalla-2024-10-01-a-la-s-11-49-38-a-m.png)

# Endpoints
## Products
Internamente los productos estan guardados en un esquema utilizando mongoose con los campos mencionados mas abajo.
### GET /api/products
 Devuelve la lista de productos paginados.
```
{
	status:success/error
    payload: Resultado de los productos solicitados
    totalPages: Total de páginas
    prevPage: Página anterior
    nextPage: Página siguiente
    page: Página actual
    hasPrevPage: Indicador para saber si la página previa existe
    hasNextPage: Indicador para saber si la página siguiente existe.
    prevLink: Link directo a la página previa (null si hasPrevPage=false)
    nextLink: Link directo a la página siguiente (null si hasNextPage=false)
}
```
 Parametros
 - ```limit``` (opcional) que limita la cantidad de productos devueltos por defecto 10. 
 - ```page``` (opcional) la pagina a obtener por defecto 1
 - ```sort``` asc o desc (opcional) ordena por precio
 - ```query``` en body recibe un json que es el filtro puede ser por ejemplo:
``` {"category": "Electronics"}``` o ```{"status": true}```

ejemplo:
```localhost:8080/api/products?limit=2&page=2&sort=desc```

### GET /api/products/:id
Devuelve un producto correspondiente al ID
### POST /api/products
Crea un producto nuevo con el json recibido en body. Los campos son
```
- title: String,
- description: String
- code: String
- price: Number
- status: Boolean
- stock: Number
- category: String
- thumbnails: Array de Strings que contenga las rutas donde están almacenadas las imágenes referentes a dicho producto
```
Status es true por defecto.
Todos los campos son obligatorios, a excepción de thumbnails

Ejemplo: 
```
{
    "title": "Ultra HD Projector",
    "description": "A high-resolution projector with 4K support for home theaters.",
    "code": "PJ11001",
    "price": 899.99,
    "stock": 30,
    "category": "Electronics",
    "thumbnails": ["projector_front.jpg", "projector_side.jpg"]
}
```
### PUT /api/products
toma un producto y actualiza los campos enviados desde body. 
Por ejemplo:
PUT localhost:8080/api/products/66f032049df529df4cbb5b27
```
{
    "description" : "Nueva description",
    "price" : 3
}
```
### DELETE /api/products/:id
Elimina el producto con el id. Ejemplo:
DELETE localhost:8080/api/products/66f032049df529df4cbb5b27

## CARTS

### POST /api/carts
Crea un carrito vacio devuelve:
```
{
    "_id": "66fbe41ebe6ed113b2bcfb69",
    "products": [],
    "__v": 0
}
```

### GET /api/carts/:cid
Devuelve el arreglo de productos con todos los productos completos mediante un populate.
Ejemplo 
```GET localhost:8080/api/carts/66f03fed59dce198c833259b```

### POST /api/carts/:cid/product/:pid
Agrega una unidad del un producto en el carro. Ejemplo:  ```POST localhost:8080/api/carts/66f03fed59dce198c833259b/product/66f02daf959b04b589c344e6```


### PUT /api/carts/:cid/products/:pid
Actualiza SÓLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde req.body

```
PUT localhost:8080/api/carts/66f03fed59dce198c833259b/product/66f02daf959b04b589c344e6
{ quantity : 3}
```

### PUT api/carts/:cid 
Actualiza el carrito con un arreglo de productos con el formato **especificado arriba** (no existe es mas arriba(?)).
Supongo que llegara algo asi: 
```
PUT localhost:8080/api/carts/66f03fed59dce198c833259b

[
     {
           "product": "66f02daf959b0d4589c344e6",
           "quantity": 2
     },
     {   
           "product": "66f02daf959b04b589c344e6",
           "quantity":6
     }
] 

```
### DELETE api/carts/:cid/products/:pid 
Elimina del carrito el producto seleccionado.

### DELETE api/carts/:cid 
Eliminar todos los productos del carrito no elimina el carrito
