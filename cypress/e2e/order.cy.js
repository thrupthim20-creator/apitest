describe("DemoBlaze E2E UI Tests", () => {
const baseUrl = "https://www.demoblaze.com/index.html";
    
it("Place an order", () => {
cy.visit(baseUrl);    
const productName = "Samsung galaxy s6";
cy.contains("a.hrefch", productName).click(); 
cy.get(".btn.btn-success.btn-lg").click();       
cy.on("window:alert", (str) => {
expect(str).to.contain("Product added");
  });

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

cy.get(".sweet-alert").should("be.visible");
cy.get(".sweet-alert h2").should("contain", "Thank you for your purchase!");
});

it("Validates that purchase confirmation shows correct details", () => {

    const productName = "Sony vaio i5";
    cy.visit(baseUrl); 
    cy.contains("a.hrefch", productName).click();
    cy.get(".btn.btn-success.btn-lg").click();       
    cy.on("window:alert", (str) => {
    expect(str).to.contain("Product added");
  });
    cy.get(".nav-link").contains('Home').click(); 

    cy.get(".nav-link").contains('Cart').click();


    cy.get("#tbodyid tr").should("have.length", 1);
    let totalAmount = 0;
    cy.get("#tbodyid tr td:nth-child(3)").then(($priceCells) => {
      totalAmount = parseInt($priceCells.text().trim());
    });

    cy.get(".btn.btn-success").contains('Place Order').click();

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

    cy.contains("OK").click();

  });

  it("negative test:should not allow placing order with empty form fields", () => {

    cy.visit(baseUrl);
    cy.contains("a.hrefch", "Samsung galaxy s6").click(); 
    cy.get(".btn.btn-success.btn-lg").click();       
    cy.get(".nav-link").contains('Cart').click();
    cy.get(".btn.btn-success").contains('Place Order').click();

    // Leave all fields empty and click Purchase
    cy.contains("Purchase").click();

    // Validate that form is not submitted
    // SweetAlert should NOT appear
     cy.once("window:alert", (str) => {
    expect(str).to.contain("Please fill out Name and Creditcard.");
  });

  });

  it("negative test:should not allow placing order with empty cart", () => {

    cy.visit(baseUrl);

    // Go to cart (without adding any product)
    cy.get(".nav-link").contains('Cart').click();

    // Click Place Order
    cy.get(".btn.btn-success").contains('Place Order').click();

    cy.get("#name").type("Test User");
    cy.get("#card").type("123456789");

    cy.contains("Purchase").click();

    // Since cart is empty, SweetAlert should not appear
    cy.get(".sweet-alert").should("not.exist");
    
    // Optional: check that cart is empty
    //cy.get("#tbodyid tr").should("have.length", 0);

  });

  

  

})