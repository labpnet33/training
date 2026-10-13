var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have now covered the security half of domain 4 of the Cisco 200-901 CCNAAUTO v1.1 exam: application security issues (4.8) and how the firewall, DNS, load balancer and reverse proxy fit into a deployment (4.9), together with secure CI/CD and secure scripting habits. This last chapter is a revision sheet. Read it the night before the exam, and use the checklist to find gaps.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Protect secrets and data</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Prove identity, limit rights</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Handle input safely (OWASP)</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">DNS and firewalls</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">LB, proxy, WAF</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="13">Secure CI/CD, supply chain</text>
<rect x="120" y="170" width="400" height="44" rx="8" fill="#bae6fd"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">Logging, monitoring, troubleshooting by layer</text>
</svg><p class="cap">Seven areas, one goal: defence in depth around what you deploy.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes:</p>
<ul>
<li>Explain why secrets must not be in code or Git, name three better places and describe rotation.</li>
<li>Find hard-coded secrets in a folder with grep and move them to environment variables with a protected env file.</li>
<li>Explain the difference between encoding, encryption and hashing, and say how passwords are stored (salted, slow hash).</li>
<li>Describe what TLS gives you, what a certificate and a CA do, and why <code>verify=False</code> is wrong.</li>
<li>Define authentication, authorization, MFA factors, sessions, cookie flags, bearer tokens and JWT, and state when you get 401 and 403.</li>
<li>Recognise injection, XSS, CSRF, SSRF, broken access control, misconfiguration, vulnerable components and logging failures from a short description and name the defence.</li>
<li>Show parameterised queries and output encoding as the fix for injection and XSS.</li>
<li>Say where an edge firewall, a host firewall, a load balancer, a reverse proxy and a WAF sit and what each does.</li>
<li>Choose between round robin, least connections and persistence; explain health checks and SSL offload.</li>
<li>Read A, AAAA, CNAME, MX and TXT records, explain TTL and split-horizon, and diagnose a stale record with dig.</li>
<li>Diagnose timeout versus refused and fix a firewall rule narrowly, then prove what stays blocked.</li>
<li>List the gates of a secure pipeline and explain signing, pinning, scanning and an SBOM.</li>
<li>Write the habits of a safe automation script: env secrets, TLS on, least privilege, validation, timeouts, no secrets in logs.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AuthN / AuthZ</dt><dd>Proving who you are / deciding what you may do.</dd>
<dt>MFA</dt><dd>Two or more factors of different types: know, have, are.</dd>
<dt>Bearer token</dt><dd>Credential in the Authorization header; whoever holds it is trusted.</dd>
<dt>JWT</dt><dd>Signed (not encrypted) token with header, claims and signature.</dd>
<dt>Salt</dt><dd>Unique random value mixed into a password before hashing; not secret.</dd>
<dt>TLS</dt><dd>Protocol giving confidentiality, integrity and server authentication; HTTPS is HTTP over TLS.</dd>
<dt>CA / certificate</dt><dd>Trusted issuer / signed binding of a name to a public key.</dd>
<dt>Least privilege</dt><dd>Only the rights the job needs, nothing more.</dd>
<dt>IDOR</dt><dd>Access to an object by changing an identifier because ownership is not checked.</dd>
<dt>WAF</dt><dd>Layer 7 filter that inspects requests for attack patterns.</dd>
<dt>Reverse proxy</dt><dd>Front end that speaks to backends for the client; does TLS termination and routing.</dd>
<dt>Health check</dt><dd>Probe that removes failed servers from a load balancer pool.</dd>
<dt>TTL</dt><dd>How long a DNS answer may be cached.</dd>
<dt>SBOM</dt><dd>List of the components inside a piece of software.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Secrets</td><td>Never in code or Git; env variable or secret manager; rotate after exposure; Base64 is not protection</td></tr>
<tr><td>Passwords</td><td>Salted, slow hash (bcrypt, scrypt, Argon2); never plain text, never reversible encryption</td></tr>
<tr><td>TLS</td><td>Confidentiality + integrity + server authentication; certificate signed by a trusted CA; check name, dates and chain</td></tr>
<tr><td>Hash vs encrypt</td><td>Hash is one-way and keyless; encryption is reversible with a key</td></tr>
<tr><td>401 vs 403</td><td>401 not authenticated; 403 authenticated but forbidden</td></tr>
<tr><td>SQL injection</td><td>Parameterised queries (prepared statements), validation, least-privilege database account</td></tr>
<tr><td>XSS</td><td>Output encoding, CSP, HttpOnly cookies</td></tr>
<tr><td>CSRF</td><td>Anti-CSRF token, SameSite cookies</td></tr>
<tr><td>SSRF</td><td>Allow-list destinations, egress filtering, block internal ranges</td></tr>
<tr><td>Broken access control</td><td>Server-side check on every object and request, deny by default</td></tr>
<tr><td>Load balancing</td><td>Round robin takes turns; least connections reacts to load; persistence pins a client; health checks remove dead servers</td></tr>
<tr><td>Reverse proxy</td><td>Faces clients, hides backends, terminates TLS (SSL offload)</td></tr>
<tr><td>DNS records</td><td>A IPv4, AAAA IPv6, CNAME alias to a name, MX mail with priority, TXT text (SPF), NS name servers</td></tr>
<tr><td>Timeout vs refused</td><td>Timeout = dropped by a firewall; refused = host reached, no listener</td></tr>
<tr><td>Supply chain</td><td>Scan dependencies and images, pin versions, sign and verify images, keep an SBOM, protect the pipeline</td></tr>
</table>

<h3>Command cheat-sheet for the labs</h3>
<pre class="code">dig +short NAME                       <span class="c"># what does DNS say?</span>
curl NAME                             <span class="c"># does the service answer by name?</span>
nc -zv IP PORT                        <span class="c"># is the port reachable? timeout or refused?</span>
sudo ufw status numbered              <span class="c"># host firewall rules in order</span>
sudo ufw delete allow 8080/tcp        <span class="c"># remove the stale rule</span>
sudo ufw allow 80/tcp                 <span class="c"># allow the real service port</span>
sudo grep "UFW BLOCK" /var/log/ufw.log | tail   <span class="c"># who was dropped, on which DPT</span>
R1(config)# ip host NAME ADDRESS      <span class="c"># A record on the lab DNS router</span>
R1# show hosts                        <span class="c"># list the records</span>
grep -rniE "password|token|secret" .  <span class="c"># hunt for hard-coded secrets</span>
chmod 600 .env                        <span class="c"># private env file</span>
sed -i 's/OLD/NEW/' FILE              <span class="c"># edit a line in place</span>
source .env                           <span class="c"># load variables into the shell</span></pre>

<div class="warn"><p><b>Final cautions.</b> Never disable certificate checks to make something work. Never test a theory by opening everything. Never leave a secret in a file because "it is private". And never treat a tool's silence as proof: prove the good path and the blocked path.</p></div>
<div class="exam"><p><b>Last exam tip.</b> Read the whole question, name the goal at risk (confidentiality, integrity, availability), name the layer or component involved, and then pick the control that fits that layer. Distractors usually offer a control from the wrong layer: a firewall for an injection flaw, encryption for an access-control flaw, or a WAF instead of fixing the code.</p></div>

<div class="scn"><h4>The new engineer's first security review</h4><p>A new network automation engineer was asked to review a colleague's pull request that added a nightly backup job. She went through the checklist in this chapter: no secrets in the diff, token read from the environment, TLS verification on, a read-only API role, a timeout on every request, logs without headers, pinned dependencies with a scan in the pipeline, and a firewall rule limited to the management network. She approved with two comments (add an alert for failed backups, lower the DNS TTL before the planned migration). The job ran for a year without an incident.</p><p><b>Lesson:</b> a short, consistent checklist beats heroic effort.</p></div>

<div class="iv"><p class="q">"How would you summarise application security for an automation engineer in one minute?"</p><p>Protect what you hold (secrets in the environment or a vault, encrypted data and traffic), prove who is calling and limit what they can do (MFA, tokens, least privilege), treat all input as hostile (validate, parameterise, encode), put layers in front of the application (firewall, WAF, load balancer, reverse proxy, correct DNS), keep the supply chain trustworthy (scan, pin, sign), and log enough to notice trouble without logging secrets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security is layered: secrets, identity, input handling, network placement, supply chain and monitoring.</li>
<li>Know the OWASP ideas by symptom and by defence, not by number.</li>
<li>Know the placement and function of firewall, DNS, load balancer, reverse proxy and WAF.</li>
<li>Troubleshoot by layer, fix narrowly, prove both the good and the blocked path.</li>
<li>Next: combine this module with the APIs, platforms and deployment modules of the CCNA Automation track.</li>
</ul></div>
`,hi:`
<p>Ab aapne Cisco 200-901 CCNAAUTO v1.1 exam ke domain 4 ka security wala hissa cover kar liya: application security issues (4.8) aur firewall, DNS, load balancer aur reverse proxy deployment mein kaise fit hote hain (4.9), saath mein secure CI/CD aur secure scripting aadatein. Yeh aakhri chapter revision sheet hai. Exam se ek raat pehle ise padho, aur gaps dhoondhne ke liye checklist use karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Secrets aur data protect</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Identity prove, rights limit</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Input safely handle (OWASP)</text>
<rect x="20" y="95" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">DNS aur firewalls</text>
<rect x="230" y="95" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">LB, proxy, WAF</text>
<rect x="440" y="95" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="13">Secure CI/CD, supply chain</text>
<rect x="120" y="170" width="400" height="44" rx="8" fill="#bae6fd"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">Logging, monitoring, layer se troubleshooting</text>
</svg><p class="cap">Saat areas, ek goal: jo aap deploy karte ho uske chaaron taraf defence in depth.</p></div>

<h3>Can-do checklist</h3>
<p>Aap tab ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>Samjhao ki secrets code ya Git mein kyun nahi hone chahiye, teen behtar jagahein batao aur rotation describe karo.</li>
<li>grep se folder mein hard-coded secrets dhoondho aur protected env file ke saath unhe environment variables mein move karo.</li>
<li>Encoding, encryption aur hashing ka farak samjhao, aur batao passwords kaise store hote hain (salted, slow hash).</li>
<li>Batao TLS kya deta hai, certificate aur CA kya karte hain, aur <code>verify=False</code> galat kyun hai.</li>
<li>Authentication, authorization, MFA factors, sessions, cookie flags, bearer tokens aur JWT define karo, aur batao 401 aur 403 kab milte hain.</li>
<li>Injection, XSS, CSRF, SSRF, broken access control, misconfiguration, vulnerable components aur logging failures ko chhote description se pehchano aur defence batao.</li>
<li>Injection aur XSS ke fix ke roop mein parameterised queries aur output encoding dikhao.</li>
<li>Batao edge firewall, host firewall, load balancer, reverse proxy aur WAF kahan baithte hain aur har ek kya karta hai.</li>
<li>Round robin, least connections aur persistence mein se chuno; health checks aur SSL offload samjhao.</li>
<li>A, AAAA, CNAME, MX aur TXT records padho, TTL aur split-horizon samjhao, aur dig se stale record diagnose karo.</li>
<li>Timeout aur refused ka farak diagnose karo aur firewall rule narrowly fix karo, phir prove karo ki kya blocked rehta hai.</li>
<li>Secure pipeline ke gates list karo aur signing, pinning, scanning aur SBOM samjhao.</li>
<li>Safe automation script ki aadatein likho: env secrets, TLS on, least privilege, validation, timeouts, logs mein secrets nahi.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AuthN / AuthZ</dt><dd>Aap kaun ho sabit karna / aap kya kar sakte ho decide karna.</dd>
<dt>MFA</dt><dd>Alag types ke do ya zyada factors: know, have, are.</dd>
<dt>Bearer token</dt><dd>Authorization header mein credential; jiske paas hai us par bharosa.</dd>
<dt>JWT</dt><dd>Header, claims aur signature wala signed (encrypted nahi) token.</dd>
<dt>Salt</dt><dd>Password mein hashing se pehle mila hua unique random value; secret nahi.</dd>
<dt>TLS</dt><dd>Confidentiality, integrity aur server authentication dene wala protocol; HTTPS matlab TLS par HTTP.</dd>
<dt>CA / certificate</dt><dd>Trusted issuer / naam ko public key se bind karne wala signed document.</dd>
<dt>Least privilege</dt><dd>Sirf kaam ke liye zaroori rights, aur kuch nahi.</dd>
<dt>IDOR</dt><dd>Identifier badalkar object ka access kyunki ownership check nahi hota.</dd>
<dt>WAF</dt><dd>Layer 7 filter jo requests ko attack patterns ke liye inspect karta hai.</dd>
<dt>Reverse proxy</dt><dd>Front end jo client ki taraf se backends se baat karta hai; TLS termination aur routing karta hai.</dd>
<dt>Health check</dt><dd>Probe jo failed servers ko load balancer pool se hatata hai.</dd>
<dt>TTL</dt><dd>DNS jawab kitni der cache ho sakta hai.</dd>
<dt>SBOM</dt><dd>Software ke andar ke components ki list.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Secrets</td><td>Code ya Git mein kabhi nahi; env variable ya secret manager; exposure ke baad rotate; Base64 protection nahi</td></tr>
<tr><td>Passwords</td><td>Salted, slow hash (bcrypt, scrypt, Argon2); kabhi plain text nahi, kabhi reversible encryption nahi</td></tr>
<tr><td>TLS</td><td>Confidentiality + integrity + server authentication; trusted CA se signed certificate; naam, dates aur chain check karo</td></tr>
<tr><td>Hash vs encrypt</td><td>Hash one-way aur keyless; encryption key se reversible</td></tr>
<tr><td>401 vs 403</td><td>401 authenticated nahi; 403 authenticated par forbidden</td></tr>
<tr><td>SQL injection</td><td>Parameterised queries (prepared statements), validation, least-privilege database account</td></tr>
<tr><td>XSS</td><td>Output encoding, CSP, HttpOnly cookies</td></tr>
<tr><td>CSRF</td><td>Anti-CSRF token, SameSite cookies</td></tr>
<tr><td>SSRF</td><td>Destinations ki allow-list, egress filtering, internal ranges block</td></tr>
<tr><td>Broken access control</td><td>Har object aur request par server-side check, default deny</td></tr>
<tr><td>Load balancing</td><td>Round robin baari-baari; least connections load par react; persistence client pin karta hai; health checks mare servers hatate hain</td></tr>
<tr><td>Reverse proxy</td><td>Clients ke samne, backends chhupata hai, TLS terminate karta hai (SSL offload)</td></tr>
<tr><td>DNS records</td><td>A IPv4, AAAA IPv6, CNAME naam ka alias, MX priority ke saath mail, TXT text (SPF), NS name servers</td></tr>
<tr><td>Timeout vs refused</td><td>Timeout = firewall ne drop kiya; refused = host pahunch gaya, listener nahi</td></tr>
<tr><td>Supply chain</td><td>Dependencies aur images scan, versions pin, images sign aur verify, SBOM rakho, pipeline protect karo</td></tr>
</table>

<h3>Labs ke liye command cheat-sheet</h3>
<pre class="code">dig +short NAME                       <span class="c"># DNS kya kehta hai?</span>
curl NAME                             <span class="c"># service naam se jawab deti hai?</span>
nc -zv IP PORT                        <span class="c"># port reachable? timeout ya refused?</span>
sudo ufw status numbered              <span class="c"># host firewall rules order mein</span>
sudo ufw delete allow 8080/tcp        <span class="c"># stale rule hatao</span>
sudo ufw allow 80/tcp                 <span class="c"># asli service port allow</span>
sudo grep "UFW BLOCK" /var/log/ufw.log | tail   <span class="c"># kaun drop hua, kis DPT par</span>
R1(config)# ip host NAME ADDRESS      <span class="c"># lab DNS router par A record</span>
R1# show hosts                        <span class="c"># records ki list</span>
grep -rniE "password|token|secret" .  <span class="c"># hard-coded secrets dhoondho</span>
chmod 600 .env                        <span class="c"># private env file</span>
sed -i 's/OLD/NEW/' FILE              <span class="c"># line in place edit</span>
source .env                           <span class="c"># variables shell mein load</span></pre>

<div class="warn"><p><b>Final cautions.</b> Kuch chalane ke liye certificate checks kabhi band mat karo. Theory test karne ke liye sab kuch mat kholo. "Private hai" soch kar secret file mein mat chhodo. Aur tool ki khamoshi ko proof mat maano: good path aur blocked path dono prove karo.</p></div>
<div class="exam"><p><b>Last exam tip.</b> Poora question padho, risk mein jo goal hai (confidentiality, integrity, availability) uska naam lo, involved layer ya component ka naam lo, phir us layer ke hisaab ka control chuno. Distractors aksar galat layer ka control dete hain: injection flaw ke liye firewall, access-control flaw ke liye encryption, ya code fix karne ki jagah WAF.</p></div>

<div class="scn"><h4>Naye engineer ka pehla security review</h4><p>Ek naye network automation engineer se kaha gaya ki colleague ka pull request review kare jisme nightly backup job joda gaya tha. Usne is chapter ki checklist chalayi: diff mein secrets nahi, token environment se, TLS verification on, read-only API role, har request par timeout, logs mein headers nahi, pinned dependencies aur pipeline mein scan, aur management network tak limited firewall rule. Usne do comments ke saath approve kiya (failed backups ke liye alert jodo, planned migration se pehle DNS TTL kam karo). Job ek saal bina incident ke chala.</p><p><b>Lesson:</b> chhoti, consistent checklist heroic mehnat se behtar hai.</p></div>

<div class="iv"><p class="q">"Automation engineer ke liye application security ek minute mein kaise summarise karoge?"</p><p>Jo aapke paas hai use protect karo (environment ya vault mein secrets, encrypted data aur traffic), prove karo kaun call kar raha hai aur kya kar sakta hai limit karo (MFA, tokens, least privilege), saare input ko hostile maano (validate, parameterise, encode), application ke aage layers lagao (firewall, WAF, load balancer, reverse proxy, sahi DNS), supply chain bharosemand rakho (scan, pin, sign), aur itna log karo ki musibat notice ho bina secrets log kiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security layered hai: secrets, identity, input handling, network placement, supply chain aur monitoring.</li>
<li>OWASP ideas ko symptom aur defence se jaano, number se nahi.</li>
<li>Firewall, DNS, load balancer, reverse proxy aur WAF ki placement aur function jaano.</li>
<li>Layer se troubleshoot karo, narrowly fix karo, good aur blocked dono path prove karo.</li>
<li>Aage: is module ko CCNA Automation track ke APIs, platforms aur deployment modules ke saath jodo.</li>
</ul></div>
`}};export{e as default};