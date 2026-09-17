const API_URL='http://localhost:3000'
const searchInput=document.getElementById('searchInput')
const searchButton=document.getElementById('searchButton')
const productsContainer=document.getElementById('products')
const resultCount=document.getElementById('resultCount')
const loading=document.getElementById('loading')
const error=document.getElementById('error')
const modal=document.getElementById('modal')
const modalOverlay=document.getElementById('modalOverlay')
const closeModalButton=document.getElementById('closeModal')
const modalTitle=document.getElementById('modalTitle')
const modalLoading=document.getElementById('modalLoading')
const modalDetails=document.getElementById('modalDetails')
let productosActuales=[]

searchButton.addEventListener('click',buscarProductos)
searchInput.addEventListener('keydown',event=>{if(event.key==='Enter'){buscarProductos()}})
closeModalButton.addEventListener('click',cerrarModal)
modalOverlay.addEventListener('click',cerrarModal)

async function buscarProductos(){
  const producto=searchInput.value.trim()
  if(!producto){mostrarError('Escribe un producto para buscar.');return}
  ocultarError()
  loading.classList.remove('hidden')
  searchButton.disabled=true
  productsContainer.innerHTML=''
  resultCount.textContent='Buscando...'
  try{
    const url=new URL(`${API_URL}/obtenerProductosPorTipo`)
    url.searchParams.set('SearchText',producto)
    const response=await fetch(url)
    const texto=await response.text()
    if(!texto){throw new Error('El backend devolvió una respuesta vacía.')}
    const data=JSON.parse(texto)
    if(data.status==='blocked'){throw new Error('Alibaba bloqueó la navegación por tráfico irregular.')}
    if(data.status==='error'){throw new Error(data.message||'Ocurrió un error al buscar productos.')}
    productosActuales=data.productos??[]
    mostrarProductos(productosActuales)
  }catch(error){
    mostrarError(error.message)
    resultCount.textContent='0 resultados'
  }finally{
    loading.classList.add('hidden')
    searchButton.disabled=false
  }
}

function mostrarProductos(productos){
  resultCount.textContent=`${productos.length} resultados`
  if(productos.length===0){
    productsContainer.innerHTML=`<div class="empty-state"><div class="empty-icon">⌕</div><h3>No encontramos productos</h3><p>Intenta realizar otra búsqueda.</p></div>`
    return
  }
  productsContainer.innerHTML=productos.map((producto,index)=>`<article class="product-card"><span class="product-number">PRODUCT ${String(index+1).padStart(2,'0')}</span><h3 class="product-title">${escaparHTML(producto.titulo||'Producto sin título')}</h3><p class="product-url">${escaparHTML(producto.url||'')}</p><button onclick="verDetalles(${index})">Ver detalles →</button></article>`).join('')
}

async function verDetalles(index){
  const producto=productosActuales[index]
  if(!producto)return
  abrirModal()
  modalTitle.textContent=producto.titulo||'Información del producto'
  modalDetails.innerHTML=''
  modalLoading.classList.remove('hidden')
  try{
    const urlAlibaba=new URL(producto.url)
    const productoId=urlAlibaba.pathname.replace('/product-detail/','').replace('.html','')
    const priceId=urlAlibaba.searchParams.get('priceId')
    const apiUrl=new URL(`${API_URL}/obtenerDetallesPorProducto/${encodeURIComponent(productoId)}`)
    if(priceId)apiUrl.searchParams.set('priceId',priceId)
    const response=await fetch(apiUrl)
    const texto=await response.text()
    if(!texto)throw new Error('El backend devolvió una respuesta vacía.')
    let detalles
    try{detalles=JSON.parse(texto)}catch(error){throw new Error('El backend respondió algo que no es JSON válido.')}
    if(detalles.status==='blocked'){mostrarDetallesError(detalles.message||'Alibaba bloqueó la navegación.');return}
    if(detalles.status==='error'){mostrarDetallesError(detalles.message||'Ocurrió un error.');return}
    if(!detalles.producto){mostrarDetallesError('No se encontraron los detalles del producto.');return}
    mostrarDetalles(detalles.producto)
  }catch(error){
    mostrarDetallesError(error.message)
  }finally{
    modalLoading.classList.add('hidden')
  }
}

function mostrarDetalles(producto){
  const campos=[
    ['Nombre',producto.nombre],
    ['Precio',producto.precio],
    ['Pedido mínimo',producto.moq],
    ['Rating',producto.rating],
    ['Reorder rate',producto.reorderRate],
    ['Proveedor',producto.supplier],
    ['País',producto.country]
  ]
  modalDetails.innerHTML=`${producto.imagen?`<div class="detail-image"><img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre||'Producto')}"></div>`:''}${campos.map(([label,value])=>`<div class="detail"><div class="detail-label">${label}</div><div class="detail-value">${escaparHTML(value??'No disponible')}</div></div>`).join('')}`
}

function mostrarDetallesError(mensaje){
  modalDetails.innerHTML=`<div class="error">${escaparHTML(mensaje)}</div>`
}

function abrirModal(){
  modal.classList.remove('hidden')
  document.body.style.overflow='hidden'
}

function cerrarModal(){
  modal.classList.add('hidden')
  document.body.style.overflow=''
}

function mostrarError(mensaje){
  error.textContent=mensaje
  error.classList.remove('hidden')
}

function ocultarError(){
  error.classList.add('hidden')
}

function escaparHTML(value){
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")
}

window.verDetalles=verDetalles