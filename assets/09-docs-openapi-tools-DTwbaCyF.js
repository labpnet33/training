var e={id:`docs-tools`,h:{en:`Reading API documentation, OpenAPI and Swagger, Postman and curl`,hi:`API documentation padhna, OpenAPI aur Swagger, Postman aur curl`},body:{en:`
<p>A new appliance arrives with a manual. A good engineer does not guess which button does what; she opens the manual at the right page. API documentation is that manual. This chapter covers exam topic 2.7: reading API documentation, understanding an OpenAPI (formerly Swagger) description at a basic level, and trying calls with tools such as curl and Postman before you write code.</p>

<h3>How to read one endpoint in an API reference</h3>
<p>Every endpoint page answers the same questions. Learn to find these seven:</p>
<ol>
<li><b>Method and path</b>: <code>GET /v2/devices/{id}</code>. Braces mean a placeholder you replace.</li>
<li><b>Purpose</b>: one sentence, and whether it changes data.</li>
<li><b>Authentication</b>: which scheme and which scope or role is required.</li>
<li><b>Parameters</b>: grouped as <i>path</i> (in the URL), <i>query</i> (after the question mark), <i>header</i> and <i>body</i>, each marked required or optional, with type and allowed values.</li>
<li><b>Request example</b>: a ready curl command or JSON body.</li>
<li><b>Responses</b>: the success code and body shape, plus the error codes this endpoint can return.</li>
<li><b>Limits and notes</b>: rate limit, page size, deprecation warnings, version.</li>
</ol>
<div class="eg"><p>You read: <i>"GET /v2/devices/{id}/interfaces, query: status (optional: up or down), limit (optional, max 100), auth: Bearer token with devices.read."</i> You can now build: a path with the device id, a query string with your filters, and a header with the token. Nothing is guessed.</p></div>

<h3>OpenAPI and Swagger</h3>
<p><b>OpenAPI</b> is a standard, machine-readable way to describe a REST API in one JSON or YAML file. <b>Swagger</b> was the original name (version 2.0); since version 3.0 the specification is called OpenAPI, and "Swagger" now mostly names the tools around it, such as <b>Swagger UI</b>, which turns the file into a web page with a "Try it out" button. The file is the single source of truth: from it, tools can generate documentation, client code, test mocks and validation.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OpenAPI file and what it feeds">
<rect x="20" y="85" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="112" text-anchor="middle" class="svg-ink" font-size="14">OpenAPI file</text><text x="95" y="132" text-anchor="middle" class="svg-muted" font-size="12">openapi.yaml</text>
<rect x="300" y="15" width="150" height="40" rx="8" fill="#bae6fd"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="13">Swagger UI docs</text>
<rect x="300" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="100" text-anchor="middle" class="svg-ink" font-size="13">Postman collection</text>
<rect x="300" y="135" width="150" height="40" rx="8" fill="#fde68a"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="13">Client code generator</text>
<rect x="300" y="195" width="150" height="30" rx="8" fill="#fed7aa"/><text x="375" y="215" text-anchor="middle" class="svg-ink" font-size="13">Validator / mock</text>
<line x1="170" y1="105" x2="300" y2="35" stroke="#64748b"/><line x1="170" y1="112" x2="300" y2="95" stroke="#64748b"/><line x1="170" y1="120" x2="300" y2="155" stroke="#64748b"/><line x1="170" y1="130" x2="300" y2="208" stroke="#64748b"/>
<text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">one description,</text><text x="540" y="132" text-anchor="middle" class="svg-muted" font-size="12">many uses</text>
</svg><p class="cap">Write the API once as an OpenAPI file; documentation, tests and client code follow from it.</p></div>
<p>A small OpenAPI 3 file (reference snippet, example API):</p>
<pre class="code">openapi: 3.0.3
info: {title: Device Inventory API, version: "2.0"}
servers:
  - url: h&#116;tps://api.example/v2
paths:
  /devices/{id}:
    get:
      summary: Get one device
      parameters:
        - name: id
          in: path
          required: true
          schema: {type: string}
        - name: fields
          in: query
          schema: {type: string}
      security:
        - bearerAuth: []
      responses:
        "200":
          description: The device
          content:
            application/json:
              schema: {$ref: "#/components/schemas/Device"}
        "404":
          description: No such device
components:
  securitySchemes:
    bearerAuth: {type: h&#116;tp, scheme: bearer}
  schemas:
    Device:
      type: object
      required: [id, mgmt_ip]
      properties:
        id: {type: string}
        mgmt_ip: {type: string}</pre>
<p>How to read it: <code>servers</code> gives the base URL; <code>paths</code> lists endpoints, each with methods; <code>parameters</code> say where each value goes (<code>in: path</code> or <code>in: query</code>); <code>security</code> points at a scheme defined under <code>components.securitySchemes</code> (here a bearer token); <code>responses</code> list the status codes and body shapes; <code>components.schemas</code> holds reusable data models, referenced with <code>$ref</code>. From this file you can write the call without any other help:</p>
<pre class="code">curl -s "h&#116;tps://api.example/v2/devices/r1?fields=id,mgmt_ip" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"</pre>

<h3>curl: the universal test tool</h3>
<div class="tbl"><table class="cmp"><tr><th>Option</th><th>Meaning</th></tr>
<tr><td><code>-X POST</code></td><td>Choose the method (GET is the default)</td></tr>
<tr><td><code>-H "Name: value"</code></td><td>Add a header; repeat for several</td></tr>
<tr><td><code>-d '{...}'</code> or <code>-d @file.json</code></td><td>Send a body (implies POST); from a file with @</td></tr>
<tr><td><code>-u user:pass</code></td><td>Basic authentication</td></tr>
<tr><td><code>-i</code> / <code>-I</code></td><td>Show response headers with the body / headers only (HEAD)</td></tr>
<tr><td><code>-v</code></td><td>Verbose: request and response lines, useful for debugging</td></tr>
<tr><td><code>-s</code>, <code>-o file</code></td><td>Silent; write the body to a file</td></tr>
<tr><td><code>-G --data-urlencode "k=v"</code></td><td>Build an encoded query string</td></tr>
<tr><td><code>-k</code>, <code>--max-time 10</code></td><td>Skip certificate check (lab only); overall timeout</td></tr></table></div>
<p>The lab host command <code>rest</code> imitates the same options, so your habits carry over:</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u netops:NK@2026 -H 'Accept: application/yang-data+json'
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10/description -u netops:NK@2026 -d '{"ietf-interfaces:description": "MONITORING PROBE"}'</pre>

<h3>Postman: curl with a face</h3>
<p><b>Postman</b> is a graphical API client. You build a request in forms (method, URL, auth tab, headers, body), press Send and see status, time, headers and a formatted body. Features worth knowing for the exam: <b>collections</b> (saved groups of requests), <b>environments</b> with variables such as <code>{{base_url}}</code> and <code>{{token}}</code> so the same request runs against lab and production, <b>importing an OpenAPI file</b> to create a whole collection, simple <b>test scripts</b> that check the status code, and <b>generating code</b> (curl, Python requests) from a working request. A good habit: make the call work in curl or Postman first, then copy it into Python.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading only the example and not the parameter table; ignoring the version in the path; testing destructive calls (DELETE, PUT) on production; pasting live tokens into shared Postman collections or screenshots; using <code>-k</code> or <code>verify=False</code> outside a lab.</p></div>
<div class="exam"><p><b>Exam trap.</b> OpenAPI describes REST APIs and is written in JSON or YAML; Swagger UI is a tool that renders it. The security scheme is declared once under components and applied with <code>security</code>. Path parameters are written in braces in the path template.</p></div>

<div class="scn"><h4>Faster than guessing</h4><p>A new engineer needed to list only the "up" interfaces of one device from a vendor cloud. Instead of trial and error she opened the OpenAPI file in Swagger UI, found the endpoint, saw that <code>status</code> was a query parameter with allowed values up and down, used Try it out with her token, copied the generated curl command and turned it into five lines of Python. The first call worked.</p><p><b>Lesson:</b> Read the reference, test in a tool, then script.</p></div>

<div class="iv"><p class="q">"How do you learn a new API quickly?"</p><p>I start from the reference or the OpenAPI file: authentication, base URL, the endpoint I need, its parameters and error codes. I try one safe GET in curl or Postman with an environment variable for the token, look at the real response, and only then write Python with timeouts and error handling. I import the OpenAPI file into Postman or Swagger UI when it exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>For each endpoint find method, path, auth, parameters (path, query, header, body), examples and error codes.</li>
<li>OpenAPI is a JSON or YAML description of a REST API; Swagger UI renders and tests it.</li>
<li>In the file: servers, paths, parameters, security schemes, responses and component schemas.</li>
<li>curl and the lab <code>rest</code> command share the options -X, -H, -d, -u and -v.</li>
<li>Postman adds collections, environments and code generation: prove the call, then script it.</li>
</ul></div>
`,hi:`
<p>Nayi appliance manual ke saath aati hai. Achha engineer andaza nahi lagata ki kaunsa button kya karta hai; woh manual sahi page par kholta hai. API documentation wahi manual hai. Yeh chapter exam topic 2.7 cover karta hai: API documentation padhna, OpenAPI (pehle Swagger) description ko basic level par samajhna, aur code likhne se pehle curl aur Postman jaise tools se calls try karna.</p>

<h3>API reference mein ek endpoint kaise padhein</h3>
<p>Har endpoint page wahi sawaalon ke jawab deta hai. Yeh saat dhoondhna seekho:</p>
<ol>
<li><b>Method aur path</b>: <code>GET /v2/devices/{id}</code>. Braces ka matlab placeholder jise aap badalte ho.</li>
<li><b>Purpose</b>: ek vaakya, aur yeh data badalta hai ya nahi.</li>
<li><b>Authentication</b>: kaunsi scheme aur kaunsa scope ya role chahiye.</li>
<li><b>Parameters</b>: <i>path</i> (URL mein), <i>query</i> (question mark ke baad), <i>header</i> aur <i>body</i> mein group, har ek required ya optional marked, type aur allowed values ke saath.</li>
<li><b>Request example</b>: taiyar curl command ya JSON body.</li>
<li><b>Responses</b>: success code aur body ka shape, saath mein is endpoint ke error codes.</li>
<li><b>Limits aur notes</b>: rate limit, page size, deprecation warnings, version.</li>
</ol>
<div class="eg"><p>Aap padhte ho: <i>"GET /v2/devices/{id}/interfaces, query: status (optional: up ya down), limit (optional, max 100), auth: devices.read wala Bearer token."</i> Ab aap bana sakte ho: device id wala path, filters wali query string, aur token wala header. Kuch andaza nahi lagana pada.</p></div>

<h3>OpenAPI aur Swagger</h3>
<p><b>OpenAPI</b> REST API ko ek JSON ya YAML file mein describe karne ka standard, machine-readable tareeka hai. <b>Swagger</b> pehla naam tha (version 2.0); version 3.0 se specification ka naam OpenAPI hai, aur "Swagger" ab zyada tar uske aas-paas ke tools ka naam hai, jaise <b>Swagger UI</b>, jo file ko "Try it out" button wale web page mein badalta hai. File single source of truth hai: usse tools documentation, client code, test mocks aur validation bana sakte hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OpenAPI file and what it feeds">
<rect x="20" y="85" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="95" y="112" text-anchor="middle" class="svg-ink" font-size="14">OpenAPI file</text><text x="95" y="132" text-anchor="middle" class="svg-muted" font-size="12">openapi.yaml</text>
<rect x="300" y="15" width="150" height="40" rx="8" fill="#bae6fd"/><text x="375" y="40" text-anchor="middle" class="svg-ink" font-size="13">Swagger UI docs</text>
<rect x="300" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="375" y="100" text-anchor="middle" class="svg-ink" font-size="13">Postman collection</text>
<rect x="300" y="135" width="150" height="40" rx="8" fill="#fde68a"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="13">Client code generator</text>
<rect x="300" y="195" width="150" height="30" rx="8" fill="#fed7aa"/><text x="375" y="215" text-anchor="middle" class="svg-ink" font-size="13">Validator / mock</text>
<line x1="170" y1="105" x2="300" y2="35" stroke="#64748b"/><line x1="170" y1="112" x2="300" y2="95" stroke="#64748b"/><line x1="170" y1="120" x2="300" y2="155" stroke="#64748b"/><line x1="170" y1="130" x2="300" y2="208" stroke="#64748b"/>
<text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">ek description,</text><text x="540" y="132" text-anchor="middle" class="svg-muted" font-size="12">kai use</text>
</svg><p class="cap">API ko ek baar OpenAPI file mein likho; documentation, tests aur client code usse nikalte hain.</p></div>
<p>Chhoti OpenAPI 3 file (reference snippet, example API):</p>
<pre class="code">openapi: 3.0.3
info: {title: Device Inventory API, version: "2.0"}
servers:
  - url: h&#116;tps://api.example/v2
paths:
  /devices/{id}:
    get:
      summary: Get one device
      parameters:
        - name: id
          in: path
          required: true
          schema: {type: string}
        - name: fields
          in: query
          schema: {type: string}
      security:
        - bearerAuth: []
      responses:
        "200":
          description: The device
          content:
            application/json:
              schema: {$ref: "#/components/schemas/Device"}
        "404":
          description: No such device
components:
  securitySchemes:
    bearerAuth: {type: h&#116;tp, scheme: bearer}
  schemas:
    Device:
      type: object
      required: [id, mgmt_ip]
      properties:
        id: {type: string}
        mgmt_ip: {type: string}</pre>
<p>Kaise padhein: <code>servers</code> base URL deta hai; <code>paths</code> endpoints list karta hai, har ek ke methods ke saath; <code>parameters</code> batate hain har value kahan jaati hai (<code>in: path</code> ya <code>in: query</code>); <code>security</code> <code>components.securitySchemes</code> ke neeche define ki gayi scheme ki taraf point karta hai (yahan bearer token); <code>responses</code> status codes aur body shapes list karte hain; <code>components.schemas</code> reusable data models rakhta hai, jinhe <code>$ref</code> se refer kiya jaata hai. Is file se aap bina kisi aur madad ke call likh sakte ho:</p>
<pre class="code">curl -s "h&#116;tps://api.example/v2/devices/r1?fields=id,mgmt_ip" -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"</pre>

<h3>curl: universal test tool</h3>
<div class="tbl"><table class="cmp"><tr><th>Option</th><th>Matlab</th></tr>
<tr><td><code>-X POST</code></td><td>Method chuno (default GET hai)</td></tr>
<tr><td><code>-H "Name: value"</code></td><td>Header jodo; kai ke liye repeat karo</td></tr>
<tr><td><code>-d '{...}'</code> ya <code>-d @file.json</code></td><td>Body bhejo (POST maan leta hai); file se @ ke saath</td></tr>
<tr><td><code>-u user:pass</code></td><td>Basic authentication</td></tr>
<tr><td><code>-i</code> / <code>-I</code></td><td>Body ke saath response headers dikhao / sirf headers (HEAD)</td></tr>
<tr><td><code>-v</code></td><td>Verbose: request aur response lines, debugging ke liye useful</td></tr>
<tr><td><code>-s</code>, <code>-o file</code></td><td>Silent; body ko file mein likho</td></tr>
<tr><td><code>-G --data-urlencode "k=v"</code></td><td>Encoded query string banao</td></tr>
<tr><td><code>-k</code>, <code>--max-time 10</code></td><td>Certificate check skip (sirf lab); poora timeout</td></tr></table></div>
<p>Lab host command <code>rest</code> wahi options imitate karta hai, isliye aapki aadatein saath chalti hain:</p>
<pre class="code">rest GET h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces -u netops:NK@2026 -H 'Accept: application/yang-data+json'
rest PATCH h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback10/description -u netops:NK@2026 -d '{"ietf-interfaces:description": "MONITORING PROBE"}'</pre>

<h3>Postman: curl ek chehre ke saath</h3>
<p><b>Postman</b> graphical API client hai. Aap request forms mein banate ho (method, URL, auth tab, headers, body), Send dabate ho aur status, time, headers aur formatted body dekhte ho. Exam ke liye jaanne layak features: <b>collections</b> (requests ke saved groups), <code>{{base_url}}</code> aur <code>{{token}}</code> jaise variables wale <b>environments</b> taaki wahi request lab aur production dono par chale, poori collection banane ke liye <b>OpenAPI file import</b>, status code check karne wali simple <b>test scripts</b>, aur chalti hui request se <b>code generate</b> karna (curl, Python requests). Achhi aadat: pehle call ko curl ya Postman mein chalao, phir Python mein copy karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Sirf example padhna aur parameter table nahi; path mein version ignore karna; production par destructive calls (DELETE, PUT) test karna; shared Postman collections ya screenshots mein live tokens paste karna; lab ke bahar <code>-k</code> ya <code>verify=False</code> use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> OpenAPI REST APIs ko describe karta hai aur JSON ya YAML mein likha jaata hai; Swagger UI ek tool hai jo use render karta hai. Security scheme components mein ek baar declare hoti hai aur <code>security</code> se apply hoti hai. Path parameters path template mein braces mein likhe jaate hain.</p></div>

<div class="scn"><h4>Andaza lagane se tez</h4><p>Ek naye engineer ko vendor cloud se ek device ke sirf "up" interfaces list karne the. Trial and error ki jagah usne OpenAPI file Swagger UI mein kholi, endpoint dhoondha, dekha ki <code>status</code> query parameter hai jiski allowed values up aur down hain, apne token ke saath Try it out use kiya, generated curl command copy kiya aur use paanch lines ki Python mein badal diya. Pehli call chal gayi.</p><p><b>Lesson:</b> Reference padho, tool mein test karo, phir script likho.</p></div>

<div class="iv"><p class="q">"Nayi API jaldi kaise seekhte ho?"</p><p>Main reference ya OpenAPI file se shuru karta hoon: authentication, base URL, mujhe jo endpoint chahiye, uske parameters aur error codes. Token ke liye environment variable ke saath curl ya Postman mein ek safe GET try karta hoon, asli response dekhta hoon, aur tab Python likhta hoon timeouts aur error handling ke saath. OpenAPI file ho to use Postman ya Swagger UI mein import karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har endpoint ke liye method, path, auth, parameters (path, query, header, body), examples aur error codes dhoondho.</li>
<li>OpenAPI REST API ka JSON ya YAML description hai; Swagger UI use render aur test karta hai.</li>
<li>File mein: servers, paths, parameters, security schemes, responses aur component schemas.</li>
<li>curl aur lab ka <code>rest</code> command -X, -H, -d, -u aur -v options share karte hain.</li>
<li>Postman collections, environments aur code generation jodta hai: pehle call saabit karo, phir script likho.</li>
</ul></div>
`}};export{e as default};