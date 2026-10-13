var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="{{aria}}">
<rect x="20" y="40" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="95" y="68" text-anchor="middle" class="svg-ink" font-size="13">vnet-a</text><text x="95" y="88" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="245" y="40" width="150" height="70" rx="8" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">vnet-b</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<rect x="470" y="40" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="545" y="68" text-anchor="middle" class="svg-ink" font-size="13">vnet-c</text><text x="545" y="88" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/16</text>
<line x1="170" y1="75" x2="245" y2="75" stroke="#16a34a" stroke-width="4"/><line x1="395" y1="75" x2="470" y2="75" stroke="#16a34a" stroke-width="4"/>
<text x="207" y="64" text-anchor="middle" class="svg-accent" font-size="12">{{p1}}</text><text x="432" y="64" text-anchor="middle" class="svg-accent" font-size="12">{{p2}}</text>
<path d="M95 112 L95 150 L545 150 L545 112" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 5"/>
<text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">{{x}}</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">{{n1}}</text><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">{{n2}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Peering is non-transitive`,p1:`peered`,p2:`peered`,x:`A to C: NOT reachable through B`,n1:`A to B works. B to C works. A to C has no path.`,n2:`Fix: peer A and C directly, or route through an NVA or firewall in B (UDR).`,cap:`Non-transitivity: peering does not chain. Reachability exists only between the two VNets of a link.`}),r=e(t,{aria:`Peering is non-transitive`,p1:`peered`,p2:`peered`,x:`A se C: B ke through reachable NAHI`,n1:`A se B chalta hai. B se C chalta hai. A se C ka path nahi.`,n2:`Fix: A aur C ko seedha peer karo, ya B mein NVA ya firewall se route karo (UDR).`,cap:`Non-transitivity: peering chain nahi hoti. Reachability sirf ek link ke do VNets ke beech hoti hai.`}),i={id:`peering-mechanics`,h:{en:`How VNet peering works`,hi:`VNet peering kaise kaam karti hai`},body:{en:`
<h3>Peering is two links</h3>
<p>A peering is not one object but <b>two</b>: a link in vnet-a pointing at vnet-b and a link in vnet-b pointing at vnet-a. Each link has its own settings and its own status. Only when both exist is the status <b>Connected</b>. If you create one only, the status is <b>Initiated</b>; if one side is later deleted, the other shows <b>Disconnected</b>. The portal creates both links in one step when you use the "add peering" blade; the CLI needs two commands.</p>
<dl class="terms">
<dt>Initiated</dt><dd>Only one link exists. No traffic flows yet.</dd>
<dt>Connected</dt><dd>Both links exist. Traffic flows according to each link's settings.</dd>
<dt>Disconnected</dt><dd>One link was deleted. Delete the other and recreate both.</dd>
</dl>

<h3>The four settings on each link</h3>
<table class="cmp"><tr><th>Setting (CLI flag)</th><th>Meaning</th></tr>
<tr><td>Allow virtual network access (<code>--allow-vnet-access</code>)</td><td>Resources in this VNet may reach the remote VNet. Normally on. If off, the VNets are peered but isolated.</td></tr>
<tr><td>Allow forwarded traffic (<code>--allow-forwarded-traffic</code>)</td><td>Accept traffic that did not originate in the remote VNet (for example forwarded by an NVA there). Needed for hub-and-spoke through a firewall.</td></tr>
<tr><td>Allow gateway transit (<code>--allow-gateway-transit</code>)</td><td>On the hub side: allow the remote VNet to use this VNet's VPN or ExpressRoute gateway.</td></tr>
<tr><td>Use remote gateways (<code>--use-remote-gateways</code>)</td><td>On the spoke side: use the hub's gateway for on-premises traffic.</td></tr></table>
`+n+`
<h3>Non-transitive</h3>
<p>If A is peered with B and B with C, A cannot reach C. Each peering is a private two-party agreement. There are three ways to connect A to C: peer them directly (a mesh), put an NVA or Azure Firewall in B and send traffic through it with UDRs, or use a service such as Azure Virtual WAN or Azure Virtual Network Manager to build hub-and-spoke or mesh topologies at scale.</p>

<h3>Address spaces must not overlap</h3>
<p>If vnet-a is 10.10.0.0/16 and vnet-b is 10.10.128.0/17, the ranges overlap and Azure refuses to peer them: a destination 10.10.130.5 would be ambiguous. Plan address space centrally (an IPAM table) before creating VNets, because changing a VNet's address space later is disruptive. When you add an address space to a peered VNet, the peering may need a <b>sync</b> to learn it (portal wording: verify), so check the peering status after changes.</p>

<div class="eg"><b>Worked example.</b> Planning table: prod hub 10.0.0.0/16, spoke-web 10.1.0.0/16, spoke-db 10.2.0.0/16, on-premises 192.168.0.0/16. All distinct, so any can peer or connect over VPN later. If on-premises used 10.1.0.0/16, spoke-web and on-premises could not be reached from each other over the same gateway without NAT.</div>

<h3>Cross-subscription, cross-tenant and permissions</h3>
<p>You can peer VNets in different subscriptions and in different Microsoft Entra tenants. The person (or service principal) needs the right permission on both sides, typically the Network Contributor role or a custom role with the peering actions (verify), for each VNet. Each side's link is created from its own subscription.</p>

<h3>What peering does not do</h3>
<ul>
<li>It does not merge networks: each VNet keeps its own NSGs, route tables and DNS settings.</li>
<li>It does not make DNS names resolve across VNets by itself; use Azure Private DNS zones linked to both VNets, or custom DNS.</li>
<li>It does not encrypt at the VNet level; traffic stays on the Microsoft backbone.</li>
<li>It does not share a NAT Gateway or public IP.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Creating one link only; forgetting that NSGs still apply (a deny rule on the subnet blocks peered traffic); overlapping address spaces; expecting DNS names to resolve; assuming a hub gives A-to-C access automatically.</div>
<div class="exam"><b>Exam trap.</b> "Which statement about VNet peering is true?" Non-transitive; no overlap; works across regions and subscriptions; needs a link each way; traffic stays on the Microsoft backbone.</div>

<div class="scn"><h4>Initiated, never connected</h4><p>A developer created a peering from the portal of subscription 1 to a VNet in subscription 2 using the CLI. Status stayed Initiated for a day and the app could not reach the database. The engineer ran <code>az network vnet peering list</code> in both subscriptions and found that the second link had never been created. One command in subscription 2 turned both sides to Connected.</p><p><b>Lesson:</b> Initiated means the other half is missing. Check both sides.</p></div>

<div class="iv"><p class="q">"Hub is peered to spoke 1 and spoke 2. Can spoke 1 reach spoke 2?"</p><p>Not by default, because peering is non-transitive. Options: peer the spokes directly, or add an NVA or Azure Firewall in the hub, enable allow-forwarded-traffic, and add UDRs in the spokes pointing to the appliance. Mention Virtual WAN or Network Manager for large environments.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A peering is two links; both needed for Connected.</li>
<li>Four per-link settings: vnet access, forwarded traffic, gateway transit, use remote gateways.</li>
<li>Non-transitive: A-B and B-C do not give A-C.</li>
<li>Address spaces must not overlap; plan with an IPAM table.</li>
<li>NSGs and DNS are separate concerns.</li>
</ul></div>
`,hi:`
<h3>Peering do links hai</h3>
<p>Peering ek object nahi balki <b>do</b> hai: vnet-a mein vnet-b ki taraf link aur vnet-b mein vnet-a ki taraf link. Har link ki apni settings aur apna status hota hai. Dono ho tabhi status <b>Connected</b> hota hai. Sirf ek banao to status <b>Initiated</b> hai; baad mein ek taraf delete ho jaye to doosri <b>Disconnected</b> dikhati hai. Portal ka "add peering" blade dono links ek step mein bana deta hai; CLI mein do commands chahiye.</p>
<dl class="terms">
<dt>Initiated</dt><dd>Sirf ek link hai. Abhi traffic nahi chalta.</dd>
<dt>Connected</dt><dd>Dono links hain. Traffic har link ki settings ke hisaab se chalta hai.</dd>
<dt>Disconnected</dt><dd>Ek link delete hua. Doosra delete karke dono dobara banao.</dd>
</dl>

<h3>Har link par chaar settings</h3>
<table class="cmp"><tr><th>Setting (CLI flag)</th><th>Matlab</th></tr>
<tr><td>Allow virtual network access (<code>--allow-vnet-access</code>)</td><td>Is VNet ke resources remote VNet tak pahunch sakte hain. Aam taur par on. Off ho to VNets peered hain par isolated.</td></tr>
<tr><td>Allow forwarded traffic (<code>--allow-forwarded-traffic</code>)</td><td>Aisa traffic accept karo jo remote VNet mein shuru nahi hua (jaise wahan ke NVA ne forward kiya). Firewall ke through hub-and-spoke ke liye zaroori.</td></tr>
<tr><td>Allow gateway transit (<code>--allow-gateway-transit</code>)</td><td>Hub side par: remote VNet ko is VNet ka VPN ya ExpressRoute gateway use karne do.</td></tr>
<tr><td>Use remote gateways (<code>--use-remote-gateways</code>)</td><td>Spoke side par: on-premises traffic ke liye hub ka gateway use karo.</td></tr></table>
`+r+`
<h3>Non-transitive</h3>
<p>A, B se peered hai aur B, C se, to A, C tak nahi pahunch sakta. Har peering do parties ka private samjhauta hai. A ko C se jodne ke teen tareeke hain: seedha peer karo (mesh), B mein NVA ya Azure Firewall rakho aur UDRs se traffic uske through bhejo, ya Azure Virtual WAN ya Azure Virtual Network Manager jaisi service se bade scale par hub-and-spoke ya mesh topologies banao.</p>

<h3>Address spaces overlap nahi hone chahiye</h3>
<p>vnet-a 10.10.0.0/16 aur vnet-b 10.10.128.0/17 ho to ranges overlap karti hain aur Azure unhe peer karne se mana kar deta hai: destination 10.10.130.5 ambiguous hoga. VNets banane se pehle address space centrally plan karo (IPAM table), kyunki baad mein VNet ka address space badalna disruptive hai. Peered VNet mein address space jodne par peering ko use seekhne ke liye <b>sync</b> chahiye ho sakta hai (portal wording: verify), isliye changes ke baad peering status check karo.</p>

<div class="eg"><b>Worked example.</b> Planning table: prod hub 10.0.0.0/16, spoke-web 10.1.0.0/16, spoke-db 10.2.0.0/16, on-premises 192.168.0.0/16. Sab alag hain, isliye koi bhi baad mein peer ya VPN se jud sakta hai. On-premises 10.1.0.0/16 use karta to spoke-web aur on-premises same gateway par NAT ke bina ek doosre tak nahi pahunch paate.</div>

<h3>Cross-subscription, cross-tenant aur permissions</h3>
<p>Aap alag subscriptions aur alag Microsoft Entra tenants ke VNets peer kar sakte ho. Person (ya service principal) ko dono taraf sahi permission chahiye, aam taur par har VNet par Network Contributor role ya peering actions wala custom role (verify). Har taraf ka link apne subscription se banta hai.</p>

<h3>Peering kya nahi karti</h3>
<ul>
<li>Networks merge nahi karti: har VNet ke apne NSGs, route tables aur DNS settings rehte hain.</li>
<li>Khud se VNets ke beech DNS names resolve nahi karati; dono VNets se linked Azure Private DNS zones ya custom DNS use karo.</li>
<li>VNet level par encrypt nahi karti; traffic Microsoft backbone par rehta hai.</li>
<li>NAT Gateway ya public IP share nahi karti.</li>
</ul>

<div class="warn"><b>Common mistakes.</b> Sirf ek link banana; bhoolna ki NSGs abhi bhi lagte hain (subnet par deny rule peered traffic block karta hai); overlapping address spaces; DNS names resolve hone ki ummeed; maan lena ki hub se A-to-C access apne aap mil jaata hai.</div>
<div class="exam"><b>Exam trap.</b> "VNet peering ke baare mein kaunsa statement sach hai?" Non-transitive; overlap nahi; regions aur subscriptions ke beech chalti hai; har taraf link chahiye; traffic Microsoft backbone par rehta hai.</div>

<div class="scn"><h4>Initiated, kabhi connected nahi</h4><p>Ek developer ne subscription 1 ke portal se subscription 2 ke VNet ki taraf peering banayi aur doosri taraf CLI se. Status ek din tak Initiated raha aur app database tak nahi pahunch saki. Engineer ne dono subscriptions mein <code>az network vnet peering list</code> chalaya aur dekha ki doosra link kabhi bana hi nahi tha. Subscription 2 mein ek command se dono taraf Connected ho gaye.</p><p><b>Lesson:</b> Initiated matlab doosra aadha missing hai. Dono taraf check karo.</p></div>

<div class="iv"><p class="q">"Hub, spoke 1 aur spoke 2 se peered hai. Kya spoke 1, spoke 2 tak pahunch sakta hai?"</p><p>Default mein nahi, kyunki peering non-transitive hai. Options: spokes ko seedha peer karo, ya hub mein NVA ya Azure Firewall lagao, allow-forwarded-traffic on karo, aur spokes mein appliance ko point karte UDRs jodo. Bade environments ke liye Virtual WAN ya Network Manager ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering do links hai; Connected ke liye dono chahiye.</li>
<li>Per-link chaar settings: vnet access, forwarded traffic, gateway transit, use remote gateways.</li>
<li>Non-transitive: A-B aur B-C se A-C nahi milta.</li>
<li>Address spaces overlap nahi hone chahiye; IPAM table se plan karo.</li>
<li>NSGs aur DNS alag concerns hain.</li>
</ul></div>
`}};export{i as default};