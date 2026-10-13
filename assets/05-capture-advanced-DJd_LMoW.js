var e={id:`capture-advanced`,h:{en:`Advanced captures: asp-drop, trace, both sides of NAT and pcap export`,hi:`Advanced captures: asp-drop, trace, NAT ke dono taraf aur pcap export`},body:{en:`
<p>Back to the CCTV analogy. A normal camera shows who walked through the door. But what about the people the guard turned away? A good building also keeps a camera pointed at the <b>rejection desk</b>, and it can freeze a frame and print the guard's reasoning next to it. The ASA offers both: <code>capture type asp-drop</code> records the packets the firewall threw away, and the <code>trace</code> option attaches a packet-tracer style explanation to real captured packets. Together with captures on both sides of NAT and a pcap export for Wireshark, these are the tools that end arguments.</p>

<h3>Capturing dropped packets: type asp-drop</h3>
<p>An asp-drop capture is not tied to an interface. It records packets that the Accelerated Security Path discarded, with the drop reason next to each one.</p>
<pre class="code"><span class="c">! every dropped packet (busy on a real network, keep it short)</span>
capture ASPDROP type asp-drop all
<span class="c">! only one drop reason, much quieter</span>
capture ACLDROP type asp-drop acl-drop
show capture ACLDROP
no capture ACLDROP</pre>
<pre class="out">NK-ASA# show capture ACLDROP

2 packets captured

   1: 10:14:02.118204       198.51.100.10.51544 &gt; 10.0.2.10.443: S 2201934411:2201934411(0) win 64240
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span>
   2: 10:14:03.121877       198.51.100.10.51544 &gt; 10.0.2.10.443: S 2201934411:2201934411(0) win 64240
Drop-reason: (acl-drop) Flow is denied by configured rule
2 packets shown</pre>
<p>Notice the destination is already the <b>real</b> address 10.0.2.10: the packet was untranslated before the ACL dropped it, exactly as the packet flow in chapter 2 predicts. The drop codes are the same ones you will count with <code>show asp drop</code> in chapter 7.</p>

<h3>Tracing real packets: the trace option</h3>
<p>packet-tracer simulates a packet you invent. The <code>trace</code> option does the same analysis for real packets as they are captured, which is invaluable when you are not sure of the exact ports or addresses a client uses.</p>
<pre class="code">capture CAP interface outside trace match tcp any host 203.0.113.3 eq 443
<span class="c">! later: show the trace of captured packet number 1</span>
show capture CAP packet-number 1 trace</pre>
<p>The output is the captured packet followed by the familiar phases (UN-NAT, ACCESS-LIST, NAT, FLOW-CREATION) and an Action line. By default only the first packets that match are traced (50), so the overhead is small.</p>

<h3>Proving NAT with captures on both sides</h3>
<p>This is the second lab. An auditor wants proof that inside addresses never leave the building. You capture PC1's pings on both interfaces and compare.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Captures on both sides of NAT">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="250" y="55" width="140" height="80" rx="10" fill="#fed7aa"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">INSIDE-NET PAT</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">to interface</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="565" y="109" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="130" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="95" r="9" fill="#fde68a"/><circle cx="450" cy="95" r="9" fill="#fde68a"/>
<text x="190" y="40" text-anchor="middle" class="svg-accent" font-size="12">CIN on inside</text>
<text x="450" y="40" text-anchor="middle" class="svg-accent" font-size="12">COUT on outside</text>
<text x="190" y="160" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 to 8.8.8.8</text>
<text x="450" y="160" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 to 8.8.8.8</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Same packets, same timestamps (1 ms apart), different source address</text>
</svg><p class="cap">The inside capture shows the real source; the outside capture shows the translated one.</p></div>
<pre class="code"><span class="c">! inside: the real addresses exist here</span>
capture CIN interface inside match icmp host 10.0.1.10 host 8.8.8.8
<span class="c">! outside: the source will be translated, so match any source</span>
capture COUT interface outside match icmp any host 8.8.8.8
<span class="c">! now ping 8.8.8.8 from PC1, then:</span>
show capture CIN
show capture COUT
show xlate</pre>
<pre class="out">NK-ASA# show capture CIN

10 packets captured

   1: 20:59:57.500000       <span class="hl">10.0.1.10</span> &gt; 8.8.8.8: icmp: echo request
   2: 20:59:57.503000       8.8.8.8 &gt; 10.0.1.10: icmp: echo reply
...
NK-ASA# show capture COUT

10 packets captured

   1: 20:59:57.501000       <span class="hl">203.0.113.2</span> &gt; 8.8.8.8: icmp: echo request
   2: 20:59:57.502000       8.8.8.8 &gt; 203.0.113.2: icmp: echo reply
...
NK-ASA# show xlate
1 in use, 1 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">ICMP PAT from inside:10.0.1.10/19499 to outside:203.0.113.2/40001 flags ri idle 0:00:01 timeout 0:00:30</span></pre>
<p>Match the lines by time: the echo request leaves the inside capture at .500 and appears on the outside at .501 with source 203.0.113.2, the outside interface address. The xlate confirms the PAT mapping. The answer for the lab is <b>203.0.113.2</b>. Finish with <code>no capture CIN</code> and <code>no capture COUT</code>.</p>

<h3>Exporting a pcap</h3>
<p>For long flows, TLS handshakes or timing analysis, open the capture in Wireshark. The ASA writes pcap format directly:</p>
<pre class="code"><span class="c">! copy to a TFTP server; the ASA prompts for the server address and file name</span>
copy /pcap capture:CAP tftp:
<span class="c">! or save to flash and pull it off with SCP later</span>
copy /pcap capture:CAP disk0:/portal-cap.pcap</pre>
<p>If ASDM or HTTPS management is enabled for your workstation, you can also download a capture in pcap format from the ASA's management web server in a browser, under the admin capture path followed by the capture name and <code>pcap</code>. Whichever method you use, store the file securely: captures may contain customer data.</p>

<div class="eg"><p><b>Worked example.</b> COUT shows 10 packets but CIN only 5, all echo requests. The requests leave with source 203.0.113.2 and the replies come back on the outside, but never reach the inside. A quick <code>capture ACLDROP type asp-drop acl-drop</code> shows the echo replies dropped on outside. <code>show run policy-map</code> reveals that <code>inspect icmp</code> was removed during a clean-up, so replies are treated as new packets and the outside ACL denies them. Re-adding the inspection fixes it; the captures on both sides told you exactly where the packets died.</p></div>

<div class="warn"><p><b>Common mistake.</b> Filtering the outside capture with the inside host address (<code>match icmp host 10.0.1.10 host 8.8.8.8</code>). After PAT that address never appears on the outside, the capture stays empty, and you wrongly conclude that the ASA is not forwarding. Use <code>any</code> or the mapped address.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>type asp-drop</code> captures are not bound to an interface and show a drop reason per packet. Interface captures never show drop reasons. If a question asks how to see which packets the ASA discarded and why, the answer is an asp-drop capture (or <code>show asp drop</code> for counters only).</p></div>

<div class="scn"><h4>Audit evidence in ten minutes</h4><p>A PCI auditor asked a retailer to prove that cardholder-zone addresses were never visible on the internet link. The engineer created paired captures on the inside and outside interfaces for a test host, exported both with <code>copy /pcap</code>, and gave the auditor the two files plus <code>show xlate</code> and <code>show nat detail</code> output. The auditor could see the same packets, with matching timestamps, carrying 10.x addresses on one side and only the public address on the other.</p><p><b>Lesson:</b> paired captures around NAT are the cleanest possible proof of what NAT does. Remove them when finished.</p></div>

<div class="iv"><p class="q">"How would you prove that the ASA dropped a packet and why?"</p><p>Start a capture of type asp-drop, ideally for a specific reason such as <code>acl-drop</code>, reproduce the flow, and show the captured packets with their Drop-reason lines. Back it with <code>show asp drop</code> counters increasing, syslog 106023 naming the ACL, and packet-tracer with the same five-tuple naming the exact rule. Mention the trace option for real captured packets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>capture NAME type asp-drop [all | reason]</code> records dropped packets with their reason.</li>
<li><code>trace</code> plus <code>show capture NAME packet-number N trace</code> explains real packets phase by phase.</li>
<li>Captures on both sides of NAT prove translation: real inside, mapped outside.</li>
<li>Match the outside capture with <code>any</code> or the mapped address.</li>
<li><code>copy /pcap capture:NAME tftp:</code> or save to disk0 for Wireshark; handle files as sensitive data.</li>
</ul></div>
`,hi:`
<p>CCTV analogy par wapas chalo. Normal camera dikhata hai ki darwaze se kaun guzra. Par un logon ka kya jinhe guard ne lauta diya? Ek achhi building ek camera <b>rejection desk</b> par bhi rakhti hai, aur woh frame rok kar uske saath guard ka reasoning print kar sakti hai. ASA dono deta hai: <code>capture type asp-drop</code> un packets ko record karta hai jo firewall ne phenk diye, aur <code>trace</code> option real captured packets ke saath packet-tracer jaisi explanation jodta hai. NAT ke dono taraf captures aur Wireshark ke liye pcap export ke saath, yahi tools hain jo bahas khatam karte hain.</p>

<h3>Dropped packets capture karna: type asp-drop</h3>
<p>asp-drop capture kisi interface se bandha nahi hota. Yeh un packets ko record karta hai jo Accelerated Security Path ne discard kiye, har ek ke saath drop reason.</p>
<pre class="code"><span class="c">! har dropped packet (real network par busy, chhota rakho)</span>
capture ASPDROP type asp-drop all
<span class="c">! sirf ek drop reason, kaafi shaant</span>
capture ACLDROP type asp-drop acl-drop
show capture ACLDROP
no capture ACLDROP</pre>
<pre class="out">NK-ASA# show capture ACLDROP

2 packets captured

   1: 10:14:02.118204       198.51.100.10.51544 &gt; 10.0.2.10.443: S 2201934411:2201934411(0) win 64240
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span>
   2: 10:14:03.121877       198.51.100.10.51544 &gt; 10.0.2.10.443: S 2201934411:2201934411(0) win 64240
Drop-reason: (acl-drop) Flow is denied by configured rule
2 packets shown</pre>
<p>Dhyaan do ki destination pehle se <b>real</b> address 10.0.2.10 hai: ACL ke drop karne se pehle packet untranslate ho chuka tha, bilkul waise jaise chapter 2 ka packet flow batata hai. Drop codes wahi hain jo aap chapter 7 mein <code>show asp drop</code> se ginoge.</p>

<h3>Real packets trace karna: trace option</h3>
<p>packet-tracer aapke banaye packet ko simulate karta hai. <code>trace</code> option real packets ke capture hote waqt unka wahi analysis karta hai, jo tab bahut kaam aata hai jab aapko client ke exact ports ya addresses pakke pata na hon.</p>
<pre class="code">capture CAP interface outside trace match tcp any host 203.0.113.3 eq 443
<span class="c">! baad mein: captured packet number 1 ka trace dikhao</span>
show capture CAP packet-number 1 trace</pre>
<p>Output mein captured packet ke baad jaane pehchaane phases (UN-NAT, ACCESS-LIST, NAT, FLOW-CREATION) aur ek Action line hoti hai. Default mein sirf pehle matching packets trace hote hain (50), isliye overhead kam hai.</p>

<h3>NAT ke dono taraf captures se saboot</h3>
<p>Yeh doosri lab hai. Ek auditor saboot chahta hai ki inside addresses kabhi building se bahar nahi jaate. Aap PC1 ki pings dono interfaces par capture karke compare karte ho.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Captures on both sides of NAT">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="109" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="250" y="55" width="140" height="80" rx="10" fill="#fed7aa"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="14">NK-ASA</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">INSIDE-NET PAT</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">interface par</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="92" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="565" y="109" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="130" y1="95" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="190" cy="95" r="9" fill="#fde68a"/><circle cx="450" cy="95" r="9" fill="#fde68a"/>
<text x="190" y="40" text-anchor="middle" class="svg-accent" font-size="12">CIN inside par</text>
<text x="450" y="40" text-anchor="middle" class="svg-accent" font-size="12">COUT outside par</text>
<text x="190" y="160" text-anchor="middle" class="svg-ink" font-size="12">10.0.1.10 se 8.8.8.8</text>
<text x="450" y="160" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.2 se 8.8.8.8</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Wahi packets, wahi timestamps (1 ms ka fark), alag source address</text>
</svg><p class="cap">Inside capture real source dikhata hai; outside capture translated source.</p></div>
<pre class="code"><span class="c">! inside: real addresses yahan exist karte hain</span>
capture CIN interface inside match icmp host 10.0.1.10 host 8.8.8.8
<span class="c">! outside: source translate hoga, isliye any source match karo</span>
capture COUT interface outside match icmp any host 8.8.8.8
<span class="c">! ab PC1 se 8.8.8.8 ping karo, phir:</span>
show capture CIN
show capture COUT
show xlate</pre>
<pre class="out">NK-ASA# show capture CIN

10 packets captured

   1: 20:59:57.500000       <span class="hl">10.0.1.10</span> &gt; 8.8.8.8: icmp: echo request
   2: 20:59:57.503000       8.8.8.8 &gt; 10.0.1.10: icmp: echo reply
...
NK-ASA# show capture COUT

10 packets captured

   1: 20:59:57.501000       <span class="hl">203.0.113.2</span> &gt; 8.8.8.8: icmp: echo request
   2: 20:59:57.502000       8.8.8.8 &gt; 203.0.113.2: icmp: echo reply
...
NK-ASA# show xlate
1 in use, 1 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">ICMP PAT from inside:10.0.1.10/19499 to outside:203.0.113.2/40001 flags ri idle 0:00:01 timeout 0:00:30</span></pre>
<p>Lines ko time se milao: echo request inside capture se .500 par nikalta hai aur outside par .501 par source 203.0.113.2 ke saath dikhta hai, jo outside interface ka address hai. xlate PAT mapping confirm karta hai. Lab ka jawab <b>203.0.113.2</b> hai. <code>no capture CIN</code> aur <code>no capture COUT</code> se khatam karo.</p>

<h3>pcap export karna</h3>
<p>Lambe flows, TLS handshakes ya timing analysis ke liye capture ko Wireshark mein kholo. ASA seedha pcap format likhta hai:</p>
<pre class="code"><span class="c">! TFTP server par copy karo; ASA server address aur file name poochta hai</span>
copy /pcap capture:CAP tftp:
<span class="c">! ya flash par save karo aur baad mein SCP se nikalo</span>
copy /pcap capture:CAP disk0:/portal-cap.pcap</pre>
<p>Agar aapke workstation ke liye ASDM ya HTTPS management enable hai, to aap browser mein ASA ke management web server se bhi capture pcap format mein download kar sakte ho, admin capture path ke neeche capture name aur <code>pcap</code> ke saath. Jo bhi method use karo, file ko surakshit rakho: captures mein customer data ho sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> COUT 10 packets dikhata hai par CIN sirf 5, sab echo requests. Requests source 203.0.113.2 ke saath nikalti hain aur replies outside par wapas aati hain, par inside tak kabhi nahi pahunchti. Ek jaldi <code>capture ACLDROP type asp-drop acl-drop</code> dikhata hai ki echo replies outside par drop ho rahe hain. <code>show run policy-map</code> batata hai ki clean-up ke dauran <code>inspect icmp</code> hata diya gaya tha, isliye replies naye packets maane jaate hain aur outside ACL unhe deny karti hai. Inspection wapas jodne se theek ho jaata hai; dono taraf ke captures ne exactly bataya ki packets kahan mare.</p></div>

<div class="warn"><p><b>Common galti.</b> Outside capture ko inside host address se filter karna (<code>match icmp host 10.0.1.10 host 8.8.8.8</code>). PAT ke baad woh address outside par kabhi dikhta hi nahi, capture khaali rehta hai, aur aap galat nateeja nikaalte ho ki ASA forward nahi kar raha. <code>any</code> ya mapped address use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>type asp-drop</code> captures kisi interface se bandhe nahi hote aur har packet ke saath drop reason dikhate hain. Interface captures kabhi drop reasons nahi dikhate. Agar question poochhe ki kaise dekhein ki ASA ne kaunse packets discard kiye aur kyun, to jawab asp-drop capture hai (ya sirf counters ke liye <code>show asp drop</code>).</p></div>

<div class="scn"><h4>Das minute mein audit evidence</h4><p>Ek PCI auditor ne ek retailer se saboot maanga ki cardholder-zone addresses internet link par kabhi dikhte nahi. Engineer ne ek test host ke liye inside aur outside interfaces par paired captures banaye, dono ko <code>copy /pcap</code> se export kiya, aur auditor ko do files ke saath <code>show xlate</code> aur <code>show nat detail</code> ka output diya. Auditor ne dekha ki wahi packets, matching timestamps ke saath, ek taraf 10.x addresses aur doosri taraf sirf public address le ja rahe the.</p><p><b>Seekh:</b> NAT ke aas paas paired captures NAT kya karta hai iska sabse saaf saboot hain. Kaam ho jaane par unhe hata do.</p></div>

<div class="iv"><p class="q">"Aap kaise saabit karoge ki ASA ne ek packet drop kiya aur kyun?"</p><p>asp-drop type ka capture shuru karo, behtar hai kisi specific reason jaise <code>acl-drop</code> ke liye, flow reproduce karo, aur captured packets unki Drop-reason lines ke saath dikhao. Ise badhte hue <code>show asp drop</code> counters, ACL ka naam batane wale syslog 106023, aur exact rule batane wale same five-tuple ke packet-tracer se support karo. Real captured packets ke liye trace option mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>capture NAME type asp-drop [all | reason]</code> dropped packets ko unke reason ke saath record karta hai.</li>
<li><code>trace</code> plus <code>show capture NAME packet-number N trace</code> real packets ko phase dar phase samjhata hai.</li>
<li>NAT ke dono taraf captures translation saabit karte hain: inside real, outside mapped.</li>
<li>Outside capture ko <code>any</code> ya mapped address se match karo.</li>
<li>Wireshark ke liye <code>copy /pcap capture:NAME tftp:</code> ya disk0 par save; files ko sensitive data ki tarah sambhalo.</li>
</ul></div>
`}};export{e as default};