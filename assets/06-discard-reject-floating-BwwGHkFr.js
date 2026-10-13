var e={id:`discard-reject-floating`,h:{en:`Discard, reject and floating static routes`,hi:`Discard, reject aur floating static routes`},body:{en:`
<p>A next hop is not the only thing a static route can do. Junos lets a route <b>drop</b> traffic on purpose, and lets a route act as a <b>backup</b> that wakes up only when the primary fails. These two tricks appear in the Nagpur and Surat labs and are favourites on the exam.</p>

<h3>Discard and reject: the black hole</h3>
<p>Sometimes you want packets for a block of addresses to go nowhere. Examples: address space you own but have not deployed yet, a summary route that would otherwise leak traffic towards the internet, or a way to stop a loop. Junos has two actions instead of a next hop.</p>
<table class="cmp"><tr><th>Action</th><th>What the router does</th><th>Sender sees</th></tr>
<tr><td><code>discard</code></td><td>Drops the packet silently</td><td>Timeout</td></tr>
<tr><td><code>reject</code></td><td>Drops the packet and returns ICMP destination unreachable</td><td>Immediate "unreachable"</td></tr></table>
<pre class="code">set routing-options static route 192.168.0.0/16 discard
set routing-options static route 10.200.0.0/16 reject</pre>
<pre class="out">lab@R2-CORE&gt; show route 192.168.0.0/16 longer

inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">192.168.0.0/16     *[Static/5] 00:00:31
                      Discard</span>
192.168.10.0/24    *[Static/5] 00:12:55
                    &gt;  to 10.1.12.1 via ge-0/0/0.0
</pre>
<p>Because of longest match, the black hole is safe next to real routes. In the Nagpur lab R2 has the /16 discard for future branches and the /24 for the real Nagpur LAN. The LAN still works, and only addresses that match nothing more specific are dropped.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Discard route beside a specific route">
<rect x="10" y="10" width="620" height="130" rx="12" fill="#fed7aa"/><text x="25" y="32" class="svg-ink" font-size="13">192.168.0.0/16 discard: dropped</text>
<rect x="60" y="50" width="330" height="80" rx="12" fill="#bbf7d0"/><text x="75" y="72" class="svg-ink" font-size="13">192.168.10.0/24 via R1: forwarded</text>
<text x="75" y="100" class="svg-muted" font-size="12">PC1 192.168.10.10 lands here</text>
<text x="420" y="100" class="svg-muted" font-size="12">192.168.77.5 lands in the outer box</text>
</svg><p class="cap">The more specific route carves a hole in the black hole.</p></div>

<h3>Floating static routes: a backup that waits</h3>
<p>A <b>floating static route</b> is a static route with a higher preference than the primary, so it stays inactive until the primary disappears. When the active route is withdrawn (for example the interface goes down), the inactive one becomes active automatically. No protocol is needed, only preference.</p>
<p>In Junos you can set a different preference per next hop with <code>qualified-next-hop</code>:</p>
<pre class="code">set routing-options static route 172.16.40.0/24 next-hop 10.2.13.2
set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20</pre>
<p>The first line is the normal primary via the fibre at preference 5. The second is the backup via R2 at preference 20. Written in hierarchy form it is easier to read:</p>
<pre class="code">route 172.16.40.0/24 {
    next-hop 10.2.13.2;                          <span class="c">! primary, preference 5</span>
    qualified-next-hop 10.2.12.2 {
        preference 20;                           <span class="c">! floating backup</span>
    }
}</pre>
<p>You can also add a second route with its own <code>preference</code> value, as in the Kochi lab. A plain <code>next-hop</code> list on one route is different: it gives equal-cost <b>load balancing</b>, not backup.</p>

<h3>The Surat lab, step by step</h3>
<p>R1 reaches the payroll LAN 172.16.40.0/24 over the fibre (10.2.13.2) with a backup via R2 (10.2.12.2). The route in normal operation:</p>
<pre class="out">lab@R1-SURAT&gt; show route 172.16.40.0/24

inet.0: 10 destinations, 11 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.40.0/24     <span class="hl">*[Static/5]</span> 00:04:10
                    &gt;  to 10.2.13.2 via ge-0/0/0.0
                    [Static/20] 00:04:10
                    &gt;  to 10.2.12.2 via ge-0/0/1.0
</pre>
<p>Now you simulate the fibre cut with <code>set interfaces ge-0/0/0 disable</code> and commit. The next hop 10.2.13.2 is no longer reachable, so its route is withdrawn and the backup takes over:</p>
<pre class="out">lab@R1-SURAT&gt; show route 172.16.40.0/24
172.16.40.0/24     <span class="hl">*[Static/20]</span> 00:00:07
                    &gt;  to 10.2.12.2 via ge-0/0/1.0

lab@R1-SURAT&gt; traceroute 172.16.40.10
 1  10.2.12.2 (10.2.12.2)  0.9 ms  0.7 ms  0.7 ms
 2  10.2.23.2 (10.2.23.2)  1.3 ms  1.1 ms  1.0 ms
 3  172.16.40.10 (172.16.40.10)  1.8 ms  1.6 ms  1.5 ms
</pre>
<p>The return path matters too. In the lab R3 already has a floating route back to 192.168.20.0/24 (<code>qualified-next-hop 10.2.23.1 preference 20</code>), so replies find their way back through R2 as well. A one-sided backup would let the ping leave and never return.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>discard</code> on a prefix that is too broad, such as 0.0.0.0/0, which silences the whole router. Another mistake is a floating route with the same preference as the primary: then both are equal and the router load-balances instead of waiting.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discard is silent; reject sends ICMP unreachable. Floating static = higher preference. Qualified-next-hop lets one route have next hops with different preferences. A floating route with preference above 10 stays below OSPF; one below 10 would override OSPF.</p></div>

<div class="scn"><h4>The fibre that failed at 2 a.m.</h4><p>A bank branch had a fibre to head office and a slower microwave link as backup, set up as a floating static route. At 2 a.m. a contractor cut the fibre. The microwave route took over within seconds without anyone logging in, and the night batch jobs still completed, a bit slower. In the morning, the monitoring system showed the route had changed to Static/20, and the fibre was repaired by noon. Nobody had to wake up.</p><p><b>Lesson:</b> a floating static route is the cheapest automatic backup you can build, as long as it exists in both directions.</p></div>

<div class="iv"><p class="q">"What is a floating static route and how do you configure one in Junos?"</p><p>A static route with a higher preference than the primary, so it is inactive until the primary route is withdrawn. Configure it with a second route or with qualified-next-hop and a preference such as 20 (primary stays at the default 5). Verify with show route: the primary has the asterisk, the backup is listed below. Mention testing by disabling the primary interface, and configuring the return path too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>discard drops silently; reject drops and sends ICMP unreachable.</li>
<li>Longest match lets a /24 live safely inside a /16 black hole.</li>
<li>A floating static has a higher preference than the primary and wakes up when it disappears.</li>
<li>qualified-next-hop gives each next hop of a route its own preference.</li>
<li>Test a backup by failing the primary, and configure the return path too.</li>
</ul></div>
`,hi:`
<p>Static route ka kaam sirf next hop dena nahi hai. Junos route ko jaan boojh kar traffic <b>drop</b> karne deta hai, aur route ko aisa <b>backup</b> banane deta hai jo tabhi jaagta hai jab primary fail ho. Yeh do tricks Nagpur aur Surat labs mein hain aur exam ke favourites hain.</p>

<h3>Discard aur reject: black hole</h3>
<p>Kabhi aap chahte ho ki addresses ke ek block ke packets kahin na jaayein. Jaise aisa address space jo aapka hai lekin abhi deploy nahi hua, ek summary route jo warna traffic ko internet ki taraf leak karta, ya loop rokne ka tarika. Junos next hop ki jagah do actions deta hai.</p>
<table class="cmp"><tr><th>Action</th><th>Router kya karta hai</th><th>Sender ko kya dikhta hai</th></tr>
<tr><td><code>discard</code></td><td>Packet chupchaap drop karta hai</td><td>Timeout</td></tr>
<tr><td><code>reject</code></td><td>Packet drop karta hai aur ICMP destination unreachable lautata hai</td><td>Turant "unreachable"</td></tr></table>
<pre class="code">set routing-options static route 192.168.0.0/16 discard
set routing-options static route 10.200.0.0/16 reject</pre>
<pre class="out">lab@R2-CORE&gt; show route 192.168.0.0/16 longer

inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">192.168.0.0/16     *[Static/5] 00:00:31
                      Discard</span>
192.168.10.0/24    *[Static/5] 00:12:55
                    &gt;  to 10.1.12.1 via ge-0/0/0.0
</pre>
<p>Longest match ki wajah se black hole asli routes ke saath safe hai. Nagpur lab mein R2 ke paas aane wali branches ke liye /16 discard hai aur asli Nagpur LAN ke liye /24. LAN chalta rehta hai, aur sirf woh addresses drop hote hain jo kisi zyada specific route se match nahi karte.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Discard route beside a specific route">
<rect x="10" y="10" width="620" height="130" rx="12" fill="#fed7aa"/><text x="25" y="32" class="svg-ink" font-size="13">192.168.0.0/16 discard: drop hota hai</text>
<rect x="60" y="50" width="330" height="80" rx="12" fill="#bbf7d0"/><text x="75" y="72" class="svg-ink" font-size="13">192.168.10.0/24 via R1: forward hota hai</text>
<text x="75" y="100" class="svg-muted" font-size="12">PC1 192.168.10.10 yahan aata hai</text>
<text x="420" y="100" class="svg-muted" font-size="12">192.168.77.5 bahar ke dibbe mein</text>
</svg><p class="cap">Zyada specific route black hole mein ek surakh bana deta hai.</p></div>

<h3>Floating static routes: intezaar karta backup</h3>
<p><b>Floating static route</b> woh static route hai jiski preference primary se zyada hoti hai, isliye woh primary ke gayab hone tak inactive rehta hai. Active route hat jaye (jaise interface down ho) to inactive wala automatically active ho jaata hai. Protocol ki zaroorat nahi, sirf preference.</p>
<p>Junos mein <code>qualified-next-hop</code> se har next hop ki alag preference set kar sakte ho:</p>
<pre class="code">set routing-options static route 172.16.40.0/24 next-hop 10.2.13.2
set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20</pre>
<p>Pehli line fibre ke through normal primary hai, preference 5. Doosri R2 ke through backup hai, preference 20. Hierarchy form mein padhna aasaan hai:</p>
<pre class="code">route 172.16.40.0/24 {
    next-hop 10.2.13.2;                          <span class="c">! primary, preference 5</span>
    qualified-next-hop 10.2.12.2 {
        preference 20;                           <span class="c">! floating backup</span>
    }
}</pre>
<p>Kochi lab ki tarah apni <code>preference</code> value wala doosra route bhi jod sakte ho. Ek route par plain <code>next-hop</code> list alag cheez hai: woh equal-cost <b>load balancing</b> deti hai, backup nahi.</p>

<h3>Surat lab, step by step</h3>
<p>R1 payroll LAN 172.16.40.0/24 tak fibre (10.2.13.2) se pahunchta hai aur R2 (10.2.12.2) ke through backup hai. Normal operation mein route:</p>
<pre class="out">lab@R1-SURAT&gt; show route 172.16.40.0/24

inet.0: 10 destinations, 11 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.40.0/24     <span class="hl">*[Static/5]</span> 00:04:10
                    &gt;  to 10.2.13.2 via ge-0/0/0.0
                    [Static/20] 00:04:10
                    &gt;  to 10.2.12.2 via ge-0/0/1.0
</pre>
<p>Ab <code>set interfaces ge-0/0/0 disable</code> aur commit se fibre cut simulate karo. Next hop 10.2.13.2 ab reachable nahi, isliye uska route withdraw hota hai aur backup le leta hai:</p>
<pre class="out">lab@R1-SURAT&gt; show route 172.16.40.0/24
172.16.40.0/24     <span class="hl">*[Static/20]</span> 00:00:07
                    &gt;  to 10.2.12.2 via ge-0/0/1.0

lab@R1-SURAT&gt; traceroute 172.16.40.10
 1  10.2.12.2 (10.2.12.2)  0.9 ms  0.7 ms  0.7 ms
 2  10.2.23.2 (10.2.23.2)  1.3 ms  1.1 ms  1.0 ms
 3  172.16.40.10 (172.16.40.10)  1.8 ms  1.6 ms  1.5 ms
</pre>
<p>Return path bhi matter karta hai. Lab mein R3 ke paas 192.168.20.0/24 ka floating route pehle se hai (<code>qualified-next-hop 10.2.23.1 preference 20</code>), isliye replies bhi R2 ke through wapas aate hain. Ek taraf ka backup ping ko jaane dega aur wapas aane nahi dega.</p>

<div class="warn"><p><b>Common mistake.</b> Bahut broad prefix par <code>discard</code> lagana, jaise 0.0.0.0/0, jo poore router ko chup kara deta hai. Ek aur galti: floating route ki preference primary jitni rakhna: tab dono barabar hote hain aur router intezaar ki jagah load-balance karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Discard chup hai; reject ICMP unreachable bhejta hai. Floating static = zyada preference. Qualified-next-hop ek route ke next hops ko alag preferences deta hai. 10 se upar preference wala floating route OSPF ke neeche rehta hai; 10 se neeche wala OSPF ko override kar deta.</p></div>

<div class="scn"><h4>Jo fibre raat 2 baje fail hui</h4><p>Ek bank branch ke paas head office tak fibre thi aur backup ke liye floating static route wala slow microwave link. Raat 2 baje contractor ne fibre kaat di. Microwave route kuch seconds mein bina login ke le gaya, aur raat ke batch jobs thoda slow lekin poore hue. Subah monitoring ne dikhaya route Static/20 ho gaya tha, aur fibre dopahar tak theek hui. Kisi ko uthna nahi pada.</p><p><b>Lesson:</b> floating static route sabse sasta automatic backup hai, bas dono directions mein maujood ho.</p></div>

<div class="iv"><p class="q">"Floating static route kya hai aur Junos mein kaise configure karte hain?"</p><p>Primary se zyada preference wala static route, jo primary route withdraw hone tak inactive rehta hai. Doosre route ya qualified-next-hop aur 20 jaisi preference se configure karo (primary default 5 par rehta hai). show route se verify karo: primary par asterisk hai, backup neeche list hai. Batao ki primary interface disable karke test karte ho, aur return path bhi configure karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>discard chupchaap drop karta hai; reject drop karke ICMP unreachable bhejta hai.</li>
<li>Longest match /24 ko /16 black hole ke andar safe rehne deta hai.</li>
<li>Floating static ki preference primary se zyada hoti hai aur woh primary ke jaane par jaagta hai.</li>
<li>qualified-next-hop route ke har next hop ko apni preference deta hai.</li>
<li>Backup ko primary fail karke test karo, aur return path bhi configure karo.</li>
</ul></div>
`}};export{e as default};