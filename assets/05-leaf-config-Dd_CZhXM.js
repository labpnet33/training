var e={id:`leaf-config`,h:{en:`Configuring a leaf: VLAN to VNI, RD, route target and the VNI list`,hi:`Leaf configure karna: VLAN se VNI, RD, route target aur VNI list`},body:{en:`
<p>With the underlay and the overlay sessions up, the leaf needs four things before it announces anything: a VLAN mapped to a VNI, a VTEP source address, an identity (route distinguisher) and a policy (route target). On a QFX-style leaf in Junos this is the <b>default-switch</b> instance, written under <code>switch-options</code> and <code>protocols evpn</code>. This is the second half of the "Build a two-leaf fabric" lab.</p>

<h3>The full leaf configuration</h3>
<pre class="code"><span class="c"># LEAF1 (LEAF2 uses RD 10.30.255.12:1)</span>
set vlans V10 vlan-id 10
set vlans V10 vxlan vni 1010
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members V10
set protocols evpn encapsulation vxlan
set protocols evpn extended-vni-list [ 1010 ]
set switch-options vtep-source-interface lo0.0
set switch-options route-distinguisher 10.30.255.11:1
set switch-options vrf-target target:65030:1
commit</pre>
<dl class="terms">
<dt>vlans V10 vxlan vni 1010</dt><dd>Maps the local VLAN to the 24-bit VNI that travels in the VXLAN header. VLAN IDs can differ per leaf; the VNI must match.</dd>
<dt>protocols evpn encapsulation vxlan</dt><dd>Tells EVPN to use VXLAN, not MPLS, as the data plane.</dd>
<dt>extended-vni-list</dt><dd>The VNIs EVPN advertises. <code>all</code> is also valid. A VLAN with a VNI that is not in the list stays local to the leaf.</dd>
<dt>vtep-source-interface lo0.0</dt><dd>The loopback that becomes the outer source address of the tunnel.</dd>
<dt>route-distinguisher</dt><dd>Makes the NLRI unique per leaf. Pattern: loopback plus a number.</dd>
<dt>vrf-target</dt><dd>One community used both as export tag and import filter.</dd></dl>

<h3>What commit check tells you</h3>
<p>Junos refuses a half-finished EVPN instance. Adding the VNI mapping and the EVPN statements first, and then checking, reveals the missing pieces one at a time. In the simulator the messages are:</p>
<pre class="out">[edit]
lab@LEAF1# commit check
[edit]
  'switch-options'
    EVPN with VXLAN encapsulation needs switch-options vtep-source-interface

[edit]
lab@LEAF1# set switch-options vtep-source-interface lo0.0
lab@LEAF1# commit check
  'switch-options'
    route-distinguisher must be configured for the default-switch EVPN instance
  'switch-options'
    vrf-target must be configured for the default-switch EVPN instance
error: configuration check-out failed

lab@LEAF1# set switch-options route-distinguisher 10.30.255.11:1
lab@LEAF1# set switch-options vrf-target target:65030:1
lab@LEAF1# commit check
<span class="hl">configuration check succeeds</span></pre>
<p>(Output shortened to the relevant lines.) Read the three lessons: the VTEP source, the RD and the vrf-target are all mandatory.</p>

<h3>RD versus route target</h3>
<p>The two are often confused.</p>
<table class="cmp"><tr><th></th><th>Route distinguisher (RD)</th><th>Route target (RT)</th></tr>
<tr><td>Question it answers</td><td>Is this prefix unique?</td><td>Who should import it?</td></tr>
<tr><td>Where you see it</td><td>Inside the NLRI, <code>10.30.255.12:1</code></td><td>BGP extended community, <code>target:65030:1</code></td></tr>
<tr><td>Typical value</td><td>Unique per leaf</td><td>Same on all leaves of one VNI group</td></tr>
<tr><td>If wrong</td><td>Prefixes can collide and routes are hard to trace to a leaf</td><td>Routes are silently discarded by the receiver</td></tr></table>
<p>The RT mismatch is the quiet killer: sessions stay up, the spine shows routes, and yet no tunnel forms. Chapter 8 walks through this fault in the troubleshooting lab.</p>

<h3>Automatic and per-VNI targets</h3>
<p><code>vrf-target target:65030:1</code> sets one target for the whole instance. Junos can also derive targets automatically and override them per VNI. These are shown as configuration only; the simulator accepts the commands but the first part of the lab uses the single instance target.</p>
<pre class="code"><span class="c"># one auto-derived target per VNI (leaves in the same AS match without planning numbers)</span>
set switch-options vrf-target auto
<span class="c"># a dedicated target for one VNI; every leaf serving 1020 must agree</span>
set protocols evpn vni-options vni 1020 vrf-target target:65040:1020</pre>
<p>The per-VNI form is used in chapter 6: a security team wants its own route target for VNI 1020.</p>

<h3>Verifying the instance and the tunnel</h3>
<pre class="out">lab@LEAF1&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          V10                   10           
                                                           ge-0/0/2.0*

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point source
Logical System Name       Id  SVTEP-IP         IFL   L3-Idx    SVTEP-Mode
&lt;default&gt;                 0   10.30.255.11     lo0.0 0         
    L2-RTT                   IFL-Idx   Interface    NH-Id   SVTEP-Mode
    default-switch           545       vtep.32768   1739    RNVE
      VNID          MC-Group-IP
      <span class="hl">1010          0.0.0.0</span>

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags
 <span class="hl">10.30.255.12     546       vtep.32769   1740    RNVE</span>
    VNID          MC-Group-IP
    1010          0.0.0.0</pre>
<p>The <b>source</b> VTEP is this leaf's own loopback with the local tunnel interface <code>vtep.32768</code>. Each <b>remote</b> VTEP appears as <code>vtep.32769</code>, <code>vtep.32770</code> and so on, with the VNIs they share with you. <code>MC-Group-IP 0.0.0.0</code> means no multicast group: BUM uses ingress replication. When LEAF2 is also configured, LEAF1 shows LEAF2 as its remote VTEP for VNI 1010. If the remote list is empty, no usable type-3 route has arrived (chapter 8).</p>

<div class="eg"><p><b>Worked example: planning identifiers for 4 leaves.</b> Use loopbacks 10.30.255.11 to .14. RDs: 10.30.255.11:1, .12:1, .13:1, .14:1 (unique). One RT for VNI group: target:65030:1 (same everywhere). VLAN V10 uses ID 10 and VNI 1010; VLAN V20 uses ID 20 and VNI 1020. The extended-vni-list on every leaf is [ 1010 1020 ]. Writing this plan before typing avoids the two most common faults: a duplicated RD and a mismatched RT.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Same RD on two leaves. (2) A different RT on one leaf. (3) VNI in <code>vlans</code> but not in <code>extended-vni-list</code>. (4) Using a fabric-link address as the VTEP source. (5) Forgetting <code>encapsulation vxlan</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The VTEP source is a loopback chosen with <code>vtep-source-interface lo0.0</code>. Another favourite: <code>vrf-target</code> sets both import and export; only <code>vrf-target export</code> or <code>import</code> separately would split them.</p></div>

<div class="scn"><h4>Two leaves, one RD</h4><p>A rushed rollout copied LEAF1's switch-options to LEAF2 unchanged, including the RD. The fabric worked, but when a host moved, the engineers could not tell from the BGP table which leaf had originated a route, because the RD in every prefix looked the same. Giving each leaf an RD built from its own loopback made every route self-explanatory: the RD in the prefix named the originating leaf.</p><p><b>Lesson:</b> make the RD unique per leaf, derived from the loopback, so routes can be traced to their source.</p></div>

<div class="iv"><p class="q">"Explain the difference between RD and RT in EVPN."</p><p>The RD is prepended to the NLRI to make it unique, so identical MACs from different leaves or VNIs do not collide in BGP. The RT is an extended community used as policy: a leaf exports its routes with an RT and imports only routes whose RT matches its own import list. A wrong RT leaves the sessions up but no routes are imported.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A leaf needs VLAN-to-VNI mapping, vtep-source-interface, RD and vrf-target.</li>
<li><code>extended-vni-list</code> decides which VNIs are advertised.</li>
<li>RD is unique per leaf; RT must match across leaves.</li>
<li><code>commit check</code> lists missing mandatory statements.</li>
<li>Verify with <code>show ethernet-switching vxlan-tunnel-end-point source</code> and <code>remote</code>.</li>
</ul></div>
`,hi:`
<p>Underlay aur overlay sessions up hone ke baad, kuch announce karne se pehle leaf ko chaar cheezein chahiye: VNI se mapped VLAN, VTEP source address, ek identity (route distinguisher) aur ek policy (route target). Junos ke QFX-style leaf par yeh <b>default-switch</b> instance hai, jo <code>switch-options</code> aur <code>protocols evpn</code> ke neeche likha jaata hai. Yeh "Do-leaf fabric banao" lab ka doosra hissa hai.</p>

<h3>Poori leaf configuration</h3>
<pre class="code"><span class="c"># LEAF1 (LEAF2 RD 10.30.255.12:1 use karta hai)</span>
set vlans V10 vlan-id 10
set vlans V10 vxlan vni 1010
set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members V10
set protocols evpn encapsulation vxlan
set protocols evpn extended-vni-list [ 1010 ]
set switch-options vtep-source-interface lo0.0
set switch-options route-distinguisher 10.30.255.11:1
set switch-options vrf-target target:65030:1
commit</pre>
<dl class="terms">
<dt>vlans V10 vxlan vni 1010</dt><dd>Local VLAN ko 24-bit VNI se map karta hai jo VXLAN header mein jaata hai. VLAN IDs leaf ke hisaab se alag ho sakte hain; VNI match hona chahiye.</dd>
<dt>protocols evpn encapsulation vxlan</dt><dd>EVPN ko batata hai ki data plane MPLS nahi, VXLAN hai.</dd>
<dt>extended-vni-list</dt><dd>Woh VNIs jo EVPN advertise karta hai. <code>all</code> bhi valid hai. Jis VLAN ka VNI list mein nahi, woh leaf par local rehta hai.</dd>
<dt>vtep-source-interface lo0.0</dt><dd>Woh loopback jo tunnel ka outer source address banta hai.</dd>
<dt>route-distinguisher</dt><dd>NLRI ko har leaf ke liye unique banata hai. Pattern: loopback aur ek number.</dd>
<dt>vrf-target</dt><dd>Ek community jo export tag aur import filter dono ki tarah use hoti hai.</dd></dl>

<h3>commit check kya batata hai</h3>
<p>Junos aadhi-adhoori EVPN instance reject karta hai. Pehle VNI mapping aur EVPN statements jodo, phir check karo, to missing cheezein ek-ek karke dikhti hain. Simulator mein messages yeh hain:</p>
<pre class="out">[edit]
lab@LEAF1# commit check
[edit]
  'switch-options'
    EVPN with VXLAN encapsulation needs switch-options vtep-source-interface

[edit]
lab@LEAF1# set switch-options vtep-source-interface lo0.0
lab@LEAF1# commit check
  'switch-options'
    route-distinguisher must be configured for the default-switch EVPN instance
  'switch-options'
    vrf-target must be configured for the default-switch EVPN instance
error: configuration check-out failed

lab@LEAF1# set switch-options route-distinguisher 10.30.255.11:1
lab@LEAF1# set switch-options vrf-target target:65030:1
lab@LEAF1# commit check
<span class="hl">configuration check succeeds</span></pre>
<p>(Output sirf zaroori lines tak chhota kiya gaya.) Teen sabak: VTEP source, RD aur vrf-target teeno mandatory hain.</p>

<h3>RD vs route target</h3>
<p>Dono aksar mix ho jaate hain.</p>
<table class="cmp"><tr><th></th><th>Route distinguisher (RD)</th><th>Route target (RT)</th></tr>
<tr><td>Kaunsa sawaal hal karta hai</td><td>Kya yeh prefix unique hai?</td><td>Kise ise import karna chahiye?</td></tr>
<tr><td>Kahan dikhta hai</td><td>NLRI ke andar, <code>10.30.255.12:1</code></td><td>BGP extended community, <code>target:65030:1</code></td></tr>
<tr><td>Aam value</td><td>Har leaf par unique</td><td>Ek VNI group ke saare leaves par same</td></tr>
<tr><td>Galat ho to</td><td>Prefixes takra sakte hain aur routes ko leaf tak trace karna mushkil hota hai</td><td>Receiver routes chupchaap discard kar deta hai</td></tr></table>
<p>RT mismatch chupa hua qaatil hai: sessions up rehte hain, spine par routes dikhte hain, phir bhi koi tunnel nahi banta. Chapter 8 troubleshooting lab mein is fault ko walk-through karta hai.</p>

<h3>Automatic aur per-VNI targets</h3>
<p><code>vrf-target target:65030:1</code> poore instance ke liye ek target set karta hai. Junos targets automatically derive bhi kar sakta hai aur har VNI ke liye override bhi. Yeh sirf configuration ke roop mein dikhaye gaye hain; simulator commands accept karta hai lekin lab ka pehla hissa single instance target use karta hai.</p>
<pre class="code"><span class="c"># har VNI ka ek auto-derived target (same AS ke leaves bina numbers plan kiye match karte hain)</span>
set switch-options vrf-target auto
<span class="c"># ek VNI ke liye dedicated target; 1020 serve karne wale har leaf ko same rakhna hoga</span>
set protocols evpn vni-options vni 1020 vrf-target target:65040:1020</pre>
<p>Per-VNI form chapter 6 mein use hoga: security team VNI 1020 ke liye apna route target chahti hai.</p>

<h3>Instance aur tunnel verify karna</h3>
<pre class="out">lab@LEAF1&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          V10                   10           
                                                           ge-0/0/2.0*

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point source
Logical System Name       Id  SVTEP-IP         IFL   L3-Idx    SVTEP-Mode
&lt;default&gt;                 0   10.30.255.11     lo0.0 0         
    L2-RTT                   IFL-Idx   Interface    NH-Id   SVTEP-Mode
    default-switch           545       vtep.32768   1739    RNVE
      VNID          MC-Group-IP
      <span class="hl">1010          0.0.0.0</span>

lab@LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags
 <span class="hl">10.30.255.12     546       vtep.32769   1740    RNVE</span>
    VNID          MC-Group-IP
    1010          0.0.0.0</pre>
<p><b>Source</b> VTEP is leaf ka apna loopback hai local tunnel interface <code>vtep.32768</code> ke saath. Har <b>remote</b> VTEP <code>vtep.32769</code>, <code>vtep.32770</code> aise dikhta hai, un VNIs ke saath jo woh aapke saath share karta hai. <code>MC-Group-IP 0.0.0.0</code> ka matlab koi multicast group nahi: BUM ingress replication use karta hai. LEAF2 bhi configure ho jaaye to LEAF1 par LEAF2 VNI 1010 ke remote VTEP ki tarah dikhta hai. Remote list khaali ho to koi kaam ka type-3 route nahi aaya (chapter 8).</p>

<div class="eg"><p><b>Worked example: 4 leaves ke liye identifiers plan karna.</b> Loopbacks 10.30.255.11 se .14. RDs: 10.30.255.11:1, .12:1, .13:1, .14:1 (unique). VNI group ke liye ek RT: target:65030:1 (har jagah same). VLAN V10 ID 10 aur VNI 1010 use karta hai; VLAN V20 ID 20 aur VNI 1020. Har leaf par extended-vni-list [ 1010 1020 ]. Type karne se pehle yeh plan likhne se do sabse aam faults bachte hain: duplicate RD aur mismatched RT.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Do leaves par same RD. (2) Ek leaf par alag RT. (3) VNI <code>vlans</code> mein hai lekin <code>extended-vni-list</code> mein nahi. (4) Fabric-link address ko VTEP source banana. (5) <code>encapsulation vxlan</code> bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> VTEP source loopback hota hai jo <code>vtep-source-interface lo0.0</code> se chuna jaata hai. Ek aur pasandida: <code>vrf-target</code> import aur export dono set karta hai; sirf alag se <code>vrf-target export</code> ya <code>import</code> unhe todta hai.</p></div>

<div class="scn"><h4>Do leaves, ek RD</h4><p>Jaldbaazi ke rollout mein LEAF1 ke switch-options LEAF2 par bina badle copy ho gaye, RD samet. Fabric chala, lekin host move hone par engineers BGP table se pata nahi laga paaye ki route kis leaf ne originate kiya, kyunki har prefix ka RD ek jaisa dikhta tha. Har leaf ko apne loopback se bana RD dene se har route khud samjha dene wala ho gaya: prefix ka RD originating leaf ka naam batata tha.</p><p><b>Lesson:</b> RD har leaf par unique rakho, loopback se derive karke, taaki routes ko unke source tak trace kiya ja sake.</p></div>

<div class="iv"><p class="q">"EVPN mein RD aur RT ka difference samjhao."</p><p>RD NLRI ke aage lagta hai taaki alag leaves ya VNIs ke ek jaise MACs BGP mein takrayein nahi. RT extended community hai jo policy ki tarah kaam karti hai: leaf apne routes RT ke saath export karta hai aur sirf wahi routes import karta hai jinka RT uski import list se match kare. Galat RT se sessions up rehte hain lekin koi route import nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Leaf ko VLAN-to-VNI mapping, vtep-source-interface, RD aur vrf-target chahiye.</li>
<li><code>extended-vni-list</code> tay karti hai ki kaunse VNIs advertise honge.</li>
<li>RD har leaf par unique; RT leaves ke beech match hona chahiye.</li>
<li><code>commit check</code> missing mandatory statements batata hai.</li>
<li><code>show ethernet-switching vxlan-tunnel-end-point source</code> aur <code>remote</code> se verify karo.</li>
</ul></div>
`}};export{e as default};