import type {
  ApiResponse,
  CreateUrlResponse,
  CreateUrlRequest,
} from "@mochiroute/shared";
import type { Interception } from "cypress/types/net-stubbing";

describe("URL Shorten", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/url").as("createUrl");
    cy.visit("/");
  });

  const originalUrl = "https://example.com/test";

  it("should shorten a URL, test copy, and redirect functionality", () => {
    cy.get('[data-cy="shorten-url-input"]').type(originalUrl);
    cy.get('[data-cy="shorten-url-submit"]').click();

    cy.wait("@createUrl").then(
      (
        interception: Interception<
          CreateUrlRequest,
          ApiResponse<CreateUrlResponse>
        >,
      ) => {
        const { request, response } = interception;
        const shortUrl = response!.body.data!.shortUrl;

        expect(request.body.originalUrl).to.equal(originalUrl);
        expect(request.headers["content-type"]).to.include("application/json");

        expect(response!.statusCode).to.equal(201);
        expect(response!.body.success).to.equal(true);
        expect(shortUrl).to.be.a("string");
        expect(shortUrl).to.match(/\/r\/[A-Za-z0-9]{7}$/);

        cy.wrap(shortUrl).as("shortUrl");
      },
    );

    cy.get("@shortUrl").then((shortUrl) => {
      cy.get('[data-cy="shorten-result-title"]')
        .should("exist")
        .and("have.text", "Your short link is ready");

      cy.get('[data-cy="shorten-result-short-url-input"]')
        .should("exist")
        .and("have.value", shortUrl);
    });

    cy.window().then((win) => {
      const copyStub = cy.stub(win.navigator.clipboard, "writeText").resolves();

      cy.get('[data-cy="shorten-result-copy-button"]').click();

      cy.get("@shortUrl").then((shortUrl) => {
        expect(copyStub).to.have.been.calledOnceWith(shortUrl);
      });
    });

    cy.get("@shortUrl").then((shortUrl) => {
      cy.get('[data-cy="shorten-result-open-in-new-tab"]').should(
        "have.attr",
        "href",
        shortUrl,
      );
    });

    cy.get("@shortUrl").then((shortUrl) => {
      cy.request({
        url: shortUrl as string,
        followRedirect: false,
      }).then((response) => {
        expect(response.status).to.eq(302);
        expect(response.headers.location).to.eq(originalUrl);
      });
    });
  });
});
