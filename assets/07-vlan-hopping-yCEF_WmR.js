var e={id:`vlan-hopping`,h:{en:`VLAN hopping: switch spoofing, double tagging and trunk hardening`,hi:`VLAN hopping: switch spoofing, double tagging aur trunk hardening`},body:{en:`
<p>An apartment tower has one passenger lift per wing, each serving only its own floors, and one service lift that stops everywhere. Residents never use the service lift, but if one convinces the operator "I am maintenance staff", he can ride to any floor. A second trick: he puts a parcel inside an envelope addressed to his own wing, and inside that another envelope addressed to the finance wing; the first sorter removes the outer envelope as usual and the inner address takes the parcel where it was never supposed to go. Those are the two forms of <b>VLAN hopping</b>: <b>switch spoofing</b> and <b>double tagging</b>. The trunk is the service lift.</p>

<h3>Switch spoofing with DTP</h3>
<p><b>DTP</b> (Dynamic Trunking Protocol) is a Cisco protocol that lets two switch ports negotiate whether to form a trunk. Port modes:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td>access</td><td>Always access, never forms a trunk; still sends DTP frames to tell the neighbour unless <code>switchport nonegotiate</code></td></tr>
<tr><td>trunk</td><td>Always trunk; sends DTP unless <code>switchport nonegotiate</code></td></tr>
<tr><td>dynamic desirable</td><td>Actively asks to trunk; trunks with trunk, desirable or auto</td></tr>
<tr><td>dynamic auto</td><td>Waits to be asked; trunks with trunk or desirable (auto + auto = access)</td></tr></table>
<p>Many access switches ship with ports in <b>dynamic auto</b>. A device that sends DTP frames saying "let's trunk" turns such a port into a trunk, and suddenly it can send and receive tagged frames for every VLAN allowed on the trunk, which by default is all of them. That is switch spoofing.</p>
<p><b>What the defender sees:</b> an edge port listed in <code>show interfaces trunk</code>, and a log such as <code>%DTP-5-TRUNKPORTON: Port Gi0/2 has become dot1q trunk</code>. The defence is simple and absolute: edge ports are <code>switchport mode access</code> with <code>switchport nonegotiate</code>; real trunks are <code>switchport mode trunk</code> with <code>switchport nonegotiate</code>. No port is left dynamic.</p>

<h3>Double tagging</h3>
<p>The <b>native VLAN</b> is the one VLAN whose frames cross an 802.1Q trunk <b>untagged</b>; by default it is VLAN 1. Double tagging works only when the attacker's access VLAN equals the trunk's native VLAN. The attacker sends a frame with <b>two</b> 802.1Q tags: outer tag = native VLAN, inner tag = target VLAN (say 20). The first switch treats it as a native-VLAN frame and, when sending it over the trunk, removes the outer tag because native frames go untagged. The second switch sees the inner tag 20 and delivers the frame into VLAN 20.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Double tagging across a trunk">
<rect x="20" y="150" width="130" height="50" rx="8" fill="#fed7aa"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="13">ATK</text><text x="85" y="189" text-anchor="middle" class="svg-muted" font-size="12">access VLAN 1</text>
<rect x="200" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="265" y="90" text-anchor="middle" class="svg-ink" font-size="14">DSW</text>
<rect x="440" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="505" y="90" text-anchor="middle" class="svg-ink" font-size="14">ASW</text>
<rect x="470" y="160" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="540" y="180" text-anchor="middle" class="svg-ink" font-size="13">victim</text><text x="540" y="196" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<line x1="85" y1="150" x2="230" y2="110" stroke="#64748b" stroke-width="2"/><text x="60" y="135" class="svg-accent" font-size="12">[1][20] data</text>
<line x1="330" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="4"/><text x="385" y="75" text-anchor="middle" class="svg-accent" font-size="12">[20] data</text><text x="385" y="105" text-anchor="middle" class="svg-muted" font-size="12">trunk, native 1</text>
<line x1="505" y1="110" x2="530" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">one-way only: replies never return to ATK</text>
</svg><p class="cap">DSW strips the outer native tag; ASW reads the inner tag and delivers into VLAN 20.</p></div>
<p>The attack is <b>one-way</b>: the victim's replies are tagged VLAN 20 normally and never come back to VLAN 1. It is still useful for sending a malicious packet (for example a spoofed UDP packet) into a VLAN the attacker should not reach. Defences:</p>
<ul>
<li>Set the trunk native VLAN to an <b>unused VLAN</b> (999) that no access port uses, on <b>both</b> ends.</li>
<li><code>vlan dot1q tag native</code> (global, on platforms that support it) so even native frames are tagged and the outer tag is never stripped.</li>
<li>Prune the allowed VLAN list to what is needed, and never put users in VLAN 1.</li>
</ul>

<h3>Lab 3 walkthrough, part 1</h3>
<p>DSW and ASW share trunk Gi0/23; ATK sits on DSW Gi0/2. Harden the trunk:</p>
<pre class="code"><span class="c">! task 1 on DSW</span>
interface g0/23
 switchport nonegotiate
 switchport trunk native vlan 999
 exit
vlan dot1q tag native
<span class="c">! part of task 2: the edge port</span>
interface g0/2
 switchport mode access
 switchport nonegotiate</pre>
<p>In production you configure the same native VLAN on ASW Gi0/23 too; otherwise CDP reports <code>%CDP-4-NATIVE_VLAN_MISMATCH</code>. The lab grades DSW. Verify:</p>
<pre class="out">DSW# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/23      on               802.1q         trunking      999</span>

Port        Vlans allowed on trunk
Gi0/23      1-4094

DSW# show interfaces g0/2 switchport | include Mode|Negotiation
<span class="hl">Administrative Mode: static access</span>
Operational Mode: static access
<span class="hl">Negotiation of Trunking: Off</span>

DSW# show vlan dot1q tag native
<span class="hl">dot1q native vlan tagging is enabled</span></pre>
<p>Mode <code>on</code> means the trunk is statically configured. Only Gi0/23 appears in the trunk list; if Gi0/2 ever appeared there, switch spoofing would have succeeded. With this in place, <code>attack dtp</code> and <code>attack double-tag 20</code> from ATK are both blocked. The lab's answer, the native VLAN that closes the double-tagging hole, is <b>999</b>.</p>

<div class="eg"><p><b>Worked example: DTP outcomes.</b> Switch A port dynamic auto, attacker sends DTP "desirable": trunk forms. Port dynamic auto, other side dynamic auto: stays access (both wait). Port access with nonegotiate: no DTP is sent or honoured, stays access whatever the other side does. Port trunk with nonegotiate: trunk, but the neighbour must also be statically trunk because no negotiation happens.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing <code>switchport nonegotiate</code> on a port still in dynamic mode. IOS rejects it with a conflict error. Set <code>switchport mode access</code> or <code>trunk</code> first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Double tagging requires the attacker to be in the <b>native VLAN</b> of the trunk and works in <b>one direction only</b>. Switch spoofing needs a port in a <b>dynamic</b> mode. Port security, DAI and DHCP snooping do not stop either; access mode, nonegotiate and an unused, tagged native VLAN do.</p></div>

<div class="scn"><h4>The meeting-room port that became a trunk</h4><p>During a quarterly audit, <code>show interfaces trunk</code> on a floor switch listed a meeting-room port as trunking with all VLANs allowed. The port had been left at the default dynamic auto, and a small managed switch someone brought in for a workshop had negotiated a trunk over DTP. Every VLAN, including the server and management VLANs, had been reachable from the meeting room for weeks. The team applied the access template (mode access, nonegotiate, BPDU guard) to every edge port with a configuration script and added a weekly check that alerts if any non-uplink port appears in the trunk list.</p><p><b>Lesson:</b> no port should be dynamic. Leaving the default is an open invitation to switch spoofing.</p></div>

<div class="iv"><p class="q">"What are the two VLAN hopping techniques, and how do you prevent each?"</p><p>Strong answer: switch spoofing uses DTP to turn a dynamic edge port into a trunk; prevent it with <code>switchport mode access</code> and <code>switchport nonegotiate</code> on edge ports and static, non-negotiating trunks. Double tagging abuses the untagged native VLAN: the first switch strips the outer tag, the next reads the inner one; it is one-way and needs the attacker in the native VLAN. Prevent it with an unused native VLAN on both ends, <code>vlan dot1q tag native</code>, pruned allowed lists and no users in VLAN 1.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch spoofing: DTP turns a dynamic port into a trunk exposing every allowed VLAN.</li>
<li>Stop it with access mode plus nonegotiate on edge ports and static trunks with nonegotiate.</li>
<li>Double tagging: outer native tag stripped by the first switch, inner tag delivered by the next; one-way.</li>
<li>Stop it with an unused native VLAN (both ends), native tagging and pruned allowed VLANs.</li>
<li>Verify with <code>show interfaces trunk</code> and <code>show interfaces switchport</code> (Negotiation of Trunking: Off).</li>
</ul></div>
`,hi:`
<p>Ek apartment tower mein har wing ki ek passenger lift hai, jo sirf apni floors par jaati hai, aur ek service lift hai jo har jagah rukti hai. Residents service lift kabhi use nahi karte, par agar koi operator ko mana le ki "main maintenance staff hoon", to woh kisi bhi floor tak ja sakta hai. Doosri chaal: woh ek parcel ko apni wing ke address wale envelope mein daalta hai, aur uske andar ek aur envelope finance wing ke address ka; pehla sorter aam taur par bahar ka envelope hata deta hai aur andar ka address parcel ko wahan le jaata hai jahan use kabhi nahi jaana tha. Yahi <b>VLAN hopping</b> ke do roop hain: <b>switch spoofing</b> aur <b>double tagging</b>. Trunk service lift hai.</p>

<h3>DTP se switch spoofing</h3>
<p><b>DTP</b> (Dynamic Trunking Protocol) ek Cisco protocol hai jo do switch ports ko negotiate karne deta hai ki trunk banana hai ya nahi. Port modes:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td>access</td><td>Hamesha access, kabhi trunk nahi banata; neighbour ko batane ke liye DTP frames bhejta rehta hai jab tak <code>switchport nonegotiate</code> na ho</td></tr>
<tr><td>trunk</td><td>Hamesha trunk; <code>switchport nonegotiate</code> na ho to DTP bhejta hai</td></tr>
<tr><td>dynamic desirable</td><td>Khud trunk maangta hai; trunk, desirable ya auto ke saath trunk banata hai</td></tr>
<tr><td>dynamic auto</td><td>Poochhe jaane ka intezaar karta hai; trunk ya desirable ke saath trunk banata hai (auto + auto = access)</td></tr></table>
<p>Kai access switches ports ko <b>dynamic auto</b> mein ship karte hain. Jo device "chalo trunk banayein" wale DTP frames bhejta hai woh aise port ko trunk bana deta hai, aur achanak woh trunk par allowed har VLAN ke tagged frames bhej aur le sakta hai, jo default mein saare hain. Yahi switch spoofing hai.</p>
<p><b>Defender ko kya dikhta hai:</b> <code>show interfaces trunk</code> mein ek edge port, aur <code>%DTP-5-TRUNKPORTON: Port Gi0/2 has become dot1q trunk</code> jaisa log. Defence simple aur pakka hai: edge ports <code>switchport nonegotiate</code> ke saath <code>switchport mode access</code> hain; asli trunks <code>switchport nonegotiate</code> ke saath <code>switchport mode trunk</code> hain. Koi port dynamic nahi chhoda jaata.</p>

<h3>Double tagging</h3>
<p><b>Native VLAN</b> woh ek VLAN hai jiske frames 802.1Q trunk par <b>untagged</b> jaate hain; default mein yeh VLAN 1 hai. Double tagging tabhi kaam karta hai jab attacker ka access VLAN trunk ke native VLAN ke barabar ho. Attacker <b>do</b> 802.1Q tags wala frame bhejta hai: outer tag = native VLAN, inner tag = target VLAN (maan lo 20). Pehla switch use native-VLAN frame maanta hai aur trunk par bhejte waqt outer tag hata deta hai kyunki native frames untagged jaate hain. Doosra switch inner tag 20 dekhta hai aur frame VLAN 20 mein deliver kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Trunk ke paar double tagging">
<rect x="20" y="150" width="130" height="50" rx="8" fill="#fed7aa"/><text x="85" y="172" text-anchor="middle" class="svg-ink" font-size="13">ATK</text><text x="85" y="189" text-anchor="middle" class="svg-muted" font-size="12">access VLAN 1</text>
<rect x="200" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="265" y="90" text-anchor="middle" class="svg-ink" font-size="14">DSW</text>
<rect x="440" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="505" y="90" text-anchor="middle" class="svg-ink" font-size="14">ASW</text>
<rect x="470" y="160" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="540" y="180" text-anchor="middle" class="svg-ink" font-size="13">victim</text><text x="540" y="196" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<line x1="85" y1="150" x2="230" y2="110" stroke="#64748b" stroke-width="2"/><text x="60" y="135" class="svg-accent" font-size="12">[1][20] data</text>
<line x1="330" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="4"/><text x="385" y="75" text-anchor="middle" class="svg-accent" font-size="12">[20] data</text><text x="385" y="105" text-anchor="middle" class="svg-muted" font-size="12">trunk, native 1</text>
<line x1="505" y1="110" x2="530" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">sirf one-way: replies ATK tak kabhi wapas nahi aate</text>
</svg><p class="cap">DSW outer native tag hata deta hai; ASW inner tag padhkar VLAN 20 mein deliver karta hai.</p></div>
<p>Attack <b>one-way</b> hai: victim ke replies normally VLAN 20 tagged hote hain aur kabhi VLAN 1 mein wapas nahi aate. Phir bhi yeh kisi aise VLAN mein malicious packet (jaise spoofed UDP packet) bhejne ke kaam aata hai jahan attacker ko nahi pahunchna chahiye. Defences:</p>
<ul>
<li>Trunk native VLAN ko ek <b>unused VLAN</b> (999) par set karo jo koi access port use na kare, <b>dono</b> ends par.</li>
<li><code>vlan dot1q tag native</code> (global, jin platforms par support ho) taaki native frames bhi tagged hon aur outer tag kabhi strip na ho.</li>
<li>Allowed VLAN list ko zaroorat tak prune karo, aur users ko kabhi VLAN 1 mein mat daalo.</li>
</ul>

<h3>Lab 3 walkthrough, part 1</h3>
<p>DSW aur ASW trunk Gi0/23 share karte hain; ATK DSW Gi0/2 par baitha hai. Trunk harden karo:</p>
<pre class="code"><span class="c">! DSW par task 1</span>
interface g0/23
 switchport nonegotiate
 switchport trunk native vlan 999
 exit
vlan dot1q tag native
<span class="c">! task 2 ka hissa: edge port</span>
interface g0/2
 switchport mode access
 switchport nonegotiate</pre>
<p>Production mein aap ASW Gi0/23 par bhi same native VLAN configure karte ho; warna CDP <code>%CDP-4-NATIVE_VLAN_MISMATCH</code> report karta hai. Lab DSW ko grade karti hai. Verify karo:</p>
<pre class="out">DSW# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/23      on               802.1q         trunking      999</span>

Port        Vlans allowed on trunk
Gi0/23      1-4094

DSW# show interfaces g0/2 switchport | include Mode|Negotiation
<span class="hl">Administrative Mode: static access</span>
Operational Mode: static access
<span class="hl">Negotiation of Trunking: Off</span>

DSW# show vlan dot1q tag native
<span class="hl">dot1q native vlan tagging is enabled</span></pre>
<p>Mode <code>on</code> ka matlab trunk statically configured hai. Trunk list mein sirf Gi0/23 dikhta hai; agar Gi0/2 kabhi wahan dikhe, to switch spoofing kaamyaab ho gaya. Yeh sab lagne ke baad ATK se <code>attack dtp</code> aur <code>attack double-tag 20</code> dono block hote hain. Lab ka jawab, woh native VLAN jo double-tagging hole band karta hai, <b>999</b> hai.</p>

<div class="eg"><p><b>Worked example: DTP outcomes.</b> Switch A ka port dynamic auto, attacker DTP "desirable" bhejta hai: trunk ban jaata hai. Port dynamic auto, doosri side dynamic auto: access hi rehta hai (dono intezaar karte hain). Nonegotiate ke saath access port: koi DTP na bheja jaata hai na maana jaata hai, doosri side kuch bhi kare access hi rehta hai. Nonegotiate ke saath trunk port: trunk, par neighbour ko bhi statically trunk hona chahiye kyunki koi negotiation nahi hota.</p></div>

<div class="warn"><p><b>Common galti.</b> Abhi bhi dynamic mode wale port par <code>switchport nonegotiate</code> type karna. IOS ise conflict error ke saath reject karta hai. Pehle <code>switchport mode access</code> ya <code>trunk</code> set karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Double tagging ke liye attacker ko trunk ke <b>native VLAN</b> mein hona chahiye aur yeh <b>sirf ek direction</b> mein kaam karta hai. Switch spoofing ke liye port <b>dynamic</b> mode mein hona chahiye. Port security, DAI aur DHCP snooping dono mein se kisi ko nahi rokte; access mode, nonegotiate aur unused, tagged native VLAN rokte hain.</p></div>

<div class="scn"><h4>Meeting-room port jo trunk ban gaya</h4><p>Quarterly audit ke dauraan ek floor switch par <code>show interfaces trunk</code> ne ek meeting-room port ko saare VLANs allowed ke saath trunking dikhaya. Port default dynamic auto par chhoda gaya tha, aur workshop ke liye koi jo chhota managed switch laaya tha usne DTP par trunk negotiate kar liya tha. Hafton tak meeting room se har VLAN, server aur management VLANs samet, reachable tha. Team ne configuration script se har edge port par access template (mode access, nonegotiate, BPDU guard) lagaya aur ek weekly check jodi jo alert karti hai agar koi non-uplink port trunk list mein dikhe.</p><p><b>Seekh:</b> koi port dynamic nahi hona chahiye. Default chhodna switch spoofing ko khula nyota hai.</p></div>

<div class="iv"><p class="q">"VLAN hopping ki do techniques kya hain, aur har ek ko kaise rokte ho?"</p><p>Strong answer: switch spoofing DTP ka use karke dynamic edge port ko trunk bana deta hai; ise edge ports par <code>switchport mode access</code> aur <code>switchport nonegotiate</code> se aur static, non-negotiating trunks se roko. Double tagging untagged native VLAN ka galat fayda uthata hai: pehla switch outer tag hata deta hai, agla inner wala padhta hai; yeh one-way hai aur attacker ko native VLAN mein hona chahiye. Ise dono ends par unused native VLAN, <code>vlan dot1q tag native</code>, pruned allowed lists aur VLAN 1 mein koi users nahi, inse roko.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch spoofing: DTP dynamic port ko trunk bana deta hai jo har allowed VLAN expose karta hai.</li>
<li>Ise edge ports par access mode plus nonegotiate aur nonegotiate wale static trunks se roko.</li>
<li>Double tagging: pehla switch outer native tag hata deta hai, agla inner tag deliver karta hai; one-way.</li>
<li>Ise unused native VLAN (dono ends), native tagging aur pruned allowed VLANs se roko.</li>
<li><code>show interfaces trunk</code> aur <code>show interfaces switchport</code> (Negotiation of Trunking: Off) se verify karo.</li>
</ul></div>
`}};export{e as default};