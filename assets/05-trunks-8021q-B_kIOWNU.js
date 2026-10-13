var e={id:`trunks-8021q`,h:{en:`802.1Q trunks, allowed VLANs and the native VLAN`,hi:`802.1Q trunks, allowed VLANs aur native VLAN`},body:{en:`
<h3>The analogy: one lift, many floors, a badge on everyone</h3>
<p>The building has one lift shaft that serves every floor. People from reception, staff and accounts all ride the same lift, so each person wears a badge showing their floor. When the doors open, the lift operator reads the badge and lets each person out only on their own floor. A <b>trunk</b> is that lift: one link carrying many VLANs. The badge is the <b>802.1Q tag</b>, a small label the switch adds to each frame so the device at the other end knows which VLAN it belongs to.</p>

<h3>Why trunks exist</h3>
<p>With two VLANs on SW1 and a router that must serve both, you could run two cables, one per VLAN, into two router ports. With ten VLANs and four switches that becomes absurd. A trunk carries every VLAN over one link (or one bundle of links, chapter 9). Trunks are used switch to switch, switch to router (router-on-a-stick), switch to firewall, and switch to virtualisation hosts whose virtual machines live in many VLANs.</p>

<h3>Inside the 802.1Q tag</h3>
<p><b>IEEE 802.1Q</b> is the standard for VLAN tagging, supported by every vendor. (An old Cisco-only method called ISL is obsolete.) The switch inserts a 4-byte tag between the source MAC and the EtherType of the original frame, then recalculates the frame check sequence.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="802.1Q tag inside an Ethernet frame">
<rect x="10" y="20" width="90" height="40" fill="#e2e8f0"/><text x="55" y="45" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="100" y="20" width="90" height="40" fill="#e2e8f0"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text>
<rect x="190" y="20" width="110" height="40" fill="#fde68a"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="12">802.1Q tag 4 B</text>
<rect x="300" y="20" width="80" height="40" fill="#e2e8f0"/><text x="340" y="45" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text>
<rect x="380" y="20" width="170" height="40" fill="#bbf7d0"/><text x="465" y="45" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="550" y="20" width="80" height="40" fill="#e2e8f0"/><text x="590" y="45" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="190" y1="60" x2="60" y2="100" stroke="#64748b"/><line x1="300" y1="60" x2="600" y2="100" stroke="#64748b"/>
<rect x="60" y="100" width="200" height="40" fill="#fed7aa"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100 (16 bits)</text>
<rect x="260" y="100" width="110" height="40" fill="#ddd6fe"/><text x="315" y="125" text-anchor="middle" class="svg-ink" font-size="12">PCP 3 bits</text>
<rect x="370" y="100" width="70" height="40" fill="#ddd6fe"/><text x="405" y="125" text-anchor="middle" class="svg-ink" font-size="12">DEI 1</text>
<rect x="440" y="100" width="160" height="40" fill="#bae6fd"/><text x="520" y="125" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID 12 bits</text>
<text x="10" y="162" class="svg-muted" font-size="12">A standard 1518-byte frame becomes 1522 bytes when tagged.</text>
</svg><p class="cap">The tag: TPID says "a tag follows", PCP carries priority (CoS), DEI marks drop eligibility, VID is the VLAN number.</p></div>
<ul>
<li><b>TPID</b> (Tag Protocol Identifier) is always 0x8100 for 802.1Q; it tells the receiver "this frame is tagged".</li>
<li><b>PCP</b> (Priority Code Point) is 3 bits of priority, 0 to 7, also called <b>CoS</b> or 802.1p. Voice uses 5.</li>
<li><b>DEI</b> (Drop Eligible Indicator) is 1 bit marking frames that may be dropped first under congestion.</li>
<li><b>VID</b> is the 12-bit VLAN ID, which is why VLANs run from 1 to 4094.</li>
</ul>

<h3>Configure the lab trunk</h3>
<pre class="code"><span class="c">! Lab task: Gi0/0 on SW1 is the trunk to R1</span>
configure terminal
interface GigabitEthernet0/0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
end
<span class="c">! Older switches that also support ISL need this first:</span>
<span class="c">!  switchport trunk encapsulation dot1q</span></pre>
<p><code>switchport mode trunk</code> makes the port a permanent trunk. <code>switchport trunk allowed vlan 10,20</code> limits which VLANs may cross it. By default a trunk allows all VLANs (1 to 4094); pruning the list to what is needed is good practice, because it keeps unneeded broadcasts off the link and limits exposure.</p>
<pre class="out">SW1#show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,20</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,20

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,20</pre>
<p>Read it in four blocks: is the port trunking, which VLANs are allowed, which of those actually exist on this switch, and which are forwarding (not blocked by spanning tree). A VLAN must appear in <b>all four</b> blocks to pass traffic. If VLAN 20 is in the first list but missing from the second, it is allowed but not created on this switch.</p>

<h3>Editing the allowed list safely</h3>
<p>This is the single most common trunk outage. <code>switchport trunk allowed vlan 30</code> <b>replaces</b> the list with just 30. To change it without losing existing VLANs use the keywords:</p>
<pre class="code">switchport trunk allowed vlan add 30
switchport trunk allowed vlan remove 20
switchport trunk allowed vlan except 99
switchport trunk allowed vlan all</pre>

<h3>The native VLAN</h3>
<p>802.1Q has one exception to tagging: frames in the <b>native VLAN</b> cross the trunk <b>untagged</b>, and any untagged frame received on a trunk is placed into the native VLAN. The default native VLAN is 1. Both ends of a trunk <b>must agree</b> on the native VLAN, otherwise untagged frames from VLAN 1 on one side land in VLAN 999 on the other, silently merging two broadcast domains. Cisco-style switches detect this with CDP and log it:</p>
<pre class="out">%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (999), with SW2 GigabitEthernet0/0 (1).</pre>
<p>Best practice is to set the native VLAN to an unused VLAN on both ends (<code>switchport trunk native vlan 999</code>), keep it off the allowed list for user traffic, or tag it too where the platform supports <code>vlan dot1q tag native</code>. This defeats a <b>double-tagging (VLAN hopping)</b> attack, where an attacker in the native VLAN sends a frame with two tags so that the outer one is stripped and the inner one delivers it into another VLAN.</p>

<div class="eg"><p><b>Worked example.</b> SW1 and SW2 are joined by a trunk carrying VLANs 10, 20 and 150, with native VLAN 999. The correct config on both sides is <code>switchport mode trunk</code>, <code>switchport trunk native vlan 999</code>, <code>switchport trunk allowed vlan 10,20,150,999</code>. A PC frame in VLAN 20 leaves SW1 with VID 20 in the tag; SW2 reads 20, removes the tag and floods or forwards it only to its VLAN 20 ports.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>allowed vlan N</code> without <code>add</code> and wiping every other VLAN off the trunk. (2) Native VLAN mismatches after one side is changed. (3) Mode mismatch: one end trunk, the other end access, so tagged frames arrive at a port that expects untagged ones. (4) Leaving user ports in a dynamic mode that can negotiate a trunk.</p></div>

<div class="exam"><p><b>Exam traps.</b> 802.1Q adds a <b>4-byte</b> tag; the VLAN ID is <b>12 bits</b>; priority is the 3-bit PCP (802.1p/CoS). The native VLAN is the <b>only untagged</b> VLAN on a trunk, and it must match on both ends. Trunks carry VLANs, they do not route them.</p></div>

<div class="scn"><h4>The CCTV change that broke two departments</h4><p>An engineer added the new camera VLAN 50 to the uplink with <code>switchport trunk allowed vlan 50</code>. Cameras came online, and minutes later Accounts (VLAN 10) and HR (VLAN 20) lost the server farm. <code>show interfaces trunk</code> showed "Vlans allowed on trunk: 50". The command had replaced the list instead of adding to it. Re-entering <code>switchport trunk allowed vlan 10,20,50,999</code> restored service.</p><p><b>Lesson:</b> on a live trunk, always use <code>add</code> or <code>remove</code>, and read <code>show interfaces trunk</code> before and after the change.</p></div>

<div class="iv"><p class="q">"What is the native VLAN and why do people change it?"</p><p>Strong answer: on an 802.1Q trunk it is the one VLAN whose frames are sent untagged, and untagged frames received on the trunk are placed into it. It defaults to VLAN 1 and must match on both ends, or traffic leaks between VLANs and CDP reports a mismatch. Engineers move it to an unused VLAN (or tag it) to prevent double-tagging VLAN hopping and to keep VLAN 1 free of user traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A trunk carries many VLANs on one link using 802.1Q tags (4 bytes: TPID 0x8100, PCP, DEI, 12-bit VID).</li>
<li>Configure with <code>switchport mode trunk</code> and limit VLANs with <code>switchport trunk allowed vlan</code>.</li>
<li>Use <code>add</code>/<code>remove</code> on live trunks; a bare list replaces everything.</li>
<li>The native VLAN is untagged, defaults to 1, must match on both ends; move it to an unused VLAN.</li>
<li><code>show interfaces trunk</code>: a VLAN must be allowed, active and forwarding to pass.</li>
</ul></div>
`,hi:`
<h3>Analogy: ek lift, kai floors, sabke gale mein badge</h3>
<p>Building mein ek lift shaft hai jo har floor ko serve karti hai. Reception, staff aur accounts ke log sab ek hi lift mein chadhte hain, isliye har insaan ek badge pehenta hai jo uska floor batata hai. Jab darwaze khulte hain, lift operator badge padhta hai aur har insaan ko sirf uske apne floor par utarne deta hai. <b>Trunk</b> wahi lift hai: ek link jo kai VLANs carry karta hai. Badge <b>802.1Q tag</b> hai, ek chhota label jo switch har frame mein jodta hai taaki doosre end ka device jaane ki frame kis VLAN ka hai.</p>

<h3>Trunks kyun hote hain</h3>
<p>SW1 par do VLANs aur ek router jise dono ko serve karna hai, aap do cables chala sakte ho, har VLAN ke liye ek, router ke do ports mein. Das VLANs aur chaar switches ke saath yeh bekaar ho jaata hai. Trunk har VLAN ko ek link (ya links ke ek bundle, chapter 9) par le jaata hai. Trunks switch se switch, switch se router (router-on-a-stick), switch se firewall, aur switch se un virtualisation hosts tak use hote hain jinke virtual machines kai VLANs mein rehte hain.</p>

<h3>802.1Q tag ke andar</h3>
<p><b>IEEE 802.1Q</b> VLAN tagging ka standard hai, har vendor ise support karta hai. (ISL naam ka purana Cisco-only tareeka obsolete hai.) Switch original frame ke source MAC aur EtherType ke beech 4-byte tag daalta hai, phir frame check sequence dobara calculate karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ethernet frame ke andar 802.1Q tag">
<rect x="10" y="20" width="90" height="40" fill="#e2e8f0"/><text x="55" y="45" text-anchor="middle" class="svg-ink" font-size="12">Dest MAC</text>
<rect x="100" y="20" width="90" height="40" fill="#e2e8f0"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="12">Src MAC</text>
<rect x="190" y="20" width="110" height="40" fill="#fde68a"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="12">802.1Q tag 4 B</text>
<rect x="300" y="20" width="80" height="40" fill="#e2e8f0"/><text x="340" y="45" text-anchor="middle" class="svg-ink" font-size="12">EtherType</text>
<rect x="380" y="20" width="170" height="40" fill="#bbf7d0"/><text x="465" y="45" text-anchor="middle" class="svg-ink" font-size="12">Payload (IP packet)</text>
<rect x="550" y="20" width="80" height="40" fill="#e2e8f0"/><text x="590" y="45" text-anchor="middle" class="svg-ink" font-size="12">FCS</text>
<line x1="190" y1="60" x2="60" y2="100" stroke="#64748b"/><line x1="300" y1="60" x2="600" y2="100" stroke="#64748b"/>
<rect x="60" y="100" width="200" height="40" fill="#fed7aa"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">TPID 0x8100 (16 bits)</text>
<rect x="260" y="100" width="110" height="40" fill="#ddd6fe"/><text x="315" y="125" text-anchor="middle" class="svg-ink" font-size="12">PCP 3 bits</text>
<rect x="370" y="100" width="70" height="40" fill="#ddd6fe"/><text x="405" y="125" text-anchor="middle" class="svg-ink" font-size="12">DEI 1</text>
<rect x="440" y="100" width="160" height="40" fill="#bae6fd"/><text x="520" y="125" text-anchor="middle" class="svg-ink" font-size="12">VLAN ID 12 bits</text>
<text x="10" y="162" class="svg-muted" font-size="12">Standard 1518-byte frame tag lagne par 1522 bytes ka ho jaata hai.</text>
</svg><p class="cap">Tag: TPID kehta hai "aage tag hai", PCP priority (CoS) le jaata hai, DEI drop eligibility mark karta hai, VID VLAN number hai.</p></div>
<ul>
<li><b>TPID</b> (Tag Protocol Identifier) 802.1Q ke liye hamesha 0x8100 hota hai; yeh receiver ko batata hai "yeh frame tagged hai".</li>
<li><b>PCP</b> (Priority Code Point) priority ke 3 bits hain, 0 se 7, ise <b>CoS</b> ya 802.1p bhi kehte hain. Voice 5 use karta hai.</li>
<li><b>DEI</b> (Drop Eligible Indicator) 1 bit hai jo un frames ko mark karta hai jo congestion mein pehle drop ho sakte hain.</li>
<li><b>VID</b> 12-bit VLAN ID hai, isiliye VLANs 1 se 4094 tak chalte hain.</li>
</ul>

<h3>Lab trunk configure karo</h3>
<pre class="code"><span class="c">! Lab task: SW1 ka Gi0/0 R1 tak ka trunk hai</span>
configure terminal
interface GigabitEthernet0/0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
end
<span class="c">! Purane switches jo ISL bhi support karte hain, unhe pehle yeh chahiye:</span>
<span class="c">!  switchport trunk encapsulation dot1q</span></pre>
<p><code>switchport mode trunk</code> port ko permanent trunk bana deta hai. <code>switchport trunk allowed vlan 10,20</code> limit karta hai ki kaunse VLANs ise cross kar sakte hain. By default trunk saare VLANs (1 se 4094) allow karta hai; list ko zaroorat tak prune karna achhi practice hai, kyunki isse faltu broadcasts link se door rehte hain aur exposure kam hota hai.</p>
<pre class="out">SW1#show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,20</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,20

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,20</pre>
<p>Ise chaar blocks mein padho: kya port trunking kar raha hai, kaunse VLANs allowed hain, unmein se kaunse is switch par sach mein exist karte hain, aur kaunse forwarding hain (spanning tree ne block nahi kiye). Traffic pass karne ke liye VLAN ko <b>chaaron</b> blocks mein dikhna chahiye. Agar VLAN 20 pehli list mein hai lekin doosri se gayab hai, to woh allowed hai lekin is switch par bana nahi hai.</p>

<h3>Allowed list ko safely edit karna</h3>
<p>Yeh sabse common trunk outage hai. <code>switchport trunk allowed vlan 30</code> list ko sirf 30 se <b>replace</b> kar deta hai. Existing VLANs khoye bina badalne ke liye keywords use karo:</p>
<pre class="code">switchport trunk allowed vlan add 30
switchport trunk allowed vlan remove 20
switchport trunk allowed vlan except 99
switchport trunk allowed vlan all</pre>

<h3>Native VLAN</h3>
<p>802.1Q mein tagging ka ek exception hai: <b>native VLAN</b> ke frames trunk par <b>untagged</b> jaate hain, aur trunk par aaya koi bhi untagged frame native VLAN mein daala jaata hai. Default native VLAN 1 hai. Trunk ke dono ends ko native VLAN par <b>agree karna zaroori</b> hai, warna ek side ke VLAN 1 ke untagged frames doosri side VLAN 999 mein pahunchte hain, aur do broadcast domains chup-chaap mil jaate hain. Cisco-style switches ise CDP se detect karke log karte hain:</p>
<pre class="out">%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (999), with SW2 GigabitEthernet0/0 (1).</pre>
<p>Best practice hai dono ends par native VLAN ko ek unused VLAN par set karo (<code>switchport trunk native vlan 999</code>), use user traffic ki allowed list se bahar rakho, ya jahan platform <code>vlan dot1q tag native</code> support karta hai wahan use bhi tag karo. Isse <b>double-tagging (VLAN hopping)</b> attack fail hota hai, jismein native VLAN ka attacker do tags wala frame bhejta hai taaki bahar wala tag hat jaaye aur andar wala use doosre VLAN mein pahuncha de.</p>

<div class="eg"><p><b>Worked example.</b> SW1 aur SW2 ek trunk se jude hain jo VLANs 10, 20 aur 150 carry karta hai, native VLAN 999 ke saath. Dono sides par sahi config hai <code>switchport mode trunk</code>, <code>switchport trunk native vlan 999</code>, <code>switchport trunk allowed vlan 10,20,150,999</code>. VLAN 20 ka PC frame SW1 se tag mein VID 20 ke saath nikalta hai; SW2 20 padhta hai, tag hataata hai aur use sirf apne VLAN 20 ports par flood ya forward karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>add</code> ke bina <code>allowed vlan N</code> use karke trunk se baaki har VLAN mita dena. (2) Ek side badalne ke baad native VLAN mismatch. (3) Mode mismatch: ek end trunk, doosra access, isliye tagged frames aise port par pahunchte hain jo untagged expect karta hai. (4) User ports ko aise dynamic mode mein chhodna jo trunk negotiate kar sake.</p></div>

<div class="exam"><p><b>Exam traps.</b> 802.1Q <b>4-byte</b> tag jodta hai; VLAN ID <b>12 bits</b> ka hai; priority 3-bit PCP (802.1p/CoS) hai. Native VLAN trunk par <b>akela untagged</b> VLAN hai, aur dono ends par match hona chahiye. Trunks VLANs carry karte hain, unhe route nahi karte.</p></div>

<div class="scn"><h4>CCTV change jisne do departments tod diye</h4><p>Ek engineer ne naya camera VLAN 50 uplink par <code>switchport trunk allowed vlan 50</code> se add kiya. Cameras online aa gaye, aur kuch minute baad Accounts (VLAN 10) aur HR (VLAN 20) ka server farm se connection chala gaya. <code>show interfaces trunk</code> mein "Vlans allowed on trunk: 50" dikh raha tha. Command ne list mein add karne ki jagah use replace kar diya tha. <code>switchport trunk allowed vlan 10,20,50,999</code> dobara daalne se service wapas aayi.</p><p><b>Seekh:</b> live trunk par hamesha <code>add</code> ya <code>remove</code> use karo, aur change se pehle aur baad <code>show interfaces trunk</code> padho.</p></div>

<div class="iv"><p class="q">"Native VLAN kya hai aur log ise badalte kyun hain?"</p><p>Strong answer: 802.1Q trunk par yeh woh ek VLAN hai jiske frames untagged bheje jaate hain, aur trunk par aaye untagged frames isi mein daale jaate hain. Default VLAN 1 hai aur dono ends par match hona chahiye, warna VLANs ke beech traffic leak hota hai aur CDP mismatch report karta hai. Engineers ise unused VLAN par move karte hain (ya tag karte hain) taaki double-tagging VLAN hopping ruke aur VLAN 1 user traffic se free rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunk 802.1Q tags use karke ek link par kai VLANs carry karta hai (4 bytes: TPID 0x8100, PCP, DEI, 12-bit VID).</li>
<li><code>switchport mode trunk</code> se configure karo aur <code>switchport trunk allowed vlan</code> se VLANs limit karo.</li>
<li>Live trunks par <code>add</code>/<code>remove</code> use karo; bare list sab kuch replace kar deti hai.</li>
<li>Native VLAN untagged hai, default 1, dono ends par match hona chahiye; ise unused VLAN par le jao.</li>
<li><code>show interfaces trunk</code>: pass hone ke liye VLAN allowed, active aur forwarding hona chahiye.</li>
</ul></div>
`}};export{e as default};