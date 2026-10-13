var e={id:`vstp`,h:{en:`VSTP: a rapid spanning tree for every VLAN`,hi:`VSTP: har VLAN ke liye ek rapid spanning tree`},body:{en:`
<p><b>VSTP</b> (VLAN Spanning Tree Protocol) runs one rapid spanning tree per VLAN that you list. It is Juniper's answer to per-VLAN trees such as Cisco Rapid-PVST+, and a good fit when you have a small number of VLANs, want <b>independent roots and costs for each VLAN</b>, or must interoperate with per-VLAN neighbours.</p>

<h3>How it differs from MSTP</h3>
<table class="cmp"><tr><th></th><th>VSTP</th><th>MSTP</th></tr>
<tr><td>Unit of tree</td><td>VLAN</td><td>instance (group of VLANs)</td></tr>
<tr><td>BPDUs per link</td><td>one per VLAN per hello</td><td>one per link</td></tr>
<tr><td>Region concept</td><td>none: no name, no revision, no digest</td><td>yes</td></tr>
<tr><td>Typical use</td><td>few VLANs, mixed vendors</td><td>many VLANs</td></tr>
<tr><td>Typical trouble</td><td>CPU and BPDU load as VLANs grow</td><td>region mismatches</td></tr></table>
<p>VSTP has no region, so a typo in a name cannot break it. The price is that each VLAN is a separate tree with its own timers and its own load on the switch CPU. The supported number of VSTP VLANs depends on the platform and release, so check the release notes before you plan 500 of them.</p>

<h3>Bridge ID: the VLAN is the extended system ID</h3>
<p>The VLAN ID is added to the priority. Priority 4k in VLAN 10 is 4096 + 10 = <b>4106</b>; 8k in VLAN 30 is 8192 + 30 = <b>8222</b>. Reading these numbers tells you which VLAN and which priority at a glance.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! DIST-A: root for V10 and V20, backup for V30</span>
set vlans V10 vlan-id 10
set vlans V20 vlan-id 20
set vlans V30 vlan-id 30
set protocols vstp vlan V10 bridge-priority 4k
set protocols vstp vlan V20 bridge-priority 4k
set protocols vstp vlan V30 bridge-priority 8k
<span class="c">! access switch: edge ports and a per-VLAN cost</span>
set protocols vstp vlan V10
set protocols vstp vlan V20
set protocols vstp vlan V30
set protocols vstp interface ge-0/0/2 edge
set protocols vstp vlan V20 interface ge-0/0/0 cost 50000</pre>
<p>You must list every VLAN that should have a tree (<code>vlan all</code> exists too). A VLAN that is not listed gets <b>no spanning tree on VSTP interfaces</b>: that is a loop risk, not a safe default. Do not run VSTP and MSTP/RSTP on the same port.</p>

<h3>Real output: the Kolkata lab before any priorities</h3>
<p>All priorities are default. ACC-3 has the lowest MAC, so it is root of every VLAN, which is the worst possible choice.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree bridge vlan V30
STP bridge parameters for VLAN 30
  Root ID                           : <span class="hl">32798.52:54:9e:49:10:00</span>
  Local parameters
    Bridge ID                       : <span class="hl">32798.52:54:9e:49:10:00</span>
    Extended system ID              : 30</pre>
<p>Root ID equals Bridge ID, so this switch is the root. 32768 + 30 = 32798.</p>

<h3>Real output: after root placement and steering</h3>
<p>DIST-A is 4k in V10 and V20, DIST-B is 4k in V30, and ACC-3 has cost 50000 on ge-0/0/0 in V20 only.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree interface vlan V10
ge-0/0/0   128:1  128:2  4106.5254ca765000  20000  FWD  <span class="hl">ROOT</span>
ge-0/0/1   128:2  128:2  8202.5254cb765200  20000  BLK  ALT

lab@ACC-3&gt; show spanning-tree interface vlan V20
ge-0/0/0   128:1  128:2  4116.5254ca765000  50000  BLK  <span class="hl">ALT</span>
ge-0/0/1   128:2  128:2  8212.5254cb765200  20000  FWD  <span class="hl">ROOT</span>

lab@ACC-3&gt; show spanning-tree interface vlan V30
ge-0/0/0   128:1  128:2  8222.5254ca765000  20000  BLK  ALT
ge-0/0/1   128:2  128:2  4126.5254cb765200  20000  FWD  ROOT</pre>
<p>Read VLAN 20: DIST-A (4116) is still the root, but the access switch prefers the path <i>through</i> DIST-B (8212): via ge-0/0/0 the cost to root is 50000, via ge-0/0/1 it is 20000 + the DIST-B to DIST-A link 20000 = 40000. Lower wins. That is how you steer one VLAN toward an inspection appliance without moving its root.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree bridge vlan V20
  Root ID                           : 4116.52:54:ca:76:50:00
  Root cost                         : <span class="hl">40000</span>
  Root port                         : ge-0/0/1</pre>

<h3>Design tips</h3>
<ul>
<li>Put the root of each VLAN on the switch that holds its default gateway, and a backup at 8k on the other.</li>
<li>Steer with cost under <code>vlan X interface Y cost</code>; it changes that VLAN only.</li>
<li>Keep VLANs on VSTP to the number you really need; use MSTP above a few dozen.</li>
<li>Toward a Cisco PVST+ neighbour, VSTP interoperates; configure the same VLANs and keep native VLAN consistent on both ends.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to list a new VLAN under VSTP. Setting the priority and not testing the result: a one-digit typo in a VLAN name creates a tree for nothing. Making one switch root of all VLANs because it was "the first one configured".</p></div>
<div class="exam"><p><b>Exam trap.</b> "bridge-priority 4k in VLAN 30" is displayed as 4126, not 4096. VSTP has <b>no</b> configuration name, revision or digest. A per-VLAN interface cost lives under <code>protocols vstp vlan X interface Y</code>.</p></div>

<div class="scn"><h4>The inspection appliance on one side</h4><p>A branch put a traffic inspection appliance behind DIST-B and needed only VLAN 20 to cross it. The team changed the root of V20, which also moved gateway paths and caused a short outage. A better fix was a single line on the access switch: cost 50000 on the uplink to DIST-A in V20. The root stayed, only the access switch's choice of root port changed, and V10 was untouched.</p><p><b>Lesson:</b> to steer one VLAN, change a port cost near the access layer before moving a root.</p></div>

<div class="iv"><p class="q">"When would you choose VSTP over MSTP?"</p><p>When there are few VLANs and each needs its own root or cost, when I must interoperate with per-VLAN spanning tree on another vendor, or when I want to avoid region configuration. For a large number of VLANs I choose MSTP, since a tree per VLAN costs CPU and BPDUs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VSTP = one rapid tree per VLAN; no region, name, revision or digest.</li>
<li>Bridge ID shows priority + VLAN ID: 4k in VLAN 10 is 4106.</li>
<li>List every VLAN under <code>protocols vstp</code>; unlisted VLANs have no tree.</li>
<li>Per-VLAN cost steers one VLAN without moving its root.</li>
<li>VSTP scales with CPU; large VLAN counts belong to MSTP.</li>
</ul></div>
`,hi:`
<p><b>VSTP</b> (VLAN Spanning Tree Protocol) har us VLAN ke liye ek rapid spanning tree chalata hai jo aap list karte ho. Yeh Cisco Rapid-PVST+ jaise per-VLAN trees ka Juniper ka jawab hai, aur tab fit baithta hai jab VLANs kam hon, <b>har VLAN ka alag root aur cost</b> chahiye, ya per-VLAN neighbours ke saath interoperate karna ho.</p>

<h3>MSTP se kya fark hai</h3>
<table class="cmp"><tr><th></th><th>VSTP</th><th>MSTP</th></tr>
<tr><td>Tree ki unit</td><td>VLAN</td><td>instance (VLANs ka group)</td></tr>
<tr><td>Har link par BPDUs</td><td>har hello par har VLAN ka ek</td><td>har link par ek</td></tr>
<tr><td>Region concept</td><td>nahi: name, revision, digest kuch nahi</td><td>haan</td></tr>
<tr><td>Aam use</td><td>kam VLANs, mixed vendors</td><td>bahut VLANs</td></tr>
<tr><td>Aam dikkat</td><td>VLANs badhne par CPU aur BPDU load</td><td>region mismatches</td></tr></table>
<p>VSTP mein region nahi hota, isliye name mein typo use tod nahi sakta. Keemat yeh hai ki har VLAN alag tree hai, apne timers aur switch CPU par apne load ke saath. Supported VSTP VLANs ki sankhya platform aur release par depend karti hai, isliye 500 plan karne se pehle release notes dekho.</p>

<h3>Bridge ID: VLAN extended system ID hai</h3>
<p>VLAN ID priority mein jud jaati hai. VLAN 10 mein 4k priority = 4096 + 10 = <b>4106</b>; VLAN 30 mein 8k = 8192 + 30 = <b>8222</b>. Yeh numbers padhkar ek nazar mein pata chalta hai ki kaunsa VLAN aur kaunsi priority.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! DIST-A: V10 aur V20 ka root, V30 ka backup</span>
set vlans V10 vlan-id 10
set vlans V20 vlan-id 20
set vlans V30 vlan-id 30
set protocols vstp vlan V10 bridge-priority 4k
set protocols vstp vlan V20 bridge-priority 4k
set protocols vstp vlan V30 bridge-priority 8k
<span class="c">! access switch: edge ports aur per-VLAN cost</span>
set protocols vstp vlan V10
set protocols vstp vlan V20
set protocols vstp vlan V30
set protocols vstp interface ge-0/0/2 edge
set protocols vstp vlan V20 interface ge-0/0/0 cost 50000</pre>
<p>Jis VLAN ka tree chahiye use list karna zaroori hai (<code>vlan all</code> bhi hai). Jo VLAN list nahi hota use VSTP interfaces par <b>koi spanning tree nahi milta</b>: yeh loop ka risk hai, safe default nahi. Ek hi port par VSTP aur MSTP/RSTP mat chalao.</p>

<h3>Asli output: Kolkata lab, priorities se pehle</h3>
<p>Saari priorities default. ACC-3 ka MAC sabse chhota hai, isliye woh har VLAN ka root hai, jo sabse kharab choice hai.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree bridge vlan V30
STP bridge parameters for VLAN 30
  Root ID                           : <span class="hl">32798.52:54:9e:49:10:00</span>
  Local parameters
    Bridge ID                       : <span class="hl">32798.52:54:9e:49:10:00</span>
    Extended system ID              : 30</pre>
<p>Root ID = Bridge ID, yaani yeh switch root hai. 32768 + 30 = 32798.</p>

<h3>Asli output: root placement aur steering ke baad</h3>
<p>DIST-A V10 aur V20 mein 4k, DIST-B V30 mein 4k, aur ACC-3 par sirf V20 mein ge-0/0/0 par cost 50000.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree interface vlan V10
ge-0/0/0   128:1  128:2  4106.5254ca765000  20000  FWD  <span class="hl">ROOT</span>
ge-0/0/1   128:2  128:2  8202.5254cb765200  20000  BLK  ALT

lab@ACC-3&gt; show spanning-tree interface vlan V20
ge-0/0/0   128:1  128:2  4116.5254ca765000  50000  BLK  <span class="hl">ALT</span>
ge-0/0/1   128:2  128:2  8212.5254cb765200  20000  FWD  <span class="hl">ROOT</span>

lab@ACC-3&gt; show spanning-tree interface vlan V30
ge-0/0/0   128:1  128:2  8222.5254ca765000  20000  BLK  ALT
ge-0/0/1   128:2  128:2  4126.5254cb765200  20000  FWD  ROOT</pre>
<p>VLAN 20 padho: DIST-A (4116) abhi bhi root hai, par access switch DIST-B (8212) ke <i>through</i> wala path pasand karta hai: ge-0/0/0 se root tak cost 50000, ge-0/0/1 se 20000 + DIST-B se DIST-A link 20000 = 40000. Chhota jeetta hai. Aise ek VLAN ko root hilaye bina inspection appliance ki taraf steer karte hain.</p>
<pre class="out">lab@ACC-3&gt; show spanning-tree bridge vlan V20
  Root ID                           : 4116.52:54:ca:76:50:00
  Root cost                         : <span class="hl">40000</span>
  Root port                         : ge-0/0/1</pre>

<h3>Design tips</h3>
<ul>
<li>Har VLAN ka root us switch par rakho jahan uska default gateway hai, aur doosre par 8k backup.</li>
<li>Steering <code>vlan X interface Y cost</code> se karo; yeh sirf us VLAN ko badalta hai.</li>
<li>VSTP par VLANs utne hi rakho jitne sach mein chahiye; kuch dozen se upar MSTP use karo.</li>
<li>Cisco PVST+ neighbour ke saath VSTP interoperate karta hai; same VLANs configure karo aur native VLAN dono taraf consistent rakho.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Naya VLAN VSTP ke neeche list karna bhool jaana. Priority set karke result test na karna: VLAN name mein ek akshar ka typo bekaar tree bana deta hai. Ek switch ko "pehle configure hua" isliye saare VLANs ka root bana dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "VLAN 30 mein bridge-priority 4k" 4126 dikhta hai, 4096 nahi. VSTP mein configuration name, revision ya digest <b>nahi</b> hota. Per-VLAN interface cost <code>protocols vstp vlan X interface Y</code> ke neeche hota hai.</p></div>

<div class="scn"><h4>Ek taraf lagi inspection appliance</h4><p>Ek branch ne DIST-B ke peeche traffic inspection appliance lagayi aur sirf VLAN 20 ko usse guzarna tha. Team ne V20 ka root badal diya, jisse gateway paths bhi hile aur chhota outage hua. Behtar fix access switch par ek line thi: V20 mein DIST-A wale uplink par cost 50000. Root wahi raha, sirf access switch ka root port badla, aur V10 ko chhua tak nahi.</p><p><b>Lesson:</b> ek VLAN steer karna ho to root hilane se pehle access layer ke paas port cost badlo.</p></div>

<div class="iv"><p class="q">"VSTP ko MSTP par kab chunoge?"</p><p>Jab VLANs kam hon aur har ko apna root ya cost chahiye, jab doosre vendor ke per-VLAN spanning tree ke saath interoperate karna ho, ya region configuration se bachna ho. Bahut VLANs ke liye MSTP chunta hoon, kyunki har VLAN ka tree CPU aur BPDUs leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VSTP = har VLAN ka ek rapid tree; region, name, revision ya digest nahi.</li>
<li>Bridge ID priority + VLAN ID dikhata hai: VLAN 10 mein 4k = 4106.</li>
<li>Har VLAN <code>protocols vstp</code> ke neeche list karo; unlisted VLAN ka tree nahi hota.</li>
<li>Per-VLAN cost root hilaye bina ek VLAN steer karta hai.</li>
<li>VSTP CPU ke saath scale hota hai; bade VLAN count ke liye MSTP.</li>
</ul></div>
`}};export{e as default};