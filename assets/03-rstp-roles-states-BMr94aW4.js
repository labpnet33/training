var e={id:`rstp-roles-states`,h:{en:`RSTP port roles and states`,hi:`RSTP port roles aur states`},body:{en:`
<p>After the election, every port in the network gets two labels: a <b>role</b> (what the port is for) and a <b>state</b> (what the port is doing with frames). Think of a building with a main staircase, a fire escape and a locked store-room door. The main staircase is used by everyone (forwarding). The fire escape is closed, but ready to open the moment the main staircase is blocked (alternate). The store-room door is permanently shut and has no purpose (disabled). Roles describe the purpose; states describe the current traffic behaviour.</p>

<h3>Port roles</h3>
<table class="cmp"><tr><th>Role (Junos output)</th><th>Meaning</th><th>Typical state</th></tr>
<tr><td><b>Root</b> (ROOT)</td><td>The one best path towards the root bridge. Exactly one on every non-root switch.</td><td>Forwarding</td></tr>
<tr><td><b>Designated</b> (DESG)</td><td>The best port on a link towards the root. All ports of the root bridge are designated.</td><td>Forwarding</td></tr>
<tr><td><b>Alternate</b> (ALT)</td><td>A spare path to the root, learnt from a BPDU of another switch. Takes over if the root port fails.</td><td>Discarding (BLK)</td></tr>
<tr><td><b>Backup</b> (BKUP)</td><td>A second port of the same switch on a shared segment, behind a designated port.</td><td>Discarding (BLK)</td></tr>
<tr><td><b>Disabled</b> (DIS)</td><td>Port is down or spanning tree is off on it.</td><td>None</td></tr></table>

<h3>Port states</h3>
<p>Classic 802.1D had five: disabled, blocking, listening, learning, forwarding. RSTP has only three:</p>
<ul>
<li><b>Discarding:</b> receives and sends BPDUs, does not learn MACs, does not forward user frames. It merges blocking, listening and disabled.</li>
<li><b>Learning:</b> does not forward user frames yet but learns source MACs, so the table is ready.</li>
<li><b>Forwarding:</b> normal operation.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Roles after root election">
<rect x="230" y="15" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">DSW1 (root, 4096)</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">all ports DESG / FWD</text>
<rect x="30" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="115" y="123" text-anchor="middle" class="svg-ink" font-size="13">DSW2 (8192)</text><text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="11">root port to DSW1</text>
<rect x="230" y="190" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="213" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2 (32768)</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="11">ROOT + ALT</text>
<line x1="280" y1="65" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="65" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="150" y1="150" x2="250" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="330" y="130" class="svg-accent" font-size="12">ROOT / FWD</text><text x="105" y="190" class="svg-muted" font-size="12">ALT / BLK (dashed)</text>
</svg><p class="cap">The dashed link carries no user traffic until the solid path to DSW1 fails.</p></div>

<h3>Configuring RSTP on Junos</h3>
<p>RSTP is part of the factory-default configuration of EX switches, and the lab devices start with it already enabled. The statement is simply:</p>
<pre class="code">set protocols rstp</pre>
<p>This enables one RSTP tree for all VLANs on all switching interfaces. Options live below it: <code>bridge-priority</code>, <code>hello-time</code>, and per-interface <code>cost</code>, <code>priority</code>, <code>edge</code> and <code>mode</code>. Everything else in this module is a refinement of this one statement.</p>

<h3>Reading the roles in the lab</h3>
<p>This is real output from FLOOR2 in Lab 1 after DSW1 became the root with priority 4k and DSW2 the backup with 8k:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree interface
Spanning tree interface parameters for instance 0
Interface                  Port ID    Designated         Designated         Port    State  Role
                                     port ID           bridge ID          Cost
ge-0/0/0                   128:1      128:2     <span class="hl">4096</span>.5254c6fcd000    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  <span class="hl">BLK    ALT</span>
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  FWD    DESG</pre>
<p>Read it column by column. <b>Port ID</b> is port priority (default 128) plus port number. <b>Designated bridge ID</b> is the switch that sends the best BPDU on that link: for ge-0/0/0 it is bridge 4096 (DSW1, the root); for ge-0/0/1 it is 8192 (DSW2). <b>Port Cost</b> is 20000 for each 1 Gbit/s port. The last two columns are the state and the role. The ge-0/0/2 line is the PC port: FLOOR2 itself is designated there because no better BPDU arrives.</p>
<p>On the root and the backup root:</p>
<pre class="out">lab@DSW2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:1     4096.5254c6fcd000    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  FWD    DESG</pre>
<p>DSW2 reaches the root straight over its link to DSW1 (ROOT). Its link to FLOOR2 is designated and forwarding, but the FLOOR2 end of it is alternate, so the loop is broken on the FLOOR2 side.</p>

<div class="eg"><p><b>Worked example.</b> The DSW1 to FLOOR2 link fails. FLOOR2's root port goes down. Its alternate port ge-0/0/1 already holds a better BPDU from DSW2, so it becomes the new root port at once and moves to forwarding without waiting for timers. The path to the root is now FLOOR2 to DSW2 to DSW1, with root cost 40000. Users see a short pause of about a second.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Confusing alternate with backup: alternate is a different switch's BPDU on a different link, backup is your own second port on the same shared segment. Reading BLK as "bad". Expecting a blocked port to show interface errors: it does not, because the link itself is fine.</p></div>
<div class="exam"><p><b>Exam trap.</b> RSTP has three states (discarding, learning, forwarding) and role names that the exam may give in full: root, designated, alternate, backup, disabled. Output shows <code>Altn</code> in some releases and <code>ALT</code> in others, so read the role, not the spelling.</p></div>

<div class="scn"><h4>The "dead" uplink that was not dead</h4><p>A junior engineer reported that one of the two uplinks of FLOOR2 carried no traffic and asked for it to be repaired. <code>show spanning-tree interface</code> showed ge-0/0/1 as ALT and BLK. It was the healthy standby. A week later a fibre cut on the primary uplink was invisible to users, because the alternate port took over.</p><p><b>Lesson:</b> blocked is not broken; it is insurance.</p></div>

<div class="iv"><p class="q">"What are the RSTP port roles and states?"</p><p>Roles: root, designated, alternate, backup and disabled. States: discarding, learning, forwarding. The root and designated ports forward; alternate and backup discard. An alternate port is a pre-calculated replacement for the root port, which is why RSTP converges quickly. Show you can read the Role and State columns of <code>show spanning-tree interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every non-root switch has exactly one root port; each link has one designated port.</li>
<li>Alternate and backup ports discard traffic and are standby paths.</li>
<li>RSTP has three states: discarding, learning, forwarding.</li>
<li>Read <code>show spanning-tree interface</code> for state, role, port cost and the designated bridge.</li>
<li>One tree for all VLANs: <code>set protocols rstp</code>.</li>
</ul></div>
`,hi:`
<p>Election ke baad network ke har port ko do labels milte hain: ek <b>role</b> (port kis kaam ka hai) aur ek <b>state</b> (port frames ke saath abhi kya kar raha hai). Socho ek building jisme main staircase, fire escape aur ek locked store-room ka darwaza hai. Main staircase sab use karte hain (forwarding). Fire escape band hai, lekin main staircase block hote hi kholne ko taiyaar hai (alternate). Store-room ka darwaza hamesha band hai aur uska koi kaam nahi (disabled). Roles maqsad batate hain; states abhi ka traffic behaviour.</p>

<h3>Port roles</h3>
<table class="cmp"><tr><th>Role (Junos output)</th><th>Matlab</th><th>Typical state</th></tr>
<tr><td><b>Root</b> (ROOT)</td><td>Root bridge ki taraf ek sabse achha path. Har non-root switch par theek ek.</td><td>Forwarding</td></tr>
<tr><td><b>Designated</b> (DESG)</td><td>Link par root ki taraf sabse achha port. Root bridge ke saare ports designated hote hain.</td><td>Forwarding</td></tr>
<tr><td><b>Alternate</b> (ALT)</td><td>Root tak ek spare path, doosre switch ke BPDU se seekha. Root port fail hone par kaam sambhalta hai.</td><td>Discarding (BLK)</td></tr>
<tr><td><b>Backup</b> (BKUP)</td><td>Usi switch ka doosra port shared segment par, designated port ke peeche.</td><td>Discarding (BLK)</td></tr>
<tr><td><b>Disabled</b> (DIS)</td><td>Port down hai ya us par spanning tree off hai.</td><td>Koi nahi</td></tr></table>

<h3>Port states</h3>
<p>Classic 802.1D mein paanch the: disabled, blocking, listening, learning, forwarding. RSTP mein sirf teen hain:</p>
<ul>
<li><b>Discarding:</b> BPDUs leta aur bhejta hai, MACs learn nahi karta, user frames forward nahi karta. Yeh blocking, listening aur disabled ko mila deta hai.</li>
<li><b>Learning:</b> abhi user frames forward nahi karta lekin source MACs learn karta hai, taaki table taiyaar rahe.</li>
<li><b>Forwarding:</b> normal operation.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Root election ke baad roles">
<rect x="230" y="15" width="180" height="50" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">DSW1 (root, 4096)</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">saare ports DESG / FWD</text>
<rect x="30" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="115" y="123" text-anchor="middle" class="svg-ink" font-size="13">DSW2 (8192)</text><text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="11">DSW1 ki taraf root port</text>
<rect x="230" y="190" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="213" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2 (32768)</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="11">ROOT + ALT</text>
<line x1="280" y1="65" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="320" y1="65" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><line x1="150" y1="150" x2="250" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="330" y="130" class="svg-accent" font-size="12">ROOT / FWD</text><text x="105" y="190" class="svg-muted" font-size="12">ALT / BLK (dashed)</text>
</svg><p class="cap">Dashed link par tab tak koi user traffic nahi jaata jab tak DSW1 wala solid path fail na ho.</p></div>

<h3>Junos par RSTP configure karna</h3>
<p>RSTP EX switches ki factory-default configuration ka hissa hai, aur lab devices pehle se enabled shuru hote hain. Statement bas itna hai:</p>
<pre class="code">set protocols rstp</pre>
<p>Yeh saare switching interfaces par saare VLANs ke liye ek RSTP tree enable karta hai. Options iske neeche hote hain: <code>bridge-priority</code>, <code>hello-time</code>, aur per-interface <code>cost</code>, <code>priority</code>, <code>edge</code> aur <code>mode</code>. Is module ki baaki sab cheezein is ek statement ka refinement hain.</p>

<h3>Lab mein roles padhna</h3>
<p>Lab 1 mein FLOOR2 ka yeh real output hai, jab DSW1 priority 4k se root aur DSW2 8k se backup ban chuka hai:</p>
<pre class="out">lab@FLOOR2&gt; show spanning-tree interface
Spanning tree interface parameters for instance 0
Interface                  Port ID    Designated         Designated         Port    State  Role
                                     port ID           bridge ID          Cost
ge-0/0/0                   128:1      128:2     <span class="hl">4096</span>.5254c6fcd000    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  <span class="hl">BLK    ALT</span>
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  FWD    DESG</pre>
<p>Column-by-column padho. <b>Port ID</b> port priority (default 128) plus port number hai. <b>Designated bridge ID</b> woh switch hai jo us link par sabse achha BPDU bhejta hai: ge-0/0/0 ke liye bridge 4096 (DSW1, root); ge-0/0/1 ke liye 8192 (DSW2). <b>Port Cost</b> har 1 Gbit/s port ka 20000 hai. Aakhri do columns state aur role hain. ge-0/0/2 line PC port hai: wahan FLOOR2 khud designated hai kyunki koi behtar BPDU nahi aata.</p>
<p>Root aur backup root par:</p>
<pre class="out">lab@DSW2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:1     4096.5254c6fcd000    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  FWD    DESG</pre>
<p>DSW2 DSW1 ke link se seedha root tak pahunchta hai (ROOT). FLOOR2 ka uska link designated aur forwarding hai, lekin us link ka FLOOR2 wala end alternate hai, isliye loop FLOOR2 ki taraf toota hai.</p>

<div class="eg"><p><b>Worked example.</b> DSW1 se FLOOR2 ka link fail ho jaata hai. FLOOR2 ka root port down ho jaata hai. Uske alternate port ge-0/0/1 ke paas DSW2 se behtar BPDU pehle se hai, isliye woh turant naya root port ban jaata hai aur timers ka intezaar kiye bina forwarding mein chala jaata hai. Root tak path ab FLOOR2 se DSW2 se DSW1 hai, root cost 40000 ke saath. Users ko lagbhag ek second ka chhota pause dikhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Alternate aur backup mein confuse hona: alternate doosre switch ka BPDU hai alag link par, backup aapka apna doosra port hai usi shared segment par. BLK ko "bad" samajhna. Blocked port se interface errors ki ummeed karna: woh nahi aate, kyunki link khud theek hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RSTP ke teen states hain (discarding, learning, forwarding) aur role names jo exam poore likh sakta hai: root, designated, alternate, backup, disabled. Output kuch releases mein <code>Altn</code> aur kuch mein <code>ALT</code> dikhata hai, isliye role padho, spelling nahi.</p></div>

<div class="scn"><h4>"Dead" uplink jo dead nahi tha</h4><p>Ek junior engineer ne report kiya ki FLOOR2 ke do uplinks mein se ek par koi traffic nahi hai aur use repair karne ko kaha. <code>show spanning-tree interface</code> ne ge-0/0/1 ko ALT aur BLK dikhaya. Woh healthy standby tha. Ek hafte baad primary uplink par fibre cut users ko dikha hi nahi, kyunki alternate port ne kaam sambhal liya.</p><p><b>Lesson:</b> blocked ka matlab toota hua nahi; woh insurance hai.</p></div>

<div class="iv"><p class="q">"RSTP ke port roles aur states kya hain?"</p><p>Roles: root, designated, alternate, backup aur disabled. States: discarding, learning, forwarding. Root aur designated ports forward karte hain; alternate aur backup discard. Alternate port root port ka pehle se calculate kiya hua replacement hai, isi liye RSTP tez converge karta hai. Dikhao ki aap <code>show spanning-tree interface</code> ke Role aur State columns padh sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har non-root switch ka theek ek root port; har link ka ek designated port.</li>
<li>Alternate aur backup ports traffic discard karte hain aur standby paths hain.</li>
<li>RSTP ke teen states: discarding, learning, forwarding.</li>
<li>State, role, port cost aur designated bridge ke liye <code>show spanning-tree interface</code> padho.</li>
<li>Saare VLANs ke liye ek tree: <code>set protocols rstp</code>.</li>
</ul></div>
`}};export{e as default};