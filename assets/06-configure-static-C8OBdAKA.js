var e={id:`configure-static`,h:{en:`Configuring static routes: three forms and return-path thinking`,hi:`Static routes configure karna: teen forms aur return-path thinking`},body:{en:`
<p>Giving directions to a delivery driver can be done three ways. "Hand it to Ravi at the next junction" (a next hop). "Take the east road" (an exit interface). Or the most precise: "Take the east road and hand it to Ravi" (both). IOS static routes offer exactly these three forms. In this chapter you configure all three on the first lab, and you learn the habit that separates good engineers from frustrated ones: always think about the way back.</p>

<h3>The command</h3>
<pre class="code"><span class="c">! global configuration mode</span>
ip route <i>prefix</i> <i>mask</i> { <i>next-hop-ip</i> | <i>exit-interface</i> [<i>next-hop-ip</i>] } [<i>distance</i>] [name <i>text</i>] [permanent]</pre>
<dl class="terms">
<dt>prefix and mask</dt><dd>The destination network, written with a dotted-decimal mask (not /24). The prefix must be the network address for that mask.</dd>
<dt>next-hop-ip</dt><dd>The neighbour's address, normally on a directly connected subnet.</dd>
<dt>exit-interface</dt><dd>The local interface to send out of.</dd>
<dt>distance</dt><dd>Optional AD from 1 to 255, default 1. Used for floating routes (chapter 9).</dd>
<dt>name</dt><dd>Optional free-text label shown in the configuration and in <code>show ip static route</code>. Great for change tickets.</dd>
<dt>permanent</dt><dd>Keeps the route in the table even if the interface goes down. Rarely a good idea, because it blackholes traffic instead of letting a backup take over.</dd>
</dl>

<h3>The lab, router by router</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three static route styles on R1 R2 R3">
<rect x="20" y="30" width="160" height="56" rx="8" fill="#bae6fd"/><text x="100" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="100" y="74" text-anchor="middle" class="svg-muted" font-size="12">next hop 10.12.12.2</text>
<rect x="240" y="30" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">exit Gi0/1 (to B)</text>
<rect x="460" y="30" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="54" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 + 10.23.23.1</text>
<line x1="180" y1="58" x2="240" y2="58" stroke="#64748b" stroke-width="2"/><line x1="400" y1="58" x2="460" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="210" y="110" text-anchor="middle" class="svg-accent" font-size="12">.1  10.12.12.0/30  .2</text>
<text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">.1  10.23.23.0/30  .2</text>
<text x="100" y="150" text-anchor="middle" class="svg-ink" font-size="12">Studio-A 172.16.1.0/24</text>
<text x="540" y="150" text-anchor="middle" class="svg-ink" font-size="12">Studio-B 172.16.3.0/24</text>
<line x1="60" y1="175" x2="580" y2="175" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">forward path PC1 to PC2</text>
<line x1="580" y1="210" x2="60" y2="210" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">return path needs its own routes</text>
</svg><p class="cap">Each router in the lab uses a different static route style, and every router needs routes in both directions.</p></div>

<pre class="code"><span class="c">! R1: next-hop route to Studio-B</span>
R1(config)# ip route 172.16.3.0 255.255.255.0 10.12.12.2
<span class="c">! R2: next hop back to Studio-A, exit interface toward Studio-B</span>
R2(config)# ip route 172.16.1.0 255.255.255.0 10.12.12.1
R2(config)# ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1
<span class="c">! R3: fully specified return route to Studio-A</span>
R3(config)# ip route 172.16.1.0 255.255.255.0 GigabitEthernet0/1 10.23.23.1</pre>

<p>How each one looks in the table:</p>
<pre class="out">R1#show ip route static
S        172.16.3.0/24 [1/0] via 10.12.12.2

R2#show ip route static
S        172.16.1.0/24 [1/0] via 10.12.12.1
<span class="hl">S        172.16.3.0/24 is directly connected, GigabitEthernet0/1</span>

R3#show ip route static
S        172.16.1.0/24 [1/0] via 10.23.23.1, GigabitEthernet0/1</pre>
<p>Notice the exit-interface route on R2 prints "is directly connected" even though it is a static route with AD 1. It is <b>not</b> a connected route; it only looks like one. Chapter 7 explains why this form causes trouble on Ethernet.</p>

<h3>When does a static route get installed?</h3>
<ul>
<li><b>Next-hop form</b>: the next hop must resolve through another route in the table (normally a connected subnet). If 10.12.12.2 is unreachable, the static stays in the configuration but not in the table.</li>
<li><b>Exit-interface form</b>: the interface must be up/up.</li>
<li><b>Fully specified</b>: the interface must be up/up (and the next hop is then used for ARP on that interface).</li>
</ul>

<h3>Return-path thinking</h3>
<p>Every conversation is two one-way trips. For PC1 to ping PC2, the echo request needs routes on R1 and R2 toward 172.16.3.0/24, and the echo reply needs routes on R3 and R2 toward 172.16.1.0/24. Draw both arrows on paper before you configure anything.</p>
<p>A subtle version: when a <b>router</b> pings or traces, it uses the address of its exit interface as the source. R1 pinging R3's 10.23.23.2 sends from 10.12.12.1. R1 needs a route to 10.23.23.0/30, and R3 needs a route back to 10.12.12.0/30, a transit subnet that users never think about. That is lab task 4:</p>
<pre class="code">R1(config)# ip route 10.23.23.0 255.255.255.252 10.12.12.2
R3(config)# ip route 10.12.12.0 255.255.255.252 10.23.23.1</pre>
<p>Alternatively, test from a user-subnet source with <code>ping 10.23.23.2 source 172.16.1.1</code>, which only needs the LAN routes.</p>

<div class="eg"><p><b>Worked example.</b> Before task 3, PC1 pings PC2. R1 and R2 forward the request fine; PC2 replies to 172.16.1.10; R3 has no route for 172.16.1.0/24 and drops the reply. PC1 sees plain timeouts (<code>*</code> or "Request timed out"), not "unreachable", because the ICMP unreachable is sent by R3 toward 172.16.1.10, which it cannot route either. Timeouts with a working forward path are the classic signature of a missing return route.</p></div>

<pre class="out">PC1&gt; trace 172.16.3.10
trace to 172.16.3.10, 8 hops max, press Ctrl+C to stop
 1   172.16.1.1   0.512 ms  0.401 ms  0.389 ms
 2   10.12.12.2   1.021 ms  0.877 ms  0.902 ms
 3   10.23.23.2   1.410 ms  1.325 ms  1.298 ms
<span class="hl"> 4   *172.16.3.10   1.702 ms (ICMP type:3, code:3, Destination port unreachable)</span></pre>

<div class="warn"><p><b>Common mistake.</b> Writing the prefix with host bits set, for example <code>ip route 172.16.3.10 255.255.255.0 10.12.12.2</code>. IOS silently corrects it to 172.16.3.0, but on other platforms or in exams this is marked wrong. Another: using a /24 in slash notation. IOS static routes need the dotted mask.</p></div>

<div class="exam"><p><b>Exam trap.</b> The next hop is the address of the <b>neighbour's</b> interface, never the router's own interface and never the far-end destination. In a drag-and-drop, 10.12.12.1 is wrong for R1's route (it is R1's own address).</p></div>

<div class="scn"><h4>The printer move that forgot the way back</h4><p>A branch printer server was moved to a new subnet 172.20.40.0/24 at HQ. The HQ core got the new connected SVI, and the branch router already had a default route to HQ, so the team declared it done. Branch users timed out. The engineer traced from a branch PC: the trace showed the branch router and the HQ WAN router, then only asterisks from the hop where the core should have answered. The route back to the branch had only ever been configured on the old distribution router that hosted the previous print subnet; the core, which now hosted the new SVI, had no route to the branch subnet at all and dropped every reply. A single return static on the core fixed it.</p><p><b>Lesson:</b> a new subnet needs routes in both directions; test with a trace from the real source.</p></div>

<div class="iv"><p class="q">"What are the three ways to configure an IPv4 static route and when would you use each?"</p><p>Strong answer: next hop only, which needs a recursive lookup and is the common form; exit interface only, which is fine on point-to-point serial links but on Ethernet makes the router ARP for every destination; and fully specified, interface plus next hop, which is the best practice on multi-access links. Mention install conditions and that every route needs a matching return route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip route prefix mask {next-hop | interface [next-hop]} [AD] [name] [permanent]</code>.</li>
<li>Next-hop routes show "via x.x.x.x"; exit-interface routes show "is directly connected" but keep AD 1.</li>
<li>A static is installed only when its next hop resolves or its interface is up/up.</li>
<li>Every path needs a return path; transit subnets matter when routers source pings.</li>
<li>Timeouts with a good forward trace point to a missing return route.</li>
</ul></div>
`,hi:`
<p>Delivery driver ko raasta teen tarike se bataya ja sakta hai. "Agle junction par Ravi ko de dena" (next hop). "East wali sadak le lo" (exit interface). Ya sabse precise: "East wali sadak lo aur Ravi ko de do" (dono). IOS static routes exactly yahi teen forms dete hain. Is chapter mein aap pehle lab par teeno configure karoge, aur woh aadat seekhoge jo achhe engineers ko pareshaan engineers se alag karti hai: hamesha wapas aane ke raaste ke baare mein socho.</p>

<h3>Command</h3>
<pre class="code"><span class="c">! global configuration mode</span>
ip route <i>prefix</i> <i>mask</i> { <i>next-hop-ip</i> | <i>exit-interface</i> [<i>next-hop-ip</i>] } [<i>distance</i>] [name <i>text</i>] [permanent]</pre>
<dl class="terms">
<dt>prefix aur mask</dt><dd>Destination network, dotted-decimal mask ke saath likha (/24 nahi). Prefix us mask ke liye network address hona chahiye.</dd>
<dt>next-hop-ip</dt><dd>Padosi ka address, normally directly connected subnet par.</dd>
<dt>exit-interface</dt><dd>Woh local interface jisse bahar bhejna hai.</dd>
<dt>distance</dt><dd>Optional AD 1 se 255, default 1. Floating routes ke liye use hoti hai (chapter 9).</dd>
<dt>name</dt><dd>Optional free-text label jo configuration aur <code>show ip static route</code> mein dikhta hai. Change tickets ke liye bahut kaam ka.</dd>
<dt>permanent</dt><dd>Interface down hone par bhi route table mein rakhta hai. Aam taur par achha idea nahi, kyunki backup ko kaam karne dene ki jagah traffic blackhole karta hai.</dd>
</dl>

<h3>Lab, router by router</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="R1 R2 R3 par teen static route styles">
<rect x="20" y="30" width="160" height="56" rx="8" fill="#bae6fd"/><text x="100" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="100" y="74" text-anchor="middle" class="svg-muted" font-size="12">next hop 10.12.12.2</text>
<rect x="240" y="30" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">exit Gi0/1 (B ki taraf)</text>
<rect x="460" y="30" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="54" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 + 10.23.23.1</text>
<line x1="180" y1="58" x2="240" y2="58" stroke="#64748b" stroke-width="2"/><line x1="400" y1="58" x2="460" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="210" y="110" text-anchor="middle" class="svg-accent" font-size="12">.1  10.12.12.0/30  .2</text>
<text x="430" y="110" text-anchor="middle" class="svg-accent" font-size="12">.1  10.23.23.0/30  .2</text>
<text x="100" y="150" text-anchor="middle" class="svg-ink" font-size="12">Studio-A 172.16.1.0/24</text>
<text x="540" y="150" text-anchor="middle" class="svg-ink" font-size="12">Studio-B 172.16.3.0/24</text>
<line x1="60" y1="175" x2="580" y2="175" stroke="#64748b" stroke-width="2"/><text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">forward path PC1 se PC2</text>
<line x1="580" y1="210" x2="60" y2="210" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="226" text-anchor="middle" class="svg-muted" font-size="12">return path ko apne routes chahiye</text>
</svg><p class="cap">Lab ka har router alag static route style use karta hai, aur har router ko dono directions mein routes chahiye.</p></div>

<pre class="code"><span class="c">! R1: Studio-B ke liye next-hop route</span>
R1(config)# ip route 172.16.3.0 255.255.255.0 10.12.12.2
<span class="c">! R2: Studio-A ke liye next hop, Studio-B ki taraf exit interface</span>
R2(config)# ip route 172.16.1.0 255.255.255.0 10.12.12.1
R2(config)# ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1
<span class="c">! R3: Studio-A ke liye fully specified return route</span>
R3(config)# ip route 172.16.1.0 255.255.255.0 GigabitEthernet0/1 10.23.23.1</pre>

<p>Har ek table mein kaisa dikhta hai:</p>
<pre class="out">R1#show ip route static
S        172.16.3.0/24 [1/0] via 10.12.12.2

R2#show ip route static
S        172.16.1.0/24 [1/0] via 10.12.12.1
<span class="hl">S        172.16.3.0/24 is directly connected, GigabitEthernet0/1</span>

R3#show ip route static
S        172.16.1.0/24 [1/0] via 10.23.23.1, GigabitEthernet0/1</pre>
<p>Dhyan do, R2 ka exit-interface route "is directly connected" print karta hai, jabki yeh AD 1 wala static route hai. Yeh connected route <b>nahi</b> hai; bas waisa dikhta hai. Chapter 7 samjhata hai ki yeh form Ethernet par problem kyun karta hai.</p>

<h3>Static route kab install hota hai?</h3>
<ul>
<li><b>Next-hop form</b>: next hop table ke kisi doosre route (normally connected subnet) se resolve hona chahiye. Agar 10.12.12.2 unreachable hai, static configuration mein rehta hai par table mein nahi.</li>
<li><b>Exit-interface form</b>: interface up/up hona chahiye.</li>
<li><b>Fully specified</b>: interface up/up hona chahiye (aur next hop phir us interface par ARP ke liye use hota hai).</li>
</ul>

<h3>Return-path thinking</h3>
<p>Har conversation do one-way trips hai. PC1 ke PC2 ko ping karne ke liye echo request ko R1 aur R2 par 172.16.3.0/24 ki taraf routes chahiye, aur echo reply ko R3 aur R2 par 172.16.1.0/24 ki taraf routes chahiye. Kuch bhi configure karne se pehle kagaz par dono arrows banao.</p>
<p>Ek subtle version: jab <b>router</b> ping ya trace karta hai, to woh source ke roop mein apne exit interface ka address use karta hai. R1 jab R3 ka 10.23.23.2 ping karta hai, to 10.12.12.1 se bhejta hai. R1 ko 10.23.23.0/30 ka route chahiye, aur R3 ko 10.12.12.0/30 ka wapas route chahiye, ek transit subnet jiske baare mein users kabhi nahi sochte. Yahi lab task 4 hai:</p>
<pre class="code">R1(config)# ip route 10.23.23.0 255.255.255.252 10.12.12.2
R3(config)# ip route 10.12.12.0 255.255.255.252 10.23.23.1</pre>
<p>Doosra tarika, user-subnet source se test karo: <code>ping 10.23.23.2 source 172.16.1.1</code>, jise sirf LAN routes chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Task 3 se pehle PC1 PC2 ko ping karta hai. R1 aur R2 request theek forward karte hain; PC2 172.16.1.10 ko reply karta hai; R3 ke paas 172.16.1.0/24 ka route nahi hai aur woh reply drop kar deta hai. PC1 ko simple timeouts dikhte hain (<code>*</code> ya "Request timed out"), "unreachable" nahi, kyunki ICMP unreachable R3 172.16.1.10 ki taraf bhejta hai, jise woh bhi route nahi kar sakta. Kaam karte forward path ke saath timeouts missing return route ki classic pehchaan hai.</p></div>

<pre class="out">PC1&gt; trace 172.16.3.10
trace to 172.16.3.10, 8 hops max, press Ctrl+C to stop
 1   172.16.1.1   0.512 ms  0.401 ms  0.389 ms
 2   10.12.12.2   1.021 ms  0.877 ms  0.902 ms
 3   10.23.23.2   1.410 ms  1.325 ms  1.298 ms
<span class="hl"> 4   *172.16.3.10   1.702 ms (ICMP type:3, code:3, Destination port unreachable)</span></pre>

<div class="warn"><p><b>Common galti.</b> Prefix host bits ke saath likhna, jaise <code>ip route 172.16.3.10 255.255.255.0 10.12.12.2</code>. IOS chupchaap ise 172.16.3.0 kar deta hai, lekin doosre platforms par ya exams mein yeh galat mana jaata hai. Ek aur: slash notation mein /24 likhna. IOS static routes ko dotted mask chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Next hop <b>padosi ke</b> interface ka address hota hai, kabhi router ka apna interface nahi aur kabhi door ka destination nahi. Drag-and-drop mein R1 ke route ke liye 10.12.12.1 galat hai (woh R1 ka apna address hai).</p></div>

<div class="scn"><h4>Printer move jo wapas ka raasta bhool gaya</h4><p>Ek branch ka printer server HQ par naye subnet 172.20.40.0/24 mein move hua. HQ core ko naya connected SVI mila, aur branch router par pehle se HQ ki taraf default route tha, isliye team ne kaam khatam declare kar diya. Branch users ko timeouts aaye. Engineer ne branch PC se trace kiya: trace mein branch router aur HQ WAN router dikhe, phir us hop se sirf asterisks jahan core ko jawab dena chahiye tha. Branch ka wapas route sirf us purane distribution router par configure tha jahan pichla print subnet tha; core, jahan ab naya SVI tha, ke paas branch subnet ka koi route hi nahi tha aur woh har reply drop kar raha tha. Core par ek return static ne fix kiya.</p><p><b>Seekh:</b> naye subnet ko dono directions mein routes chahiye; asli source se trace karke test karo.</p></div>

<div class="iv"><p class="q">"IPv4 static route configure karne ke teen tarike kya hain aur har ek kab use karoge?"</p><p>Strong answer: sirf next hop, jise recursive lookup chahiye aur yeh common form hai; sirf exit interface, jo point-to-point serial links par theek hai lekin Ethernet par router ko har destination ke liye ARP karwata hai; aur fully specified, interface plus next hop, jo multi-access links par best practice hai. Install conditions batao aur yeh ki har route ko matching return route chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip route prefix mask {next-hop | interface [next-hop]} [AD] [name] [permanent]</code>.</li>
<li>Next-hop routes "via x.x.x.x" dikhate hain; exit-interface routes "is directly connected" dikhate hain par AD 1 rehti hai.</li>
<li>Static tabhi install hota hai jab uska next hop resolve ho ya interface up/up ho.</li>
<li>Har path ko return path chahiye; jab routers pings source karte hain to transit subnets matter karte hain.</li>
<li>Achhe forward trace ke saath timeouts missing return route ki taraf ishara karte hain.</li>
</ul></div>
`}};export{e as default};