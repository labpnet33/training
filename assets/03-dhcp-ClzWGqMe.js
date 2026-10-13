var e={id:`dhcp`,h:{en:`DHCP: server, relay, off, pools, reservations and options`,hi:`DHCP: server, relay, off, pools, reservations aur options`},body:{en:`
<h3>What DHCP does, in plain words</h3>
<p><b>DHCP</b> (Dynamic Host Configuration Protocol) gives a client everything it needs to talk on the network, automatically: an IP address, a subnet mask, a default gateway and DNS servers. Without it you would type those four things on every laptop and phone. The exchange has four short steps, remembered as <b>DORA</b>: the client broadcasts <b>Discover</b>, the server answers with an <b>Offer</b>, the client sends a <b>Request</b> for that address, and the server confirms with an <b>Acknowledge</b>. The address is <b>leased</b> (lent) for a time, and the client renews it before it ends.</p>
<p>Broadcasts do not cross VLANs, so a DHCP request from VLAN 10 reaches only devices in VLAN 10, which includes the MX's VLAN 10 interface. That is how the appliance can serve each VLAN separately.</p>

<h3>Three DHCP modes on the VLAN table</h3>
<table class="cmp"><tr><th>Mode</th><th>Meaning</th><th>Used at Bharat Retail Co</th></tr>
<tr><td><b>Server</b> (run a DHCP server)</td><td>The MX itself hands out addresses from a pool</td><td>VLAN 10 Staff and 30 Guest</td></tr>
<tr><td><b>Relay</b></td><td>The MX forwards the client's request to a DHCP server elsewhere (for example a central server) and passes the answer back</td><td>Not used by default; useful when a central server owns addressing</td></tr>
<tr><td><b>Off</b></td><td>The MX does not answer DHCP in this VLAN. Devices need static addresses</td><td>VLAN 20 Servers (static, .10 is the main server) and VLAN 99 Management (.2 to .20 static)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP DORA between client and MX">
<rect x="20" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-BLR</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR (VLAN 10)</text>
<line x1="95" y1="70" x2="95" y2="215" stroke="#64748b" stroke-width="2"/><line x1="545" y1="70" x2="545" y2="215" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="95" x2="545" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">1 Discover (broadcast)</text>
<line x1="545" y1="130" x2="95" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">2 Offer 10.2.10.101</text>
<line x1="95" y1="165" x2="545" y2="165" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">3 Request 10.2.10.101</text>
<line x1="545" y1="200" x2="95" y2="200" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">4 Acknowledge (lease, gateway, DNS)</text>
</svg><p class="cap">DORA: Discover, Offer, Request, Acknowledge. The MX answers on the client's own VLAN.</p></div>

<h3>Pool, exhaustion and lease time</h3>
<p>The <b>pool</b> is the range of addresses the server may give out. Our plan uses .100 to .200 in VLANs 10 and 30: 101 addresses. Everything outside the pool (.1 gateway, .2 to .20 management, .10 server) is protected from accidental assignment. <b>Pool exhaustion</b> means every address in the pool is leased and a new client gets nothing. Guest Wi-Fi is the usual victim: on a busy day 101 phones fill the pool, and later arrivals see "connected, no internet". Fixes: shorten the <b>lease time</b> so old leases free up sooner, enlarge the pool (a larger pool or a larger subnet), or reduce the demand (limit guest duration). The dashboard raises a "DHCP pool exhausted" alert.</p>

<h3>Reservations and options</h3>
<ul>
<li>A <b>reservation</b> (fixed assignment) ties an address to a client's MAC address, so a printer always gets the same IP but still learns it through DHCP.</li>
<li><b>Options</b> are extra settings sent with the lease. The common ones are DNS servers (1.1.1.1 in our plan) and the default gateway (the MX address). Vendor-specific options exist; check the vendor documentation.</li>
</ul>
<pre class="out">Addressing and VLANs / DHCP  (network: Bengaluru Branch)
VLAN  Mode    Pool              Lease    DNS       Used / Size
10    server  .100 - .200       1 day    1.1.1.1   <span class="hl">38 / 101</span>
30    server  .100 - .200       1 day    1.1.1.1   <span class="hl">101 / 101  (pool exhausted)</span>
20    off     -                 -        -         -
99    off     -                 -        -         -
Reservations: VLAN 10  printer-blr  aa:bb:cc:00:10:01  10.2.10.150</pre>

<div class="eg"><p><b>Worked example.</b> The Mumbai guest pool is 10.1.30.100 to .200 and the lease is 1 day. A conference brings 150 guests. After 101 devices, the 102nd gets no address. Set the guest lease to 1 hour so address use turns over; the guests who left free their address within the hour.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Choosing server makes the MX answer DHCP Discover on that VLAN. Relay makes it forward requests towards a configured server instead. Off stops all DHCP answers there. A shorter lease makes clients renew more often (more DHCP traffic, faster reuse). A reservation changes which address one MAC is offered. The dashboard applies these when you click Save changes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving DHCP off on a VLAN that has Wi-Fi clients; a pool that overlaps static addresses (an address conflict with the server); forgetting to allow the VLAN on the trunk so that Discover frames never reach the MX; two DHCP servers (a rogue router plugged into a staff port) giving wrong gateways.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client has a 169.254.x.x address" means DHCP did not answer (self-assigned link-local), and the fault is the DHCP path, not DNS or the firewall.</p></div>

<div class="scn"><h4>Guest Wi-Fi works in the morning, dies in the afternoon</h4><p>Bengaluru reported that guests could connect to BharatRetail-Guest until 3 p.m., then got no internet. The status table showed VLAN 30 at 101 of 101 leases. Most addresses belonged to phones that left the store hours ago but held a 1-day lease. The engineer reduced the guest lease to one hour and noted the alert. By 4 p.m. new guests received addresses again.</p><p><b>Lesson:</b> pool size and lease time must match how people really use the VLAN.</p></div>

<div class="iv"><p class="q">"A client connects but gets 169.254.x.x. What do you check?"</p><p>Strong answer: DHCP failed. Check the VLAN has DHCP mode server (or a reachable relay), the pool is not exhausted, the VLAN is allowed on every trunk to the MX, the client port or SSID is in the right VLAN, and the AP is online for wireless. Then verify in the dashboard that the client appears with a lease.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP follows DORA and leases an address, mask, gateway and DNS.</li>
<li>Modes: server, relay, off. VLANs 10 and 30 use server; 20 and 99 are static.</li>
<li>Pool .100 to .200 is protected from static ranges; exhaustion leaves new clients without addresses.</li>
<li>Shorten the lease or enlarge the pool to fix exhaustion; use reservations for fixed devices.</li>
<li>169.254.x.x means DHCP did not answer.</li>
</ul></div>
`,hi:`
<h3>DHCP kya karta hai, saaf shabdon mein</h3>
<p><b>DHCP</b> (Dynamic Host Configuration Protocol) client ko network par baat karne ke liye sab kuch automatically deta hai: IP address, subnet mask, default gateway aur DNS servers. Iske bina har laptop aur phone par yeh chaar cheezein khud type karni padti. Exchange ke chaar chhote steps hain, jinhe <b>DORA</b> se yaad rakhte hain: client <b>Discover</b> broadcast karta hai, server <b>Offer</b> se jawab deta hai, client us address ke liye <b>Request</b> bhejta hai, aur server <b>Acknowledge</b> se confirm karta hai. Address kuch time ke liye <b>lease</b> (udhaar) hota hai, aur client use khatam hone se pehle renew karta hai.</p>
<p>Broadcasts VLANs ke aar-paar nahi jaate, isliye VLAN 10 ka DHCP request sirf VLAN 10 ke devices tak pahunchta hai, jisme MX ka VLAN 10 interface bhi hai. Isi tarah appliance har VLAN ko alag serve kar sakta hai.</p>

<h3>VLAN table par DHCP ke teen modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Matlab</th><th>Bharat Retail Co mein use</th></tr>
<tr><td><b>Server</b> (DHCP server chalao)</td><td>MX khud pool se addresses deta hai</td><td>VLAN 10 Staff aur 30 Guest</td></tr>
<tr><td><b>Relay</b></td><td>MX client ki request kisi aur jagah ke DHCP server (jaise central server) ko forward karta hai aur jawab wapas deta hai</td><td>Default mein use nahi; jab central server addressing own karta ho tab useful</td></tr>
<tr><td><b>Off</b></td><td>MX is VLAN mein DHCP ka jawab nahi deta. Devices ko static addresses chahiye</td><td>VLAN 20 Servers (static, .10 main server) aur VLAN 99 Management (.2 se .20 static)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Client aur MX ke beech DHCP DORA">
<rect x="20" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP-BLR</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR (VLAN 10)</text>
<line x1="95" y1="70" x2="95" y2="215" stroke="#64748b" stroke-width="2"/><line x1="545" y1="70" x2="545" y2="215" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="95" x2="545" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">1 Discover (broadcast)</text>
<line x1="545" y1="130" x2="95" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">2 Offer 10.2.10.101</text>
<line x1="95" y1="165" x2="545" y2="165" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">3 Request 10.2.10.101</text>
<line x1="545" y1="200" x2="95" y2="200" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">4 Acknowledge (lease, gateway, DNS)</text>
</svg><p class="cap">DORA: Discover, Offer, Request, Acknowledge. MX client ki apni VLAN par jawab deta hai.</p></div>

<h3>Pool, exhaustion aur lease time</h3>
<p><b>Pool</b> addresses ki woh range hai jo server de sakta hai. Humare plan mein VLANs 10 aur 30 mein .100 se .200 hai: 101 addresses. Pool ke bahar ki har cheez (.1 gateway, .2 se .20 management, .10 server) galti se assign hone se bachi rehti hai. <b>Pool exhaustion</b> ka matlab hai pool ka har address lease ho chuka hai aur naye client ko kuch nahi milta. Guest Wi-Fi aam taur par shikaar banta hai: busy din par 101 phones pool bhar dete hain, aur baad mein aane walon ko "connected, no internet" dikhta hai. Fix: <b>lease time</b> chhota karo taaki purane leases jaldi free hon, pool bada karo (bada pool ya bada subnet), ya demand kam karo (guest duration limit karo). Dashboard "DHCP pool exhausted" alert deta hai.</p>

<h3>Reservations aur options</h3>
<ul>
<li><b>Reservation</b> (fixed assignment) ek address ko client ke MAC address se jodta hai, isliye printer ko hamesha wahi IP milta hai lekin woh phir bhi DHCP se seekhta hai.</li>
<li><b>Options</b> lease ke saath bheje gaye extra settings hain. Common wale DNS servers (humare plan mein 1.1.1.1) aur default gateway (MX address) hain. Vendor-specific options bhi hote hain; vendor documentation check karo.</li>
</ul>
<pre class="out">Addressing and VLANs / DHCP  (network: Bengaluru Branch)
VLAN  Mode    Pool              Lease    DNS       Used / Size
10    server  .100 - .200       1 day    1.1.1.1   <span class="hl">38 / 101</span>
30    server  .100 - .200       1 day    1.1.1.1   <span class="hl">101 / 101  (pool exhausted)</span>
20    off     -                 -        -         -
99    off     -                 -        -         -
Reservations: VLAN 10  printer-blr  aa:bb:cc:00:10:01  10.2.10.150</pre>

<div class="eg"><p><b>Worked example.</b> Mumbai guest pool 10.1.30.100 se .200 hai aur lease 1 day. Ek conference 150 guests laata hai. 101 devices ke baad 102wen ko address nahi milta. Guest lease ko 1 hour karo taaki address use turn over ho; jo guests chale gaye woh ghante bhar mein apna address free kar dete hain.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Server chunne se MX us VLAN par DHCP Discover ka jawab dene lagta hai. Relay chunne se woh requests ko configured server ki taraf forward karta hai. Off wahan DHCP ke saare jawab band kar deta hai. Chhota lease clients ko zyada baar renew karwata hai (zyada DHCP traffic, tez reuse). Reservation badalta hai ki ek MAC ko kaunsa address offer hoga. Dashboard yeh Save changes click karne par apply karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Wi-Fi clients wali VLAN par DHCP off chhodna; pool ka static addresses se overlap hona (server ke saath address conflict); VLAN ko trunk par allow karna bhool jaana taaki Discover frames MX tak kabhi na pahunchein; do DHCP servers (staff port mein lagaya hua rogue router) jo galat gateway dete hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client ke paas 169.254.x.x address hai" ka matlab DHCP ne jawab nahi diya (self-assigned link-local), aur fault DHCP path mein hai, DNS ya firewall mein nahi.</p></div>

<div class="scn"><h4>Guest Wi-Fi subah chalta hai, dopahar mein dam tod deta hai</h4><p>Bengaluru ne report kiya ki guests BharatRetail-Guest se 3 baje tak connect ho paate the, phir internet nahi milta tha. Status table mein VLAN 30 par 101 mein se 101 leases the. Zyada tar addresses un phones ke the jo ghanton pehle store se chale gaye the lekin 1-day lease pakde hue the. Engineer ne guest lease ek ghanta kiya aur alert note kiya. 4 baje tak naye guests ko phir addresses milne lage.</p><p><b>Seekh:</b> pool size aur lease time ko match karna chahiye ki log VLAN ko asal mein kaise use karte hain.</p></div>

<div class="iv"><p class="q">"Client connect hota hai lekin 169.254.x.x milta hai. Kya check karoge?"</p><p>Strong answer: DHCP fail hua. Check karo ki VLAN ka DHCP mode server hai (ya reachable relay), pool exhausted nahi hai, VLAN MX tak har trunk par allowed hai, client port ya SSID sahi VLAN mein hai, aur wireless ke liye AP online hai. Phir dashboard mein verify karo ki client lease ke saath dikh raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP DORA follow karta hai aur address, mask, gateway aur DNS lease karta hai.</li>
<li>Modes: server, relay, off. VLANs 10 aur 30 server use karti hain; 20 aur 99 static hain.</li>
<li>Pool .100 se .200 static ranges se bacha hua hai; exhaustion naye clients ko bina address chhod deta hai.</li>
<li>Exhaustion fix karne ke liye lease chhota karo ya pool bada karo; fixed devices ke liye reservations.</li>
<li>169.254.x.x ka matlab DHCP ne jawab nahi diya.</li>
</ul></div>
`}};export{e as default};