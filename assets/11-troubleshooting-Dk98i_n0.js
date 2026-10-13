var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: peers, roams, anchors and APs (all six labs walked through)`,hi:`Troubleshooting workflow: peers, roams, anchors aur APs (chhe ke chhe labs walk-through)`},body:{en:`
<h3>One method for every mobility ticket</h3>
<p>Mobility faults look different (a guest cannot join, a call drops in the stairwell, APs vanish) but they follow a short decision path. Always work from the foundation upwards. Fixing an anchor setting is pointless while the peer is Down.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Mobility troubleshooting path">
<rect x="180" y="10" width="280" height="42" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">1. Peer state: show wireless mobility summary</text>
<rect x="180" y="66" width="280" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. If Down: reason, then the five causes</text>
<rect x="180" y="122" width="280" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">3. Client: roam type, role, address</text>
<rect x="180" y="178" width="280" height="42" rx="8" fill="#fde68a"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">4. Anchor: show wireless mobility anchor</text>
<rect x="180" y="234" width="280" height="42" rx="8" fill="#fed7aa"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">5. APs: show ap summary, controller list, logs</text>
<line x1="320" y1="52" x2="320" y2="66" stroke="#64748b"/><line x1="320" y1="108" x2="320" y2="122" stroke="#64748b"/><line x1="320" y1="164" x2="320" y2="178" stroke="#64748b"/><line x1="320" y1="220" x2="320" y2="234" stroke="#64748b"/>
</svg><p class="cap">Foundation first: peers, then clients, then anchors, then APs. Read the log after every step.</p></div>

<table class="cmp"><tr><th>Question</th><th>Command</th><th>What you look for</th></tr>
<tr><td>Is the peer Up?</td><td><code>show wireless mobility summary</code></td><td>Status Up and PMTU filled in</td></tr>
<tr><td>Which path is broken?</td><td><code>show wireless mobility peer</code></td><td>Control and data path states, down reason</td></tr>
<tr><td>Is the path reachable both ways?</td><td><code>ping &lt;peer&gt;</code> on both controllers, <code>show ip route</code> on routers</td><td>Replies in both directions</td></tr>
<tr><td>What kind of roam was it?</td><td><code>show wireless client mac-address &lt;mac&gt; detail</code></td><td>Mobility Role, Roam Type, Move Count</td></tr>
<tr><td>Counters and anchors?</td><td><code>show wireless mobility statistics</code> and <code>... anchor</code></td><td>Hard roams, anchored clients, anchor status</td></tr>
<tr><td>Why was a client refused?</td><td><code>show logging</code></td><td>PEER_DOWN, HARD_ROAM, ANCHOR_FAIL tags</td></tr>
<tr><td>Where are the APs?</td><td><code>show ap summary</code>, <code>show ap name &lt;ap&gt; config general</code></td><td>State, controller list</td></tr>
</table>
<p>Log tags to know: <code>%MOBILITY-6-PEER_UP</code>, <code>%MOBILITY-3-PEER_DOWN</code> (with the reason), <code>%MOBILITY-6-CLIENT_ROAM</code>, <code>%MOBILITY-4-HARD_ROAM</code>, <code>%CLIENT_ORCH_LOG-3-ANCHOR_FAIL</code>. In the web UI use <b>Monitoring &gt; Mobility</b> for peers and anchors and <b>Troubleshooting &gt; Logs</b> for the log.</p>

<h3>Lab 1: wl-mob-group (build it)</h3>
<p>Nothing is broken. Both controllers have no group. Follow chapter 4: same name, each lists the other, prove Up on both. If the status stays Down, go to the next lab.</p>

<h3>Lab 2: wl-mob-peer-down (two causes, one at a time)</h3>
<p>The ticket: the Delhi peer stays Down although ping to 10.20.99.10 works. Start on WLC1 and collect evidence.</p>
<pre class="out">WLC1# show wireless mobility peer
Mobility peer 10.20.99.10 (WLC2)
  Group name configured here  : NK-CAMPUS
  Control path                : Down
  Data path                   : Down
  <span class="hl">Down reason (model hint)    : WLC2 has no member entry for 10.10.99.10 (the peer must be configured on both controllers)</span>

WLC1# show logging | include MOBILITY
%MOBILITY-3-PEER_DOWN: mobility peer 10.20.99.10 (WLC2) is Down: WLC2 has no member entry for 10.10.99.10 (the peer must be configured on both controllers)</pre>
<p>Reachability is fine (the ping worked), so the cause is on WLC2: it is configured one-sided and its group is <code>NK-CAMPUZ</code>. Fix on WLC2, then re-check; the reason changes after the first repair:</p>
<pre class="code"><span class="c">! WLC2</span>
wireless mobility group name NK-CAMPUS
wireless mobility group member ip 10.10.99.10 public-ip 10.10.99.10 group NK-CAMPUS</pre>
<p>Order matters in the simulator's diagnosis (member entry first, then group name), but you can fix both together. Prove both controllers show Status Up. <b>Lesson:</b> compare both ends; a one-sided peer is invisible from the side that is configured correctly.</p>

<h3>Lab 3: wl-mob-wan-down (the return path)</h3>
<p>Group and members are correct on both controllers, yet the peer is Down since the Delhi router changed. Evidence from WLC1:</p>
<pre class="out">WLC1# ping 10.20.99.10
Sending 5, 100-byte ICMP Echos to 10.20.99.10, timeout is 2 seconds:
<span class="hl">.....
Success rate is 0 percent (0/5)</span>

WLC1# show wireless mobility peer
  <span class="hl">Down reason (model hint)    : management address not reachable from WLC1 to 10.20.99.10 (check routes, trunks and the WAN circuit)</span></pre>
<p>Walk the path: WLC1, SW1, R1, ISP, R2, SW2, WLC2. The provider circuit and the routers are up, so look at routing. R1 reaches Delhi via 172.16.0.2, the ISP routes both ways, but <b>R2 has no route to 10.10.0.0/16</b>, so echo replies and tunnel packets die at R2. Fix on R2:</p>
<pre class="code"><span class="c">! R2</span>
ip route 10.10.0.0 255.255.0.0 172.16.1.2</pre>
<p>Ping now succeeds and the peer comes Up. <b>Lesson:</b> a controller peer problem is often a router problem; always test reachability in both directions and read the routing table of each hop.</p>

<h3>Lab 4: wl-mob-roam (prove, then diagnose a hard roam)</h3>
<p>Proof of L2 and L3 roams is in chapter 6. For a ticket "my session dropped in Delhi" the check is: <code>show wireless client mac-address ... detail</code>. A <b>Hard roam</b> in the log means mobility did not apply:</p>
<pre class="out">%MOBILITY-4-HARD_ROAM: client 0050.7966.6801 moved from AP2 (WLC1) to AP3 (WLC2) without mobility: &lt;reason&gt;; the client re-addresses</pre>
<p>Causes: the peer is not Up (go to labs 2 and 3), or the WLAN is missing or different on the new controller (same SSID and security needed). Also remember: if a client already did an L3 roam and the tunnel later drops, it is disconnected and reconnects as a hard roam.</p>

<h3>Lab 5: wl-mob-guest-anchor (two defects)</h3>
<p>GUEST1 near AP3 cannot join. The peer is Up, so move up the path to anchors. Run <code>show wireless mobility anchor</code> on WLC2 (foreign): PP-GUEST points to 10.10.99.11 and the status is Down, "no controller answers". That is defect one: a typo in the anchor address. Repair it with the policy profile shut down:</p>
<pre class="code"><span class="c">! WLC2</span>
wireless profile policy PP-GUEST
 shutdown
 no mobility anchor 10.10.99.11
 mobility anchor 10.10.99.10
 no shutdown
 exit</pre>
<p>Run the show command again: the anchor now fails for a different reason, on the other controller: "policy profile PP-GUEST on WLC1 is not an export anchor (missing mobility anchor)". Check with <code>show wireless profile policy detailed PP-GUEST</code> on WLC1 (Export Anchor: DISABLED). Defect two, fixed on WLC1:</p>
<pre class="code"><span class="c">! WLC1</span>
wireless profile policy PP-GUEST
 shutdown
 mobility anchor
 no shutdown
 exit</pre>
<p>Then <code>wifi connect NK-GUEST</code> on GUEST1: it joins on AP3 (WLC2), is anchored on WLC1, and gets 10.10.50.x. <b>Lesson:</b> a chain with several links shows you only the first broken link. Repair, re-test, repeat.</p>

<h3>Lab 6: wl-mob-ap-failover (an AP that never came back)</h3>
<p>In the build you gave AP1 and AP2 a list on WLC1. The incident version of the ticket: after WLC1 failed, "the Mumbai floor is dark". Check on WLC2 with <code>show ap summary</code>: if AP1 and AP2 are missing, they never found WLC2. On the controller that used to hold them run <code>show ap name AP1 config general</code>: an empty secondary line explains it. The fix is the list (chapter 8). If they are present but no SSID is broadcast, check that WLC2 maps them to a policy tag (staged in this lab). Then confirm the client is served by WLC2 with a Delhi address: that is correct failover behaviour, not a fault.</p>

<h3>The mock incident: Monday 09:00</h3>
<p>Three tickets arrive together: Delhi guests cannot join, Mumbai staff lose sessions when walking to Delhi, and the Mumbai floor is dark because WLC1 lost power. Triage in this order: first <b>AP and controller health</b> (the dark floor is the biggest outage, so check AP lists and the secondary), then <b>peer state</b> (it explains both guests and roaming), then <b>client roam type and anchor checks</b>. Do not touch guest policy profiles while the peer is Down. The real lesson of this order: work on what the other faults depend on.</p>

<div class="eg"><p><b>Worked example.</b> Evidence summary written into a ticket: "Peer 10.20.99.10 Down since 08:42, reason: management address not reachable from WLC1. R2 routing table lacks 10.10.0.0/16 after change CHG-4821. Added static route via 172.16.1.2 at 09:14. Peer Up, L3 roam counter incrementing. Guest anchor then showed policy PP-GUEST not export anchor on WLC1; enabled at 09:25. GUEST1 anchored with 10.10.50.37." Short, ordered, with times and the commands that proved it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the anchor before the peer. Changing policy profiles without shutting them down (the controller refuses). Pinging in one direction only. Concluding "mobility is broken" when the client simply was not roaming. Not reading the log before changing anything.</p></div>

<div class="exam"><p><b>Exam trap.</b> The symptom "guest cannot connect" can be caused by the peer, the foreign anchor entry, the anchor's WLAN, the anchor's policy profile name or export setting, or the anchor VLAN interface. The method is to test them in the order of the anchor checklist; the first failing item is the cause to fix first.</p></div>

<div class="scn"><h4>The change window that fixed three tickets with one line</h4><p>A bank reported guests down, roams breaking and "AP issues" in Delhi after a router replacement. The engineer started with peer state: Down, management address not reachable. The router replacement lost one static route. After the single route was restored, the peer came Up, guests joined through the anchor again, roams returned to L3, and the AP complaints turned out to be clients re-associating while the tunnel flapped.</p><p><b>Lesson:</b> start at the foundation; one broken low layer produces many high-layer symptoms.</p></div>

<div class="iv"><p class="q">"Walk me through how you would troubleshoot a Delhi guest who cannot connect to an anchored SSID."</p><p>Peer state first (summary and down reason, reachability both ways). Then on the foreign controller, the anchor table and status; on the anchor, the WLAN profile matching, the same-named policy profile being enabled and an export anchor, and the guest VLAN interface and DHCP. Read the ANCHOR_FAIL log line, fix one thing at a time and re-test with a real client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work foundation up: peer, client roam, anchor, AP list; read the log after each step.</li>
<li>Five causes of a Down peer; test reachability both ways and compare both ends.</li>
<li>Anchor failures show one broken link at a time; repair and re-test.</li>
<li>A hard roam means mobility did not apply: check the peer and the WLAN.</li>
<li>After AP failover the client may get a new address; that is expected without SSO.</li>
<li>Policy profiles and WLANs must be shut down for edits.</li>
</ul></div>
`,hi:`
<h3>Har mobility ticket ke liye ek method</h3>
<p>Mobility faults alag dikhte hain (guest join nahi kar paata, stairwell mein call drop, APs gayab) lekin woh ek chhote decision path ko follow karte hain. Hamesha buniyad se upar ki taraf kaam karo. Peer Down ho tab anchor setting theek karna bekaar hai.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Mobility troubleshooting path">
<rect x="180" y="10" width="280" height="42" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">1. Peer state: show wireless mobility summary</text>
<rect x="180" y="66" width="280" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">2. Down ho to: reason, phir paanch causes</text>
<rect x="180" y="122" width="280" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">3. Client: roam type, role, address</text>
<rect x="180" y="178" width="280" height="42" rx="8" fill="#fde68a"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">4. Anchor: show wireless mobility anchor</text>
<rect x="180" y="234" width="280" height="42" rx="8" fill="#fed7aa"/><text x="320" y="260" text-anchor="middle" class="svg-ink" font-size="13">5. APs: show ap summary, controller list, logs</text>
<line x1="320" y1="52" x2="320" y2="66" stroke="#64748b"/><line x1="320" y1="108" x2="320" y2="122" stroke="#64748b"/><line x1="320" y1="164" x2="320" y2="178" stroke="#64748b"/><line x1="320" y1="220" x2="320" y2="234" stroke="#64748b"/>
</svg><p class="cap">Pehle buniyad: peers, phir clients, phir anchors, phir APs. Har step ke baad log padho.</p></div>

<table class="cmp"><tr><th>Sawal</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>Kya peer Up hai?</td><td><code>show wireless mobility summary</code></td><td>Status Up aur PMTU bhara hua</td></tr>
<tr><td>Kaun sa path toota hai?</td><td><code>show wireless mobility peer</code></td><td>Control aur data path states, down reason</td></tr>
<tr><td>Kya path dono taraf reachable hai?</td><td>Dono controllers par <code>ping &lt;peer&gt;</code>, routers par <code>show ip route</code></td><td>Dono directions mein replies</td></tr>
<tr><td>Kis type ka roam tha?</td><td><code>show wireless client mac-address &lt;mac&gt; detail</code></td><td>Mobility Role, Roam Type, Move Count</td></tr>
<tr><td>Counters aur anchors?</td><td><code>show wireless mobility statistics</code> aur <code>... anchor</code></td><td>Hard roams, anchored clients, anchor status</td></tr>
<tr><td>Client kyun refuse hua?</td><td><code>show logging</code></td><td>PEER_DOWN, HARD_ROAM, ANCHOR_FAIL tags</td></tr>
<tr><td>APs kahan hain?</td><td><code>show ap summary</code>, <code>show ap name &lt;ap&gt; config general</code></td><td>State, controller list</td></tr>
</table>
<p>Jaanne wale log tags: <code>%MOBILITY-6-PEER_UP</code>, <code>%MOBILITY-3-PEER_DOWN</code> (reason ke saath), <code>%MOBILITY-6-CLIENT_ROAM</code>, <code>%MOBILITY-4-HARD_ROAM</code>, <code>%CLIENT_ORCH_LOG-3-ANCHOR_FAIL</code>. Web UI mein peers aur anchors ke liye <b>Monitoring &gt; Mobility</b> aur log ke liye <b>Troubleshooting &gt; Logs</b> use karo.</p>

<h3>Lab 1: wl-mob-group (banao)</h3>
<p>Kuch toota nahi hai. Dono controllers ke paas group nahi hai. Chapter 4 follow karo: same naam, har ek doosre ko list kare, dono par Up prove karo. Status Down rahe to agle lab par jao.</p>

<h3>Lab 2: wl-mob-peer-down (do causes, ek ek karke)</h3>
<p>Ticket: Delhi peer Down rehta hai jabki 10.20.99.10 ko ping chalta hai. WLC1 se shuru karo aur evidence collect karo.</p>
<pre class="out">WLC1# show wireless mobility peer
Mobility peer 10.20.99.10 (WLC2)
  Group name configured here  : NK-CAMPUS
  Control path                : Down
  Data path                   : Down
  <span class="hl">Down reason (model hint)    : WLC2 has no member entry for 10.10.99.10 (the peer must be configured on both controllers)</span>

WLC1# show logging | include MOBILITY
%MOBILITY-3-PEER_DOWN: mobility peer 10.20.99.10 (WLC2) is Down: WLC2 has no member entry for 10.10.99.10 (the peer must be configured on both controllers)</pre>
<p>Reachability theek hai (ping chala), isliye cause WLC2 par hai: woh one-sided configured hai aur uska group <code>NK-CAMPUZ</code> hai. WLC2 par fix karo, phir dobara check karo; pehli repair ke baad reason badal jaata hai:</p>
<pre class="code"><span class="c">! WLC2</span>
wireless mobility group name NK-CAMPUS
wireless mobility group member ip 10.10.99.10 public-ip 10.10.99.10 group NK-CAMPUS</pre>
<p>Simulator ke diagnosis mein order matter karta hai (pehle member entry, phir group name), lekin aap dono saath fix kar sakte ho. Prove karo ki dono controllers Status Up dikha rahe hain. <b>Lesson:</b> dono ends compare karo; one-sided peer us side se dikhta nahi jo sahi configured hai.</p>

<h3>Lab 3: wl-mob-wan-down (return path)</h3>
<p>Group aur members dono controllers par sahi hain, phir bhi Delhi router badalne ke baad peer Down hai. WLC1 se evidence:</p>
<pre class="out">WLC1# ping 10.20.99.10
Sending 5, 100-byte ICMP Echos to 10.20.99.10, timeout is 2 seconds:
<span class="hl">.....
Success rate is 0 percent (0/5)</span>

WLC1# show wireless mobility peer
  <span class="hl">Down reason (model hint)    : management address not reachable from WLC1 to 10.20.99.10 (check routes, trunks and the WAN circuit)</span></pre>
<p>Path walk karo: WLC1, SW1, R1, ISP, R2, SW2, WLC2. Provider circuit aur routers up hain, to routing dekho. R1 Delhi ko 172.16.0.2 se reach karta hai, ISP dono taraf route karta hai, lekin <b>R2 ke paas 10.10.0.0/16 ka route nahi hai</b>, isliye echo replies aur tunnel packets R2 par mar jaate hain. R2 par fix:</p>
<pre class="code"><span class="c">! R2</span>
ip route 10.10.0.0 255.255.0.0 172.16.1.2</pre>
<p>Ping ab succeed hota hai aur peer Up ho jaata hai. <b>Lesson:</b> controller peer problem aksar router problem hoti hai; hamesha reachability dono directions mein test karo aur har hop ki routing table padho.</p>

<h3>Lab 4: wl-mob-roam (prove karo, phir hard roam diagnose karo)</h3>
<p>L2 aur L3 roams ka proof chapter 6 mein hai. Ticket "Delhi mein mera session drop ho gaya" ke liye check hai: <code>show wireless client mac-address ... detail</code>. Log mein <b>Hard roam</b> ka matlab mobility apply nahi hui:</p>
<pre class="out">%MOBILITY-4-HARD_ROAM: client 0050.7966.6801 moved from AP2 (WLC1) to AP3 (WLC2) without mobility: &lt;reason&gt;; the client re-addresses</pre>
<p>Causes: peer Up nahi hai (labs 2 aur 3 par jao), ya naye controller par WLAN missing ya alag hai (same SSID aur security chahiye). Yeh bhi yaad rakho: agar client L3 roam kar chuka ho aur baad mein tunnel gir jaaye, to woh disconnect hota hai aur hard roam ki tarah reconnect karta hai.</p>

<h3>Lab 5: wl-mob-guest-anchor (do defects)</h3>
<p>AP3 ke paas GUEST1 join nahi kar paata. Peer Up hai, isliye path mein upar anchors par jao. WLC2 (foreign) par <code>show wireless mobility anchor</code> chalao: PP-GUEST 10.10.99.11 ko point karta hai aur status Down hai, "no controller answers". Yeh defect one hai: anchor address mein typo. Policy profile shut karke repair karo:</p>
<pre class="code"><span class="c">! WLC2</span>
wireless profile policy PP-GUEST
 shutdown
 no mobility anchor 10.10.99.11
 mobility anchor 10.10.99.10
 no shutdown
 exit</pre>
<p>Show command dobara chalao: anchor ab doosre controller par alag reason se fail hota hai: "policy profile PP-GUEST on WLC1 is not an export anchor (missing mobility anchor)". WLC1 par <code>show wireless profile policy detailed PP-GUEST</code> se check karo (Export Anchor: DISABLED). Defect two, WLC1 par fix:</p>
<pre class="code"><span class="c">! WLC1</span>
wireless profile policy PP-GUEST
 shutdown
 mobility anchor
 no shutdown
 exit</pre>
<p>Phir GUEST1 par <code>wifi connect NK-GUEST</code>: woh AP3 (WLC2) par join hota hai, WLC1 par anchored hota hai, aur 10.10.50.x paata hai. <b>Lesson:</b> kai kadiyon wali chain aapko sirf pehli toot-ti kadi dikhati hai. Repair karo, re-test karo, repeat.</p>

<h3>Lab 6: wl-mob-ap-failover (AP jo wapas nahi aaya)</h3>
<p>Build mein aapne WLC1 par AP1 aur AP2 ko list di thi. Incident wala ticket: WLC1 fail hone ke baad "Mumbai floor andhera hai". WLC2 par <code>show ap summary</code> check karo: agar AP1 aur AP2 missing hain to unhone WLC2 dhunda hi nahi. Jis controller par woh pehle the wahan <code>show ap name AP1 config general</code> chalao: khaali secondary line isse explain karti hai. Fix list hai (chapter 8). Agar woh present hain lekin koi SSID broadcast nahi ho raha, to check karo ki WLC2 unhe policy tag se map karta hai (is lab mein staged hai). Phir confirm karo ki client ko WLC2 serve karta hai Delhi address ke saath: yeh sahi failover behaviour hai, fault nahi.</p>

<h3>Mock incident: Monday 09:00</h3>
<p>Teen tickets saath aate hain: Delhi guests join nahi kar paate, Mumbai staff Delhi chalte waqt sessions kho dete hain, aur WLC1 ka power gaya isliye Mumbai floor andhera hai. Triage is order mein karo: pehle <b>AP aur controller health</b> (andhera floor sabse bada outage hai, isliye AP lists aur secondary check karo), phir <b>peer state</b> (yeh guests aur roaming dono explain karta hai), phir <b>client roam type aur anchor checks</b>. Peer Down ho tab guest policy profiles ko haath mat lagao. Is order ka asli sabak: us par kaam karo jis par baaki faults depend karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ticket mein likha evidence summary: "Peer 10.20.99.10 Down since 08:42, reason: management address not reachable from WLC1. R2 routing table mein change CHG-4821 ke baad 10.10.0.0/16 missing. 09:14 par 172.16.1.2 ke through static route add kiya. Peer Up, L3 roam counter badh raha hai. Phir guest anchor ne dikhaya ki WLC1 par policy PP-GUEST export anchor nahi hai; 09:25 par enable kiya. GUEST1 10.10.50.37 ke saath anchored." Chhota, ordered, times aur proof karne wale commands ke saath.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Peer se pehle anchor fix karna. Policy profiles ko shut kiye bina badalna (controller refuse karta hai). Sirf ek direction mein ping karna. "Mobility toot gayi" ka nateeja nikalna jabki client roam hi nahi kar raha tha. Kuch badalne se pehle log na padhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Guest connect nahi ho paata" symptom peer, foreign anchor entry, anchor ki WLAN, anchor ke policy profile ka naam ya export setting, ya anchor VLAN interface se ho sakta hai. Method yeh hai ki unhe anchor checklist ke order mein test karo; pehla failing item woh cause hai jo pehle fix karna hai.</p></div>

<div class="scn"><h4>Change window jisne ek line se teen tickets fix kiye</h4><p>Ek bank ne router replacement ke baad Delhi mein guests down, roams toot-te aur "AP issues" report kiye. Engineer ne peer state se shuru kiya: Down, management address not reachable. Router replacement mein ek static route kho gaya tha. Ek route wapas lagane ke baad peer Up aaya, guests anchor se wapas join hone lage, roams L3 par laut aaye, aur AP complaints sirf clients ka re-associate hona nikla jab tunnel flap kar raha tha.</p><p><b>Lesson:</b> buniyad se shuru karo; ek toota hua neeche ka layer kai upar ke symptoms paida karta hai.</p></div>

<div class="iv"><p class="q">"Samjhao Delhi ka guest jo anchored SSID se connect nahi ho paata, use aap kaise troubleshoot karoge."</p><p>Pehle peer state (summary aur down reason, dono taraf reachability). Phir foreign controller par anchor table aur status; anchor par WLAN profile matching, same naam ka policy profile enabled aur export anchor hona, aur guest VLAN interface aur DHCP. ANCHOR_FAIL log line padho, ek ek cheez fix karo aur asli client se re-test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Buniyad se upar kaam karo: peer, client roam, anchor, AP list; har step ke baad log padho.</li>
<li>Down peer ke paanch causes; reachability dono taraf test karo aur dono ends compare karo.</li>
<li>Anchor failures ek ek toot-ti kadi dikhate hain; repair karo aur re-test.</li>
<li>Hard roam ka matlab mobility apply nahi hui: peer aur WLAN check karo.</li>
<li>AP failover ke baad client ko naya address mil sakta hai; SSO ke bina yeh expected hai.</li>
<li>Edits ke liye policy profiles aur WLANs shut honi chahiye.</li>
</ul></div>
`}};export{e as default};