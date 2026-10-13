var e={id:`overload-bit`,h:{en:`Draining a router for maintenance: the overload bit`,hi:`Maintenance ke liye router drain karna: overload bit`},body:{en:`
<p><b>The maintenance problem.</b> Tonight JR2 needs a software upgrade. If you simply reload it, traffic that currently flows through JR2 is dropped for seconds until the rest of the network notices and reroutes. Good carriers move traffic away <i>first</i>, then work on the router. The IS-IS tool for this is the <b>overload bit</b> (OL bit). A router that sets it in its LSP tells everyone: "do not use me as a transit router, but my own addresses are still valid". Other routers keep their adjacency with JR2 and still reach JR2's loopback, but their SPF no longer calculates paths <i>through</i> JR2.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Before</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">R1 to JR3 via JR2</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set OL</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">on JR2</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">After</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">R1 to JR3 via JR1</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Upgrade</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">JR2 still reachable</text></svg><p class="cap">Drain first, then upgrade: the OL bit moves transit away but keeps JR2 reachable.</p></div>
<h3>Lab 2: find the path, then drain</h3>
<p>The square: R1 (IOS) connects to JR1 (metric 20) and to JR2 (metric 10); JR1 connects to JR3 with metric 20; JR2 connects to JR3 with metric 10. Task 1 asks which router carries R1's traffic to JR3's loopback 10.31.255.13 today. Real output from R1:</p>
<pre class="out">R1# show ip route 10.31.255.13
Routing entry for 10.31.255.13/32
  Known via "isis", distance 115, metric <span class="hl">20</span>
  Routing Descriptor Blocks:
  * <span class="hl">10.31.2.12</span>, via GigabitEthernet0/1</pre>
<p>The next hop 10.31.2.12 is JR2, with metric 20 (10 plus 10). The answer is <b>JR2</b>. Now set the overload bit on JR2:</p>
<pre class="code">set protocols isis overload
commit</pre>
<p>After the commit, R1 recomputes. The route to JR3 now goes through JR1, with the metric 40 (20 plus 20):</p>
<pre class="out">R1# show ip route 10.31.255.13
Routing entry for 10.31.255.13/32
  Known via "isis", distance 115, metric <span class="hl">40</span>
  Routing Descriptor Blocks:
  * <span class="hl">10.31.1.11</span>, via GigabitEthernet0/0</pre>
<p>And how does R1 know JR2 is overloaded? The last column of the IS-IS database on IOS is <b>ATT/P/OL</b>: the Attached bit, the Partition-repair bit and the Overload bit. Real output from R1:</p>
<pre class="out">R1# show isis database

Tag null:
IS-IS Level-2 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00            * 0x00000001   0xE286        1170/*                 0/0/0
JR1.00-00             0x00000001   0x181B        1170/1200              0/0/0
<span class="hl">JR2.00-00             0x00000002   0xC033        1200/1200              0/0/1</span>
JR3.00-00             0x00000001   0xB4AE        1170/1200              0/0/0</pre>
<p>JR2's LSP shows <b>0/0/1</b>: only the last bit, OL, is set. Its sequence number rose from 1 to 2 because setting the bit made JR2 originate a new LSP. In the simulator the answer to task 3 is the flag name OL. Everyone else shows 0/0/0.</p>
<h3>JR2 is still reachable</h3>
<p>The lab also requires that JR2's own loopback 10.31.255.12 stays reachable from R1. This works because the OL bit stops transit calculation <i>through</i> the router but not routes <i>to</i> the router. That is what lets you SSH to JR2 and upgrade it while traffic flows elsewhere.</p>
<h3>Variations and the IOS equivalent</h3>
<ul><li><code>set protocols isis overload timeout 300</code>: after a reload the router stays overloaded for 300 seconds, giving BGP and LDP time to converge before it carries traffic again. Without it a router that comes back up can attract traffic before it is ready (a black hole).</li>
<li>On IOS the equivalent is <code>set-overload-bit</code> under <code>router isis</code>; <code>set-overload-bit on-startup 300</code> is the startup version.</li>
<li>To finish maintenance, remove the statement (delete protocols isis overload) and commit.</li></ul>
<p>A related point: overload does not tell BGP or static routes anything. Traffic that is routed by those can still use JR2. For a full drain also lower BGP preference or shut sessions, as your maintenance procedure requires.</p>
<div class="warn"><p><b>Common mistake.</b> Forgetting to remove the overload statement after maintenance, so the router stays a non-transit router indefinitely. Also, setting overload on a router that is the only path to a prefix does not remove the prefix; it just stops using the router for transit through it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know: OL bit = do not use me for transit, but my prefixes are reachable. IOS shows it in the ATT/P/OL column of show isis database. Junos statement is set protocols isis overload (with an optional timeout); IOS is set-overload-bit.</p></div>
<div class="scn"><h4>The upgrade that nobody noticed</h4><p>A carrier upgraded a core router during business hours. The engineer set the overload bit, waited until R1 and the other routers showed the OL flag and moved the traffic, checked that the loopback of the router was still reachable, then upgraded. With the timeout set to 300 seconds, the router stayed drained after its reload until BGP had converged. Customers saw no loss.</p><p><b>Lesson:</b> Drain, verify, upgrade, then undrain.</p></div>
<div class="iv"><p class="q">"How do you take a core router out of service without dropping traffic?"</p><p>I set the IS-IS overload bit so other routers stop using it for transit while it stays reachable. I confirm that the transit path moved (show route on a neighbour) and see the OL flag in the IS-IS database, then do the work. For restarts I add an overload timeout so BGP can converge before it carries traffic. Afterwards I remove the statement.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>The overload bit stops transit through a router but keeps it reachable.</li>
<li>Junos: set protocols isis overload [timeout seconds]. IOS: set-overload-bit [on-startup].</li>
<li>IOS shows it in the ATT/P/OL column: 0/0/1 means overload.</li>
<li>Lab 2: R1 to JR3 moved from JR2 (metric 20) to JR1 (metric 40).</li>
<li>Remove the statement after maintenance.</li></ul></div>
`,hi:`
<p><b>Maintenance problem.</b> Aaj raat JR2 ka software upgrade hai. Seedha reload karoge to jo traffic abhi JR2 ke through ja raha hai woh seconds tak drop hoga jab tak baaki network notice karke reroute na kare. Achhe carriers pehle traffic hataate hain, phir router par kaam karte hain. Iske liye IS-IS ka tool <b>overload bit</b> (OL bit) hai. Jo router apne LSP mein ise set karta hai woh sabko bata deta hai: "mujhe transit router ki tarah use mat karo, par mere apne addresses abhi bhi valid hain". Doosre routers JR2 ke saath adjacency rakhte hain aur JR2 ka loopback abhi bhi reach karte hain, par unka SPF ab JR2 <i>ke through</i> paths calculate nahi karta.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Before</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">R1 se JR3 via JR2</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Set OL</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">JR2 par</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">After</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">R1 se JR3 via JR1</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Upgrade</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">JR2 abhi bhi reachable</text></svg><p class="cap">Pehle drain, phir upgrade: OL bit transit hataata hai par JR2 ko reachable rakhta hai.</p></div>
<h3>Lab 2: path dhoondo, phir drain karo</h3>
<p>Square: R1 (IOS) JR1 (metric 20) aur JR2 (metric 10) se judta hai; JR1 JR3 se metric 20 ke saath judta hai; JR2 JR3 se metric 10 ke saath. Task 1 poochta hai ki aaj R1 ka JR3 ke loopback 10.31.255.13 tak ka traffic kaunsa router le jaata hai. R1 ka real output:</p>
<pre class="out">R1# show ip route 10.31.255.13
Routing entry for 10.31.255.13/32
  Known via "isis", distance 115, metric <span class="hl">20</span>
  Routing Descriptor Blocks:
  * <span class="hl">10.31.2.12</span>, via GigabitEthernet0/1</pre>
<p>Next hop 10.31.2.12 JR2 hai, metric 20 (10 plus 10) ke saath. Jawab <b>JR2</b> hai. Ab JR2 par overload bit set karo:</p>
<pre class="code">set protocols isis overload
commit</pre>
<p>Commit ke baad R1 dobara compute karta hai. JR3 ka route ab JR1 ke through jaata hai, metric 40 (20 plus 20) ke saath:</p>
<pre class="out">R1# show ip route 10.31.255.13
Routing entry for 10.31.255.13/32
  Known via "isis", distance 115, metric <span class="hl">40</span>
  Routing Descriptor Blocks:
  * <span class="hl">10.31.1.11</span>, via GigabitEthernet0/0</pre>
<p>Aur R1 ko kaise pata ki JR2 overloaded hai? IOS par IS-IS database ka aakhri column <b>ATT/P/OL</b> hai: Attached bit, Partition-repair bit aur Overload bit. R1 ka real output:</p>
<pre class="out">R1# show isis database

Tag null:
IS-IS Level-2 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00            * 0x00000001   0xE286        1170/*                 0/0/0
JR1.00-00             0x00000001   0x181B        1170/1200              0/0/0
<span class="hl">JR2.00-00             0x00000002   0xC033        1200/1200              0/0/1</span>
JR3.00-00             0x00000001   0xB4AE        1170/1200              0/0/0</pre>
<p>JR2 ke LSP par <b>0/0/1</b> dikhta hai: sirf aakhri bit, OL, set hai. Uska sequence number 1 se 2 ho gaya kyunki bit set karne se JR2 ne naya LSP originate kiya. Simulator mein task 3 ka jawab flag naam OL hai. Baaki sab 0/0/0 dikhate hain.</p>
<h3>JR2 abhi bhi reachable hai</h3>
<p>Lab yeh bhi maangta hai ki JR2 ka apna loopback 10.31.255.12 R1 se reachable rahe. Yeh isliye chalta hai kyunki OL bit router <i>ke through</i> transit calculation rokta hai, router <i>tak</i> ke routes nahi. Isi se aap JR2 par SSH karke upgrade kar sakte ho jabki traffic kahin aur chalta hai.</p>
<h3>Variations aur IOS equivalent</h3>
<ul><li><code>set protocols isis overload timeout 300</code>: reload ke baad router 300 seconds tak overloaded rehta hai, taaki BGP aur LDP ko converge hone ka time mile phir woh traffic carry kare. Iske bina wapas aaya router taiyar hone se pehle traffic attract kar sakta hai (black hole).</li>
<li>IOS par equivalent <code>router isis</code> ke neeche <code>set-overload-bit</code> hai; <code>set-overload-bit on-startup 300</code> startup version hai.</li>
<li>Maintenance khatam karne ke liye statement hata do (delete protocols isis overload) aur commit karo.</li></ul>
<p>Ek related point: overload BGP ya static routes ko kuch nahi batata. Jo traffic unse route hota hai woh abhi bhi JR2 use kar sakta hai. Full drain ke liye apne maintenance procedure ke hisaab se BGP preference bhi kam karo ya sessions shut karo.</p>
<div class="warn"><p><b>Common mistake.</b> Maintenance ke baad overload statement hatana bhool jaana, isliye router hamesha ke liye non-transit router rehta hai. Saath hi aise router par overload set karna jo kisi prefix ka akela path hai prefix ko nahi hataata; bas us router ke through transit use karna band karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho: OL bit = mujhe transit ke liye use mat karo, par mere prefixes reachable hain. IOS ise show isis database ke ATT/P/OL column mein dikhata hai. Junos statement set protocols isis overload (optional timeout ke saath); IOS set-overload-bit.</p></div>
<div class="scn"><h4>Upgrade jise kisi ne notice nahi kiya</h4><p>Ek carrier ne business hours mein core router upgrade kiya. Engineer ne overload bit set kiya, tab tak intezaar kiya jab tak R1 aur doosre routers ne OL flag dikhaya aur traffic hat gaya, check kiya ki router ka loopback abhi bhi reachable hai, phir upgrade kiya. Timeout 300 seconds par hone se router reload ke baad BGP converge hone tak drained raha. Customers ko koi loss nahi hua.</p><p><b>Lesson:</b> Drain, verify, upgrade, phir undrain.</p></div>
<div class="iv"><p class="q">"Core router ko bina traffic drop kiye service se kaise nikalte ho?"</p><p>Main IS-IS overload bit set karta hoon taaki doosre routers use transit ke liye use karna band karein jabki woh reachable rahe. Confirm karta hoon ki transit path hat gaya (neighbour par show route) aur IS-IS database mein OL flag dikhta hai, phir kaam karta hoon. Restarts ke liye overload timeout jodta hoon taaki BGP traffic carry karne se pehle converge ho. Baad mein statement hata deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Overload bit router ke through transit rokta hai par use reachable rakhta hai.</li>
<li>Junos: set protocols isis overload [timeout seconds]. IOS: set-overload-bit [on-startup].</li>
<li>IOS ise ATT/P/OL column mein dikhata hai: 0/0/1 ka matlab overload.</li>
<li>Lab 2: R1 se JR3 JR2 (metric 20) se JR1 (metric 40) par gaya.</li>
<li>Maintenance ke baad statement hata do.</li></ul></div>
`}};export{e as default};