var e={id:`ipsec-dialup-hub`,h:{en:`Dial-up hub design: the dynamic template, instances and policies`,hi:`Dial-up hub design: dynamic template, instances aur policies`},body:{en:`
<p>Think of the head office reception in Chennai. The receptionist does not keep a separate desk for every visitor. She has one counter, and every visitor who arrives gets a numbered badge. Kaveri Retail builds its VPN hub the same way. The hub <b>HQ-FGT</b> does not know in advance which branch will knock or from which address. It publishes one counter, the <b>dynamic phase 1</b> called <code>KR-ADVPN</code>, and every spoke that authenticates receives its own numbered tunnel. This chapter prepares lab <b>n7-ipsec-hub</b>, the hub half of tasks 1 and 2.</p>

<h3>Static versus dial-up</h3>
<p>A <b>static</b> phase 1 has a fixed <code>remote-gw</code>: one peer, one tunnel. That is what each spoke uses, because every spoke knows the hub address 203.0.113.1. A <b>dial-up</b> phase 1 uses <code>set type dynamic</code>: no remote gateway is configured, so the unit only <i>responds</i>. With two branches (MDU-FGT and TRY-FGT) a static design on the hub would need two phase 1 objects, and ten branches would need ten. With the dynamic type you write one phase 1 and one phase 2 and every future branch reuses them.</p>
<table class="cmp"><tr><th></th><th>Static (spoke)</th><th>Dynamic (hub)</th></tr>
<tr><td>remote-gw</td><td>203.0.113.1 (the hub)</td><td>not set</td></tr>
<tr><td>Who starts IKE</td><td>the spoke (initiator)</td><td>nobody, it waits (responder)</td></tr>
<tr><td>Tunnels per object</td><td>1</td><td>one instance per spoke</td></tr>
<tr><td>Name in lab</td><td>TO-HQ / TO-HQ-P2</td><td>KR-ADVPN / KR-P2</td></tr></table>

<h3>The template and its instances</h3>
<p>The dynamic phase 1 is a <b>template</b>. It never goes "up" itself, so do not expect to see it carrying traffic. Each time a spoke completes IKE, the FortiGate clones the template into an <b>instance</b> named <code>&lt;template&gt;_&lt;n&gt;</code>: the first spoke becomes <code>KR-ADVPN_0</code>, the second <code>KR-ADVPN_1</code>. The instance number is only the order of arrival. If TRY-FGT connects first it is _0, and after a reboot the numbers can be swapped. Never write a rule that depends on the number; always identify a spoke by its remote address, 203.0.113.11 for MDU-FGT and 203.0.113.12 for TRY-FGT.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Dial-up template and instances">
<rect x="230" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT 203.0.113.1</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">template KR-ADVPN</text>
<rect x="40" y="150" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="135" y="174" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT .11</text><text x="135" y="193" text-anchor="middle" class="svg-muted" font-size="12">spoke phase 1 TO-HQ</text>
<rect x="410" y="150" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="505" y="174" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT .12</text><text x="505" y="193" text-anchor="middle" class="svg-muted" font-size="12">spoke phase 1 TO-HQ</text>
<line x1="270" y1="80" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="108" text-anchor="middle" class="svg-accent" font-size="12">KR-ADVPN_0</text><text x="460" y="108" text-anchor="middle" class="svg-accent" font-size="12">KR-ADVPN_1</text>
</svg><p class="cap">One template on the hub, one numbered instance per connected spoke.</p></div>

<h3>Responder rules for selectors</h3>
<p>On a dynamic phase 2 the usual design is selectors <code>0.0.0.0/0</code> on both sides. As responder the hub then accepts whatever the spoke proposes. A static initiator with the same wide selectors shows <b>1/1</b> in the tunnel summary. That is the simplest and most reliable setup, because routing, not the selectors, decides which traffic enters the tunnel. Chapter 3 explained why.</p>

<h3>The hub configuration</h3>
<pre class="code"><span class="c">! phase 1 template</span>
config vpn ipsec phase1-interface
  edit "KR-ADVPN"
    set type dynamic
    set interface "port1"
    set ike-version 2
    set proposal aes256-sha256
    set dhgrp 14
    set psksecret Kaveri-IPsec-2026
    set exchange-interface-ip enable
    set add-route enable
  next
end
<span class="c">! phase 2 with PFS and wide selectors</span>
config vpn ipsec phase2-interface
  edit "KR-P2"
    set phase1name "KR-ADVPN"
    set proposal aes256-sha256
    set dhgrp 14
    set src-subnet 0.0.0.0 0.0.0.0
    set dst-subnet 0.0.0.0 0.0.0.0
  next
end
<span class="c">! tunnel interface addressing (chapter 4)</span>
config system interface
  edit "KR-ADVPN"
    set ip 10.255.1.1 255.255.255.255
    set remote-ip 10.255.1.254 255.255.255.0
  next
end</pre>
<p>Creating the phase 1 automatically creates the interface <code>KR-ADVPN</code>; you then give it the overlay address. Remember the addressing rule: hub <code>ip</code> is 10.255.1.1/32 and <code>remote-ip</code> is 10.255.1.254/24, which installs the connected-style route for the whole overlay 10.255.1.0/24.</p>

<h3>The firewall policy requirement</h3>
<p>The first gate of the phase 1 checks is not cryptographic. If the tunnel interface is not named in any firewall policy, the FortiGate answers the spoke with silence and logs <code>ignoring IKE request, no policy configured</code>. So before TRY-FGT can come up you need policies on HQ-FGT that use <code>KR-ADVPN</code>: LAN to tunnel and tunnel to LAN. The spoke needs the same on its own <code>TO-HQ</code> interface. Later, for spoke-to-spoke traffic, the hub also needs a policy from <code>KR-ADVPN</code> to <code>KR-ADVPN</code>; chapter 8 explains it.</p>
<pre class="code">config firewall policy
  edit 10
    set name "LAN-to-spokes"
    set srcintf "port2"
    set dstintf "KR-ADVPN"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "ALL"
  next
  edit 11
    set name "spokes-to-LAN"
    set srcintf "KR-ADVPN"
    set dstintf "port2"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "ALL"
  next
end</pre>

<h3>Verifying the hub</h3>
<pre class="out">HQ-FGT # get vpn ipsec tunnel summary
'KR-ADVPN_0' <span class="hl">203.0.113.12:0  selectors(total,up): 1/1</span>  rx(pkt,err): 12/0  tx(pkt,err): 12/0
'KR-ADVPN_1' <span class="hl">203.0.113.11:0  selectors(total,up): 1/1</span>  rx(pkt,err): 9/0  tx(pkt,err): 9/0</pre>
<p>Read it per line: the name is the instance, the address is the spoke, and <code>1/1</code> means one selector exists and one is up. With <code>add-route enable</code> (the default on the hub) and <code>exchange-interface-ip enable</code> on both sides, the hub also installs a /32 route with distance 15 to each spoke tunnel IP. Check it with <code>get router info routing-table all</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Waiting for the template <code>KR-ADVPN</code> to show "up". Only instances come up. Another mistake is writing the tunnel policy for <code>port2 to port1</code> instead of <code>port2 to KR-ADVPN</code>: the IKE packets then die with the "no policy configured" message even though the PSK is right.</p></div>

<div class="exam"><p><b>Exam trap.</b> A dial-up hub can only respond. If the question asks which side must start the negotiation, the answer is the spoke. And a dynamic template with an instance name such as <code>KR-ADVPN_0</code> is not a second phase 1; it is a clone created at runtime.</p></div>

<div class="scn"><h4>Trichy joins, Madurai does not</h4><p>On Monday TRY-FGT came up at once, but MDU-FGT never did. The hub showed only <code>KR-ADVPN_0</code> for 203.0.113.12. The engineer built MDU-FGT with the same phase 1 and found the spoke complaining about timeouts. A quick ping from MDU-FGT to 203.0.113.1 worked, so UDP/500 was the next suspect; once the ISP rule for 203.0.113.11 was fixed the second instance appeared as <code>KR-ADVPN_1</code>. No change on the hub was needed.</p><p><b>Lesson:</b> the dial-up template accepts new spokes without any hub change; if one spoke is missing, check its underlay and its own policy first.</p></div>

<div class="iv"><p class="q">"Why use a dynamic phase 1 on the hub instead of one tunnel per branch?"</p><p>Explain that the hub does not know spoke addresses in advance, so one template plus one phase 2 serve every branch and each connection becomes an instance named template_n. Mention the cost: only spokes can initiate, and you must secure the template with a strong PSK and the policy requirement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub uses <code>type dynamic</code> and only responds; spokes are static and initiate.</li>
<li>The template never comes up; each spoke gets an instance <code>KR-ADVPN_0</code>, <code>_1</code>.</li>
<li>Wide 0.0.0.0/0 selectors on the responder accept whatever the spoke proposes.</li>
<li>No firewall policy on the tunnel interface means the IKE request is ignored.</li>
<li>Check <code>get vpn ipsec tunnel summary</code> for instance, spoke address and selectors up.</li>
</ul></div>
`,hi:`
<p>Chennai ke head office ki reception socho. Receptionist har visitor ke liye alag desk nahi rakhti. Ek counter hota hai, aur jo bhi visitor aata hai use ek numbered badge milta hai. Kaveri Retail apna VPN hub bilkul aise hi banata hai. Hub <b>HQ-FGT</b> ko pehle se nahi pata ki kaunsi branch kab aur kis address se aayegi. Woh ek counter publish karta hai, <b>dynamic phase 1</b> jiska naam <code>KR-ADVPN</code> hai, aur har spoke jo authenticate karta hai use apna numbered tunnel milta hai. Yeh chapter lab <b>n7-ipsec-hub</b> ki taiyari hai, tasks 1 aur 2 ka hub wala hissa.</p>

<h3>Static versus dial-up</h3>
<p><b>Static</b> phase 1 mein fixed <code>remote-gw</code> hota hai: ek peer, ek tunnel. Har spoke yahi use karta hai, kyunki sabko hub address 203.0.113.1 pata hai. <b>Dial-up</b> phase 1 <code>set type dynamic</code> use karta hai: koi remote gateway configure nahi hota, isliye unit sirf <i>respond</i> karta hai. Do branches (MDU-FGT aur TRY-FGT) ke liye hub par static design mein do phase 1 objects lagte, aur das branches ke liye das. Dynamic type mein ek phase 1 aur ek phase 2 likhte ho aur har future branch unhi ko reuse karti hai.</p>
<table class="cmp"><tr><th></th><th>Static (spoke)</th><th>Dynamic (hub)</th></tr>
<tr><td>remote-gw</td><td>203.0.113.1 (hub)</td><td>set nahi hota</td></tr>
<tr><td>IKE kaun start karta hai</td><td>spoke (initiator)</td><td>koi nahi, intezaar karta hai (responder)</td></tr>
<tr><td>Ek object par tunnels</td><td>1</td><td>har spoke ke liye ek instance</td></tr>
<tr><td>Lab mein naam</td><td>TO-HQ / TO-HQ-P2</td><td>KR-ADVPN / KR-P2</td></tr></table>

<h3>Template aur uske instances</h3>
<p>Dynamic phase 1 ek <b>template</b> hai. Yeh khud kabhi "up" nahi hota, isliye ismein traffic chalne ki ummeed mat rakho. Jab bhi koi spoke IKE complete karta hai, FortiGate template ko clone karke ek <b>instance</b> banata hai jiska naam <code>&lt;template&gt;_&lt;n&gt;</code> hota hai: pehla spoke <code>KR-ADVPN_0</code> banta hai, doosra <code>KR-ADVPN_1</code>. Instance number sirf aane ka order hai. Agar TRY-FGT pehle connect hua to woh _0 hai, aur reboot ke baad numbers badal sakte hain. Number par depend karne wala rule kabhi mat likho; spoke ko hamesha uske remote address se pehchano, MDU-FGT ke liye 203.0.113.11 aur TRY-FGT ke liye 203.0.113.12.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Dial-up template and instances">
<rect x="230" y="20" width="180" height="60" rx="10" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT 203.0.113.1</text><text x="320" y="66" text-anchor="middle" class="svg-muted" font-size="12">template KR-ADVPN</text>
<rect x="40" y="150" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="135" y="174" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT .11</text><text x="135" y="193" text-anchor="middle" class="svg-muted" font-size="12">spoke phase 1 TO-HQ</text>
<rect x="410" y="150" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="505" y="174" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT .12</text><text x="505" y="193" text-anchor="middle" class="svg-muted" font-size="12">spoke phase 1 TO-HQ</text>
<line x1="270" y1="80" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="80" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="108" text-anchor="middle" class="svg-accent" font-size="12">KR-ADVPN_0</text><text x="460" y="108" text-anchor="middle" class="svg-accent" font-size="12">KR-ADVPN_1</text>
</svg><p class="cap">Hub par ek template, har connected spoke ke liye ek numbered instance.</p></div>

<h3>Selectors ke responder rules</h3>
<p>Dynamic phase 2 par aam design dono taraf selectors <code>0.0.0.0/0</code> hai. Responder hone ki wajah se hub spoke jo bhi propose kare woh accept kar leta hai. Isi wide selectors wala static initiator tunnel summary mein <b>1/1</b> dikhata hai. Yeh sabse simple aur reliable setup hai, kyunki kaun sa traffic tunnel mein jayega yeh selectors nahi, routing decide karti hai. Chapter 3 mein iska reason samjhaya tha.</p>

<h3>Hub configuration</h3>
<pre class="code"><span class="c">! phase 1 template</span>
config vpn ipsec phase1-interface
  edit "KR-ADVPN"
    set type dynamic
    set interface "port1"
    set ike-version 2
    set proposal aes256-sha256
    set dhgrp 14
    set psksecret Kaveri-IPsec-2026
    set exchange-interface-ip enable
    set add-route enable
  next
end
<span class="c">! phase 2 with PFS and wide selectors</span>
config vpn ipsec phase2-interface
  edit "KR-P2"
    set phase1name "KR-ADVPN"
    set proposal aes256-sha256
    set dhgrp 14
    set src-subnet 0.0.0.0 0.0.0.0
    set dst-subnet 0.0.0.0 0.0.0.0
  next
end
<span class="c">! tunnel interface addressing (chapter 4)</span>
config system interface
  edit "KR-ADVPN"
    set ip 10.255.1.1 255.255.255.255
    set remote-ip 10.255.1.254 255.255.255.0
  next
end</pre>
<p>Phase 1 banate hi interface <code>KR-ADVPN</code> apne aap ban jaata hai; phir aap use overlay address dete ho. Addressing rule yaad rakho: hub ka <code>ip</code> 10.255.1.1/32 aur <code>remote-ip</code> 10.255.1.254/24 hai, jo poore overlay 10.255.1.0/24 ke liye connected-style route install karta hai.</p>

<h3>Firewall policy ki requirement</h3>
<p>Phase 1 ke checks ka pehla gate cryptographic nahi hai. Agar tunnel interface kisi bhi firewall policy mein named nahi hai, to FortiGate spoke ko khamoshi se jawab deta hai aur log karta hai <code>ignoring IKE request, no policy configured</code>. Isliye TRY-FGT up hone se pehle HQ-FGT par aisi policies chahiye jo <code>KR-ADVPN</code> use karein: LAN to tunnel aur tunnel to LAN. Spoke ko apne <code>TO-HQ</code> interface par wahi chahiye. Aage spoke-to-spoke traffic ke liye hub ko <code>KR-ADVPN</code> se <code>KR-ADVPN</code> wali policy bhi chahiye; chapter 8 mein samjhayenge.</p>
<pre class="code">config firewall policy
  edit 10
    set name "LAN-to-spokes"
    set srcintf "port2"
    set dstintf "KR-ADVPN"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "ALL"
  next
  edit 11
    set name "spokes-to-LAN"
    set srcintf "KR-ADVPN"
    set dstintf "port2"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "ALL"
  next
end</pre>

<h3>Hub verify karna</h3>
<pre class="out">HQ-FGT # get vpn ipsec tunnel summary
'KR-ADVPN_0' <span class="hl">203.0.113.12:0  selectors(total,up): 1/1</span>  rx(pkt,err): 12/0  tx(pkt,err): 12/0
'KR-ADVPN_1' <span class="hl">203.0.113.11:0  selectors(total,up): 1/1</span>  rx(pkt,err): 9/0  tx(pkt,err): 9/0</pre>
<p>Har line ko padho: naam instance hai, address spoke hai, aur <code>1/1</code> ka matlab ek selector hai aur ek up hai. Hub par <code>add-route enable</code> (default) aur dono taraf <code>exchange-interface-ip enable</code> ke saath hub har spoke tunnel IP ke liye distance 15 ka /32 route bhi install karta hai. <code>get router info routing-table all</code> se check karo.</p>

<div class="warn"><p><b>Common mistake.</b> Template <code>KR-ADVPN</code> ke "up" dikhne ka intezaar karna. Sirf instances up hote hain. Doosri galti: tunnel policy <code>port2 to KR-ADVPN</code> ki jagah <code>port2 to port1</code> likhna; PSK sahi hone par bhi IKE packets "no policy configured" message ke saath dub jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dial-up hub sirf respond kar sakta hai. Agar sawal ho ki negotiation kaun si side start karegi, jawab spoke hai. Aur <code>KR-ADVPN_0</code> jaisa instance name doosra phase 1 nahi hai; woh runtime par bana clone hai.</p></div>

<div class="scn"><h4>Trichy join hua, Madurai nahi</h4><p>Monday ko TRY-FGT turant up ho gaya, par MDU-FGT kabhi nahi. Hub par 203.0.113.12 ke liye sirf <code>KR-ADVPN_0</code> dikha. Engineer ne MDU-FGT ko wahi phase 1 ke saath banaya aur spoke par timeout ki shikayat dekhi. MDU-FGT se 203.0.113.1 par ping chal raha tha, to agla shak UDP/500 par gaya; 203.0.113.11 ke liye ISP rule theek hote hi doosra instance <code>KR-ADVPN_1</code> ke naam se aa gaya. Hub par koi change nahi chahiye tha.</p><p><b>Lesson:</b> dial-up template naye spokes bina hub change ke accept karta hai; agar ek spoke gayab hai to pehle uska underlay aur apni policy check karo.</p></div>

<div class="iv"><p class="q">"Hub par har branch ke liye alag tunnel ki jagah dynamic phase 1 kyun?"</p><p>Samjhao ki hub ko spoke addresses pehle se nahi pata, isliye ek template aur ek phase 2 har branch ko serve karte hain aur har connection template_n naam ka instance ban jaata hai. Cost bhi batao: sirf spokes initiate kar sakte hain, aur template ko strong PSK aur policy requirement se secure karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub <code>type dynamic</code> use karta hai aur sirf respond karta hai; spokes static hain aur initiate karte hain.</li>
<li>Template kabhi up nahi hota; har spoke ko instance milta hai <code>KR-ADVPN_0</code>, <code>_1</code>.</li>
<li>Responder par wide 0.0.0.0/0 selectors spoke ka proposal accept kar lete hain.</li>
<li>Tunnel interface par firewall policy na ho to IKE request ignore hoti hai.</li>
<li>Instance, spoke address aur selectors up ke liye <code>get vpn ipsec tunnel summary</code> dekho.</li>
</ul></div>
`}};export{e as default};