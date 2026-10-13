var e={id:`overview`,h:{en:`Firewall policies: what you will learn and the big picture`,hi:`Firewall policies: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a FortiGate decides whether a connection may pass: the attributes a firewall policy matches, how address, service and schedule objects are built, why the first matching policy wins, what the implicit deny (policy 0) is, how to log decisions and how to prove which policy took a decision. These are the Firewall Policies objectives of the Fortinet NSE 4 / FortiOS Administrator track (FortiOS 7.x). Everything is practised on the FortiGate-style CLI simulator, with the Pune lab used in the two labs of this module.</p>
<p><b>Prerequisites.</b> You should have finished <code>nse4-setup</code>: you can use the FortiOS CLI (<code>config</code>, <code>edit</code>, <code>set</code>, <code>next</code>, <code>end</code>), you know the interfaces <code>port1</code> (WAN) and <code>port2</code> (LAN) and that the FortiGate has a default route. Network address translation is the next module (<code>nse4-nat</code>), and user-based policies come after that (<code>nse4-auth</code>). Here we only switch NAT on with one line.</p>

<h3>Analogy: the security desk of an office building</h3>
<p>Picture a building with a security desk. The guard holds a printed list of rules. Rule 1: "Staff with a badge may enter between 8 and 20". Rule 2: "Couriers may go to the mailroom only". The guard reads the list from the top. The first rule that fits the visitor decides. If no rule fits, the answer is "no entry". A FortiGate works the same way. The visitor is a <b>new session</b>, the list is <code>config firewall policy</code>, and the last silent rule is the <b>implicit deny</b>.</p>
<p>The guard does not check every car again and again. After a visitor is let in, a record of the visit is kept and the visitor can walk out through the same door without being checked again. That record is the <b>session table</b>. FortiGate checks policies only for the <b>first packet</b> of a session; later packets and the reply follow the session.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Policy decision flow">
<rect x="15" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">New packet</text><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="12">arrives on port2</text>
<rect x="165" y="60" width="110" height="60" rx="10" fill="#fde68a"/><text x="220" y="86" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="220" y="104" text-anchor="middle" class="svg-muted" font-size="12">egress = port1</text>
<rect x="315" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="380" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy list</text><text x="380" y="104" text-anchor="middle" class="svg-muted" font-size="12">top-down, first match</text>
<rect x="490" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">accept + session</text>
<rect x="490" y="110" width="130" height="50" rx="10" fill="#fed7aa"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">deny / policy 0</text>
<line x1="125" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="275" y1="90" x2="315" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="445" y1="80" x2="490" y2="48" stroke="#64748b" stroke-width="2"/><line x1="445" y1="100" x2="490" y2="132" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The first packet of a session is routed, then compared with the policy list from the top.</p></div>

<h3>The big ideas of this module</h3>
<ul>
<li><b>Match.</b> A policy matches on ingress interface, egress interface, source address, destination address, service and schedule. All must match (chapter 2).</li>
<li><b>Objects.</b> You rarely type raw IPs in policies. You build reusable address, service and schedule objects and groups (chapter 3).</li>
<li><b>Order.</b> The list order decides, not the ID. If nothing matches, the implicit deny drops the session and shows as policy 0 (chapter 4).</li>
<li><b>Evidence.</b> Hit counters, traffic logs and the policy lookup tool prove which policy decided (chapters 5 and 6).</li>
<li><b>Design and troubleshooting.</b> Least privilege, naming, safe changes and a repeatable workflow (chapters 7 and 8).</li>
</ul>

<h3>The lab you will meet</h3>
<p>The Pune branch has a FortiGate with <code>port1</code> 203.0.113.2/30 towards the ISP and <code>port2</code> 10.0.1.1/24 for the LAN. PC1 is 10.0.1.10. An internet test server sits at 8.8.8.8. At the start of the first lab there are <b>no policies</b>, so nothing leaves the LAN. This is the correct secure default of a firewall: nothing is allowed until you say so.</p>
<pre class="out">PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
8.8.8.8 icmp_seq=3 timeout

FGT1# diagnose firewall iprope lookup 10.0.1.10 1 8.8.8.8 0 icmp port2
&lt;src [10.0.1.10-1] dst [8.8.8.8-0] proto icmp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy id 0 is not a real entry in your list. It is the name FortiOS shows for "nothing matched, so the implicit deny took it".</p>

<div class="eg"><p><b>Worked example.</b> A fresher says "I added the policy but the ping still fails." The engineer asks four questions in order: Is the policy enabled? Does it have <code>action accept</code>? Is it above any deny that also matches? Does the traffic really enter on the interface named in <code>srcintf</code>? Most "mystery" firewall problems end at one of these four answers.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking the firewall "opens a port". A FortiGate does not open ports; it permits <b>sessions</b> that match a policy. A session that does not match any policy is simply dropped, silently, without telling the sender.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often show two policies with IDs in one order and a list in another. The evaluated order is the displayed list order. The policy ID is just a label.</p></div>

<div class="scn"><h4>The new branch that could reach nothing</h4><p>A new branch FortiGate was shipped with only interface and routing config. Users complained "internet is down" although the ISP link was up and the default route existed. The engineer ran the policy lookup for a web packet from the LAN and got policy id 0. There was simply no accept policy. One policy from LAN to WAN with NAT fixed everything in two minutes.</p><p><b>Lesson:</b> a routed firewall with no policy is working as designed. Always check the policy before the cable.</p></div>

<div class="iv"><p class="q">"What happens to traffic that matches no firewall policy on a FortiGate?"</p><p>It hits the implicit deny and is dropped. The implicit deny shows as policy id 0 in lookups and logs, and it is only logged if <code>fwpolicy-implicit-log</code> is enabled under <code>config log setting</code>. Add that the decision is made for the first packet of the session and later packets follow the session table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A FortiGate denies everything that is not explicitly allowed by a policy.</li>
<li>The first packet of a session is checked against the list, top to bottom.</li>
<li>The implicit deny is shown as policy id 0 and is not a real list entry.</li>
<li>Routing picks the egress interface before the policy lookup happens.</li>
<li>Objects, order and evidence are the three skills of this module.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki FortiGate kaise decide karta hai ki koi connection pass ho sakta hai ya nahi: firewall policy kin attributes ko match karti hai, address, service aur schedule objects kaise bante hain, pehli matching policy kyun jeetti hai, implicit deny (policy 0) kya hai, decisions ko log kaise karte hain aur kaunsi policy ne decision liya yeh kaise saabit karte hain. Yeh Fortinet NSE 4 / FortiOS Administrator track (FortiOS 7.x) ke Firewall Policies objectives hain. Sab kuch FortiGate-style CLI simulator par practise hota hai, aur is module ke do labs mein Pune lab use hota hai.</p>
<p><b>Prerequisites.</b> Aapne <code>nse4-setup</code> complete kiya hona chahiye: aap FortiOS CLI (<code>config</code>, <code>edit</code>, <code>set</code>, <code>next</code>, <code>end</code>) chala lete ho, <code>port1</code> (WAN) aur <code>port2</code> (LAN) interfaces jaante ho aur yeh bhi ki FortiGate mein default route hai. Network address translation agla module (<code>nse4-nat</code>) hai, aur user-based policies uske baad (<code>nse4-auth</code>). Yahan hum NAT sirf ek line se on karte hain.</p>

<h3>Analogy: office building ka security desk</h3>
<p>Ek building socho jisme security desk hai. Guard ke paas rules ki printed list hai. Rule 1: "Badge wale staff 8 se 20 baje tak enter kar sakte hain". Rule 2: "Couriers sirf mailroom jayenge". Guard list ko upar se padhta hai. Jo pehla rule visitor par fit ho wahi decide karta hai. Koi rule fit na ho to jawab hai "entry nahi". FortiGate bilkul aise hi kaam karta hai. Visitor ek <b>naya session</b> hai, list <code>config firewall policy</code> hai, aur aakhri chup rule <b>implicit deny</b> hai.</p>
<p>Guard har baar har gaadi ko dobara check nahi karta. Visitor ko andar jaane dene ke baad visit ka record rakha jaata hai aur visitor usi darwaze se bina dobara check hue bahar ja sakta hai. Yeh record <b>session table</b> hai. FortiGate policies sirf session ke <b>pehle packet</b> ke liye check karta hai; baad ke packets aur reply session ko follow karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Policy decision flow">
<rect x="15" y="60" width="110" height="60" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="13">Naya packet</text><text x="70" y="104" text-anchor="middle" class="svg-muted" font-size="12">port2 par aaya</text>
<rect x="165" y="60" width="110" height="60" rx="10" fill="#fde68a"/><text x="220" y="86" text-anchor="middle" class="svg-ink" font-size="13">Route lookup</text><text x="220" y="104" text-anchor="middle" class="svg-muted" font-size="12">egress = port1</text>
<rect x="315" y="60" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="380" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy list</text><text x="380" y="104" text-anchor="middle" class="svg-muted" font-size="12">upar se, pehla match</text>
<rect x="490" y="20" width="130" height="50" rx="10" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">accept + session</text>
<rect x="490" y="110" width="130" height="50" rx="10" fill="#fed7aa"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">deny / policy 0</text>
<line x1="125" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="275" y1="90" x2="315" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="445" y1="80" x2="490" y2="48" stroke="#64748b" stroke-width="2"/><line x1="445" y1="100" x2="490" y2="132" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Session ka pehla packet route hota hai, phir policy list se upar se compare hota hai.</p></div>

<h3>Is module ke bade ideas</h3>
<ul>
<li><b>Match.</b> Policy ingress interface, egress interface, source address, destination address, service aur schedule par match karti hai. Sab match hone chahiye (chapter 2).</li>
<li><b>Objects.</b> Policies mein aap kaccha IP kam hi type karte ho. Reusable address, service aur schedule objects aur groups banate ho (chapter 3).</li>
<li><b>Order.</b> List ka order decide karta hai, ID nahi. Kuch match na ho to implicit deny session drop karta hai aur policy 0 ke naam se dikhta hai (chapter 4).</li>
<li><b>Evidence.</b> Hit counters, traffic logs aur policy lookup tool saabit karte hain ki kaunsi policy ne decide kiya (chapters 5 aur 6).</li>
<li><b>Design aur troubleshooting.</b> Least privilege, naming, safe changes aur repeatable workflow (chapters 7 aur 8).</li>
</ul>

<h3>Jo lab aap miloge</h3>
<p>Pune branch mein FortiGate hai: <code>port1</code> 203.0.113.2/30 ISP ki taraf aur <code>port2</code> 10.0.1.1/24 LAN ke liye. PC1 10.0.1.10 hai. Internet test server 8.8.8.8 par hai. Pehle lab ke shuru mein <b>koi policy nahi</b> hai, isliye LAN se kuch bahar nahi jaata. Firewall ka yahi sahi secure default hai: jab tak aap na bolo kuch allowed nahi.</p>
<pre class="out">PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
8.8.8.8 icmp_seq=3 timeout

FGT1# diagnose firewall iprope lookup 10.0.1.10 1 8.8.8.8 0 icmp port2
&lt;src [10.0.1.10-1] dst [8.8.8.8-0] proto icmp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy id 0 aapki list ki asli entry nahi hai. FortiOS yeh naam "kuch match nahi hua, isliye implicit deny ne le liya" dikhane ke liye use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Fresher kehta hai "Maine policy add ki lekin ping abhi bhi fail hai." Engineer chaar sawal order mein poochta hai: Kya policy enabled hai? Kya <code>action accept</code> hai? Kya woh kisi aise deny ke upar hai jo bhi match karta hai? Kya traffic sach mein <code>srcintf</code> mein likhe interface par aa raha hai? Zyadatar "mystery" firewall problems inhi chaar jawabon mein se ek par khatam hoti hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Sochna ki firewall "port open karta hai". FortiGate ports open nahi karta; woh un <b>sessions</b> ko permit karta hai jo policy se match karte hain. Jo session kisi policy se match nahi karta woh chupchap drop ho jaata hai, sender ko bataye bina.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawalon mein aksar do policies dikhayi jaati hain jinki IDs ek order mein aur list doosre order mein hoti hai. Evaluate hone wala order dikhayi gayi list ka order hai. Policy ID sirf ek label hai.</p></div>

<div class="scn"><h4>Naya branch jo kuch reach nahi kar paa raha tha</h4><p>Naye branch ka FortiGate sirf interface aur routing config ke saath bheja gaya. Users ne shikayat ki "internet down hai" jabki ISP link up tha aur default route maujood tha. Engineer ne LAN se web packet ke liye policy lookup chalaya aur policy id 0 mila. Koi accept policy thi hi nahi. LAN se WAN tak NAT wali ek policy ne do minute mein sab theek kar diya.</p><p><b>Lesson:</b> bina policy ka routed firewall design ke hisaab se hi kaam kar raha hai. Cable se pehle policy check karo.</p></div>

<div class="iv"><p class="q">"FortiGate par jo traffic kisi firewall policy se match nahi karta uska kya hota hai?"</p><p>Woh implicit deny par girta hai aur drop hota hai. Implicit deny lookups aur logs mein policy id 0 dikhta hai, aur woh tabhi log hota hai jab <code>config log setting</code> ke neeche <code>fwpolicy-implicit-log</code> enable ho. Yeh bhi jodo ki decision session ke pehle packet par hota hai aur baad ke packets session table ko follow karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiGate wo sab deny karta hai jo kisi policy se explicitly allow nahi hua.</li>
<li>Session ka pehla packet list ke against upar se neeche check hota hai.</li>
<li>Implicit deny policy id 0 ke roop mein dikhta hai aur list ki asli entry nahi hai.</li>
<li>Policy lookup se pehle routing egress interface chun leti hai.</li>
<li>Objects, order aur evidence is module ki teen skills hain.</li>
</ul></div>
`}};export{e as default};