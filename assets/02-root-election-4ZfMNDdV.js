var e={id:`root-election`,h:{en:`Bridge IDs, BPDUs and electing the root bridge`,hi:`Bridge IDs, BPDUs aur root bridge ka chunav`},body:{en:`
<p>Every tree needs a trunk. In spanning tree the trunk is the <b>root bridge</b>: one switch that every other switch measures its paths against. Think of a school election. Every switch announces "I am the candidate", each candidate carries a number, and the lowest number wins. This chapter explains the number (the bridge ID), the messages (BPDUs) and the rules that turn the election result into a loop-free tree.</p>

<h3>The bridge ID</h3>
<p>A <b>bridge ID</b> is 8 bytes: a 4-bit <b>priority</b>, a 12-bit <b>extended system ID</b> (the instance or VLAN number, 0 in plain RSTP) and the 48-bit <b>MAC address</b> of the switch. In practice you see it written as priority, a dot, then the MAC. The Junos default priority is <b>32768</b>. You can change it in steps of <b>4096</b>: 0, 4k, 8k, 12k ... 60k. The <b>lowest bridge ID wins</b>. When priorities are equal the lowest MAC address decides, which usually means the oldest switch. That is rarely the switch you want, so you always set the priority yourself.</p>
<p>Junos also accepts abbreviations: <code>4k</code> means 4096 and <code>8k</code> means 8192.</p>

<h3>BPDUs: how switches talk</h3>
<p>Switches exchange <b>BPDUs</b> (bridge protocol data units), small Layer 2 multicast frames sent to a reserved MAC address so that no switch forwards them. A BPDU carries:</p>
<ul>
<li>the <b>root bridge ID</b> the sender believes in,</li>
<li>the sender's <b>root path cost</b> (cost of its path to the root),</li>
<li>the sender's own <b>bridge ID</b> and <b>port ID</b>,</li>
<li>timers (hello 2 seconds, max-age 20 seconds, forward delay 15 seconds).</li>
</ul>
<p>At start-up every switch claims to be the root. When it hears a BPDU with a lower root bridge ID, it accepts the better root and stops claiming. After a few BPDU exchanges everyone agrees.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Noida topology and root election">
<rect x="60" y="20" width="150" height="50" rx="10" fill="#fde68a"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="135" y="60" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<rect x="430" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW2</text><text x="505" y="60" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<rect x="245" y="150" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<line x1="210" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><line x1="160" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="38" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/0 both ends</text>
<text x="190" y="120" class="svg-muted" font-size="11">ge-0/0/1 - ge-0/0/0</text><text x="400" y="120" class="svg-muted" font-size="11">ge-0/0/1 - ge-0/0/1</text>
</svg><p class="cap">Lab 1 starting point: all priorities are equal, so the lowest MAC address wins the election.</p></div>

<h3>What the lab shows</h3>
<p>On a fresh Lab 1 every switch has the default priority. This real output from FLOOR2 shows that FLOOR2 itself is the root (the Root ID equals its own Bridge ID) and has no Root port line, because the root has none:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree bridge
STP bridge parameters
Routing instance name               : GLOBAL
Enabled protocol                    : RSTP
  Root ID                           : <span class="hl">32768.52:54:00:a7:71:00</span>
  Hello time                        : 2 seconds
  Maximum age                       : 20 seconds
  Forward delay                     : 15 seconds
  Local parameters
    Bridge ID                       : <span class="hl">32768.52:54:00:a7:71:00</span>
    Extended system ID              : 0</pre>
<p>On a switch that is <b>not</b> the root, the output gains <code>Root cost</code> and <code>Root port</code> lines. Here is DSW1 in the same lab, whose own Bridge ID is different:</p>
<pre class="out">lab@DSW1&gt; show spanning-tree bridge
  Root ID                           : 32768.52:54:00:a7:71:00
  Root cost                         : 20000
  Root port                         : ge-0/0/1
  Local parameters
    Bridge ID                       : 32768.52:54:c6:fc:d0:00</pre>
<p>FLOOR2 is the oldest MAC in this topology, so it won, even though it is an access switch. That is exactly the trap the lab asks you to fix.</p>

<h3>Root port, designated port: the next two elections</h3>
<ol>
<li><b>Every non-root switch picks one root port</b>: the port with the lowest <b>root path cost</b>. Ties are broken by the lowest sender bridge ID, then the lowest sender port ID, then the local port ID.</li>
<li><b>Every segment (link) picks one designated port</b>: the port on the segment with the best path to the root. All ports of the root bridge are designated.</li>
<li>Any port that is neither root nor designated goes to the <b>alternate</b> or <b>backup</b> role and discards user traffic.</li>
</ol>
<p><b>Path cost</b> is added up from the root to the switch, by adding the cost of each port a BPDU leaves through. Junos uses the 802.1t "long" costs, which depend on speed:</p>
<table class="cmp"><tr><th>Link speed</th><th>Default port cost</th></tr>
<tr><td>10 Mbit/s</td><td>2000000</td></tr><tr><td>100 Mbit/s</td><td>200000</td></tr><tr><td>1 Gbit/s</td><td>20000</td></tr><tr><td>10 Gbit/s</td><td>2000</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Root DSW1 (priority 4k). FLOOR2 has two 1 Gbit/s uplinks. Via DSW1 directly: cost 20000. Via DSW2 and the DSW1-DSW2 link: 20000 + 20000 = 40000, so FLOOR2's root port is ge-0/0/0 (towards DSW1) with root cost 20000, and the other uplink becomes an alternate port. Count the costs hop by hop and you can predict the tree without touching the switch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking the root is the switch with the highest priority number. It is the lowest. Choosing a priority that is not a multiple of 4096: Junos rejects it at commit. Leaving the election to chance, which puts the root on whatever switch has the lowest MAC.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the tie-break order: lowest root bridge ID, lowest root path cost, lowest sender bridge ID, lowest sender port ID. Also remember the default priority is 32768 and the cost of 1 Gbit/s is 20000.</p></div>

<div class="scn"><h4>The access switch that became the root</h4><p>In a new Noida floor all three switches kept the default priority. Traffic from the floor to the core went through an access switch in a closet, because it had the oldest MAC. The fix was to give the core switch priority 4096 and the backup core 8192.</p><p><b>Lesson:</b> never let a MAC address choose your root.</p></div>

<div class="iv"><p class="q">"How is the root bridge elected?"</p><p>Each switch has a bridge ID made of priority (default 32768) and MAC. The lowest bridge ID wins, so with equal priorities the lowest MAC wins. In design you set a low priority such as 4k on the intended root and 8k on the backup. Mention that BPDUs carry the root ID and path cost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bridge ID = priority + MAC; the lowest wins; default priority 32768; steps of 4096.</li>
<li>BPDUs carry root ID, root path cost, sender bridge ID and port ID.</li>
<li>Each non-root switch has one root port (lowest root path cost); each segment has one designated port.</li>
<li>1 Gbit/s costs 20000 on Junos; costs add up along the path.</li>
</ul></div>
`,hi:`
<p>Har tree ko ek tana chahiye. Spanning tree mein tana <b>root bridge</b> hai: ek switch jiske against baaki sab switches apne paths naapte hain. School ke election jaisa socho. Har switch kehta hai "main candidate hoon", har candidate ke paas ek number hai, aur sabse chhota number jeetta hai. Yeh chapter us number (bridge ID), messages (BPDUs) aur un niyamon ko samjhata hai jo election result ko loop-free tree mein badalte hain.</p>

<h3>Bridge ID</h3>
<p><b>Bridge ID</b> 8 bytes ka hota hai: 4-bit <b>priority</b>, 12-bit <b>extended system ID</b> (instance ya VLAN number, plain RSTP mein 0) aur switch ka 48-bit <b>MAC address</b>. Practice mein ise priority, dot, phir MAC ke roop mein likha jaata hai. Junos ki default priority <b>32768</b> hai. Aap ise <b>4096</b> ke steps mein badal sakte ho: 0, 4k, 8k, 12k ... 60k. <b>Sabse chhota bridge ID jeetta hai</b>. Priorities barabar hon to sabse chhota MAC address faisla karta hai, yaani aksar sabse purana switch. Yeh shayad hi woh switch ho jo aap chahte ho, isliye priority hamesha khud set karo.</p>
<p>Junos abbreviations bhi leta hai: <code>4k</code> matlab 4096 aur <code>8k</code> matlab 8192.</p>

<h3>BPDUs: switches kaise baat karte hain</h3>
<p>Switches <b>BPDUs</b> (bridge protocol data units) exchange karte hain, chhote Layer 2 multicast frames jo reserved MAC address par jaate hain taaki koi switch unhe forward na kare. BPDU mein hota hai:</p>
<ul>
<li>sender jis <b>root bridge ID</b> ko maanta hai,</li>
<li>sender ka <b>root path cost</b> (root tak uske path ka cost),</li>
<li>sender ka apna <b>bridge ID</b> aur <b>port ID</b>,</li>
<li>timers (hello 2 seconds, max-age 20 seconds, forward delay 15 seconds).</li>
</ul>
<p>Start-up par har switch khud ko root kehta hai. Jab use chhote root bridge ID wala BPDU milta hai, woh behtar root ko maan leta hai aur dawa chhod deta hai. Kuch BPDU exchanges ke baad sab ek mat ho jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Noida topology aur root election">
<rect x="60" y="20" width="150" height="50" rx="10" fill="#fde68a"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="135" y="60" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<rect x="430" y="20" width="150" height="50" rx="10" fill="#bae6fd"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW2</text><text x="505" y="60" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<rect x="245" y="150" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="11">priority 32768 (default)</text>
<line x1="210" y1="45" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><line x1="160" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="480" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="38" text-anchor="middle" class="svg-muted" font-size="11">dono ends par ge-0/0/0</text>
<text x="190" y="120" class="svg-muted" font-size="11">ge-0/0/1 - ge-0/0/0</text><text x="400" y="120" class="svg-muted" font-size="11">ge-0/0/1 - ge-0/0/1</text>
</svg><p class="cap">Lab 1 ka starting point: saari priorities barabar hain, isliye sabse chhota MAC address election jeetta hai.</p></div>

<h3>Lab kya dikhata hai</h3>
<p>Fresh Lab 1 mein har switch default priority par hai. FLOOR2 ka yeh real output dikhata hai ki FLOOR2 khud root hai (Root ID uske apne Bridge ID ke barabar) aur Root port line nahi hai, kyunki root ka koi root port nahi hota:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree bridge
STP bridge parameters
Routing instance name               : GLOBAL
Enabled protocol                    : RSTP
  Root ID                           : <span class="hl">32768.52:54:00:a7:71:00</span>
  Hello time                        : 2 seconds
  Maximum age                       : 20 seconds
  Forward delay                     : 15 seconds
  Local parameters
    Bridge ID                       : <span class="hl">32768.52:54:00:a7:71:00</span>
    Extended system ID              : 0</pre>
<p><b>Non-root</b> switch par output mein <code>Root cost</code> aur <code>Root port</code> lines aa jaati hain. Usi lab mein DSW1, jiska apna Bridge ID alag hai:</p>
<pre class="out">lab@DSW1&gt; show spanning-tree bridge
  Root ID                           : 32768.52:54:00:a7:71:00
  Root cost                         : 20000
  Root port                         : ge-0/0/1
  Local parameters
    Bridge ID                         : 32768.52:54:c6:fc:d0:00</pre>
<p>Is topology mein FLOOR2 ka MAC sabse purana hai, isliye woh jeet gaya, chahe woh access switch hai. Lab isi trap ko theek karne ko kehta hai.</p>

<h3>Root port, designated port: agle do elections</h3>
<ol>
<li><b>Har non-root switch ek root port chunta hai</b>: jiska <b>root path cost</b> sabse kam ho. Tie ho to sender ka chhota bridge ID, phir sender ka chhota port ID, phir local port ID.</li>
<li><b>Har segment (link) ek designated port chunta hai</b>: segment par woh port jiska root tak path sabse achha ho. Root bridge ke saare ports designated hote hain.</li>
<li>Jo port na root hai na designated, woh <b>alternate</b> ya <b>backup</b> role mein jaata hai aur user traffic discard karta hai.</li>
</ol>
<p><b>Path cost</b> root se switch tak jodte hue nikala jaata hai, har us port ka cost jodkar jisse BPDU nikla. Junos 802.1t "long" costs use karta hai, jo speed par depend karte hain:</p>
<table class="cmp"><tr><th>Link speed</th><th>Default port cost</th></tr>
<tr><td>10 Mbit/s</td><td>2000000</td></tr><tr><td>100 Mbit/s</td><td>200000</td></tr><tr><td>1 Gbit/s</td><td>20000</td></tr><tr><td>10 Gbit/s</td><td>2000</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Root DSW1 (priority 4k). FLOOR2 ke do 1 Gbit/s uplinks hain. DSW1 se seedha: cost 20000. DSW2 aur DSW1-DSW2 link se: 20000 + 20000 = 40000, isliye FLOOR2 ka root port ge-0/0/0 (DSW1 ki taraf) root cost 20000 ke saath hai, aur doosra uplink alternate port ban jaata hai. Hop-by-hop cost ginoge to switch ko chhue bina tree predict kar loge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sochna ki root sabse bade priority number wala switch hai. Woh sabse chhota hai. 4096 ka multiple na hone wali priority chunna: Junos commit par reject karta hai. Election ko chance par chhodna, jisse root us switch par jaata hai jiska MAC sabse chhota ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tie-break ka order yaad rakho: sabse chhota root bridge ID, sabse chhota root path cost, sabse chhota sender bridge ID, sabse chhota sender port ID. Yeh bhi yaad rakho ki default priority 32768 hai aur 1 Gbit/s ka cost 20000 hai.</p></div>

<div class="scn"><h4>Access switch jo root ban gaya</h4><p>Noida ke naye floor par teeno switches ne default priority rakhi thi. Floor se core ka traffic closet ke ek access switch se jaata tha, kyunki uska MAC sabse purana tha. Fix: core switch ko priority 4096 aur backup core ko 8192 dena.</p><p><b>Lesson:</b> kabhi MAC address ko apna root mat chunne do.</p></div>

<div class="iv"><p class="q">"Root bridge kaise chuna jaata hai?"</p><p>Har switch ka bridge ID priority (default 32768) aur MAC se banta hai. Sabse chhota bridge ID jeetta hai, isliye barabar priority par sabse chhota MAC jeetta hai. Design mein intended root par 4k jaisi chhoti priority aur backup par 8k set karte hain. Batao ki BPDUs root ID aur path cost carry karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bridge ID = priority + MAC; sabse chhota jeetta hai; default priority 32768; 4096 ke steps.</li>
<li>BPDUs root ID, root path cost, sender bridge ID aur port ID carry karte hain.</li>
<li>Har non-root switch ka ek root port (sabse kam root path cost); har segment ka ek designated port.</li>
<li>Junos par 1 Gbit/s ka cost 20000; costs raaste mein jud jaate hain.</li>
</ul></div>
`}};export{e as default};