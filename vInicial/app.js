const { chromium } = require('playwright');

const url = 'https://www.alibaba.com/product-detail/High-Quality-Smart-Watch-With-Custom_1601391348158.html?spm=a2700.galleryofferlist.normal_offer.d_image.e5ef13a01k5Dhr&priceId=6737ae7e840f4fb3b228130d13c56df4';

async function main() {
  const navegador = await chromium.launch({
    headless: false
  });

  const pagina = await navegador.newPage();

  const respuestas = [];

  pagina.on('response', async (response) => {
    try {
      const responseUrl = response.url();

      if (
        responseUrl.includes('mtop.alibaba') ||
        responseUrl.includes('alibaba.com')
      ) {
        respuestas.push({
          url: responseUrl
        });
      }
    } catch (error) {}
  });

  await pagina.goto(url, {
    waitUntil: 'domcontentloaded'
  });

  await pagina.waitForTimeout(7000);

  // --------------------------------
  // BUSCAR UNA PETICIÓN DE REVIEWS
  // --------------------------------

  const respuestaProveedor = respuestas.find(
    respuesta =>
      respuesta.url.includes('shopreview') &&
      respuesta.url.includes('companyId') &&
      respuesta.url.includes('sellerAliId')
  );

  if (!respuestaProveedor) {
    console.log('No se encontró información del proveedor');
    await navegador.close();
    return;
  }

  const urlProveedor = new URL(respuestaProveedor.url);

  const data = JSON.parse(
    urlProveedor.searchParams.get('data')
  );

  // --------------------------------
  // MOSTRAR INFORMACIÓN
  // --------------------------------

  console.log('\n===== INFORMACIÓN DEL PROVEEDOR =====\n');

  console.log('Company ID:', data.companyId);
  console.log('Seller Ali ID:', data.sellerAliId);
  console.log('Product ID:', data.productId);
  console.log('Category ID:', data.categoryId);
  console.log('Country:', data.countryCode);
  console.log('Currency:', data.currency);

  await navegador.close();
}

main();