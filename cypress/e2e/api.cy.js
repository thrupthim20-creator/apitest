describe("API Testing with Cypress", () => {

  const baseUrl = "https://simple-books-api.click";
  const customername = "CypressTest";
  let accessToken;
  let bookId;
  let orderId;

  before(() => {
    //  Register an API client to get the token
    cy.request("POST", `${baseUrl}/api-clients/`, {
      clientName: "CypressTest",
      clientEmail: `cypress${Date.now()}@example.com`
    }).then((res) => {
      expect(res.status).to.eq(201);
      accessToken = res.body.accessToken;
    });

    //  Get bookId
    cy.request("GET", `${baseUrl}/books`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      bookId = res.body[0].id;

    // Get orderId  
     cy.request({
      method: "POST",
      url: `${baseUrl}/orders`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { bookId, customerName: customername }
    }).then((res) => {
      expect(res.status).to.eq(201);
      orderId = res.body.orderId;
    });  
    });

  });

  it("GET products", () => {
    cy.request("GET", baseUrl)
      .its("status")
      .should("eq", 200);
  });

  it("GET all books", () => {
  cy.request("GET", `${baseUrl}/books`).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.be.an("array");
    cy.log("Number of books returned:", response.body.length);
    expect(response.body.length).to.be.greaterThan(0);
  });
});

it("Get fiction books with limit 5", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/books`,
      qs: {
        type: "fiction",
        limit: 5
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.lte(5);
      response.body.forEach(book => {
        expect(book.type).to.eq("fiction");
      });
    });
  });

  it("Get nonfiction books with limit 10", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/books`,
      qs: {
        type: "non-fiction",
        limit: 10
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.lte(10);
      response.body.forEach(book => {
        expect(book.type).to.eq("non-fiction");
      });
    });
});
    
    it("Get a single book by valid ID", () => {
      
      // Get the book by ID
      cy.request("GET", `${baseUrl}/books/${bookId}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("id", bookId);
        expect(res.body).to.have.property("name");
        expect(res.body).to.have.property("type");
      });
   });
    

//     it("Submit a valid order", () => {
//     cy.request({
//       method: "POST",
//       url: `${baseUrl}/orders`,
//       headers: { Authorization: `Bearer ${accessToken}` },
//       body: {
//         bookId: bookId,
//         customerName: customername
//       }
//     }).then((res) => {
//       expect(res.status).to.eq(201);
//       expect(res.body).to.have.property("orderId");
//       orderId = res.body.orderId;
//     });
//   })

  it("Get an order by ID", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("id", orderId);
      expect(res.body).to.have.property("bookId");
      expect(res.body).to.have.property("customerName", customername);
    });
  });
  
 it("Update the order's customerName", () => {
    cy.request({
      method: "PATCH",
      url: `${baseUrl}/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        customerName: "Updated Name",
      },
    }).then((res) => {
      expect(res.status).to.eq(204); // API returns 204 No Content on success
    });

    // Verify updated name
  cy.request({
    method: "GET",
    url: `${baseUrl}/orders/${orderId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body.customerName).to.eq("Updated Name");
  });
});

it("Delete an existing order", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(204); // No Content
    });

    //  Verify deletion
  cy.request({
    method: "GET",
    url: `${baseUrl}/orders/${orderId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    failOnStatusCode: false, // don’t fail test automatically on 404
  }).then((res) => {
    expect(res.status).to.eq(404);
    expect(res.body).to.have.property("error");
  });

});

it("Negative Test:Fails to get a book with invalid ID", () => {
  cy.request({
    method: "GET",
    url: `${baseUrl}/books/999999`, // non-existing ID
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status).to.eq(404);
    expect(res.body).to.have.property("error");
  });
});

it("Negative Test:Fails to create an order without token", () => {
  cy.request({
    method: "POST",
    url: `${baseUrl}/orders`,
    body: { bookId, customerName: customername },
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status).to.eq(401);
    expect(res.body).to.have.property("error");
  });
});

it("Negative Test:Fails to get an order with invalid ID", () => {
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

it("Negative Test:Fails to update an order with empty body", () => {
  cy.request({
    method: "PATCH",
    url: `${baseUrl}/orders/${orderId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {},
    failOnStatusCode: false
  }).then((res) => {
    expect(res.status).to.eq(404); // should fail
    expect(res.body).to.have.property("error");
  });
});

it("Negative Test:Fails to delete an order without token", () => {
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