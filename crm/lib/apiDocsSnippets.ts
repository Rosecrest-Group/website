export const API_BASE_URL = "https://api.rosecrestgroupltd.co.uk";
export const INTAKE_ENDPOINT = `${API_BASE_URL}/api/v1/intake/leads/THIRD_PARTY`;

export const EXAMPLE_API_KEY = "rc_your_api_key_here";

export const EXAMPLE_LEAD = {
  id: "your-unique-ref-123",
  first_name: "John",
  last_name: "Smith",
  email: "john.smith@example.com",
  phone: "07700 900123",
  postcode: "SW1A 1AA",
  property_address: "10 Downing Street, London",
  job_type: "RICS_SURVEY",
  survey_level: "LEVEL_2",
  message: "Interested in a home survey",
} as const;

export type CodeLanguage = "curl" | "php" | "python" | "javascript" | "ruby" | "csharp";

export const CODE_LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "php", label: "PHP" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "Node.js" },
  { id: "ruby", label: "Ruby" },
  { id: "csharp", label: "C#" },
];

const bodyJson = JSON.stringify(EXAMPLE_LEAD, null, 2);

export function getRequestSnippet(language: CodeLanguage, apiKey = EXAMPLE_API_KEY): string {
  switch (language) {
    case "curl":
      return `curl -X POST ${INTAKE_ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '${JSON.stringify(EXAMPLE_LEAD)}'`;

    case "php":
      return `<?php

$payload = ${bodyJson.replace(/^/gm, "  ")};

$ch = curl_init("${INTAKE_ENDPOINT}");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "X-API-Key: ${apiKey}",
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
]);

$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP {$status}\\n";
echo $response;`;

    case "python":
      return `import requests

url = "${INTAKE_ENDPOINT}"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "${apiKey}",
}
payload = ${bodyJson}

response = requests.post(url, json=payload, headers=headers, timeout=30)
print(response.status_code)
print(response.json())`;

    case "javascript":
      return `const response = await fetch("${INTAKE_ENDPOINT}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "${apiKey}",
  },
  body: JSON.stringify(${bodyJson}),
});

const data = await response.json();
console.log(response.status, data);`;

    case "ruby":
      return `require "net/http"
require "json"
require "uri"

uri = URI("${INTAKE_ENDPOINT}")
payload = ${bodyJson}

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request["X-API-Key"] = "${apiKey}"
request.body = payload.to_json

response = http.request(request)
puts response.code
puts response.body`;

    case "csharp":
      return `using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("X-API-Key", "${apiKey}");

var payload = ${bodyJson};
var content = new StringContent(
    JsonSerializer.Serialize(payload),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "${INTAKE_ENDPOINT}",
    content
);

var body = await response.Content.ReadAsStringAsync();
Console.WriteLine($"{(int)response.StatusCode} {body}");`;

    default:
      return "";
  }
}

export const SUCCESS_RESPONSE = `{
  "ok": true,
  "data": {
    "leadId": "clxyz123...",
    "deduped": false,
    "webhookEventId": "clxyz456...",
    "partner": "Your Company Name",
    "sourceRef": "TP-your-company-your-unique-ref-123"
  }
}`;

export const ERROR_RESPONSE = `{
  "ok": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid or missing API key"
  }
}`;
