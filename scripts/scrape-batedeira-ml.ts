async function main() {
  console.log('Querying Mercado Livre public API...');
  
  // Try product endpoint
  try {
    const resProduct = await fetch('https://api.mercadolibre.com/products/MLB25799077');
    if (resProduct.ok) {
      const prod = await resProduct.json();
      console.log('Product Name:', prod.name);
      console.log('Product Pictures:', prod.pictures?.map((p: any) => p.url));
      return;
    }
  } catch (e) {
    console.error('Product API err:', e);
  }

  // Try item endpoint
  try {
    const resItem = await fetch('https://api.mercadolibre.com/items/MLB4237674627');
    if (resItem.ok) {
      const item = await resItem.json();
      console.log('Item Title:', item.title);
      console.log('Item Pictures:', item.pictures?.map((p: any) => p.url));
      return;
    }
  } catch (e) {
    console.error('Item API err:', e);
  }
}

main();
