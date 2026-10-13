var e={id:`native-vlan`,h:{en:`The native VLAN and native VLAN mismatch`,hi:`Native VLAN aur native VLAN mismatch`},body:{en:`
<p>Back at the campus gate, the guard has one extra rule: "anybody who arrives <b>without</b> a badge is sent to the ground floor". That is convenient for delivery staff who never got a badge. But if the two gates at each end of the corridor disagree about which floor is the "ground floor", badge-less visitors walk into the wrong department. That rule is the <b>native VLAN</b>, and the disagreement is a <b>native VLAN mismatch</b>.</p>

<h3>What the native VLAN is</h3>
<p>On an 802.1Q trunk, frames of exactly one VLAN are sent <b>without a tag</b>. That VLAN is the <b>native VLAN</b>. The rule works in both directions:</p>
<ul>
<li>Frames from the native VLAN leave the trunk <b>untagged</b>.</li>
<li>Any <b>untagged</b> frame that arrives on the trunk is placed into the native VLAN.</li>
</ul>
<p>The default native VLAN is <b>1</b>. The idea comes from the early days of 802.1Q, when a trunk might pass through devices that did not understand tags. Cisco switches also send some control traffic (such as CDP, VTP and DTP) untagged on trunks. ISL has no native VLAN at all; this is purely an 802.1Q concept.</p>

<h3>Configuring it</h3>
<pre class="code"><span class="c">! Lab 2: on BOTH SW1 and SW2</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport trunk native vlan 99</pre>
<p>The native VLAN is a <b>local setting on each end</b>. Nothing in 802.1Q negotiates it or checks it. If you change one side and not the other, the trunk keeps running, but the two ends now disagree.</p>

<h3>What happens on a mismatch</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SW1 native 1 sends an untagged VLAN 1 frame; SW2 native 99 places it into VLAN 99">
<rect x="30" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 1</text>
<rect x="460" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 99</text>
<line x1="180" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="4"/>
<rect x="250" y="70" width="140" height="26" rx="4" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">untagged frame</text>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">sent from VLAN 1</text>
<text x="535" y="160" text-anchor="middle" class="svg-accent" font-size="12">lands in VLAN 99</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Two different VLANs are silently joined on this link</text>
</svg><p class="cap">With a mismatch, untagged traffic crosses from one VLAN into another. Tagged VLANs are not affected.</p></div>
<p>Three things happen, and you should recognise all of them:</p>
<ol>
<li><b>Traffic leaks between VLANs.</b> An untagged frame from VLAN 1 on SW1 arrives at SW2 and is put into VLAN 99, and the reverse. Two broadcast domains are merged on that link.</li>
<li><b>CDP reports it</b> (if CDP runs on both switches), roughly once a minute:<br/><code>%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (99), with SW1 GigabitEthernet0/0 (1).</code></li>
<li><b>Per-VLAN spanning tree protects you.</b> PVST+ and Rapid PVST+ send BPDUs that carry the sender's VLAN, detect the inconsistency and <b>block</b> the port for the two affected VLANs (state <code>BKN*</code>, type <code>*PVID_Inc</code>). The leak is stopped, but now both native VLANs are dead on that trunk.</li>
</ol>
<p>Every tagged VLAN keeps working normally. That is why the fault looks random to users: most departments are fine, and only whoever lives in the two native VLANs (often management) is affected.</p>
<pre class="out">SW2# show spanning-tree vlan 99 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/0               Desg BKN*4         128.1    P2p *PVID_Inc</span>
Gi0/1               Desg FWD 4         128.2    P2p

SW2# show interfaces trunk | include Port|Gi0/0
Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      99</span></pre>
<p>After both ends use 99, lab 2's last task checks that VLAN 99 is <code>FWD</code> on Gi0/0 on both switches and that VLAN 99 appears in the last block of <code>show interfaces trunk</code>.</p>

<div class="eg"><p><b>Worked example: the double-tagging attack.</b> Why do security guides say "never use VLAN 1 as native"? Suppose the trunk's native VLAN is 1 and an attacker's PC sits on an access port in VLAN 1. The attacker crafts a frame with <b>two</b> tags: outer tag VID 1, inner tag VID 20 (the victim VLAN).</p>
<ol>
<li>SW1 receives it on the VLAN 1 port and removes the outer tag (VID 1), which matches the port's VLAN. To send it on the trunk it would normally add a VLAN 1 tag, but VLAN 1 is native, so it adds <b>no tag</b>. The frame leaves carrying only the <b>inner</b> tag, VID 20.</li>
<li>SW2 sees a frame tagged VID 20 and forwards it into VLAN 20.</li>
</ol>
<p>The attacker has injected traffic into VLAN 20 without a router. The attack is one-way (replies do not come back), but it can deliver malicious packets. Defences: make the native VLAN an <b>unused</b> VLAN (for example 999) that no access port uses, move users out of VLAN 1, and optionally force tagging of the native VLAN too with the global command <code>vlan dot1q tag native</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing the native VLAN on one end during a change window and forgetting the other; using the management VLAN as native (a mismatch then blocks management, the one thing you need to fix it remotely); and putting user ports into the native VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> A native VLAN mismatch does <b>not</b> bring the trunk down and does <b>not</b> affect tagged VLANs. The native VLAN is not negotiated; it is detected by CDP and PVST+. And frames in the native VLAN are untagged, unless <code>vlan dot1q tag native</code> is configured.</p></div>

<div class="scn"><h4>A contractor on the camera network</h4><p>A warehouse connected a Cisco access switch to a third-party core switch. The Cisco uplink used the default native VLAN 1; on the core, the port's untagged VLAN (called PVID on that platform) was 30, the CCTV VLAN. The core ran MSTP, not PVST+, and did not speak CDP, so nothing blocked and nothing logged. A contractor plugged a laptop into an unconfigured spare port on the access switch (still in VLAN 1), received an address from the camera DHCP scope and could browse the video recorder. The security review traced it with <code>show interfaces trunk</code> on the Cisco side and the core's port configuration. The fix was an unused native VLAN 999 on both ends and all spare ports parked in a shutdown VLAN.</p><p><b>Lesson:</b> the protective CDP and PVST+ checks only exist between Cisco devices. Match the native VLAN deliberately on every trunk, especially towards other vendors.</p></div>

<div class="iv"><p class="q">"What is the native VLAN, and what happens if the two ends do not match?"</p><p>Strong answer: the native VLAN is the one VLAN sent untagged on an 802.1Q trunk, and any untagged frame received is put into it; default VLAN 1. It is set per side and not negotiated. A mismatch merges the two native VLANs on that link; CDP logs NATIVE_VLAN_MISMATCH and PVST+ blocks both VLANs as PVID-inconsistent, while tagged VLANs keep working. Best practice: an unused native VLAN on both ends, never VLAN 1, optionally <code>vlan dot1q tag native</code>, to defeat double-tagging.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The native VLAN is sent untagged on an 802.1Q trunk; untagged frames received go into it. Default VLAN 1.</li>
<li>It is configured per side with <code>switchport trunk native vlan N</code> and is never negotiated.</li>
<li>Mismatch symptoms: CDP NATIVE_VLAN_MISMATCH logs, PVST+ BKN* *PVID_Inc on the two native VLANs, tagged VLANs unaffected.</li>
<li>Use an unused native VLAN such as 999 on both ends; keep users and management out of it.</li>
<li>This defeats double-tagging VLAN hopping; <code>vlan dot1q tag native</code> adds further protection.</li>
</ul></div>
`,hi:`
<p>Campus gate par wapas chalo, guard ka ek extra rule hai: "jo bhi <b>bina</b> badge ke aaye use ground floor bhej do". Yeh un delivery staff ke liye convenient hai jinhe kabhi badge mila hi nahi. Par agar corridor ke dono ends ke gates is baat par agree na karein ki "ground floor" kaunsa hai, to bina badge wale visitors galat department mein pahunch jaate hain. Woh rule <b>native VLAN</b> hai, aur woh disagreement <b>native VLAN mismatch</b> hai.</p>

<h3>Native VLAN kya hai</h3>
<p>802.1Q trunk par exactly ek VLAN ke frames <b>bina tag ke</b> bheje jaate hain. Woh VLAN <b>native VLAN</b> hai. Rule dono directions mein kaam karta hai:</p>
<ul>
<li>Native VLAN ke frames trunk se <b>untagged</b> nikalte hain.</li>
<li>Trunk par aane wala koi bhi <b>untagged</b> frame native VLAN mein daala jaata hai.</li>
</ul>
<p>Default native VLAN <b>1</b> hai. Yeh idea 802.1Q ke shuruaati dinon se aaya, jab trunk aise devices se guzar sakta tha jo tags nahi samajhte the. Cisco switches kuch control traffic (jaise CDP, VTP aur DTP) bhi trunks par untagged bhejte hain. ISL mein native VLAN hota hi nahi; yeh sirf 802.1Q ka concept hai.</p>

<h3>Ise configure karna</h3>
<pre class="code"><span class="c">! Lab 2: SW1 aur SW2 DONO par</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport trunk native vlan 99</pre>
<p>Native VLAN <b>har end ki local setting</b> hai. 802.1Q mein kuch bhi ise negotiate ya check nahi karta. Agar aap ek side badlo aur doosri nahi, to trunk chalta rehta hai, par dono ends ab disagree karte hain.</p>

<h3>Mismatch par kya hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SW1 native 1 untagged VLAN 1 frame bhejta hai; SW2 native 99 use VLAN 99 mein daalta hai">
<rect x="30" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 1</text>
<rect x="460" y="60" width="150" height="70" rx="8" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="12">native VLAN 99</text>
<line x1="180" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="4"/>
<rect x="250" y="70" width="140" height="26" rx="4" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">untagged frame</text>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">VLAN 1 se bheja</text>
<text x="535" y="160" text-anchor="middle" class="svg-accent" font-size="12">VLAN 99 mein pahuncha</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Is link par do alag VLANs chupchaap jud jaate hain</text>
</svg><p class="cap">Mismatch mein untagged traffic ek VLAN se doosre mein chala jaata hai. Tagged VLANs par asar nahi hota.</p></div>
<p>Teen cheezein hoti hain, aur aapko teeno pehchanni chahiye:</p>
<ol>
<li><b>VLANs ke beech traffic leak hota hai.</b> SW1 par VLAN 1 ka untagged frame SW2 par pahunch kar VLAN 99 mein daala jaata hai, aur ulta bhi. Us link par do broadcast domains mil jaate hain.</li>
<li><b>CDP ise report karta hai</b> (agar dono switches par CDP chal raha hai), lagbhag har minute:<br/><code>%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (99), with SW1 GigabitEthernet0/0 (1).</code></li>
<li><b>Per-VLAN spanning tree aapko bachata hai.</b> PVST+ aur Rapid PVST+ aise BPDUs bhejte hain jinme sender ka VLAN hota hai, inconsistency pakadte hain aur do affected VLANs ke liye port ko <b>block</b> kar dete hain (state <code>BKN*</code>, type <code>*PVID_Inc</code>). Leak ruk jaata hai, par ab us trunk par dono native VLANs mar jaate hain.</li>
</ol>
<p>Har tagged VLAN normally chalta rehta hai. Isiliye users ko fault random lagta hai: zyada tar departments theek hain, aur sirf woh affect hote hain jo do native VLANs mein rehte hain (aksar management).</p>
<pre class="out">SW2# show spanning-tree vlan 99 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/0               Desg BKN*4         128.1    P2p *PVID_Inc</span>
Gi0/1               Desg FWD 4         128.2    P2p

SW2# show interfaces trunk | include Port|Gi0/0
Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      99</span></pre>
<p>Dono ends 99 use karne lagein, uske baad lab 2 ka last task check karta hai ki dono switches par Gi0/0 par VLAN 99 <code>FWD</code> hai aur VLAN 99 <code>show interfaces trunk</code> ke last block mein dikhta hai.</p>

<div class="eg"><p><b>Worked example: double-tagging attack.</b> Security guides kyun kehti hain "VLAN 1 ko kabhi native mat banao"? Maan lo trunk ka native VLAN 1 hai aur attacker ka PC VLAN 1 ke access port par hai. Attacker <b>do</b> tags wala frame banata hai: outer tag VID 1, inner tag VID 20 (victim VLAN).</p>
<ol>
<li>SW1 use VLAN 1 port par receive karta hai aur outer tag (VID 1) hata deta hai, jo port ke VLAN se match karta hai. Trunk par bhejne ke liye normally woh VLAN 1 tag jodta, par VLAN 1 native hai, isliye woh <b>koi tag nahi</b> jodta. Frame sirf <b>inner</b> tag, VID 20, ke saath nikalta hai.</li>
<li>SW2 VID 20 tagged frame dekhta hai aur use VLAN 20 mein forward karta hai.</li>
</ol>
<p>Attacker ne bina router ke VLAN 20 mein traffic inject kar diya. Attack one-way hai (replies wapas nahi aate), par malicious packets deliver kar sakta hai. Bachav: native VLAN ko ek <b>unused</b> VLAN (jaise 999) banao jise koi access port use na kare, users ko VLAN 1 se bahar nikalo, aur optionally global command <code>vlan dot1q tag native</code> se native VLAN ko bhi tag karwao.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Change window ke dauran ek end par native VLAN badalna aur doosra bhool jaana; management VLAN ko native banana (phir mismatch management ko hi block kar deta hai, jo remotely fix karne ke liye aapko chahiye); aur user ports ko native VLAN mein daalna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Native VLAN mismatch trunk ko down <b>nahi</b> karta aur tagged VLANs par asar <b>nahi</b> daalta. Native VLAN negotiate nahi hota; CDP aur PVST+ ise detect karte hain. Aur native VLAN ke frames untagged hote hain, jab tak <code>vlan dot1q tag native</code> configured na ho.</p></div>

<div class="scn"><h4>Camera network par ek contractor</h4><p>Ek warehouse ne Cisco access switch ko third-party core switch se joda. Cisco uplink default native VLAN 1 use karta tha; core par port ka untagged VLAN (us platform par PVID kehte hain) 30 tha, CCTV VLAN. Core PVST+ nahi, MSTP chalata tha, aur CDP nahi bolta tha, isliye na kuch block hua na kuch log hua. Ek contractor ne access switch ke ek unconfigured spare port (abhi bhi VLAN 1 mein) mein laptop lagaya, camera DHCP scope se address liya aur video recorder browse kar liya. Security review ne Cisco side par <code>show interfaces trunk</code> aur core ki port configuration se ise trace kiya. Fix tha dono ends par unused native VLAN 999 aur saare spare ports ko shutdown VLAN mein park karna.</p><p><b>Seekh:</b> CDP aur PVST+ ke protective checks sirf Cisco devices ke beech exist karte hain. Har trunk par native VLAN jaan boojh kar match karo, khaaskar doosre vendors ki taraf.</p></div>

<div class="iv"><p class="q">"Native VLAN kya hai, aur agar dono ends match na karein to kya hota hai?"</p><p>Strong answer: native VLAN woh ek VLAN hai jo 802.1Q trunk par untagged bheja jaata hai, aur receive hone wala har untagged frame usme daala jaata hai; default VLAN 1. Yeh har side par set hota hai aur negotiate nahi hota. Mismatch us link par do native VLANs ko mila deta hai; CDP NATIVE_VLAN_MISMATCH log karta hai aur PVST+ dono VLANs ko PVID-inconsistent ki tarah block karta hai, jabki tagged VLANs chalte rehte hain. Best practice: dono ends par unused native VLAN, kabhi VLAN 1 nahi, optionally <code>vlan dot1q tag native</code>, double-tagging ko harane ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Native VLAN 802.1Q trunk par untagged bheja jaata hai; receive hue untagged frames usme jaate hain. Default VLAN 1.</li>
<li>Yeh har side par <code>switchport trunk native vlan N</code> se configure hota hai aur kabhi negotiate nahi hota.</li>
<li>Mismatch symptoms: CDP NATIVE_VLAN_MISMATCH logs, do native VLANs par PVST+ BKN* *PVID_Inc, tagged VLANs par asar nahi.</li>
<li>Dono ends par 999 jaisa unused native VLAN use karo; users aur management ko usse bahar rakho.</li>
<li>Isse double-tagging VLAN hopping rukta hai; <code>vlan dot1q tag native</code> aur protection deta hai.</li>
</ul></div>
`}};export{e as default};