var e={id:`cisco-xdr`,h:{en:`Cisco XDR: incidents, observables, investigations and response (lab walk-through)`,hi:`Cisco XDR: incidents, observables, investigations aur response (lab walk-through)`},body:{en:`
<p>In detective films there is always a wall covered with photos, maps and receipts, with red string connecting them. Each item alone means little: a car seen near a bank, a phone call, a hotel bill. The string is what turns them into a case. <b>Cisco XDR</b> is that wall for a security team. It pulls detections from many products, ties the related ones together into one <b>incident</b>, and puts the response buttons right next to the evidence.</p>

<h3>EDR, XDR, SIEM, SOAR: who does what</h3>
<table class="cmp"><tr><th>Tool type</th><th>Sees</th><th>Main job</th><th>Cisco / Splunk example</th></tr>
<tr><td>EDR</td><td>One layer: endpoints</td><td>Detect and respond on hosts (isolate, quarantine)</td><td>Secure Endpoint</td></tr>
<tr><td>XDR</td><td>Many security products: endpoint, network, email, DNS, identity, cloud</td><td>Correlate detections into prioritised incidents and respond across products</td><td>Cisco XDR</td></tr>
<tr><td>SIEM</td><td>Any log source, security or not</td><td>Collect, store, search, correlate and report; compliance retention</td><td>Splunk Enterprise Security</td></tr>
<tr><td>SOAR</td><td>Alerts and incidents from other tools</td><td>Automate response with playbooks and integrations</td><td>Splunk SOAR, XDR Automation</td></tr></table>
<p>The lines blur in real products, but the exam expects this split: XDR is detection-centric correlation with built-in response; SIEM is log-centric search and retention; SOAR is automation.</p>

<h3>The XDR vocabulary</h3>
<dl class="terms">
<dt>Detection</dt><dd>A single alert from one product, such as a malware conviction from Secure Endpoint or an intrusion event from the firewall.</dd>
<dt>Incident</dt><dd>A group of related detections that XDR believes are one attack, with a title, severity or priority, status and timeline.</dd>
<dt>Priority</dt><dd>XDR scores incidents by combining how dangerous the detections are with how valuable the affected assets are, so a domain controller ranks above a test laptop.</dd>
<dt>Observable</dt><dd>A concrete artefact: IP address, domain, URL, file SHA-256, host name, email address, user.</dd>
<dt>Target</dt><dd>An asset of yours that is affected: the host or user the attack is against.</dd>
<dt>Disposition and enrichment</dt><dd>Each observable is looked up in threat intelligence (Talos and integrated sources) and marked malicious, suspicious, clean or unknown.</dd>
<dt>Investigation</dt><dd>A graph view where you pivot from one observable to everything related: which other hosts resolved this domain, where else this file was seen.</dd>
<dt>Response action</dt><dd>An action executed through an integrated product: isolate a host (Secure Endpoint), block a domain or URL (Umbrella / Secure Access), block an IP (firewall), add a file hash to a custom detection list, remove an email.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="XDR correlation into an incident">
<rect x="10" y="20" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="12">Secure Endpoint</text>
<rect x="10" y="75" width="160" height="40" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="12">Secure Firewall</text>
<rect x="10" y="130" width="160" height="40" rx="8" fill="#fde68a"/><text x="90" y="155" text-anchor="middle" class="svg-ink" font-size="12">DNS / Umbrella</text>
<rect x="10" y="185" width="160" height="40" rx="8" fill="#e2e8f0"/><text x="90" y="210" text-anchor="middle" class="svg-ink" font-size="12">Email, Duo, NetFlow</text>
<rect x="240" y="80" width="160" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Cisco XDR</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">correlate, enrich,</text><text x="320" y="147" text-anchor="middle" class="svg-muted" font-size="12">prioritise</text>
<line x1="170" y1="40" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="95" x2="240" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="150" x2="240" y2="135" stroke="#64748b" stroke-width="2"/><line x1="170" y1="205" x2="240" y2="155" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="60" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="13">INC-2001</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="11">Critical, 4 observables</text>
<rect x="470" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="162" text-anchor="middle" class="svg-ink" font-size="13">Response</text><text x="550" y="180" text-anchor="middle" class="svg-muted" font-size="11">isolate, block, quarantine</text>
<line x1="400" y1="115" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="550" y1="110" x2="550" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Detections from several products become one incident; response actions are sent back through those products.</p></div>

<h3>Lab walk-through: investigate INC-2001 and contain it</h3>
<p>Open <b>Cisco XDR → Incidents</b> and click the row for INC-2001. The detail panel shows:</p>
<pre class="out">INC-2001 — Malware + C2 beacon on PC-WS1
Verdict: Malicious · Status: New
Observables
  PC-WS1   W32.Ransom.Rans:Trojan   <span class="hl">c2.badexfil.top</span>   203.0.113.66
Correlated events
  11:19:40 · Secure Endpoint: W32.Ransom.Rans:Trojan on PC-WS1
  11:20:02 · Secure Firewall: Outbound SSL beacon to c2.badexfil.top</pre>
<p>Read it like an analyst. Two different products saw two different things 22 seconds apart on the same host: the endpoint convicted a ransomware family, and the firewall saw the same host open an encrypted session to an external domain. Together they mean the malware is running and calling its command-and-control server. The C2 observable you are asked for is <code>c2.badexfil.top</code> (203.0.113.66 is the address it resolved to).</p>
<ol>
<li><b>Contain the host.</b> In the Response section click <b>Isolate PC-WS1</b>. XDR sends the request to Secure Endpoint, which isolates the connector: the host keeps its management channel to the cloud but loses all other network access. On PC-WS1, <code>ping 203.0.113.9</code> now times out.</li>
<li><b>Block the C2 domain.</b> Click <b>Block domain</b> and enter <code>c2.badexfil.top</code>. Other infected hosts, if any, can no longer reach it.</li>
<li><b>Confirm.</b> The incident's action list shows "Isolated host PC-WS1" and the domain block, and the status changes to <b>Contained</b>. <b>Cisco XDR → Automation</b> shows the same actions in its action log, with time and target.</li>
</ol>
<p>Containment is not the end. Next steps outside the lab would be: scope (did any other host talk to 203.0.113.66?), eradicate (reimage or clean PC-WS1), recover, and write the report. The <b>Quarantine files</b> button is the third response: it quarantines the convicted file on the host.</p>

<h3>Automation: when nobody is awake</h3>
<p>XDR <b>Automation</b> runs workflows on triggers such as "incident created". In the lab the Automation page has one switch: <i>Auto-contain: on a Critical/High incident, isolate the host and block the C2 domain automatically</i>. When it is on, a new malware incident is contained in seconds; when it is off, detections are only logged. The same switch appears as the containment playbook on the Splunk SOAR page, because in a real SOC the SIEM/SOAR and XDR share the response plumbing.</p>

<div class="eg"><p><b>Worked example: time matters.</b> Ransomware typically starts encrypting within minutes of its first beacon. Manual handling at night: alert at 02:10, analyst paged, logged in and isolating at 02:45, 35 minutes of encryption. With auto-contain for Critical incidents: isolation at 02:10:30, about 30 seconds. That is why mature teams automate the first containment step for high-confidence verdicts and keep humans for scoping and recovery.</p></div>

<div class="warn"><p><b>Common mistake.</b> Automating isolation for every severity, or for critical servers without an agreed exception. Isolating a database server on a low-confidence alert can cause a bigger outage than the threat. Automate for high-confidence, high-severity incidents on workstations; route servers to a human approval step.</p></div>

<div class="exam"><p><b>Exam trap.</b> XDR does not isolate hosts or block domains by itself; it orchestrates the integrated products (Secure Endpoint isolates, Umbrella or Secure Access blocks domains, the firewall blocks IPs). Observables are the pivots for investigation and the targets of response actions. An incident groups several detections.</p></div>

<div class="scn"><h4>The playbook that never fired</h4><p>A Critical malware incident appeared in XDR at 23:40, but nothing was contained until the morning shift. The SOC had expected automatic isolation. The Automation page showed the auto-contain workflow switched off since a test two weeks earlier. The host had encrypted one shared folder. The team re-enabled the workflow, added a weekly check of automation status to the shift checklist, and restored the folder from backup.</p><p><b>Lesson:</b> automatic response only works when it is armed; verify automation like any other control.</p></div>

<div class="iv"><p class="q">"What does XDR give you that EDR alone does not?"</p><p>Strong answer: EDR sees only the endpoint. XDR correlates detections from endpoint, firewall, DNS, email, identity and network analytics into one prioritised incident with its observables, enriches them with threat intelligence, lets you pivot across all products in an investigation graph, and launches response actions through each integrated product from one place, including automated workflows. Mention reduced alert fatigue and faster containment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EDR is one layer; XDR correlates many security products into incidents; SIEM searches all logs; SOAR automates.</li>
<li>Key XDR terms: detection, incident, priority, observable, target, disposition, investigation, response action.</li>
<li>Response actions run through integrated products: isolate (Secure Endpoint), block domain (Umbrella / Secure Access), block IP (firewall).</li>
<li>Lab: INC-2001 links a ransomware conviction and a firewall beacon; isolate PC-WS1, block c2.badexfil.top, status Contained.</li>
<li>Automation contains in seconds, but only when armed and scoped to high-confidence incidents.</li>
</ul></div>
`,hi:`
<p>Detective films mein hamesha ek deewar hoti hai jo photos, maps aur receipts se bhari hoti hai, laal dhaage se judi hui. Har cheez akeli kam matlab rakhti hai: bank ke paas dikhi ek car, ek phone call, ek hotel bill. Dhaaga hi unhe ek case banata hai. <b>Cisco XDR</b> security team ke liye wahi deewar hai. Yeh kai products se detections kheenchta hai, related wali ko ek <b>incident</b> mein jodta hai, aur response buttons evidence ke bilkul paas rakhta hai.</p>

<h3>EDR, XDR, SIEM, SOAR: kaun kya karta hai</h3>
<table class="cmp"><tr><th>Tool type</th><th>Kya dekhta hai</th><th>Main kaam</th><th>Cisco / Splunk example</th></tr>
<tr><td>EDR</td><td>Ek layer: endpoints</td><td>Hosts par detect aur respond (isolate, quarantine)</td><td>Secure Endpoint</td></tr>
<tr><td>XDR</td><td>Kai security products: endpoint, network, email, DNS, identity, cloud</td><td>Detections ko prioritised incidents mein correlate karna aur products ke across respond karna</td><td>Cisco XDR</td></tr>
<tr><td>SIEM</td><td>Koi bhi log source, security ho ya nahi</td><td>Collect, store, search, correlate aur report; compliance retention</td><td>Splunk Enterprise Security</td></tr>
<tr><td>SOAR</td><td>Doosre tools ke alerts aur incidents</td><td>Playbooks aur integrations se response automate karna</td><td>Splunk SOAR, XDR Automation</td></tr></table>
<p>Real products mein lines dhundhli ho jaati hain, par exam yeh split expect karta hai: XDR built-in response ke saath detection-centric correlation hai; SIEM log-centric search aur retention hai; SOAR automation hai.</p>

<h3>XDR vocabulary</h3>
<dl class="terms">
<dt>Detection</dt><dd>Ek product ka ek alert, jaise Secure Endpoint ka malware conviction ya firewall ka intrusion event.</dd>
<dt>Incident</dt><dd>Related detections ka group jise XDR ek attack maanta hai, title, severity ya priority, status aur timeline ke saath.</dd>
<dt>Priority</dt><dd>XDR incidents ko score karta hai yeh jodkar ki detections kitni khatarnak hain aur affected assets kitne valuable hain, isliye domain controller test laptop se upar rank karta hai.</dd>
<dt>Observable</dt><dd>Ek concrete artefact: IP address, domain, URL, file SHA-256, host name, email address, user.</dd>
<dt>Target</dt><dd>Aapka woh asset jo affected hai: woh host ya user jiske against attack hai.</dd>
<dt>Disposition aur enrichment</dt><dd>Har observable threat intelligence (Talos aur integrated sources) mein dekha jaata hai aur malicious, suspicious, clean ya unknown mark hota hai.</dd>
<dt>Investigation</dt><dd>Graph view jahan aap ek observable se har related cheez tak pivot karte ho: kin doosre hosts ne yeh domain resolve kiya, yeh file aur kahan dikhi.</dd>
<dt>Response action</dt><dd>Integrated product ke through chalaya gaya action: host isolate (Secure Endpoint), domain ya URL block (Umbrella / Secure Access), IP block (firewall), file hash custom detection list mein jodna, email hatana.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="XDR correlation into an incident">
<rect x="10" y="20" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="45" text-anchor="middle" class="svg-ink" font-size="12">Secure Endpoint</text>
<rect x="10" y="75" width="160" height="40" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="12">Secure Firewall</text>
<rect x="10" y="130" width="160" height="40" rx="8" fill="#fde68a"/><text x="90" y="155" text-anchor="middle" class="svg-ink" font-size="12">DNS / Umbrella</text>
<rect x="10" y="185" width="160" height="40" rx="8" fill="#e2e8f0"/><text x="90" y="210" text-anchor="middle" class="svg-ink" font-size="12">Email, Duo, NetFlow</text>
<rect x="240" y="80" width="160" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Cisco XDR</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">correlate, enrich,</text><text x="320" y="147" text-anchor="middle" class="svg-muted" font-size="12">prioritise</text>
<line x1="170" y1="40" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="170" y1="95" x2="240" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="150" x2="240" y2="135" stroke="#64748b" stroke-width="2"/><line x1="170" y1="205" x2="240" y2="155" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="60" width="160" height="50" rx="8" fill="#fed7aa"/><text x="550" y="82" text-anchor="middle" class="svg-ink" font-size="13">INC-2001</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="11">Critical, 4 observables</text>
<rect x="470" y="140" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="162" text-anchor="middle" class="svg-ink" font-size="13">Response</text><text x="550" y="180" text-anchor="middle" class="svg-muted" font-size="11">isolate, block, quarantine</text>
<line x1="400" y1="115" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><line x1="550" y1="110" x2="550" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Kai products ki detections ek incident banti hain; response actions unhi products ke through wapas bheje jaate hain.</p></div>

<h3>Lab walk-through: INC-2001 investigate karo aur contain karo</h3>
<p><b>Cisco XDR → Incidents</b> kholo aur INC-2001 ki row par click karo. Detail panel dikhata hai:</p>
<pre class="out">INC-2001 — Malware + C2 beacon on PC-WS1
Verdict: Malicious · Status: New
Observables
  PC-WS1   W32.Ransom.Rans:Trojan   <span class="hl">c2.badexfil.top</span>   203.0.113.66
Correlated events
  11:19:40 · Secure Endpoint: W32.Ransom.Rans:Trojan on PC-WS1
  11:20:02 · Secure Firewall: Outbound SSL beacon to c2.badexfil.top</pre>
<p>Ise analyst ki tarah padho. Do alag products ne same host par 22 seconds ke fark se do alag cheezein dekhin: endpoint ne ransomware family convict ki, aur firewall ne usi host ko external domain par encrypted session kholte dekha. Saath milkar matlab hai ki malware chal raha hai aur apne command-and-control server ko call kar raha hai. Jo C2 observable maanga gaya hai woh <code>c2.badexfil.top</code> hai (203.0.113.66 woh address hai jis par woh resolve hua).</p>
<ol>
<li><b>Host contain karo.</b> Response section mein <b>Isolate PC-WS1</b> click karo. XDR request Secure Endpoint ko bhejta hai, jo connector isolate karta hai: host cloud tak apna management channel rakhta hai par baaki saara network access kho deta hai. PC-WS1 par <code>ping 203.0.113.9</code> ab time out hota hai.</li>
<li><b>C2 domain block karo.</b> <b>Block domain</b> click karo aur <code>c2.badexfil.top</code> daalo. Doosre infected hosts, agar hon, ab us tak nahi pahunch sakte.</li>
<li><b>Confirm karo.</b> Incident ki action list "Isolated host PC-WS1" aur domain block dikhati hai, aur status <b>Contained</b> ho jaata hai. <b>Cisco XDR → Automation</b> apne action log mein wahi actions time aur target ke saath dikhata hai.</li>
</ol>
<p>Containment ant nahi hai. Lab ke bahar agle steps honge: scope (kya kisi aur host ne 203.0.113.66 se baat ki?), eradicate (PC-WS1 reimage ya clean karo), recover, aur report likho. <b>Quarantine files</b> button teesra response hai: yeh host par convicted file quarantine karta hai.</p>

<h3>Automation: jab koi jaag nahi raha</h3>
<p>XDR <b>Automation</b> "incident created" jaise triggers par workflows chalata hai. Lab mein Automation page par ek switch hai: <i>Auto-contain: on a Critical/High incident, isolate the host and block the C2 domain automatically</i>. On hone par naya malware incident seconds mein contain hota hai; off hone par detections sirf log hoti hain. Wahi switch Splunk SOAR page par containment playbook ki tarah dikhta hai, kyunki real SOC mein SIEM/SOAR aur XDR response plumbing share karte hain.</p>

<div class="eg"><p><b>Worked example: samay matter karta hai.</b> Ransomware aam taur par pehle beacon ke kuch minutes mein encrypt karna shuru kar deta hai. Raat ko manual handling: 02:10 par alert, analyst page hua, 02:45 tak login karke isolate kar raha hai, 35 minute encryption. Critical incidents ke liye auto-contain ke saath: 02:10:30 par isolation, lagbhag 30 seconds. Isiliye mature teams high-confidence verdicts ke liye pehla containment step automate karti hain aur scoping aur recovery ke liye insaan rakhti hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Har severity ke liye isolation automate karna, ya bina agreed exception ke critical servers ke liye. Low-confidence alert par database server isolate karna threat se bada outage kar sakta hai. Workstations par high-confidence, high-severity incidents ke liye automate karo; servers ko human approval step par route karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> XDR khud hosts isolate ya domains block nahi karta; woh integrated products ko orchestrate karta hai (Secure Endpoint isolate karta hai, Umbrella ya Secure Access domains block karta hai, firewall IPs block karta hai). Observables investigation ke pivots aur response actions ke targets hain. Incident kai detections ko group karta hai.</p></div>

<div class="scn"><h4>Jo playbook kabhi chala nahi</h4><p>23:40 par XDR mein Critical malware incident aaya, par subah ki shift tak kuch contain nahi hua. SOC ko automatic isolation ki ummeed thi. Automation page ne dikhaya ki auto-contain workflow do hafte pehle ke test se off tha. Host ne ek shared folder encrypt kar diya tha. Team ne workflow phir enable kiya, shift checklist mein automation status ka weekly check joda, aur folder backup se restore kiya.</p><p><b>Seekh:</b> automatic response tabhi kaam karta hai jab armed ho; automation ko kisi bhi doosre control ki tarah verify karo.</p></div>

<div class="iv"><p class="q">"XDR aapko aisa kya deta hai jo akela EDR nahi deta?"</p><p>Strong answer: EDR sirf endpoint dekhta hai. XDR endpoint, firewall, DNS, email, identity aur network analytics ki detections ko observables ke saath ek prioritised incident mein correlate karta hai, unhe threat intelligence se enrich karta hai, investigation graph mein saare products ke across pivot karne deta hai, aur ek jagah se har integrated product ke through response actions launch karta hai, automated workflows samet. Kam alert fatigue aur tez containment ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EDR ek layer hai; XDR kai security products ko incidents mein correlate karta hai; SIEM saare logs search karta hai; SOAR automate karta hai.</li>
<li>Key XDR terms: detection, incident, priority, observable, target, disposition, investigation, response action.</li>
<li>Response actions integrated products ke through chalte hain: isolate (Secure Endpoint), domain block (Umbrella / Secure Access), IP block (firewall).</li>
<li>Lab: INC-2001 ransomware conviction aur firewall beacon ko jodta hai; PC-WS1 isolate, c2.badexfil.top block, status Contained.</li>
<li>Automation seconds mein contain karta hai, par sirf jab armed ho aur high-confidence incidents tak scoped ho.</li>
</ul></div>
`}};export{e as default};