import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emailPreviewText } from "./messageFormatting";

describe("emailPreviewText", () => {
  it("drops Outlook head, VML styles and conditional comments", () => {
    const outlook = `<html xmlns:v="urn:schemas-microsoft-com:vml"><head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>Re: Survey</title>
      <style>v\\:* {behavior:url(#default#VML);} o\\:* {behavior:url(#default#VML);}</style>
      <!--[if gte mso 9]><xml><o:shapedefaults v:ext="edit" spidmax="1026" /></xml><![endif]-->
      </head><body><div class="WordSection1"><p class="MsoNormal">Hello Rosecrest,<o:p></o:p></p>
      <p class="MsoNormal">Please find the access details&nbsp;below.</p></div></body></html>`;
    assert.equal(emailPreviewText(outlook), "Hello Rosecrest, Please find the access details below.");
  });

  it("drops a body-level style block from Hotmail", () => {
    const hotmail = `<style type="text/css" style="display:none;"> P {margin-top:0;margin-bottom:0;} </style>
      <div dir="ltr"><div>Hi Torera,</div><div>Thanks &amp; regards</div></div>`;
    assert.equal(emailPreviewText(hotmail), "Hi Torera, Thanks & regards");
  });

  it("leaves plain text alone and truncates long previews", () => {
    assert.equal(emailPreviewText("Hi Sabrina, your payment is confirmed."), "Hi Sabrina, your payment is confirmed.");
    assert.equal(emailPreviewText("a".repeat(100)), `${"a".repeat(80)}…`);
  });

  it("keeps angle-bracketed links in plain-text emails", () => {
    assert.equal(
      emailPreviewText("See <https://example.com> for details"),
      "See <https://example.com> for details",
    );
  });
});
