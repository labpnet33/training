var e={id:`adjacency-states`,h:{en:`How an adjacency forms and why it gets stuck`,hi:`Adjacency kaise banti hai aur kyun atak jaati hai`},body:{en:`
<p>Two people meeting at a conference go through steps: they notice each other, check that the other one noticed them, agree who speaks first, swap business cards, and ask for any card they are missing. OSPF neighbours do the same, and each step has a name, a <b>neighbour state</b>. If you can read the state, you know exactly which step failed and what to check.</p>

<h3>The neighbour states</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="OSPF neighbour states">
<rect x="10" y="50" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="75" text-anchor="middle" class="svg-ink" font-size="12">Down</text>
<rect x="98" y="50" width="70" height="40" rx="8" fill="#fde68a"/><text x="133" y="75" text-anchor="middle" class="svg-ink" font-size="12">Init</text>
<rect x="186" y="50" width="70" height="40" rx="8" fill="#fde68a"/><text x="221" y="75" text-anchor="middle" class="svg-ink" font-size="12">2Way</text>
<rect x="274" y="50" width="80" height="40" rx="8" fill="#fed7aa"/><text x="314" y="75" text-anchor="middle" class="svg-ink" font-size="12">ExStart</text>
<rect x="372" y="50" width="90" height="40" rx="8" fill="#fed7aa"/><text x="417" y="75" text-anchor="middle" class="svg-ink" font-size="12">Exchange</text>
<rect x="480" y="50" width="80" height="40" rx="8" fill="#fed7aa"/><text x="520" y="75" text-anchor="middle" class="svg-ink" font-size="12">Loading</text>
<rect x="574" y="50" width="56" height="40" rx="8" fill="#bbf7d0"/><text x="602" y="75" text-anchor="middle" class="svg-ink" font-size="12">Full</text>
<text x="221" y="115" text-anchor="middle" class="svg-accent" font-size="12">DR/BDR election</text>
<text x="417" y="115" text-anchor="middle" class="svg-muted" font-size="12">DbD and LSRequest exchange</text>
</svg><p class="cap">Hellos get you to 2Way; the database exchange takes you to Full.</p></div>
<ol>
<li><b>Down</b>: no hello has been heard.</li>
<li><b>Init</b>: we heard a hello, but our router ID is not in its neighbour list yet.</li>
<li><b>2Way</b>: our router ID appears in the neighbour's hello, so communication is bidirectional. On a LAN the DR/BDR election happens now. Two DROthers stop here, which is correct.</li>
<li><b>ExStart</b>: the two routers choose a master and slave and agree the starting sequence number for the exchange.</li>
<li><b>Exchange</b>: <b>Database Description (DbD)</b> packets carry the LSA headers each router holds.</li>
<li><b>Loading</b>: <b>Link-State Request</b> packets ask for LSAs the router is missing; the reply is a Link-State Update, acknowledged by a Link-State Ack.</li>
<li><b>Full</b>: the databases are synchronised.</li>
</ol>
<p>Five OSPF packet types do all this: Hello, DbD, LSReq, LSUpdate and LSAck. The command <code>show ospf statistics</code> counts every one of them.</p>

<h3>What must match to reach 2Way</h3>
<p>A hello is silently dropped if any of these differ. The result is <b>no neighbour at all</b>, not a stuck neighbour:</p>
<table class="cmp"><tr><th>Item</th><th>Junos note</th></tr>
<tr><td>Area ID</td><td>both ends in the same area on that link</td></tr>
<tr><td>Hello and dead interval</td><td>defaults are 10 and 40 seconds</td></tr>
<tr><td>Subnet and mask</td><td>checked on broadcast links; not on point-to-point</td></tr>
<tr><td>Authentication type and key</td><td>simple, MD5 or HMAC must match exactly</td></tr>
<tr><td>Stub / NSSA flag (the E bit)</td><td>all routers in an area must agree</td></tr>
<tr><td>Router ID</td><td>must be unique; a duplicate causes flapping</td></tr></table>
<p>The statistics counters show the reason. In the two-region lab the R2-R3 link was given an MD5 key on R2 only. R3's hellos no longer matched and R2 counted:</p>
<pre class="out">lab@R2-AGRA&gt; show ospf statistics
Packet type             Total                  Last 5 seconds
                   Sent      Received        Sent      Received
        Hello        38            19           0             0
Receive errors:
      <span class="hl">19 authentication failures</span></pre>
<pre class="code">set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 authentication md5 1 key Sec3ret</pre>
<p>In the real show configuration the key is displayed as <code>## SECRET-DATA</code>; it is stored scrambled. Both ends must use the same key ID and the same key.</p>

<h3>The stuck states: ExStart and Exchange</h3>
<p>If hellos match but the database exchange cannot finish, the neighbour is stuck <b>after</b> 2Way. The classic cause is an <b>MTU mismatch</b>: a DbD packet is built for one MTU and the neighbour refuses it. In the Kochi lab, R4's ge-0/0/0 had MTU 9192 while R2 used the default:</p>
<pre class="out">lab@R2-KOCHI&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.2.0.1         ge-0/0/0.0             Full            10.255.2.1       128    32
10.2.24.2        ge-0/0/1.0             <span class="hl">ExStart</span>         10.255.2.4       128    31
lab@R2-KOCHI&gt; show ospf neighbor extensive
10.2.24.2        ge-0/0/1.0             ExStart         10.255.2.4       128    31
  Neighbor MTU 9178, local MTU 1500, Hello 10, Dead 40  &lt;- MTU mismatch
lab@R2-KOCHI&gt; show ospf statistics
Receive errors:
       1 MTU mismatch (database description)</pre>
<p>Notice that R4 sees the neighbour as <b>Exchange</b> while R2 sees <b>ExStart</b>: the two ends can disagree about the state. The fix is to make the MTUs equal, ideally by removing the non-standard setting (<code>delete interfaces ge-0/0/0 mtu</code>). The workaround <code>set protocols ospf area 0 interface ge-0/0/1.0 mtu-ignore</code> exists but hides a real design mismatch and should not be the first choice.</p>

<div class="eg"><p><b>Worked example.</b> A neighbour shows Init on R1 for a long time. R1 hears the neighbour's hellos but the neighbour never hears R1's, so the neighbour never lists R1's router ID. Check the path from R1: an ACL or firewall filter dropping protocol 89 outbound, a wrong subnet on one side, or a one-way link fault.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating every non-Full neighbour as a fault. Two DROthers in 2Way are healthy. Also, changing the MTU on only one end of a link, often on a data-centre uplink for jumbo frames, and forgetting the other end.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello/dead, area, authentication and the stub flag mismatches give <b>no neighbour</b>; an MTU mismatch gives a neighbour stuck in <b>ExStart or Exchange</b>. A duplicate router ID causes unstable adjacencies, not a clean refusal. Know the five packet types and in which state each is used.</p></div>

<div class="scn"><h4>Jumbo frames and the missing route</h4><p>A network team enabled 9192-byte MTU on one core interface for a storage project. The OSPF neighbour on that link stopped at ExStart, the backup path took over, and nobody noticed until a second link failed. The engineer found it with <code>show ospf neighbor extensive</code>, which printed both MTUs.</p><p><b>Lesson:</b> a half-formed neighbour is a silent outage waiting to happen. Put non-Full neighbours on your monitoring dashboard.</p></div>

<div class="iv"><p class="q">"An OSPF neighbour is stuck in ExStart. What do you check?"</p><p>First the MTU on both ends, because the DbD exchange is the step that fails: <code>show ospf neighbor extensive</code> shows both MTUs and <code>show ospf statistics</code> counts MTU mismatch errors. Then duplicate router IDs and any filter dropping unicast OSPF packets, since DbD is sent unicast after 2Way. Mention that hello, area or authentication problems never reach ExStart.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>Area, timers, subnet, authentication and stub flag must match for hellos to be accepted.</li>
<li>MTU mismatch leaves a neighbour in ExStart or Exchange.</li>
<li><code>show ospf neighbor extensive</code> and <code>show ospf statistics</code> reveal the reason.</li>
<li>DROthers staying in 2Way is normal.</li>
</ul></div>
`,hi:`
<p>Conference mein do log milte hain to kuch steps hote hain: ek doosre ko notice karte hain, check karte hain ki doosre ne bhi notice kiya, tay karte hain pehle kaun bolega, business cards badalte hain, aur jo card missing ho wo maangte hain. OSPF neighbours bhi aisa hi karte hain, aur har step ka naam hai, ek <b>neighbour state</b>. Aap state padh lo to pata chal jaata hai ki kaun sa step fail hua aur kya check karna hai.</p>

<h3>Neighbour states</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="OSPF neighbour states">
<rect x="10" y="50" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="45" y="75" text-anchor="middle" class="svg-ink" font-size="12">Down</text>
<rect x="98" y="50" width="70" height="40" rx="8" fill="#fde68a"/><text x="133" y="75" text-anchor="middle" class="svg-ink" font-size="12">Init</text>
<rect x="186" y="50" width="70" height="40" rx="8" fill="#fde68a"/><text x="221" y="75" text-anchor="middle" class="svg-ink" font-size="12">2Way</text>
<rect x="274" y="50" width="80" height="40" rx="8" fill="#fed7aa"/><text x="314" y="75" text-anchor="middle" class="svg-ink" font-size="12">ExStart</text>
<rect x="372" y="50" width="90" height="40" rx="8" fill="#fed7aa"/><text x="417" y="75" text-anchor="middle" class="svg-ink" font-size="12">Exchange</text>
<rect x="480" y="50" width="80" height="40" rx="8" fill="#fed7aa"/><text x="520" y="75" text-anchor="middle" class="svg-ink" font-size="12">Loading</text>
<rect x="574" y="50" width="56" height="40" rx="8" fill="#bbf7d0"/><text x="602" y="75" text-anchor="middle" class="svg-ink" font-size="12">Full</text>
<text x="221" y="115" text-anchor="middle" class="svg-accent" font-size="12">DR/BDR election</text>
<text x="417" y="115" text-anchor="middle" class="svg-muted" font-size="12">DbD aur LSRequest exchange</text>
</svg><p class="cap">Hellos 2Way tak le jaate hain; database exchange Full tak.</p></div>
<ol>
<li><b>Down</b>: koi hello nahi suna.</li>
<li><b>Init</b>: hello suna, par hamara router ID abhi uski neighbour list mein nahi hai.</li>
<li><b>2Way</b>: neighbour ke hello mein hamara router ID dikhta hai, matlab communication bidirectional hai. LAN par DR/BDR election ab hota hai. Do DROthers yahin ruk jaate hain, jo sahi hai.</li>
<li><b>ExStart</b>: dono routers master aur slave chunte hain aur exchange ka starting sequence number tay karte hain.</li>
<li><b>Exchange</b>: <b>Database Description (DbD)</b> packets har router ke paas jo LSA headers hain wo le jaate hain.</li>
<li><b>Loading</b>: <b>Link-State Request</b> packets missing LSAs maangte hain; jawab Link-State Update hota hai, jise Link-State Ack acknowledge karta hai.</li>
<li><b>Full</b>: databases synchronised hain.</li>
</ol>
<p>Yeh sab paanch OSPF packet types karte hain: Hello, DbD, LSReq, LSUpdate aur LSAck. <code>show ospf statistics</code> inme se har ek ko ginta hai.</p>

<h3>2Way tak pahunchne ke liye kya match hona chahiye</h3>
<p>In mein se kuch bhi alag ho to hello chupchaap drop ho jaata hai. Result <b>koi neighbour hi nahi</b> hota, atka hua neighbour nahi:</p>
<table class="cmp"><tr><th>Item</th><th>Junos note</th></tr>
<tr><td>Area ID</td><td>us link par dono taraf same area</td></tr>
<tr><td>Hello aur dead interval</td><td>defaults 10 aur 40 seconds hain</td></tr>
<tr><td>Subnet aur mask</td><td>broadcast links par check hota hai; point-to-point par nahi</td></tr>
<tr><td>Authentication type aur key</td><td>simple, MD5 ya HMAC bilkul match karna chahiye</td></tr>
<tr><td>Stub / NSSA flag (E bit)</td><td>area ke saare routers ek jaise hon</td></tr>
<tr><td>Router ID</td><td>unique hona chahiye; duplicate flapping karata hai</td></tr></table>
<p>Statistics counters wajah dikhate hain. Do-region lab mein R2-R3 link par sirf R2 par MD5 key lagayi gayi. R3 ke hellos match nahi hue aur R2 ne ginna shuru kiya:</p>
<pre class="out">lab@R2-AGRA&gt; show ospf statistics
Packet type             Total                  Last 5 seconds
                   Sent      Received        Sent      Received
        Hello        38            19           0             0
Receive errors:
      <span class="hl">19 authentication failures</span></pre>
<pre class="code">set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 authentication md5 1 key Sec3ret</pre>
<p>Real show configuration mein key <code>## SECRET-DATA</code> dikhti hai; wo scrambled store hoti hai. Dono taraf same key ID aur same key honi chahiye.</p>

<h3>Atke hue states: ExStart aur Exchange</h3>
<p>Agar hellos match ho jaayein par database exchange poora na ho, to neighbour 2Way ke <b>baad</b> atakta hai. Classic wajah <b>MTU mismatch</b> hai: DbD packet ek MTU ke hisaab se banta hai aur neighbour use refuse kar deta hai. Kochi lab mein R4 ke ge-0/0/0 ka MTU 9192 tha jabki R2 default par tha:</p>
<pre class="out">lab@R2-KOCHI&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.2.0.1         ge-0/0/0.0             Full            10.255.2.1       128    32
10.2.24.2        ge-0/0/1.0             <span class="hl">ExStart</span>         10.255.2.4       128    31
lab@R2-KOCHI&gt; show ospf neighbor extensive
10.2.24.2        ge-0/0/1.0             ExStart         10.255.2.4       128    31
  Neighbor MTU 9178, local MTU 1500, Hello 10, Dead 40  &lt;- MTU mismatch
lab@R2-KOCHI&gt; show ospf statistics
Receive errors:
       1 MTU mismatch (database description)</pre>
<p>Dhyan do ki R4 neighbour ko <b>Exchange</b> mein dekhta hai jabki R2 <b>ExStart</b> mein: dono ends state par alag-alag ho sakte hain. Fix hai MTUs barabar karna, behtar hai ki non-standard setting hata do (<code>delete interfaces ge-0/0/0 mtu</code>). Workaround <code>set protocols ospf area 0 interface ge-0/0/1.0 mtu-ignore</code> maujood hai, par ye asli design mismatch chhupata hai aur pehli choice nahi hona chahiye.</p>

<div class="eg"><p><b>Worked example.</b> R1 par ek neighbour bahut der tak Init dikhata hai. R1 neighbour ke hellos sunta hai par neighbour R1 ke hellos kabhi nahi sunta, isliye neighbour R1 ka router ID kabhi list nahi karta. R1 se jaane wale path ko check karo: protocol 89 outbound drop karta ACL ya firewall filter, ek taraf galat subnet, ya one-way link fault.</p></div>

<div class="warn"><p><b>Common mistake.</b> Har non-Full neighbour ko fault maan lena. 2Way mein do DROthers healthy hain. Saath hi, link ke sirf ek end par MTU badalna, aksar data-centre uplink par jumbo frames ke liye, aur doosra end bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hello/dead, area, authentication aur stub flag mismatch se <b>koi neighbour nahi</b> banta; MTU mismatch se neighbour <b>ExStart ya Exchange</b> mein atakta hai. Duplicate router ID unstable adjacencies deta hai, saaf refusal nahi. Paanch packet types jaano aur kaun sa kis state mein use hota hai.</p></div>

<div class="scn"><h4>Jumbo frames aur gaayab route</h4><p>Network team ne storage project ke liye ek core interface par 9192-byte MTU enable kiya. Us link ka OSPF neighbour ExStart par ruk gaya, backup path ne kaam sambhala, aur kisi ko pata nahi chala jab tak doosra link fail nahi hua. Engineer ne ise <code>show ospf neighbor extensive</code> se pakda, jo dono MTU print karta hai.</p><p><b>Lesson:</b> aadha bana neighbour chupa hua outage hai. Non-Full neighbours ko monitoring dashboard par rakho.</p></div>

<div class="iv"><p class="q">"OSPF neighbour ExStart mein atka hai. Aap kya check karoge?"</p><p>Pehle dono ends par MTU, kyunki DbD exchange wahi step hai jo fail hota hai: <code>show ospf neighbor extensive</code> dono MTU dikhata hai aur <code>show ospf statistics</code> MTU mismatch errors ginta hai. Phir duplicate router IDs aur koi filter jo unicast OSPF packets drop karta ho, kyunki 2Way ke baad DbD unicast jaata hai. Batao ki hello, area ya authentication problems kabhi ExStart tak nahi pahunchte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Down, Init, 2Way, ExStart, Exchange, Loading, Full.</li>
<li>Hellos accept hone ke liye area, timers, subnet, authentication aur stub flag match hone chahiye.</li>
<li>MTU mismatch neighbour ko ExStart ya Exchange mein rok deta hai.</li>
<li><code>show ospf neighbor extensive</code> aur <code>show ospf statistics</code> wajah dikhate hain.</li>
<li>DROthers ka 2Way mein rehna normal hai.</li>
</ul></div>
`}};export{e as default};