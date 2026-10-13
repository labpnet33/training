var e={id:`nat`,h:{en:`NAT and port forwarding: how private addresses reach the internet`,hi:`NAT aur port forwarding: private addresses internet tak kaise pahunchte hain`},body:{en:`
<h3>The problem: private addresses cannot go on the internet</h3>
<p>Our branches use <b>private addresses</b> (10.0.0.0/8): they are reusable inside any company and are not routed on the public internet. Every shop in India may use 10.2.10.0/24, so internet routers would not know which one to send replies to. The solution is <b>NAT</b> (Network Address Translation): the appliance rewrites the source address of outgoing packets to the public address of its internet circuit, and rewrites the destination of the replies back.</p>

<h3>PAT: many clients, one public address</h3>
<p>If 14 clients at Bengaluru all share one public address (198.51.100.20, the wan1 circuit), the appliance needs a way to tell their replies apart. It does this with the <b>source port</b>: this is called <b>PAT</b> (Port Address Translation, also called NAT overload). The appliance keeps a <b>translation table</b>: one row per active connection, mapping inside address and port to outside address and port.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAT translation at the MX">
<rect x="10" y="20" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.2.10.101 : port A</text>
<rect x="10" y="130" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="158" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-BLR</text><text x="95" y="178" text-anchor="middle" class="svg-muted" font-size="12">10.2.10.102 : port B</text>
<rect x="230" y="60" width="180" height="110" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">PAT table:</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">inside port to outside port</text>
<rect x="460" y="60" width="170" height="110" rx="10" fill="#e2e8f0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="545" y="118" text-anchor="middle" class="svg-muted" font-size="12">sees only</text><text x="545" y="136" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<line x1="180" y1="60" x2="230" y2="95" stroke="#64748b" stroke-width="2"/><line x1="180" y1="170" x2="230" y2="135" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Different inside hosts share one outside address; the port number tells replies apart.</p></div>

<pre class="out">NAT translations  (illustration, MX-BLR)
Inside              Outside              Destination
10.2.10.101:51200   198.51.100.20:61001  8.8.8.8
10.2.10.102:49822   198.51.100.20:61002  1.1.1.1
10.2.30.120:50111   198.51.100.20:61003  8.8.8.8</pre>
<p>The port numbers above are arbitrary examples. The point is the pattern: three clients, one outside address, three different outside ports. The dashboard may not show the table this way; the idea is what matters.</p>

<h3>Which address is used on which circuit?</h3>
<p>PAT uses the address of the <b>active uplink</b>. At Bengaluru that is wan1 198.51.100.20. At Mumbai there are two circuits: normally wan1 (198.51.100.10) is used, and if it fails the MX fails over to wan2 (203.0.113.10) and the outside address changes with it. Services that expect a fixed public source address (for example a bank that whitelists your IP) must be told about both addresses.</p>

<h3>Port forwarding: letting the outside reach one inside server</h3>
<p>NAT works naturally for connections that start inside. For a connection that starts outside, such as a customer's request to your shop's web app, the appliance has no table row, so it drops it. <b>Port forwarding</b> creates a fixed entry: "traffic arriving on public address 198.51.100.20, application port X, goes to SRV-BLR 10.2.20.10, port X". The rest of the world sees only the public address.</p>
<table class="cmp"><tr><th>Public side (wan1)</th><th>Forwards to</th><th>Why</th></tr>
<tr><td>198.51.100.20 : app port</td><td>10.2.20.10 : app port (SRV-BLR)</td><td>Publish the store's local web app</td></tr>
</table>
<p>The exact port numbers depend on your application, and where the setting lives in a real product is in the vendor documentation. Always combine port forwarding with firewall rules that limit who may use it: publishing a server is an invitation, and attackers scan for it.</p>

<h3>1:1 NAT (concept)</h3>
<p><b>One-to-one NAT</b> maps one public address to exactly one inside server, for all ports, instead of sharing one address. It is used when a server must look like a normal host on the internet, with its own address. It needs a spare public address per server, which is why branches rarely use it. Check the vendor documentation for how a given product exposes it.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Co wants a supplier to upload files to SRV-DEL (10.3.20.10) from the internet. Delhi has one public address, 203.0.113.30. Use port forwarding on that address to SRV-DEL, then add a firewall rule so only the supplier's address range may connect, and review the hit counter after a week.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> PAT is automatic: it changes the source address and port of outgoing packets on the wan interface. A port-forward rule adds a permanent inbound mapping from one public address and port to one inside address and port. A 1:1 mapping translates every port for one address pair. None of this changes your VLANs, but port forwarding opens a path from the internet to a server: treat it as a security change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forwarding a port to a server that has no firewall rule limiting source addresses; forwarding to the wrong inside address (a DHCP address that later changes: use static addresses for servers); forgetting that the public address changes if traffic fails over to wan2.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAT hides inside addresses behind the outside address; it is not a firewall by itself. Unsolicited inbound traffic is dropped only because there is no mapping and the policy does not allow it.</p></div>

<div class="scn"><h4>The supplier portal that vanished after failover</h4><p>At Mumbai a supplier accessed an upload server on the wan1 public address 198.51.100.10. One night wan1 failed, the MX moved to wan2 (203.0.113.10) and the supplier's whitelist and bookmark no longer matched. The portal looked down although everything inside was fine. The fix was to publish the service on both circuits' addresses and tell the supplier both.</p><p><b>Lesson:</b> NAT and port forwarding follow the active uplink; plan for failover.</p></div>

<div class="iv"><p class="q">"Explain NAT, PAT and port forwarding."</p><p>Strong answer: NAT rewrites addresses. PAT lets many private hosts share one public address by also rewriting source ports and keeping a translation table. Port forwarding is a static mapping for connections that start outside, sending a public address and port to one inside host and port. Add that publishing a service needs matching firewall rules and a static inside address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private addresses need NAT to use the internet; PAT lets many hosts share the uplink address.</li>
<li>The outside address is the active uplink's address and changes on failover.</li>
<li>Port forwarding maps a public address and port to one inside server for inbound connections.</li>
<li>1:1 NAT maps one public address to one server for all ports.</li>
<li>Always pair published services with firewall limits and static inside addresses.</li>
</ul></div>
`,hi:`
<h3>Problem: private addresses internet par nahi ja sakte</h3>
<p>Humari branches <b>private addresses</b> (10.0.0.0/8) use karti hain: yeh kisi bhi company ke andar reuse ho sakte hain aur public internet par route nahi hote. India ki har shop 10.2.10.0/24 use kar sakti hai, isliye internet routers ko pata nahi chalega ki replies kise bhejein. Solution hai <b>NAT</b> (Network Address Translation): appliance bahar jaane wale packets ka source address apne internet circuit ke public address mein rewrite karta hai, aur replies ka destination wapas rewrite karta hai.</p>

<h3>PAT: kai clients, ek public address</h3>
<p>Agar Bengaluru ke 14 clients ek hi public address (198.51.100.20, wan1 circuit) share karte hain, to appliance ko unki replies alag karne ka tareeka chahiye. Woh yeh <b>source port</b> se karta hai: ise <b>PAT</b> (Port Address Translation, ya NAT overload) kehte hain. Appliance ek <b>translation table</b> rakhta hai: har active connection ki ek row, jo inside address aur port ko outside address aur port se map karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MX par PAT translation">
<rect x="10" y="20" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.2.10.101 : port A</text>
<rect x="10" y="130" width="170" height="80" rx="8" fill="#fde68a"/><text x="95" y="158" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-BLR</text><text x="95" y="178" text-anchor="middle" class="svg-muted" font-size="12">10.2.10.102 : port B</text>
<rect x="230" y="60" width="180" height="110" rx="10" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">PAT table:</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">inside port se outside port</text>
<rect x="460" y="60" width="170" height="110" rx="10" fill="#e2e8f0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="545" y="118" text-anchor="middle" class="svg-muted" font-size="12">sirf yeh dekhta hai</text><text x="545" y="136" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<line x1="180" y1="60" x2="230" y2="95" stroke="#64748b" stroke-width="2"/><line x1="180" y1="170" x2="230" y2="135" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="460" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Alag inside hosts ek outside address share karte hain; port number replies ko alag karta hai.</p></div>

<pre class="out">NAT translations  (illustration, MX-BLR)
Inside              Outside              Destination
10.2.10.101:51200   198.51.100.20:61001  8.8.8.8
10.2.10.102:49822   198.51.100.20:61002  1.1.1.1
10.2.30.120:50111   198.51.100.20:61003  8.8.8.8</pre>
<p>Upar ke port numbers sirf arbitrary examples hain. Point pattern hai: teen clients, ek outside address, teen alag outside ports. Dashboard table is tarah na dikhaye; idea matter karta hai.</p>

<h3>Kis circuit par kaunsa address use hota hai?</h3>
<p>PAT <b>active uplink</b> ka address use karta hai. Bengaluru mein woh wan1 198.51.100.20 hai. Mumbai mein do circuits hain: normally wan1 (198.51.100.10) use hota hai, aur woh fail ho to MX wan2 (203.0.113.10) par failover karta hai aur outside address saath mein badal jaata hai. Jin services ko fixed public source address chahiye (jaise koi bank jo aapka IP whitelist karta hai) unhe dono addresses batane padte hain.</p>

<h3>Port forwarding: bahar waalon ko ek inside server tak pahunchne dena</h3>
<p>NAT un connections ke liye naturally kaam karta hai jo andar se shuru hoti hain. Bahar se shuru hone wali connection ke liye, jaise customer ka shop ki web app ko request, appliance ke paas koi table row nahi hoti, isliye woh use drop kar deta hai. <b>Port forwarding</b> ek fixed entry banata hai: "public address 198.51.100.20, application port X par aane wala traffic SRV-BLR 10.2.20.10, port X ko jaata hai". Baaki duniya sirf public address dekhti hai.</p>
<table class="cmp"><tr><th>Public side (wan1)</th><th>Forward hota hai</th><th>Kyun</th></tr>
<tr><td>198.51.100.20 : app port</td><td>10.2.20.10 : app port (SRV-BLR)</td><td>Store ki local web app publish karna</td></tr>
</table>
<p>Exact port numbers aapki application par depend karte hain, aur real product mein setting kahan hai woh vendor documentation mein hai. Port forwarding ko hamesha aise firewall rules ke saath combine karo jo limit karein ki kaun use use kar sakta hai: server publish karna ek nimantran hai, aur attackers uske liye scan karte hain.</p>

<h3>1:1 NAT (concept)</h3>
<p><b>One-to-one NAT</b> ek public address ko bilkul ek inside server se map karta hai, saare ports ke liye, ek address share karne ke bajaye. Iska use tab hota hai jab server ko internet par apne address ke saath normal host jaisa dikhna ho. Har server ke liye ek spare public address chahiye, isliye branches ise kam hi use karti hain. Kisi product mein yeh kaise milta hai, vendor documentation check karo.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail Co chahti hai ki ek supplier internet se SRV-DEL (10.3.20.10) par files upload kare. Delhi ke paas ek public address hai, 203.0.113.30. Us address par SRV-DEL ke liye port forwarding use karo, phir firewall rule add karo taaki sirf supplier ki address range connect kar sake, aur ek hafte baad hit counter review karo.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> PAT automatic hai: yeh wan interface par bahar jaane wale packets ka source address aur port badalta hai. Port-forward rule ek permanent inbound mapping jodta hai ek public address aur port se ek inside address aur port tak. 1:1 mapping ek address pair ke saare ports translate karta hai. Inme se kuch bhi aapke VLANs nahi badalta, lekin port forwarding internet se server tak ek raasta kholta hai: ise security change maano.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Aise server par port forward karna jiske liye source addresses limit karne wala firewall rule nahi hai; galat inside address par forward karna (DHCP address jo baad mein badal jaata hai: servers ke liye static addresses use karo); yeh bhool jaana ki traffic wan2 par failover ho to public address badal jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAT inside addresses ko outside address ke peeche chhupata hai; yeh khud firewall nahi hai. Unsolicited inbound traffic isliye drop hota hai kyunki koi mapping nahi hai aur policy allow nahi karti.</p></div>

<div class="scn"><h4>Failover ke baad supplier portal gayab</h4><p>Mumbai mein ek supplier wan1 ke public address 198.51.100.10 par upload server access karta tha. Ek raat wan1 fail ho gaya, MX wan2 (203.0.113.10) par chala gaya aur supplier ki whitelist aur bookmark match nahi hue. Portal down lag raha tha jabki andar sab theek tha. Fix yeh tha ki service dono circuits ke addresses par publish ki gayi aur supplier ko dono bataye gaye.</p><p><b>Seekh:</b> NAT aur port forwarding active uplink ko follow karte hain; failover ke liye plan karo.</p></div>

<div class="iv"><p class="q">"NAT, PAT aur port forwarding samjhao."</p><p>Strong answer: NAT addresses rewrite karta hai. PAT kai private hosts ko ek public address share karne deta hai, source ports bhi rewrite karke aur translation table rakhke. Port forwarding bahar se shuru hone wali connections ke liye static mapping hai, jo public address aur port ko ek inside host aur port tak bhejta hai. Jodo ki service publish karne ke liye matching firewall rules aur static inside address chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Private addresses ko internet ke liye NAT chahiye; PAT kai hosts ko uplink address share karne deta hai.</li>
<li>Outside address active uplink ka address hai aur failover par badalta hai.</li>
<li>Port forwarding inbound connections ke liye public address aur port ko ek inside server se map karta hai.</li>
<li>1:1 NAT ek public address ko ek server se saare ports ke liye map karta hai.</li>
<li>Published services ko hamesha firewall limits aur static inside addresses ke saath jodo.</li>
</ul></div>
`}};export{e as default};