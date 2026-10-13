var e={id:`gre-ipsec`,h:{en:`GRE and IPsec tunnels from the site`,hi:`Site se GRE aur IPsec tunnels`},body:{en:`
<h3>Why a site uses a tunnel</h3>
<p>A PAC file only covers browsers. A <b>tunnel</b> from the edge firewall to the cloud service covers every device behind it and every protocol. The edge wraps the internet-bound packets inside new packets addressed to a cloud <b>node</b> (a cloud entry point). The node unwraps them, applies policy and sends them on. Sahyadri has two kinds: <b>IPsec</b> at Pune and <b>GRE</b> at Chennai. Each cloud service normally offers a primary node and a secondary node; here primary is 203.0.113.101 (Mumbai) and secondary is 203.0.113.102 (Chennai).</p>

<h3>GRE and IPsec side by side</h3>
<table class="cmp"><tr><th></th><th>GRE</th><th>IPsec</th></tr>
<tr><td>What it is</td><td>Plain encapsulation, IP protocol 47</td><td>Encapsulation plus encryption and authentication; IKE negotiates over UDP</td></tr>
<tr><td>How the cloud knows you</td><td>By your <b>source IP</b>, which must be a <b>registered static IP</b></td><td>By an <b>FQDN identity</b> plus a <b>pre-shared key</b> (PSK)</td></tr>
<tr><td>Needs a static public IP?</td><td>Yes</td><td>No, an identity name can survive a changing IP</td></tr>
<tr><td>Encryption</td><td>None (the traffic is usually HTTPS anyway)</td><td>Yes</td></tr>
<tr><td>Overhead per packet</td><td>Small (about 24 bytes)</td><td>Larger, depends on the settings</td></tr>
<tr><td>Sahyadri site</td><td>Chennai</td><td>Pune</td></tr>
</table>
<p>Exact ports, node lists and supported parameters come from the vendor documentation; here you learn the concepts and the checks the simulator makes.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="GRE and IPsec tunnels to cloud nodes">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">FW-PUN</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">IPsec</text>
<rect x="10" y="120" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="12">FW-CHN</text><text x="65" y="163" text-anchor="middle" class="svg-muted" font-size="12">GRE</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">ISP-A / ISP-B</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">carries both</text>
<rect x="260" y="120" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="145" text-anchor="middle" class="svg-ink" font-size="12">ISP-A</text><text x="315" y="163" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="500" y="60" width="130" height="90" rx="8" fill="#ddd6fe"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="12">Cloud nodes</text><text x="565" y="105" text-anchor="middle" class="svg-muted" font-size="12">primary .101</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="12">secondary .102</text>
<line x1="120" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="150" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="150" x2="500" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The tunnel rides over the ISP circuit; if the circuit is down, so is the tunnel.</p></div>

<h3>When is a tunnel up? The simulator's checks</h3>
<ul>
<li><b>IPsec is up when:</b> the edge FQDN (pune-hq@sahyadri.example) exists as a registered VPN credential, the pre-shared key matches, the credential is bound to that location, and a circuit is up.</li>
<li><b>GRE is up when:</b> the source IP configured on the edge equals the static IP registered for the location (198.51.100.20 for Chennai), the destination is a cloud node IP, and a circuit is up.</li>
<li>The edge's tunnel type and the location's method must <b>agree</b>.</li>
<li>If the MSS clamp is off, tunnel traffic gets stuck on big packets (below).</li>
</ul>
<pre class="out">Locations and edge devices  &gt;  Chennai Branch
Method: gre     Registered static IP: 198.51.100.20
Edge FW-CHN: tunnel gre  source 198.51.100.20  destination 203.0.113.101
Circuit wan1 BB-CHN-01 (ISP-A): up
<span class="hl">Tunnel: UP</span>   MSS clamp: on</pre>

<h3>MTU and MSS in plain words</h3>
<p><b>MTU</b> is the largest packet a link carries (1500 bytes on ordinary Ethernet). A tunnel adds extra header bytes, so a full-size packet no longer fits and must be fragmented or dropped. TCP chooses packet size using <b>MSS</b>, the largest data chunk per packet. <b>MSS clamping</b> makes the edge lower the MSS announced during the TCP handshake so packets fit through the tunnel. Without it, the small packets of a web page still work, but a big download needs full-size packets that are dropped, and many networks also drop the ICMP "too big" messages that would fix it. Result: <b>pages load but large downloads hang</b>.</p>

<div class="eg"><p><b>Lab zs-fwd-1: build the Pune IPsec tunnel.</b> (1) Register a VPN credential: FQDN pune-hq@sahyadri.example with PSK Pune#Key26, bound to Pune HQ. (2) On the edge FW-PUN set tunnel type IPsec with the same FQDN and PSK. (3) Set the Pune location method to IPsec, and failover as required. (4) Activate. Verify: tunnel UP, then <code>curl news.example</code> from PC-PUN returns 200 with path tunnel and a log line.</p></div>

<h3>Troubleshooting by method: five cases</h3>
<p><b>Lab zs-fwd-3 and ticket 320050, Chennai GRE is down after the ISP changed the public IP.</b> Symptom: Chennai web returns 0. Evidence: the edge detail shows source 198.51.100.20 while the circuit now reads a different address; the Tunnel line says DOWN, reason source IP does not match registered IP. Root cause: GRE identifies the site by source IP and it changed. Fix: confirm the real new address with the ISP, then make the registered static IP and the edge source IP equal that address (in real life the vendor needs the new IP registered, and static service is the reason GRE needs it). Activate. Verify: tunnel UP, curl 200, log line.</p>
<p><b>320040, Pune web is down after a weekend change.</b> Evidence: tunnel DOWN, "pre-shared key mismatch" in the edge detail; audit log shows the PSK edited on the edge. Root cause: edge PSK differs from the credential. Fix: set the same PSK on both sides (use the agreed value), activate, verify UP.</p>
<p><b>320090, large downloads hang while pages load.</b> Evidence: curl to a small page returns 200, <code>download docs.share.example/q3-report.xlsx</code> stalls; edge shows MSS clamp off. Root cause: no clamp, packets too big for the tunnel. Fix: turn the clamp on, activate. Verify: the download completes.</p>
<p><b>321090 (GRE half):</b> two sites were down after a weekend change. Chennai evidence: the edge destination is not one of the two cloud node addresses. Root cause: wrong destination. Fix: destination 203.0.113.101 (primary), activate, verify UP. Jaipur's PAC half was covered in chapter 2.</p>
<pre class="out">Edge FW-PUN  tunnel ipsec  fqdn pune-hq@sahyadri.example
<span class="hl">Tunnel: DOWN   reason: pre-shared key mismatch</span>
Circuit wan1 ILL-PUN-01: up   wan2 BB-PUN-02: up
MSS clamp: on</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Editing the tunnel on an edge changes the identity the edge presents (FQDN and PSK, or source IP), the destination it sends to, and the packet size it allows. If the cloud cannot match the identity, no tunnel forms, and the failover setting decides whether users are blocked or sent direct.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using GRE behind a dynamic IP. (2) Typing the PSK differently on two sides. (3) A destination that is not a cloud node. (4) Forgetting the MSS clamp. (5) Mismatched types: location says IPsec, edge says GRE.</p></div>
<div class="exam"><p><b>Exam trap.</b> GRE has no encryption of its own and identifies the site by IP; IPsec identifies by name and key. "Pages load, downloads hang" is MTU or MSS.</p></div>

<div class="scn"><h4>Two circuits, one weekend</h4><p>Pune has two ISPs. Over a weekend the primary circuit failed and the tunnel kept running on the second, so users noticed nothing, but the engineer saw the alert on Monday, found the ISP fault ticket, and learned the IPsec credential did not care which circuit carried it, only that one was up.</p><p><b>Lesson:</b> IPsec identity is a name and key, not a circuit address.</p></div>

<div class="iv"><p class="q">"GRE or IPsec for a branch, and why?"</p><p>Strong answer: GRE if the branch has a static IP and the traffic is mostly HTTPS, because it is simple with low overhead; IPsec if the IP can change or you need encryption on the wire. Mention identity (source IP versus FQDN and PSK), MTU and MSS clamping, primary and secondary node, and failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GRE: IP protocol 47, identified by registered static source IP, destination is a cloud node.</li>
<li>IPsec: IKE over UDP, identified by FQDN and PSK, credential bound to the location.</li>
<li>Edge type and location method must agree; a circuit must be up.</li>
<li>MSS clamp off means pages work but large downloads stall.</li>
<li>Read the tunnel detail line for the reason before changing anything.</li>
</ul></div>
`,hi:`
<h3>Site tunnel kyun use karti hai</h3>
<p>PAC file sirf browsers ko cover karti hai. Edge firewall se cloud service tak <b>tunnel</b> uske peeche har device aur har protocol ko cover karta hai. Edge internet-bound packets ko naye packets ke andar wrap karta hai jo cloud <b>node</b> (cloud entry point) ko address hote hain. Node unhe unwrap karta hai, policy lagata hai aur aage bhejta hai. Sahyadri mein do kisam hain: Pune par <b>IPsec</b> aur Chennai par <b>GRE</b>. Cloud service aam taur par primary node aur secondary node deti hai; yahan primary 203.0.113.101 (Mumbai) aur secondary 203.0.113.102 (Chennai) hai.</p>

<h3>GRE aur IPsec side by side</h3>
<table class="cmp"><tr><th></th><th>GRE</th><th>IPsec</th></tr>
<tr><td>Yeh kya hai</td><td>Plain encapsulation, IP protocol 47</td><td>Encapsulation plus encryption aur authentication; IKE UDP par negotiate karta hai</td></tr>
<tr><td>Cloud aapko kaise pehchanta hai</td><td>Aapke <b>source IP</b> se, jo <b>registered static IP</b> hona chahiye</td><td><b>FQDN identity</b> plus <b>pre-shared key</b> (PSK) se</td></tr>
<tr><td>Static public IP chahiye?</td><td>Haan</td><td>Nahi, identity name badalte IP mein bhi chal sakta hai</td></tr>
<tr><td>Encryption</td><td>Nahi (traffic aam taur par waise bhi HTTPS hota hai)</td><td>Haan</td></tr>
<tr><td>Per-packet overhead</td><td>Chhota (lagbhag 24 bytes)</td><td>Bada, settings par depend karta hai</td></tr>
<tr><td>Sahyadri site</td><td>Chennai</td><td>Pune</td></tr>
</table>
<p>Exact ports, node lists aur supported parameters vendor documentation se aate hain; yahan aap concepts aur simulator ke checks seekhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="GRE aur IPsec tunnels cloud nodes tak">
<rect x="10" y="20" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="12">FW-PUN</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">IPsec</text>
<rect x="10" y="120" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="145" text-anchor="middle" class="svg-ink" font-size="12">FW-CHN</text><text x="65" y="163" text-anchor="middle" class="svg-muted" font-size="12">GRE</text>
<rect x="260" y="20" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">ISP-A / ISP-B</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">dono carry karta</text>
<rect x="260" y="120" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="315" y="145" text-anchor="middle" class="svg-ink" font-size="12">ISP-A</text><text x="315" y="163" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20</text>
<rect x="500" y="60" width="130" height="90" rx="8" fill="#ddd6fe"/><text x="565" y="85" text-anchor="middle" class="svg-ink" font-size="12">Cloud nodes</text><text x="565" y="105" text-anchor="middle" class="svg-muted" font-size="12">primary .101</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="12">secondary .102</text>
<line x1="120" y1="50" x2="260" y2="50" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="120" y1="150" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="370" y1="150" x2="500" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Tunnel ISP circuit ke upar chalta hai; circuit down to tunnel bhi down.</p></div>

<h3>Tunnel kab up hota hai? Simulator ke checks</h3>
<ul>
<li><b>IPsec up hota hai jab:</b> edge FQDN (pune-hq@sahyadri.example) registered VPN credential ke roop mein maujood ho, pre-shared key match kare, credential us location se bound ho, aur ek circuit up ho.</li>
<li><b>GRE up hota hai jab:</b> edge par configured source IP location ke liye registered static IP ke barabar ho (Chennai ke liye 198.51.100.20), destination cloud node IP ho, aur ek circuit up ho.</li>
<li>Edge ka tunnel type aur location ka method <b>agree</b> karna chahiye.</li>
<li>MSS clamp off ho to tunnel traffic bade packets par atak jaata hai (neeche).</li>
</ul>
<pre class="out">Locations and edge devices  &gt;  Chennai Branch
Method: gre     Registered static IP: 198.51.100.20
Edge FW-CHN: tunnel gre  source 198.51.100.20  destination 203.0.113.101
Circuit wan1 BB-CHN-01 (ISP-A): up
<span class="hl">Tunnel: UP</span>   MSS clamp: on</pre>

<h3>MTU aur MSS simple words mein</h3>
<p><b>MTU</b> sabse bada packet hai jo link carry karta hai (aam Ethernet par 1500 bytes). Tunnel extra header bytes jodta hai, to full-size packet fit nahi hota aur fragment ya drop hona padta hai. TCP packet size <b>MSS</b> se chunta hai, yaani har packet mein data ka sabse bada hissa. <b>MSS clamping</b> edge ko TCP handshake mein announce hone wala MSS kam karne deti hai taaki packets tunnel se fit ho jaayein. Iske bina web page ke chhote packets chalte hain, lekin bade download ko full-size packets chahiye jo drop ho jaate hain, aur kai networks ICMP "too big" messages bhi drop karte hain jo ise theek kar sakte the. Result: <b>pages load hote hain lekin bade downloads atak jaate hain</b>.</p>

<div class="eg"><p><b>Lab zs-fwd-1: Pune IPsec tunnel banao.</b> (1) VPN credential register karo: FQDN pune-hq@sahyadri.example, PSK Pune#Key26, Pune HQ se bound. (2) Edge FW-PUN par tunnel type IPsec same FQDN aur PSK ke saath set karo. (3) Pune location method IPsec set karo, failover zaroorat ke hisaab se. (4) Activate. Verify: tunnel UP, phir PC-PUN se <code>curl news.example</code> path tunnel aur log line ke saath 200 deta hai.</p></div>

<h3>Method se troubleshooting: paanch cases</h3>
<p><b>Lab zs-fwd-3 aur ticket 320050, ISP ne public IP badla aur Chennai GRE down hai.</b> Symptom: Chennai web 0 deta hai. Evidence: edge detail source 198.51.100.20 dikhata hai jabki circuit ab alag address padhta hai; Tunnel line DOWN kehti hai, reason source IP registered IP se match nahi karta. Root cause: GRE site ko source IP se pehchanta hai aur woh badal gaya. Fix: ISP se naya real address confirm karo, phir registered static IP aur edge source IP ko us address ke barabar karo (real life mein vendor ko naya IP register karna padta hai, aur static service hi wajah hai ki GRE ko chahiye). Activate. Verify: tunnel UP, curl 200, log line.</p>
<p><b>320040, weekend change ke baad Pune web down hai.</b> Evidence: tunnel DOWN, edge detail mein "pre-shared key mismatch"; audit log mein edge par PSK edit hota dikhta hai. Root cause: edge PSK credential se alag hai. Fix: dono taraf same PSK set karo (agreed value), activate karo, UP verify karo.</p>
<p><b>320090, pages load hote hain lekin bade downloads atak jaate hain.</b> Evidence: chhote page par curl 200 deta hai, <code>download docs.share.example/q3-report.xlsx</code> atak jaata hai; edge MSS clamp off dikhata hai. Root cause: clamp nahi, packets tunnel ke liye bahut bade. Fix: clamp on karo, activate karo. Verify: download complete hota hai.</p>
<p><b>321090 (GRE half):</b> weekend change ke baad do sites down thin. Chennai evidence: edge destination dono cloud node addresses mein se koi nahi hai. Root cause: galat destination. Fix: destination 203.0.113.101 (primary), activate, UP verify. Jaipur ka PAC half chapter 2 mein tha.</p>
<pre class="out">Edge FW-PUN  tunnel ipsec  fqdn pune-hq@sahyadri.example
<span class="hl">Tunnel: DOWN   reason: pre-shared key mismatch</span>
Circuit wan1 ILL-PUN-01: up   wan2 BB-PUN-02: up
MSS clamp: on</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Edge par tunnel edit karne se woh identity badalti hai jo edge present karta hai (FQDN aur PSK, ya source IP), jahan woh bhejta hai woh destination, aur jo packet size woh allow karta hai. Agar cloud identity match nahi kar pata to tunnel nahi banta, aur failover setting decide karti hai ki users block honge ya direct bheje jaayenge.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Dynamic IP ke peeche GRE use karna. (2) PSK do jagah alag type karna. (3) Aisi destination jo cloud node nahi. (4) MSS clamp bhool jaana. (5) Mismatched types: location kehti hai IPsec, edge kehta hai GRE.</p></div>
<div class="exam"><p><b>Exam trap.</b> GRE mein apni encryption nahi hoti aur woh site ko IP se pehchanta hai; IPsec naam aur key se. "Pages load, downloads hang" MTU ya MSS hai.</p></div>

<div class="scn"><h4>Do circuits, ek weekend</h4><p>Pune ke paas do ISPs hain. Weekend mein primary circuit fail hua aur tunnel doosre par chalta raha, to users ko kuch nahi dikha, lekin engineer ne Monday ko alert dekha, ISP fault ticket dhoondha, aur seekha ki IPsec credential ko parwah nahi ki kaun sa circuit carry kar raha hai, bas ek up hona chahiye.</p><p><b>Seekh:</b> IPsec identity ek naam aur key hai, circuit address nahi.</p></div>

<div class="iv"><p class="q">"Branch ke liye GRE ya IPsec, aur kyun?"</p><p>Strong answer: static IP ho aur traffic zyadatar HTTPS ho to GRE, kyunki simple hai aur overhead kam; IP badal sakta ho ya wire par encryption chahiye to IPsec. Identity (source IP versus FQDN aur PSK), MTU aur MSS clamping, primary aur secondary node, aur failover mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GRE: IP protocol 47, registered static source IP se pehchana jaata hai, destination cloud node hai.</li>
<li>IPsec: IKE UDP par, FQDN aur PSK se pehchana jaata hai, credential location se bound.</li>
<li>Edge type aur location method agree karne chahiye; ek circuit up hona chahiye.</li>
<li>MSS clamp off ho to pages chalte hain lekin bade downloads atakte hain.</li>
<li>Kuch badalne se pehle tunnel detail line ka reason padho.</li>
</ul></div>
`}};export{e as default};