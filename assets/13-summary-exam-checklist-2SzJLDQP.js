var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before every flight, a pilot runs through a checklist even after ten thousand hours in the air. Not because they have forgotten how to fly, but because a checklist catches the one item a busy brain skips. Use this chapter the same way: as your pre-flight check before the labs, the SCOR 350-701 exam and the interview. Every line points back to a chapter where the full explanation lives.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="10" y="20" width="148" height="80" rx="10" fill="#fed7aa"/><text x="84" y="48" text-anchor="middle" class="svg-ink" font-size="14">Know the threats</text><text x="84" y="68" text-anchor="middle" class="svg-muted" font-size="12">landscape, OWASP</text><text x="84" y="86" text-anchor="middle" class="svg-muted" font-size="12">LLM, phishing (1,2,5-7)</text>
<rect x="168" y="20" width="148" height="80" rx="10" fill="#fde68a"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="14">Measure, prioritise</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="12">CVE, CVSS 3.1/4.0</text><text x="242" y="86" text-anchor="middle" class="svg-muted" font-size="12">EPSS, KEV (3,4)</text>
<rect x="326" y="20" width="148" height="80" rx="10" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="14">Share, architect</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">Talos, STIX/TAXII</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">zero trust, SAFE (8-10)</text>
<rect x="484" y="20" width="146" height="80" rx="10" fill="#bae6fd"/><text x="557" y="48" text-anchor="middle" class="svg-ink" font-size="14">Automate, fix</text><text x="557" y="68" text-anchor="middle" class="svg-muted" font-size="12">Python + APIs</text><text x="557" y="86" text-anchor="middle" class="svg-muted" font-size="12">troubleshoot (11,12)</text>
<line x1="158" y1="60" x2="168" y2="60" stroke="#64748b" stroke-width="2"/><line x1="316" y1="60" x2="326" y2="60" stroke="#64748b" stroke-width="2"/><line x1="474" y1="60" x2="484" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="14">Defender's loop: recognise, prioritise, block, verify, share</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Lab 1 = prioritise and triage; Lab 2 = automate the block through the API</text>
</svg><p class="cap">The whole module in one picture: understand the threat, measure it, place controls in an architecture, then automate and verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can define threat, vulnerability, exploit and risk, and name today's main threats: ransomware with extortion, supply chain, edge-device exploitation, identity attacks, AI-enabled and AI-targeted attacks, and "harvest now, decrypt later".</li>
<li>I can explain SQL injection, XSS, CSRF, path traversal, buffer overflow and SSRF with one fix each, and map a finding to the OWASP Top 10 2021 category.</li>
<li>I can read a CVSS v3.1 vector, compute a base score by hand (VUL-103 = 8.1) and name the severity band.</li>
<li>I can explain temporal and environmental metrics, what CVSS v4.0 changed, and why EPSS and KEV matter more than the base score for urgency.</li>
<li>I can list the OWASP Top 10 for LLM Applications (2025) and explain direct and indirect prompt injection, data poisoning, model extraction, improper output handling and excessive agency, with controls for each.</li>
<li>I can read SPF, DKIM and DMARC results in a header and decide whether a reported message is phishing.</li>
<li>I can explain IOCs versus TTPs, STIX versus TAXII, TLP labels and the role of Cisco Talos.</li>
<li>I can draw the NIST SP 800-207 components (PE, PA, PEP) and map Cisco products to the workforce, workload and workplace pillars.</li>
<li>I can explain the SAFE Key: places in the network times secure domains.</li>
<li>I can read a Python script and say where it connects, how it authenticates, which method and body it sends, and what it prints.</li>
<li>I can map an API error (ConnectionError, SSLError, 400, 401, 403, 404, 429) to its layer and first check.</li>
<li>I can complete both labs without hints.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CVE / CWE</dt><dd>The ID of one specific flaw / the type of weakness behind it.</dd>
<dt>CVSS</dt><dd>Technical severity 0 to 10 from a vector; not the same as risk.</dd>
<dt>EPSS</dt><dd>Probability (0 to 1) that a CVE is exploited in the next 30 days.</dd>
<dt>KEV</dt><dd>CISA catalog of vulnerabilities with confirmed exploitation in the wild.</dd>
<dt>Prompt injection</dt><dd>Instructions in input (direct) or in content the model reads (indirect) that override the developer's intent.</dd>
<dt>Excessive agency</dt><dd>An AI agent holding more tools or permissions than its task needs.</dd>
<dt>DMARC</dt><dd>Policy (none, quarantine, reject) and reporting when SPF or DKIM do not align with the From domain.</dd>
<dt>STIX / TAXII</dt><dd>JSON language for threat intel / REST transport that carries it in collections.</dd>
<dt>TLP</dt><dd>Sharing label: RED, AMBER+STRICT, AMBER, GREEN, CLEAR.</dd>
<dt>PDP / PEP</dt><dd>Policy Decision Point (Policy Engine + Policy Administrator) / Policy Enforcement Point in the data path.</dd>
<dt>SAFE</dt><dd>Cisco security reference architecture: places in the network and secure domains.</dd>
<dt>Bearer token</dt><dd>Short-lived credential sent as <code>Authorization: Bearer ...</code> after an OAuth grant.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>CVSS bands</td><td>Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0</td></tr>
<tr><td>Classic network RCE</td><td>AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8; with S:C = 10.0</td></tr>
<tr><td>CVSS v4.0</td><td>Base, Threat, Environmental, Supplemental; adds AT; removes Scope; VC/VI/VA and SC/SI/SA</td></tr>
<tr><td>Priority order</td><td>KEV and exposure first, then EPSS, CVSS as tie-breaker, compensating controls meanwhile</td></tr>
<tr><td>OWASP 2021</td><td>A01 Broken Access Control, A03 Injection includes XSS, A10 SSRF</td></tr>
<tr><td>OWASP LLM 2025</td><td>LLM01 Prompt Injection ... LLM05 Improper Output Handling, LLM06 Excessive Agency ... LLM10 Unbounded Consumption</td></tr>
<tr><td>Zero trust</td><td>PE decides, PA executes, PEP enforces; per session; assume breach</td></tr>
<tr><td>SAFE PINs</td><td>branch, campus, data center, edge, cloud, WAN</td></tr>
<tr><td>SAFE domains</td><td>management, security intelligence, compliance, segmentation, threat defense, secure services</td></tr>
<tr><td>API auth</td><td>Secure Access: OAuth client_credentials, Bearer. FMC: X-auth-access-token header, domain UUID in path</td></tr>
<tr><td>Status codes</td><td>401 who are you, 403 you may not, 404 wrong ID, 429 slow down</td></tr>
</table>

<h3>Cheat-sheet: reading an API script</h3>
<pre class="code"><span class="c"># 1 where: base address kept in variables</span>
BASE = f"{SCHEME}://{HOST}"
<span class="c"># 2 how authenticated: key + secret as Basic, form body</span>
r = requests.post(f"{BASE}/auth/v2/token", auth=(CLIENT_ID, CLIENT_SECRET),
                  data={"grant_type": "client_credentials"})
<span class="c"># 3 method + 4 body: POST adds, json= sends JSON</span>
hdr = {"Authorization": f"Bearer {token}"}
r = requests.post(f"{BASE}/policies/v2/destinationlists/17749231/destinations",
                  json=[{"destination": DOMAIN}], headers=hdr)
<span class="c"># 5 output: which keys are printed</span>
print(r.status_code, r.json()["data"]["meta"]["destinationCount"])</pre>

<div class="eg"><p><b>Both labs, final state.</b></p>
<pre class="out">VULN-MGMT  Findings
VUL-101  vpn-gw-01   9.8 Critical  EPSS 0.94  KEV Yes  <span class="hl">P1  CHG-5100  Due 48 hours</span>
VUL-102  ci-02      10.0 Critical  EPSS 0.97  KEV Yes  P2
VUL-104  print-01    7.8 High      EPSS 0.02  KEV No   (not P1)
Reported Phishing
PH-7781  <span class="hl">phishing  Blocked sender domains: nwkings-payro11.example</span>
PH-7782  legitimate

AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
POST .../destinationlists/17749231/destinations -&gt; <span class="hl">200</span></pre>
<p>Lab answers: 8.1; A03:2021 Injection; nwkings-payro11.example; client_credentials; 17749231; Authorization; X-auth-access-token.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Patching in CVSS order. Treating a lookalike domain that passes its own SPF as safe. Letting an AI agent send mail or run commands without approval. Importing IOCs with no expiry. Calling one product "zero trust". Hard-coding API secrets in scripts or fixing TLS errors with <code>verify=False</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> A 10.0 internal finding can rank below a 9.8 internet-facing KEV entry. EPSS predicts, KEV confirms. "Insecure Output Handling" and "Model Theft" are the 2023 LLM names. STIX is content, TAXII is transport. The FMC token is read from a <b>response header</b>, not the JSON body. Before, during, after is the attack continuum, not the SAFE Key.</p></div>

<div class="scn"><h4>One Monday, the whole module</h4><p>A SOC analyst starts the week with a scanner import, three user reports of a payroll e-mail and a Talos advisory about a VPN flaw now listed in KEV. She scores the one unscored finding, ranks the VPN gateway P1 because it is internet-facing and in KEV, purges the lookalike payroll mail and blocks its domain, writes a STIX indicator for the C2 domain found on one laptop, shares it with the sector ISAC as TLP:AMBER, and pushes the domain into the Secure Access block list with a script. When the script returns 401, she tests the token call on its own and finds a rotated key.</p><p><b>Lesson:</b> the topics are one workflow, not separate facts; interviewers love candidates who can connect them.</p></div>

<div class="iv"><p class="q">"You have 2,000 open findings and one change window. How do you decide what to fix tonight?"</p><p>Filter by exploitation evidence first (KEV, then high EPSS), then by exposure and asset criticality, and use CVSS as the tie-breaker. Name compensating controls for what must wait: an IPS signature, a WAF rule, disabling a feature, segmentation. Mention SSVC as a formal decision tree, ticketing with due dates, and verifying the fix with a rescan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: know the modern landscape, OWASP web risks and the OWASP LLM Top 10 at concept level, with one control each.</li>
<li>Prioritise with KEV, exposure and EPSS; CVSS measures severity, not urgency.</li>
<li>Phishing triage reads From, Reply-To, SPF, DKIM and DMARC; act with purge and block.</li>
<li>Zero trust (PE, PA, PEP) and SAFE (PINs x secure domains) are architectures, not products.</li>
<li>Read scripts in five steps and map API errors to layers; the labs test both.</li>
</ul></div>
`,hi:`
<p>Har flight se pehle pilot checklist chalata hai, das hazaar ghante udaan ke baad bhi. Isliye nahi ki woh udna bhool gaya, balki isliye ki checklist woh ek item pakad leti hai jo busy dimaag chhod deta hai. Is chapter ko waise hi use karo: labs, SCOR 350-701 exam aur interview se pehle apna pre-flight check. Har line us chapter ki taraf ishara karti hai jahan poori explanation hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module map">
<rect x="10" y="20" width="148" height="80" rx="10" fill="#fed7aa"/><text x="84" y="48" text-anchor="middle" class="svg-ink" font-size="14">Threats samjho</text><text x="84" y="68" text-anchor="middle" class="svg-muted" font-size="12">landscape, OWASP</text><text x="84" y="86" text-anchor="middle" class="svg-muted" font-size="12">LLM, phishing (1,2,5-7)</text>
<rect x="168" y="20" width="148" height="80" rx="10" fill="#fde68a"/><text x="242" y="48" text-anchor="middle" class="svg-ink" font-size="14">Naapo, prioritise</text><text x="242" y="68" text-anchor="middle" class="svg-muted" font-size="12">CVE, CVSS 3.1/4.0</text><text x="242" y="86" text-anchor="middle" class="svg-muted" font-size="12">EPSS, KEV (3,4)</text>
<rect x="326" y="20" width="148" height="80" rx="10" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="14">Share, architect</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">Talos, STIX/TAXII</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">zero trust, SAFE (8-10)</text>
<rect x="484" y="20" width="146" height="80" rx="10" fill="#bae6fd"/><text x="557" y="48" text-anchor="middle" class="svg-ink" font-size="14">Automate, fix</text><text x="557" y="68" text-anchor="middle" class="svg-muted" font-size="12">Python + APIs</text><text x="557" y="86" text-anchor="middle" class="svg-muted" font-size="12">troubleshoot (11,12)</text>
<line x1="158" y1="60" x2="168" y2="60" stroke="#64748b" stroke-width="2"/><line x1="316" y1="60" x2="326" y2="60" stroke="#64748b" stroke-width="2"/><line x1="474" y1="60" x2="484" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="14">Defender ka loop: pehchano, prioritise, block, verify, share</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Lab 1 = prioritise aur triage; Lab 2 = API se block automate</text>
</svg><p class="cap">Poora module ek picture mein: threat samjho, use naapo, architecture mein controls rakho, phir automate aur verify karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main threat, vulnerability, exploit aur risk define kar sakta hoon, aur aaj ke main threats bata sakta hoon: extortion wala ransomware, supply chain, edge-device exploitation, identity attacks, AI-enabled aur AI-targeted attacks, aur "harvest now, decrypt later".</li>
<li>Main SQL injection, XSS, CSRF, path traversal, buffer overflow aur SSRF har ek ke ek fix ke saath samjha sakta hoon, aur finding ko OWASP Top 10 2021 category se map kar sakta hoon.</li>
<li>Main CVSS v3.1 vector padh sakta hoon, base score haath se nikaal sakta hoon (VUL-103 = 8.1) aur severity band bata sakta hoon.</li>
<li>Main temporal aur environmental metrics, CVSS v4.0 mein kya badla, aur urgency ke liye EPSS aur KEV base score se zyada kyun maayne rakhte hain, samjha sakta hoon.</li>
<li>Main OWASP Top 10 for LLM Applications (2025) list kar sakta hoon aur direct aur indirect prompt injection, data poisoning, model extraction, improper output handling aur excessive agency har ek ke controls ke saath samjha sakta hoon.</li>
<li>Main header mein SPF, DKIM aur DMARC results padh kar decide kar sakta hoon ki reported message phishing hai ya nahi.</li>
<li>Main IOCs vs TTPs, STIX vs TAXII, TLP labels aur Cisco Talos ka role samjha sakta hoon.</li>
<li>Main NIST SP 800-207 components (PE, PA, PEP) draw kar sakta hoon aur Cisco products ko workforce, workload aur workplace pillars se map kar sakta hoon.</li>
<li>Main SAFE Key samjha sakta hoon: places in the network guna secure domains.</li>
<li>Main Python script padh kar bata sakta hoon woh kahan connect karti hai, kaise authenticate karti hai, kaunsa method aur body bhejti hai, aur kya print karti hai.</li>
<li>Main API error (ConnectionError, SSLError, 400, 401, 403, 404, 429) ko uski layer aur pehle check se map kar sakta hoon.</li>
<li>Main dono labs bina hints ke poore kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CVE / CWE</dt><dd>Ek specific flaw ki ID / uske peeche weakness ka type.</dd>
<dt>CVSS</dt><dd>Vector se 0 se 10 tak technical severity; risk ke barabar nahi.</dd>
<dt>EPSS</dt><dd>Probability (0 se 1) ki CVE agle 30 din mein exploit hogi.</dd>
<dt>KEV</dt><dd>CISA ka catalog un vulnerabilities ka jinka wild mein exploitation confirm hai.</dd>
<dt>Prompt injection</dt><dd>Input mein (direct) ya model ke padhe content mein (indirect) instructions jo developer ka irada override kar dein.</dd>
<dt>Excessive agency</dt><dd>AI agent ke paas task ki zaroorat se zyada tools ya permissions.</dd>
<dt>DMARC</dt><dd>Jab SPF ya DKIM From domain se align na ho to policy (none, quarantine, reject) aur reporting.</dd>
<dt>STIX / TAXII</dt><dd>Threat intel ki JSON bhasha / REST transport jo use collections mein le jaata hai.</dd>
<dt>TLP</dt><dd>Sharing label: RED, AMBER+STRICT, AMBER, GREEN, CLEAR.</dd>
<dt>PDP / PEP</dt><dd>Policy Decision Point (Policy Engine + Policy Administrator) / data path mein Policy Enforcement Point.</dd>
<dt>SAFE</dt><dd>Cisco security reference architecture: places in the network aur secure domains.</dd>
<dt>Bearer token</dt><dd>OAuth grant ke baad short-lived credential jo <code>Authorization: Bearer ...</code> ke roop mein bheja jaata hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>CVSS bands</td><td>Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0</td></tr>
<tr><td>Classic network RCE</td><td>AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8; S:C ke saath = 10.0</td></tr>
<tr><td>CVSS v4.0</td><td>Base, Threat, Environmental, Supplemental; AT jodta hai; Scope hatata hai; VC/VI/VA aur SC/SI/SA</td></tr>
<tr><td>Priority order</td><td>Pehle KEV aur exposure, phir EPSS, CVSS tie-breaker, beech mein compensating controls</td></tr>
<tr><td>OWASP 2021</td><td>A01 Broken Access Control, A03 Injection mein XSS shaamil, A10 SSRF</td></tr>
<tr><td>OWASP LLM 2025</td><td>LLM01 Prompt Injection ... LLM05 Improper Output Handling, LLM06 Excessive Agency ... LLM10 Unbounded Consumption</td></tr>
<tr><td>Zero trust</td><td>PE decide karta hai, PA execute karta hai, PEP enforce karta hai; per session; assume breach</td></tr>
<tr><td>SAFE PINs</td><td>branch, campus, data center, edge, cloud, WAN</td></tr>
<tr><td>SAFE domains</td><td>management, security intelligence, compliance, segmentation, threat defense, secure services</td></tr>
<tr><td>API auth</td><td>Secure Access: OAuth client_credentials, Bearer. FMC: X-auth-access-token header, path mein domain UUID</td></tr>
<tr><td>Status codes</td><td>401 aap kaun ho, 403 aap nahi kar sakte, 404 galat ID, 429 dheere chalo</td></tr>
</table>

<h3>Cheat-sheet: API script padhna</h3>
<pre class="code"><span class="c"># 1 kahan: base address variables mein</span>
BASE = f"{SCHEME}://{HOST}"
<span class="c"># 2 kaise authenticated: key + secret Basic ke roop mein, form body</span>
r = requests.post(f"{BASE}/auth/v2/token", auth=(CLIENT_ID, CLIENT_SECRET),
                  data={"grant_type": "client_credentials"})
<span class="c"># 3 method + 4 body: POST jodta hai, json= JSON bhejta hai</span>
hdr = {"Authorization": f"Bearer {token}"}
r = requests.post(f"{BASE}/policies/v2/destinationlists/17749231/destinations",
                  json=[{"destination": DOMAIN}], headers=hdr)
<span class="c"># 5 output: kaunsi keys print hoti hain</span>
print(r.status_code, r.json()["data"]["meta"]["destinationCount"])</pre>

<div class="eg"><p><b>Dono labs, final state.</b></p>
<pre class="out">VULN-MGMT  Findings
VUL-101  vpn-gw-01   9.8 Critical  EPSS 0.94  KEV Yes  <span class="hl">P1  CHG-5100  Due 48 hours</span>
VUL-102  ci-02      10.0 Critical  EPSS 0.97  KEV Yes  P2
VUL-104  print-01    7.8 High      EPSS 0.02  KEV No   (not P1)
Reported Phishing
PH-7781  <span class="hl">phishing  Blocked sender domains: nwkings-payro11.example</span>
PH-7782  legitimate

AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
POST .../destinationlists/17749231/destinations -&gt; <span class="hl">200</span></pre>
<p>Lab answers: 8.1; A03:2021 Injection; nwkings-payro11.example; client_credentials; 17749231; Authorization; X-auth-access-token.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> CVSS order mein patch karna. Apna SPF pass karne wale lookalike domain ko safe maanna. AI agent ko bina approval mail bhejne ya commands chalane dena. Bina expiry ke IOCs import karna. Ek product ko "zero trust" kehna. Scripts mein API secrets hard-code karna ya TLS errors ko <code>verify=False</code> se fix karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> 10.0 wali internal finding 9.8 wali internet-facing KEV entry se neeche rank ho sakti hai. EPSS predict karta hai, KEV confirm karta hai. "Insecure Output Handling" aur "Model Theft" 2023 ke LLM naam hain. STIX content hai, TAXII transport. FMC token <b>response header</b> se padha jaata hai, JSON body se nahi. Before, during, after attack continuum hai, SAFE Key nahi.</p></div>

<div class="scn"><h4>Ek Monday, poora module</h4><p>Ek SOC analyst hafta shuru karti hai scanner import, payroll e-mail ke teen user reports aur ek Talos advisory ke saath jo VPN flaw ke baare mein hai jo ab KEV mein listed hai. Woh ek unscored finding ko score karti hai, VPN gateway ko P1 rank karti hai kyunki woh internet-facing aur KEV mein hai, lookalike payroll mail purge karke uska domain block karti hai, ek laptop par mile C2 domain ke liye STIX indicator likhti hai, use sector ISAC ke saath TLP:AMBER ke roop mein share karti hai, aur script se domain ko Secure Access block list mein daalti hai. Jab script 401 lautati hai, woh token call akele test karti hai aur rotate hui key pakad leti hai.</p><p><b>Seekh:</b> yeh topics alag facts nahi, ek workflow hain; interviewers un candidates ko pasand karte hain jo inhe jod sakein.</p></div>

<div class="iv"><p class="q">"Aapke paas 2,000 open findings aur ek change window hai. Aaj raat kya fix karna hai kaise decide karoge?"</p><p>Pehle exploitation evidence se filter karo (KEV, phir high EPSS), phir exposure aur asset criticality se, aur CVSS ko tie-breaker rakho. Jo ruk sakta hai uske liye compensating controls batao: IPS signature, WAF rule, feature disable karna, segmentation. SSVC ko formal decision tree ke roop mein, due dates ke saath ticketing, aur rescan se fix verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: modern landscape, OWASP web risks aur OWASP LLM Top 10 concept level par jaano, har ek ke ek control ke saath.</li>
<li>KEV, exposure aur EPSS se prioritise karo; CVSS severity naapta hai, urgency nahi.</li>
<li>Phishing triage From, Reply-To, SPF, DKIM aur DMARC padhta hai; purge aur block se action lo.</li>
<li>Zero trust (PE, PA, PEP) aur SAFE (PINs x secure domains) architectures hain, products nahi.</li>
<li>Scripts paanch steps mein padho aur API errors ko layers se map karo; labs dono test karte hain.</li>
</ul></div>
`}};export{e as default};