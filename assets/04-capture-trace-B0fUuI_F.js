var e={id:`capture-trace`,h:{en:`Captures with trace: real packets, real verdicts`,hi:`Trace ke saath captures: real packets, real verdicts`},body:{en:`
<p>packet-tracer is a simulation. A capture is CCTV footage: it records real packets that really crossed an interface. On Threat Defense the CCTV camera has a bonus feature called <b>trace</b>: for captured packets, the firewall also records the full packet-tracer-style journey of that real packet, including the Snort verdict. When a simulation and reality disagree, reality wins, and capture with trace is how you see reality.</p>

<h3>Step 1: does the traffic arrive?</h3>
<pre class="code"><span class="c">! Lab task 1: capture on the outside for the published address</span>
&gt; capture CAP interface outside match tcp any host 203.0.113.3
<span class="c">! Now ask the partner (PARTNER, 198.51.100.10) to open the portal over HTTPS</span>
&gt; show capture CAP</pre>
<pre class="out">3 packets captured

   1: 09:14:02.118227  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
   2: 09:14:03.120113  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
   3: 09:14:05.122540  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
<span class="hl">3 packets shown</span></pre>
<p>Three SYNs with the same sequence number, one, two and four seconds apart, and no reply: the client is <b>retransmitting</b> because nothing answers. The traffic arrives, so the upstream path is fine. The problem is inside the firewall or behind it.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Capture points">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text>
<rect x="220" y="50" width="200" height="90" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">LINA + Snort</text>
<rect x="510" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">WEB</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="420" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="200" cy="95" r="9" fill="#fde68a"/><text x="200" y="40" text-anchor="middle" class="svg-accent" font-size="12">CAP (outside)</text>
<circle cx="440" cy="95" r="9" fill="#fde68a"/><text x="440" y="40" text-anchor="middle" class="svg-accent" font-size="12">CAPD (dmz)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">In on outside but not out on dmz = the firewall dropped it</text>
</svg><p class="cap">Capture on both sides of the firewall. The comparison tells you whether the firewall dropped, translated or forwarded the packet.</p></div>

<h3>Step 2: add trace to see why</h3>
<pre class="code">&gt; capture CAPT interface outside trace detail match tcp host 198.51.100.10 host 203.0.113.3
&gt; show capture CAPT packet-number 1 trace</pre>
<pre class="out">1: 09:21:44.501118  198.51.100.10.40002 &gt; 203.0.113.3.443: S 99127301:99127301(0) win 64240
Phase: 1
Type: CAPTURE
Result: ALLOW
...
Phase: 3
Type: ROUTE-LOOKUP
Result: ALLOW
Found next-hop 203.0.113.3 using egress ifc  outside(vrfid:0)
Phase: 4
Type: ACCESS-LIST
Subtype: log
Result: DROP
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE</span>
Result:
input-interface: outside(vrfid:0)
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>This is the same story packet-tracer told, but now it is proven with a real packet from the real partner. By default, trace records the first 50 matching packets; <code>trace-count</code> changes that. Keep the match tight, because tracing costs CPU.</p>

<h3>Step 3: the Snort view and drop captures</h3>
<ul>
<li><b>Both sides of NAT.</b> After the fix, <code>capture CAPD interface dmz match tcp any host 10.0.2.10</code> should show the same SYN with the destination untranslated to 10.0.2.10, and the SYN-ACK coming back.</li>
<li><b>Drop capture.</b> <code>capture ASP type asp-drop acl-drop</code> records packets LINA drops for a given reason (or <code>all</code>). It answers "what is the firewall throwing away right now?"</li>
<li><b>Snort's view.</b> <code>capture-traffic</code> runs a tcpdump-style capture of the traffic Snort sees. You choose the domain and give tcpdump options.</li>
</ul>
<pre class="out">&gt; capture-traffic

Please choose domain to capture traffic from:
  0 - management0
  1 - Global

Selection? 1

Please specify tcpdump options desired.
(or enter '?' for a list of supported options)
Options: -n host 10.0.2.10 and port 443</pre>
<p>In the Management Center, the device <b>Troubleshoot</b> tools offer the same packet capture with trace through a form, and let you download a pcap for analysis in a packet analyser.</p>

<h3>Housekeeping</h3>
<pre class="code">&gt; show capture
<span class="c">! lists every capture, its interface, filter and bytes used</span>
&gt; clear capture CAP
<span class="c">! empties the buffer, keeps the capture running</span>
&gt; no capture CAP
<span class="c">! removes it completely: the last step of lab task 4</span></pre>

<div class="eg"><p><b>Worked example.</b> Before the fix: CAP on outside shows 3 SYNs, CAPD on dmz shows 0 packets. Verdict: the firewall drops. After the fix: CAP shows SYN, ACK and data; CAPD shows SYN to 10.0.2.10, SYN-ACK from 10.0.2.10, and data. Verdict: the firewall forwards and translates, the server answers.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Capturing on the dmz with the public address 203.0.113.3 (on the dmz the packet carries 10.0.2.10). Leaving captures running for days: they use memory, and trace uses CPU. Forgetting that a capture with zero packets on outside means the problem is upstream, for example the upstream router has no ARP entry for the published address because no NAT rule makes the firewall answer for it.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>capture ... trace</code> plus <code>show capture NAME packet-number N trace</code> shows the real packet's phases including Snort. <code>capture-traffic</code> is the Snort-side tcpdump. <code>type asp-drop</code> captures packets dropped by LINA's accelerated security path.</p></div>

<div class="scn"><h4>The capture that cleared the firewall</h4><p>A team blamed the new FTD for a broken API. The engineer captured on outside for the API's public address while the client retried: zero packets. A capture on the upstream router showed the client's packets going to an old address from a DNS record nobody had updated after the migration. The firewall was never in the path of those packets.</p><p><b>Lesson:</b> the ingress capture is the cheapest, fastest proof in the whole toolkit. Run it first.</p></div>

<div class="iv"><p class="q">"How do you prove whether FTD or Snort dropped a real packet?"</p><p>Capture on ingress with <code>trace detail</code> and a tight match, then <code>show capture NAME packet-number 1 trace</code>. The phases show whether LINA dropped it (for example ACCESS-LIST acl-drop, no-route) or whether the SNORT phase returned a block verdict. Compare with a capture on the egress interface, and use <code>capture-traffic</code> for Snort's own view. Remove the captures when done.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capture on ingress first: no packets means the problem is upstream.</li>
<li>Retransmitted SYNs with no reply mean something in the path is not answering.</li>
<li>Add <code>trace detail</code> and read <code>show capture NAME packet-number N trace</code> for a real packet's verdict.</li>
<li>Capture both sides of NAT with the right address on each side; use asp-drop captures for LINA drops.</li>
<li>Clean up with <code>no capture NAME</code>.</li>
</ul></div>
`,hi:`
<p>packet-tracer ek simulation hai. Capture CCTV footage hai: yeh real packets record karta hai jo sach mein interface se guzre. Threat Defense par is CCTV camera ka ek bonus feature hai jiska naam <b>trace</b> hai: captured packets ke liye firewall us real packet ka poora packet-tracer jaisa safar bhi record karta hai, Snort verdict samet. Jab simulation aur reality alag hon, to reality jeetti hai, aur trace ke saath capture hi reality dekhne ka tareeka hai.</p>

<h3>Step 1: kya traffic aa raha hai?</h3>
<pre class="code"><span class="c">! Lab task 1: published address ke liye outside par capture</span>
&gt; capture CAP interface outside match tcp any host 203.0.113.3
<span class="c">! Ab partner (PARTNER, 198.51.100.10) se portal HTTPS par khulwao</span>
&gt; show capture CAP</pre>
<pre class="out">3 packets captured

   1: 09:14:02.118227  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
   2: 09:14:03.120113  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
   3: 09:14:05.122540  198.51.100.10.40000 &gt; 203.0.113.3.443: S 1820412377:1820412377(0) win 64240 &lt;mss 1460,sackOK,nop,wscale 7&gt;
<span class="hl">3 packets shown</span></pre>
<p>Ek hi sequence number wale teen SYN, ek, do aur chaar second ke gap par, aur koi reply nahi: client <b>retransmit</b> kar raha hai kyunki koi jawab nahi deta. Traffic aa raha hai, to upstream path theek hai. Problem firewall ke andar ya uske peeche hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Capture points">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text>
<rect x="220" y="50" width="200" height="90" rx="8" fill="#bae6fd"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">LINA + Snort</text>
<rect x="510" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="100" text-anchor="middle" class="svg-ink" font-size="13">WEB</text>
<line x1="130" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="420" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<circle cx="200" cy="95" r="9" fill="#fde68a"/><text x="200" y="40" text-anchor="middle" class="svg-accent" font-size="12">CAP (outside)</text>
<circle cx="440" cy="95" r="9" fill="#fde68a"/><text x="440" y="40" text-anchor="middle" class="svg-accent" font-size="12">CAPD (dmz)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Outside par aaya par dmz se nahi nikla = firewall ne drop kiya</text>
</svg><p class="cap">Firewall ke dono taraf capture karo. Comparison batata hai ki firewall ne packet drop, translate ya forward kiya.</p></div>

<h3>Step 2: kyun, yeh dekhne ke liye trace jodo</h3>
<pre class="code">&gt; capture CAPT interface outside trace detail match tcp host 198.51.100.10 host 203.0.113.3
&gt; show capture CAPT packet-number 1 trace</pre>
<pre class="out">1: 09:21:44.501118  198.51.100.10.40002 &gt; 203.0.113.3.443: S 99127301:99127301(0) win 64240
Phase: 1
Type: CAPTURE
Result: ALLOW
...
Phase: 3
Type: ROUTE-LOOKUP
Result: ALLOW
Found next-hop 203.0.113.3 using egress ifc  outside(vrfid:0)
Phase: 4
Type: ACCESS-LIST
Subtype: log
Result: DROP
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE</span>
Result:
input-interface: outside(vrfid:0)
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Yeh wahi kahani hai jo packet-tracer ne batayi, par ab real partner ke real packet se prove hui hai. Default roop se trace pehle 50 matching packets record karta hai; <code>trace-count</code> ise badalta hai. Match tight rakho, kyunki tracing CPU leti hai.</p>

<h3>Step 3: Snort ka view aur drop captures</h3>
<ul>
<li><b>NAT ke dono taraf.</b> Fix ke baad <code>capture CAPD interface dmz match tcp any host 10.0.2.10</code> mein wahi SYN dikhna chahiye jiska destination 10.0.2.10 mein untranslate hua ho, aur SYN-ACK wapas aata hua.</li>
<li><b>Drop capture.</b> <code>capture ASP type asp-drop acl-drop</code> un packets ko record karta hai jo LINA kisi reason se drop karta hai (ya <code>all</code>). Yeh jawab deta hai "firewall abhi kya phenk raha hai?"</li>
<li><b>Snort ka view.</b> <code>capture-traffic</code> us traffic ka tcpdump-style capture chalata hai jo Snort dekhta hai. Aap domain chunte ho aur tcpdump options dete ho.</li>
</ul>
<pre class="out">&gt; capture-traffic

Please choose domain to capture traffic from:
  0 - management0
  1 - Global

Selection? 1

Please specify tcpdump options desired.
(or enter '?' for a list of supported options)
Options: -n host 10.0.2.10 and port 443</pre>
<p>Management Center mein device ke <b>Troubleshoot</b> tools ek form ke through trace ke saath wahi packet capture dete hain, aur packet analyser mein analysis ke liye pcap download karne dete hain.</p>

<h3>Housekeeping</h3>
<pre class="code">&gt; show capture
<span class="c">! har capture, uska interface, filter aur use hue bytes list karta hai</span>
&gt; clear capture CAP
<span class="c">! buffer khali karta hai, capture chalta rehta hai</span>
&gt; no capture CAP
<span class="c">! use poori tarah hata deta hai: lab task 4 ka aakhri step</span></pre>

<div class="eg"><p><b>Worked example.</b> Fix se pehle: outside par CAP 3 SYN dikhata hai, dmz par CAPD 0 packets. Verdict: firewall drop karta hai. Fix ke baad: CAP SYN, ACK aur data dikhata hai; CAPD 10.0.2.10 ko SYN, 10.0.2.10 se SYN-ACK, aur data dikhata hai. Verdict: firewall forward aur translate karta hai, server jawab deta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> dmz par public address 203.0.113.3 ke saath capture karna (dmz par packet 10.0.2.10 carry karta hai). Captures ko dino tak chalta chhodna: woh memory lete hain, aur trace CPU leta hai. Yeh bhoolna ki outside par zero packets wale capture ka matlab problem upstream hai, jaise upstream router ke paas published address ki ARP entry nahi kyunki koi NAT rule firewall ko us address ke liye jawab nahi dilwati.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>capture ... trace</code> plus <code>show capture NAME packet-number N trace</code> real packet ke phases Snort samet dikhata hai. <code>capture-traffic</code> Snort-side tcpdump hai. <code>type asp-drop</code> LINA ke accelerated security path se drop hue packets capture karta hai.</p></div>

<div class="scn"><h4>Woh capture jisne firewall ko clear kiya</h4><p>Ek team ne tooti API ke liye naye FTD ko blame kiya. Engineer ne client ke retry karte waqt API ke public address ke liye outside par capture kiya: zero packets. Upstream router par capture se pata chala ki client ke packets ek purane address par jaa rahe the, ek DNS record se jise migration ke baad kisi ne update nahi kiya tha. Firewall un packets ke path mein tha hi nahi.</p><p><b>Seekh:</b> ingress capture poori toolkit ka sabse sasta, sabse tez saboot hai. Ise pehle chalao.</p></div>

<div class="iv"><p class="q">"Aap kaise prove karte ho ki real packet ko FTD ne drop kiya ya Snort ne?"</p><p>Ingress par <code>trace detail</code> aur tight match ke saath capture karo, phir <code>show capture NAME packet-number 1 trace</code>. Phases dikhate hain ki LINA ne drop kiya (jaise ACCESS-LIST acl-drop, no-route) ya SNORT phase ne block verdict lautaya. Egress interface ke capture se compare karo, aur Snort ke apne view ke liye <code>capture-traffic</code> use karo. Kaam ke baad captures hatao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle ingress par capture karo: packets nahi matlab problem upstream hai.</li>
<li>Bina reply ke retransmit hote SYN matlab path mein kuch jawab nahi de raha.</li>
<li><code>trace detail</code> jodo aur real packet ke verdict ke liye <code>show capture NAME packet-number N trace</code> padho.</li>
<li>NAT ke dono taraf har side ke sahi address ke saath capture karo; LINA drops ke liye asp-drop captures use karo.</li>
<li><code>no capture NAME</code> se saaf-safai karo.</li>
</ul></div>
`}};export{e as default};