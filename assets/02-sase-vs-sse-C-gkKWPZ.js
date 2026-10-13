var e={id:`sase-vs-sse`,h:{en:`SASE vs SSE and the building blocks of a security edge`,hi:`SASE vs SSE aur security edge ke building blocks`},body:{en:`
<p>Think of a modern airport. The <b>runways and taxiways</b> move aircraft efficiently from anywhere to anywhere: that is networking. The <b>security checkpoints, customs and baggage scanners</b> decide what is allowed through: that is security. An airport needs both, but you can buy and run them separately. SASE and SSE are the same split for enterprise traffic.</p>

<h3>Two terms, defined precisely</h3>
<dl class="terms">
<dt>SASE (Secure Access Service Edge)</dt><dd>A term introduced by Gartner in 2019: <b>wide-area networking</b> (SD-WAN) and <b>network security</b> delivered together as a cloud service, with policy based on identity and context. Pronounced "sassy".</dd>
<dt>SSE (Security Service Edge)</dt><dd>Introduced in 2021: the <b>security half of SASE</b> on its own, cloud-delivered. A company that already has an SD-WAN, or no SD-WAN at all, can buy SSE alone.</dd>
</dl>
<p><b>SASE = SD-WAN + SSE.</b> In Cisco's portfolio, SASE is <b>Cisco Catalyst SD-WAN</b> plus <b>Cisco Secure Access</b> (the SSE). Catalyst SD-WAN Manager can build the IPsec tunnels from SD-WAN edges to Secure Access automatically, which is the same kind of network tunnel you will build by hand on an IOS XE router in chapter 4.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SASE is SD-WAN plus SSE">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">SASE (one cloud service, identity-based policy)</text>
<rect x="25" y="50" width="170" height="155" rx="8" fill="#bae6fd"/><text x="110" y="75" text-anchor="middle" class="svg-ink" font-size="13">Networking</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">SD-WAN</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">path selection</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">WAN optimisation</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">Catalyst SD-WAN</text>
<rect x="210" y="50" width="405" height="155" rx="8" fill="#ddd6fe"/><text x="412" y="72" text-anchor="middle" class="svg-ink" font-size="13">SSE: Cisco Secure Access</text>
<rect x="225" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="285" y="105" text-anchor="middle" class="svg-ink" font-size="12">DNS security</text>
<rect x="355" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="415" y="105" text-anchor="middle" class="svg-ink" font-size="12">SWG</text>
<rect x="485" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="12">CASB</text>
<rect x="225" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="285" y="145" text-anchor="middle" class="svg-ink" font-size="12">ZTNA + RAVPN</text>
<rect x="355" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="415" y="145" text-anchor="middle" class="svg-ink" font-size="12">Cloud firewall</text>
<rect x="485" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">DLP + AI</text>
<rect x="225" y="165" width="380" height="30" rx="6" fill="#fed7aa"/><text x="415" y="185" text-anchor="middle" class="svg-ink" font-size="12">One policy, one client, one log, Investigate intelligence</text>
</svg><p class="cap">SASE adds networking to the SSE security stack. Exam questions love to ask which half a component belongs to.</p></div>

<h3>The building blocks, one by one</h3>
<table class="cmp"><tr><th>Component</th><th>What it does</th><th>Where you see it in Secure Access</th></tr>
<tr><td><b>DNS-layer security</b></td><td>Checks every DNS query and answers blocked domains with a block-page address (a sinkhole). It stops malware call-backs before any connection starts, on any port or protocol.</td><td>Security categories in a security profile: Malware, Phishing, Command and Control and more</td></tr>
<tr><td><b>SWG</b> (secure web gateway)</td><td>A full web proxy: URL and content categories, HTTPS decryption, file inspection, warn and block pages, application visibility.</td><td>Internet access rules with a security profile</td></tr>
<tr><td><b>CASB</b> (cloud access security broker)</td><td>Discovers and controls SaaS apps (shadow IT), shows app risk, enforces tenant controls, scans data at rest through SaaS APIs.</td><td>Applications catalog, application destinations, tenant controls</td></tr>
<tr><td><b>ZTNA</b> (zero trust network access)</td><td>Per-application access to private apps after identity and posture checks, with no network-level access.</td><td>Private resources, connector groups, private access rules</td></tr>
<tr><td><b>FWaaS</b> (cloud firewall)</td><td>Layer 3/4 and application firewall plus IPS in the cloud for tunnel and client traffic that is not web.</td><td>Access rules for non-web traffic</td></tr>
<tr><td><b>DLP</b></td><td>Finds sensitive data (card numbers, national IDs, keys, document labels) in uploads and prompts, inline or through SaaS APIs.</td><td>Secure, DLP &amp; AI Guardrails</td></tr>
<tr><td><b>AI guardrails</b></td><td>Inspect prompts to generative-AI apps for prompt injection, sensitive data and harmful requests.</td><td>Secure, DLP &amp; AI Guardrails</td></tr>
<tr><td><b>RBI</b> (remote browser isolation)</td><td>Renders a risky site in a cloud browser and sends only safe pixels or a safe page to the user.</td><td>The Isolate action of a web rule (add-on licence)</td></tr>
<tr><td><b>RAVPN as a service</b></td><td>Classic full or split tunnel remote access VPN terminated in the cloud, for apps ZTNA cannot handle yet.</td><td>Secure Client VPN profiles</td></tr>
<tr><td><b>Digital experience monitoring</b></td><td>Measures user, path and app performance so you can prove the slowness is not the security edge.</td><td>Experience Insights</td></tr>
</table>

<h3>Why convergence matters</h3>
<p>You could buy a DNS filter from one vendor, a proxy from another, a CASB from a third and a ZTNA product from a fourth. You would then have four consoles, four agents on every laptop, four sets of rules that disagree, and four logs that use different user names. A converged SSE gives:</p>
<ul>
<li><b>One policy engine</b>: the same group "Finance" is used in internet rules, private rules, DLP rules and reports.</li>
<li><b>One client</b>: Cisco Secure Client carries the roaming (internet security) module, the Zero Trust Access module and the VPN module.</li>
<li><b>One log</b>: Activity Search shows DNS, web, firewall, private-app, DLP and AI events side by side, so an investigation follows one user across all of them.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Network Kings has 3 branches, 120 roaming laptops and one data center. Before SSE: 3 branch proxies, a DNS filter, a VPN concentrator for 120 users, and a separate CASB in API mode. After: 3 IPsec tunnels (one per branch) to Secure Access, Secure Client on 120 laptops, one resource connector group in the data center, and a single access policy. The VPN concentrator and the branch proxies are retired.</p></div>

<div class="warn"><p><b>Common mistake.</b> Calling SD-WAN a security product because it encrypts traffic. SD-WAN encryption protects the transport between your sites; it does not decide whether a user may upload payroll to a personal cloud drive. That decision belongs to SSE.</p></div>

<div class="exam"><p><b>Exam traps.</b> SSE does not include SD-WAN. CASB, SWG, ZTNA and FWaaS are SSE components. DNS-layer security works for any port and protocol because it acts at name resolution, but it cannot stop a connection made directly to an IP address; the SWG and cloud firewall cover that. RBI is the Isolate action, not a block.</p></div>

<div class="scn"><h4>Four products, four answers</h4><p>A bank's SOC asked "did anyone in Treasury reach the phishing domain reported this morning?" The DNS filter logged device names, the proxy logged IP addresses, the CASB logged e-mail addresses and the VPN logged employee IDs. It took two analysts half a day to correlate. After consolidating on one SSE with Entra ID users provisioned once, the same question became one Activity Search filter on group Treasury and the domain, answered in under a minute.</p><p><b>Lesson:</b> convergence is not about fewer invoices; it is about one identity and one log during an incident.</p></div>

<div class="iv"><p class="q">"What is the difference between SASE and SSE? Where does Cisco Secure Access fit?"</p><p>Strong answer: SASE converges networking (SD-WAN) and security as a cloud service; SSE is the security part alone: SWG, CASB, ZTNA, FWaaS, DNS security, DLP. Cisco SASE is Catalyst SD-WAN plus Cisco Secure Access, which is Cisco's SSE. Add that a customer can adopt SSE first and connect any IPsec-capable router or firewall, then add SD-WAN later.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SASE = SD-WAN networking + SSE security, delivered from the cloud.</li>
<li>SSE components: DNS-layer security, SWG, CASB, ZTNA, cloud firewall (FWaaS), DLP, plus RBI and RAVPN.</li>
<li>Cisco SASE = Catalyst SD-WAN + Cisco Secure Access.</li>
<li>Convergence gives one policy, one client and one log.</li>
<li>DNS security covers any protocol but not direct-to-IP traffic.</li>
</ul></div>
`,hi:`
<p>Ek modern airport socho. <b>Runways aur taxiways</b> aircraft ko kahin se bhi kahin tak efficiently le jaate hain: yeh networking hai. <b>Security checkpoints, customs aur baggage scanners</b> decide karte hain kya aage jaa sakta hai: yeh security hai. Airport ko dono chahiye, par aap unhe alag-alag khareed aur chala sakte ho. SASE aur SSE enterprise traffic ke liye yahi split hai.</p>

<h3>Do terms, sahi definition ke saath</h3>
<dl class="terms">
<dt>SASE (Secure Access Service Edge)</dt><dd>Gartner ne 2019 mein yeh term diya: <b>wide-area networking</b> (SD-WAN) aur <b>network security</b> ek saath cloud service ki tarah, identity aur context par based policy ke saath. Bolte hain "sassy".</dd>
<dt>SSE (Security Service Edge)</dt><dd>2021 mein aaya: <b>SASE ka security wala hissa</b> akele, cloud-delivered. Jis company ke paas pehle se SD-WAN hai, ya bilkul SD-WAN nahi hai, woh sirf SSE khareed sakti hai.</dd>
</dl>
<p><b>SASE = SD-WAN + SSE.</b> Cisco portfolio mein SASE hai <b>Cisco Catalyst SD-WAN</b> plus <b>Cisco Secure Access</b> (SSE). Catalyst SD-WAN Manager SD-WAN edges se Secure Access tak IPsec tunnels automatically bana sakta hai, jo usi type ka network tunnel hai jo aap chapter 4 mein IOS XE router par haath se banaoge.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SASE is SD-WAN plus SSE">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">SASE (ek cloud service, identity-based policy)</text>
<rect x="25" y="50" width="170" height="155" rx="8" fill="#bae6fd"/><text x="110" y="75" text-anchor="middle" class="svg-ink" font-size="13">Networking</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">SD-WAN</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">path selection</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">WAN optimisation</text><text x="110" y="160" text-anchor="middle" class="svg-muted" font-size="12">Catalyst SD-WAN</text>
<rect x="210" y="50" width="405" height="155" rx="8" fill="#ddd6fe"/><text x="412" y="72" text-anchor="middle" class="svg-ink" font-size="13">SSE: Cisco Secure Access</text>
<rect x="225" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="285" y="105" text-anchor="middle" class="svg-ink" font-size="12">DNS security</text>
<rect x="355" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="415" y="105" text-anchor="middle" class="svg-ink" font-size="12">SWG</text>
<rect x="485" y="85" width="120" height="30" rx="6" fill="#bbf7d0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="12">CASB</text>
<rect x="225" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="285" y="145" text-anchor="middle" class="svg-ink" font-size="12">ZTNA + RAVPN</text>
<rect x="355" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="415" y="145" text-anchor="middle" class="svg-ink" font-size="12">Cloud firewall</text>
<rect x="485" y="125" width="120" height="30" rx="6" fill="#fde68a"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">DLP + AI</text>
<rect x="225" y="165" width="380" height="30" rx="6" fill="#fed7aa"/><text x="415" y="185" text-anchor="middle" class="svg-ink" font-size="12">Ek policy, ek client, ek log, Investigate intelligence</text>
</svg><p class="cap">SASE SSE security stack mein networking jodta hai. Exam questions ko poochna pasand hai ki koi component kis hisse ka hai.</p></div>

<h3>Building blocks, ek-ek karke</h3>
<table class="cmp"><tr><th>Component</th><th>Kya karta hai</th><th>Secure Access mein kahan dikhta hai</th></tr>
<tr><td><b>DNS-layer security</b></td><td>Har DNS query check karta hai aur blocked domains ka jawab block-page address (sinkhole) se deta hai. Yeh malware call-backs ko koi bhi connection shuru hone se pehle rokta hai, kisi bhi port ya protocol par.</td><td>Security profile ki security categories: Malware, Phishing, Command and Control aur aur bhi</td></tr>
<tr><td><b>SWG</b> (secure web gateway)</td><td>Poora web proxy: URL aur content categories, HTTPS decryption, file inspection, warn aur block pages, application visibility.</td><td>Security profile ke saath internet access rules</td></tr>
<tr><td><b>CASB</b> (cloud access security broker)</td><td>SaaS apps dhoondhta aur control karta hai (shadow IT), app risk dikhata hai, tenant controls lagata hai, SaaS APIs se data at rest scan karta hai.</td><td>Applications catalog, application destinations, tenant controls</td></tr>
<tr><td><b>ZTNA</b> (zero trust network access)</td><td>Identity aur posture check ke baad private apps tak per-application access, network-level access ke bina.</td><td>Private resources, connector groups, private access rules</td></tr>
<tr><td><b>FWaaS</b> (cloud firewall)</td><td>Tunnel aur client ke non-web traffic ke liye cloud mein Layer 3/4 aur application firewall plus IPS.</td><td>Non-web traffic ke access rules</td></tr>
<tr><td><b>DLP</b></td><td>Uploads aur prompts mein sensitive data (card numbers, national IDs, keys, document labels) dhoondhta hai, inline ya SaaS APIs se.</td><td>Secure, DLP &amp; AI Guardrails</td></tr>
<tr><td><b>AI guardrails</b></td><td>Generative-AI apps ko jaane wale prompts mein prompt injection, sensitive data aur harmful requests inspect karte hain.</td><td>Secure, DLP &amp; AI Guardrails</td></tr>
<tr><td><b>RBI</b> (remote browser isolation)</td><td>Risky site ko cloud browser mein render karta hai aur user ko sirf safe pixels ya safe page bhejta hai.</td><td>Web rule ka Isolate action (add-on licence)</td></tr>
<tr><td><b>RAVPN as a service</b></td><td>Cloud mein terminate hone wala classic full ya split tunnel remote access VPN, un apps ke liye jo ZTNA abhi handle nahi kar sakta.</td><td>Secure Client VPN profiles</td></tr>
<tr><td><b>Digital experience monitoring</b></td><td>User, path aur app performance naapta hai taaki aap saabit kar sako ki slowness security edge ki wajah se nahi hai.</td><td>Experience Insights</td></tr>
</table>

<h3>Convergence kyun matter karta hai</h3>
<p>Aap ek vendor se DNS filter, dusre se proxy, teesre se CASB aur chauthe se ZTNA product khareed sakte ho. Phir aapke paas chaar consoles, har laptop par chaar agents, rules ke chaar sets jo aapas mein match nahi karte, aur chaar logs honge jo alag-alag user names use karte hain. Converged SSE deta hai:</p>
<ul>
<li><b>Ek policy engine</b>: same group "Finance" internet rules, private rules, DLP rules aur reports sab mein use hota hai.</li>
<li><b>Ek client</b>: Cisco Secure Client mein roaming (internet security) module, Zero Trust Access module aur VPN module sab hain.</li>
<li><b>Ek log</b>: Activity Search DNS, web, firewall, private-app, DLP aur AI events ek saath dikhata hai, isliye investigation ek user ko in sab mein follow kar sakti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Network Kings ke 3 branches, 120 roaming laptops aur ek data center hai. SSE se pehle: 3 branch proxies, ek DNS filter, 120 users ke liye VPN concentrator, aur API mode mein alag CASB. Baad mein: Secure Access tak 3 IPsec tunnels (har branch ka ek), 120 laptops par Secure Client, data center mein ek resource connector group, aur ek single access policy. VPN concentrator aur branch proxies retire ho jaate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> SD-WAN ko security product kehna kyunki woh traffic encrypt karta hai. SD-WAN encryption aapki sites ke beech transport ko protect karta hai; yeh decide nahi karta ki user payroll ko personal cloud drive par upload kar sakta hai ya nahi. Woh decision SSE ka hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> SSE mein SD-WAN nahi hota. CASB, SWG, ZTNA aur FWaaS SSE components hain. DNS-layer security kisi bhi port aur protocol ke liye kaam karta hai kyunki yeh name resolution par act karta hai, par seedha IP address par bane connection ko nahi rok sakta; uske liye SWG aur cloud firewall hain. RBI Isolate action hai, block nahi.</p></div>

<div class="scn"><h4>Chaar products, chaar jawab</h4><p>Ek bank ke SOC ne poocha "kya Treasury mein kisi ne aaj subah report hue phishing domain tak pahuncha?" DNS filter device names log karta tha, proxy IP addresses, CASB e-mail addresses aur VPN employee IDs. Do analysts ko correlate karne mein aadha din laga. Ek SSE par consolidate karne ke baad, Entra ID users ek baar provision karke, wahi sawaal group Treasury aur domain par ek Activity Search filter ban gaya, ek minute se kam mein jawab.</p><p><b>Seekh:</b> convergence kam invoices ke baare mein nahi hai; yeh incident ke dauraan ek identity aur ek log ke baare mein hai.</p></div>

<div class="iv"><p class="q">"SASE aur SSE mein kya farak hai? Cisco Secure Access kahan fit hota hai?"</p><p>Strong answer: SASE networking (SD-WAN) aur security ko cloud service ki tarah converge karta hai; SSE sirf security wala hissa hai: SWG, CASB, ZTNA, FWaaS, DNS security, DLP. Cisco SASE = Catalyst SD-WAN plus Cisco Secure Access, jo Cisco ka SSE hai. Yeh bhi jodo ki customer pehle SSE adopt kar sakta hai aur koi bhi IPsec-capable router ya firewall jod sakta hai, phir baad mein SD-WAN add kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SASE = SD-WAN networking + SSE security, cloud se delivered.</li>
<li>SSE components: DNS-layer security, SWG, CASB, ZTNA, cloud firewall (FWaaS), DLP, plus RBI aur RAVPN.</li>
<li>Cisco SASE = Catalyst SD-WAN + Cisco Secure Access.</li>
<li>Convergence ek policy, ek client aur ek log deta hai.</li>
<li>DNS security har protocol cover karta hai par direct-to-IP traffic nahi.</li>
</ul></div>
`}};export{e as default};