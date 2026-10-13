var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking the HSRP, VRRP and NTP labs`,hi:`Troubleshooting workflow: HSRP, VRRP aur NTP labs ke through chalna`},body:{en:`
<p>A good doctor does not start with surgery. She asks where it hurts, checks the pulse, runs the simple tests, and only then orders a scan. Troubleshooting IP services works the same way: <b>define the symptom, check the basics, compare both sides, read the one command that tells the truth, change one thing, verify</b>. This chapter walks through each lab as a series of realistic faults.</p>

<h3>The general workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="12">who, what, when</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Basics</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="12">L1-L3, reach</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Compare</text><text x="315" y="84" text-anchor="middle" class="svg-muted" font-size="12">both sides</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 One fix</text><text x="440" y="84" text-anchor="middle" class="svg-muted" font-size="12">smallest change</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="570" y="84" text-anchor="middle" class="svg-muted" font-size="12">and test failover</text>
<line x1="120" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="245" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="495" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">for FHRP and NTP, always read the output of both routers</text>
</svg><p class="cap">Five steps; for redundancy protocols the "compare both sides" step finds most faults.</p></div>

<h3>Lab 1: HSRPv2 with object tracking</h3>
<p><b>Fault A: both routers Active.</b> <code>show standby brief</code> on R1 and R2 each shows <code>Active</code> with <code>Standby unknown</code>. Causes, in order of likelihood: authentication mismatch (look for <code>%HSRP-4-BADAUTH</code>), version mismatch (one side v1, <code>show standby</code> shows <code>(version 1)</code>), different group numbers, or the routers are not in the same VLAN (a switch port in the wrong VLAN, or hellos filtered). The switch MAC table flapping for 0000.0c9f.f001 confirms two senders.</p>
<pre class="out">R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       1    100 P Active  local           unknown         192.168.20.1</span>
R2#
<span class="hl">%HSRP-4-BADAUTH: Bad authentication from 192.168.20.2, group 1, remote state Active</span></pre>
<p><b>Fault B: ISP-A upstream down but R1 stays Active.</b> Check the chain link by link: is the IP SLA running (<code>show ip sla statistics 1</code> shows the latest return code, Timeout)? Is the track following it (<code>show track 10</code> shows <code>Reachability is Down</code>)? Is HSRP linked to the track (<code>show standby</code> shows <code>Track object 10 state Down decrement 20</code>)? Is the new priority below R2's? Does R2 have preempt?</p>
<pre class="out">R1# show track 10
Track 10
  IP SLA 1 reachability
<span class="hl">  Reachability is Down</span>
    3 changes, last change 00:00:14
  Latest operation return code: Timeout
  Tracked by:
    HSRP GigabitEthernet0/0 1</pre>
<p>If <code>Tracked by</code> is empty, the <code>standby 1 track 10</code> line is missing. If the probe keeps succeeding although ISP-A is dead, the probe is escaping through another path; check its source interface and the routing toward 203.0.113.53.</p>
<p><b>Fault C: R1 never takes the role back.</b> After ISP-A returns, R1 is at 110 but stays Standby: R1 lacks <code>preempt</code>, or a long <code>preempt delay</code> is still counting.</p>

<h3>Lab 2: VRRP between two vendors</h3>
<p><b>Fault D: both Master.</b> Same logic as HSRP: authentication (<code>%VRRP-4-BADAUTH</code>), version, VRID, or advert interval. In lab 2 the key is text <code>NKvrrp5</code>, case-sensitive. <code>show vrrp</code> on each side shows the configured key in clear for text authentication, which makes comparison easy.</p>
<p><b>Fault E: R1 should be Master but R2 is.</b> Check the priorities (<code>show vrrp brief</code>: 120 vs 100) and whether preempt was disabled with <code>no vrrp 5 preempt</code> (the <code>Pre</code> column shows no Y). Remember VRRP preempts by default, so a missing Y means someone turned it off.</p>
<p><b>Fault F: the VIP does not answer pings, but traffic flows.</b> The Master is a non-owner from a vendor that does not accept packets for the VIP by default. Enable its accept-data option or monitor the real addresses.</p>

<h3>Lab 3: authenticated NTP hierarchy</h3>
<p><b>Fault G: BR2 unsynchronised with authentication on.</b> Work through the four pieces:</p>
<pre class="out">BR2# show ntp associations detail
<span class="hl">10.255.0.1 configured, ipv4, insane, invalid, unsynced, stratum 16</span>
ref ID .INIT., time 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)
our mode client, peer mode unspec, our poll intvl 64, peer poll intvl 1024
root delay 0.00 msec, root disp 0.00, reach 0, sync dist 16000.00

BR2# show running-config | include ntp
<span class="hl">ntp authentication-key 1 md5 0822455D0A16 7</span>
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1</pre>
<p>All four lines exist, ping to 10.255.0.1 works, so the remaining suspect is the secret. It is shown encrypted, so you cannot compare it by eye; re-enter <code>ntp authentication-key 1 md5 NK-Time</code> on BR2. Within a few poll intervals, <code>show ntp status</code> reports <code>Clock is synchronized, stratum 4, reference is 10.255.0.1</code>.</p>
<p><b>Other NTP faults:</b> no <code>ntp trusted-key</code> (never syncs), wrong key ID on the server line, HQ not synchronised itself (a client cannot sync to a stratum 16 server), an ACL or <code>ntp access-group</code> blocking UDP 123, or the client sourcing from an address the server does not permit. Use <code>debug ntp packets</code> or <code>debug ntp validity</code> briefly.</p>

<h3>NAT faults, quickly</h3>
<p>No translation created: interfaces not marked inside/outside, ACL does not match, or traffic is routed out a different interface than the route-map expects. Translation created but no reply: the outside cannot route the inside global back, or an outside ACL is written with inside local addresses. Works for some users only: pool exhausted (misses rising) or PAT on a dual-ISP router without route-map NAT.</p>

<div class="eg"><p><b>Worked example.</b> A ticket says "R2 did not take over". Outputs: R1 <code>Priority 95 (configured 110)</code>, <code>Track object 10 state Down decrement 15</code>; R2 priority 100, <code>P</code> present. 110 - 15 = 95 is below 100 and R2 preempts, so R2 <i>should</i> be Active. <code>show standby brief</code> on R2 still shows <code>Standby</code>, so the two routers do hear each other. Then read R2's preempt line: <code>Preemption enabled, delay min 300 secs</code>. A template meant for reloads made R2 wait five minutes before taking over, so users suffered five minutes of blackhole. Reducing it to <code>standby 1 preempt delay minimum 30</code> and using <code>reload</code> for the boot case fixes the design.</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing failover by shutting the router's LAN interface only. That proves the basic group works but not tracking. Always also fail the <i>tracked</i> thing (the upstream or probe target) and restore it, as tasks 5 and 6 of lab 1 do.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Both routers are Active" is almost always a communication problem (authentication, version, group, VLAN), not a priority problem. "Standby never takes over after tracking" is almost always decrement too small or preempt missing.</p></div>

<div class="scn"><h4>The change window that created two Masters</h4><p>During a planned VRRP migration, an engineer ran <code>fhrp version vrrp v3</code> on R1 and rebuilt group 5 in address-family syntax, planning to do R2 next week. Immediately both routers became Master: R1 sent v3 adverts, R2 only understood v2. Users saw ARP flapping for 0000.5e00.0105. Adding <code>vrrpv2</code> under R1's IPv4 address family let R1 speak v2 to R2; the pair converged and the migration continued safely a week later.</p><p><b>Lesson:</b> when changing versions one side at a time, use the compatibility mode and verify <code>show vrrp brief</code> on both routers before leaving.</p></div>

<div class="iv"><p class="q">"Users report intermittent loss and both HSRP routers show Active. Walk me through it."</p><p>Explain that two Actives mean the routers cannot hear each other. Check authentication (BADAUTH logs), version, group number, VLAN and trunk membership on the switch, and any ACL or storm control dropping multicast 224.0.0.102. Confirm with the switch MAC table flapping for the virtual MAC. Fix the one mismatch, then verify one Active, one Standby, and test failover including tracking.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, basics, compare both sides, one fix, verify and test failover.</li>
<li>Two Active/Master routers means lost communication: auth, version, group/VRID, VLAN, interval.</li>
<li>Tracking not working: check SLA, track state, Tracked by, decrement arithmetic and peer preempt.</li>
<li>NTP not syncing: reachability, four auth pieces (secret case!), server synchronised, access groups.</li>
<li>NAT: interfaces and ACL, return routing, ACL address perspective, pool misses.</li>
</ul></div>
`,hi:`
<p>Achhi doctor surgery se shuru nahi karti. Woh poochti hai kahan dard hai, nabz dekhti hai, simple tests chalaati hai, aur tabhi scan likhti hai. IP services troubleshoot karna bhi aise hi hai: <b>symptom define karo, basics check karo, dono sides compare karo, woh ek command padho jo sach batati hai, ek cheez badlo, verify karo</b>. Yeh chapter har lab ko realistic faults ki series ki tarah chalta hai.</p>

<h3>General workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting workflow">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Symptom</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="12">kaun, kya, kab</text>
<rect x="135" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Basics</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="12">L1-L3, reach</text>
<rect x="260" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Compare</text><text x="315" y="84" text-anchor="middle" class="svg-muted" font-size="12">dono sides</text>
<rect x="385" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="440" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Ek fix</text><text x="440" y="84" text-anchor="middle" class="svg-muted" font-size="12">sabse chhota change</text>
<rect x="510" y="40" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="570" y="84" text-anchor="middle" class="svg-muted" font-size="12">aur failover test</text>
<line x1="120" y1="70" x2="135" y2="70" stroke="#64748b" stroke-width="2"/><line x1="245" y1="70" x2="260" y2="70" stroke="#64748b" stroke-width="2"/><line x1="370" y1="70" x2="385" y2="70" stroke="#64748b" stroke-width="2"/><line x1="495" y1="70" x2="510" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">FHRP aur NTP ke liye hamesha dono routers ka output padho</text>
</svg><p class="cap">Paanch steps; redundancy protocols ke liye "dono sides compare karo" step zyada tar faults pakadta hai.</p></div>

<h3>Lab 1: object tracking ke saath HSRPv2</h3>
<p><b>Fault A: dono routers Active.</b> R1 aur R2 dono par <code>show standby brief</code> <code>Active</code> aur <code>Standby unknown</code> dikhata hai. Causes, sambhavna ke order mein: authentication mismatch (<code>%HSRP-4-BADAUTH</code> dhoondho), version mismatch (ek side v1, <code>show standby</code> <code>(version 1)</code> dikhata hai), alag group numbers, ya routers same VLAN mein nahi (galat VLAN mein switch port, ya hellos filter ho rahe). 0000.0c9f.f001 ke liye switch MAC table ka flap hona do senders confirm karta hai.</p>
<pre class="out">R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       1    100 P Active  local           unknown         192.168.20.1</span>
R2#
<span class="hl">%HSRP-4-BADAUTH: Bad authentication from 192.168.20.2, group 1, remote state Active</span></pre>
<p><b>Fault B: ISP-A upstream down lekin R1 Active rehta hai.</b> Chain ko link by link check karo: kya IP SLA chal raha hai (<code>show ip sla statistics 1</code> latest return code dikhata hai, Timeout)? Kya track use follow kar raha hai (<code>show track 10</code> <code>Reachability is Down</code> dikhata hai)? Kya HSRP track se juda hai (<code>show standby</code> <code>Track object 10 state Down decrement 20</code> dikhata hai)? Kya nayi priority R2 se neeche hai? Kya R2 par preempt hai?</p>
<pre class="out">R1# show track 10
Track 10
  IP SLA 1 reachability
<span class="hl">  Reachability is Down</span>
    3 changes, last change 00:00:14
  Latest operation return code: Timeout
  Tracked by:
    HSRP GigabitEthernet0/0 1</pre>
<p>Agar <code>Tracked by</code> khaali hai, to <code>standby 1 track 10</code> line missing hai. Agar ISP-A mara hone ke bawajood probe succeed karta rahe, to probe doosre path se nikal raha hai; uska source interface aur 203.0.113.53 ki taraf routing check karo.</p>
<p><b>Fault C: R1 kabhi role wapas nahi leta.</b> ISP-A wapas aane ke baad R1 110 par hai lekin Standby rehta hai: R1 par <code>preempt</code> nahi hai, ya lamba <code>preempt delay</code> abhi gin raha hai.</p>

<h3>Lab 2: do vendors ke beech VRRP</h3>
<p><b>Fault D: dono Master.</b> HSRP jaisa hi logic: authentication (<code>%VRRP-4-BADAUTH</code>), version, VRID, ya advert interval. Lab 2 mein key text <code>NKvrrp5</code> hai, case-sensitive. Text authentication ke liye <code>show vrrp</code> har side par configured key clear mein dikhata hai, jisse comparison aasaan hai.</p>
<p><b>Fault E: R1 Master hona chahiye lekin R2 hai.</b> Priorities check karo (<code>show vrrp brief</code>: 120 vs 100) aur kya preempt <code>no vrrp 5 preempt</code> se disable kiya gaya (<code>Pre</code> column mein Y nahi). Yaad rakho VRRP default mein preempt karta hai, to missing Y matlab kisi ne use band kiya.</p>
<p><b>Fault F: VIP pings ka jawab nahi deta, lekin traffic chalta hai.</b> Master aise vendor ka non-owner hai jo default mein VIP ke packets accept nahi karta. Uska accept-data option enable karo ya asli addresses monitor karo.</p>

<h3>Lab 3: authenticated NTP hierarchy</h3>
<p><b>Fault G: authentication on ke saath BR2 unsynchronised.</b> Chaar pieces se guzro:</p>
<pre class="out">BR2# show ntp associations detail
<span class="hl">10.255.0.1 configured, ipv4, insane, invalid, unsynced, stratum 16</span>
ref ID .INIT., time 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)
our mode client, peer mode unspec, our poll intvl 64, peer poll intvl 1024
root delay 0.00 msec, root disp 0.00, reach 0, sync dist 16000.00

BR2# show running-config | include ntp
<span class="hl">ntp authentication-key 1 md5 0822455D0A16 7</span>
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1</pre>
<p>Chaaron lines hain, 10.255.0.1 tak ping chalta hai, to bacha hua suspect secret hai. Woh encrypted dikhta hai, to aap aankh se compare nahi kar sakte; BR2 par <code>ntp authentication-key 1 md5 NK-Time</code> dobara daalo. Kuch poll intervals mein <code>show ntp status</code> report karta hai <code>Clock is synchronized, stratum 4, reference is 10.255.0.1</code>.</p>
<p><b>Doosre NTP faults:</b> <code>ntp trusted-key</code> nahi (kabhi sync nahi), server line par galat key ID, HQ khud sync nahi (client stratum 16 server se sync nahi ho sakta), UDP 123 ko block karta ACL ya <code>ntp access-group</code>, ya client aise address se source kar raha hai jise server permit nahi karta. Thodi der <code>debug ntp packets</code> ya <code>debug ntp validity</code> use karo.</p>

<h3>NAT faults, jaldi se</h3>
<p>Translation nahi bani: interfaces inside/outside mark nahi, ACL match nahi karta, ya traffic us interface se alag interface se route ho raha hai jo route-map expect karta hai. Translation bani lekin reply nahi: outside inside global ko wapas route nahi kar sakta, ya outside ACL inside local addresses se likha hai. Sirf kuch users ke liye chalta hai: pool exhausted (misses badh rahe) ya dual-ISP router par bina route-map NAT ke PAT.</p>

<div class="eg"><p><b>Worked example.</b> Ticket kehta hai "R2 ne kaam nahi liya". Outputs: R1 <code>Priority 95 (configured 110)</code>, <code>Track object 10 state Down decrement 15</code>; R2 priority 100, <code>P</code> maujood. 110 - 15 = 95 jo 100 se neeche hai aur R2 preempt karta hai, to R2 ko Active <i>hona chahiye</i>. R2 par <code>show standby brief</code> abhi bhi <code>Standby</code> dikhata hai, to dono routers ek doosre ko sun rahe hain. Tab R2 ki preempt line padho: <code>Preemption enabled, delay min 300 secs</code>. Reloads ke liye bane template ne R2 ko kaam lene se pehle paanch minute rukwaya, to users ne paanch minute blackhole jhela. Ise <code>standby 1 preempt delay minimum 30</code> karna aur boot case ke liye <code>reload</code> use karna design theek karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Failover sirf router ka LAN interface shut karke test karna. Isse saabit hota hai ki basic group chalta hai lekin tracking nahi. Hamesha <i>tracked</i> cheez (upstream ya probe target) ko bhi fail aur restore karo, jaise lab 1 ke tasks 5 aur 6 karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Dono routers Active hain" lagbhag hamesha communication problem hai (authentication, version, group, VLAN), priority problem nahi. "Tracking ke baad Standby kabhi kaam nahi leta" lagbhag hamesha decrement bahut chhota ya preempt missing hai.</p></div>

<div class="scn"><h4>Change window jisne do Masters banaye</h4><p>Planned VRRP migration ke dauraan ek engineer ne R1 par <code>fhrp version vrrp v3</code> chalaaya aur group 5 ko address-family syntax mein dobara banaya, R2 agle hafte karne ka plan tha. Turant dono routers Master ban gaye: R1 v3 adverts bhej raha tha, R2 sirf v2 samajhta tha. Users ko 0000.5e00.0105 ke liye ARP flapping dikhi. R1 ki IPv4 address family ke under <code>vrrpv2</code> jodne se R1 R2 se v2 mein baat kar paaya; pair converge hua aur migration ek hafte baad safely aage badhi.</p><p><b>Seekh:</b> jab ek ek side karke versions badlo, to compatibility mode use karo aur jaane se pehle dono routers par <code>show vrrp brief</code> verify karo.</p></div>

<div class="iv"><p class="q">"Users beech beech mein loss report karte hain aur dono HSRP routers Active dikhate hain. Mujhe step by step batao."</p><p>Samjhao ki do Actives ka matlab routers ek doosre ko sun nahi paa rahe. Authentication (BADAUTH logs), version, group number, switch par VLAN aur trunk membership, aur koi ACL ya storm control jo multicast 224.0.0.102 drop kare, check karo. Virtual MAC ke liye switch MAC table flap hone se confirm karo. Ek mismatch theek karo, phir ek Active, ek Standby verify karo, aur tracking samet failover test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, basics, dono sides compare, ek fix, verify aur failover test.</li>
<li>Do Active/Master routers matlab communication khoya: auth, version, group/VRID, VLAN, interval.</li>
<li>Tracking kaam nahi kar raha: SLA, track state, Tracked by, decrement ka hisaab aur peer preempt check karo.</li>
<li>NTP sync nahi: reachability, chaar auth pieces (secret ka case!), server synchronised, access groups.</li>
<li>NAT: interfaces aur ACL, return routing, ACL ka address perspective, pool misses.</li>
</ul></div>
`}};export{e as default};