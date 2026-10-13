var e={id:`classification-trust`,h:{en:`Classification: ACLs, NBAR and the trust boundary`,hi:`Classification: ACLs, NBAR aur trust boundary`},body:{en:`
<p>A hospital emergency room does not treat patients in arrival order. A triage nurse at the door looks at each patient once, decides "critical", "urgent" or "can wait", and puts a coloured band on the wrist. Doctors inside never re-examine everyone from scratch; they read the band. <b>Classification</b> is the triage nurse, <b>marking</b> is the wristband, and the door where the nurse stands is the <b>trust boundary</b>. This chapter is about the nurse and the door; the next is about the band.</p>

<h3>What classification is</h3>
<p><b>Classification</b> means inspecting a packet and deciding which <b>class</b> (traffic group) it belongs to. A class is just a name, such as VOICE or BULK, that a policy can act on. Classification can use almost any field:</p>
<ul>
<li><b>Layer 1 and 2:</b> ingress interface, 802.1Q CoS, source MAC, VLAN.</li>
<li><b>Layer 3:</b> source and destination IP address, an existing DSCP or IP Precedence.</li>
<li><b>Layer 4:</b> TCP or UDP ports, for example UDP 16384 to 32767 for Cisco RTP voice, TCP 445 for SMB.</li>
<li><b>Layer 7:</b> the application itself, found by deep packet inspection with <b>NBAR</b>.</li>
</ul>
<p>Classification is relatively expensive, so the DiffServ rule is: <b>classify once, at the edge, then mark</b>. Every later hop classifies cheaply by reading the mark.</p>

<h3>Classifying with ACLs</h3>
<p>The most common and most predictable method is an extended ACL referenced from a class-map. These are the exact lines you build on R1 in lab 1:</p>
<pre class="code"><span class="c">! voice RTP from the branch LAN</span>
ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
<span class="c">! SMB backups</span>
ip access-list extended BULK-SMB
 permit tcp any any eq 445
<span class="c">! classes that reference the ACLs</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-all BULK
 match access-group name BULK-SMB</pre>
<p>Inside a class-map, an ACL is a <b>selector</b>, not a filter. <code>permit</code> means "this packet belongs to the class"; <code>deny</code> (including the implicit deny at the end) means "not this class, try the next one". Nothing is ever dropped by the ACL itself here.</p>
<pre class="out">R1# show class-map
 Class Map match-any VOICE (id 1)
<span class="hl">   Match access-group name VOICE-RTP</span>

 Class Map match-all BULK (id 2)
   Match access-group name BULK-SMB

 Class Map match-any class-default (id 0)
   Match any </pre>

<h3>Classifying with NBAR</h3>
<p><b>NBAR2</b> (Network Based Application Recognition) looks inside packets and flows to identify well over a thousand applications, even when they use dynamic ports or hide inside HTTPS. Signatures come in <b>protocol packs</b> that you can update without upgrading IOS XE. Use it with <code>match protocol</code>:</p>
<pre class="code">class-map match-any REALTIME
 match protocol rtp audio
 match protocol attribute category voice-and-video
<span class="c">! optional: see which applications cross an interface</span>
interface GigabitEthernet0/1
 ip nbar protocol-discovery</pre>
<p><code>show ip nbar protocol-discovery</code> then lists packets, bytes and bit rates per application. NBAR is powerful but costs CPU, so enable it at the edge where traffic is classified once, not on every core hop.</p>

<h3>The trust boundary</h3>
<p>Endpoints can mark their own packets. An IP phone marks its voice EF, which is useful. But any PC can also mark everything EF, and if the network believes it, that PC now owns the priority queue. The <b>trust boundary</b> is the point from which the network <b>believes existing markings</b>. Everything outside it must be re-classified and re-marked.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trust boundary options">
<rect x="10" y="70" width="90" height="44" rx="8" fill="#fde68a"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="140" y="70" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="190" y="97" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="280" y="70" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="340" y="97" text-anchor="middle" class="svg-ink" font-size="13">access switch</text>
<rect x="440" y="70" width="110" height="44" rx="8" fill="#bae6fd"/><text x="495" y="97" text-anchor="middle" class="svg-ink" font-size="13">router R1</text>
<line x1="100" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="240" y1="92" x2="280" y2="92" stroke="#64748b" stroke-width="2"/><line x1="400" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><line x1="550" y1="92" x2="630" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="30" x2="120" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="120" y="180" text-anchor="middle" class="svg-accent" font-size="12">best: at phone</text>
<line x1="260" y1="30" x2="260" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="260" y="180" text-anchor="middle" class="svg-accent" font-size="12">good: access port</text>
<line x1="420" y1="30" x2="420" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="420" y="180" text-anchor="middle" class="svg-accent" font-size="12">lab: R1 Gi0/1 in</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">trust boundary: as close to the source as you can control</text>
</svg><p class="cap">Three possible trust boundaries. The closer to the source, the earlier traffic gets correct treatment.</p></div>

<p>On Catalyst 9000 switches (IOS XE), ports trust DSCP by default. A common access-port design is <b>conditional trust</b>: trust markings only if CDP detects a Cisco phone, otherwise treat the port as untrusted. The phone itself re-marks traffic from the PC behind it to CoS 0, which extends the trust boundary into the phone.</p>
<pre class="code">interface GigabitEthernet1/0/5
 switchport access vlan 10
 switchport voice vlan 110
 trust device cisco-phone</pre>
<p>In the lab there is no smart access switch, so <b>R1 is the trust boundary</b>. The policy MARK-IN, applied <b>inbound</b> on the LAN interface Gi0/1, re-classifies every packet by ACL and writes the DSCP itself, whatever the endpoint wrote.</p>

<div class="eg"><p><b>Worked example.</b> PHONE 10.10.10.10 sends RTP to HQ-SRV 10.20.0.100 on UDP port 20000. VOICE-RTP line 1 checks: protocol UDP (yes), source in 10.10.10.0/24 (yes), destination any (yes), destination port 16384 to 32767 (20000, yes), so the packet is in class VOICE. PC-DATA 10.10.10.20 sends UDP to port 5001: 5001 is outside the range, VOICE-RTP denies it, BULK-SMB (TCP 445) denies it, so it falls into <code>class-default</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving class-default untouched at the trust boundary. If a PC sends packets already marked EF that match none of your classes, they pass through unchanged and land in the WAN priority queue. Add <code>class class-default</code> with <code>set dscp default</code> to the ingress marking policy. Also note that VOICE-RTP matches any host in 10.10.10.0/24; real networks put phones in a separate voice VLAN and subnet so the ACL can match only phones.</p></div>

<div class="exam"><p><b>Exam trap.</b> An ACL <code>deny</code> in a class-map does not drop the packet; it only excludes it from that class. And NBAR is matched with <code>match protocol</code>, not with an ACL.</p></div>

<div class="scn"><h4>The PC that marked itself EF</h4><p>At a trading floor, voice quality dropped although the priority queue was sized for twice the call volume. <code>show policy-map interface</code> showed the EF class at its full rate with b/w exceed drops. A capture showed a market-data application on several PCs marking all its UDP traffic EF, and the access ports trusted DSCP. The team set conditional trust on phone ports, re-marked class-default to DSCP 0 at the edge, and gave market data its own AF class.</p><p><b>Lesson:</b> trust markings only from devices you control. Everything else is classified and re-marked at the boundary.</p></div>

<div class="iv"><p class="q">"What is a trust boundary and where would you put it?"</p><p>Strong answer: it is the point from which the network believes existing QoS markings; traffic from outside is re-classified and re-marked. Place it as close to the source as you control: ideally the IP phone with conditional trust on the access port using CDP, otherwise the access switch or first router ingress. Mention that PCs are never trusted and that class-default should be re-marked to DSCP 0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classification puts packets into named classes using L2 to L7 fields; do it once, at the edge.</li>
<li>In a class-map, ACL permit means "in this class"; deny never drops.</li>
<li>NBAR2 identifies applications with <code>match protocol</code> and protocol packs; it costs CPU.</li>
<li>The trust boundary is where markings start to be believed; keep it close to the source.</li>
<li>In the lab, R1 Gi0/1 inbound (MARK-IN) is the trust boundary.</li>
</ul></div>
`,hi:`
<p>Hospital ka emergency room patients ko aane ke kram mein treat nahi karta. Darwaze par triage nurse har patient ko ek baar dekhti hai, decide karti hai "critical", "urgent" ya "ruk sakta hai", aur kalai par rangeen band laga deti hai. Andar ke doctors sabko shuru se dobara nahi jaanchte; woh band padhte hain. <b>Classification</b> triage nurse hai, <b>marking</b> wristband hai, aur jis darwaze par nurse khadi hai woh <b>trust boundary</b> hai. Yeh chapter nurse aur darwaze ke baare mein hai; agla band ke baare mein.</p>

<h3>Classification kya hai</h3>
<p><b>Classification</b> ka matlab hai packet ko jaanch kar decide karna ki woh kis <b>class</b> (traffic group) ka hai. Class bas ek naam hai, jaise VOICE ya BULK, jis par policy action le sakti hai. Classification lagbhag koi bhi field use kar sakta hai:</p>
<ul>
<li><b>Layer 1 aur 2:</b> ingress interface, 802.1Q CoS, source MAC, VLAN.</li>
<li><b>Layer 3:</b> source aur destination IP address, pehle se laga DSCP ya IP Precedence.</li>
<li><b>Layer 4:</b> TCP ya UDP ports, jaise Cisco RTP voice ke liye UDP 16384 se 32767, SMB ke liye TCP 445.</li>
<li><b>Layer 7:</b> application khud, <b>NBAR</b> ke deep packet inspection se pehchani gayi.</li>
</ul>
<p>Classification kaafi mehnga hai, isliye DiffServ ka rule hai: <b>ek baar classify karo, edge par, phir mark karo</b>. Baad ka har hop mark padhkar sasta classify karta hai.</p>

<h3>ACLs se classify karna</h3>
<p>Sabse common aur predictable tareeka hai class-map se refer kiya gaya extended ACL. Yeh bilkul wahi lines hain jo aap lab 1 mein R1 par banaoge:</p>
<pre class="code"><span class="c">! branch LAN se voice RTP</span>
ip access-list extended VOICE-RTP
 permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
<span class="c">! SMB backups</span>
ip access-list extended BULK-SMB
 permit tcp any any eq 445
<span class="c">! ACLs ko refer karne wali classes</span>
class-map match-any VOICE
 match access-group name VOICE-RTP
class-map match-all BULK
 match access-group name BULK-SMB</pre>
<p>Class-map ke andar ACL ek <b>selector</b> hai, filter nahi. <code>permit</code> ka matlab "yeh packet is class ka hai"; <code>deny</code> (aakhri implicit deny samet) ka matlab "yeh class nahi, agli try karo". Yahan ACL khud kabhi kuch drop nahi karta.</p>
<pre class="out">R1# show class-map
 Class Map match-any VOICE (id 1)
<span class="hl">   Match access-group name VOICE-RTP</span>

 Class Map match-all BULK (id 2)
   Match access-group name BULK-SMB

 Class Map match-any class-default (id 0)
   Match any </pre>

<h3>NBAR se classify karna</h3>
<p><b>NBAR2</b> (Network Based Application Recognition) packets aur flows ke andar dekhkar hazaar se zyada applications pehchanta hai, tab bhi jab woh dynamic ports use karein ya HTTPS ke andar chhupi hon. Signatures <b>protocol packs</b> mein aate hain jinhe aap IOS XE upgrade kiye bina update kar sakte ho. Ise <code>match protocol</code> ke saath use karo:</p>
<pre class="code">class-map match-any REALTIME
 match protocol rtp audio
 match protocol attribute category voice-and-video
<span class="c">! optional: dekho interface se kaunsi applications guzarti hain</span>
interface GigabitEthernet0/1
 ip nbar protocol-discovery</pre>
<p>Phir <code>show ip nbar protocol-discovery</code> har application ke packets, bytes aur bit rates dikhata hai. NBAR powerful hai par CPU khata hai, isliye ise edge par enable karo jahan traffic ek baar classify hota hai, har core hop par nahi.</p>

<h3>Trust boundary</h3>
<p>Endpoints apne packets khud mark kar sakte hain. IP phone apni voice ko EF mark karta hai, jo kaam ka hai. Par koi bhi PC bhi sab kuch EF mark kar sakta hai, aur agar network us par bharosa kare, to woh PC ab priority queue ka maalik hai. <b>Trust boundary</b> woh point hai jahan se network <b>pehle se lagi markings par bharosa</b> karta hai. Uske bahar ki har cheez ko dobara classify aur re-mark karna padta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Trust boundary options">
<rect x="10" y="70" width="90" height="44" rx="8" fill="#fde68a"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="140" y="70" width="100" height="44" rx="8" fill="#bbf7d0"/><text x="190" y="97" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="280" y="70" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="340" y="97" text-anchor="middle" class="svg-ink" font-size="13">access switch</text>
<rect x="440" y="70" width="110" height="44" rx="8" fill="#bae6fd"/><text x="495" y="97" text-anchor="middle" class="svg-ink" font-size="13">router R1</text>
<line x1="100" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="240" y1="92" x2="280" y2="92" stroke="#64748b" stroke-width="2"/><line x1="400" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><line x1="550" y1="92" x2="630" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="30" x2="120" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="120" y="180" text-anchor="middle" class="svg-accent" font-size="12">best: phone par</text>
<line x1="260" y1="30" x2="260" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="260" y="180" text-anchor="middle" class="svg-accent" font-size="12">good: access port</text>
<line x1="420" y1="30" x2="420" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="420" y="180" text-anchor="middle" class="svg-accent" font-size="12">lab: R1 Gi0/1 in</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">trust boundary: source ke jitna paas aap control kar sako</text>
</svg><p class="cap">Teen possible trust boundaries. Source ke jitna paas, utni jaldi traffic ko sahi treatment milta hai.</p></div>

<p>Catalyst 9000 switches (IOS XE) par ports default mein DSCP trust karte hain. Common access-port design <b>conditional trust</b> hai: markings par tabhi bharosa karo jab CDP Cisco phone detect kare, warna port ko untrusted maano. Phone khud apne peeche wale PC ke traffic ko CoS 0 re-mark karta hai, jo trust boundary ko phone tak badha deta hai.</p>
<pre class="code">interface GigabitEthernet1/0/5
 switchport access vlan 10
 switchport voice vlan 110
 trust device cisco-phone</pre>
<p>Lab mein koi smart access switch nahi hai, isliye <b>R1 trust boundary hai</b>. Policy MARK-IN, LAN interface Gi0/1 par <b>inbound</b> lagi hui, har packet ko ACL se dobara classify karti hai aur DSCP khud likhti hai, endpoint ne chahe jo likha ho.</p>

<div class="eg"><p><b>Worked example.</b> PHONE 10.10.10.10 HQ-SRV 10.20.0.100 ko UDP port 20000 par RTP bhejta hai. VOICE-RTP line 1 check karti hai: protocol UDP (haan), source 10.10.10.0/24 mein (haan), destination any (haan), destination port 16384 se 32767 (20000, haan), isliye packet class VOICE mein hai. PC-DATA 10.10.10.20 port 5001 par UDP bhejta hai: 5001 range ke bahar hai, VOICE-RTP ise deny karta hai, BULK-SMB (TCP 445) deny karta hai, isliye yeh <code>class-default</code> mein girta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Trust boundary par class-default ko chhod dena. Agar PC pehle se EF marked packets bheje jo aapki kisi class se match na karein, to woh bina badle nikal jaate hain aur WAN priority queue mein pahunch jaate hain. Ingress marking policy mein <code>class class-default</code> ke saath <code>set dscp default</code> jodo. Yeh bhi dhyan do ki VOICE-RTP 10.10.10.0/24 ke kisi bhi host ko match karta hai; asli networks phones ko alag voice VLAN aur subnet mein rakhte hain taaki ACL sirf phones match kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> Class-map mein ACL ka <code>deny</code> packet drop nahi karta; sirf use us class se bahar karta hai. Aur NBAR <code>match protocol</code> se match hota hai, ACL se nahi.</p></div>

<div class="scn"><h4>Woh PC jo khud ko EF mark karta tha</h4><p>Ek trading floor par voice quality gir gayi jabki priority queue call volume se dugni size ki thi. <code>show policy-map interface</code> mein EF class apne full rate par thi aur b/w exceed drops the. Capture se pata chala ki kai PCs par ek market-data application apna saara UDP traffic EF mark kar rahi thi, aur access ports DSCP trust karte the. Team ne phone ports par conditional trust lagaya, edge par class-default ko DSCP 0 re-mark kiya, aur market data ko uski apni AF class di.</p><p><b>Seekh:</b> markings par sirf un devices se bharosa karo jo aap control karte ho. Baaki sab boundary par classify aur re-mark hota hai.</p></div>

<div class="iv"><p class="q">"Trust boundary kya hai aur aap ise kahan rakhoge?"</p><p>Strong answer: yeh woh point hai jahan se network existing QoS markings par bharosa karta hai; bahar ka traffic dobara classify aur re-mark hota hai. Ise source ke jitna paas aap control karo wahan rakho: ideally IP phone, access port par CDP se conditional trust ke saath, warna access switch ya pehle router ka ingress. Batao ki PCs par kabhi trust nahi hota aur class-default ko DSCP 0 re-mark karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classification L2 se L7 fields use karke packets ko named classes mein daalta hai; ise ek baar, edge par karo.</li>
<li>Class-map mein ACL permit ka matlab "is class mein"; deny kabhi drop nahi karta.</li>
<li>NBAR2 <code>match protocol</code> aur protocol packs se applications pehchanta hai; yeh CPU khata hai.</li>
<li>Trust boundary woh jagah hai jahan markings par bharosa shuru hota hai; ise source ke paas rakho.</li>
<li>Lab mein R1 Gi0/1 inbound (MARK-IN) trust boundary hai.</li>
</ul></div>
`}};export{e as default};