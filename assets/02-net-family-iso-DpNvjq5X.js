var e={id:`net-family-iso`,h:{en:`NET, family iso and the first adjacency on Junos`,hi:`NET, family iso aur Junos par pehli adjacency`},body:{en:`
<p><b>IS-IS does not run on IP.</b> It runs directly on the data link layer using the ISO CLNS protocol family. That is why a Junos interface needs <code>family iso</code> in addition to <code>family inet</code>. IP prefixes are carried inside IS-IS as data (TLVs), but the neighbours talk using ISO frames. An interface without <code>family iso</code> is silently skipped, even if you list it under <code>protocols isis</code>. This is the most common Junos IS-IS mistake.</p>
<h3>The NET lives on lo0</h3>
<p>The <b>Network Entity Title (NET)</b> is the router's IS-IS address. Our lab uses <code>49.0300.0000.0000.0011.00</code> for JR1. Read it from left to right: <b>49</b> is the authority and format identifier (a private area), <b>0300</b> is the area, <b>0000.0000.0011</b> is the six-byte <b>system ID</b> (unique per router), and <b>00</b> is the NSEL, always 00 for a router. On Junos you configure the NET as an ISO address on lo0, not under <code>protocols isis</code>. Every router in the domain needs a unique system ID. Within a level-2 core all routers can share one area value, here 49.0300.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">49</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">AFI</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">0300</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">area</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">0000.0000.0011</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">system ID</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">00</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text></svg><p class="cap">Anatomy of the JR1 NET.</p></div>
<h3>Building the configuration on JR1</h3>
<p>These are the commands the lab solution uses on JR1 (they were run in the simulator). Addresses were already configured: ge-0/0/0 is 10.30.1.11/24 toward R1 and ge-0/0/1 is 10.30.2.11/24 toward JR2.</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family iso
set interfaces ge-0/0/1 unit 0 family iso
set interfaces lo0 unit 0 family iso address 49.0300.0000.0000.0011.00
set protocols isis interface ge-0/0/0.0 point-to-point
set protocols isis interface ge-0/0/1.0 point-to-point
set protocols isis interface lo0.0 passive
set protocols isis level 1 disable
set protocols isis level 2 wide-metrics-only
commit</pre>
<ul><li><code>family iso</code> on each core unit enables ISO frames. The ISO address on lo0 is the NET.</li>
<li><code>point-to-point</code> tells Junos the link has only two routers, so no DIS election is needed (chapter 3).</li>
<li><code>lo0.0 passive</code> advertises the loopback prefix without sending hellos on it.</li>
<li><code>level 1 disable</code> and <code>wide-metrics-only</code> are explained in chapters 3 and 4.</li></ul>
<h3>Verifying the first adjacencies</h3>
<p>This is the real output captured from JR1 in the simulator after both Juniper routers and R1 were configured:</p>
<pre class="out">JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   25
<span class="hl">ge-0/0/1.0            JR2            2 Up                   21</span></pre>
<p>Each line is one adjacency. <b>L 2</b> means a level-2 adjacency, <b>State Up</b> means the three-way handshake finished. R1 is shown by its hostname because IS-IS carries a dynamic hostname. On R1 (IOS) the same adjacency looks like this:</p>
<pre class="out">R1# show isis neighbors

Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
<span class="hl">JR1             L2   Gi0/0         10.30.1.11      UP    23       00</span></pre>
<div class="eg"><p><b>Worked example.</b> The NET for JR2 is 49.0300.0000.0000.0012.00. Compare with JR1: same AFI and area, system ID ends in 0012 instead of 0011. If both routers were given 0011 by mistake, the database would hold one LSP for two routers and routing would behave erratically.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting family iso on one end. The other end sends hellos but the Junos router never answers, so there is no adjacency and no obvious error. Also, remember that a NET on an interface instead of lo0 works in IOS but not as the Junos design.</p></div>
<div class="exam"><p><b>Exam trap.</b> On Junos the NET is an ISO address under <code>interfaces lo0 unit 0 family iso</code>. IS-IS only runs on interfaces that have family iso. The system ID must be unique; the last byte (NSEL) is 00.</p></div>
<div class="scn"><h4>Listed but not running</h4><p>An engineer added ge-0/0/2.0 under protocols isis but the interface never appeared in show isis interface. The cause was a missing family iso on unit 0. After adding it and committing, the interface appeared and the adjacency formed.</p><p><b>Lesson:</b> No family iso, no IS-IS: Junos skips such interfaces silently.</p></div>
<div class="iv"><p class="q">"How do you configure IS-IS on a Junos router?"</p><p>Enable family iso on each IS-IS unit, put the NET as a family iso address on lo0, list the interfaces under protocols isis (point-to-point for core links, lo0 passive), and choose the levels. I verify with show isis adjacency and show isis interface.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IS-IS runs on ISO CLNS, so Junos needs family iso on each unit.</li>
<li>The NET is an ISO address on lo0; the system ID must be unique.</li>
<li>A NET reads AFI.area.system-ID.NSEL.</li>
<li>show isis adjacency confirms level and state.</li>
<li>Passive on lo0 advertises without hellos.</li></ul></div>
`,hi:`
<p><b>IS-IS IP par nahi chalta.</b> Yeh seedha data link layer par ISO CLNS protocol family use karke chalta hai. Isliye Junos interface ko <code>family inet</code> ke alawa <code>family iso</code> bhi chahiye. IP prefixes IS-IS ke andar data (TLVs) ki tarah jaate hain, par neighbours ISO frames se baat karte hain. <code>family iso</code> ke bina interface chupchap skip ho jaata hai, chahe aap use <code>protocols isis</code> mein list karo. Yeh Junos IS-IS ki sabse common galti hai.</p>
<h3>NET lo0 par hota hai</h3>
<p><b>Network Entity Title (NET)</b> router ka IS-IS address hai. Hamara lab JR1 ke liye <code>49.0300.0000.0000.0011.00</code> use karta hai. Ise left se right padho: <b>49</b> authority aur format identifier (private area), <b>0300</b> area, <b>0000.0000.0011</b> six-byte <b>system ID</b> (har router ke liye unique), aur <b>00</b> NSEL, router ke liye hamesha 00. Junos par NET ko lo0 par ISO address ki tarah configure karte hain, <code>protocols isis</code> ke neeche nahi. Domain ke har router ko unique system ID chahiye. Level-2 core mein saare routers ek hi area value, yahan 49.0300, share kar sakte hain.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">49</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">AFI</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">0300</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">area</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">0000.0000.0011</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">system ID</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">00</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">NSEL</text></svg><p class="cap">JR1 NET ki anatomy.</p></div>
<h3>JR1 par configuration banana</h3>
<p>Yeh woh commands hain jo lab solution JR1 par use karta hai (simulator mein chalaye gaye). Addresses pehle se configured the: ge-0/0/0 R1 ki taraf 10.30.1.11/24 aur ge-0/0/1 JR2 ki taraf 10.30.2.11/24 hai.</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family iso
set interfaces ge-0/0/1 unit 0 family iso
set interfaces lo0 unit 0 family iso address 49.0300.0000.0000.0011.00
set protocols isis interface ge-0/0/0.0 point-to-point
set protocols isis interface ge-0/0/1.0 point-to-point
set protocols isis interface lo0.0 passive
set protocols isis level 1 disable
set protocols isis level 2 wide-metrics-only
commit</pre>
<ul><li>Har core unit par <code>family iso</code> ISO frames enable karta hai. lo0 par ISO address NET hai.</li>
<li><code>point-to-point</code> Junos ko batata hai ki link par sirf do routers hain, isliye DIS election nahi chahiye (chapter 3).</li>
<li><code>lo0.0 passive</code> loopback prefix advertise karta hai par us par hellos nahi bhejta.</li>
<li><code>level 1 disable</code> aur <code>wide-metrics-only</code> chapters 3 aur 4 mein explain hain.</li></ul>
<h3>Pehli adjacencies verify karna</h3>
<p>Yeh real output hai jo simulator mein JR1 se capture kiya gaya jab dono Juniper routers aur R1 configured the:</p>
<pre class="out">JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 Up                   25
<span class="hl">ge-0/0/1.0            JR2            2 Up                   21</span></pre>
<p>Har line ek adjacency hai. <b>L 2</b> ka matlab level-2 adjacency, <b>State Up</b> ka matlab three-way handshake poora hua. R1 apne hostname se dikhta hai kyunki IS-IS dynamic hostname carry karta hai. R1 (IOS) par wahi adjacency aisi dikhti hai:</p>
<pre class="out">R1# show isis neighbors

Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
<span class="hl">JR1             L2   Gi0/0         10.30.1.11      UP    23       00</span></pre>
<div class="eg"><p><b>Worked example.</b> JR2 ka NET 49.0300.0000.0000.0012.00 hai. JR1 se compare karo: same AFI aur area, system ID 0011 ke bajay 0012 par khatam. Agar galti se dono ko 0011 mil jaye to database mein do routers ke liye ek LSP hota aur routing erratic behave karti.</p></div>
<div class="warn"><p><b>Common mistake.</b> Ek end par family iso bhool jaana. Doosra end hellos bhejta hai par Junos router kabhi jawab nahi deta, isliye adjacency nahi banti aur koi saaf error nahi dikhta. Yaad rakho ki interface par NET IOS mein chalta hai par Junos design mein nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos par NET <code>interfaces lo0 unit 0 family iso</code> ke neeche ISO address hai. IS-IS sirf un interfaces par chalta hai jinpar family iso ho. System ID unique honi chahiye; aakhri byte (NSEL) 00 hoti hai.</p></div>
<div class="scn"><h4>Listed par chal nahi raha</h4><p>Engineer ne protocols isis ke neeche ge-0/0/2.0 joda par interface show isis interface mein kabhi nahi dikha. Karan unit 0 par family iso missing tha. Use jodne aur commit karne ke baad interface dikha aur adjacency ban gayi.</p><p><b>Lesson:</b> family iso nahi to IS-IS nahi: Junos aise interfaces ko chupchap skip karta hai.</p></div>
<div class="iv"><p class="q">"Junos router par IS-IS kaise configure karte ho?"</p><p>Har IS-IS unit par family iso enable karta hoon, NET ko lo0 par family iso address ki tarah lagata hoon, interfaces ko protocols isis ke neeche list karta hoon (core links ke liye point-to-point, lo0 passive), aur levels chunta hoon. show isis adjacency aur show isis interface se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IS-IS ISO CLNS par chalta hai, isliye Junos ko har unit par family iso chahiye.</li>
<li>NET lo0 par ISO address hai; system ID unique honi chahiye.</li>
<li>NET aise padhte hain: AFI.area.system-ID.NSEL.</li>
<li>show isis adjacency level aur state confirm karta hai.</li>
<li>lo0 par passive hellos ke bina advertise karta hai.</li></ul></div>
`}};export{e as default};