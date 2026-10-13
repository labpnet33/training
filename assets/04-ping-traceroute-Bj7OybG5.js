var e={id:`ping-traceroute`,h:{en:`Interface errors, duplex, ping and traceroute`,hi:`Interface errors, duplex, ping aur traceroute`},body:{en:`
<p>A link that is up can still be bad. This chapter covers two things: counters that reveal a sick link, and the two test tools every engineer uses, <b>ping</b> and <b>traceroute</b>.</p>

<h3>Counters and duplex</h3>
<p>Use <code>show interfaces ge-0/0/0 extensive</code> for the full picture: speed, link-mode, flaps, traffic counters and error counters. Two ends of an Ethernet link must agree on <b>speed</b> and <b>duplex</b>. Full duplex means both ends can send at the same time. Half duplex means they take turns and expect collisions.</p>
<p>The classic fault is the <b>duplex mismatch</b>. One end is hard-set (for example <code>speed 100m</code> and <code>link-mode full-duplex</code>), so it stops negotiating. The other end, still auto-negotiating, hears nothing and falls back to half duplex. The link comes up and routing even works, but throughput is poor.</p>
<table class="cmp"><tr><th>Side</th><th>Mode</th><th>Counters you see</th></tr>
<tr><td>Hard-set full duplex (R1)</td><td>Full-duplex</td><td>Framing errors, CRC errors, runts</td></tr>
<tr><td>Auto-negotiating (R2)</td><td>Half-duplex</td><td>Collisions, late collisions</td></tr></table>
<pre class="out">lab@R2-CORE&gt; show interfaces ge-0/0/0 extensive | match "Speed|Link-mode|collisions|errors"
  Link-level type: Ethernet, MTU: 1514, <span class="hl">Speed: 100mbps, Link-mode: Half-duplex</span>
    Input errors: 0, Drops: 0, Framing errors: 0, Runts: 0
    Collisions: 214, Late collisions: 31, Output errors: 245
</pre>
<p>The fix is to make both ends the same. The easiest and recommended way is to remove the manual settings and let both auto-negotiate. Then zero the counters and watch whether they stay at zero:</p>
<pre class="code">lab@R1-JPR# delete interfaces ge-0/0/0 speed
lab@R1-JPR# delete interfaces ge-0/0/0 link-mode
lab@R1-JPR# commit and-quit
lab@R1-JPR&gt; clear interfaces statistics all
lab@R1-JPR&gt; show interfaces ge-0/0/0 extensive</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Duplex mismatch">
<rect x="30" y="40" width="170" height="60" rx="10" fill="#bae6fd"/><text x="115" y="65" text-anchor="middle" class="svg-ink" font-size="13">R1 ge-0/0/0</text><text x="115" y="85" text-anchor="middle" class="svg-muted" font-size="12">100m full (hard-set)</text>
<rect x="440" y="40" width="170" height="60" rx="10" fill="#fed7aa"/><text x="525" y="65" text-anchor="middle" class="svg-ink" font-size="13">R2 ge-0/0/0</text><text x="525" y="85" text-anchor="middle" class="svg-muted" font-size="12">auto, fell to half</text>
<line x1="200" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="3"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">link up, but lossy</text>
<text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">CRC, framing, runts</text><text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">collisions, late coll.</text>
</svg><p class="cap">Different counters on each end are the fingerprint of a duplex mismatch.</p></div>

<h3>ping: is it reachable?</h3>
<pre class="code">ping 10.33.3.10 count 5 rapid        <span class="c">! ! = reply, . = timeout</span>
ping 10.33.3.10 source 10.255.1.1    <span class="c">! use the loopback as source</span>
ping 10.33.3.10 size 1472 do-not-fragment <span class="c">! test MTU</span></pre>
<pre class="out">lab@R1-JPR&gt; ping 10.33.3.10 count 5 rapid
PING 10.33.3.10 (10.33.3.10): 56 data bytes
!!!!!
--- 10.33.3.10 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max/stddev = 0.8/1.1/1.9/0.4 ms
</pre>
<p>Junos ping runs until you press Ctrl+C unless you give <code>count</code>. By default the source is the outgoing interface address. The <code>source</code> option tests the return path to a specific address.</p>

<h3>traceroute: where does it stop?</h3>
<p>Traceroute sends probes with TTL 1, 2, 3 and so on. Each router that reduces the TTL to zero drops the probe and returns an ICMP time exceeded from the interface the probe came in on, so each line shows the <b>ingress address</b> of the next router. The destination replies with port unreachable and the trace ends.</p>
<pre class="out">lab@R1-SURAT&gt; traceroute 10.4.4.10
traceroute to 10.4.4.10 (10.4.4.10), 30 hops max, 40 byte packets
 1  10.0.12.2 (10.0.12.2)  0.812 ms  0.601 ms  0.588 ms
 2  10.0.23.2 (10.0.23.2)  1.104 ms  0.904 ms  0.896 ms
 3  <span class="hl">10.0.23.2 (10.0.23.2)  1.044 ms !H  0.905 ms !H  0.871 ms !H</span>
</pre>
<ul>
<li><code>!H</code> or <code>!N</code>: a router said host or network unreachable. That router has <b>no route</b> onward. The fault is at the last address printed.</li>
<li><code>* * *</code>: no answer. Possible causes: a filter, a missing return route, or a device that does not reply to probes.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Blaming the last router that answered, when the real fault is a missing <b>return</b> route. A ping needs routes both ways. Use <code>source</code> to test from a different address.</p></div>
<div class="exam"><p><b>Exam trap.</b> Duplex mismatch comes with different counters on each side. A question that shows late collisions on one end and CRC errors on the other wants "duplex mismatch", not "bad cable".</p></div>

<div class="scn"><h4>Four hops, one missing route</h4><p>After R3 was replaced in a Surat network, the ERP server went dark. A traceroute from R1 listed R2, then 10.0.23.2, then repeated 10.0.23.2 with <code>!H</code>. The address 10.0.23.2 is the ingress interface of R3, so R3 was the router with no route to the server LAN 10.4.4.0/24. The replacement router had been built without that static route. One line fixed it and the trace then showed four hops including the server.</p><p><b>Lesson:</b> traceroute turns "it does not work" into "this router has no route".</p></div>

<div class="iv"><p class="q">"How does traceroute work, and what does !H mean?"</p><p>It increments the TTL from 1; each router that expires the TTL replies with ICMP time exceeded, revealing its ingress address; the destination answers port unreachable. !H means a router returned host unreachable, so it has no route onward, and you look at that router's routing table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show interfaces extensive shows speed, link-mode and error counters.</li>
<li>Duplex mismatch: CRC, framing and runts on the full side; collisions on the half side.</li>
<li>Fix by removing manual speed and link-mode on both ends, then clear interfaces statistics all and recheck.</li>
<li>ping count n rapid gives quick loss figures; source tests the return path.</li>
<li>traceroute shows ingress addresses; !H points to the router lacking a route.</li>
</ul></div>
`,hi:`
<p>Jo link up hai woh bhi kharab ho sakta hai. Is chapter mein do cheezein hain: woh counters jo beemar link dikhate hain, aur har engineer ke do test tools, <b>ping</b> aur <b>traceroute</b>.</p>

<h3>Counters aur duplex</h3>
<p>Poori tasveer ke liye <code>show interfaces ge-0/0/0 extensive</code> use karo: speed, link-mode, flaps, traffic counters aur error counters. Ethernet link ke dono ends ko <b>speed</b> aur <b>duplex</b> par agree hona chahiye. Full duplex matlab dono end ek saath bhej sakte hain. Half duplex matlab baari baari bhejte hain aur collisions expect hote hain.</p>
<p>Classic fault <b>duplex mismatch</b> hai. Ek end hard-set hai (jaise <code>speed 100m</code> aur <code>link-mode full-duplex</code>), isliye woh negotiate karna band kar deta hai. Doosra end jo auto-negotiate kar raha hai kuch nahi sunta aur half duplex par gir jaata hai. Link up ho jaata hai, routing bhi chalti hai, lekin throughput kharab hota hai.</p>
<table class="cmp"><tr><th>Side</th><th>Mode</th><th>Counters jo dikhte hain</th></tr>
<tr><td>Hard-set full duplex (R1)</td><td>Full-duplex</td><td>Framing errors, CRC errors, runts</td></tr>
<tr><td>Auto-negotiating (R2)</td><td>Half-duplex</td><td>Collisions, late collisions</td></tr></table>
<pre class="out">lab@R2-CORE&gt; show interfaces ge-0/0/0 extensive | match "Speed|Link-mode|collisions|errors"
  Link-level type: Ethernet, MTU: 1514, <span class="hl">Speed: 100mbps, Link-mode: Half-duplex</span>
    Input errors: 0, Drops: 0, Framing errors: 0, Runts: 0
    Collisions: 214, Late collisions: 31, Output errors: 245
</pre>
<p>Fix yeh hai ki dono ends same karo. Sabse aasaan aur recommended tarika manual settings hatana hai taaki dono auto-negotiate karein. Phir counters zero karo aur dekho zero rehte hain ya nahi:</p>
<pre class="code">lab@R1-JPR# delete interfaces ge-0/0/0 speed
lab@R1-JPR# delete interfaces ge-0/0/0 link-mode
lab@R1-JPR# commit and-quit
lab@R1-JPR&gt; clear interfaces statistics all
lab@R1-JPR&gt; show interfaces ge-0/0/0 extensive</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Duplex mismatch">
<rect x="30" y="40" width="170" height="60" rx="10" fill="#bae6fd"/><text x="115" y="65" text-anchor="middle" class="svg-ink" font-size="13">R1 ge-0/0/0</text><text x="115" y="85" text-anchor="middle" class="svg-muted" font-size="12">100m full (hard-set)</text>
<rect x="440" y="40" width="170" height="60" rx="10" fill="#fed7aa"/><text x="525" y="65" text-anchor="middle" class="svg-ink" font-size="13">R2 ge-0/0/0</text><text x="525" y="85" text-anchor="middle" class="svg-muted" font-size="12">auto, half par gira</text>
<line x1="200" y1="70" x2="440" y2="70" stroke="#64748b" stroke-width="3"/><text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">link up, lekin lossy</text>
<text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">CRC, framing, runts</text><text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">collisions, late coll.</text>
</svg><p class="cap">Har end par alag counters duplex mismatch ki pehchaan hain.</p></div>

<h3>ping: reachable hai?</h3>
<pre class="code">ping 10.33.3.10 count 5 rapid        <span class="c">! ! = reply, . = timeout</span>
ping 10.33.3.10 source 10.255.1.1    <span class="c">! loopback ko source banao</span>
ping 10.33.3.10 size 1472 do-not-fragment <span class="c">! MTU test</span></pre>
<pre class="out">lab@R1-JPR&gt; ping 10.33.3.10 count 5 rapid
PING 10.33.3.10 (10.33.3.10): 56 data bytes
!!!!!
--- 10.33.3.10 ping statistics ---
5 packets transmitted, 5 packets received, 0% packet loss
round-trip min/avg/max/stddev = 0.8/1.1/1.9/0.4 ms
</pre>
<p>Junos ping <code>count</code> diye bina Ctrl+C dabane tak chalta rehta hai. Default source outgoing interface ka address hota hai. <code>source</code> option kisi specific address tak return path test karta hai.</p>

<h3>traceroute: kahan ruka?</h3>
<p>Traceroute TTL 1, 2, 3 waghairah ke probes bhejta hai. Jo router TTL zero karta hai woh probe drop karke jis interface se probe aaya tha wahin se ICMP time exceeded lautata hai, isliye har line agle router ka <b>ingress address</b> dikhati hai. Destination port unreachable se jawab deta hai aur trace khatam.</p>
<pre class="out">lab@R1-SURAT&gt; traceroute 10.4.4.10
traceroute to 10.4.4.10 (10.4.4.10), 30 hops max, 40 byte packets
 1  10.0.12.2 (10.0.12.2)  0.812 ms  0.601 ms  0.588 ms
 2  10.0.23.2 (10.0.23.2)  1.104 ms  0.904 ms  0.896 ms
 3  <span class="hl">10.0.23.2 (10.0.23.2)  1.044 ms !H  0.905 ms !H  0.871 ms !H</span>
</pre>
<ul>
<li><code>!H</code> ya <code>!N</code>: router ne host ya network unreachable bheja. Us router ke paas aage ka <b>route nahi</b> hai. Fault aakhri print hue address par hai.</li>
<li><code>* * *</code>: jawab nahi. Sambhav kaaran: filter, missing return route, ya aisa device jo probes ka reply nahi deta.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Aakhri jawab dene wale router ko doshi maan lena, jabki asli fault missing <b>return</b> route hota hai. Ping ko dono taraf routes chahiye. Alag address se test karne ke liye <code>source</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Duplex mismatch mein har side par alag counters aate hain. Jis sawaal mein ek end par late collisions aur doosre par CRC errors hon, uska jawab "duplex mismatch" hai, "bad cable" nahi.</p></div>

<div class="scn"><h4>Chaar hops, ek missing route</h4><p>Surat network mein R3 badalne ke baad ERP server dark ho gaya. R1 se traceroute ne R2, phir 10.0.23.2, phir <code>!H</code> ke saath dobara 10.0.23.2 dikhaya. 10.0.23.2 R3 ka ingress interface hai, yaani server LAN 10.4.4.0/24 ka route R3 ke paas nahi tha. Naya router us static route ke bina bana tha. Ek line se fix hua aur trace ne server samet chaar hops dikhaye.</p><p><b>Lesson:</b> traceroute "chal nahi raha" ko "is router ke paas route nahi" mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Traceroute kaise kaam karta hai, aur !H ka kya matlab hai?"</p><p>Yeh TTL 1 se badhata hai; jo router TTL expire karta hai woh ICMP time exceeded se apna ingress address batata hai; destination port unreachable se jawab deta hai. !H ka matlab router ne host unreachable bheja, yaani uske paas aage ka route nahi, aur aap us router ki routing table dekhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show interfaces extensive speed, link-mode aur error counters dikhata hai.</li>
<li>Duplex mismatch: full side par CRC, framing, runts; half side par collisions.</li>
<li>Dono ends se manual speed aur link-mode hatao, phir clear interfaces statistics all karke dobara dekho.</li>
<li>ping count n rapid se loss turant dikhta hai; source return path test karta hai.</li>
<li>traceroute ingress addresses dikhata hai; !H route-less router ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};