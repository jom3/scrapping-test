const { chromium } = require('playwright')

async function obtenerDetallesProducto(url) {
  const navegador = await chromium.launch({
    headless: false
  })

  const pagina = await navegador.newPage()

  try {
    await pagina.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    await pagina.waitForTimeout(7000)

    const contenido = await pagina.locator('body').innerText()

    const bloqueado =
      contenido.includes('Please drag the slider') ||
      contenido.includes('Please slide') ||
      contenido.includes('traffic') ||
      contenido.includes('Traffic') ||
      contenido.includes('irregular') ||
      contenido.includes('unusual traffic')

    if (bloqueado) {
      return {
        status: 'blocked',
        reason: 'anti_bot',
        producto: null
      }
    }

    let nombre = null

    const titulos = [
      'h1',
      '[class*="title"]',
      '[class*="Title"]'
    ]

    for (const selector of titulos) {
      const elemento = pagina.locator(selector).first()

      if (await elemento.count() > 0) {
        const texto = await elemento
          .innerText()
          .catch(() => '')

        if (texto && texto.trim()) {
          nombre = texto.trim()
          break
        }
      }
    }

    let imagen = null

    const imagenes = await pagina
      .locator('img')
      .evaluateAll((imagenes) => {
        return imagenes
          .map((img) => ({
            src:
              img.getAttribute('src') ||
              img.getAttribute('data-src') ||
              img.getAttribute('data-lazy-src'),

            alt: img.getAttribute('alt') || ''
          }))
          .filter((img) => img.src)
      })

    if (imagenes.length > 0) {
      imagen = imagenes[0].src
    }

    let precio = null

    const precioMatch = contenido.match(
      /(?:US\s*\$|USD|\$)\s*[\d,.]+(?:\s*-\s*(?:US\s*\$|USD|\$)?\s*[\d,.]+)?/i
    )

    if (precioMatch) {
      precio = precioMatch[0]
    }

    let moq = null

    const moqMatch = contenido.match(
      /Min\.\s*order\s*:?\s*([^\n]+)/i
    )

    if (moqMatch) {
      moq = moqMatch[1].trim()
    }

    let rating = null

    const ratingMatch = contenido.match(
      /([0-5]\.[0-9])\s*\/\s*5/i
    )

    if (ratingMatch) {
      rating = ratingMatch[1]
    }

    let reorderRate = null

    const reorderMatch = contenido.match(
      /reorder\s*rate\s*:?\s*([\d.]+%)/i
    )

    if (reorderMatch) {
      reorderRate = reorderMatch[1]
    }

    let supplier = null

    const posiblesSupplier = [
      '[class*="company-name"]',
      '[class*="companyName"]',
      '[class*="supplier-name"]',
      '[class*="supplierName"]',
      '[class*="seller-name"]',
      '[class*="sellerName"]'
    ]

    for (const selector of posiblesSupplier) {
      const elemento = pagina.locator(selector).first()

      if (await elemento.count() > 0) {
        const texto = await elemento
          .innerText()
          .catch(() => '')

        if (texto && texto.trim()) {
          supplier = texto.trim()
          break
        }
      }
    }

    let country = null

    const countryMatch = contenido.match(
      /(?:Country\/Region|Country|Location)\s*:?\s*([^\n]+)/i
    )

    if (countryMatch) {
      country = countryMatch[1].trim()
    }

    const resultado = {
      status: 'success',

      producto: {
        nombre,
        imagen,
        precio,
        moq,
        rating,
        reorderRate,
        supplier,
        country
      },

      url
    }

    await navegador.close()

    return resultado

  } catch (error) {

    await navegador.close()

    return {
      status: 'error',
      message: error.message,
      producto: null
    }
  }
}


async function obtenerListaProductosPorTipo(url) {
  const { chromium } = require('playwright')

  const navegador = await chromium.launch({
    headless: false
  })

  const pagina = await navegador.newPage()

  try {
    await pagina.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    await pagina.waitForTimeout(3000)

    const contenido = await pagina
      .locator('body')
      .innerText()

    const bloqueado =
      contenido.includes('Please drag the slider') ||
      contenido.includes('Please slide') ||
      contenido.includes('traffic') ||
      contenido.includes('Traffic') ||
      contenido.includes('irregular')

    if (bloqueado) {
      await navegador.close()

      return {
        status: 'blocked',
        reason: 'anti_bot',
        productos: []
      }
    }

    const enlaces = await pagina
      .locator('a')
      .evaluateAll((links) => {

        return links
          .map((link) => ({
            texto: link.innerText.trim(),
            href: link.href
          }))
          .filter((link) =>
            link.href.includes('/product-detail/')
          )
      })

    const productosMap = new Map()

    for (const producto of enlaces) {

      const urlProducto = new URL(producto.href)

      const id = urlProducto.pathname
        .replace('/product-detail/', '')
        .replace('.html', '')

      if (!id) {
        continue
      }

      if (!productosMap.has(id)) {
        productosMap.set(id, {
          titulo: producto.texto,
          url: producto.href
        })
      }
    }

    const productos = Array.from(
      productosMap.values()
    )

    await navegador.close()

    return {
      status: 'success',
      cantidad: productos.length,
      productos
    }

  } catch (error) {

    await navegador.close()

    return {
      status: 'error',
      message: error.message,
      productos: []
    }
  }
}


module.exports = {
  obtenerDetallesProducto,
  obtenerListaProductosPorTipo
}