var e={id:`live-tools`,h:{en:`Live Tools: ping and traceroute from a device`,hi:`Live Tools: device se ping aur traceroute`},body:{en:`
<h3>Why test from the device</h3>
<p>Alerts and logs tell you what the dashboard believes. <b>Live tools</b> let you <b>prove</b> it by sending real test packets from a chosen device, for example from MX-BLR, and reading the answer. The <b>Live tools</b> page offers two tools: <b>ping</b> and <b>traceroute</b>. Testing from the device matters because it shows what that device sees, not what your laptop sees.</p>

<h3>Ping: is the other side reachable?</h3>
<p><b>Ping</b> sends small <b>ICMP echo request</b> packets to a target and waits for <b>echo replies</b>. It tells you three things: <b>reachable or not</b>, <b>round-trip time</b> (how many milliseconds a packet takes to go and return) and <b>loss</b> (how many packets got no reply). A reply proves the whole path works in both directions at that moment. No reply is a clue, not a final answer, because a firewall may block ICMP on purpose.</p>
<pre class="out">Live tools  Ping  (from MX-BLR to 10.1.20.10)
Reply from 10.1.20.10: time=38 ms
Reply from 10.1.20.10: time=37 ms
Reply from 10.1.20.10: time=39 ms
<span class="hl">3 sent, 3 received, 0% loss</span>   avg 38 ms</pre>
<p>Here the Bengaluru MX reaches the Mumbai server through the VPN with about 38 ms. A very different picture:</p>
<pre class="out">Live tools  Ping  (from MX-BLR to 10.1.20.10)
Request timed out
Request timed out
Request timed out
<span class="hl">3 sent, 0 received, 100% loss</span></pre>

<h3>Traceroute: where does the path stop?</h3>
<p><b>Traceroute</b> shows the path hop by hop. A <b>hop</b> is one router that forwards the packet. Traceroute sends packets with a small <b>TTL</b> (time to live, a counter that each router lowers by one). When the counter reaches zero the router answers, so each hop reveals itself in turn. The output lists hop number, the router address and the time. A line of stars means <b>no answer</b> for that hop.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Traceroute path with a break">
<rect x="10" y="40" width="90" height="45" rx="8" fill="#bae6fd"/><text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="12">PC-BLR</text>
<rect x="135" y="40" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="180" y="67" text-anchor="middle" class="svg-ink" font-size="12">MX-BLR hop 1</text>
<rect x="260" y="40" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="305" y="67" text-anchor="middle" class="svg-ink" font-size="12">ISP-A hop 2</text>
<rect x="385" y="40" width="110" height="45" rx="8" fill="#fecaca"/><text x="440" y="67" text-anchor="middle" class="svg-ink" font-size="12">? hop 3 stars</text>
<rect x="530" y="40" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="575" y="67" text-anchor="middle" class="svg-ink" font-size="12">SRV-MUM</text>
<line x1="100" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/><line x1="225" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="350" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/><line x1="495" y1="62" x2="530" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="10" y="120" width="610" height="45" rx="6" fill="#fde68a"/><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="13">The last hop that answers shows how far the packet got</text>
<rect x="10" y="180" width="610" height="40" rx="6" fill="#e2e8f0"/><text x="315" y="205" text-anchor="middle" class="svg-ink" font-size="13">Problem is at or just after the last good hop</text>
</svg><p class="cap">Traceroute shows the last good hop, so you know where to look next.</p></div>

<h3>Reading a traceroute</h3>
<pre class="out">Live tools  Traceroute  (from MX-DEL to 10.1.20.10)
1  203.0.113.1     9 ms      <span class="hl">ISP-B gateway</span>
2  *  *  *          timeout
3  *  *  *          timeout
Trace incomplete</pre>
<p>Hop 1 is the ISP-B gateway, so the Delhi uplink works. Hops 2 and 3 give no answer: the packet is lost beyond the ISP. Because Delhi reaches the Mumbai server through AutoVPN, a down tunnel looks exactly like this from the spoke: the first hops answer, then silence. Compare with a healthy tunnel, where the path continues into the other side's addresses.</p>

<h3>What common problems look like</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Next check</th></tr>
<tr><td>Ping to 8.8.8.8 works, to a server fails</td><td>Firewall rule or VPN issue</td><td>Firewall hit counters; VPN status</td></tr>
<tr><td>Ping to 8.8.8.8 fails, gateway works</td><td>Uplink or ISP</td><td>Uplinks page, carrier</td></tr>
<tr><td>Ping to MX LAN fails</td><td>Local path: port, VLAN, AP</td><td>Switch port and trunk</td></tr>
<tr><td>Traceroute stops after ISP hop</td><td>Beyond the ISP: tunnel or remote side</td><td>VPN page, hub status</td></tr>
<tr><td>Traceroute stops at the MX</td><td>Local firewall or no route</td><td>Firewall order, addressing plan</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A Bengaluru user cannot reach intranet.example. From MX-BLR the engineer pings the Mumbai server 10.1.20.10: 100% loss. He pings 8.8.8.8: 0% loss, so the uplink is fine. Traceroute shows hop 1 MX-BLR, hop 2 ISP-A, then stars. The VPN page shows the tunnel down because the Bengaluru subnet was disabled for VPN. He enables it and pings again: 38 ms. Three tests, three facts, one fix.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Ping and traceroute only send test packets; they change no settings. They do create a little traffic, and the firewall counters may count it. Keep tests short and targeted. Results show the state at that instant, so repeat after any fix.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Testing from your laptop only; treating "no ping reply" as proof the host is down (ICMP may be blocked); testing a name instead of an address when DNS may be the problem; running one test and stopping; forgetting to test the return direction from the other site.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stars in traceroute do not always mean the link is broken at that hop: some devices do not reply to the probe but still forward. If the later hops answer, the path is fine. If everything after it is silent, the problem is there or after it.</p></div>

<div class="scn"><h4>Proving it was not the ISP</h4><p>The Delhi manager blamed the ISP for slow access. The engineer pinged 8.8.8.8 from MX-DEL: 0% loss, 12 ms. Pinging the Mumbai server over the tunnel: 100% loss. Traceroute stopped right after the ISP gateway. The ISP was fine; the tunnel was down because a VPN subnet had been unticked. The test results ended the argument and pointed to the fix.</p><p><b>Lesson:</b> a few live tests separate "internet" from "tunnel" from "firewall" in minutes.</p></div>

<div class="iv"><p class="q">"What is the difference between ping and traceroute, and when do you use each?"</p><p>Strong answer: ping tests reachability, loss and round-trip time to one target; traceroute shows each hop so I can see where the path stops. I ping the gateway, then the internet, then the target, and use traceroute when a ping fails to find the last good hop. I remember that ICMP can be blocked.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Live tools prove reachability from the device itself.</li>
<li>Ping gives reachable or not, round-trip time and loss.</li>
<li>Traceroute lists hops; the last answering hop shows how far traffic got.</li>
<li>A down tunnel or a firewall deny shows up as timeouts after the last good hop.</li>
<li>No reply is a clue, not proof; combine with logs and counters.</li>
</ul></div>
`,hi:`
<h3>Device se test kyun</h3>
<p>Alerts aur logs batate hain ki dashboard kya maanta hai. <b>Live tools</b> aapko chune hue device se, jaise MX-BLR se, asli test packets bhejkar use <b>prove</b> karne dete hain aur jawab padhne dete hain. <b>Live tools</b> page do tools deta hai: <b>ping</b> aur <b>traceroute</b>. Device se test karna isliye zaroori hai kyunki woh dikhata hai ki us device ko kya dikhta hai, aapke laptop ko nahi.</p>

<h3>Ping: kya doosri taraf reachable hai?</h3>
<p><b>Ping</b> target ko chhote <b>ICMP echo request</b> packets bhejta hai aur <b>echo replies</b> ka wait karta hai. Yeh teen cheezein batata hai: <b>reachable ya nahi</b>, <b>round-trip time</b> (packet ko jaane aur wapas aane mein kitne milliseconds lagte hain) aur <b>loss</b> (kitne packets ka reply nahi aaya). Reply prove karta hai ki us waqt poora path dono directions mein kaam kar raha hai. Reply nahi aana ek clue hai, final jawab nahi, kyunki firewall jaan-boojhkar ICMP block kar sakta hai.</p>
<pre class="out">Live tools  Ping  (from MX-BLR to 10.1.20.10)
Reply from 10.1.20.10: time=38 ms
Reply from 10.1.20.10: time=37 ms
Reply from 10.1.20.10: time=39 ms
<span class="hl">3 sent, 3 received, 0% loss</span>   avg 38 ms</pre>
<p>Yahan Bengaluru MX VPN se Mumbai server tak lagbhag 38 ms mein pahunchta hai. Ab bilkul alag tasveer:</p>
<pre class="out">Live tools  Ping  (from MX-BLR to 10.1.20.10)
Request timed out
Request timed out
Request timed out
<span class="hl">3 sent, 0 received, 100% loss</span></pre>

<h3>Traceroute: path kahan rukta hai?</h3>
<p><b>Traceroute</b> path ko hop by hop dikhata hai. <b>Hop</b> ek router hai jo packet forward karta hai. Traceroute chhote <b>TTL</b> (time to live, ek counter jo har router ek se kam karta hai) wale packets bhejta hai. Counter zero hone par router jawab deta hai, isliye har hop apni baari par khud ko reveal karta hai. Output mein hop number, router address aur time hota hai. Stars ki line ka matlab us hop ka <b>koi jawab nahi</b>.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Break wala traceroute path">
<rect x="10" y="40" width="90" height="45" rx="8" fill="#bae6fd"/><text x="55" y="67" text-anchor="middle" class="svg-ink" font-size="12">PC-BLR</text>
<rect x="135" y="40" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="180" y="67" text-anchor="middle" class="svg-ink" font-size="12">MX-BLR hop 1</text>
<rect x="260" y="40" width="90" height="45" rx="8" fill="#bbf7d0"/><text x="305" y="67" text-anchor="middle" class="svg-ink" font-size="12">ISP-A hop 2</text>
<rect x="385" y="40" width="110" height="45" rx="8" fill="#fecaca"/><text x="440" y="67" text-anchor="middle" class="svg-ink" font-size="12">? hop 3 stars</text>
<rect x="530" y="40" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="575" y="67" text-anchor="middle" class="svg-ink" font-size="12">SRV-MUM</text>
<line x1="100" y1="62" x2="135" y2="62" stroke="#64748b" stroke-width="2"/><line x1="225" y1="62" x2="260" y2="62" stroke="#64748b" stroke-width="2"/><line x1="350" y1="62" x2="385" y2="62" stroke="#64748b" stroke-width="2"/><line x1="495" y1="62" x2="530" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<rect x="10" y="120" width="610" height="45" rx="6" fill="#fde68a"/><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="13">Jo aakhri hop jawab deta hai woh dikhata hai packet kitna door gaya</text>
<rect x="10" y="180" width="610" height="40" rx="6" fill="#e2e8f0"/><text x="315" y="205" text-anchor="middle" class="svg-ink" font-size="13">Problem aakhri achhe hop par ya uske turant baad hai</text>
</svg><p class="cap">Traceroute aakhri achha hop dikhata hai, to pata chalta hai aage kahan dekhna hai.</p></div>

<h3>Traceroute padhna</h3>
<pre class="out">Live tools  Traceroute  (from MX-DEL to 10.1.20.10)
1  203.0.113.1     9 ms      <span class="hl">ISP-B gateway</span>
2  *  *  *          timeout
3  *  *  *          timeout
Trace incomplete</pre>
<p>Hop 1 ISP-B gateway hai, to Delhi uplink kaam karta hai. Hops 2 aur 3 jawab nahi dete: packet ISP ke aage kho jaata hai. Kyunki Delhi Mumbai server tak AutoVPN se jaata hai, spoke se down tunnel bilkul aisa hi dikhta hai: pehle hops jawab dete hain, phir khamoshi. Healthy tunnel se tulna karo, jahan path doosri taraf ke addresses mein aage badhta hai.</p>

<h3>Aam problems kaisi dikhti hain</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Likely cause</th><th>Agla check</th></tr>
<tr><td>8.8.8.8 ko ping chalta hai, server ko fail</td><td>Firewall rule ya VPN issue</td><td>Firewall hit counters; VPN status</td></tr>
<tr><td>8.8.8.8 ko ping fail, gateway chalta hai</td><td>Uplink ya ISP</td><td>Uplinks page, carrier</td></tr>
<tr><td>MX LAN ko ping fail</td><td>Local path: port, VLAN, AP</td><td>Switch port aur trunk</td></tr>
<tr><td>Traceroute ISP hop ke baad ruk jaata hai</td><td>ISP ke aage: tunnel ya remote side</td><td>VPN page, hub status</td></tr>
<tr><td>Traceroute MX par ruk jaata hai</td><td>Local firewall ya route nahi</td><td>Firewall order, addressing plan</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bengaluru ka ek user intranet.example nahi pahunch pa raha. MX-BLR se engineer Mumbai server 10.1.20.10 ko ping karta hai: 100% loss. Woh 8.8.8.8 ping karta hai: 0% loss, to uplink theek hai. Traceroute hop 1 MX-BLR, hop 2 ISP-A, phir stars dikhata hai. VPN page tunnel down dikhata hai kyunki Bengaluru subnet VPN ke liye disable tha. Woh use enable karta hai aur dobara ping karta hai: 38 ms. Teen tests, teen facts, ek fix.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Ping aur traceroute sirf test packets bhejte hain; koi setting nahi badalte. Woh thoda traffic banate hain, aur firewall counters use ginn sakte hain. Tests chhote aur targeted rakho. Results us pal ki state dikhate hain, isliye har fix ke baad repeat karo.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Sirf apne laptop se test karna; "ping reply nahi" ko host down ka saboot samajhna (ICMP block ho sakta hai); DNS problem ho sakti hai to address ki jagah naam test karna; ek test karke ruk jaana; doosre site se return direction test karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Traceroute mein stars ka matlab hamesha us hop par link toota hona nahi hai: kuch devices probe ka jawab nahi dete lekin forward karte hain. Agar baad ke hops jawab dete hain to path theek hai. Agar uske baad sab khamosh hai to problem wahan ya uske baad hai.</p></div>

<div class="scn"><h4>Saabit karna ki ISP galat nahi tha</h4><p>Delhi manager ne slow access ke liye ISP ko blame kiya. Engineer ne MX-DEL se 8.8.8.8 ping kiya: 0% loss, 12 ms. Tunnel se Mumbai server ko ping: 100% loss. Traceroute ISP gateway ke theek baad ruk gaya. ISP theek tha; tunnel down tha kyunki ek VPN subnet untick ho gaya tha. Test results ne behas khatam kar di aur fix ki taraf ishara kiya.</p><p><b>Seekh:</b> kuch live tests "internet", "tunnel" aur "firewall" ko minutes mein alag kar dete hain.</p></div>

<div class="iv"><p class="q">"Ping aur traceroute mein kya fark hai, aur kab kaunsa use karoge?"</p><p>Strong answer: ping ek target tak reachability, loss aur round-trip time test karta hai; traceroute har hop dikhata hai taaki main dekh sakoon path kahan rukta hai. Main gateway, phir internet, phir target ping karta hoon, aur ping fail hone par aakhri achha hop dhoondhne ke liye traceroute use karta hoon. Mujhe yaad rehta hai ki ICMP block ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Live tools device se hi reachability prove karte hain.</li>
<li>Ping reachable ya nahi, round-trip time aur loss deta hai.</li>
<li>Traceroute hops list karta hai; aakhri jawab dene wala hop batata hai traffic kitna door gaya.</li>
<li>Down tunnel ya firewall deny aakhri achhe hop ke baad timeouts ki tarah dikhta hai.</li>
<li>Reply nahi aana clue hai, saboot nahi; logs aur counters ke saath milao.</li>
</ul></div>
`}};export{e as default};