const express = require('express')
const cors = require('cors')
const { obtenerProductos, obtenerDetalles } = require('./helpers/functions.helper')

const app = express()
const port = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/obtenerProductosPorTipo', async (req, res)=>{
  const producto = req.query.SearchText
  const lista = await obtenerProductos(producto)
  res.send(lista)
})

app.get('/obtenerDetallesPorProducto/:producto', async (req, res)=>{
  const producto = req.params.producto
  const priceId = req.query.priceId
  const detalles = await obtenerDetalles(producto, priceId)
  res.json(detalles)
})

app.listen(port, ()=>{
  console.log(`Servidor en el puerto: ${port}`)
})

