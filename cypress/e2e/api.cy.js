// Cypress Test Suite for API Testing
describe("API Testing with Cypress", () => {

  // Base API URL and test data
  const baseUrl = "https://simple-books-api.click";
  const customerName = "CypressTest";

  // Variables to store dynamic data during tests
  let accessToken;
  let bookId;
  let orderId;

  // Runs once before all tests
  before(() => {
    // Register an API client to obtain access token
    cy.request("POST", `${baseUrl}/api-clients/`, {
      clientName: "CypressTest",
      clientEmail: `cypress${Date.now()}@example.com`
    }).then((res) => {
      expect(res.status).to.eq(201);
      accessToken = res.body.accessToken;
    });

    // Get the first book ID from the books list
    cy.request("GET", `${baseUrl}/books`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      bookId = res.body[0].id;

      // Create a new order for the obtained book
      cy.request({
        method: "POST",
        url: `${baseUrl}/orders`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { bookId, customerName: customerName }
      }).then((res) => {
        expect(res.status).to.eq(201);
        orderId = res.body.orderId;
      });  
    });
  });

  // Test 1: Check if API is reachable
  it("GET products", () => {
    cy.request("GET", baseUrl)
      .its("status")
      .should("eq", 200);
  });

  // Test 2: Fetch all books and verify response
  it("GET all books", () => {
    cy.request("GET", `${baseUrl}/books`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      cy.log("Number of books returned:", response.body.length);
      expect(response.body.length).to.be.greaterThan(0);
    });
  });

  // Test 3: Fetch fiction books with a limit of 5
  it("Get fiction books with limit 5", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/books`,
      qs: { type: "fiction", limit: 5 }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.lte(5);
      response.body.forEach(book => expect(book.type).to.eq("fiction"));
    });
  });

  // Test 4: Fetch non-fiction books with a limit of 10
  it("Get nonfiction books with limit 10", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/books`,
      qs: { type: "non-fiction", limit: 10 }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.lte(10);
      response.body.forEach(book => expect(book.type).to.eq("non-fiction"));
    });
  });

  //  Test 5: Get a single book by valid ID
  it("Get a single book by valid ID", () => {
    cy.request("GET", `${baseUrl}/books/${bookId}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", bookId);
      expect(res.body).to.have.property("name");
      expect(res.body).to.have.property("type");
    });
  });

  //  Test 6: Fetch an order by ID
  it("Get an order by ID", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", orderId);
      expect(res.body).to.have.property("bookId");
      expect(res.body).to.have.property("customerName", customerName);
    });
  });

  //  Test 7: Update the order's customerName and verify
  it("Update the order's customerName", () => {
    // Update order
    cy.request({
      method: "PATCH",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { customerName: "Updated Name" },
    }).then((res) => {
      expect(res.status).to.eq(204); // API returns 204 No Content
    });

    // Verify updated order
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.customerName).to.eq("Updated Name");
    });
  });

  // Test 8: Delete an existing order and verify deletion
  it("Delete an existing order", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      expect(res.status).to.eq(204); // No Content
    });

    // Verify deletion
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      failOnStatusCode: false, // Allow 404 response
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property("error");
    });
  });

  //  Negative Test 1: Fail to get a book with invalid ID
  it("Negative Test: Fails to get a book with invalid ID", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/books/999999`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property("error");
    });
  });

  //  Negative Test 2: Fail to create order without token
  it("Negative Test: Fails to create an order without token", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/orders`,
      body: { bookId, customerName: customerName },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.have.property("error");
    });
  });

  //  Negative Test 3: Fail to get order with invalid ID
  it("Negative Test: Fails to get an order with invalid ID", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders/invalid123`,
      headers: { Authorization: `Bearer ${accessToken}` },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property("error");
    });
  });

  //  Negative Test 4: Fail to update order with empty body
  it("Negative Test: Fails to update an order with empty body", () => {
    cy.request({
      method: "PATCH",
      url: `${baseUrl}/orders/${orderId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {},
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404); // Expected failure
      expect(res.body).to.have.property("error");
    });
  });

  //  Negative Test 5: Fail to delete order without token
  it("Negative Test: Fails to delete an order without token", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/orders/${orderId}`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.have.property("error");
    });
  });

});
