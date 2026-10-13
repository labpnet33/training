var e={id:`design`,h:{en:`Least-privilege rule design for a DMZ`,hi:`DMZ ke liye least-privilege rule design`},body:{en:`
<p>You now know every tool: objects, groups, ACEs, bindings, logging and hit counts. This chapter is about using them with judgement. A firewall policy is only as good as its design, and the design principle for a DMZ is <b>least privilege</b>: every server gets exactly the flows the business needs, in every direction, and nothing else.</p>

<h3>The analogy: hotel key cards</h3>
<p>A hotel guest's key card opens their own room, the lift to their floor and the gym. It does not open other rooms, the kitchen or the manager's office. If the card is stolen, the thief gets one room, not the building. DMZ rules work the same way: if the web server is compromised, the attacker should inherit only what the web server was allowed to do.</p>

<h3>Step 1: write a flow matrix before any CLI</h3>
<p>A <b>flow matrix</b> lists every required connection with its <b>direction</b> (who starts it), source, destination, protocol and port, and a business owner. Only the first packet's direction matters, because the stateful ASA returns replies automatically.</p>
<table class="cmp"><tr><th>#</th><th>Starts from</th><th>Destination</th><th>Service</th><th>Why</th></tr>
<tr><td>1</td><td>any (internet)</td><td>WEB 10.0.2.10</td><td>TCP 80, 443</td><td>public website</td></tr>
<tr><td>2</td><td>any (internet)</td><td>MAIL 10.0.2.25</td><td>TCP 25</td><td>inbound email</td></tr>
<tr><td>3</td><td>PARTNER 198.51.100.10</td><td>WEB, MAIL</td><td>TCP 22</td><td>partner support</td></tr>
<tr><td>4</td><td>WEB, MAIL</td><td>DNS 192.0.2.53</td><td>UDP 53</td><td>name resolution</td></tr>
<tr><td>5</td><td>WEB, MAIL</td><td>repo 192.0.2.80</td><td>TCP 443</td><td>patches</td></tr>
<tr><td>6</td><td>MAIL</td><td>any (internet)</td><td>TCP 25</td><td>outbound email</td></tr>
<tr><td>7</td><td>DMZ</td><td>inside 10.0.1.0/24</td><td>none</td><td>containment</td></tr>
</table>
<p>Rows 1 to 3 are exactly the lab <b>Open the DMZ to the internet</b>. Rows 4 to 7 are the part most designs forget: what the DMZ itself may start.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three directions of DMZ policy">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text>
<rect x="250" y="160" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">WEB, MAIL</text>
<rect x="20" y="160" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="190" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text>
<line x1="300" y1="70" x2="300" y2="160" stroke="#64748b" stroke-width="2"/><text x="292" y="115" text-anchor="end" class="svg-accent" font-size="12">OUTSIDE_IN: rows 1-3</text>
<line x1="340" y1="160" x2="340" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="348" y="115" class="svg-accent" font-size="12">DMZ_IN: rows 4-6</text>
<line x1="250" y1="185" x2="160" y2="185" stroke="#64748b" stroke-width="2"/><text x="205" y="150" text-anchor="middle" class="svg-accent" font-size="12">DMZ_IN: deny</text>
</svg><p class="cap">Least privilege covers every direction: into the DMZ, out of the DMZ, and from the DMZ towards inside.</p></div>

<h3>Step 2: turn the matrix into objects and ACEs</h3>
<p>Inbound (rows 1 to 3) is the lab solution you already know. The new part is an ACL on the <b>dmz</b> interface. Remember from chapter 2: without it, dmz (50) to outside (0) is allowed for <i>everything</i>, so a compromised WEB could reach any port on the internet.</p>
<pre class="code"><span class="c">! reusable objects</span>
object-group network DMZ-SERVERS
 network-object object WEB
 network-object object MAIL
object network DNS-SRV
 host 192.0.2.53
object network REPO
 host 192.0.2.80
<span class="c">! DMZ_IN: what DMZ servers may START</span>
access-list DMZ_IN remark CHG-4410 containment: DMZ never starts flows to inside
access-list DMZ_IN extended deny ip any object INSIDE-NET log
access-list DMZ_IN extended permit udp object-group DMZ-SERVERS object DNS-SRV eq domain
access-list DMZ_IN extended permit tcp object-group DMZ-SERVERS object REPO eq h&#116;tps
access-list DMZ_IN extended permit tcp object MAIL any eq smtp
access-list DMZ_IN extended deny ip any any log
access-group DMZ_IN in interface dmz</pre>
<p>Notice the order. The deny towards INSIDE-NET sits <b>above</b> the MAIL permit because <code>object MAIL any eq smtp</code> also matches 10.0.1.x. Once an ACL is bound, it overrides the security levels, so a broad <code>any</code> would silently open DMZ to inside. If one day WEB really must reach an inside database, you insert that single, specific permit above the deny.</p>
<p>Replies are unaffected: when INET opens a connection to WEB, WEB's answers match the connection table and never touch DMZ_IN.</p>

<h3>Step 3: verify the design, not just the syntax</h3>
<pre class="out">NK-ASA# show access-list DMZ_IN
access-list DMZ_IN; 7 elements; name hash: 0x3e7b1a90
access-list DMZ_IN line 1 remark CHG-4410 containment: DMZ never starts flows to inside
<span class="hl">access-list DMZ_IN line 2 extended deny ip any object INSIDE-NET log informational interval 300 (hitcnt=4) 0x5a1f0c3e</span>
access-list DMZ_IN line 3 extended permit udp object-group DMZ-SERVERS object DNS-SRV eq domain (hitcnt=412) 0x8d20e4b7
access-list DMZ_IN line 4 extended permit tcp object-group DMZ-SERVERS object REPO eq h&#116;tps (hitcnt=37) 0x0c9b5f12
access-list DMZ_IN line 5 extended permit tcp object MAIL any eq smtp (hitcnt=96) 0x77e1a3d4
access-list DMZ_IN line 6 extended deny ip any any log informational interval 300 (hitcnt=0) 0x2b64c8f0
NK-ASA# show logging | include DMZ_IN
%ASA-6-106100: access-list DMZ_IN denied tcp dmz/10.0.2.10(51522) -&gt; inside/10.0.1.10(445) hit-cnt 1 first hit [0x5a1f0c3e, 0x0]</pre>
<p>Four hits on line 2 mean a DMZ server tried to start an SMB connection to a user PC. The design both blocked it and made it visible, which is exactly what containment is for.</p>

<div class="eg"><p><b>Worked example: count the exposure.</b> Before the redesign, WEB could start any of 65,535 TCP ports to any internet host and SMB to nothing (security levels). After it, WEB can start exactly two flows: UDP 53 to one resolver and TCP 443 to one repository. That reduction is what an auditor wants to see written down.</p></div>

<h3>Design rules that keep a policy least-privilege</h3>
<ul>
<li><b>Specific sources where possible</b>: partners and admins by host, never <code>any</code> for SSH.</li>
<li><b>Specific services</b>: never <code>ip</code> or all TCP to a server; name the ports.</li>
<li><b>Specific destinations</b>: the server object, never the whole DMZ subnet.</li>
<li><b>Explicit deny with log at the end</b> of each hand-written ACL, so violations are visible.</li>
<li><b>Temporary means time-range</b>, not "we will remember to remove it".</li>
<li><b>Review hit counts</b>: a permit with zero hits for months is either unused (remove it) or shadowed (fix the order).</li>
</ul>

<div class="note"><p><b>The boundary of this policy.</b> Interface and global ACLs filter traffic <i>through</i> the ASA. Traffic <i>to</i> the ASA itself is least-privileged separately: <code>ssh 10.0.1.50 255.255.255.255 inside</code> and <code>h&#116;tp 10.0.1.50 255.255.255.255 inside</code> limit management to the ADMIN PC, <code>icmp</code> rules limit pings to the box, and <code>access-group NAME in interface outside control-plane</code> filters services such as IKE that terminate on it. Refused to-the-box connections log syslog 710003. The full management-plane hardening is in sec-aaa-mgmt.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Designing only the inbound direction; binding DMZ_IN without the DNS and update permits, which breaks patching; putting a broad <code>any</code> permit above the inside deny; using the DMZ subnet as destination "for future servers"; and forgetting that existing connections survive a tightened ACL until <code>clear conn</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A DMZ interface has security level 50 and no ACL. Can a DMZ server open connections to the internet?" Yes, to anything: higher to lower is allowed by default. Least privilege requires an inbound ACL on the dmz interface. And once it is bound, the ACL, not the levels, also decides DMZ to inside.</p></div>

<div class="scn"><h4>The web server that became a download site</h4><p>An e-commerce company's DMZ had a strict inbound ACL but no ACL on the dmz interface. Attackers exploited an unpatched web plugin and the server began making outbound connections on unusual ports to many hosts. The security team built a flow matrix, found the server legitimately needed only DNS and HTTPS to its update mirror, bound DMZ_IN with those two permits and a logged deny, and the outbound traffic stopped the same minute while the website kept working.</p><p><b>Lesson:</b> least privilege is directional; the outbound rules of a DMZ limit the damage after the inbound rules are bypassed.</p></div>

<div class="iv"><p class="q">"How would you design the firewall rules for a new DMZ web server?"</p><p>Strong answer: start with a flow matrix covering all three directions and an owner per flow; publish only the required ports to the server object (real IP) inbound on outside; restrict admin access like SSH to named sources; add an ACL on the dmz interface that allows only the server's required outbound flows, denies DMZ to inside above any broad permit, and ends with a logged deny; use remarks and time-ranges; verify with packet-tracer and hit counts, and review regularly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Least privilege = exactly the flows the business needs, in every direction.</li>
<li>Build a flow matrix first; only the initiating direction needs a rule.</li>
<li>Without an ACL on dmz, DMZ servers can start anything towards outside.</li>
<li>Put the DMZ-to-inside deny above broad permits; a bound ACL overrides security levels.</li>
<li>End hand-written ACLs with a logged deny and review hit counts regularly.</li>
</ul></div>
`,hi:`
<p>Ab aapko har tool pata hai: objects, groups, ACEs, bindings, logging aur hit counts. Yeh chapter inhe samajhdaari se use karne ke baare mein hai. Firewall policy utni hi achhi hoti hai jitna uska design, aur DMZ ke liye design principle hai <b>least privilege</b>: har server ko har direction mein exactly woh flows milte hain jo business ko chahiye, aur kuch nahi.</p>

<h3>Analogy: hotel ke key cards</h3>
<p>Hotel guest ka key card uska apna room, uske floor ki lift aur gym kholta hai. Woh doosre rooms, kitchen ya manager ka office nahi kholta. Agar card chori ho jaaye, to chor ko ek room milta hai, poori building nahi. DMZ rules bhi aise hi kaam karte hain: agar web server compromise ho jaaye, to attacker ko sirf wahi milna chahiye jo web server ko karne ki ijaazat thi.</p>

<h3>Step 1: koi bhi CLI se pehle flow matrix likho</h3>
<p><b>Flow matrix</b> har zaroori connection ko list karta hai uski <b>direction</b> (kaun shuru karta hai), source, destination, protocol aur port, aur ek business owner ke saath. Sirf pehle packet ki direction matter karti hai, kyunki stateful ASA replies apne aap wapas bhejta hai.</p>
<table class="cmp"><tr><th>#</th><th>Kahan se shuru</th><th>Destination</th><th>Service</th><th>Kyun</th></tr>
<tr><td>1</td><td>any (internet)</td><td>WEB 10.0.2.10</td><td>TCP 80, 443</td><td>public website</td></tr>
<tr><td>2</td><td>any (internet)</td><td>MAIL 10.0.2.25</td><td>TCP 25</td><td>inbound email</td></tr>
<tr><td>3</td><td>PARTNER 198.51.100.10</td><td>WEB, MAIL</td><td>TCP 22</td><td>partner support</td></tr>
<tr><td>4</td><td>WEB, MAIL</td><td>DNS 192.0.2.53</td><td>UDP 53</td><td>name resolution</td></tr>
<tr><td>5</td><td>WEB, MAIL</td><td>repo 192.0.2.80</td><td>TCP 443</td><td>patches</td></tr>
<tr><td>6</td><td>MAIL</td><td>any (internet)</td><td>TCP 25</td><td>outbound email</td></tr>
<tr><td>7</td><td>DMZ</td><td>inside 10.0.1.0/24</td><td>kuch nahi</td><td>containment</td></tr>
</table>
<p>Rows 1 se 3 bilkul lab <b>Open the DMZ to the internet</b> hain. Rows 4 se 7 woh hissa hain jo zyaadatar designs bhool jaate hain: DMZ khud kya shuru kar sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DMZ policy ki teen directions">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">outside (0)</text>
<rect x="250" y="160" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">dmz (50)</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">WEB, MAIL</text>
<rect x="20" y="160" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="90" y="190" text-anchor="middle" class="svg-ink" font-size="13">inside (100)</text>
<line x1="300" y1="70" x2="300" y2="160" stroke="#64748b" stroke-width="2"/><text x="292" y="115" text-anchor="end" class="svg-accent" font-size="12">OUTSIDE_IN: rows 1-3</text>
<line x1="340" y1="160" x2="340" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="348" y="115" class="svg-accent" font-size="12">DMZ_IN: rows 4-6</text>
<line x1="250" y1="185" x2="160" y2="185" stroke="#64748b" stroke-width="2"/><text x="205" y="150" text-anchor="middle" class="svg-accent" font-size="12">DMZ_IN: deny</text>
</svg><p class="cap">Least privilege har direction cover karta hai: DMZ ke andar, DMZ se bahar, aur DMZ se inside ki taraf.</p></div>

<h3>Step 2: matrix ko objects aur ACEs mein badlo</h3>
<p>Inbound (rows 1 se 3) woh lab solution hai jo aap pehle se jaante ho. Naya hissa hai <b>dmz</b> interface par ek ACL. Chapter 2 yaad karo: iske bina dmz (50) se outside (0) <i>sab kuch</i> allowed hai, isliye compromised WEB internet par kisi bhi port tak pahunch sakta hai.</p>
<pre class="code"><span class="c">! reusable objects</span>
object-group network DMZ-SERVERS
 network-object object WEB
 network-object object MAIL
object network DNS-SRV
 host 192.0.2.53
object network REPO
 host 192.0.2.80
<span class="c">! DMZ_IN: DMZ servers kya SHURU kar sakte hain</span>
access-list DMZ_IN remark CHG-4410 containment: DMZ never starts flows to inside
access-list DMZ_IN extended deny ip any object INSIDE-NET log
access-list DMZ_IN extended permit udp object-group DMZ-SERVERS object DNS-SRV eq domain
access-list DMZ_IN extended permit tcp object-group DMZ-SERVERS object REPO eq h&#116;tps
access-list DMZ_IN extended permit tcp object MAIL any eq smtp
access-list DMZ_IN extended deny ip any any log
access-group DMZ_IN in interface dmz</pre>
<p>Order par dhyaan do. INSIDE-NET ki taraf wala deny MAIL permit ke <b>upar</b> hai kyunki <code>object MAIL any eq smtp</code> 10.0.1.x ko bhi match karta hai. ACL bind hote hi woh security levels ko override karti hai, isliye ek broad <code>any</code> chupchaap DMZ se inside khol dega. Agar kabhi WEB ko sach mein kisi inside database tak pahunchna ho, to aap woh ek specific permit deny ke upar insert karte ho.</p>
<p>Replies par koi asar nahi: jab INET WEB tak connection kholta hai, WEB ke jawab connection table se match hote hain aur DMZ_IN ko chhoote hi nahi.</p>

<h3>Step 3: sirf syntax nahi, design verify karo</h3>
<pre class="out">NK-ASA# show access-list DMZ_IN
access-list DMZ_IN; 7 elements; name hash: 0x3e7b1a90
access-list DMZ_IN line 1 remark CHG-4410 containment: DMZ never starts flows to inside
<span class="hl">access-list DMZ_IN line 2 extended deny ip any object INSIDE-NET log informational interval 300 (hitcnt=4) 0x5a1f0c3e</span>
access-list DMZ_IN line 3 extended permit udp object-group DMZ-SERVERS object DNS-SRV eq domain (hitcnt=412) 0x8d20e4b7
access-list DMZ_IN line 4 extended permit tcp object-group DMZ-SERVERS object REPO eq h&#116;tps (hitcnt=37) 0x0c9b5f12
access-list DMZ_IN line 5 extended permit tcp object MAIL any eq smtp (hitcnt=96) 0x77e1a3d4
access-list DMZ_IN line 6 extended deny ip any any log informational interval 300 (hitcnt=0) 0x2b64c8f0
NK-ASA# show logging | include DMZ_IN
%ASA-6-106100: access-list DMZ_IN denied tcp dmz/10.0.2.10(51522) -&gt; inside/10.0.1.10(445) hit-cnt 1 first hit [0x5a1f0c3e, 0x0]</pre>
<p>Line 2 par chaar hits ka matlab hai ki ek DMZ server ne user PC tak SMB connection shuru karne ki koshish ki. Design ne use block bhi kiya aur dikhaya bhi, aur containment isi ke liye hai.</p>

<div class="eg"><p><b>Worked example: exposure gino.</b> Redesign se pehle, WEB kisi bhi internet host ke 65,535 TCP ports mein se koi bhi shuru kar sakta tha aur SMB kisi tak nahi (security levels). Uske baad, WEB exactly do flows shuru kar sakta hai: ek resolver tak UDP 53 aur ek repository tak TCP 443. Auditor yahi kami likhi hui dekhna chahta hai.</p></div>

<h3>Design rules jo policy ko least-privilege rakhte hain</h3>
<ul>
<li><b>Jahan ho sake specific sources</b>: partners aur admins host se, SSH ke liye kabhi <code>any</code> nahi.</li>
<li><b>Specific services</b>: server tak kabhi <code>ip</code> ya saara TCP nahi; ports ka naam lo.</li>
<li><b>Specific destinations</b>: server object, kabhi poora DMZ subnet nahi.</li>
<li>Har haath se likhi ACL ke <b>end mein log ke saath explicit deny</b>, taaki violations dikhein.</li>
<li><b>Temporary ka matlab time-range</b>, "hum hataana yaad rakhenge" nahi.</li>
<li><b>Hit counts review karo</b>: mahino se zero hits wala permit ya to unused hai (hatao) ya shadowed hai (order theek karo).</li>
</ul>

<div class="note"><p><b>Is policy ki boundary.</b> Interface aur global ACLs ASA ke <i>through</i> jaane wala traffic filter karti hain. Khud ASA <i>tak</i> aane wale traffic ko alag se least-privilege kiya jaata hai: <code>ssh 10.0.1.50 255.255.255.255 inside</code> aur <code>h&#116;tp 10.0.1.50 255.255.255.255 inside</code> management ko ADMIN PC tak limit karte hain, <code>icmp</code> rules box tak pings limit karte hain, aur <code>access-group NAME in interface outside control-plane</code> un services ko filter karta hai jaise IKE jo box par terminate hoti hain. Refuse hui to-the-box connections syslog 710003 log karti hain. Poori management-plane hardening sec-aaa-mgmt mein hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf inbound direction design karna; DNS aur update permits ke bina DMZ_IN bind karna, jo patching tod deta hai; inside deny ke upar broad <code>any</code> permit rakhna; "future servers ke liye" DMZ subnet ko destination banana; aur yeh bhool jaana ki tight ki gayi ACL ke baad bhi purani connections <code>clear conn</code> tak chalti rehti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "DMZ interface ka security level 50 hai aur koi ACL nahi. Kya DMZ server internet tak connections khol sakta hai?" Haan, kisi tak bhi: higher se lower default mein allowed hai. Least privilege ke liye dmz interface par inbound ACL chahiye. Aur bind hone ke baad ACL, levels nahi, DMZ se inside bhi decide karti hai.</p></div>

<div class="scn"><h4>Woh web server jo download site ban gaya</h4><p>Ek e-commerce company ke DMZ par strict inbound ACL thi lekin dmz interface par koi ACL nahi thi. Attackers ne ek unpatched web plugin exploit kiya aur server anokhe ports par bahut saare hosts tak outbound connections banane laga. Security team ne flow matrix banaya, paaya ki server ko sach mein sirf DNS aur apne update mirror tak HTTPS chahiye, un do permits aur ek logged deny ke saath DMZ_IN bind kiya, aur outbound traffic usi minute ruk gaya jabki website chalti rahi.</p><p><b>Seekh:</b> least privilege directional hai; inbound rules bypass hone ke baad DMZ ke outbound rules nuksan seemit karte hain.</p></div>

<div class="iv"><p class="q">"Naye DMZ web server ke liye aap firewall rules kaise design karoge?"</p><p>Strong answer: teeno directions cover karne wale flow matrix se shuru karo, har flow ka ek owner ho; outside par inbound sirf zaroori ports server object (real IP) tak publish karo; SSH jaisa admin access named sources tak restrict karo; dmz interface par ACL jodo jo sirf server ke zaroori outbound flows allow kare, kisi bhi broad permit ke upar DMZ se inside deny kare, aur logged deny par khatam ho; remarks aur time-ranges use karo; packet-tracer aur hit counts se verify karo, aur regularly review karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Least privilege = har direction mein exactly woh flows jo business ko chahiye.</li>
<li>Pehle flow matrix banao; sirf initiating direction ko rule chahiye.</li>
<li>dmz par ACL ke bina DMZ servers outside ki taraf kuch bhi shuru kar sakte hain.</li>
<li>DMZ-se-inside deny ko broad permits ke upar rakho; bound ACL security levels ko override karti hai.</li>
<li>Haath se likhi ACLs ko logged deny se khatam karo aur hit counts regularly review karo.</li>
</ul></div>
`}};export{e as default};