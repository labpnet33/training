var e={id:`anchoring-guest`,h:{en:`Anchoring and guest design: policy profile anchors, priorities, DMZ anchor (lab wl-mob-guest-anchor)`,hi:`Anchoring aur guest design: policy profile anchors, priorities, DMZ anchor (lab wl-mob-guest-anchor)`},body:{en:`
<h3>A different kind of anchor: on purpose, from the first packet</h3>
<p>In chapter 6 the anchor was an accident of history: it was simply the first controller the client joined. A <b>guest anchor</b> is deliberate. Visitors in Delhi should not touch the Delhi company network at all. From the first packet their traffic is tunnelled to a controller in a protected, isolated place, usually a DMZ at headquarters, and leaves the network there, in a guest-only VLAN behind the firewall. Think of a hotel that gives every visitor a separate visitors' entrance, no matter which floor they are staying on.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Guest anchor design">
<rect x="20" y="30" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">WLC2 foreign</text><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">PP-GUEST: mobility anchor 10.10.99.10</text>
<rect x="450" y="30" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">WLC1 anchor</text><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">PP-GUEST: mobility anchor (export)</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="57" text-anchor="middle" class="svg-accent" font-size="12">data path</text>
<rect x="20" y="150" width="70" height="30" rx="6" fill="#bbf7d0"/><text x="55" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<rect x="110" y="150" width="90" height="30" rx="6" fill="#fde68a"/><text x="155" y="170" text-anchor="middle" class="svg-ink" font-size="12">GUEST1</text>
<line x1="105" y1="100" x2="55" y2="150" stroke="#64748b"/><line x1="90" y1="165" x2="110" y2="165" stroke="#64748b" stroke-dasharray="3 3"/>
<rect x="450" y="150" width="170" height="40" rx="6" fill="#fed7aa"/><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="12">VLAN 50 guest 10.10.50.0/24</text>
<line x1="535" y1="100" x2="535" y2="150" stroke="#64748b"/>
<rect x="450" y="205" width="170" height="30" rx="6" fill="#e2e8f0"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="12">Firewall to internet only</text>
<line x1="535" y1="190" x2="535" y2="205" stroke="#64748b"/>
</svg><p class="cap">Guest in Delhi, anchored in Mumbai. The Delhi AP and WLC2 only carry the tunnel; the guest gets a 10.10.50.x address and exits through the HQ guest VLAN.</p></div>

<h3>How it is configured: the policy profile does the work</h3>
<p>On the 9800 an anchor is not a separate feature of the WLAN; it is a setting of the <b>policy profile</b> used by the guest WLAN. The two controllers use <b>different</b> settings of the <b>same-named</b> policy profile:</p>
<ul>
<li><b>Foreign controller</b> (Delhi, WLC2): <code>mobility anchor &lt;anchor management IP&gt;</code>. You may list up to three anchors, each with a priority. Its own VLAN stays configured but the guest's traffic does not exit there.</li>
<li><b>Anchor controller</b> (Mumbai, WLC1): <code>mobility anchor</code> with no address. This marks the policy profile an <b>Export Anchor</b>: "I accept clients from foreign controllers for this profile".</li>
</ul>
<pre class="code"><span class="c">! WLC2 (foreign): guest anchored to WLC1. A policy profile must be shut down to change it.</span>
wireless profile policy PP-GUEST
 shutdown
 mobility anchor 10.10.99.10
 no shutdown
 exit

<span class="c">! WLC1 (anchor): the same policy profile name, marked export anchor, VLAN 50 on this side.</span>
wireless profile policy PP-GUEST
 shutdown
 vlan 50
 mobility anchor
 no shutdown
 exit</pre>
<p>Priorities: <code>mobility anchor 10.10.99.10 priority 1</code> is the form used in recent IOS XE releases, with up to three anchors and the <b>lowest working priority winning</b>. The pages used to build the simulator confirm the plain <code>mobility anchor &lt;ip&gt;</code> form on all releases; check the release notes of your image for the <code>priority</code> keyword. In the web UI the same settings are on <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b>, Mobility tab of the profile, where you move controllers into the Selected Anchors list and tick Export Anchor on the anchor side. The simulator has no GUI form for this; use the CLI there.</p>

<h3>The anchor's checklist</h3>
<p>The foreign controller will use an anchor only if <b>all</b> of these are true on the anchor, checked in this order by the simulator model:</p>
<ol>
<li>The anchor is a <b>mobility peer that is Up</b> (chapters 4 and 5).</li>
<li>The <b>WLAN profile</b> exists and is enabled on the anchor with the same SSID and security.</li>
<li>A policy profile with the <b>same name</b> exists, is enabled and is an <b>export anchor</b>.</li>
<li>Its <b>VLAN exists</b> in the anchor's VLAN database and has an interface (an SVI with gateway and DHCP) on the anchor.</li>
</ol>
<p>Fail any one and the client is refused. The controller log then shows <code>%CLIENT_ORCH_LOG-3-ANCHOR_FAIL</code> with the reason, and <code>show wireless mobility anchor</code> shows the anchor Down with a detail text.</p>
<pre class="out">WLC2# show wireless mobility anchor

Policy profiles that anchor clients to another controller (foreign side)
Policy Profile       Anchor IP       Priority  Status  Detail
PP-GUEST             10.10.99.11     1         <span class="hl">Down</span>    no controller answers on 10.10.99.11

WLC2# show logging | include ANCHOR
%CLIENT_ORCH_LOG-3-ANCHOR_FAIL: client cannot be placed: policy profile PP-GUEST needs a mobility anchor and none is usable: 10.10.99.11 - no controller answers on 10.10.99.11</pre>
<p>Here the foreign side points at 10.10.99.11, a typo for the real anchor 10.10.99.10. After you fix it, a <b>second</b> defect may appear (the anchor's profile not being an export anchor): clear problems one at a time and re-run the show command after each. Chapter 11 walks the lab with both defects.</p>

<h3>Priorities, load and failure behaviour</h3>
<ul>
<li>With several anchors, a new guest uses the anchor with the lowest working priority. If that anchor is down, the next is used for <i>new</i> clients.</li>
<li>If the anchor fails while a guest is connected, the guest is <b>disassociated</b> and tries again. With a second anchor it reconnects to that one and gets a new address. With no usable anchor, the guest cannot rejoin. (The simulator does exactly this.)</li>
<li>Distributing guests evenly across anchors, sticky anchors and multicast over the tunnel are release-dependent refinements, concept only here.</li>
</ul>

<h3>Guest design rules</h3>
<ol>
<li><b>One guest VLAN, only on the anchor.</b> The guest VLAN never exists on branch switches. The foreign controller carries guests only inside the tunnel.</li>
<li><b>Isolate with the firewall.</b> The anchor's guest SVI belongs behind a firewall or in a DMZ VRF that allows the internet and blocks all private ranges.</li>
<li><b>Put web authentication on the anchor.</b> Central Web Authentication or Local Web Authentication (module wl-secure) redirects guests to a portal; running it on the anchor means the portal and policy live in one place.</li>
<li><b>Add client isolation and rate limits</b> as policy (peer-to-peer blocking, bandwidth contracts).</li>
<li><b>Plan capacity and redundancy</b> for the anchor. It carries all guest traffic from all sites.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A bank has 40 branches, each with a small controller, and a pair of anchors in the HQ DMZ at 10.10.99.10 and 10.10.99.12. Every branch policy profile PP-GUEST lists both anchors, priorities 1 and 2. A visitor in any branch joins NK-GUEST, is tunnelled to HQ and appears with a 10.10.50.x address. The branch LAN holds no guest VLAN, so a visitor cannot reach branch printers or servers even by accident.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Naming the policy profile differently on the two controllers (the name must match). Forgetting the VLAN SVI and DHCP scope for the guest VLAN on the anchor. Editing the policy profile without shutting it down first (the controller refuses). Marking the foreign profile with <code>mobility anchor</code> without an address, which is the anchor form. Anchoring to a controller that is only a member in one direction.</p></div>

<div class="exam"><p><b>Exam trap.</b> The export-anchor profile on the anchor and the anchor list on the foreign are <b>both required</b>, and the profile names must match. Also remember the foreign controller still needs a local VLAN configured in the profile; the guest does not exit there. The anchor can be a Catalyst 9800 or, in mixed networks, an AireOS controller using inter-release controller mobility; check supported combinations.</p></div>

<div class="scn"><h4>Guests on the finance VLAN</h4><p>A branch had been given a guest SSID with a local guest VLAN trunked to the branch switch for speed. A misconfigured trunk later allowed the guest VLAN into the finance switch ports, and a visitor's laptop reached an internal share. The company redesigned with a DMZ anchor: branches keep no guest VLAN, the anchor places guests behind a firewall, and the branch switches only carry the tunnel. A similar mistake became impossible because the VLAN no longer existed at the branch.</p><p><b>Lesson:</b> the safest guest VLAN is the one that does not exist where employees plug in.</p></div>

<div class="iv"><p class="q">"How do you build guest Wi-Fi for 40 branches without spreading a guest VLAN everywhere?"</p><p>Anchor guests to a pair of controllers in the HQ DMZ. In each branch policy profile list the anchors with priorities; in the anchor's matching policy profile enable export anchor. The tunnel carries guest traffic, the guest VLAN exists only at the anchor behind a firewall, and web authentication runs there. Mention failure behaviour and sizing the anchor.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A guest anchor is a deliberate anchor set in the policy profile: <code>mobility anchor &lt;ip&gt;</code> on the foreign, <code>mobility anchor</code> on the anchor.</li>
<li>Profile names must match; edit profiles shut down.</li>
<li>The anchor needs the peer Up, the same WLAN, an enabled export-anchor policy and a VLAN with an interface.</li>
<li>Up to three anchors; the lowest working priority wins; no anchor means no join.</li>
<li>Design rule: the guest VLAN exists only at the DMZ anchor, with web authentication and firewall there.</li>
</ul></div>
`,hi:`
<h3>Alag kism ka anchor: jaan boojh kar, pehle packet se</h3>
<p>Chapter 6 mein anchor ek ittefaq tha: woh bas pehla controller tha jis par client join hua. <b>Guest anchor</b> jaan boojh kar banaya jaata hai. Delhi ke visitors ko Delhi ke company network ko chhoona hi nahi chahiye. Pehle packet se unka traffic ek protected, isolated jagah ke controller tak tunnel hota hai, aam taur par headquarters ka DMZ, aur wahin network se nikalta hai, firewall ke peeche guest-only VLAN mein. Socho ek hotel jo har visitor ko alag visitors ka entrance deta hai, chahe woh kisi bhi floor par rukein.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Guest anchor design">
<rect x="20" y="30" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="14">WLC2 foreign</text><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">PP-GUEST: mobility anchor 10.10.99.10</text>
<rect x="450" y="30" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="14">WLC1 anchor</text><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="12">PP-GUEST: mobility anchor (export)</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/><text x="320" y="57" text-anchor="middle" class="svg-accent" font-size="12">data path</text>
<rect x="20" y="150" width="70" height="30" rx="6" fill="#bbf7d0"/><text x="55" y="170" text-anchor="middle" class="svg-ink" font-size="13">AP3</text>
<rect x="110" y="150" width="90" height="30" rx="6" fill="#fde68a"/><text x="155" y="170" text-anchor="middle" class="svg-ink" font-size="12">GUEST1</text>
<line x1="105" y1="100" x2="55" y2="150" stroke="#64748b"/><line x1="90" y1="165" x2="110" y2="165" stroke="#64748b" stroke-dasharray="3 3"/>
<rect x="450" y="150" width="170" height="40" rx="6" fill="#fed7aa"/><text x="535" y="175" text-anchor="middle" class="svg-ink" font-size="12">VLAN 50 guest 10.10.50.0/24</text>
<line x1="535" y1="100" x2="535" y2="150" stroke="#64748b"/>
<rect x="450" y="205" width="170" height="30" rx="6" fill="#e2e8f0"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="12">Firewall sirf internet tak</text>
<line x1="535" y1="190" x2="535" y2="205" stroke="#64748b"/>
</svg><p class="cap">Delhi ka guest, Mumbai mein anchored. Delhi ka AP aur WLC2 sirf tunnel carry karte hain; guest ko 10.10.50.x address milta hai aur woh HQ guest VLAN se nikalta hai.</p></div>

<h3>Configure kaise hota hai: policy profile kaam karta hai</h3>
<p>9800 par anchor WLAN ka alag feature nahi hai; yeh guest WLAN ke use hone wale <b>policy profile</b> ki setting hai. Dono controllers <b>same naam</b> ke policy profile ki <b>alag</b> settings use karte hain:</p>
<ul>
<li><b>Foreign controller</b> (Delhi, WLC2): <code>mobility anchor &lt;anchor management IP&gt;</code>. Aap teen tak anchors list kar sakte ho, har ek priority ke saath. Uska apna VLAN configured rehta hai lekin guest ka traffic wahan se nahi nikalta.</li>
<li><b>Anchor controller</b> (Mumbai, WLC1): <code>mobility anchor</code> bina address ke. Yeh policy profile ko <b>Export Anchor</b> mark karta hai: "main is profile ke liye foreign controllers ke clients accept karta hoon".</li>
</ul>
<pre class="code"><span class="c">! WLC2 (foreign): guest WLC1 par anchored. Policy profile badalne ke liye shut hona chahiye.</span>
wireless profile policy PP-GUEST
 shutdown
 mobility anchor 10.10.99.10
 no shutdown
 exit

<span class="c">! WLC1 (anchor): wahi policy profile naam, export anchor mark, is side par VLAN 50.</span>
wireless profile policy PP-GUEST
 shutdown
 vlan 50
 mobility anchor
 no shutdown
 exit</pre>
<p>Priorities: <code>mobility anchor 10.10.99.10 priority 1</code> recent IOS XE releases ka form hai, teen tak anchors ke saath aur <b>sabse kam working priority jeetti hai</b>. Simulator banane mein jo pages use hue woh sabhi releases par seedha <code>mobility anchor &lt;ip&gt;</code> form confirm karte hain; <code>priority</code> keyword ke liye apni image ke release notes check karo. Web UI mein yahi settings <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> mein profile ke Mobility tab par hain, jahan controllers ko Selected Anchors list mein daalte ho aur anchor side par Export Anchor tick karte ho. Simulator mein iska GUI form nahi hai; wahan CLI use karo.</p>

<h3>Anchor ki checklist</h3>
<p>Foreign controller anchor ko tabhi use karega jab anchor par <b>sab</b> yeh sach hon, jo simulator model is order mein check karta hai:</p>
<ol>
<li>Anchor ek <b>mobility peer hai jo Up hai</b> (chapters 4 aur 5).</li>
<li><b>WLAN profile</b> anchor par exist karta hai aur enabled hai, same SSID aur security ke saath.</li>
<li><b>Same naam</b> ka policy profile exist karta hai, enabled hai aur <b>export anchor</b> hai.</li>
<li>Uska <b>VLAN exist karta hai</b> anchor ke VLAN database mein aur anchor par uska interface hai (gateway aur DHCP ke saath SVI).</li>
</ol>
<p>Koi bhi fail ho to client refuse hota hai. Controller log mein tab reason ke saath <code>%CLIENT_ORCH_LOG-3-ANCHOR_FAIL</code> dikhta hai, aur <code>show wireless mobility anchor</code> anchor ko detail text ke saath Down dikhata hai.</p>
<pre class="out">WLC2# show wireless mobility anchor

Policy profiles that anchor clients to another controller (foreign side)
Policy Profile       Anchor IP       Priority  Status  Detail
PP-GUEST             10.10.99.11     1         <span class="hl">Down</span>    no controller answers on 10.10.99.11

WLC2# show logging | include ANCHOR
%CLIENT_ORCH_LOG-3-ANCHOR_FAIL: client cannot be placed: policy profile PP-GUEST needs a mobility anchor and none is usable: 10.10.99.11 - no controller answers on 10.10.99.11</pre>
<p>Yahan foreign side 10.10.99.11 ko point karta hai, jo asli anchor 10.10.99.10 ka typo hai. Ise fix karne ke baad <b>doosra</b> defect dikh sakta hai (anchor ka profile export anchor nahi hai): problems ek ek karke saaf karo aur har baar show command dobara chalao. Chapter 11 lab ko dono defects ke saath walk karta hai.</p>

<h3>Priorities, load aur failure behaviour</h3>
<ul>
<li>Kai anchors hon to naya guest sabse kam working priority wale anchor ko use karta hai. Agar woh anchor down ho, to <i>naye</i> clients ke liye agla use hota hai.</li>
<li>Agar guest connected hone ke dauran anchor fail ho, to guest <b>disassociate</b> ho jaata hai aur dobara try karta hai. Doosra anchor ho to woh us se reconnect hota hai aur naya address paata hai. Koi usable anchor na ho to guest rejoin nahi kar sakta. (Simulator bilkul aisa hi karta hai.)</li>
<li>Guests ko anchors ke beech barabar baantna, sticky anchors aur tunnel par multicast release-dependent refinements hain, yahan concept only.</li>
</ul>

<h3>Guest design rules</h3>
<ol>
<li><b>Ek guest VLAN, sirf anchor par.</b> Guest VLAN branch switches par kabhi nahi hota. Foreign controller guests ko sirf tunnel ke andar carry karta hai.</li>
<li><b>Firewall se isolate karo.</b> Anchor ka guest SVI firewall ke peeche ya DMZ VRF mein ho jo internet allow kare aur saari private ranges block kare.</li>
<li><b>Web authentication anchor par rakho.</b> Central Web Authentication ya Local Web Authentication (module wl-secure) guests ko portal par redirect karta hai; anchor par chalane se portal aur policy ek jagah rehte hain.</li>
<li><b>Client isolation aur rate limits</b> policy ke taur par jodo (peer-to-peer blocking, bandwidth contracts).</li>
<li>Anchor ke liye <b>capacity aur redundancy plan karo</b>. Woh saari sites ka saara guest traffic carry karta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek bank ke 40 branches hain, har ek mein chhota controller, aur HQ DMZ mein 10.10.99.10 aur 10.10.99.12 par anchors ki pair. Har branch ka policy profile PP-GUEST dono anchors ko priorities 1 aur 2 ke saath list karta hai. Kisi bhi branch ka visitor NK-GUEST join karta hai, HQ tak tunnel hota hai aur 10.10.50.x address ke saath dikhta hai. Branch LAN mein koi guest VLAN nahi, isliye visitor galti se bhi branch printers ya servers tak nahi pahunch sakta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Do controllers par policy profile ko alag naam dena (naam match karna chahiye). Anchor par guest VLAN ka SVI aur DHCP scope bhool jaana. Policy profile ko shut kiye bina edit karna (controller refuse karta hai). Foreign profile mein bina address ke <code>mobility anchor</code> daalna, jo anchor ka form hai. Aise controller par anchor karna jo sirf ek direction mein member hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Anchor par export-anchor profile aur foreign par anchor list <b>dono zaroori</b> hain, aur profile names match hone chahiye. Yeh bhi yaad rakho ki foreign controller ko profile mein local VLAN configured chahiye; guest wahan se nahi nikalta. Anchor Catalyst 9800 ho sakta hai ya mixed networks mein inter-release controller mobility se AireOS controller; supported combinations check karo.</p></div>

<div class="scn"><h4>Finance VLAN par guests</h4><p>Ek branch ko speed ke liye guest SSID diya gaya tha, local guest VLAN branch switch par trunked. Baad mein ek galat trunk ne guest VLAN ko finance switch ports mein aane diya, aur ek visitor ka laptop internal share tak pahunch gaya. Company ne DMZ anchor se redesign kiya: branches mein koi guest VLAN nahi, anchor guests ko firewall ke peeche rakhta hai, aur branch switches sirf tunnel carry karte hain. Aisi galti ab impossible thi kyunki VLAN branch par exist hi nahi karta tha.</p><p><b>Lesson:</b> sabse safe guest VLAN woh hai jo wahan exist nahi karta jahan employees plug in karte hain.</p></div>

<div class="iv"><p class="q">"40 branches ke liye guest Wi-Fi kaise banaoge bina har jagah guest VLAN failaye?"</p><p>Guests ko HQ DMZ ke controllers ki pair par anchor karo. Har branch policy profile mein anchors ko priorities ke saath list karo; anchor ke matching policy profile mein export anchor enable karo. Tunnel guest traffic carry karta hai, guest VLAN sirf anchor par firewall ke peeche hota hai, aur web authentication wahin chalta hai. Failure behaviour aur anchor sizing mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest anchor policy profile mein jaan boojh kar set kiya anchor hai: foreign par <code>mobility anchor &lt;ip&gt;</code>, anchor par <code>mobility anchor</code>.</li>
<li>Profile names match hone chahiye; profiles shut karke edit karo.</li>
<li>Anchor ko peer Up, same WLAN, enabled export-anchor policy aur interface wala VLAN chahiye.</li>
<li>Teen tak anchors; sabse kam working priority jeetti hai; anchor nahi to join nahi.</li>
<li>Design rule: guest VLAN sirf DMZ anchor par, web authentication aur firewall ke saath.</li>
</ul></div>
`}};export{e as default};