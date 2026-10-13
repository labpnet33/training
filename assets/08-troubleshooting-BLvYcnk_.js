var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the branch that took the slow road`,hi:`Troubleshooting workflow: branch jo dheemi raah par chala`},body:{en:`
<p><b>The ticket.</b> Branch router BR1 reaches the HQ network 172.30.0.0/16 over a fast primary link with a slow backup as a floating static route. Users complain that HQ is slow and that the HR server 172.30.5.10 is unreachable. Find out which next hop is used, fix the static routes, and restore access to the server over the primary link.</p>
<p>Static-routing faults fall into a handful of patterns. Learn the patterns and the workflow below, and you can solve most tickets in minutes.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Branch lab topology">
<rect x="20" y="95" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="170" y="85" width="120" height="65" rx="10" fill="#bae6fd"/><text x="230" y="115" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="230" y="135" text-anchor="middle" class="svg-muted" font-size="11">192.168.60.1</text>
<rect x="450" y="85" width="110" height="65" rx="10" fill="#bbf7d0"/><text x="505" y="115" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="505" y="135" text-anchor="middle" class="svg-muted" font-size="11">172.30.5.1</text>
<rect x="590" y="95" width="45" height="45" rx="8" fill="#e2e8f0"/><text x="612" y="122" text-anchor="middle" class="svg-ink" font-size="11">SRV</text>
<line x1="110" y1="117" x2="170" y2="117" stroke="#64748b" stroke-width="2"/><line x1="290" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="3"/><line x1="290" y1="135" x2="450" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><line x1="560" y1="117" x2="590" y2="117" stroke="#64748b" stroke-width="2"/>
<text x="370" y="92" text-anchor="middle" class="svg-accent" font-size="11">primary 10.60.1.0/30</text><text x="370" y="158" text-anchor="middle" class="svg-muted" font-size="11">backup 10.60.2.0/30</text>
</svg><p class="cap">Primary link ge-0/0/0 (10.60.1.1 - 10.60.1.2) and backup link ge-0/0/1 (10.60.2.1 - 10.60.2.2).</p></div>

<h3>A repeatable workflow</h3>
<ol>
<li><b>Reproduce.</b> From the user's PC ping the server and a normal HQ address. Different results mean a specific-route problem; the same failure means a general path problem.</li>
<li><b>Ask the router about the destination.</b> <code>show route DESTINATION</code> (an address, not a prefix).</li>
<li><b>Look at the whole prefix family.</b> <code>show route PREFIX exact</code> and <code>... longer</code>.</li>
<li><b>Check the next hop.</b> Is it on a connected subnet? Does the interface list show it? <code>show interfaces terse</code>.</li>
<li><b>Fix one thing</b>, commit, and re-verify with the same commands.</li>
<li><b>Test the real path</b> from the host.</li>
</ol>

<h3>Step by step in the lab</h3>
<p><b>Which next hop is used?</b></p>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
172.30.0.0/16      *[Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>The active route is Static/20: the <b>backup</b> next hop 10.60.2.2 is in use. The slow link explains "HQ is slow". There is no Static/5 line at all, so the primary route is not even in the table. Check the configuration:</p>
<pre class="out">lab@BR1&gt; show configuration routing-options
static {
    route 172.30.0.0/16 {
        next-hop 10.60.1.6;
        qualified-next-hop 10.60.2.2 {
            preference 20;
        }
    }
    route 172.30.5.0/24 reject;
}</pre>
<p>The primary next hop is 10.60.1.6, but the primary link is 10.60.1.0/30 with BR1 = 10.60.1.1 and HQ = 10.60.1.2. Address .6 is not on any connected subnet, so the route cannot be resolved and never becomes active. Fix it:</p>
<pre class="code">delete routing-options static route 172.30.0.0/16 next-hop 10.60.1.6
set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
commit</pre>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
172.30.0.0/16      *[Static/5] 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    [Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>Now the primary is active with preference 5 and the backup waits below. The answer to the lab question "what preference does the backup have?" is <b>20</b>.</p>
<p><b>Why is the HR server still unreachable?</b> Ask about the address, not the prefix:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>A forgotten /24 with <code>reject</code> is more specific than the /16 and wins regardless of preference. Remove it:</p>
<pre class="code">delete routing-options static route 172.30.5.0/24
commit and-quit</pre>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.0.0/16      *[Static/5] 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    [Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>PC can now ping 172.30.5.10 over the primary link. Also remember the return path: HQ must have a route to 192.168.60.0/24, and in this lab HQ already has one with its own floating backup.</p>

<h3>The fault patterns</h3>
<table class="cmp"><tr><th>Symptom</th><th>Typical cause</th><th>Check</th></tr>
<tr><td>Route configured, never active</td><td>next hop not on a connected subnet; interface down</td><td><code>show route PREFIX exact</code>, <code>show interfaces terse</code></td></tr>
<tr><td>Traffic uses the backup link</td><td>primary route missing or wrong preference</td><td>star and preference in <code>show route</code></td></tr>
<tr><td>One host in a range fails</td><td>more specific reject or discard route</td><td><code>show route PREFIX longer</code></td></tr>
<tr><td>Ping goes out, no reply</td><td>no return route at the far end</td><td>check the other router</td></tr>
<tr><td>Aggregate not seen by neighbours</td><td>no export policy, or policy matches wrong protocol</td><td><code>show configuration protocols ospf</code></td></tr>
<tr><td>Generated default never disappears</td><td>no contributor policy, or a contributor you did not intend</td><td><code>show route 0.0.0.0/0 exact detail</code></td></tr>
<tr><td>Default disappears but should not</td><td>contributor route (BGP) is down</td><td><code>show bgp summary</code>, <code>show route CONTRIBUTOR</code></td></tr></table>

<h3>Troubleshooting the generated default</h3>
<p>In the Nagpur lab, when BGP to the ISP is deactivated, R2 loses the default route. That is the correct, designed behaviour. If you meet the opposite, the default stays after a failure, read the contributing routes line in <code>detail</code>. A contributor that is not the ISP prefix (for example R1's own LAN) means the contributor policy lacks the final <code>term 2 then reject</code>.</p>
<pre class="out">lab@R1&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.64.10.2           64999          4         3       0       0        0:40 Establ
  inet.0: 2/3/3/0</pre>
<p>A healthy session says <code>Establ</code> and the counts show how many routes were accepted. A session in <code>Active</code> or <code>Connect</code> state means the ISP routes, and therefore the contributor, are gone.</p>

<div class="eg"><p><b>Worked example.</b> Ten minutes of calm work: ping fails (1 min), <code>show route</code> for the address reveals a reject /24 (1 min), delete and commit (1 min), ping succeeds (1 min). The other seven minutes belong to a rollback plan: <code>commit confirmed 5</code> before you touch a router at a remote branch.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing three things at once (next hop, preference and the reject route). If the result is still wrong you will not know which change helped. Make one change per commit and use <code>commit comment</code> so the history tells the story.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam shows an output where the star is on the Static/20 route and asks the cause. Do not answer "the backup has a better preference". The real cause is that the preference-5 route is not present or not active (unusable next hop). Also watch for questions where a longer prefix wins over a better preference.</p></div>

<div class="scn"><h4>One server, one forgotten line</h4><p>A bank branch lost access to a single application server after a weekend migration. The covering static route was correct, ping to every other server worked. A senior engineer typed <code>show route</code> with the application address, and the router answered with a /32 discard route from a test the week before. The route had been installed to block a decommissioned server and never removed. Deleting it restored service. The post-incident action was a monthly review of every <code>discard</code> and <code>reject</code> route.</p><p><b>Lesson:</b> always ask the router about the exact address that fails.</p></div>
<div class="iv"><p class="q">"Users reach most of HQ but not one server. The router has a static /16 to HQ. What do you check?"</p><p>I ask the router about the failing address with <code>show route ADDRESS</code> and look for a more specific route, such as a reject, discard or wrong-next-hop static. Longest prefix match overrides preference. I would also run <code>show route PREFIX longer</code>, verify the forwarding table, and test the return path.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce, ask about the address, check the prefix family, check the next hop, fix one thing, verify.</li>
<li>A static route with a next hop outside a connected subnet never becomes active.</li>
<li>A more specific reject or discard route is a classic black hole.</li>
<li>Star on the backup means the primary route is missing, not that the backup is better.</li>
<li>Use <code>commit confirmed</code> and comments for safe, traceable changes.</li>
</ul></div>
`,hi:`
<p><b>Ticket.</b> Branch router BR1 HQ network 172.30.0.0/16 tak fast primary link se jaata hai aur slow backup floating static route hai. Users keh rahe hain HQ slow hai aur HR server 172.30.5.10 tak pahunch nahi hoti. Pata karo kaunsa next hop use ho raha hai, static routes theek karo, aur primary link se server tak access wapas lao.</p>
<p>Static-routing faults kuch patterns mein aate hain. Patterns aur neeche ka workflow seekh lo to zyaadatar tickets minutes mein solve ho jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Branch lab topology">
<rect x="20" y="95" width="90" height="45" rx="8" fill="#e2e8f0"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="170" y="85" width="120" height="65" rx="10" fill="#bae6fd"/><text x="230" y="115" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="230" y="135" text-anchor="middle" class="svg-muted" font-size="11">192.168.60.1</text>
<rect x="450" y="85" width="110" height="65" rx="10" fill="#bbf7d0"/><text x="505" y="115" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="505" y="135" text-anchor="middle" class="svg-muted" font-size="11">172.30.5.1</text>
<rect x="590" y="95" width="45" height="45" rx="8" fill="#e2e8f0"/><text x="612" y="122" text-anchor="middle" class="svg-ink" font-size="11">SRV</text>
<line x1="110" y1="117" x2="170" y2="117" stroke="#64748b" stroke-width="2"/><line x1="290" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="3"/><line x1="290" y1="135" x2="450" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><line x1="560" y1="117" x2="590" y2="117" stroke="#64748b" stroke-width="2"/>
<text x="370" y="92" text-anchor="middle" class="svg-accent" font-size="11">primary 10.60.1.0/30</text><text x="370" y="158" text-anchor="middle" class="svg-muted" font-size="11">backup 10.60.2.0/30</text>
</svg><p class="cap">Primary link ge-0/0/0 (10.60.1.1 - 10.60.1.2) aur backup link ge-0/0/1 (10.60.2.1 - 10.60.2.2).</p></div>

<h3>Dohraya ja sakne wala workflow</h3>
<ol>
<li><b>Reproduce karo.</b> User ke PC se server aur ek normal HQ address ping karo. Alag results matlab specific-route problem; same failure matlab general path problem.</li>
<li><b>Router se destination ke baare mein poochho.</b> <code>show route DESTINATION</code> (address, prefix nahi).</li>
<li><b>Poore prefix family ko dekho.</b> <code>show route PREFIX exact</code> aur <code>... longer</code>.</li>
<li><b>Next hop check karo.</b> Kya woh connected subnet par hai? Interface list mein dikhta hai? <code>show interfaces terse</code>.</li>
<li><b>Ek cheez theek karo</b>, commit karo, aur wahi commands se dobara verify karo.</li>
<li>Host se <b>real path test karo</b>.</li>
</ol>

<h3>Lab mein step by step</h3>
<p><b>Kaunsa next hop use ho raha hai?</b></p>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
172.30.0.0/16      *[Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>Active route Static/20 hai: <b>backup</b> next hop 10.60.2.2 use ho raha hai. Slow link "HQ slow hai" samjhata hai. Static/5 line hai hi nahi, yaani primary route table mein hai hi nahi. Configuration check karo:</p>
<pre class="out">lab@BR1&gt; show configuration routing-options
static {
    route 172.30.0.0/16 {
        next-hop 10.60.1.6;
        qualified-next-hop 10.60.2.2 {
            preference 20;
        }
    }
    route 172.30.5.0/24 reject;
}</pre>
<p>Primary next hop 10.60.1.6 hai, lekin primary link 10.60.1.0/30 hai jisme BR1 = 10.60.1.1 aur HQ = 10.60.1.2. Address .6 kisi connected subnet par nahi, isliye route resolve nahi hota aur kabhi active nahi banta. Fix karo:</p>
<pre class="code">delete routing-options static route 172.30.0.0/16 next-hop 10.60.1.6
set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
commit</pre>
<pre class="out">lab@BR1&gt; show route 172.30.0.0/16 exact
172.30.0.0/16      *[Static/5] 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    [Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>Ab primary preference 5 ke saath active hai aur backup neeche intezaar karta hai. Lab ke sawal "backup ki preference kya hai?" ka jawab <b>20</b> hai.</p>
<p><b>HR server abhi bhi kyun unreachable hai?</b> Prefix nahi, address poochho:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>Bhoola hua /24 jisme <code>reject</code> hai /16 se zyada specific hai aur preference kuch bhi ho jeetta hai. Hatao:</p>
<pre class="code">delete routing-options static route 172.30.5.0/24
commit and-quit</pre>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.0.0/16      *[Static/5] 00:00:00
                    &gt;  to 10.60.1.2 via ge-0/0/0.0
                    [Static/20] 00:00:40
                    &gt;  to 10.60.2.2 via ge-0/0/1.0</pre>
<p>PC ab primary link se 172.30.5.10 ping kar sakta hai. Return path bhi yaad rakho: HQ ke paas 192.168.60.0/24 ka route hona chahiye, aur is lab mein HQ ke paas apne floating backup ke saath hai.</p>

<h3>Fault patterns</h3>
<table class="cmp"><tr><th>Symptom</th><th>Aam wajah</th><th>Check</th></tr>
<tr><td>Route configured, kabhi active nahi</td><td>next hop connected subnet par nahi; interface down</td><td><code>show route PREFIX exact</code>, <code>show interfaces terse</code></td></tr>
<tr><td>Traffic backup link use karta hai</td><td>primary route missing ya galat preference</td><td><code>show route</code> mein star aur preference</td></tr>
<tr><td>Range ka ek host fail</td><td>more specific reject ya discard route</td><td><code>show route PREFIX longer</code></td></tr>
<tr><td>Ping jaata hai, reply nahi</td><td>doosre end par return route nahi</td><td>doosra router check karo</td></tr>
<tr><td>Aggregate neighbours ko nahi dikhta</td><td>export policy nahi, ya policy galat protocol match karti hai</td><td><code>show configuration protocols ospf</code></td></tr>
<tr><td>Generated default kabhi nahi hatta</td><td>contributor policy nahi, ya aisa contributor jo aapne chaaha nahi</td><td><code>show route 0.0.0.0/0 exact detail</code></td></tr>
<tr><td>Default gayab jabki nahi hona chahiye</td><td>contributor route (BGP) down hai</td><td><code>show bgp summary</code>, <code>show route CONTRIBUTOR</code></td></tr></table>

<h3>Generated default ka troubleshooting</h3>
<p>Nagpur lab mein jab ISP ka BGP deactivate hota hai to R2 ka default route chala jaata hai. Yeh sahi, designed behaviour hai. Ulta mile, yaani failure ke baad default bana rahe, to <code>detail</code> mein contributing routes line padho. Agar contributor ISP prefix nahi hai (jaise R1 ka apna LAN) to contributor policy mein aakhri <code>term 2 then reject</code> nahi hai.</p>
<pre class="out">lab@R1&gt; show bgp summary
Groups: 1 Peers: 1 Down peers: 0
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
100.64.10.2           64999          4         3       0       0        0:40 Establ
  inet.0: 2/3/3/0</pre>
<p>Healthy session <code>Establ</code> kehta hai aur counts batate hain kitne routes accept hue. <code>Active</code> ya <code>Connect</code> state matlab ISP ke routes, aur isliye contributor, gaye.</p>

<div class="eg"><p><b>Worked example.</b> Shaanti se kiye gaye das minute: ping fail (1 min), address ke liye <code>show route</code> reject /24 dikhata hai (1 min), delete aur commit (1 min), ping safal (1 min). Baaki saat minute rollback plan ke hain: remote branch ke router ko chhoone se pehle <code>commit confirmed 5</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Teen cheezein ek saath badalna (next hop, preference aur reject route). Result phir bhi galat ho to pata nahi chalega kaunsa change kaam aaya. Ek commit mein ek change karo aur <code>commit comment</code> use karo taaki history kahani bataye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam aisa output dikhata hai jisme star Static/20 route par hai aur wajah poochta hai. "Backup ki preference behtar hai" mat likho. Asli wajah yeh hai ki preference-5 route maujood nahi ya active nahi (unusable next hop). Aise sawaalon par bhi dhyan do jahan longer prefix behtar preference par jeet jaata hai.</p></div>

<div class="scn"><h4>Ek server, ek bhooli hui line</h4><p>Ek bank branch weekend migration ke baad ek application server tak pahunch kho baitha. Covering static route sahi tha, baaki har server ping ho raha tha. Senior engineer ne application address ke saath <code>show route</code> type kiya, aur router ne ek hafta pehle ke test ke /32 discard route se jawab diya. Woh route band kiye gaye server ko block karne ke liye lagaya gaya tha aur kabhi hataya nahi gaya. Use delete karne se service wapas aayi. Post-incident action har <code>discard</code> aur <code>reject</code> route ka mahine mein ek baar review tha.</p><p><b>Lesson:</b> hamesha router se us exact address ke baare mein poochho jo fail ho raha hai.</p></div>
<div class="iv"><p class="q">"Users HQ ka zyaadatar hissa pahunchte hain par ek server nahi. Router ke paas HQ ka static /16 hai. Kya check karoge?"</p><p>Main fail hone wale address ke saath <code>show route ADDRESS</code> poochta hoon aur more specific route dhoondta hoon, jaise reject, discard ya galat-next-hop static. Longest prefix match preference ko override karta hai. Main <code>show route PREFIX longer</code> bhi chalaunga, forwarding table verify karunga aur return path test karunga.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reproduce karo, address poochho, prefix family dekho, next hop check karo, ek cheez theek karo, verify karo.</li>
<li>Connected subnet ke bahar ke next hop wala static route kabhi active nahi hota.</li>
<li>More specific reject ya discard route classic black hole hai.</li>
<li>Backup par star ka matlab primary route missing hai, backup behtar nahi.</li>
<li>Safe, traceable changes ke liye <code>commit confirmed</code> aur comments use karo.</li>
</ul></div>
`}};export{e as default};