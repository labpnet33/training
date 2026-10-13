var e={id:`overlay-advpn`,h:{en:`Rung 7a: overlay IPsec and ADVPN shortcut problems`,hi:`Rung 7a: overlay IPsec aur ADVPN shortcut problems`},body:{en:`
<p>When the member view, health check and rules are fine but the hub path is dead or spoke-to-spoke traffic always detours through the hub, the fault is in the <b>overlay</b>. The overlay is built in <b>fsd-ipsec</b> and its shortcuts in <b>fsd-advpn</b>; here we diagnose them. The rule of this chapter: go from the cheap view to the loud one, and always know which side you are looking at (initiator or responder, spoke or hub).</p>
<h3>Step 1: is the tunnel up at all</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn ike gateway list name HUB1-ISP1
BR1-FGT # diagnose vpn tunnel list name HUB1-ISP1
BR1-FGT # get vpn ipsec tunnel summary</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # diagnose vpn ike gateway list name HUB1-ISP1
vd: root/0
name: HUB1-ISP1
version: 2
interface: port1 4
addr: 203.0.113.2:500 -&gt; 192.0.2.10:500
network-id: 1
IKE SA: created 1/1  established 1/1  time 10/10/10 ms
IPsec SA: created 1/1  established 1/1  time 0/0/0 ms
  status: <span class="hl">established</span> 5120-5120s ago = 10ms</pre>
<p>The IKE gateway view answers phase 1: the two addresses, the IKE version, the <b>network-id</b>, and whether the IKE SA and IPsec SA are established. The tunnel view answers phase 2 and traffic: whether encrypted packets are going in and out.</p>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # diagnose vpn tunnel list name HUB1-ISP1
name=HUB1-ISP1 ver=2 serial=1 203.0.113.2:0-&gt;192.0.2.10:0 dst_mtu=1500
proxyid_num=1 child_num=0 refcnt=5
stat: rxp=1423 txp=1390 rxb=181440 txb=176300
dpd: mode=on-idle on=1 idle=20000ms retry=3 count=0 seqno=0
proxyid=HUB1-ISP1 proto=0 sa=1 ref=2 serial=1
  src: 0:0.0.0.0-255.255.255.255:0
  dst: 0:0.0.0.0-255.255.255.255:0</pre>
<p>The lines to check are <code>sa=1</code> (a phase 2 SA exists) and the counters <code>rxp</code> and <code>txp</code>. <b>txp rising and rxp flat</b> means we send but nothing comes back (remote policy, route, or a block in the path). Both flat means no traffic is being routed into the tunnel (rungs 3 and 4).</p>
<h3>Step 2: why the tunnel does not come up</h3>
<p>Only now use the IKE debug, and with a filter, otherwise the output of a busy hub is unreadable.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn ike log filter clear
BR1-FGT # diagnose vpn ike log filter dst-addr4 192.0.2.10
BR1-FGT # diagnose debug application ike -1
BR1-FGT # diagnose debug enable
<span class="c">! wait for one negotiation, then stop</span>
BR1-FGT # diagnose debug disable
BR1-FGT # diagnose debug application ike 0
BR1-FGT # diagnose debug reset</pre>
<table class="cmp"><tr><th>What the debug tells you</th><th>Usual cause</th></tr><tr><td>Requests sent, no reply</td><td>Underlay or firewall: UDP 500 or 4500 blocked, NAT, wrong remote-gw, ISP down</td></tr><tr><td>Authentication failed or no matching IKE gateway</td><td>Pre-shared key or certificate mismatch; peer ID or peer type does not match</td></tr><tr><td>No proposal chosen</td><td>Encryption, hash or DH group differ between the two sides</td></tr><tr><td>Phase 2 selector mismatch</td><td>Quick-mode selectors differ; with SD-WAN overlays they are normally 0.0.0.0/0 on both sides</td></tr><tr><td>Tunnel up, then flaps</td><td>DPD failing across a lossy link, key lifetimes, NAT timeouts</td></tr></table>
<p>Remember to look at <b>both ends</b>. The responder (the hub, or the other spoke) often shows the reason that the initiator hides.</p>
<h3>Step 3: ADVPN shortcuts</h3>
<p>A shortcut is a spoke-to-spoke tunnel created on demand. The first packets of a spoke-to-spoke flow travel spoke, hub, spoke. The hub notices, tells the spokes about each other (the <b>shortcut offer</b>), and the two spokes negotiate a direct tunnel between their own underlay addresses. Later packets use the shortcut. Three families of faults exist: the shortcut is never created, it is created but fails, or it exists but the traffic does not use it.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="250" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">auto-discovery-sender</text><rect x="20" y="150" width="140" height="50" rx="10" fill="#bae6fd"/><text x="90" y="172" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="90" y="188" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.0/24</text><rect x="480" y="150" width="140" height="50" rx="10" fill="#bae6fd"/><text x="550" y="172" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="550" y="188" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.0/24</text><line x1="90" y1="150" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="550" y1="150" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><line x1="160" y1="175" x2="480" y2="175" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">shortcut tunnel (on demand)</text><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">1 first packets via hub, 2 hub offers, 3 spokes negotiate, 4 traffic goes direct</text></svg><p class="cap">Spoke-to-spoke traffic starts through the hub, then moves to a direct shortcut.</p></div>
<ul><li><b>Never created.</b> Check the settings: the hub phase 1 has <code>auto-discovery-sender enable</code>, each spoke has <code>auto-discovery-receiver enable</code>, and the <code>network-id</code> is set consistently on the paired phase 1s. Check that the spoke-to-spoke traffic really transits the hub and that the hub policy permits it. Keep the two spokes on a symmetric design: traffic that enters the hub on one overlay and leaves on another may not trigger an offer, so design and check the overlays together (see <b>fsd-advpn</b>).</li><li><b>Created but fails.</b> The IKE negotiation between the spokes is blocked: spoke underlay addresses unreachable from each other, NAT without NAT-T, UDP 500 and 4500 filtered by the ISP or a local firewall, or key and proposal mismatch. Use the IKE debug on <b>both spokes</b> with the filter set to the other spoke's public address.</li><li><b>Exists but unused.</b> The shortcut tunnel is up (it appears in the tunnel list with a name derived from its parent, for example <code>HUB1-ISP1_0</code>), but the route or the rule still prefers the hub. Check the routing table for the remote prefix, check the service view for the rule, and remember the service flag <code>use-shortcut-sla</code>, which decides whether a rule uses shortcut quality when comparing members.</li><li><b>Shortcuts never go away or pile up.</b> Idle shortcuts are normally removed by an idle timeout set on the spoke phase 1 (<code>idle-timeout</code>); check that it is configured as designed.</li></ul>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn tunnel list
BR1-FGT # get router info routing-table details 10.1.2.20
BR1-FGT # diagnose sys sdwan service
BR1-FGT # execute ping-options source 10.1.1.1
BR1-FGT # execute ping 10.1.2.20</pre>
<div class="warn"><p><b>Common mistake.</b> Making one overlay fix on the spoke only. Many ADVPN faults sit on the hub (missing sender flag, policy, route reflection) or on the other spoke. Always compare the two phase 1 settings side by side.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>network-id</b> is not a VPN ID. It identifies the overlay so that tunnels toward the same hub or peer over different underlays are kept apart, and it must be consistent for the overlay to be recognised as the same network. A mismatch breaks shortcut handling even when the tunnel itself is up.</p></div>
<div class="scn"><h4>Pune to Chennai through Mumbai</h4><p>Two branches, BR1-FGT and BR2-FGT, exchanged files through the hub for weeks. The overlay was healthy and the shortcut never appeared. The tunnel list on BR2-FGT showed an IKE gateway with a different network-id than on the hub, so BR2 did not treat the offer as belonging to the same overlay. Aligning the network-id on the phase 1s made the shortcut appear within seconds of the next flow, and the hub traffic dropped.</p><p><b>Lesson:</b> Compare the settings on all three devices when a shortcut never forms.</p></div>
<div class="iv"><p class="q">"An ADVPN shortcut does not form between two spokes. How do you troubleshoot?"</p><p>First I confirm the overlay to the hub works and that the traffic transits the hub. I check sender and receiver settings and network-id on hub and both spokes, the hub policy, and whether the spokes can reach each other's public addresses on UDP 500 and 4500. Then I run IKE debug with a filter on both spokes. Finally I check routing and the SD-WAN rule if the shortcut is up but unused.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Use ike gateway list for phase 1, tunnel list for phase 2 and counters; IKE debug last.</li><li>txp rising with rxp flat means one-way traffic; both flat means nothing is routed in.</li><li>Shortcut faults: never created, created but failed, up but unused.</li><li>Check hub and both spokes; network-id and sender or receiver flags are the classic misses.</li><li>An up shortcut still needs a route and an SD-WAN rule that use it.</li></ul></div>
`,hi:`
<p>Jab member view, health check aur rules theek hain lekin hub path dead hai ya spoke-to-spoke traffic hamesha hub se ghoomta hai, to fault <b>overlay</b> mein hai. Overlay <b>fsd-ipsec</b> mein banta hai aur shortcuts <b>fsd-advpn</b> mein; yahan hum unhe diagnose karte hain. Is chapter ka niyam: sasti view se loud view tak jao, aur hamesha jaano ki aap kaun si side dekh rahe ho (initiator ya responder, spoke ya hub).</p>
<h3>Step 1: tunnel up hai bhi ya nahi</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn ike gateway list name HUB1-ISP1
BR1-FGT # diagnose vpn tunnel list name HUB1-ISP1
BR1-FGT # get vpn ipsec tunnel summary</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # diagnose vpn ike gateway list name HUB1-ISP1
vd: root/0
name: HUB1-ISP1
version: 2
interface: port1 4
addr: 203.0.113.2:500 -&gt; 192.0.2.10:500
network-id: 1
IKE SA: created 1/1  established 1/1  time 10/10/10 ms
IPsec SA: created 1/1  established 1/1  time 0/0/0 ms
  status: <span class="hl">established</span> 5120-5120s ago = 10ms</pre>
<p>IKE gateway view phase 1 ka jawab deta hai: do addresses, IKE version, <b>network-id</b>, aur IKE SA aur IPsec SA established hain ya nahi. Tunnel view phase 2 aur traffic ka jawab deta hai: encrypted packets andar aur bahar ja rahe hain ya nahi.</p>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # diagnose vpn tunnel list name HUB1-ISP1
name=HUB1-ISP1 ver=2 serial=1 203.0.113.2:0-&gt;192.0.2.10:0 dst_mtu=1500
proxyid_num=1 child_num=0 refcnt=5
stat: rxp=1423 txp=1390 rxb=181440 txb=176300
dpd: mode=on-idle on=1 idle=20000ms retry=3 count=0 seqno=0
proxyid=HUB1-ISP1 proto=0 sa=1 ref=2 serial=1
  src: 0:0.0.0.0-255.255.255.255:0
  dst: 0:0.0.0.0-255.255.255.255:0</pre>
<p>Dekhne wali lines hain <code>sa=1</code> (phase 2 SA maujood hai) aur counters <code>rxp</code> aur <code>txp</code>. <b>txp badh raha hai aur rxp flat</b> matlab hum bhej rahe hain par kuch wapas nahi aa raha (remote policy, route, ya path mein block). Dono flat matlab tunnel mein koi traffic route nahi ho raha (rung 3 aur 4).</p>
<h3>Step 2: tunnel up kyun nahi aata</h3>
<p>Ab hi IKE debug use karo, aur filter ke saath, warna busy hub ka output padh nahi sakte.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn ike log filter clear
BR1-FGT # diagnose vpn ike log filter dst-addr4 192.0.2.10
BR1-FGT # diagnose debug application ike -1
BR1-FGT # diagnose debug enable
<span class="c">! ek negotiation ka wait karo, phir stop</span>
BR1-FGT # diagnose debug disable
BR1-FGT # diagnose debug application ike 0
BR1-FGT # diagnose debug reset</pre>
<table class="cmp"><tr><th>Debug kya batata hai</th><th>Aam cause</th></tr><tr><td>Requests gaye, reply nahi</td><td>Underlay ya firewall: UDP 500 ya 4500 blocked, NAT, galat remote-gw, ISP down</td></tr><tr><td>Authentication failed ya no matching IKE gateway</td><td>Pre-shared key ya certificate mismatch; peer ID ya peer type match nahi karta</td></tr><tr><td>No proposal chosen</td><td>Dono sides par encryption, hash ya DH group alag</td></tr><tr><td>Phase 2 selector mismatch</td><td>Quick-mode selectors alag; SD-WAN overlays mein aam taur par dono taraf 0.0.0.0/0 hote hain</td></tr><tr><td>Tunnel up phir flap</td><td>Lossy link par DPD fail, key lifetimes, NAT timeouts</td></tr></table>
<p>Yaad rakho <b>dono ends</b> dekho. Responder (hub, ya doosra spoke) aksar woh wajah dikhata hai jo initiator chhupata hai.</p>
<h3>Step 3: ADVPN shortcuts</h3>
<p>Shortcut ek spoke-to-spoke tunnel hai jo demand par banta hai. Spoke-to-spoke flow ke pehle packets spoke, hub, spoke se jaate hain. Hub notice karta hai, spokes ko ek doosre ke baare mein batata hai (<b>shortcut offer</b>), aur dono spokes apne underlay addresses ke beech direct tunnel negotiate karte hain. Baad ke packets shortcut use karte hain. Faults ke teen families hain: shortcut kabhi banta nahi, banta hai par fail hota hai, ya maujood hai par traffic use nahi karta.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="diagram"><rect x="250" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">HUB1-FGT</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="11">auto-discovery-sender</text><rect x="20" y="150" width="140" height="50" rx="10" fill="#bae6fd"/><text x="90" y="172" text-anchor="middle" class="svg-ink" font-size="13">BR1-FGT</text><text x="90" y="188" text-anchor="middle" class="svg-muted" font-size="11">10.1.1.0/24</text><rect x="480" y="150" width="140" height="50" rx="10" fill="#bae6fd"/><text x="550" y="172" text-anchor="middle" class="svg-ink" font-size="13">BR2-FGT</text><text x="550" y="188" text-anchor="middle" class="svg-muted" font-size="11">10.1.2.0/24</text><line x1="90" y1="150" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="550" y1="150" x2="350" y2="60" stroke="#64748b" stroke-width="2"/><line x1="160" y1="175" x2="480" y2="175" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">shortcut tunnel (demand par)</text><text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">1 pehle packets hub se, 2 hub offer, 3 spokes negotiate, 4 traffic direct</text></svg><p class="cap">Spoke-to-spoke traffic hub se shuru hota hai, phir direct shortcut par chala jaata hai.</p></div>
<ul><li><b>Kabhi nahi banta.</b> Settings check karo: hub phase 1 mein <code>auto-discovery-sender enable</code>, har spoke mein <code>auto-discovery-receiver enable</code>, aur paired phase 1s par <code>network-id</code> consistent. Check karo ki spoke-to-spoke traffic sach mein hub se guzarta hai aur hub policy use permit karti hai. Dono spokes ko symmetric design par rakho: jo traffic hub mein ek overlay par aata hai aur doosre par jaata hai wahan offer trigger nahi ho sakta, isliye overlays ko saath design aur check karo (<b>fsd-advpn</b> dekho).</li><li><b>Banta hai par fail.</b> Spokes ke beech IKE negotiation blocked hai: spoke underlay addresses ek doosre se unreachable, NAT bina NAT-T, UDP 500 aur 4500 ISP ya local firewall se filtered, ya key aur proposal mismatch. <b>Dono spokes</b> par IKE debug chalao, filter doosre spoke ke public address par.</li><li><b>Hai par use nahi hota.</b> Shortcut tunnel up hai (tunnel list mein parent se bane naam ke saath dikhta hai, jaise <code>HUB1-ISP1_0</code>), lekin route ya rule abhi bhi hub ko prefer karta hai. Remote prefix ke liye routing table, rule ke liye service view dekho, aur service flag <code>use-shortcut-sla</code> yaad rakho jo tay karta hai ki members compare karte waqt rule shortcut quality use kare ya nahi.</li><li><b>Shortcuts jaate nahi ya jama hote hain.</b> Idle shortcuts aam taur par spoke phase 1 ke idle timeout (<code>idle-timeout</code>) se hataye jaate hain; check karo ki design ke mutabik configured hai.</li></ul>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # diagnose vpn tunnel list
BR1-FGT # get router info routing-table details 10.1.2.20
BR1-FGT # diagnose sys sdwan service
BR1-FGT # execute ping-options source 10.1.1.1
BR1-FGT # execute ping 10.1.2.20</pre>
<div class="warn"><p><b>Common galti.</b> Ek overlay fix sirf spoke par karna. Bahut se ADVPN faults hub par hote hain (sender flag missing, policy, route reflection) ya doosre spoke par. Hamesha do phase 1 settings side by side compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>network-id</b> VPN ID nahi hai. Yeh overlay ko identify karta hai taaki alag underlays par same hub ya peer ki taraf tunnels alag rahein, aur overlay ko same network pehchanne ke liye consistent hona chahiye. Mismatch tunnel up hone par bhi shortcut handling tod deta hai.</p></div>
<div class="scn"><h4>Pune se Chennai, Mumbai ke through</h4><p>Do branches, BR1-FGT aur BR2-FGT, hafton hub ke through files exchange karte rahe. Overlay healthy tha aur shortcut kabhi nahi aaya. BR2-FGT ki tunnel list mein IKE gateway ka network-id hub se alag tha, isliye BR2 ne offer ko usi overlay ka nahi maana. Phase 1s par network-id align karne se agle flow ke kuch seconds mein shortcut aa gaya, aur hub traffic gir gaya.</p><p><b>Seekh:</b> Jab shortcut kabhi nahi banta to teeno devices par settings compare karo.</p></div>
<div class="iv"><p class="q">"Do spokes ke beech ADVPN shortcut nahi banta. Aap troubleshoot kaise karte ho?"</p><p>Pehle confirm karta hoon ki hub tak overlay chalta hai aur traffic hub se guzarta hai. Hub aur dono spokes par sender, receiver aur network-id settings, hub policy, aur kya spokes ek doosre ke public addresses ko UDP 500 aur 4500 par reach karte hain, check karta hoon. Phir dono spokes par filter ke saath IKE debug chalata hoon. Aakhir mein shortcut up ho par use na ho to routing aur SD-WAN rule check karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Phase 1 ke liye ike gateway list, phase 2 aur counters ke liye tunnel list; IKE debug aakhir mein.</li><li>txp badhna aur rxp flat matlab one-way traffic; dono flat matlab kuch route nahi ho raha.</li><li>Shortcut faults: kabhi nahi bana, bana par fail, up par unused.</li><li>Hub aur dono spokes check karo; network-id aur sender ya receiver flags classic misses hain.</li><li>Up shortcut ko bhi use karne wala route aur SD-WAN rule chahiye.</li></ul></div>
`}};export{e as default};