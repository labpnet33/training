var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<p>The security appliance is the gateway of the branch. <b>Addressing and VLANs</b> gives every VLAN a subnet and a gateway address on the MX. <b>DHCP</b> hands addresses out of a pool (VLANs 10 and 30) while servers and management are static. The <b>firewall</b> reads rules top to bottom, first match wins, with an implicit allow at the end. <b>NAT</b> translates private addresses to the uplink address, and port forwarding publishes one inside server. <b>Content filtering</b> acts on categories and URL lists, with allow over block over category. When something breaks, use the workflow: symptom, devices online, L2 path, DHCP service, policy, fix and record.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MX processing summary">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="150" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">VLAN and</text><text x="205" y="63" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text>
<rect x="290" y="20" width="110" height="60" rx="8" fill="#fecaca"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="345" y="63" text-anchor="middle" class="svg-ink" font-size="13">rules</text>
<rect x="430" y="20" width="90" height="60" rx="8" fill="#ddd6fe"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">Content</text><text x="475" y="63" text-anchor="middle" class="svg-ink" font-size="13">filter</text>
<rect x="550" y="20" width="80" height="60" rx="8" fill="#bbf7d0"/><text x="590" y="55" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<line x1="120" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="260" y1="50" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="550" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="85" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Address, then policy, then web policy, then translation to the internet</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">No address: DHCP or VLAN path. Address but blocked: firewall or filter.</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Address but no internet: gateway, uplink, NAT.</text>
</svg><p class="cap">A client's life on the MX: address, firewall, content filter, NAT.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>List the roles of the appliance: router, firewall, DHCP server, NAT, content filter, VPN and SD-WAN edge.</li>
<li>Read the VLAN plan 10.&lt;site&gt;.&lt;vlan&gt;.0/24 and the .1 gateway for any address, for example 10.3.30.114 is a Delhi guest.</li>
<li>Explain access, trunk, native VLAN and allowed list, and why management VLAN 99 must arrive untagged.</li>
<li>Choose DHCP server, relay or off for a VLAN and justify it; size a pool and a lease time.</li>
<li>Explain DORA and what 169.254.x.x means.</li>
<li>Write firewall rules in the right order for guest isolation and read hit counts to prove they work.</li>
<li>Explain PAT, port forwarding and 1:1 NAT, and why the public address changes on failover.</li>
<li>Apply content filtering: allow list, block list, categories, and say which wins.</li>
<li>Run the troubleshooting workflow for "client cannot get DHCP" and "rule does not work".</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VLAN</dt><dd>A virtual LAN: a separate broadcast domain and subnet on shared switches.</dd>
<dt>Routed mode</dt><dd>The MX has an address in each VLAN and routes between them.</dd>
<dt>Trunk / access / native VLAN</dt><dd>Many tagged VLANs / one untagged VLAN / the VLAN that travels untagged on a trunk.</dd>
<dt>DHCP lease</dt><dd>A temporary loan of an address for a set time.</dd>
<dt>Pool exhaustion</dt><dd>All pool addresses are leased; new clients get none.</dd>
<dt>L3 rule</dt><dd>A firewall rule on protocol, source, destination and port.</dd>
<dt>Hit count</dt><dd>How many connections matched a rule.</dd>
<dt>PAT</dt><dd>Many inside hosts share one outside address using different ports.</dd>
<dt>Port forwarding</dt><dd>A static inbound mapping from a public address and port to an inside host.</dd>
<dt>Content category</dt><dd>A vendor-assigned theme group of websites.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Firewall order</td><td>Top to bottom, first match wins, implicit allow at the end</td></tr>
<tr><td>Zero hits</td><td>Rule is shadowed by an earlier rule or does not match</td></tr>
<tr><td>Content filtering</td><td>Allow list, then block list, then blocked categories</td></tr>
<tr><td>DHCP modes</td><td>Server, relay, off</td></tr>
<tr><td>169.254.x.x</td><td>DHCP did not answer</td></tr>
<tr><td>Static in our plan</td><td>VLAN 20 servers (.10 main), VLAN 99 (.2 to .20)</td></tr>
<tr><td>Management VLAN</td><td>Must arrive untagged: native VLAN 99 on both ends</td></tr>
<tr><td>PAT address</td><td>Active uplink address; changes on failover</td></tr>
</table>

<div class="exam"><p><b>Exam trap summary.</b> (1) A broad allow above a deny makes the deny dead. (2) Pool exhaustion looks like "connected, no internet" or 169.254.x.x. (3) A URL on both allow and block lists is allowed. (4) A VLAN needs a gateway row and trunk permission. (5) PAT is not a firewall.</p></div>
<div class="warn"><p><b>Lab reminder.</b> In mk-mx-4, resist fixing the first odd thing you see. Walk the workflow and confirm the cause on the DHCP page before you click Save changes.</p></div>

<div class="scn"><h4>Opening day checks at a new branch</h4><p>Before opening the Pune store, the engineer runs the module as a checklist: VLAN table with 10, 20, 30, 99 and correct subnets; trunk allowed lists on both ends with native 99; DHCP server on 10 and 30 with a pool and 1-hour guest lease; rules in order (staff to servers allow, guest to servers deny, deny to management); content filter with malware and gambling blocked; one test client in each VLAN; then a look at hit counts. The store opens on time and the guest deny already shows hits from a curious tester.</p><p><b>Lesson:</b> a checklist and the counters turn "I think it works" into "I can show it works".</p></div>

<div class="iv"><p class="q">"Summarise how you would build the network policy for a new retail branch on this appliance."</p><p>Strong answer: plan VLANs and subnets per site, build the trunk with matching native and allowed lists, enable DHCP for client VLANs with a protected pool, write ordered firewall rules for isolation, set content filtering with narrow exceptions, rely on PAT for internet and publish services only with firewall limits, then verify with test clients and hit counts, and record changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The MX routes between VLANs, serves DHCP, filters traffic, translates addresses and filters content.</li>
<li>Order is policy: firewall top to bottom, content filter allow then block then category.</li>
<li>No address means DHCP or VLAN path; blocked with an address means policy.</li>
<li>Use hit counts, test results and the change log as evidence.</li>
<li>Change one thing at a time and record it.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<p>Security appliance branch ka gateway hai. <b>Addressing and VLANs</b> har VLAN ko MX par subnet aur gateway address deta hai. <b>DHCP</b> pool se addresses deta hai (VLANs 10 aur 30) jabki servers aur management static hain. <b>Firewall</b> rules upar se neeche padhta hai, pehla match jeetta hai, aur end mein implicit allow hota hai. <b>NAT</b> private addresses ko uplink address mein translate karta hai, aur port forwarding ek inside server ko publish karta hai. <b>Content filtering</b> categories aur URL lists par kaam karti hai, allow block se upar aur block category se upar. Jab kuch toote, to workflow use karo: symptom, devices online, L2 path, DHCP service, policy, fix aur record.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MX processing summary">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="150" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">VLAN aur</text><text x="205" y="63" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text>
<rect x="290" y="20" width="110" height="60" rx="8" fill="#fecaca"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="345" y="63" text-anchor="middle" class="svg-ink" font-size="13">rules</text>
<rect x="430" y="20" width="90" height="60" rx="8" fill="#ddd6fe"/><text x="475" y="45" text-anchor="middle" class="svg-ink" font-size="13">Content</text><text x="475" y="63" text-anchor="middle" class="svg-ink" font-size="13">filter</text>
<rect x="550" y="20" width="80" height="60" rx="8" fill="#bbf7d0"/><text x="590" y="55" text-anchor="middle" class="svg-ink" font-size="13">NAT</text>
<line x1="120" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="260" y1="50" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="400" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="550" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="85" rx="8" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">Address, phir policy, phir web policy, phir internet ke liye translation</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">Address nahi: DHCP ya VLAN path. Address hai lekin blocked: firewall ya filter.</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Address hai lekin internet nahi: gateway, uplink, NAT.</text>
</svg><p class="cap">MX par client ka safar: address, firewall, content filter, NAT.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Appliance ke roles list karo: router, firewall, DHCP server, NAT, content filter, VPN aur SD-WAN edge.</li>
<li>Kisi bhi address ke liye VLAN plan 10.&lt;site&gt;.&lt;vlan&gt;.0/24 aur .1 gateway padho, jaise 10.3.30.114 Delhi ka guest hai.</li>
<li>Access, trunk, native VLAN aur allowed list samjhao, aur management VLAN 99 untagged kyun aani chahiye.</li>
<li>VLAN ke liye DHCP server, relay ya off chuno aur justify karo; pool aur lease time size karo.</li>
<li>DORA samjhao aur 169.254.x.x ka matlab batao.</li>
<li>Guest isolation ke liye firewall rules sahi order mein likho aur hit counts se saabit karo ki kaam kar rahe hain.</li>
<li>PAT, port forwarding aur 1:1 NAT samjhao, aur failover par public address kyun badalta hai.</li>
<li>Content filtering lagao: allow list, block list, categories, aur batao kaun jeetta hai.</li>
<li>"Client ko DHCP nahi mil raha" aur "rule kaam nahi kar raha" ke liye troubleshooting workflow chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VLAN</dt><dd>Virtual LAN: shared switches par alag broadcast domain aur subnet.</dd>
<dt>Routed mode</dt><dd>MX ka har VLAN mein address hai aur woh unke beech route karta hai.</dd>
<dt>Trunk / access / native VLAN</dt><dd>Kai tagged VLANs / ek untagged VLAN / woh VLAN jo trunk par untagged jaati hai.</dd>
<dt>DHCP lease</dt><dd>Tay time ke liye address ka temporary udhaar.</dd>
<dt>Pool exhaustion</dt><dd>Pool ke saare addresses lease ho chuke hain; naye clients ko kuch nahi milta.</dd>
<dt>L3 rule</dt><dd>Protocol, source, destination aur port par firewall rule.</dd>
<dt>Hit count</dt><dd>Kitni connections ek rule se match hui.</dd>
<dt>PAT</dt><dd>Kai inside hosts ek outside address alag ports se share karte hain.</dd>
<dt>Port forwarding</dt><dd>Public address aur port se inside host tak static inbound mapping.</dd>
<dt>Content category</dt><dd>Vendor dwara assign kiya gaya websites ka theme group.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Firewall order</td><td>Upar se neeche, pehla match jeetta hai, end mein implicit allow</td></tr>
<tr><td>Zero hits</td><td>Rule pehle ke rule se shadowed hai ya match nahi karta</td></tr>
<tr><td>Content filtering</td><td>Allow list, phir block list, phir blocked categories</td></tr>
<tr><td>DHCP modes</td><td>Server, relay, off</td></tr>
<tr><td>169.254.x.x</td><td>DHCP ne jawab nahi diya</td></tr>
<tr><td>Humare plan mein static</td><td>VLAN 20 servers (.10 main), VLAN 99 (.2 se .20)</td></tr>
<tr><td>Management VLAN</td><td>Untagged aani chahiye: dono ends par native VLAN 99</td></tr>
<tr><td>PAT address</td><td>Active uplink address; failover par badalta hai</td></tr>
</table>

<div class="exam"><p><b>Exam trap summary.</b> (1) Deny ke upar broad allow deny ko dead kar deta hai. (2) Pool exhaustion "connected, no internet" ya 169.254.x.x jaisa dikhta hai. (3) Allow aur block dono lists mein hone wala URL allowed hai. (4) VLAN ko gateway row aur trunk permission chahiye. (5) PAT firewall nahi hai.</p></div>
<div class="warn"><p><b>Lab reminder.</b> mk-mx-4 mein, pehli ajeeb cheez dikhte hi fix mat karo. Workflow chalao aur Save changes click karne se pehle DHCP page par cause confirm karo.</p></div>

<div class="scn"><h4>Naye branch par opening day checks</h4><p>Pune store kholne se pehle engineer module ko checklist ki tarah chalata hai: VLAN table 10, 20, 30, 99 aur sahi subnets ke saath; dono ends par trunk allowed lists aur native 99; 10 aur 30 par DHCP server pool aur 1-hour guest lease ke saath; rules order mein (staff to servers allow, guest to servers deny, management par deny); malware aur gambling blocked wala content filter; har VLAN mein ek test client; phir hit counts dekhna. Store time par khulti hai aur guest deny ke paas ek curious tester ke hits pehle se hain.</p><p><b>Seekh:</b> checklist aur counters "mujhe lagta hai kaam karta hai" ko "main dikha sakta hoon kaam karta hai" bana dete hain.</p></div>

<div class="iv"><p class="q">"Is appliance par naye retail branch ki network policy kaise banaoge, summary mein batao."</p><p>Strong answer: har site ke liye VLANs aur subnets plan karo, matching native aur allowed lists ke saath trunk banao, client VLANs ke liye protected pool ke saath DHCP enable karo, isolation ke liye ordered firewall rules likho, narrow exceptions ke saath content filtering set karo, internet ke liye PAT par rely karo aur services sirf firewall limits ke saath publish karo, phir test clients aur hit counts se verify karo, aur changes record karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MX VLANs ke beech route karta hai, DHCP serve karta hai, traffic filter karta hai, addresses translate karta hai aur content filter karta hai.</li>
<li>Order hi policy hai: firewall upar se neeche, content filter allow phir block phir category.</li>
<li>Address nahi matlab DHCP ya VLAN path; address ke saath blocked matlab policy.</li>
<li>Hit counts, test results aur change log ko evidence ki tarah use karo.</li>
<li>Ek time par ek change karo aur record karo.</li>
</ul></div>
`}};export{e as default};