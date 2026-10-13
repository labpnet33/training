var e={id:`steering-the-tree`,h:{en:`Steering the tree: bridge-priority, cost and port priority (Lab 1)`,hi:`Tree ko steer karna: bridge-priority, cost aur port priority (Lab 1)`},body:{en:`
<p>A good engineer does not leave traffic paths to chance. In a campus the root bridge should be in the middle, on the strongest switches, and the backup root right next to it. Think of choosing the capital of a country: it should be central, well connected and have a deputy ready. In this chapter you place the root with <code>bridge-priority</code>, change path preference with <code>cost</code>, and break last-resort ties with port <code>priority</code>. Then we do Lab 1 step by step.</p>

<h3>Rule 1: place the root with bridge-priority</h3>
<pre class="code">set protocols rstp bridge-priority 4k      <span class="c"># primary root: DSW1</span>
set protocols rstp bridge-priority 8k      <span class="c"># backup root: DSW2</span></pre>
<p>Lower is better. 4k is 4096; 8k is 8192. You can use 0 for the primary, but keeping 4k leaves room to out-vote a rogue switch later. Access switches stay at the default 32768 so that they can never win. A common standard is: primary 4k, secondary 8k, everything else default.</p>

<h3>Rule 2: steer a path with cost</h3>
<p>A non-root switch chooses the root port by lowest total path cost. To make a link less attractive, raise its cost; to prefer it, lower the cost on the receiving side.</p>
<pre class="code">set protocols rstp interface ge-0/0/1 cost 40000       <span class="c"># less attractive</span>
delete protocols rstp interface ge-0/0/1 cost          <span class="c"># back to automatic cost</span></pre>
<p>Cost is added to a BPDU on the port where it is <i>received</i>, so you configure it on the switch that must choose the path, not on the sender.</p>

<h3>Rule 3: port priority for exact ties</h3>
<p>When two links to the same neighbour have identical cost (for example two parallel cables not in a LAG), the tie is broken by the sender's port ID. Port priority is a multiple of 16 from 0 to 240, default 128; lower wins:</p>
<pre class="code">set protocols rstp interface ge-0/0/0 priority 64</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 target tree">
<rect x="60" y="20" width="170" height="54" rx="10" fill="#fde68a"/><text x="145" y="43" text-anchor="middle" class="svg-ink" font-size="13">DSW1 priority 4k</text><text x="145" y="62" text-anchor="middle" class="svg-muted" font-size="11">primary root</text>
<rect x="410" y="20" width="170" height="54" rx="10" fill="#bae6fd"/><text x="495" y="43" text-anchor="middle" class="svg-ink" font-size="13">DSW2 priority 8k</text><text x="495" y="62" text-anchor="middle" class="svg-muted" font-size="11">backup root</text>
<rect x="235" y="150" width="170" height="54" rx="10" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2 default</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/2 edge to PC1</text>
<line x1="230" y1="47" x2="410" y2="47" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="74" x2="290" y2="150" stroke="#64748b" stroke-width="3"/>
<line x1="470" y1="74" x2="350" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="195" y="125" class="svg-accent" font-size="12">ROOT / FWD</text><text x="400" y="125" class="svg-muted" font-size="12">ALT / BLK</text>
</svg><p class="cap">Lab 1 target: FLOOR2 reaches the root straight through DSW1; the DSW2 uplink is the standby.</p></div>

<h3>Lab 1 walkthrough: the Noida floor</h3>
<p><b>Step 1: who is the root now?</b> The first task asks for the host name. On FLOOR2 the Root ID equals its own Bridge ID (<code>32768.52:54:00:a7:71:00</code>), so FLOOR2 is the root. Answer: <b>FLOOR2</b>.</p>
<p><b>Step 2: set priorities.</b></p>
<pre class="code">DSW1&gt; configure
DSW1# set protocols rstp bridge-priority 4k
DSW1# commit and-quit

DSW2&gt; configure
DSW2# set protocols rstp bridge-priority 8k
DSW2# commit and-quit</pre>
<p><b>Step 3: verify roles on FLOOR2</b> after a few seconds:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.5254c6fcd000    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  BLK    <span class="hl">ALT</span>
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  FWD    DESG

lab@FLOOR2&gt; show spanning-tree bridge
  Root ID                           : 4096.52:54:c6:fc:d0:00
  Root cost                         : <span class="hl">20000</span>
  Root port                         : ge-0/0/0
  Local parameters
    Bridge ID                       : 32768.52:54:00:a7:71:00</pre>
<p>FLOOR2 now forwards through DSW1 (ge-0/0/0 is ROOT) and keeps ge-0/0/1 as ALT. The root cost is 20000, the cost of one 1 Gbit/s hop, which answers the last lab question.</p>
<p><b>Step 4: mark the PC port as edge, then confirm PC1 reaches its gateway.</b></p>
<pre class="code">FLOOR2# set protocols rstp interface ge-0/0/2 edge
FLOOR2# commit and-quit

PC1&gt; ping 10.3.30.1
84 bytes from 10.3.30.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>The ping shows TTL 64: PC1 and the gateway irb.30 on DSW1 are in the same VLAN, so no routing happens between them.</p>

<div class="eg"><p><b>Worked example: predict before you configure.</b> After priorities 4k and 8k, DSW1 is the root and every DSW1 port is designated. DSW2 has two paths to the root: directly (cost 20000) and via FLOOR2 (40000), so its root port is ge-0/0/0 towards DSW1. FLOOR2 has the same two choices (20000 direct, 40000 via DSW2), so its root port is the DSW1-facing port. The remaining FLOOR2 uplink, towards DSW2, is the one that must block, and RSTP puts the block on FLOOR2's port because DSW2's port is the designated one on that link (8192 beats 32768).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing cost on the wrong switch (it must be on the receiving side). Setting the same priority on both distribution switches so the MAC again decides. Raising a priority on an access switch "to make it root" when you meant the distribution switch. Forgetting to commit one of the two switches.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the order again: root bridge ID first, then root path cost, then sender bridge ID, then sender port ID. A question may give two equal-cost paths and ask which wins: look at the neighbour's bridge ID, then the port ID.</p></div>

<div class="scn"><h4>The uplink that never got used</h4><p>Management complained that a 10 Gbit/s uplink between two core switches idled while a 1 Gbit/s path carried all traffic. Someone had set a manual cost of 100 on the 1 Gbit/s link long ago. Manual costs are overridden by nothing: they won against the automatic 2000 of the faster link. Deleting the manual cost let RSTP choose the fast link.</p><p><b>Lesson:</b> audit manual costs, and prefer <code>delete</code> over new numbers when you want automatic behaviour.</p></div>

<div class="iv"><p class="q">"How do you make sure a specific switch becomes the root, and a specific uplink is preferred?"</p><p>Set <code>bridge-priority 4k</code> on the intended root and 8k on its backup, leave access switches at default. Steer an uplink with <code>cost</code> on the switch that makes the choice, and use port priority only to break equal-cost ties. Verify with <code>show spanning-tree bridge</code> and <code>show spanning-tree interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lowest bridge-priority wins the root election: use 4k and 8k for primary and backup.</li>
<li>Cost steers the root port choice; configure it on the receiving switch.</li>
<li>Port priority (multiples of 16, default 128) breaks equal-cost ties.</li>
<li>Predict the tree by adding costs, then verify with show commands.</li>
<li>Declare host ports as edge ports.</li>
</ul></div>
`,hi:`
<p>Achha engineer traffic paths ko chance par nahi chhodta. Campus mein root bridge beech mein hona chahiye, sabse strong switches par, aur backup root uske bagal mein. Socho kisi desh ki rajdhani chunna: woh central ho, achhi tarah juda ho aur uska deputy taiyaar ho. Is chapter mein aap <code>bridge-priority</code> se root rakhte ho, <code>cost</code> se path preference badalte ho, aur port <code>priority</code> se aakhri ties todte ho. Phir hum Lab 1 step by step karte hain.</p>

<h3>Rule 1: bridge-priority se root rakho</h3>
<pre class="code">set protocols rstp bridge-priority 4k      <span class="c"># primary root: DSW1</span>
set protocols rstp bridge-priority 8k      <span class="c"># backup root: DSW2</span></pre>
<p>Chhota behtar hai. 4k matlab 4096; 8k matlab 8192. Primary ke liye 0 bhi use kar sakte ho, lekin 4k rakhne se baad mein rogue switch ko out-vote karne ki jagah bachti hai. Access switches default 32768 par rehte hain taaki woh kabhi jeet na sakein. Common standard hai: primary 4k, secondary 8k, baaki sab default.</p>

<h3>Rule 2: cost se path steer karo</h3>
<p>Non-root switch sabse kam total path cost se root port chunta hai. Link ko kam attractive banana ho to uska cost badhao; prefer karna ho to receiving side par cost ghatao.</p>
<pre class="code">set protocols rstp interface ge-0/0/1 cost 40000       <span class="c"># kam attractive</span>
delete protocols rstp interface ge-0/0/1 cost          <span class="c"># automatic cost wapas</span></pre>
<p>Cost BPDU mein us port par jodta hai jahan woh <i>receive</i> hota hai, isliye cost us switch par configure karo jo path chunta hai, sender par nahi.</p>

<h3>Rule 3: exact ties ke liye port priority</h3>
<p>Ek hi neighbour ke do links ka cost bilkul barabar ho (jaise do parallel cables jo LAG mein nahi hain), to tie sender ke port ID se tootta hai. Port priority 0 se 240 tak 16 ka multiple hai, default 128; chhota jeetta hai:</p>
<pre class="code">set protocols rstp interface ge-0/0/0 priority 64</pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 target tree">
<rect x="60" y="20" width="170" height="54" rx="10" fill="#fde68a"/><text x="145" y="43" text-anchor="middle" class="svg-ink" font-size="13">DSW1 priority 4k</text><text x="145" y="62" text-anchor="middle" class="svg-muted" font-size="11">primary root</text>
<rect x="410" y="20" width="170" height="54" rx="10" fill="#bae6fd"/><text x="495" y="43" text-anchor="middle" class="svg-ink" font-size="13">DSW2 priority 8k</text><text x="495" y="62" text-anchor="middle" class="svg-muted" font-size="11">backup root</text>
<rect x="235" y="150" width="170" height="54" rx="10" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2 default</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">PC1 tak ge-0/0/2 edge</text>
<line x1="230" y1="47" x2="410" y2="47" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="74" x2="290" y2="150" stroke="#64748b" stroke-width="3"/>
<line x1="470" y1="74" x2="350" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="195" y="125" class="svg-accent" font-size="12">ROOT / FWD</text><text x="400" y="125" class="svg-muted" font-size="12">ALT / BLK</text>
</svg><p class="cap">Lab 1 target: FLOOR2 DSW1 ke through seedha root tak pahunche; DSW2 wala uplink standby hai.</p></div>

<h3>Lab 1 walkthrough: Noida floor</h3>
<p><b>Step 1: abhi root kaun hai?</b> Pehla task host name poochta hai. FLOOR2 par Root ID uske apne Bridge ID (<code>32768.52:54:00:a7:71:00</code>) ke barabar hai, yaani FLOOR2 root hai. Jawab: <b>FLOOR2</b>.</p>
<p><b>Step 2: priorities set karo.</b></p>
<pre class="code">DSW1&gt; configure
DSW1# set protocols rstp bridge-priority 4k
DSW1# commit and-quit

DSW2&gt; configure
DSW2# set protocols rstp bridge-priority 8k
DSW2# commit and-quit</pre>
<p><b>Step 3: FLOOR2 par roles verify karo</b>, kuch seconds baad:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.5254c6fcd000    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  BLK    <span class="hl">ALT</span>
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  FWD    DESG

lab@FLOOR2&gt; show spanning-tree bridge
  Root ID                           : 4096.52:54:c6:fc:d0:00
  Root cost                         : <span class="hl">20000</span>
  Root port                         : ge-0/0/0
  Local parameters
    Bridge ID                       : 32768.52:54:00:a7:71:00</pre>
<p>FLOOR2 ab DSW1 ke through forward karta hai (ge-0/0/0 ROOT) aur ge-0/0/1 ko ALT rakhta hai. Root cost 20000 hai, ek 1 Gbit/s hop ka cost, jo lab ke aakhri sawaal ka jawab hai.</p>
<p><b>Step 4: PC port ko edge mark karo, phir confirm karo ki PC1 apne gateway tak pahunchta hai.</b></p>
<pre class="code">FLOOR2# set protocols rstp interface ge-0/0/2 edge
FLOOR2# commit and-quit

PC1&gt; ping 10.3.30.1
84 bytes from 10.3.30.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Ping TTL 64 dikhata hai: PC1 aur DSW1 ka gateway irb.30 same VLAN mein hain, isliye unke beech routing nahi hui.</p>

<div class="eg"><p><b>Worked example: configure se pehle predict karo.</b> Priorities 4k aur 8k ke baad DSW1 root hai aur DSW1 ke saare ports designated hain. DSW2 ke root tak do paths hain: seedha (cost 20000) aur FLOOR2 ke through (40000), isliye uska root port DSW1 ki taraf ge-0/0/0 hai. FLOOR2 ke paas wahi do choices hain (20000 seedha, 40000 DSW2 ke through), isliye uska root port DSW1-facing port hai. FLOOR2 ka bacha hua uplink, DSW2 ki taraf wala, block hona chahiye, aur RSTP block FLOOR2 ke port par lagata hai kyunki us link par DSW2 ka port designated hai (8192, 32768 ko harata hai).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Cost galat switch par badalna (woh receiving side par hona chahiye). Dono distribution switches par same priority rakhna taaki MAC phir faisla kare. Distribution switch ki jagah access switch par priority badhana "use root banane ke liye". Do switches mein se ek par commit bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order phir yaad rakho: pehle root bridge ID, phir root path cost, phir sender bridge ID, phir sender port ID. Question do barabar-cost paths de sakta hai aur poochta hai kaunsa jeetega: neighbour ka bridge ID dekho, phir port ID.</p></div>

<div class="scn"><h4>Uplink jo kabhi use nahi hua</h4><p>Management ne shikayat ki ki do core switches ke beech 10 Gbit/s uplink khali pada hai jabki 1 Gbit/s path saara traffic le raha hai. Kisi ne bahut pehle 1 Gbit/s link par manual cost 100 set kiya tha. Manual cost ko koi override nahi karta: woh tez link ke automatic 2000 se jeet gaya. Manual cost delete karne se RSTP ne tez link chun liya.</p><p><b>Lesson:</b> manual costs ka audit karo, aur automatic behaviour chahiye to naye numbers ki jagah <code>delete</code> karo.</p></div>

<div class="iv"><p class="q">"Kaise pakka karte ho ki koi specific switch root bane aur koi specific uplink prefer ho?"</p><p>Intended root par <code>bridge-priority 4k</code> aur uske backup par 8k set karo, access switches default par rakho. Uplink ko us switch par <code>cost</code> se steer karo jo choice karta hai, aur port priority sirf equal-cost ties todne ke liye use karo. <code>show spanning-tree bridge</code> aur <code>show spanning-tree interface</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sabse kam bridge-priority root election jeetti hai: primary aur backup ke liye 4k aur 8k.</li>
<li>Cost root port choice ko steer karta hai; receiving switch par configure karo.</li>
<li>Port priority (16 ka multiple, default 128) equal-cost ties todti hai.</li>
<li>Costs jodkar tree predict karo, phir show commands se verify karo.</li>
<li>Host ports ko edge ports declare karo.</li>
</ul></div>
`}};export{e as default};