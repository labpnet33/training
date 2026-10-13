var e={id:`failures`,h:{en:`Failure scenarios and the loop-avoidance rule`,hi:`Failure scenarios aur loop-avoidance rule`},body:{en:`
<p>Pilots do not learn to fly only on sunny days; most of their training is about engine failures. vPC is the same. Any engineer can build a healthy pair; the job interview and the 3 a.m. incident are about what happens when a piece breaks. This chapter goes through every failure you must be able to predict, using the lab topology: NX1 primary, NX2 secondary, SRV1 on vPC 20, and SRV2 on orphan port NX2 Ethernet1/5.</p>

<h3>First, the loop-avoidance rule in detail</h3>
<p>vPC does not block links with STP; it relies on one hardware rule: <b>a frame received on the peer-link is not forwarded out of a vPC member port, as long as the twin member port on the peer is up.</b> Why? Imagine SRV9 on NX1 sends a broadcast. NX1 floods it to SRV1 via its own Po20 member, and also across the peer-link so that NX2's orphan ports and other VLAN members get it. If NX2 also sent it down its Po20 member, SRV1 would receive the broadcast twice, and its bond could send it back up: a loop. So NX2 drops it on vPC ports. The exception is when a vPC has lost its members on one peer: then the other peer may use the peer-link path for that vPC, which is exactly how traffic survives a member link failure.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="vPC loop avoidance rule">
<rect x="70" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="160" y="48" text-anchor="middle" class="svg-ink" font-size="13">NX1</text>
<rect x="390" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="480" y="48" text-anchor="middle" class="svg-ink" font-size="13">NX2</text>
<line x1="250" y1="43" x2="390" y2="43" stroke="#64748b" stroke-width="4"/><text x="320" y="35" text-anchor="middle" class="svg-muted" font-size="12">flood copy over peer-link</text>
<rect x="240" y="160" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (vPC 20)</text>
<line x1="160" y1="66" x2="290" y2="160" stroke="#64748b" stroke-width="3"/><text x="150" y="120" class="svg-muted" font-size="12">delivered here</text>
<line x1="480" y1="66" x2="350" y2="160" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="120" class="svg-accent" font-size="12">dropped: twin is up</text>
<rect x="500" y="160" width="120" height="46" rx="8" fill="#fde68a"/><text x="560" y="188" text-anchor="middle" class="svg-ink" font-size="13">SRV2 orphan</text>
<line x1="540" y1="66" x2="560" y2="160" stroke="#64748b" stroke-width="2"/><text x="555" y="120" class="svg-muted" font-size="12">delivered</text>
</svg><p class="cap">A flooded frame from NX1 reaches NX2 over the peer-link. NX2 delivers it to the orphan port but not to vPC 20, because NX1 already did.</p></div>

<h3>The failure table</h3>
<table class="cmp"><tr><th>Failure</th><th>What vPC does</th><th>Impact</th></tr>
<tr><td>One vPC member link (NX1 Eth1/3)</td><td>SRV1's bond loses a slave; the vPC stays up on NX2; traffic for NX1 crosses the peer-link</td><td>Half bandwidth for SRV1, no outage</td></tr>
<tr><td>Keepalive only</td><td>Nothing changes; <code>show vpc brief</code> shows the keepalive status as not alive, the adjacency stays up</td><td>None now; the safety net for the next failure is gone</td></tr>
<tr><td>Peer-link only (keepalive up)</td><td>The secondary learns via the keepalive that the primary is alive, so it <b>suspends all its vPC member ports and the SVIs of vPC VLANs</b></td><td>Dual-homed devices fine on the primary; <b>orphan ports on the secondary are cut off</b></td></tr>
<tr><td>Primary switch dies (keepalive and peer-link both silent)</td><td>Secondary becomes <b>operational primary</b> and keeps forwarding</td><td>Dual-homed devices fine; orphans on the dead switch lost</td></tr>
<tr><td>Peer-link and keepalive both fail, both switches alive</td><td><b>Dual-active</b> (split brain): each thinks the other is dead and acts as primary</td><td>Unpredictable: duplicate gateways, inconsistent MAC/ARP state</td></tr>
<tr><td>Both reload, only one returns</td><td>vPCs stay down unless <code>auto-recovery</code> is configured (chapter 8)</td><td>Outage until the peer returns or auto-recovery fires</td></tr>
</table>

<h3>Peer-link failure, step by step</h3>
<p>This is the most tested scenario. When port-channel1 goes down, NX2 cannot tell from the peer-link alone whether NX1 died. It checks the keepalive: "peer is alive". If both switches kept forwarding without the peer-link, they could no longer synchronise MACs or coordinate flooding, so the secondary steps aside:</p>
<pre class="out">NX2# show vpc brief
<span class="hl">Peer status                       : peer link is down</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
vPC role                          : secondary
...
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          down   success     Peer-link is down     -</span>

NX2# show logging last 3
%VPC-2-PEER_LINK_DOWN: vPC peer-link is down
%VPC-2-VPC_SUSP_ALL_VPC: Peer-link going down, suspending all vPCs on secondary</pre>
<p>NX2 also shuts the SVIs of all VLANs carried on the peer-link, so it stops acting as a gateway for them. If you need an SVI on the secondary to stay up (for example a routing adjacency or management), exclude it with <code>dual-active exclude interface-vlan 99</code> under the vPC domain.</p>

<h3>Orphan ports: the weak spot</h3>
<p>SRV2 hangs off NX2 Ethernet1/5 in VLAN 10. During the peer-link failure its port is still up, but NX2's VLAN 10 SVI is down and the only path to NX1 was the peer-link. SRV2 cannot reach its gateway 10.10.10.1: it is up but isolated. The lab asks you to prove this with a ping from SRV2.</p>
<pre class="out">NX2# show vpc orphan-ports
VLAN            Orphan Ports
-------         -------------------------
<span class="hl">10              Eth1/5</span></pre>
<p>Options: dual-home the device (best); connect single-NIC devices to the primary; or, for an active/standby NIC team, configure <code>vpc orphan-port suspend</code> on the secondary's orphan port. That command makes the secondary shut the port together with its vPCs, so the server sees link-down and fails over to its NIC on the primary.</p>
<pre class="code">interface ethernet1/5
  vpc orphan-port suspend</pre>

<h3>Primary failure and non-preemption</h3>
<p>In the NOC drill you simulate NX1 losing power by shutting all its Ethernet interfaces. Now both the keepalive and the peer-link are silent, so NX2 concludes that NX1 is dead and takes over:</p>
<pre class="out">NX2# show vpc role
<span class="hl">vPC role                        : secondary, operational primary</span></pre>
<p>vPC 20 stays up on NX2, SRV1's bond runs on one slave, and after the HSRP hold time (10 seconds by default) NX2 becomes HSRP Active for 10.10.10.1. When NX1 comes back it does <b>not</b> take the role back; it shows <code>primary, operational secondary</code>. Operationally that is fine; just remember it when you predict which switch will suspend in the next failure.</p>

<div class="eg"><p><b>Worked example: why the keepalive must be separate.</b> Suppose the keepalive ran over an SVI in VLAN 99 carried on the peer-link. A line card holding both peer-link members fails on NX1. The peer-link goes down and, with it, the keepalive. NX2 sees neither, concludes NX1 is dead and becomes operational primary. But NX1 is alive and still primary. Both forward on vPC 20, both are HSRP Active, and ARP and MAC tables diverge. That is dual-active, caused by a single failure. With the keepalive on mgmt0, the same failure would simply have suspended NX2's vPCs, cleanly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing that "the primary suspends when the peer-link fails" (it is the secondary); forgetting orphan ports in the design; and running the keepalive over the peer-link or through the same line card as the peer-link.</p></div>

<div class="exam"><p><b>Exam trap.</b> Keepalive failure alone has no traffic impact. Peer-link failure with keepalive up suspends the secondary's vPCs and vPC-VLAN SVIs. Both failing with both switches alive is dual-active.</p></div>

<div class="scn"><h4>The backup appliance that vanished</h4><p>During a peer-link outage caused by a faulty optic, all dual-homed servers kept working, but a single-NIC backup appliance on the secondary leaf lost its gateway and missed a night of backups. <code>show vpc orphan-ports</code> on the secondary listed its port. The team moved the appliance to a new dual-NIC model in an LACP bond, and for the remaining single-homed devices they standardised on connecting them to the primary. They also moved the peer-link members onto two different line cards.</p><p><b>Lesson:</b> list your orphan ports before an outage does it for you.</p></div>

<div class="iv"><p class="q">"The vPC peer-link fails but the keepalive is up. What happens?"</p><p>Strong answer: the secondary uses the keepalive to confirm the primary is alive, and to avoid dual-active it suspends all its vPC member ports and the SVIs of vPC VLANs; the primary carries all traffic. Dual-homed devices keep working on one link. Orphan ports on the secondary are isolated unless you use <code>vpc orphan-port suspend</code> with active/standby teaming, or exclude specific SVIs with <code>dual-active exclude interface-vlan</code>. When the peer-link returns, consistency checks run and the secondary restores its vPCs after delay restore.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Frames from the peer-link never leave a vPC member port whose twin on the peer is up.</li>
<li>Keepalive down alone: no impact. Peer-link down, keepalive up: secondary suspends vPCs and vPC-VLAN SVIs.</li>
<li>Orphan ports on the secondary are isolated in a peer-link failure; use dual-homing or <code>vpc orphan-port suspend</code>.</li>
<li>Primary dies: secondary becomes "secondary, operational primary"; roles do not preempt back.</li>
<li>Peer-link and keepalive failing together with both switches alive is dual-active; keep them on separate paths.</li>
</ul></div>
`,hi:`
<p>Pilots sirf dhoop wale dinon mein udna nahi seekhte; unki zyada tar training engine failures ke baare mein hoti hai. vPC bhi waisa hi hai. Koi bhi engineer healthy pair bana sakta hai; job interview aur raat 3 baje ka incident is baare mein hai ki jab koi hissa toot-ta hai to kya hota hai. Yeh chapter har woh failure dekhta hai jise aapko predict kar paana chahiye, lab topology use karke: NX1 primary, NX2 secondary, SRV1 vPC 20 par, aur SRV2 orphan port NX2 Ethernet1/5 par.</p>

<h3>Pehle, loop-avoidance rule detail mein</h3>
<p>vPC STP se links block nahi karta; woh ek hardware rule par chalta hai: <b>peer-link par aaya frame vPC member port se forward nahi hota, jab tak peer par jodidaar member port up hai.</b> Kyun? Socho NX1 par SRV9 broadcast bhejta hai. NX1 use apne Po20 member se SRV1 tak flood karta hai, aur peer-link ke paar bhi taaki NX2 ke orphan ports aur VLAN ke doosre members ko mile. Agar NX2 bhi use apne Po20 member se neeche bhejta, to SRV1 ko broadcast do baar milta, aur uska bond use wapas upar bhej sakta tha: loop. Isliye NX2 use vPC ports par drop karta hai. Exception tab hai jab kisi vPC ne ek peer par apne members kho diye hon: tab doosra peer us vPC ke liye peer-link path use kar sakta hai, aur member link failure mein traffic isi tarah bachta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="vPC loop avoidance rule">
<rect x="70" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="160" y="48" text-anchor="middle" class="svg-ink" font-size="13">NX1</text>
<rect x="390" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="480" y="48" text-anchor="middle" class="svg-ink" font-size="13">NX2</text>
<line x1="250" y1="43" x2="390" y2="43" stroke="#64748b" stroke-width="4"/><text x="320" y="35" text-anchor="middle" class="svg-muted" font-size="12">peer-link par flood copy</text>
<rect x="240" y="160" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="13">SRV1 (vPC 20)</text>
<line x1="160" y1="66" x2="290" y2="160" stroke="#64748b" stroke-width="3"/><text x="150" y="120" class="svg-muted" font-size="12">yahan deliver</text>
<line x1="480" y1="66" x2="350" y2="160" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="120" class="svg-accent" font-size="12">drop: jodidaar up</text>
<rect x="500" y="160" width="120" height="46" rx="8" fill="#fde68a"/><text x="560" y="188" text-anchor="middle" class="svg-ink" font-size="13">SRV2 orphan</text>
<line x1="540" y1="66" x2="560" y2="160" stroke="#64748b" stroke-width="2"/><text x="555" y="120" class="svg-muted" font-size="12">deliver</text>
</svg><p class="cap">NX1 ka flooded frame peer-link se NX2 tak pahunchta hai. NX2 use orphan port ko deliver karta hai par vPC 20 ko nahi, kyunki NX1 pehle hi kar chuka.</p></div>

<h3>Failure table</h3>
<table class="cmp"><tr><th>Failure</th><th>vPC kya karta hai</th><th>Asar</th></tr>
<tr><td>Ek vPC member link (NX1 Eth1/3)</td><td>SRV1 ka bond ek slave khota hai; vPC NX2 par up rehta hai; NX1 ke liye traffic peer-link cross karta hai</td><td>SRV1 ke liye aadhi bandwidth, outage nahi</td></tr>
<tr><td>Sirf keepalive</td><td>Kuch nahi badalta; <code>show vpc brief</code> keepalive status ko alive nahi dikhata, adjacency up rehti hai</td><td>Abhi koi nahi; agle failure ka safety net chala gaya</td></tr>
<tr><td>Sirf peer-link (keepalive up)</td><td>Secondary keepalive se jaanta hai ki primary zinda hai, isliye woh <b>apne saare vPC member ports aur vPC VLANs ke SVIs suspend kar deta hai</b></td><td>Dual-homed devices primary par theek; <b>secondary ke orphan ports kat jaate hain</b></td></tr>
<tr><td>Primary switch mar gaya (keepalive aur peer-link dono chup)</td><td>Secondary <b>operational primary</b> banta hai aur forward karta rehta hai</td><td>Dual-homed devices theek; mare switch ke orphans gaye</td></tr>
<tr><td>Peer-link aur keepalive dono fail, dono switches zinda</td><td><b>Dual-active</b> (split brain): har ek sochta hai doosra mar gaya aur primary ki tarah kaam karta hai</td><td>Unpredictable: duplicate gateways, inconsistent MAC/ARP state</td></tr>
<tr><td>Dono reload, sirf ek wapas aata hai</td><td>vPCs down rehte hain jab tak <code>auto-recovery</code> configured na ho (chapter 8)</td><td>Peer wapas aane ya auto-recovery chalne tak outage</td></tr>
</table>

<h3>Peer-link failure, step by step</h3>
<p>Yeh sabse zyada test hone wala scenario hai. Jab port-channel1 down hota hai, NX2 sirf peer-link se nahi bata sakta ki NX1 mar gaya ya nahi. Woh keepalive check karta hai: "peer is alive". Agar dono switches bina peer-link ke forward karte rehte, to woh MACs sync nahi kar paate na flooding coordinate kar paate, isliye secondary side ho jaata hai:</p>
<pre class="out">NX2# show vpc brief
<span class="hl">Peer status                       : peer link is down</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
vPC role                          : secondary
...
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          down   success     Peer-link is down     -</span>

NX2# show logging last 3
%VPC-2-PEER_LINK_DOWN: vPC peer-link is down
%VPC-2-VPC_SUSP_ALL_VPC: Peer-link going down, suspending all vPCs on secondary</pre>
<p>NX2 peer-link par jaane wale saare VLANs ke SVIs bhi band kar deta hai, isliye woh unke liye gateway ka kaam band kar deta hai. Agar aapko secondary par koi SVI up rakhna hai (jaise routing adjacency ya management ke liye), to use vPC domain ke neeche <code>dual-active exclude interface-vlan 99</code> se exclude karo.</p>

<h3>Orphan ports: kamzor kadi</h3>
<p>SRV2 VLAN 10 mein NX2 Ethernet1/5 par latka hai. Peer-link failure ke dauraan uska port up rehta hai, par NX2 ka VLAN 10 SVI down hai aur NX1 tak jaane ka ek hi raasta peer-link tha. SRV2 apne gateway 10.10.10.1 tak nahi pahunch sakta: woh up hai par akela pad gaya. Lab aapse SRV2 se ping karke yeh saabit karwata hai.</p>
<pre class="out">NX2# show vpc orphan-ports
VLAN            Orphan Ports
-------         -------------------------
<span class="hl">10              Eth1/5</span></pre>
<p>Options: device ko dual-home karo (sabse achha); single-NIC devices ko primary se jodo; ya active/standby NIC team ke liye secondary ke orphan port par <code>vpc orphan-port suspend</code> configure karo. Yeh command secondary se port ko uske vPCs ke saath band karwata hai, isliye server link-down dekhta hai aur primary wale NIC par fail over karta hai.</p>
<pre class="code">interface ethernet1/5
  vpc orphan-port suspend</pre>

<h3>Primary failure aur non-preemption</h3>
<p>NOC drill mein aap NX1 ke saare Ethernet interfaces shut karke uska power jaana simulate karte ho. Ab keepalive aur peer-link dono chup hain, isliye NX2 maan leta hai ki NX1 mar gaya aur kaam sambhal leta hai:</p>
<pre class="out">NX2# show vpc role
<span class="hl">vPC role                        : secondary, operational primary</span></pre>
<p>vPC 20 NX2 par up rehta hai, SRV1 ka bond ek slave par chalta hai, aur HSRP hold time (default 10 second) ke baad NX2 10.10.10.1 ke liye HSRP Active ban jaata hai. Jab NX1 wapas aata hai to woh role wapas <b>nahi</b> leta; woh <code>primary, operational secondary</code> dikhata hai. Operationally yeh theek hai; bas agle failure mein kaunsa switch suspend karega yeh predict karte waqt yaad rakho.</p>

<div class="eg"><p><b>Worked example: keepalive alag kyun hona chahiye.</b> Maan lo keepalive peer-link par chalne wale VLAN 99 ke SVI par chal raha tha. NX1 par dono peer-link members wala line card fail hota hai. Peer-link down hota hai aur uske saath keepalive bhi. NX2 ko dono mein se kuch nahi dikhta, woh maan leta hai NX1 mar gaya aur operational primary ban jaata hai. Par NX1 zinda hai aur ab bhi primary hai. Dono vPC 20 par forward karte hain, dono HSRP Active hain, aur ARP aur MAC tables alag ho jaati hain. Yeh dual-active hai, ek hi failure se. mgmt0 par keepalive hota to wahi failure bas NX2 ke vPCs ko saaf tarike se suspend kar deta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki "peer-link fail hone par primary suspend karta hai" (secondary karta hai); design mein orphan ports bhool jaana; aur keepalive ko peer-link ke upar ya peer-link wale same line card se chalana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sirf keepalive failure ka traffic par koi asar nahi. Keepalive up ke saath peer-link failure secondary ke vPCs aur vPC-VLAN SVIs suspend karta hai. Dono switches zinda rehte dono ka fail hona dual-active hai.</p></div>

<div class="scn"><h4>Backup appliance jo gayab ho gaya</h4><p>Kharab optic se hue peer-link outage ke dauraan saare dual-homed servers chalte rahe, par secondary leaf par ek single-NIC backup appliance ka gateway chala gaya aur ek raat ke backups chhoot gaye. Secondary par <code>show vpc orphan-ports</code> ne uska port list kiya. Team ne appliance ko LACP bond wale naye dual-NIC model par shift kiya, aur baaki single-homed devices ke liye unhe primary se jodne ka standard banaya. Unhone peer-link members ko bhi do alag line cards par move kiya.</p><p><b>Seekh:</b> outage aapke liye orphan ports list kare, usse pehle khud list kar lo.</p></div>

<div class="iv"><p class="q">"vPC peer-link fail hota hai par keepalive up hai. Kya hota hai?"</p><p>Strong answer: secondary keepalive se confirm karta hai ki primary zinda hai, aur dual-active se bachne ke liye apne saare vPC member ports aur vPC VLANs ke SVIs suspend kar deta hai; primary saara traffic le jaata hai. Dual-homed devices ek link par chalte rehte hain. Secondary ke orphan ports akele pad jaate hain jab tak aap active/standby teaming ke saath <code>vpc orphan-port suspend</code> use na karo, ya <code>dual-active exclude interface-vlan</code> se specific SVIs exclude na karo. Peer-link wapas aane par consistency checks chalte hain aur secondary delay restore ke baad apne vPCs wapas laata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peer-link se aaye frames kabhi us vPC member port se bahar nahi jaate jiska peer par jodidaar up hai.</li>
<li>Sirf keepalive down: koi asar nahi. Peer-link down, keepalive up: secondary vPCs aur vPC-VLAN SVIs suspend karta hai.</li>
<li>Peer-link failure mein secondary ke orphan ports akele pad jaate hain; dual-homing ya <code>vpc orphan-port suspend</code> use karo.</li>
<li>Primary mara: secondary "secondary, operational primary" banta hai; roles wapas preempt nahi hote.</li>
<li>Dono switches zinda rehte peer-link aur keepalive ka saath fail hona dual-active hai; unhe alag paths par rakho.</li>
</ul></div>
`}};export{e as default};