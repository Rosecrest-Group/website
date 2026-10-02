import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  autoMapHeader,
  inferImportedCustomerType,
  parseCustomerType,
  parseSpreadsheet,
} from "./listImportFile";

describe("import type mapping", () => {
  it("maps Type / category / tag headers onto customerType", () => {
    assert.equal(autoMapHeader("Type"), "customerType");
    assert.equal(autoMapHeader("Customer type"), "customerType");
    assert.equal(autoMapHeader("Lead type"), "customerType");
    assert.equal(autoMapHeader("Category"), "customerType");
    assert.equal(autoMapHeader("Tag"), "customerType");
    assert.equal(autoMapHeader("First name"), "firstName");
  });

  it("maps solicitor wording to LEGAL, not LANDLORD", () => {
    assert.equal(parseCustomerType("Solicitor"), "LEGAL");
    assert.equal(parseCustomerType("solicitors"), "LEGAL");
    assert.equal(parseCustomerType("Legal"), "LEGAL");
    assert.equal(parseCustomerType("Law firm"), "LEGAL");
    assert.equal(parseCustomerType("LEGAL"), "LEGAL");
    assert.equal(parseCustomerType("Landlord solicitor"), "LEGAL");
  });

  it("maps landlord wording only when it is not a solicitor row", () => {
    assert.equal(parseCustomerType("Landlord"), "LANDLORD");
    assert.equal(parseCustomerType("LANDLORD"), "LANDLORD");
    assert.equal(parseCustomerType("Lettings"), "LANDLORD");
  });

  it("infers LEGAL from a solicitor list name when the type column is blank", () => {
    assert.equal(
      inferImportedCustomerType({ listName: "Croydon solicitors" }),
      "LEGAL",
    );
    assert.equal(
      inferImportedCustomerType({ company: "Montas Solicitors LLP" }),
      "LEGAL",
    );
    assert.equal(
      inferImportedCustomerType({ typeValue: "", listName: "Landlord EPC Q3" }),
      "LANDLORD",
    );
  });

  it("prefers an explicit type cell over the list name", () => {
    assert.equal(
      inferImportedCustomerType({
        typeValue: "Solicitor",
        listName: "Landlord list",
      }),
      "LEGAL",
    );
  });

  it("parses a Type column from a solicitor spreadsheet", () => {
    const parsed = parseSpreadsheet(
      "First name,Last name,Email,Type\nAda,Lovelace,ada@firm.com,Solicitor\n",
    );
    assert.ok(!("error" in parsed));
    if ("error" in parsed) return;
    assert.equal(autoMapHeader(parsed.columns[3]!.header), "customerType");
    assert.deepEqual(parsed.columns[3]!.samples, ["Solicitor"]);
  });
});
