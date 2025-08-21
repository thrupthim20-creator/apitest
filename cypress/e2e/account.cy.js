function getRandomUser() {
  return "user" + Math.floor(Math.random() * 100000);
}

describe("DemoBlaze E2E UI Tests", () => {
  const baseUrl = "https://www.demoblaze.com/index.html";
  let username = getRandomUser();
  const password = "test123";


  it("Create an account", () => {
    cy.visit(baseUrl);
    cy.get("#signin2").click();
    cy.wait(500);
    cy.get("#sign-username").type(username);
    cy.get("#sign-password").type(password);
    cy.get('.btn.btn-primary').contains('Sign up').click();

    cy.on("window:alert", (str) => {
      expect(str).to.contain("Sign up successful");
    });
  });

  it("Login with the created account and logout", () => {
    cy.visit(baseUrl);
    cy.get("#login2").click();
    cy.wait(500);
    cy.get("#loginusername").type(username);
    cy.get("#loginpassword").type(password);
    cy.get('.btn.btn-primary').contains('Log in').click()
    cy.wait(500);
    cy.get("#nameofuser");

    cy.wait(500);

    //cy.get("#logout2").click();
    // cy.wait(500);
    // cy.get("#login2").contains('Log in')

 }); 
    it("negative test:Signup with an existing username should fail", () => {
    cy.visit(baseUrl);      
    cy.get("#signin2").click();
    cy.wait(500);
    cy.get("#sign-username").type("admin"); // re-use the same username
    cy.get("#sign-password").type("admin");
    cy.get('.btn.btn-primary').contains('Sign up').click();

    cy.on("window:alert", (str) => {
    expect(str).to.contain("This user already exist.");
});

});

it("negative test:Signup without entering username", () => {
  cy.visit(baseUrl);  
  cy.get("#signin2").click();
  cy.wait(500);
  cy.get("#sign-password").type(password);
  cy.get('.btn.btn-primary').contains('Sign up').click();

  cy.on("window:alert", (str) => {
    expect(str).to.contain("Please fill out Username and Password.");
  });
});

it("negative test:Login with incorrect password", () => {
  cy.visit(baseUrl);  
  cy.get("#login2").click();
  cy.wait(500);
  cy.get("#loginusername").type("admin");
  cy.get("#loginpassword").type("wrongpass");
  cy.get('.btn.btn-primary').contains('Log in').click();

  cy.on("window:alert", (str) => {
    expect(str).to.contain("Wrong password.");
  });
});

it("negative test:Login with non-existing username", () => {
  cy.visit(baseUrl);   
  cy.get("#login2").click();
  cy.wait(500);
  cy.get("#loginusername").type("nonexistentUser123");
  cy.get("#loginpassword").type("whatever");
  cy.get('.btn.btn-primary').contains('Log in').click();

  cy.on("window:alert", (str) => {
    expect(str).to.contain("User does not exist.");
  });
});

});