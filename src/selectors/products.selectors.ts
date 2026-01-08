export const productsSelectors = {
  brandsCategoryPanel: '.brands_products',
  poloBrandLink: '.brands_products a:has-text("Polo")',
  mastAndHarbourBrandLink: '.brands_products a:has-text("Mast & Harbour")',
  
  // Returns the locator for the product wrapper based on product name
  productWrapper: (name: string) => `.product-image-wrapper:has(.productinfo p:has-text("${name}"))`,
  
  // Specific element for the name text itself
  productItemByName: (name: string) => `.productinfo p:has-text("${name}")`,
  
  addToCartButton: 'a.add-to-cart',
  continueShoppingButton: '.modal-content button.btn-success',
  viewProductLink: 'a:has-text("View Product")',
  
  brandPageHeader: '.features_items h2.title.text-center',
};
