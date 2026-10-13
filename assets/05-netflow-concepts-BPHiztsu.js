var e={id:`netflow-concepts`,h:{en:`NetFlow concepts: flows, cache, export and versions`,hi:`NetFlow concepts: flows, cache, export aur versions`},body:{en:`
<p>Think of a phone bill. It does not record what you said on each call, but it lists every call: who called whom, when, for how long, and how much it cost. <b>NetFlow</b> is the phone bill of the network. It does not keep packet contents; it keeps a summary line for every conversation. That is usually exactly what you need to answer "who is eating my WAN link?"</p>

<h3>What is a flow?</h3>
<p>A <b>flow</b> is a set of packets that share the same values in a list of <b>key fields</b>. In traditional NetFlow the key is fixed at seven fields:</p>
<ol>
<li>Source IP address</li>
<li>Destination IP address</li>
<li>Source port (TCP/UDP)</li>
<li>Destination port</li>
<li>Layer 3 protocol (TCP 6, UDP 17, ICMP 1)</li>
<li>Type of Service byte (DSCP and ECN)</li>
<li>Input interface</li>
</ol>
<p>If any of the seven differs, it is a different flow. For each flow the router also stores <b>non-key</b> information such as byte and packet counters, first and last timestamps, TCP flags and the output interface.</p>

<h3>The flow cache and flow expiry</h3>
<p>The router keeps active flows in a <b>flow cache</b> in memory. When the first packet of a new flow arrives, a cache entry is created; each further packet updates the counters. A flow is <b>expired</b> (removed from the cache and, if configured, exported) when:</p>
<ul>
<li>It has been idle for the <b>inactive timeout</b> (default 15 seconds).</li>
<li>It has lasted longer than the <b>active timeout</b> (default 30 minutes). Long flows are reported in chunks so the collector sees them before they end.</li>
<li>A TCP FIN or RST ends the connection.</li>
<li>The cache is full and space is needed.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NetFlow architecture">
<rect x="20" y="60" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packets</text>
<rect x="190" y="40" width="160" height="100" rx="10" fill="#bae6fd"/><text x="270" y="70" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="270" y="95" text-anchor="middle" class="svg-muted" font-size="12">flow cache</text><text x="270" y="115" text-anchor="middle" class="svg-muted" font-size="12">key + counters</text>
<rect x="430" y="50" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="525" y="82" text-anchor="middle" class="svg-ink" font-size="13">Collector</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.40 UDP 2055</text>
<line x1="140" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="80" text-anchor="middle" class="svg-accent" font-size="12">export</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Expired flows are exported as records; the collector stores and graphs them</text>
</svg><p class="cap">Monitor, cache, export, collect: the NetFlow pipeline.</p></div>

<h3>Export versions: v5, v9 and IPFIX</h3>
<table class="cmp">
<tr><th>Version</th><th>Format</th><th>Notes</th></tr>
<tr><td>v5</td><td>Fixed record layout</td><td>IPv4 only, no templates, cannot carry new fields. Still common, but legacy.</td></tr>
<tr><td>v9</td><td><b>Template based</b></td><td>The exporter first sends a template describing the fields, then data records. Supports IPv6, MPLS, and any field Flexible NetFlow defines.</td></tr>
<tr><td>IPFIX</td><td>Template based (often called "v10")</td><td>The IETF standard derived from v9. Adds variable-length fields and vendor (enterprise) fields; transport can be UDP, TCP or SCTP.</td></tr>
</table>
<p>Exports are normally sent over UDP to a <b>collector</b>. There is no standard port for v5 and v9; 2055, 9995 and 9996 are common choices. IPFIX has registered port 4739. Because v9 and IPFIX use templates, a collector that has not yet received the template cannot decode the data; templates are resent periodically.</p>

<h3>Traditional NetFlow configuration</h3>
<p>Traditional NetFlow is still found on older IOS routers. It is configured per interface with fixed key fields:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip flow ingress
R1(config-if)# ip flow egress
R1(config-if)# exit
R1(config)# ip flow-export version 9
R1(config)# ip flow-export destination 192.0.2.40 2055
R1(config)# ip flow-export source Loopback0
R1(config)# ip flow-cache timeout active 1          <span class="c">! minutes</span></pre>
<pre class="out">R1# show ip cache flow
IP packet size distribution (1893 total packets):
...
SrcIf     SrcIPaddress    DstIf     DstIPaddress    Pr SrcP DstP  Pkts
Gi0/2     192.168.50.10   Gi0/0     198.51.100.10   06 C93A 01BB   212
Gi0/2     192.168.50.22   Gi0/0     203.0.113.53    11 D431 0035     2
<span class="hl">Gi0/2     192.168.50.31   Gi0/0     198.51.100.20   06 E1F0 0016  1540</span></pre>
<p>Ports and protocol are shown in <b>hexadecimal</b>: 01BB is 443 (HTTPS), 0035 is 53 (DNS), 0016 is 22 (SSH), protocol 06 is TCP and 11 is UDP. The highlighted line is an SSH session that moved 1540 packets.</p>

<div class="eg"><p><b>Worked example.</b> A user opens a web page and the browser uses two TCP connections to 198.51.100.10:443 from source ports 50112 and 50113. That is <b>two</b> flows, because the source port is a key field. The DNS lookup before it is a third flow (UDP to port 53). If the user's DSCP marking changed mid-session, that would create yet another flow, because ToS is also a key field.</p></div>

<h3>Why NetFlow matters</h3>
<ul>
<li><b>Capacity planning</b>: which applications and which sites use the bandwidth.</li>
<li><b>Troubleshooting</b>: top talkers at the moment of congestion, without a capture.</li>
<li><b>Security</b>: spotting scans (one source, thousands of destinations), data exfiltration and unusual protocols.</li>
<li><b>Billing and chargeback</b> between departments.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Enabling NetFlow on only one direction or one interface and then trusting the totals. With ingress-only collection on every interface you see every flow once; mixing ingress and egress on the same path counts flows twice.</p></div>

<div class="exam"><p><b>Exam trap.</b> NetFlow v5 cannot export IPv6 flows; v9 and IPFIX can. IPFIX is the IETF standard based on v9. And NetFlow summarises traffic; it does not capture payload, so it cannot show the content of a web page.</p></div>

<div class="scn"><h4>The WAN link full every night at 01:00</h4><p>A manufacturing company saw its 100 Mbps MPLS link at 100% every night. SNMP graphs only proved that the link was full. The engineer enabled NetFlow v9 export on the branch router and opened the collector the next morning: one server at 10.40.0.15 was sending 38 GB to a cloud storage address over TCP 443 between 01:00 and 03:30. It was an unapproved backup agent installed by a vendor. It was moved to a scheduled, rate-limited window.</p><p><b>Lesson:</b> SNMP tells you <i>how much</i>; NetFlow tells you <i>who and what</i>.</p></div>

<div class="iv"><p class="q">"What are the key fields of a traditional NetFlow flow, and what ends a flow?"</p><p>Seven keys: source and destination IP, source and destination port, Layer 3 protocol, ToS byte and input interface. A flow expires after the inactive timeout (15 s), after the active timeout (30 min) for long flows, on TCP FIN or RST, or when the cache needs room. Then it is exported to the collector in v5, v9 or IPFIX format. A strong candidate adds that v9 and IPFIX are template based and carry IPv6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow is packets sharing the same key fields; traditional NetFlow has 7 fixed keys.</li>
<li>Flows live in the cache and expire on inactive (15 s) or active (30 min) timeouts, FIN/RST or cache pressure.</li>
<li>v5 is fixed and IPv4 only; v9 is template based; IPFIX is the IETF standard based on v9.</li>
<li>Traditional config: <code>ip flow ingress</code> per interface plus <code>ip flow-export</code> globally; verify with <code>show ip cache flow</code>.</li>
<li>NetFlow answers "who and what" without capturing payload.</li>
</ul></div>
`,hi:`
<p>Ek phone bill socho. Woh record nahi karta ki har call par aapne kya kaha, par har call list karta hai: kisne kisko call kiya, kab, kitni der, aur kitna kharcha hua. <b>NetFlow</b> network ka phone bill hai. Yeh packet contents nahi rakhta; har conversation ke liye ek summary line rakhta hai. "Mera WAN link kaun kha raha hai?" ka jawab dene ke liye aam taur par exactly yahi chahiye.</p>

<h3>Flow kya hai?</h3>
<p><b>Flow</b> un packets ka set hai jinke <b>key fields</b> ki list mein same values hain. Traditional NetFlow mein key saat fields par fixed hai:</p>
<ol>
<li>Source IP address</li>
<li>Destination IP address</li>
<li>Source port (TCP/UDP)</li>
<li>Destination port</li>
<li>Layer 3 protocol (TCP 6, UDP 17, ICMP 1)</li>
<li>Type of Service byte (DSCP aur ECN)</li>
<li>Input interface</li>
</ol>
<p>Agar saat mein se koi bhi alag hai, to woh alag flow hai. Har flow ke liye router <b>non-key</b> information bhi store karta hai jaise byte aur packet counters, first aur last timestamps, TCP flags aur output interface.</p>

<h3>Flow cache aur flow expiry</h3>
<p>Router active flows ko memory mein ek <b>flow cache</b> mein rakhta hai. Naye flow ka pehla packet aane par ek cache entry banti hai; har agla packet counters update karta hai. Flow <b>expire</b> hota hai (cache se hatta hai aur, configured ho to, export hota hai) jab:</p>
<ul>
<li>Woh <b>inactive timeout</b> (default 15 second) tak idle raha ho.</li>
<li>Woh <b>active timeout</b> (default 30 minute) se zyada chala ho. Lambe flows tukdon mein report hote hain taaki collector unhe khatam hone se pehle dekh sake.</li>
<li>TCP FIN ya RST connection khatam kare.</li>
<li>Cache bhar gaya ho aur jagah chahiye.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="NetFlow architecture">
<rect x="20" y="60" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packets</text>
<rect x="190" y="40" width="160" height="100" rx="10" fill="#bae6fd"/><text x="270" y="70" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="270" y="95" text-anchor="middle" class="svg-muted" font-size="12">flow cache</text><text x="270" y="115" text-anchor="middle" class="svg-muted" font-size="12">key + counters</text>
<rect x="430" y="50" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="525" y="82" text-anchor="middle" class="svg-ink" font-size="13">Collector</text><text x="525" y="104" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.40 UDP 2055</text>
<line x1="140" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="90" x2="430" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="80" text-anchor="middle" class="svg-accent" font-size="12">export</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Expire hue flows records ki tarah export hote hain; collector unhe store aur graph karta hai</text>
</svg><p class="cap">Monitor, cache, export, collect: NetFlow pipeline.</p></div>

<h3>Export versions: v5, v9 aur IPFIX</h3>
<table class="cmp">
<tr><th>Version</th><th>Format</th><th>Notes</th></tr>
<tr><td>v5</td><td>Fixed record layout</td><td>Sirf IPv4, templates nahi, naye fields nahi le ja sakta. Ab bhi common, par legacy.</td></tr>
<tr><td>v9</td><td><b>Template based</b></td><td>Exporter pehle fields describe karne wala template bhejta hai, phir data records. IPv6, MPLS, aur Flexible NetFlow ka define kiya koi bhi field support karta hai.</td></tr>
<tr><td>IPFIX</td><td>Template based (aksar "v10" kehte hain)</td><td>v9 se bana IETF standard. Variable-length fields aur vendor (enterprise) fields jodta hai; transport UDP, TCP ya SCTP ho sakta hai.</td></tr>
</table>
<p>Exports normally UDP par ek <b>collector</b> ko bheje jaate hain. v5 aur v9 ka koi standard port nahi hai; 2055, 9995 aur 9996 common choices hain. IPFIX ka registered port 4739 hai. Kyunki v9 aur IPFIX templates use karte hain, jis collector ko abhi template nahi mila woh data decode nahi kar sakta; templates periodically dobara bheje jaate hain.</p>

<h3>Traditional NetFlow configuration</h3>
<p>Traditional NetFlow ab bhi purane IOS routers par milta hai. Yeh fixed key fields ke saath per interface configure hota hai:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/2
R1(config-if)# ip flow ingress
R1(config-if)# ip flow egress
R1(config-if)# exit
R1(config)# ip flow-export version 9
R1(config)# ip flow-export destination 192.0.2.40 2055
R1(config)# ip flow-export source Loopback0
R1(config)# ip flow-cache timeout active 1          <span class="c">! minutes</span></pre>
<pre class="out">R1# show ip cache flow
IP packet size distribution (1893 total packets):
...
SrcIf     SrcIPaddress    DstIf     DstIPaddress    Pr SrcP DstP  Pkts
Gi0/2     192.168.50.10   Gi0/0     198.51.100.10   06 C93A 01BB   212
Gi0/2     192.168.50.22   Gi0/0     203.0.113.53    11 D431 0035     2
<span class="hl">Gi0/2     192.168.50.31   Gi0/0     198.51.100.20   06 E1F0 0016  1540</span></pre>
<p>Ports aur protocol <b>hexadecimal</b> mein dikhte hain: 01BB 443 (HTTPS) hai, 0035 53 (DNS) hai, 0016 22 (SSH) hai, protocol 06 TCP aur 11 UDP hai. Highlighted line ek SSH session hai jisne 1540 packets move kiye.</p>

<div class="eg"><p><b>Worked example.</b> Ek user web page kholta hai aur browser source ports 50112 aur 50113 se 198.51.100.10:443 tak do TCP connections use karta hai. Yeh <b>do</b> flows hain, kyunki source port key field hai. Usse pehle ka DNS lookup teesra flow hai (port 53 par UDP). Agar session ke beech user ki DSCP marking badal jaaye, to ek aur flow banega, kyunki ToS bhi key field hai.</p></div>

<h3>NetFlow kyun matter karta hai</h3>
<ul>
<li><b>Capacity planning</b>: kaunsi applications aur kaunsi sites bandwidth use karti hain.</li>
<li><b>Troubleshooting</b>: congestion ke pal par top talkers, bina capture ke.</li>
<li><b>Security</b>: scans (ek source, hazaaron destinations), data exfiltration aur unusual protocols pakadna.</li>
<li>Departments ke beech <b>billing aur chargeback</b>.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> NetFlow sirf ek direction ya ek interface par enable karke totals par bharosa karna. Har interface par ingress-only collection se aap har flow ek baar dekhte ho; same path par ingress aur egress mix karne se flows do baar gine jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> NetFlow v5 IPv6 flows export nahi kar sakta; v9 aur IPFIX kar sakte hain. IPFIX v9 par based IETF standard hai. Aur NetFlow traffic ko summarise karta hai; payload capture nahi karta, isliye web page ka content nahi dikha sakta.</p></div>

<div class="scn"><h4>Har raat 01:00 baje bhara hua WAN link</h4><p>Ek manufacturing company ka 100 Mbps MPLS link har raat 100% par dikhta tha. SNMP graphs sirf yeh prove karte the ki link bhara hua hai. Engineer ne branch router par NetFlow v9 export enable kiya aur agli subah collector khola: 10.40.0.15 wala ek server 01:00 se 03:30 ke beech TCP 443 par ek cloud storage address ko 38 GB bhej raha tha. Yeh ek vendor ka install kiya hua unapproved backup agent tha. Use scheduled, rate-limited window mein shift kiya gaya.</p><p><b>Seekh:</b> SNMP batata hai <i>kitna</i>; NetFlow batata hai <i>kaun aur kya</i>.</p></div>

<div class="iv"><p class="q">"Traditional NetFlow flow ke key fields kya hain, aur flow kis cheez se khatam hota hai?"</p><p>Saat keys: source aur destination IP, source aur destination port, Layer 3 protocol, ToS byte aur input interface. Flow inactive timeout (15 s) ke baad, lambe flows ke liye active timeout (30 min) ke baad, TCP FIN ya RST par, ya jab cache ko jagah chahiye tab expire hota hai. Phir woh v5, v9 ya IPFIX format mein collector ko export hota hai. Strong candidate jodta hai ki v9 aur IPFIX template based hain aur IPv6 le jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow same key fields share karne wale packets hain; traditional NetFlow mein 7 fixed keys hain.</li>
<li>Flows cache mein rehte hain aur inactive (15 s) ya active (30 min) timeouts, FIN/RST ya cache pressure par expire hote hain.</li>
<li>v5 fixed aur sirf IPv4 hai; v9 template based hai; IPFIX v9 par based IETF standard hai.</li>
<li>Traditional config: har interface par <code>ip flow ingress</code> plus globally <code>ip flow-export</code>; <code>show ip cache flow</code> se verify karo.</li>
<li>NetFlow bina payload capture kiye "kaun aur kya" ka jawab deta hai.</li>
</ul></div>
`}};export{e as default};