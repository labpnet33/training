var e={id:`count-block`,h:{en:`Counting and blocking a noisy host: transit filter walkthrough`,hi:`Shor machane wale host ko count aur block karna: transit filter walkthrough`},body:{en:`
<p>The second lab uses a filter on a transit interface, a different job from the loopback filter. Here the router forwards user traffic, and one misbehaving host must be dropped while everyone else carries on. You also need numbers, and later a polite rejection and a log.</p>

<h3>Analogy: turning away one troublemaker</h3>
<p>A shop has a door. The owner wants to stop one specific person who keeps causing trouble, but every other customer must walk in as normal. The guard has a photo of the troublemaker. The rule is "if photo matches, turn away and tally it; otherwise let them in". Notice the second sentence. Without "otherwise let them in", the guard would turn away everybody.</p>

<h3>The topology</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Jaipur office topology">
<rect x="270" y="20" width="130" height="55" rx="8" fill="#bbf7d0"/><text x="335" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1-JAIPUR</text><text x="335" y="62" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1 10.40.1.1/24</text>
<rect x="500" y="20" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="555" y="62" text-anchor="middle" class="svg-muted" font-size="11">10.40.9.10</text>
<rect x="275" y="120" width="120" height="45" rx="8" fill="#e2e8f0"/><text x="335" y="148" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="100" y="220" width="110" height="55" rx="8" fill="#bae6fd"/><text x="155" y="244" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="155" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.10</text>
<rect x="280" y="220" width="110" height="55" rx="8" fill="#bae6fd"/><text x="335" y="244" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="335" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.20</text>
<rect x="460" y="220" width="110" height="55" rx="8" fill="#fecaca"/><text x="515" y="244" text-anchor="middle" class="svg-ink" font-size="13">BAD</text><text x="515" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.66</text>
<line x1="400" y1="47" x2="500" y2="47" stroke="#64748b" stroke-width="2"/><text x="450" y="38" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/2 10.40.9.1</text>
<line x1="335" y1="75" x2="335" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="305" y1="165" x2="170" y2="220" stroke="#64748b" stroke-width="2"/><line x1="335" y1="165" x2="335" y2="220" stroke="#64748b" stroke-width="2"/><line x1="365" y1="165" x2="500" y2="220" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three hosts share the office LAN behind switch SW1. R1 routes between the LAN and the billing server.</p></div>
<p>BAD at 10.40.1.66 keeps hammering SRV. PC1 and PC2 are healthy. R1 must drop BAD's traffic, leave the others alone, and count the drops.</p>

<h3>Step 1: the block term</h3>
<pre class="code">lab@R1-JAIPUR&gt; configure
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST from source-address 10.40.1.66/32
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then count bad-host
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then discard</pre>
<p><code>/32</code> means exactly one host. The term matches every packet <b>from</b> BAD, whatever its destination or protocol.</p>

<h3>Step 2: the term that saves everyone else</h3>
<pre class="code">lab@R1-JAIPUR# set firewall family inet filter LAN-IN term ALLOW-REST then accept
lab@R1-JAIPUR# set interfaces ge-0/0/1 unit 0 family inet filter input LAN-IN
lab@R1-JAIPUR# commit
commit complete</pre>
<p>Without ALLOW-REST, PC1's and PC2's packets would match nothing and be silently dropped by the implicit discard. The interface is the LAN-facing ge-0/0/1, and the filter is <b>input</b> there, because BAD's packets arrive on that interface. Blocking at input means R1 does not waste effort forwarding them.</p>

<h3>Step 3: prove it works</h3>
<pre class="out">PC1&gt; ping 10.40.9.10 -c 2
84 bytes from 10.40.9.10: icmp_seq=1 ttl=63 time=1.0 ms
84 bytes from 10.40.9.10: icmp_seq=2 ttl=63 time=0.9 ms

BAD&gt; ping 10.40.9.10 -c 3
10.40.9.10 icmp_seq=1 timeout
10.40.9.10 icmp_seq=2 timeout
10.40.9.10 icmp_seq=3 timeout

lab@R1-JAIPUR&gt; show firewall filter LAN-IN

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
<span class="hl">bad-host                                             252                    3</span></pre>
<p>PC1 works. BAD times out. The counter shows 3 packets of 84 bytes: exactly BAD's three pings. You now have a number for management: every packet BAD sends is dropped and recorded.</p>

<h3>Step 4: a polite rejection and a log</h3>
<p>Security now wants BAD to get an immediate "prohibited" answer, and wants a record. Only one terminating action may exist in a term, so you delete discard before setting reject:</p>
<pre class="code">lab@R1-JAIPUR# delete firewall family inet filter LAN-IN term BAD-HOST then discard
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then reject
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then log
lab@R1-JAIPUR# commit and-quit
commit complete

BAD&gt; ping 10.40.9.10 -c 2
From 10.40.1.1 icmp_seq=1 Destination Host Unreachable (administratively prohibited)

lab@R1-JAIPUR&gt; show firewall log
Log :
Time      Filter    Action Interface           Protocol        Src Addr                         Dest Addr
<span class="hl">05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</span>
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</pre>
<p>BAD now sees the router refuse immediately. The log records action <b>R</b> for reject. PC1 still reaches SRV, which you must always re-check after any filter change.</p>

<h3>Final configuration</h3>
<pre class="out">lab@R1-JAIPUR&gt; show configuration firewall family inet filter LAN-IN
term BAD-HOST {
    from {
        source-address {
            10.40.1.66/32;
        }
    }
    then {
        count bad-host;
        log;
        reject;
    }
}
term ALLOW-REST {
    then accept;
}</pre>

<div class="warn"><p><b>Common mistake.</b> Using a wide mask by accident, such as <code>10.40.1.66/24</code>, which becomes the whole subnet 10.40.1.0/24 and blocks PC1 and PC2 too. Check that a single host is written as /32. Another mistake is applying the filter to the server-side interface, where BAD's packets are not seen as input.</p></div>
<div class="exam"><p><b>Exam trap.</b> To block one host while allowing the rest, the block term must come first and a final accept term must follow. If the order is reversed, the accept matches first and the block never runs. Also, discard and reject cannot both be in the same term.</p></div>

<div class="scn"><h4>One PC, 52,000 packets</h4><p>An accounts PC infected with unwanted software began scanning the billing server. Server monitoring showed latency spikes. The network team used the filter above, counted 52,000 dropped packets within an hour, and switched to reject plus log so the log showed the exact ports tried. They sent the counter and log to the desktop team, who cleaned the PC. The filter stayed for two days until the antivirus report came back clean, and was then removed with <code>delete</code> and <code>commit</code>.</p><p><b>Lesson:</b> a temporary filter with a counter gives containment and evidence at once. Remove it when the cause is fixed.</p></div>

<div class="iv"><p class="q">"How would you block one host while keeping everyone else working, and show proof?"</p><p>Strong answer: an input filter on the interface facing that host's LAN. First term matches the host as /32, counts and discards or rejects; last term is accept for everything else, because of the implicit discard. Apply it, verify another host still works, and read show firewall for the counter. Mention reject plus log if the user must be told, and removal after the incident.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A single host is /32; block term first, accept-the-rest term last.</li>
<li>Apply input on the interface where the unwanted packets arrive.</li>
<li>count gives numbers; log and reject give user feedback and a record.</li>
<li>discard and reject are exclusive in one term: delete one before setting the other.</li>
<li>After every filter change, re-test a healthy host.</li>
</ul></div>
`,hi:`
<p>Doosri lab transit interface par filter use karti hai, jo loopback filter se alag kaam hai. Yahan router user traffic forward karta hai, aur ek ganda host drop hona chahiye jabki baaki sab chalte rahein. Aapko numbers bhi chahiye, aur baad mein polite rejection aur log.</p>

<h3>Analogy: ek troublemaker ko wapas bhejna</h3>
<p>Dukaan ka ek darwaza hai. Maalik ek khaas insaan ko rokna chahta hai jo pareshani karta hai, lekin baaki har customer normal tarah se andar aaye. Guard ke paas troublemaker ki photo hai. Rule hai "agar photo match kare to wapas karo aur tally karo; warna andar aane do". Doosra vaakya dhyan se dekho. "Warna andar aane do" ke bina guard sabko wapas kar deta.</p>

<h3>Topology</h3>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Jaipur office topology">
<rect x="270" y="20" width="130" height="55" rx="8" fill="#bbf7d0"/><text x="335" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1-JAIPUR</text><text x="335" y="62" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/1 10.40.1.1/24</text>
<rect x="500" y="20" width="110" height="55" rx="8" fill="#ddd6fe"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="555" y="62" text-anchor="middle" class="svg-muted" font-size="11">10.40.9.10</text>
<rect x="275" y="120" width="120" height="45" rx="8" fill="#e2e8f0"/><text x="335" y="148" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="100" y="220" width="110" height="55" rx="8" fill="#bae6fd"/><text x="155" y="244" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="155" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.10</text>
<rect x="280" y="220" width="110" height="55" rx="8" fill="#bae6fd"/><text x="335" y="244" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="335" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.20</text>
<rect x="460" y="220" width="110" height="55" rx="8" fill="#fecaca"/><text x="515" y="244" text-anchor="middle" class="svg-ink" font-size="13">BAD</text><text x="515" y="262" text-anchor="middle" class="svg-muted" font-size="11">10.40.1.66</text>
<line x1="400" y1="47" x2="500" y2="47" stroke="#64748b" stroke-width="2"/><text x="450" y="38" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/2 10.40.9.1</text>
<line x1="335" y1="75" x2="335" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="305" y1="165" x2="170" y2="220" stroke="#64748b" stroke-width="2"/><line x1="335" y1="165" x2="335" y2="220" stroke="#64748b" stroke-width="2"/><line x1="365" y1="165" x2="500" y2="220" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen hosts switch SW1 ke peeche office LAN share karte hain. R1 LAN aur billing server ke beech route karta hai.</p></div>
<p>BAD (10.40.1.66) SRV ko lagatar pareshan kar raha hai. PC1 aur PC2 healthy hain. R1 ko BAD ka traffic drop karna hai, baaki ko chhodna hai, aur drops count karne hain.</p>

<h3>Step 1: block term</h3>
<pre class="code">lab@R1-JAIPUR&gt; configure
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST from source-address 10.40.1.66/32
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then count bad-host
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then discard</pre>
<p><code>/32</code> ka matlab exactly ek host. Term BAD <b>se</b> aane wale har packet ko match karta hai, destination ya protocol kuch bhi ho.</p>

<h3>Step 2: woh term jo baaki sabko bachata hai</h3>
<pre class="code">lab@R1-JAIPUR# set firewall family inet filter LAN-IN term ALLOW-REST then accept
lab@R1-JAIPUR# set interfaces ge-0/0/1 unit 0 family inet filter input LAN-IN
lab@R1-JAIPUR# commit
commit complete</pre>
<p>ALLOW-REST ke bina PC1 aur PC2 ke packets kuch match nahi karte aur implicit discard se chupchap drop ho jaate. Interface LAN-facing ge-0/0/1 hai, aur filter wahan <b>input</b> hai, kyunki BAD ke packets usi interface par aate hain. Input par block karne ka matlab R1 unhe forward karne mein mehnat nahi karta.</p>

<h3>Step 3: prove karo ki chalta hai</h3>
<pre class="out">PC1&gt; ping 10.40.9.10 -c 2
84 bytes from 10.40.9.10: icmp_seq=1 ttl=63 time=1.0 ms
84 bytes from 10.40.9.10: icmp_seq=2 ttl=63 time=0.9 ms

BAD&gt; ping 10.40.9.10 -c 3
10.40.9.10 icmp_seq=1 timeout
10.40.9.10 icmp_seq=2 timeout
10.40.9.10 icmp_seq=3 timeout

lab@R1-JAIPUR&gt; show firewall filter LAN-IN

Filter: LAN-IN
Counters:
Name                                                Bytes              Packets
<span class="hl">bad-host                                             252                    3</span></pre>
<p>PC1 chalta hai. BAD time out hota hai. Counter 84 bytes ke 3 packets dikhata hai: exactly BAD ke teen pings. Ab management ke liye ek number hai: BAD ka har packet drop aur record hota hai.</p>

<h3>Step 4: polite rejection aur log</h3>
<p>Security ab chahti hai ki BAD ko turant "prohibited" jawab mile, aur record bhi ho. Term mein sirf ek terminating action ho sakta hai, isliye reject set karne se pehle discard delete karo:</p>
<pre class="code">lab@R1-JAIPUR# delete firewall family inet filter LAN-IN term BAD-HOST then discard
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then reject
lab@R1-JAIPUR# set firewall family inet filter LAN-IN term BAD-HOST then log
lab@R1-JAIPUR# commit and-quit
commit complete

BAD&gt; ping 10.40.9.10 -c 2
From 10.40.1.1 icmp_seq=1 Destination Host Unreachable (administratively prohibited)

lab@R1-JAIPUR&gt; show firewall log
Log :
Time      Filter    Action Interface           Protocol        Src Addr                         Dest Addr
<span class="hl">05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</span>
05:07:10  pfe       R      -                   ICMP            10.40.1.66                       10.40.9.10</pre>
<p>BAD ko ab router ka turant inkaar dikhta hai. Log reject ke liye action <b>R</b> record karta hai. PC1 ab bhi SRV tak pahunchta hai, jise har filter change ke baad re-check karna zaroori hai.</p>

<h3>Final configuration</h3>
<pre class="out">lab@R1-JAIPUR&gt; show configuration firewall family inet filter LAN-IN
term BAD-HOST {
    from {
        source-address {
            10.40.1.66/32;
        }
    }
    then {
        count bad-host;
        log;
        reject;
    }
}
term ALLOW-REST {
    then accept;
}</pre>

<div class="warn"><p><b>Common mistake.</b> Galti se wide mask use karna, jaise <code>10.40.1.66/24</code>, jo poora subnet 10.40.1.0/24 ban jaata hai aur PC1 aur PC2 ko bhi block karta hai. Check karo ki single host /32 likha hai. Ek aur galti: filter ko server-side interface par lagana, jahan BAD ke packets input ke roop mein nahi dikhte.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek host ko block karke baaki ko allow karne ke liye block term pehle aur final accept term baad mein aana chahiye. Order ulta ho to accept pehle match karta hai aur block kabhi nahi chalta. Yeh bhi: discard aur reject ek hi term mein nahi ho sakte.</p></div>

<div class="scn"><h4>Ek PC, 52,000 packets</h4><p>Accounts ka ek PC, jisme unwanted software tha, billing server ko scan karne laga. Server monitoring mein latency spikes dikhe. Network team ne upar wala filter use kiya, ek ghante mein 52,000 dropped packets count kiye, aur reject plus log par switch kiya taaki log mein exact ports dikhein jo try hue. Unhone counter aur log desktop team ko bheje, jinhone PC saaf kiya. Filter do din tak raha jab tak antivirus report saaf nahi aayi, phir <code>delete</code> aur <code>commit</code> se hata diya gaya.</p><p><b>Lesson:</b> counter ke saath temporary filter containment aur saboot dono ek saath deta hai. Cause theek hone par use hata do.</p></div>

<div class="iv"><p class="q">"Ek host ko block karke baaki sabko kaise chalne doge, aur proof kaise dikhaoge?"</p><p>Strong answer: us host ke LAN wale interface par input filter. Pehla term host ko /32 se match karke count aur discard ya reject kare; aakhri term baaki sab ke liye accept, kyunki implicit discard hai. Apply karo, verify karo ki doosra host chalta hai, aur counter ke liye show firewall padho. Agar user ko batana ho to reject plus log bolo, aur incident ke baad hatana bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Single host /32 hota hai; block term pehle, accept-the-rest term aakhir mein.</li>
<li>Input us interface par lagao jahan unwanted packets aate hain.</li>
<li>count numbers deta hai; log aur reject user feedback aur record dete hain.</li>
<li>discard aur reject ek term mein exclusive hain: ek delete karke doosra set karo.</li>
<li>Har filter change ke baad healthy host dobara test karo.</li>
</ul></div>
`}};export{e as default};