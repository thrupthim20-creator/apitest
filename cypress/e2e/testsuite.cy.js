function getRandomUser() {
  return "user" + Math.floor(Math.random() * 100000);
}

describe("DemoBlaze E2E UI Tests", () => {
  const baseUrl = "https://www.demoblaze.com/index.html";
  let username = getRandomUser();
  const password = "test123";

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it("Create an account", () => {
    cy.get("#signin2").click();
    cy.wait(500);
    cy.get("#sign-username").type(username);
    cy.get("#sign-password").type(password);
    cy.get('.btn.btn-primary').contains('Sign up').click();

    cy.on("window:alert", (str) => {
      expect(str).to.contain("Sign up successful");
    });
  });

  it("Login with the created account", () => {
    cy.get("#login2").click();
    cy.wait(500);
    cy.get("#loginusername").type(username);
    cy.get("#loginpassword").type(password);
    cy.get('.btn.btn-primary').contains('Log in').click()

  cy.get("#nameofuser");

  });


  it("Add 3 products to cart and validate total", () => {
    let productPrices = [];

    function addProduct(name) {
  cy.contains("a.hrefch", name).click(); // click product link
  cy.get(".btn.btn-success.btn-lg").click();       // click Add to Cart
  cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
  cy.get(".nav-link").contains('Home').click();       // go back home
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


it("Place an order", () => {
cy.get("#cartur").contains('Cart').click();
cy.wait(500);    
cy.get(".btn.btn-success").contains('Place Order').click();
cy.get("#name").type("Test User");
cy.get("#country").type("Germany");
cy.get("#city").type("Hamburg");
cy.get("#card").type("123456789");
cy.get("#month").type("08");
cy.get("#year").type("2025");

cy.contains("Purchase").click();
});  

it("Add 2 same products to cart and validate total", () => {



    const productName = "Samsung galaxy s6";
    function addProduct(name) {
  cy.contains("a.hrefch", name).click(); // click product link
  cy.get(".btn.btn-success.btn-lg").click();       // click Add to Cart
  cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
  cy.get(".nav-link").contains('Home').click();       // go back home
}

    // Add the same product twice
    for (let i = 0; i < 2; i++) {
      addProduct(productName);                            // back to homepage
    }

    // Go to cart
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

it("Validates that purchase confirmation shows correct details", () => {


    // Add a product to cart
    const productName = "Sony vaio i5";
    cy.contains("a.hrefch", productName).click();
    cy.get(".btn.btn-success.btn-lg").click();       // click Add to Cart
  cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
    cy.get(".nav-link").contains('Home').click(); 

    // Go to cart
    cy.get(".nav-link").contains('Cart').click();

    // Wait for product in cart and get total
    cy.get("#tbodyid tr").should("have.length", 1);
    let totalAmount = 0;
    cy.get("#tbodyid tr td:nth-child(3)").then(($priceCells) => {
      totalAmount = parseInt($priceCells.text().trim());
    });

    // Place order
    cy.get(".btn.btn-success").contains('Place Order').click();

    // Fill order form
    const orderDetails = {
      name: "Test User",
      country: "Germany",
      city: "Hamburg",
      card: "1234567890123456",
      month: "08",
      year: "2025"
    };

    cy.get("#name").type(orderDetails.name);
    cy.get("#country").type(orderDetails.country);
    cy.get("#city").type(orderDetails.city);
    cy.get("#card").type(orderDetails.card);
    cy.get("#month").type(orderDetails.month);
    cy.get("#year").type(orderDetails.year);

    // Click Purchase
    cy.contains("Purchase").click();

    // Validate confirmation modal
    cy.get(".sweet-alert").should("be.visible").within(() => {
      cy.get("h2").should("contain.text", "Thank you for your purchase!");
      cy.get("p").then(($msg) => {
        const text = $msg.text();

        // Check if details are in the confirmation text
        expect(text).to.include(orderDetails.name);
        expect(text).to.include(orderDetails.card);
        expect(text).to.include(totalAmount.toString());
      });
    });

    // Close confirmation
    cy.contains("OK").click();

  });


}
)

