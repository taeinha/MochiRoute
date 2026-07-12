import ShortenForm from "./ShortenForm";

describe("<ShortenForm />", () => {
  beforeEach(() => {
    cy.mount(<ShortenForm />);
  });

  describe("validates form input", () => {
    it("shows error for empty URL", () => {
      cy.get('[data-cy="shorten-url-submit"]').click();
      cy.get(".MuiFormHelperText-root").invoke("text").then(console.log);
      cy.contains("URL is required").should("be.visible");
    });

    it("shows error for invalid URL", () => {
      cy.get('[data-cy="shorten-url-input"]').type("invalid url");
      cy.get('[data-cy="shorten-url-submit"]').click();
      cy.contains(
        "Invalid URL. URL must start with http:// or https://",
      ).should("be.visible");
    });

    it("shows error for incorrect protocol in URL", () => {
      cy.get('[data-cy="shorten-url-input"]').type("ftp://example.com");
      cy.get('[data-cy="shorten-url-submit"]').click();
      cy.contains("URL must start with http:// or https://").should(
        "be.visible",
      );
    });
  });

  describe("submit", () => {
    it("shows network error when API fails", () => {
      cy.intercept("POST", "/api/url", {
        statusCode: 500,
      }).as("createUrl");
      cy.get('[data-cy="shorten-url-input"]').type("https://example.com");
      cy.get('[data-cy="shorten-url-submit"]').click();

      cy.wait("@createUrl").then(() => {
        cy.contains("Network error. Please try again.").should("be.visible");
      });
    });

    it("shows loading states on slow response", () => {
      cy.intercept("POST", "/api/url", {
        delay: 2000,
        fixture: "createUrlSuccess.json",
      }).as("createUrl");

      cy.get('[data-cy="shorten-url-input"]').type("https://example.com");
      cy.get('[data-cy="shorten-url-submit"]').click();
      cy.get('[data-cy="shorten-url-input"]').should("be.disabled");
      cy.get('[data-cy="shorten-url-submit"]').should("be.disabled");

      cy.wait("@createUrl");
    });

    it("shows result for success response", () => {
      cy.intercept("POST", "/api/url", {
        statusCode: 201,
        fixture: "createUrlSuccess.json",
      }).as("createUrl");

      cy.get('[data-cy="shorten-url-input"]').type("https://example.com");
      cy.get('[data-cy="shorten-url-submit"]').click();

      cy.wait("@createUrl").then((interception) => {
        const { shortUrl, originalUrl } = interception.response!.body.data!;
        cy.get('[data-cy="shorten-result-title"]').should("be.visible");
        cy.get('[data-cy="shorten-result-short-url-input"]')
          .should("be.visible")
          .and("have.value", shortUrl);
        cy.get('[data-cy="shorten-result-original-url"]')
          .should("be.visible")
          .and("to.contain", originalUrl);
      });
    });
  });
});
