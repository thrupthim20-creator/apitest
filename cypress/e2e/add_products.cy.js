describe("DemoBlaze E2E UI Tests", () => {
    const baseUrl = "https://www.demoblaze.com/index.html";

it("Add 3 products to cart and validate total", () => {
    cy.visit(baseUrl); 
    let productPrices = [];

    function addProduct(name) {
    cy.contains("a.hrefch", name).click(); 
    cy.get(".btn.btn-success.btn-lg").click();       
    cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
    cy.get(".nav-link").contains('Home').click();       
}

    // Add 3 products
    addProduct("Samsung galaxy s6");
    addProduct("Nokia lumia 1520");
    addProduct("Sony vaio i5");

    cy.get(".nav-link").contains('Cart').click();

    cy.get("#tbodyid tr").should("have.length", 3);

// Now get all price cells and sum them
    cy.get("#tbodyid tr td:nth-child(3)").then(($priceCells) => {
    let sum = 0;
    $priceCells.each((index, el) => {
    const price = parseInt(el.innerText.trim());
    if (!isNaN(price)) sum += price;
  });

  // Compare with total displayed
    cy.get("#totalp").then(($total) => {
    const total = parseInt($total.text().trim());
    expect(total).to.eq(sum);
  });
});

// Delete first product
    cy.get("#tbodyid tr").first().contains("Delete").click();

// Wait until cart updates: 2 products should remain
    cy.get("#tbodyid tr").should("have.length", 2).then(($rows) => {

  // Now sum the remaining product prices
    let sum = 0;
    $rows.each((index, row) => {
    const price = parseInt(Cypress.$(row).find("td:nth-child(3)").text().trim());
    if (!isNaN(price)) sum += price;
  });

  // Compare with total displayed
  cy.get("#totalp").then(($total) => {
    const total = parseInt($total.text().trim());
    expect(total).to.eq(sum);
  });

});
}); 

it("Add 2 same products to cart and validate total", () => {
  cy.visit(baseUrl);  
  const productName = "Samsung galaxy s6";
  function addProduct(name) {
  cy.contains("a.hrefch", name).click(); 
  cy.get(".btn.btn-success.btn-lg").click();       
  cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
  cy.get(".nav-link").contains('Home').click();      
}

    // Add the same product twice
    for (let i = 0; i < 2; i++) {
      addProduct(productName);                            
    }

    cy.get(".nav-link").contains('Cart').click();

    // Wait until 2 products are in the cart
    cy.get("#tbodyid tr").should("have.length", 2).then(($rows) => {

      let sum = 0;
      $rows.each((index, row) => {
        const price = parseInt(Cypress.$(row).find("td:nth-child(3)").text().trim());
        if (!isNaN(price)) sum += price;
      });

      // Validate total
      cy.get("#totalp").then(($total) => {
        const total = parseInt($total.text().trim());
        expect(total).to.eq(sum);
      });

    });

  });


})
