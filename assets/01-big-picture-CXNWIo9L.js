var e={id:`big-picture`,h:{en:`L3VPN over segment routing: the big picture`,hi:`Segment routing par L3VPN: badi tasveer`},body:{en:`
<p>Think of a courier company. Parcels from many shops travel on the same trucks, yet every parcel has a sticker that tells the destination depot which shop it belongs to. A layer-3 VPN over segment routing works the same way: the core trucks carry any customer's packets, and a small inner label says which customer they are.</p>

<h3>What you will learn</h3>
<ul>
<li>How a customer VRF, route distinguisher and route targets fit together.</li>
<li>How IS-IS segment routing replaces LDP as the transport.</li>
<li>How MP-BGP VPNv4 carries customer routes between PE loopbacks.</li>
<li>How the two-label stack is built, read and verified.</li>
<li>How to find and fix the faults you will meet in the labs and tickets.</li>
</ul>
<div class="note"><b>Prerequisites.</b> Finish sre-start first. You should be comfortable with IS-IS basics, iBGP between loopbacks, and the label arithmetic SRGB base plus index.</div>

<h3>The service we are building</h3>
<p>Ananta Foods has an office in Mumbai and another in Chennai. It wants one private network between them over the provider core. Our provider has five routers: PE1, P1, P2, P3 and PE2. CE1 at Mumbai sits behind PE1; CE2 at Chennai sits behind PE2.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two-label VPN path">
<rect x="10" y="70" width="70" height="40" rx="8" fill="#fde68a"/><text x="45" y="95" text-anchor="middle" class="svg-ink" font-size="12">CE1</text>
<rect x="120" y="70" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="260" y="70" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">P routers</text>
<rect x="450" y="70" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="560" y="70" width="70" height="40" rx="8" fill="#fde68a"/><text x="595" y="95" text-anchor="middle" class="svg-ink" font-size="12">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="80" y1="90" x2="120" y2="90"/><line x1="190" y1="90" x2="260" y2="90"/><line x1="380" y1="90" x2="450" y2="90"/><line x1="520" y1="90" x2="560" y2="90"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">[ transport 16005 ] [ VPN label ] [ customer packet ]</text>
<text x="155" y="140" text-anchor="middle" class="svg-ink" font-size="11">VRF CUST_A</text><text x="485" y="140" text-anchor="middle" class="svg-ink" font-size="11">VRF CUST_A</text>
</svg><p class="cap">PE1 pushes two labels: the outer one reaches PE2 across the core, the inner one picks the VRF.</p></div>

<h3>The four ingredients</h3>
<dl class="terms">
<dt>Underlay</dt><dd>IS-IS level 2 with wide metrics and segment routing, so every PE loopback has a label.</dd>
<dt>VRFs</dt><dd>CUST_A on each PE, with RD and RT 65000:1.</dd>
<dt>iBGP VPNv4</dt><dd>A session between PE loopbacks in AS 65000, with extended communities enabled.</dd>
<dt>PE-CE routing</dt><dd>eBGP to CE1 (AS 65101) and CE2 (AS 65102).</dd></dl>
<p>No LDP is used at all. The label for PE2 is simply 16000 plus 5, learned from IS-IS.</p>

<div class="eg"><b>Worked example.</b> PC1 (172.16.1.10) pings PC2 (172.16.2.10). CE1 sends to PE1. PE1 looks up 172.16.2.0/24 in CUST_A and finds next hop 10.0.255.5 with VPN label, say 24. It pushes 24, then pushes 16005 for the trip to PE2. The P routers only look at 16005. PE2 pops the transport label, sees 24, and delivers the packet into CUST_A towards CE2.</div>

<div class="warn"><b>Common mistake.</b> Verifying only BGP. A VPN needs both control plane (routes with the right RT) and data plane (a labelled path). Check both.</div>

<div class="scn"><h4>Everything green, nothing working</h4><p>A new customer reported no connectivity although the BGP summary showed routes. The engineer ran a traceroute from PE1 and saw it stopped at P1. P1 had no SR in its IS-IS process. After one line was added, the customer was live.</p><p><b>Lesson:</b> a healthy BGP table does not prove the transport works.</p></div>

<div class="iv"><p class="q">"Explain how traffic flows in an MPLS L3VPN."</p><p>Name the two labels. The outer transport label gets the packet to the egress PE; the inner VPN label selects the VRF there. Mention that with SR the transport label comes from IS-IS, not from LDP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An L3VPN needs underlay, VRFs, VPNv4 and PE-CE routing.</li>
<li>Two labels: transport (16005 for PE2) and VPN.</li>
<li>With SR there is no LDP.</li>
<li>Verify both control plane and data plane.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho. Kai dukaanon ke parcels same trucks par jaate hain, par har parcel par ek sticker hota hai jo destination depot ko batata hai ki woh kis dukaan ka hai. Segment routing par layer-3 VPN bhi aise hi kaam karta hai: core ke trucks kisi bhi customer ke packets le jaate hain, aur chhota andar wala label batata hai ki woh kaunse customer ke hain.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Customer VRF, route distinguisher aur route targets kaise jude hain.</li>
<li>IS-IS segment routing LDP ki jagah transport kaise banta hai.</li>
<li>MP-BGP VPNv4 PE loopbacks ke beech customer routes kaise le jaata hai.</li>
<li>Do-label stack kaise banta, padha aur verify kiya jaata hai.</li>
<li>Labs aur tickets mein milne wale faults kaise dhoondhe aur theek kiye jaate hain.</li>
</ul>
<div class="note"><b>Prerequisites.</b> Pehle sre-start poora karo. IS-IS basics, loopbacks ke beech iBGP, aur label ganit SRGB base plus index mein aaram hona chahiye.</div>

<h3>Jo service hum bana rahe hain</h3>
<p>Ananta Foods ka ek office Mumbai mein aur doosra Chennai mein hai. Use provider core par dono ke beech ek private network chahiye. Hamare provider ke paas paanch routers hain: PE1, P1, P2, P3 aur PE2. Mumbai ka CE1 PE1 ke peeche hai; Chennai ka CE2 PE2 ke peeche.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two-label VPN path">
<rect x="10" y="70" width="70" height="40" rx="8" fill="#fde68a"/><text x="45" y="95" text-anchor="middle" class="svg-ink" font-size="12">CE1</text>
<rect x="120" y="70" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="260" y="70" width="120" height="40" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="12">P routers</text>
<rect x="450" y="70" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="560" y="70" width="70" height="40" rx="8" fill="#fde68a"/><text x="595" y="95" text-anchor="middle" class="svg-ink" font-size="12">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="80" y1="90" x2="120" y2="90"/><line x1="190" y1="90" x2="260" y2="90"/><line x1="380" y1="90" x2="450" y2="90"/><line x1="520" y1="90" x2="560" y2="90"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">[ transport 16005 ] [ VPN label ] [ customer packet ]</text>
<text x="155" y="140" text-anchor="middle" class="svg-ink" font-size="11">VRF CUST_A</text><text x="485" y="140" text-anchor="middle" class="svg-ink" font-size="11">VRF CUST_A</text>
</svg><p class="cap">PE1 do labels push karta hai: bahar wala core ke paar PE2 tak pahunchata hai, andar wala VRF chunta hai.</p></div>

<h3>Chaar ingredients</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Wide metrics aur segment routing ke saath IS-IS level 2, taaki har PE loopback ka label ho.</dd>
<dt>VRFs</dt><dd>Har PE par CUST_A, RD aur RT 65000:1 ke saath.</dd>
<dt>iBGP VPNv4</dt><dd>AS 65000 mein PE loopbacks ke beech session, extended communities on ke saath.</dd>
<dt>PE-CE routing</dt><dd>CE1 (AS 65101) aur CE2 (AS 65102) ke saath eBGP.</dd></dl>
<p>LDP bilkul use nahi hota. PE2 ka label seedha 16000 plus 5 hai, jo IS-IS se seekha jaata hai.</p>

<div class="eg"><b>Worked example.</b> PC1 (172.16.1.10) PC2 (172.16.2.10) ko ping karta hai. CE1 PE1 ko bhejta hai. PE1 CUST_A mein 172.16.2.0/24 dekhta hai aur next hop 10.0.255.5 milta hai, VPN label maan lo 24. Woh 24 push karta hai, phir PE2 tak ke safar ke liye 16005. P routers sirf 16005 dekhte hain. PE2 transport label pop karta hai, 24 dekhta hai, aur packet ko CUST_A mein CE2 ki taraf deliver karta hai.</div>

<div class="warn"><b>Common mistake.</b> Sirf BGP verify karna. VPN ko control plane (sahi RT ke saath routes) aur data plane (labelled path) dono chahiye. Dono check karo.</div>

<div class="scn"><h4>Sab green, kuch nahi chal raha</h4><p>Ek naye customer ne connectivity nahi hone ki shikayat ki jabki BGP summary mein routes the. Engineer ne PE1 se traceroute chalaya aur dekha ki woh P1 par ruk gaya. P1 ke IS-IS process mein SR nahi tha. Ek line jodne ke baad customer live ho gaya.</p><p><b>Lesson:</b> healthy BGP table ka matlab transport chal raha hai yeh nahi hota.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN mein traffic kaise flow karta hai samjhao."</p><p>Do labels ke naam lo. Bahar wala transport label packet ko egress PE tak pahunchata hai; andar wala VPN label wahan VRF chunta hai. Batao ki SR ke saath transport label IS-IS se aata hai, LDP se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN ko underlay, VRFs, VPNv4 aur PE-CE routing chahiye.</li>
<li>Do labels: transport (PE2 ke liye 16005) aur VPN.</li>
<li>SR ke saath LDP nahi hota.</li>
<li>Control plane aur data plane dono verify karo.</li>
</ul></div>
`}};export{e as default};