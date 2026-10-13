var e=`<svg viewBox="0 0 640 260" role="img" aria-label="Full mesh of peerings versus hub-and-spoke with a Transit Gateway">
<g stroke="#64748b" stroke-width="1.5">
<line x1="150" y1="40" x2="236" y2="103"/><line x1="150" y1="40" x2="203" y2="204"/><line x1="150" y1="40" x2="97" y2="204"/><line x1="150" y1="40" x2="64" y2="103"/>
<line x1="236" y1="103" x2="203" y2="204"/><line x1="236" y1="103" x2="97" y2="204"/><line x1="236" y1="103" x2="64" y2="103"/>
<line x1="203" y1="204" x2="97" y2="204"/><line x1="203" y1="204" x2="64" y2="103"/><line x1="97" y1="204" x2="64" y2="103"/>
</g>
<g fill="#bae6fd" stroke="#64748b"><circle cx="150" cy="40" r="17"/><circle cx="236" cy="103" r="17"/><circle cx="203" cy="204" r="17"/><circle cx="97" cy="204" r="17"/><circle cx="64" cy="103" r="17"/></g>
<g class="svg-ink" font-size="12" text-anchor="middle"><text x="150" y="44">V1</text><text x="236" y="107">V2</text><text x="203" y="208">V3</text><text x="97" y="208">V4</text><text x="64" y="107">V5</text></g>
<text x="150" y="247" text-anchor="middle" class="svg-ink" font-size="13">Mesh: 10 peerings for 5 VPCs</text>
<g stroke="#64748b" stroke-width="2">
<line x1="480" y1="35" x2="480" y2="105"/><line x1="575" y1="100" x2="520" y2="125"/><line x1="540" y1="205" x2="505" y2="155"/><line x1="420" y1="205" x2="455" y2="155"/><line x1="385" y1="100" x2="440" y2="125"/>
</g>
<rect x="440" y="105" width="80" height="50" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="480" y="127" text-anchor="middle" class="svg-ink" font-size="13">Transit</text><text x="480" y="144" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text>
<g fill="#bae6fd" stroke="#64748b"><circle cx="480" cy="35" r="17"/><circle cx="575" cy="100" r="17"/><circle cx="540" cy="205" r="17"/><circle cx="420" cy="205" r="17"/><circle cx="385" cy="100" r="17"/></g>
<g class="svg-ink" font-size="12" text-anchor="middle"><text x="480" y="39">V1</text><text x="575" y="104">V2</text><text x="540" y="209">V3</text><text x="420" y="209">V4</text><text x="385" y="104">V5</text></g>
<text x="480" y="247" text-anchor="middle" class="svg-ink" font-size="13">Hub: 5 attachments for 5 VPCs</text>
</svg>`,t={id:`hub-and-spoke`,h:{en:`Why a Transit Gateway: from mesh to hub-and-spoke`,hi:`Transit Gateway kyun: mesh se hub-and-spoke tak`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why a mesh of VPC peerings stops scaling, and what a <b>Transit Gateway (TGW)</b> does instead.</li>
<li>The vocabulary: attachment, hub, spoke, TGW route table.</li>
<li>The attachment types (VPC, VPN, Direct Connect, peering, Connect) and how a VPC attachment uses one subnet per Availability Zone.</li>
<li>An honest picture of what a TGW costs compared with peering.</li>
</ul>
<p><b>Prerequisites.</b> You should already know VPCs, subnets, route tables, security groups, NACLs, internet and NAT gateways, and VPC peering from the earlier modules of this track. If "longest prefix match" is hazy, revisit the routing chapter first.</p>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. The two guided-lab chapters of this module walk you through the second path safely. The in-app emulator labs of this module (Build a hub-and-spoke, and the segmentation ticket) are extra practice on the same ideas.</p></div>

<h3>The airline hub analogy</h3>
<p>Think of Indian domestic flights. Delhi, Mumbai, Bengaluru, Chennai and Kolkata could each run a direct flight to every other city, which is 10 routes for 5 cities. Airlines do not do this. They route passengers through a <b>hub</b>: every city has one flight to the hub, and the hub connects onward. Five cities, five routes. Add a sixth city and you add <b>one</b> route, not five. A Transit Gateway is the hub airport of your cloud network.</p>

<h3>The problem with peering at scale</h3>
<p>In the peering module you learned two facts. A peering connects exactly two VPCs, and peering is <b>not transitive</b>: if A peers with B and B peers with C, A still cannot reach C through B. So connecting <i>n</i> VPCs in full any-to-any needs <i>n × (n − 1) / 2</i> peerings, and each one needs routes on both sides.</p>
<div class="dia">`+e+`<p class="cap">The same five VPCs connected by a full mesh of peerings (left) and by a Transit Gateway (right).</p></div>
<div class="eg"><p><b>Worked example.</b> 5 VPCs: 5 × 4 / 2 = 10 peerings. 10 VPCs: 10 × 9 / 2 = <b>45</b> peerings, and 90 route entries to maintain (one on each side of each peering). With a TGW, 10 VPCs need <b>10 attachments</b>, and each VPC route table needs one route towards the TGW.</p></div>

<h3>What a Transit Gateway is</h3>
<p>A <b>Transit Gateway</b> is a managed, regional virtual router. You do not patch it, size it or log in to it. You create it in one AWS Region, then connect things to it with <b>attachments</b>. Inside the TGW, one or more <b>TGW route tables</b> decide where a packet goes next. Terms you will use in every chapter:</p>
<dl class="terms">
<dt>Hub and spoke</dt><dd>The hub is the TGW. A spoke is anything attached to it: a VPC, a VPN, a Direct Connect gateway, or another TGW.</dd>
<dt>Attachment</dt><dd>The link between the TGW and one spoke. Each attachment has an ID that starts with <code>tgw-attach-</code>.</dd>
<dt>TGW route table</dt><dd>A routing table inside the TGW. Not the same thing as a VPC route table. Chapter 2 explains how the two work together.</dd>
<dt>Regional</dt><dd>One TGW lives in one Region. VPCs in other Regions connect through a <b>peering attachment</b> between two TGWs.</dd>
</dl>

<h3>Attachment types</h3>
<table class="cmp"><tr><th>Type</th><th>Connects</th><th>Notes</th></tr>
<tr><td>VPC</td><td>A VPC in the same Region</td><td>Uses one subnet per AZ you choose. Routes can propagate automatically.</td></tr>
<tr><td>VPN</td><td>Site-to-Site VPN to an office or data center</td><td>IPsec tunnels with BGP or static routes.</td></tr>
<tr><td>Direct Connect gateway</td><td>A private fibre link via a transit virtual interface</td><td>Dedicated, predictable latency.</td></tr>
<tr><td>Peering</td><td>Another TGW (other Region or account)</td><td>Static routes only; no propagation.</td></tr>
<tr><td>Connect</td><td>SD-WAN or virtual appliances using GRE and BGP</td><td>Rides on top of a VPC or Direct Connect attachment.</td></tr></table>

<h3>One subnet per AZ</h3>
<p>When you attach a VPC you choose <b>one subnet in each Availability Zone</b> where you want to send traffic. The TGW creates a network interface in each chosen subnet. Traffic from an instance enters the TGW through the attachment in <b>its own AZ</b>. If you attach only <code>ap-south-1a</code>, instances in <code>ap-south-1b</code> have no entry door and their traffic does not flow. The common good practice is a small dedicated subnet (for example a /28) for the attachment, so security groups and NACLs for workloads do not mix with TGW plumbing.</p>

<h3>Peering versus Transit Gateway</h3>
<table class="cmp"><tr><th>Question</th><th>VPC peering</th><th>Transit Gateway</th></tr>
<tr><td>Scale</td><td>One link per pair</td><td>One attachment per spoke</td></tr>
<tr><td>Transitive?</td><td>No</td><td>Yes, if the TGW route tables allow it</td></tr>
<tr><td>Segmentation</td><td>By not creating a peering</td><td>By TGW route tables</td></tr>
<tr><td>Charges</td><td>No hourly charge; data transfer rules apply</td><td>Per attachment-hour plus per GB processed</td></tr>
<tr><td>Security group references</td><td>Possible across peered VPCs</td><td>Not possible; use CIDR ranges</td></tr></table>
<p>Cost structure, honestly: a TGW bills <b>per attachment per hour</b> and <b>per GB of data processed</b>. Rates vary by Region and change over time, so always read the current AWS Transit Gateway pricing page before you build. The guided-lab chapters show a worked example with clearly marked assumed numbers.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating the TGW and attachments but forgetting the route in each VPC route table. Choosing an attachment subnet in only one AZ while workloads run in two. Overlapping VPC CIDRs: a TGW cannot route to two VPCs that use the same range, so plan addressing first.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which service gives transitive routing between many VPCs?" is Transit Gateway, not peering. Remember also that a TGW is regional, while peering can cross Regions only between two VPCs directly.</p></div>

<div class="scn"><h4>Forty-five peerings and a Friday change</h4><p>A fintech had ten VPCs, one per team, joined by peerings. A new analytics VPC needed access to all ten, and the team spent two days adding ten peerings and twenty route entries. One missed route on the payments VPC caused a Friday-evening incident. They moved to a TGW: every VPC got one attachment and a single 10.0.0.0/8 route towards the hub, so adding the eleventh VPC became a 15-minute job.</p><p><b>Lesson:</b> a hub turns "n squared" work into "n" work, and it makes onboarding repeatable.</p></div>

<div class="iv"><p class="q">"When would you choose a Transit Gateway over VPC peering?"</p><p>A strong answer: when there are many VPCs or accounts, when you need transitive routing, a shared hub for VPN or Direct Connect, or central inspection. Mention the trade-off: peering has no hourly fee and can be cheaper for two or three VPCs with heavy traffic, while TGW adds per-hour and per-GB charges but removes the mesh.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering needs n(n−1)/2 links and is not transitive; a TGW needs one attachment per spoke.</li>
<li>A TGW is a regional managed router with its own route tables, separate from VPC route tables.</li>
<li>Attachment types: VPC, VPN, Direct Connect gateway, peering, Connect.</li>
<li>A VPC attachment uses one subnet per AZ, and traffic enters through the attachment in the sender's AZ.</li>
<li>TGW bills per attachment-hour and per GB processed; peering has no hourly fee.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>VPC peerings ka mesh kyun scale nahi karta, aur <b>Transit Gateway (TGW)</b> uski jagah kya karta hai.</li>
<li>Vocabulary: attachment, hub, spoke, TGW route table.</li>
<li>Attachment types (VPC, VPN, Direct Connect, peering, Connect) aur VPC attachment har Availability Zone ka ek subnet kaise use karta hai.</li>
<li>Peering ke muqable TGW ka kharcha asal mein kaisa hota hai.</li>
</ul>
<p><b>Prerequisites.</b> Is track ke pichhle modules se aapko VPC, subnets, route tables, security groups, NACLs, internet aur NAT gateways, aur VPC peering aani chahiye. Agar "longest prefix match" dhundhla hai to pehle routing chapter dobara dekho.</p>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. Is module ke do guided-lab chapters doosre raaste par safely le jaate hain. Is module ke in-app emulator labs (hub-and-spoke build aur segmentation ticket) wahi ideas ki extra practice hain.</p></div>

<h3>Airline hub ka analogy</h3>
<p>Indian domestic flights socho. Delhi, Mumbai, Bengaluru, Chennai aur Kolkata har doosre shehar ke liye direct flight chala sakte hain, yani 5 shehron ke liye 10 routes. Airlines aisa nahi karti. Woh passengers ko <b>hub</b> se bhejti hain: har shehar ki hub tak ek flight, aur aage hub jodta hai. Paanch shehar, paanch routes. Chhatha shehar jodo to sirf <b>ek</b> route badhta hai, paanch nahi. Transit Gateway aapke cloud network ka hub airport hai.</p>

<h3>Peering ki scale par problem</h3>
<p>Peering module mein aapne do baatein seekhi thi. Peering bilkul do VPCs ko jodti hai, aur peering <b>transitive nahi</b> hoti: A, B se peer hai aur B, C se, tab bhi A, B ke through C tak nahi pahunch sakta. Isliye <i>n</i> VPCs ko poora any-to-any jodne ke liye <i>n × (n − 1) / 2</i> peerings chahiye, aur har ek ke dono sides par routes.</p>
<div class="dia">`+e+`<p class="cap">Wahi paanch VPCs: peerings ke full mesh se (left) aur Transit Gateway se (right) juday hue.</p></div>
<div class="eg"><p><b>Worked example.</b> 5 VPCs: 5 × 4 / 2 = 10 peerings. 10 VPCs: 10 × 9 / 2 = <b>45</b> peerings, aur sambhalne ke liye 90 route entries (har peering ke dono sides par ek). TGW ke saath 10 VPCs ko <b>10 attachments</b> chahiye, aur har VPC route table mein TGW ki taraf ek route.</p></div>

<h3>Transit Gateway kya hai</h3>
<p><b>Transit Gateway</b> ek managed, regional virtual router hai. Aap ise patch, size ya login nahi karte. Ise ek AWS Region mein banate ho, phir <b>attachments</b> se cheezein jodte ho. TGW ke andar ek ya zyada <b>TGW route tables</b> tay karti hain ki packet agla kahan jaye. Har chapter mein aane wale terms:</p>
<dl class="terms">
<dt>Hub and spoke</dt><dd>Hub TGW hai. Spoke woh hai jo uske saath attached ho: VPC, VPN, Direct Connect gateway, ya doosra TGW.</dd>
<dt>Attachment</dt><dd>TGW aur ek spoke ke beech ka link. Har attachment ki ID <code>tgw-attach-</code> se shuru hoti hai.</dd>
<dt>TGW route table</dt><dd>TGW ke andar ki routing table. VPC route table se alag cheez hai. Chapter 2 batata hai dono saath kaise kaam karti hain.</dd>
<dt>Regional</dt><dd>Ek TGW ek Region mein rehta hai. Doosre Region ke VPCs do TGWs ke beech <b>peering attachment</b> se jude hote hain.</dd>
</dl>

<h3>Attachment types</h3>
<table class="cmp"><tr><th>Type</th><th>Kya jodta hai</th><th>Notes</th></tr>
<tr><td>VPC</td><td>Same Region ka VPC</td><td>Aapke chune har AZ ka ek subnet use karta hai. Routes automatically propagate ho sakte hain.</td></tr>
<tr><td>VPN</td><td>Office ya data center se Site-to-Site VPN</td><td>BGP ya static routes ke saath IPsec tunnels.</td></tr>
<tr><td>Direct Connect gateway</td><td>Transit virtual interface ke zariye private fibre link</td><td>Dedicated, predictable latency.</td></tr>
<tr><td>Peering</td><td>Doosra TGW (doosra Region ya account)</td><td>Sirf static routes; propagation nahi.</td></tr>
<tr><td>Connect</td><td>GRE aur BGP wale SD-WAN ya virtual appliances</td><td>VPC ya Direct Connect attachment ke upar chalta hai.</td></tr></table>

<h3>Har AZ ka ek subnet</h3>
<p>VPC attach karte waqt aap jin Availability Zones se traffic bhejna chahte ho unme <b>har AZ ka ek subnet</b> chunte ho. TGW har chune subnet mein ek network interface banata hai. Instance ka traffic <b>apne hi AZ</b> ke attachment se TGW mein jaata hai. Agar sirf <code>ap-south-1a</code> attach kiya, to <code>ap-south-1b</code> ke instances ke paas entry door nahi hai aur unka traffic nahi chalta. Aam good practice attachment ke liye chhota dedicated subnet (jaise /28) hai, taaki workloads ke security groups aur NACLs TGW plumbing se mix na hon.</p>

<h3>Peering versus Transit Gateway</h3>
<table class="cmp"><tr><th>Sawaal</th><th>VPC peering</th><th>Transit Gateway</th></tr>
<tr><td>Scale</td><td>Har pair ka ek link</td><td>Har spoke ka ek attachment</td></tr>
<tr><td>Transitive?</td><td>Nahi</td><td>Haan, agar TGW route tables allow karein</td></tr>
<tr><td>Segmentation</td><td>Peering na banakar</td><td>TGW route tables se</td></tr>
<tr><td>Charges</td><td>Hourly charge nahi; data transfer rules lagte hain</td><td>Per attachment-hour plus per GB processed</td></tr>
<tr><td>Security group references</td><td>Peered VPCs mein possible</td><td>Possible nahi; CIDR ranges use karo</td></tr></table>
<p>Kharche ka structure, imaandari se: TGW <b>per attachment per hour</b> aur <b>per GB data processed</b> bill karta hai. Rates Region ke hisaab se alag hote hain aur badalte rehte hain, isliye banane se pehle hamesha current AWS Transit Gateway pricing page padho. Guided-lab chapters clearly marked assumed numbers ke saath worked example dikhate hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> TGW aur attachments bana diye par har VPC route table mein route bhool gaye. Workloads do AZ mein hain par attachment subnet sirf ek AZ mein chuna. Overlapping VPC CIDRs: TGW same range use karne wale do VPCs tak route nahi kar sakta, isliye addressing pehle plan karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi service kai VPCs ke beech transitive routing deti hai?" ka jawab Transit Gateway hai, peering nahi. Yaad rakho TGW regional hai, jabki peering sirf do VPCs ke beech directly Regions cross kar sakti hai.</p></div>

<div class="scn"><h4>Paintalis peerings aur Friday ka change</h4><p>Ek fintech ke das VPCs the, har team ka ek, peerings se jude. Ek naye analytics VPC ko sab das tak access chahiye tha, aur team ne do din lagakar das peerings aur bees route entries jodi. Payments VPC par ek route chhoot gaya aur Friday shaam ko incident hua. Unhone TGW par move kiya: har VPC ko ek attachment mila aur hub ki taraf ek 10.0.0.0/8 route, to gyarahwa VPC jodna 15 minute ka kaam ho gaya.</p><p><b>Seekh:</b> hub "n square" kaam ko "n" kaam bana deta hai, aur onboarding repeatable ho jaati hai.</p></div>

<div class="iv"><p class="q">"Aap VPC peering ki jagah Transit Gateway kab chunoge?"</p><p>Strong answer: jab bahut VPCs ya accounts hon, transitive routing chahiye ho, VPN ya Direct Connect ke liye shared hub chahiye ho, ya central inspection chahiye. Trade-off batao: do-teen VPCs ke beech heavy traffic ho to peering sasti pad sakti hai kyunki uska hourly fee nahi hota, jabki TGW per-hour aur per-GB charge lagata hai par mesh hata deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering ko n(n−1)/2 links chahiye aur woh transitive nahi; TGW ko har spoke ka ek attachment.</li>
<li>TGW ek regional managed router hai jiski apni route tables hain, VPC route tables se alag.</li>
<li>Attachment types: VPC, VPN, Direct Connect gateway, peering, Connect.</li>
<li>VPC attachment har AZ ka ek subnet use karta hai, aur traffic sender ke AZ ke attachment se andar jaata hai.</li>
<li>TGW per attachment-hour aur per GB processed bill karta hai; peering ka hourly fee nahi.</li>
</ul></div>
`}};export{t as default};