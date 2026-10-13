var e={id:`authentication-overload-timers`,h:{en:`Authentication, the overload bit and timers`,hi:`Authentication, overload bit aur timers`},body:{en:`
<p>A routing protocol must trust its neighbours. IS-IS has no IP addresses on its packets, so a router on the same link can inject LSPs just by speaking CLNS. Authentication is the lock on the door. This chapter also covers two operational tools: the <b>overload bit</b>, to take a router out of transit paths for maintenance, and the <b>timers</b> that control how quickly failures are noticed.</p>

<h3>Authentication: three places</h3>
<table class="cmp"><tr><th>Type</th><th>Protects</th><th>Configured under</th></tr>
<tr><td>Hello authentication</td><td>IIH PDUs, so only trusted routers form adjacencies</td><td>interface, per level</td></tr>
<tr><td>LSP authentication</td><td>LSPs, CSNPs and PSNPs of a level</td><td>level (global)</td></tr>
<tr><td>Both</td><td>Neighbour trust and database trust</td><td>combine the two</td></tr></table>
<p>Methods are <b>simple</b> (clear text, only for lab work), <b>md5</b> and the newer hmac-md5 style keys. The key is case sensitive, and the type must match on both ends. A mismatch in either gives the same visible result: the hello is dropped and the adjacency never appears.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Hello authentication mismatch">
<rect x="60" y="50" width="130" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="125" y="75" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="125" y="95" text-anchor="middle" class="svg-muted" font-size="11">key Pune-L2</text>
<rect x="450" y="50" width="130" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="515" y="75" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="515" y="95" text-anchor="middle" class="svg-muted" font-size="11">key pune-l2</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="65" text-anchor="middle" class="svg-accent" font-size="12">IIH with MD5 digest</text>
<text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">digest does not match, hello dropped</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Result: no adjacency, nothing in show isis adjacency</text>
</svg><p class="cap">Case matters: Pune-L2 and pune-l2 are different keys.</p></div>
<p>In the Pune lab, R3 holds a level 2 hello key. The key and type are what a router stores. Real Junos hides the key text in a saved configuration, and the simulator marks it as secret data:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key Pune-L2
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-type md5</pre>
<pre class="out">lab@R3&gt; show configuration protocols isis
interface ge-0/0/0.0 {
    point-to-point;
    level 2 {
        hello-authentication-key <span class="hl">pune-l2</span>; ## SECRET-DATA
        hello-authentication-type md5;
    }
}
lab@R3&gt; show isis adjacency
(no output, no neighbours)</pre>
<p>R3 has an adjacency count of zero. Because the key is hidden in the display of a real router, you cannot compare keys by looking. You re-enter the key on one side (<code>Pune-L2</code>, as the neighbour's engineer confirmed) and commit. In this lab R2 also had other faults, so authentication was one of several; fix one problem at a time and recheck.</p>
<p>For LSP authentication, set it for the level: <code>set protocols isis level 2 authentication-key SomeKey</code> with <code>authentication-type md5</code>. Here a mismatch can be subtler: adjacencies form, but LSPs are discarded and the database stays empty.</p>

<h3>The overload bit</h3>
<p>Setting the <b>overload bit</b> in a router's LSP tells every other router: "do not use me as a transit hop; my own prefixes are still fine". It is the IS-IS equivalent of "max-metric" in OSPF. Use it before maintenance, or on boot, until the routing table is full. Configure it with <code>set protocols isis overload</code>. After a reboot you can use <code>overload timeout 300</code> so the bit clears itself.</p>
<pre class="out">lab@R2&gt; show isis overview
  Overload bit: <span class="hl">set</span>
lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0xac17     1170 L1 L2 <span class="hl">Overload</span>
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0x3bd8     1170 L1 L2 <span class="hl">Overload</span></pre>
<p>The Attributes column shows <b>Overload</b> for both levels. Neighbours keep R2 in their database but never run SPF through it. Note the careful wording: overload does not shut the router off, it only removes its transit role, which is the safest way to drain traffic.</p>

<h3>Timers worth knowing</h3>
<ul>
<li><b>Hello interval</b>: 9 seconds by default on point-to-point and non-DIS LAN routers, 3 seconds for a DIS (that is why a DIS failure is detected faster). The <b>hold time</b> is 3 times the hello, so 27 seconds.</li>
<li><b>LSP lifetime</b>: 1200 seconds by default, as <code>show isis overview</code> printed (<code>LSP life time: 1200</code>). LSPs are refreshed before they expire.</li>
<li><b>SPF delay</b>: <code>SPF delay: 200 msec, SPF holddown: 5000 msec, SPF rapid runs: 3</code> in the overview. Tune with <code>spf-options delay</code>.</li>
<li><b>BFD</b>: for sub-second detection, <code>set protocols isis interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300</code>. Hello timers alone take tens of seconds.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A router is to be patched in a 5-router ring. Step 1: <code>set protocols isis overload</code>, commit. Step 2: check on neighbours that the LSP of this router shows Overload and that routes no longer use it as next hop. Step 3: do the maintenance. Step 4: <code>delete protocols isis overload</code>, commit, and check the LSP lost the attribute. Traffic stays on the other path during the work.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using hello authentication on one router only, or matching the key but not the type. Another one: leaving the overload bit on after maintenance, so the router stays out of transit forever.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello authentication is per interface and per level; LSP authentication is per level. A hello auth mismatch means no adjacency at all; an LSP auth mismatch means adjacency up but no database. Overload means "do not transit through me", not "I am down". Default hold time is 27 seconds (3 x 9).</p></div>

<div class="scn"><h4>The silent neighbour</h4><p>After a key rotation, one level 2 link in a branch network never came up. Both engineers swore the key was the same. One router had the key in lowercase because of a copy and paste from a ticket. Re-entering the key from one shared source and committing on one side brought the adjacency up.</p><p><b>Lesson:</b> keys are case sensitive, and hidden keys cannot be compared by eye. Re-enter, do not guess.</p></div>

<div class="iv"><p class="q">"What is the IS-IS overload bit used for?"</p><p>It tells all routers not to use this router for transit, while still reaching its own prefixes. I set it before maintenance or during boot, and I confirm it in the LSP Attributes column. I remove it after the work and check it is gone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello authentication stops adjacencies with untrusted routers; LSP authentication protects the database.</li>
<li>Keys are case sensitive; type and key must match on both ends.</li>
<li>The overload bit drains transit traffic; it appears as Overload in the LSP attributes.</li>
<li>Hello 9 s, hold 27 s, DIS hello 3 s, LSP lifetime 1200 s; BFD for fast detection.</li>
</ul></div>
`,hi:`
<p>Routing protocol ko apne neighbours par bharosa karna padta hai. IS-IS ke packets par IP addresses nahi hote, isliye same link par koi bhi router sirf CLNS bolkar LSPs inject kar sakta hai. Authentication darwaze ka taala hai. Ye chapter do operational tools bhi batata hai: <b>overload bit</b>, maintenance ke liye router ko transit paths se hatane ke liye, aur <b>timers</b> jo tay karte hain ki failure kitni jaldi pakda jaata hai.</p>

<h3>Authentication: teen jagah</h3>
<table class="cmp"><tr><th>Type</th><th>Kisko protect karta hai</th><th>Kahan configure hota hai</th></tr>
<tr><td>Hello authentication</td><td>IIH PDUs, taaki sirf trusted routers adjacency banayein</td><td>interface, per level</td></tr>
<tr><td>LSP authentication</td><td>Level ke LSPs, CSNPs aur PSNPs</td><td>level (global)</td></tr>
<tr><td>Dono</td><td>Neighbour trust aur database trust</td><td>dono combine karo</td></tr></table>
<p>Methods hain <b>simple</b> (clear text, sirf lab ke liye), <b>md5</b> aur naye hmac-md5 style keys. Key case sensitive hai, aur type dono taraf match karna chahiye. Dono mein se kisi mein mismatch ka visible result ek hi hai: hello drop hota hai aur adjacency kabhi nahi dikhti.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Hello authentication mismatch">
<rect x="60" y="50" width="130" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="125" y="75" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="125" y="95" text-anchor="middle" class="svg-muted" font-size="11">key Pune-L2</text>
<rect x="450" y="50" width="130" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="515" y="75" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="515" y="95" text-anchor="middle" class="svg-muted" font-size="11">key pune-l2</text>
<line x1="190" y1="80" x2="450" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="65" text-anchor="middle" class="svg-accent" font-size="12">MD5 digest wala IIH</text>
<text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">digest match nahi, hello drop</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Result: adjacency nahi, show isis adjacency khaali</text>
</svg><p class="cap">Case matter karta hai: Pune-L2 aur pune-l2 alag keys hain.</p></div>
<p>Pune lab mein R3 ke paas level 2 hello key hai. Router key aur type store karta hai. Asli Junos saved configuration mein key ka text chhupa deta hai, aur simulator use secret data mark karta hai:</p>
<pre class="code">set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-key Pune-L2
set protocols isis interface ge-0/0/0.0 level 2 hello-authentication-type md5</pre>
<pre class="out">lab@R3&gt; show configuration protocols isis
interface ge-0/0/0.0 {
    point-to-point;
    level 2 {
        hello-authentication-key <span class="hl">pune-l2</span>; ## SECRET-DATA
        hello-authentication-type md5;
    }
}
lab@R3&gt; show isis adjacency
(koi output nahi, koi neighbour nahi)</pre>
<p>R3 ke paas adjacency zero hain. Asli router par key display mein chhupi hoti hai, isliye keys dekhkar compare nahi kar sakte. Ek taraf key dobara enter karo (<code>Pune-L2</code>, jaise neighbour ke engineer ne confirm kiya) aur commit karo. Is lab mein R2 par aur bhi faults the, isliye authentication unmein se ek tha; ek samay mein ek problem theek karo aur dobara check karo.</p>
<p>LSP authentication ke liye level par set karo: <code>set protocols isis level 2 authentication-key SomeKey</code> aur <code>authentication-type md5</code>. Yahan mismatch zyada subtle hota hai: adjacencies ban jaati hain, par LSPs discard hote hain aur database khaali rehta hai.</p>

<h3>Overload bit</h3>
<p>Router ke LSP mein <b>overload bit</b> set karna sab routers ko batata hai: "mujhe transit hop ki tarah use mat karo; mere apne prefixes theek hain". Ye OSPF ke "max-metric" ka IS-IS version hai. Maintenance se pehle ya boot par, jab tak routing table bhar na jaye, use karo. <code>set protocols isis overload</code> se configure hota hai. Reboot ke baad <code>overload timeout 300</code> use kar sakte ho taaki bit khud saaf ho jaye.</p>
<pre class="out">lab@R2&gt; show isis overview
  Overload bit: <span class="hl">set</span>
lab@R2&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0xac17     1170 L1 L2 <span class="hl">Overload</span>
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R2.00-00                         0x2   0x3bd8     1170 L1 L2 <span class="hl">Overload</span></pre>
<p>Attributes column dono levels ke liye <b>Overload</b> dikhata hai. Neighbours R2 ko database mein rakhte hain par uske through SPF nahi chalate. Dhyan do: overload router ko band nahi karta, sirf uska transit role hatata hai, jo traffic drain karne ka sabse surakshit tareeka hai.</p>

<h3>Zaroori timers</h3>
<ul>
<li><b>Hello interval</b>: point-to-point aur non-DIS LAN routers par default 9 second, DIS ke liye 3 second (isliye DIS failure jaldi pakda jaata hai). <b>Hold time</b> hello ka 3 guna, yani 27 second.</li>
<li><b>LSP lifetime</b>: default 1200 second, jaise <code>show isis overview</code> ne print kiya (<code>LSP life time: 1200</code>). LSPs expire hone se pehle refresh hote hain.</li>
<li><b>SPF delay</b>: overview mein <code>SPF delay: 200 msec, SPF holddown: 5000 msec, SPF rapid runs: 3</code>. <code>spf-options delay</code> se tune karo.</li>
<li><b>BFD</b>: sub-second detection ke liye <code>set protocols isis interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300</code>. Sirf hello timers mein kai second lagte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 5-router ring mein ek router patch karna hai. Step 1: <code>set protocols isis overload</code>, commit. Step 2: neighbours par check karo ki is router ke LSP par Overload dikhta hai aur routes ab ise next hop nahi banate. Step 3: maintenance karo. Step 4: <code>delete protocols isis overload</code>, commit, aur check karo ki LSP se attribute hat gaya. Kaam ke dauran traffic doosre path par rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hello authentication sirf ek router par lagana, ya key match karna par type nahi. Ek aur: maintenance ke baad overload bit on chhod dena, jisse router hamesha transit se bahar rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello authentication per interface aur per level hai; LSP authentication per level. Hello auth mismatch ka matlab adjacency hi nahi; LSP auth mismatch ka matlab adjacency up par database nahi. Overload ka matlab "mere through transit mat karo", "main down hoon" nahi. Default hold time 27 second (3 x 9).</p></div>

<div class="scn"><h4>Chup neighbour</h4><p>Key rotation ke baad branch network ka ek level 2 link kabhi up nahi hua. Dono engineers ne kasam khayi ki key same hai. Ek router par ticket se copy paste karne ki wajah se key lowercase mein thi. Ek shared source se key dobara enter karke ek taraf commit karne par adjacency up ho gayi.</p><p><b>Lesson:</b> keys case sensitive hain, aur chhupi keys aankh se compare nahi hoti. Dobara enter karo, andaza mat lagao.</p></div>

<div class="iv"><p class="q">"IS-IS overload bit kis kaam aata hai?"</p><p>Ye sab routers ko batata hai ki is router ko transit ke liye use na karein, jabki iske apne prefixes reachable rehte hain. Main ise maintenance se pehle ya boot ke dauran set karta hoon, aur LSP Attributes column mein confirm karta hoon. Kaam ke baad hata deta hoon aur check karta hoon ki gaya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hello authentication untrusted routers ke saath adjacency rokta hai; LSP authentication database protect karta hai.</li>
<li>Keys case sensitive hain; type aur key dono taraf match hone chahiye.</li>
<li>Overload bit transit traffic drain karta hai; LSP attributes mein Overload dikhta hai.</li>
<li>Hello 9 s, hold 27 s, DIS hello 3 s, LSP lifetime 1200 s; fast detection ke liye BFD.</li>
</ul></div>
`}};export{e as default};