var e={id:`enabling-autovpn`,h:{en:`Enabling AutoVPN: modes, hubs, subnets and conflicts`,hi:`AutoVPN enable karna: modes, hubs, subnets aur conflicts`},body:{en:`
<h3>Three modes, one page</h3>
<p>Everything starts on the <b>Site-to-site VPN</b> page of each network. Every MX has one of three <b>VPN modes</b>:</p>
<ul>
<li><b>None</b>: the MX takes no part in AutoVPN. No tunnels, no VPN routes.</li>
<li><b>Hub</b>: the MX is a meeting point. Spokes build tunnels to it and it waits for them.</li>
<li><b>Spoke</b>: the MX builds tunnels towards the hubs you list for it.</li>
</ul>
<p>A tunnel needs <b>both ends to agree</b>. Setting MX-BLR to spoke and listing MX-MUM does nothing useful if MX-MUM is still on mode None. Think of a phone call: the spoke dials, the hub must have a phone switched on.</p>

<h3>Choosing hubs and their order</h3>
<p>A spoke has a <b>hub list</b>. The order of the list is the <b>priority</b>: the first hub is preferred, the second is the backup. Bharat Retail Co has a single hub, MX-MUM. If a second data centre were added, the spokes would list MX-MUM first and the new hub second. Traffic to a destination that exists behind both hubs prefers the first hub while its tunnel is up, and moves to the next when it is not. Put the hub that is closest to the servers and has the best circuits first.</p>
<p>Which site should be a hub? A site with a stable public address, good internet circuits and where the shared servers live. Mumbai HQ has two circuits (ILL-MUM-01 on wan1 and BB-MUM-02 on wan2), so it is a strong hub. Branches are spokes.</p>

<h3>Which subnets join the VPN</h3>
<p>Turning on a mode does not put every VLAN into the tunnel. On the same page there is a table of the local subnets, and each one has a <b>Use VPN</b> choice (yes or no). Only subnets marked yes are advertised to the other sites. This is a <b>policy decision</b>: you share what other sites need and keep the rest local. In this module's plan:</p>
<pre class="out">Site-to-site VPN  (network: Mumbai HQ)
Mode : hub
VLAN  Name         Subnet         Use VPN
10    Staff        10.1.10.0/24   yes
20    Servers      10.1.20.0/24   yes
30    Guest        10.1.30.0/24   <span class="hl">no</span>
99    Management   10.1.99.0/24   <span class="hl">no</span></pre>
<p>Guests never need Mumbai, so VLAN 30 stays local to each site and guest traffic goes straight to the internet. Management VLAN 99 stays off the VPN so that device management is not routed across the company without a reason. If a subnet has no yes at all, that site has <b>nothing to offer or ask for</b> and its tunnel will not carry anything. In fact the tunnel does not come up when a side has no VPN subnet enabled.</p>

<h3>Overlapping subnets: the classic conflict</h3>
<p>Routing needs every subnet to be unique. Our design gives each city its own second octet: 10.1.x.x Mumbai, 10.2.x.x Bengaluru, 10.3.x.x Delhi. If someone builds a new store as 10.2.10.0/24 too, the same subnet exists in two places and the dashboard cannot know where to send packets for it. The simulator flags this as a <b>conflict</b> and does not route the overlapping subnet. The cure is to renumber one site or to keep that subnet out of the VPN.</p>
<pre class="out">Site-to-site VPN  (network: Delhi Branch)
Mode : spoke      Hubs : 1 MX-MUM
VLAN  Name      Subnet         Use VPN   Status
10    Staff     10.2.10.0/24   yes       <span class="hl">conflict with Bengaluru Branch VLAN 10</span>
20    Servers   10.3.20.0/24   yes       ok</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Spoke hub list and VPN subnets">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM  mode: hub</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.1.10.0/24</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.1.20.0/24</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR  mode: spoke</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">hubs: 1 MX-MUM</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.2.10.0/24</text>
<line x1="210" y1="60" x2="430" y2="60" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">both ends agree</text>
<rect x="20" y="130" width="600" height="60" rx="8" fill="#fde68a"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Guest (30) and Management (99) stay out of the VPN: Use VPN = no</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">Two sites must never share the same VPN subnet</text>
</svg><p class="cap">A tunnel needs a mode on both sides, a hub in the spoke's list and subnets enabled for VPN.</p></div>

<h3>Firewall rules for VPN traffic: the concept</h3>
<p>The tunnel carries packets, but it does not decide whether they are <i>allowed</i>. That is still the job of your firewall policy. The idea to hold: if guests are denied access to servers in the Firewall page, you must keep that intent for traffic that goes over the VPN as well, for example a guest phone in Bengaluru trying to reach 10.1.20.10 in Mumbai. Whether VPN traffic has its own separate rule list in a real product, and how, is in the vendor documentation. In our simulator, treat the Firewall page order (first match wins) as the policy you verify after the tunnel is up.</p>

<div class="eg"><p><b>Worked example.</b> Enable AutoVPN for Bharat Retail Co. (1) MX-MUM: mode hub, VLANs 10 and 20 yes, 30 and 99 no. (2) MX-BLR: mode spoke, hub list MX-MUM, VLANs 10 and 20 yes. (3) MX-DEL: same with its own subnets. (4) Click <b>Save changes</b>. On the wire: each spoke now tries to build a tunnel to the Mumbai hub; the routing table of each MX gains routes for the other sites' VPN subnets.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Setting a mode starts or stops tunnel building. Editing the hub list changes which hub is preferred. Each Use VPN yes adds a route that is advertised to the other sites. Nothing here changes DHCP or VLAN addressing.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Leaving the hub on mode None; forgetting to list the hub on the spoke; enabling all VLANs including Management and Guest; reusing a subnet at two sites; reordering hubs without realising the first one is the preferred path.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The spoke is configured but no tunnel." Check both ends have a mode, the hub is in the spoke's list, and at least one subnet is enabled on each side.</p></div>

<div class="scn"><h4>The new store that took Bengaluru offline</h4><p>A pop-up store in Pune was cloned from the Bengaluru plan and joined the VPN with the same 10.2.10.0/24 staff subnet. The dashboard showed a subnet conflict. Bengaluru staff reached Mumbai intermittently and Pune staff could not reach it at all. The engineer renumbered Pune to 10.4.10.0/24 and the conflict cleared.</p><p><b>Lesson:</b> keep an address plan. Every VPN subnet must be unique across all sites.</p></div>

<div class="iv"><p class="q">"What do you configure to bring up AutoVPN between a hub and a spoke?"</p><p>Strong answer: set the hub MX to mode hub, set the branch MX to mode spoke and list the hub (order gives priority), choose which local subnets use VPN, make sure subnets do not overlap, and save. Then verify the tunnel state and that the firewall policy still holds across the tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes are none, hub and spoke; both ends must take part.</li>
<li>A spoke's hub list order is the hub priority.</li>
<li>Only subnets marked Use VPN are shared; Guest and Management usually stay out.</li>
<li>Overlapping VPN subnets are flagged as a conflict and not routed.</li>
<li>The tunnel does not replace firewall policy.</li>
</ul></div>
`,hi:`
<h3>Teen modes, ek page</h3>
<p>Sab kuch har network ke <b>Site-to-site VPN</b> page se shuru hota hai. Har MX ka ek <b>VPN mode</b> hota hai, teen mein se:</p>
<ul>
<li><b>None</b>: MX AutoVPN mein hissa nahi leta. Na tunnels, na VPN routes.</li>
<li><b>Hub</b>: MX ek meeting point hai. Spokes uske tak tunnel banate hain aur woh unka intezaar karta hai.</li>
<li><b>Spoke</b>: MX un hubs ki taraf tunnels banata hai jo aap uske liye list karte ho.</li>
</ul>
<p>Tunnel ke liye <b>dono ends ka agree hona</b> zaroori hai. MX-BLR ko spoke set karke MX-MUM list karna kisi kaam ka nahi agar MX-MUM abhi bhi mode None par hai. Phone call ki tarah socho: spoke dial karta hai, hub ka phone on hona chahiye.</p>

<h3>Hubs aur unka order chunna</h3>
<p>Spoke ke paas ek <b>hub list</b> hoti hai. List ka order hi <b>priority</b> hai: pehla hub preferred hai, doosra backup. Bharat Retail Co ka ek hi hub hai, MX-MUM. Agar doosra data centre add hota, to spokes MX-MUM ko pehle aur naye hub ko doosre number par list karte. Jo destination dono hubs ke peeche hai uska traffic pehle hub ko prefer karta hai jab tak uska tunnel up hai, aur nahi hone par agle par chala jaata hai. Jo hub servers ke sabse paas hai aur jiske circuits sabse achhe hain use pehle rakho.</p>
<p>Hub kaunsi site ho? Jiska public address stable ho, internet circuits achhe hon aur jahan shared servers hon. Mumbai HQ ke do circuits hain (wan1 par ILL-MUM-01 aur wan2 par BB-MUM-02), isliye woh strong hub hai. Branches spokes hain.</p>

<h3>Kaunse subnets VPN mein jaate hain</h3>
<p>Mode on karne se har VLAN tunnel mein nahi jaata. Usi page par local subnets ki table hai aur har ek ka <b>Use VPN</b> choice hota hai (yes ya no). Sirf yes wale subnets doosri sites ko advertise hote hain. Yeh ek <b>policy decision</b> hai: jo doosri sites ko chahiye woh share karo, baaki local rakho. Is module ke plan mein:</p>
<pre class="out">Site-to-site VPN  (network: Mumbai HQ)
Mode : hub
VLAN  Name         Subnet         Use VPN
10    Staff        10.1.10.0/24   yes
20    Servers      10.1.20.0/24   yes
30    Guest        10.1.30.0/24   <span class="hl">no</span>
99    Management   10.1.99.0/24   <span class="hl">no</span></pre>
<p>Guests ko kabhi Mumbai nahi chahiye, isliye VLAN 30 har site par local rehta hai aur guest traffic seedha internet jaata hai. Management VLAN 99 VPN se bahar rehta hai taaki device management bina wajah poori company mein route na ho. Agar kisi site ke kisi subnet par yes nahi hai, to us site ke paas <b>dene ya maangne ko kuch nahi</b> hai aur uska tunnel kuch carry nahi karta. Darasal jab kisi side par koi VPN subnet enabled na ho to tunnel up hi nahi hota.</p>

<h3>Overlapping subnets: classic conflict</h3>
<p>Routing ke liye har subnet unique hona chahiye. Humare design mein har city ko apna second octet mila hai: 10.1.x.x Mumbai, 10.2.x.x Bengaluru, 10.3.x.x Delhi. Agar koi naya store bhi 10.2.10.0/24 bana de, to ek hi subnet do jagah hai aur dashboard nahi jaan sakta ki us ke packets kahan bhejne hain. Simulator ise <b>conflict</b> flag karta hai aur overlapping subnet ko route nahi karta. Ilaaj: ek site ko renumber karo ya us subnet ko VPN se bahar rakho.</p>
<pre class="out">Site-to-site VPN  (network: Delhi Branch)
Mode : spoke      Hubs : 1 MX-MUM
VLAN  Name      Subnet         Use VPN   Status
10    Staff     10.2.10.0/24   yes       <span class="hl">conflict with Bengaluru Branch VLAN 10</span>
20    Servers   10.3.20.0/24   yes       ok</pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Spoke hub list aur VPN subnets">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM  mode: hub</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.1.10.0/24</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.1.20.0/24</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR  mode: spoke</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">hubs: 1 MX-MUM</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">VPN: 10.2.10.0/24</text>
<line x1="210" y1="60" x2="430" y2="60" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="52" text-anchor="middle" class="svg-accent" font-size="12">dono ends agree</text>
<rect x="20" y="130" width="600" height="60" rx="8" fill="#fde68a"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Guest (30) aur Management (99) VPN se bahar: Use VPN = no</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">Do sites ka VPN subnet kabhi same nahi hona chahiye</text>
</svg><p class="cap">Tunnel ko dono sides par mode, spoke ki list mein hub aur VPN ke liye enabled subnets chahiye.</p></div>

<h3>VPN traffic ke liye firewall rules: concept</h3>
<p>Tunnel packets le jaata hai, lekin yeh decide nahi karta ki woh <i>allowed</i> hain ya nahi. Yeh abhi bhi aapki firewall policy ka kaam hai. Yaad rakhne wali baat: agar Firewall page mein guests ko servers se deny kiya hai, to wahi intent VPN se jaane wale traffic par bhi rakhna padega, jaise Bengaluru ka guest phone Mumbai ke 10.1.20.10 tak pahunchne ki koshish kare. Real product mein VPN traffic ki alag rule list hoti hai ya nahi, aur kaise, yeh vendor documentation mein hai. Humare simulator mein Firewall page ke order (pehla match jeetta hai) ko woh policy maano jo tunnel up hone ke baad verify karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Co ke liye AutoVPN enable karo. (1) MX-MUM: mode hub, VLANs 10 aur 20 yes, 30 aur 99 no. (2) MX-BLR: mode spoke, hub list MX-MUM, VLANs 10 aur 20 yes. (3) MX-DEL: waisa hi apne subnets ke saath. (4) <b>Save changes</b> click karo. Wire par: har spoke ab Mumbai hub tak tunnel banane ki koshish karta hai; har MX ke routing table mein doosri sites ke VPN subnets ke routes aa jaate hain.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Mode set karne se tunnel building shuru ya band hoti hai. Hub list edit karne se preferred hub badalta hai. Har Use VPN yes ek route add karta hai jo doosri sites ko advertise hota hai. Yahan DHCP ya VLAN addressing nahi badalti.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Hub ko mode None par chhod dena; spoke par hub list karna bhool jaana; Management aur Guest samet saari VLANs enable karna; do sites par ek hi subnet; hubs ka order badalna bina yeh samjhe ki pehla hub preferred path hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Spoke configured hai lekin tunnel nahi." Check karo dono ends ka mode hai, hub spoke ki list mein hai, aur dono sides par kam se kam ek subnet enabled hai.</p></div>

<div class="scn"><h4>Naya store jisne Bengaluru ko offline kar diya</h4><p>Pune ka ek pop-up store Bengaluru plan se clone hua aur wahi 10.2.10.0/24 staff subnet ke saath VPN mein juda. Dashboard ne subnet conflict dikhaya. Bengaluru staff Mumbai tak kabhi kabhi pahunch paata tha aur Pune staff bilkul nahi. Engineer ne Pune ko 10.4.10.0/24 renumber kiya aur conflict clear ho gaya.</p><p><b>Seekh:</b> address plan rakho. Har VPN subnet saari sites mein unique hona chahiye.</p></div>

<div class="iv"><p class="q">"Hub aur spoke ke beech AutoVPN up karne ke liye aap kya configure karte ho?"</p><p>Strong answer: hub MX ko mode hub, branch MX ko mode spoke set karo aur hub list karo (order priority deta hai), choose karo kaunse local subnets VPN use karein, dhyan rakho ki subnets overlap na karein, aur save karo. Phir tunnel state verify karo aur yeh bhi ki tunnel ke across firewall policy kaayam hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes none, hub aur spoke hain; dono ends ko hissa lena hota hai.</li>
<li>Spoke ki hub list ka order hub priority hai.</li>
<li>Sirf Use VPN wale subnets share hote hain; Guest aur Management aam taur par bahar rehte hain.</li>
<li>Overlapping VPN subnets conflict flag hote hain aur route nahi hote.</li>
<li>Tunnel firewall policy ki jagah nahi leta.</li>
</ul></div>
`}};export{e as default};