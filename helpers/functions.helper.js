const { obtenerListaProductosPorTipo, obtenerDetallesProducto } = require("../scrapping/scrapping");

const baseUrl = process.env.URL ?? 'https://www.alibaba.com'

async function obtenerProductos(producto) {
  const url = new URL(`${baseUrl}/trade/search`);
  url.searchParams.set('SearchText', producto);
  return await obtenerListaProductosPorTipo(url.toString());
}

async function obtenerDetalles(producto, priceId) {
  const url = new URL(`${baseUrl}/product-detail/${producto}.html`);
  if(priceId){
    url.searchParams.set('priceId', priceId)
  }
  const detalles = await obtenerDetallesProducto(url.toString())
  return detalles
}

module.exports = {
  obtenerProductos,
  obtenerDetalles
}