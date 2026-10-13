var e={id:`uplinks-failover-and-performance`,h:{en:`Uplinks, failover and performance: wan1, wan2 and the tunnel that follows`,hi:`Uplinks, failover aur performance: wan1, wan2 aur tunnel jo follow karta hai`},body:{en:`
<h3>What an uplink is</h3>
<p>An <b>uplink</b> is a connection from the MX to the internet service provider. The MX has up to two internet ports, called <b>wan1</b> and <b>wan2</b>. The <b>Uplinks</b> page lists each one with its circuit label, IP address, gateway and state. At Bharat Retail Co:</p>
<table class="cmp"><tr><th>Site</th><th>wan1</th><th>wan2</th></tr>
<tr><td>Mumbai HQ</td><td>ILL-MUM-01, ISP-A, 198.51.100.10/24</td><td>BB-MUM-02, ISP-B, 203.0.113.10/24</td></tr>
<tr><td>Bengaluru</td><td>BB-BLR-01, ISP-A, 198.51.100.20/24</td><td>none</td></tr>
<tr><td>Delhi</td><td>BB-DEL-01, ISP-B, 203.0.113.30/24</td><td>none</td></tr></table>
<p>ILL means <b>internet leased line</b>: a dedicated circuit with a service promise, usually more expensive and more reliable. BB means <b>broadband</b>: cheaper and shared. The hub, where every site depends on it, has both a leased line and a broadband line from two different ISPs. Using two different providers matters: one ISP outage does not take both circuits down.</p>

<h3>Failover</h3>
<p>The MX treats <b>wan1 as primary</b>. It keeps testing each uplink, for example by checking that the gateway answers and an internet target can be reached. If wan1 is down and wan2 is present and up, the MX <b>fails over</b>: it moves the internet traffic to wan2. When wan1 recovers, the MX normally returns to it (called failback). A site with one uplink has no failover, so if its wan1 is down the site is isolated from the internet and from the VPN.</p>
<pre class="out">Uplinks  (network: Mumbai HQ)
Port  Circuit      ISP    Address            State   Role
wan1  ILL-MUM-01   ISP-A  198.51.100.10/24   <span class="hl">down</span>    primary
wan2  BB-MUM-02    ISP-B  203.0.113.10/24    up      <span class="hl">active</span>

Alerts and events
02:14  alert  Uplink wan1 is down (MX-MUM); traffic failed over to wan2</pre>

<h3>The tunnel follows the active uplink</h3>
<p>This is the key idea linking uplinks and AutoVPN. The tunnel is built from the <b>currently active uplink</b>. When MX-MUM fails over to wan2, its public address for the VPN becomes 203.0.113.10. It re-registers with the dashboard, the spokes learn the new hub address and rebuild their tunnels. There is a short gap, so users may see a brief interruption, then traffic continues over the new path with the same internal subnets.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Failover from wan1 to wan2 and the tunnel following">
<rect x="20" y="80" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text><text x="85" y="128" text-anchor="middle" class="svg-muted" font-size="12">hub</text>
<rect x="260" y="20" width="150" height="50" rx="8" fill="#fecaca"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">wan1 ILL-MUM-01</text><text x="335" y="58" text-anchor="middle" class="svg-muted" font-size="12">down</text>
<rect x="260" y="160" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="182" text-anchor="middle" class="svg-ink" font-size="13">wan2 BB-MUM-02</text><text x="335" y="198" text-anchor="middle" class="svg-muted" font-size="12">up, active</text>
<rect x="500" y="80" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="565" y="128" text-anchor="middle" class="svg-muted" font-size="12">spoke</text>
<line x1="150" y1="100" x2="260" y2="50" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 5"/>
<line x1="150" y1="130" x2="260" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="185" x2="500" y2="135" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<text x="470" y="200" class="svg-accent" font-size="12">tunnel via wan2</text>
</svg><p class="cap">wan1 failed, so the hub uses wan2 and the spoke's tunnel is rebuilt to the new address.</p></div>

<div class="warn"><p><b>Failover trap.</b> Upstream UDP rules are per circuit. If the ISP-B circuit blocks outbound UDP, failover to wan2 will succeed for ordinary web browsing but the tunnels will not form. Always test the backup circuit with the VPN, not just with a web page.</p></div>

<h3>Load balancing, performance and traffic shaping: the concept</h3>
<p>With two live uplinks the MX can do more than wait for a failure. <b>Load balancing</b> spreads different flows across both circuits so that both are used. It increases total capacity but does not make a single download faster. Most designs keep it simple: a primary and a backup.</p>
<p>SD-WAN adds <b>performance policies</b>: the MX measures loss, latency and jitter (the variation in latency) on each path and can prefer the path that meets a target for a type of traffic, such as voice. <b>Traffic shaping</b> limits or prioritises classes of traffic, for example capping streaming and guest Wi-Fi so that point-of-sale traffic always has room. In this course we treat these at concept level; the simulator models failover and the tunnel following the active uplink. Which classes, limits and thresholds exist in a real product comes from the vendor documentation.</p>

<div class="eg"><p><b>Worked example.</b> At 02:14 ILL-MUM-01 is cut by roadworks. MX-MUM fails over to BB-MUM-02 (203.0.113.10). MX-BLR and MX-DEL show a short tunnel flap, then tunnels up to the new hub address. At 06:40 the leased line is repaired and the hub returns to wan1; the tunnels flap again briefly and re-form on 198.51.100.10. During the night Bengaluru staff reached 10.1.20.10 with no configuration change.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> On the Uplinks page you set which port is primary and whether wan2 is used for failover. Changing them changes the path the internet and VPN traffic take; the VPN subnets and the firewall policy do not change.</p></div>
<div class="exam"><p><b>Exam trap.</b> "After failover, which public IP does the hub use for AutoVPN?" The IP of the uplink that is now active. A single-uplink spoke has no failover.</p></div>

<div class="scn"><h4>Roadworks at 02:14</h4><p>A cable cut took ILL-MUM-01 down overnight. The Alerts page showed "uplink wan1 down" and the Uplinks page showed wan2 active. Morning staff in Delhi worked normally. The only trace was two tunnel flaps in the event log. The ISP fixed the cable at noon and the hub returned to wan1.</p><p><b>Lesson:</b> a dual-uplink hub turns an outage into an alert. Review it, then raise a ticket with the ISP.</p></div>

<div class="iv"><p class="q">"Your hub fails over to its backup uplink. What happens to the AutoVPN tunnels?"</p><p>Strong answer: the tunnel follows the active uplink. The hub re-registers with its new public IP, the spokes learn it from the dashboard and rebuild; there is a short interruption. I would also check that outbound UDP is allowed on the backup circuit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wan1 is primary; wan2 takes over when wan1 is down and wan2 is up.</li>
<li>Single-uplink branches have no failover.</li>
<li>The tunnel is built from the active uplink, so failover re-forms it with the new public IP.</li>
<li>Test the backup circuit with the VPN, not only with web browsing.</li>
<li>Load balancing, performance policies and traffic shaping are concept-level here; limits come from the vendor documentation.</li>
</ul></div>
`,hi:`
<h3>Uplink kya hai</h3>
<p><b>Uplink</b> MX se internet service provider tak ka connection hai. MX ke paas do tak internet ports hote hain, <b>wan1</b> aur <b>wan2</b>. <b>Uplinks</b> page har ek ko uske circuit label, IP address, gateway aur state ke saath dikhata hai. Bharat Retail Co mein:</p>
<table class="cmp"><tr><th>Site</th><th>wan1</th><th>wan2</th></tr>
<tr><td>Mumbai HQ</td><td>ILL-MUM-01, ISP-A, 198.51.100.10/24</td><td>BB-MUM-02, ISP-B, 203.0.113.10/24</td></tr>
<tr><td>Bengaluru</td><td>BB-BLR-01, ISP-A, 198.51.100.20/24</td><td>none</td></tr>
<tr><td>Delhi</td><td>BB-DEL-01, ISP-B, 203.0.113.30/24</td><td>none</td></tr></table>
<p>ILL ka matlab <b>internet leased line</b>: dedicated circuit jisme service promise hota hai, aam taur par mehenga aur zyada reliable. BB ka matlab <b>broadband</b>: sasta aur shared. Hub, jis par har site depend karti hai, uske paas do alag ISPs ki leased line aur broadband dono hain. Do alag providers important hain: ek ISP outage dono circuits ko down nahi karta.</p>

<h3>Failover</h3>
<p>MX <b>wan1 ko primary</b> maanta hai. Woh har uplink ko test karta rehta hai, jaise gateway jawab deta hai aur internet target reachable hai ya nahi. Agar wan1 down hai aur wan2 maujood aur up hai, to MX <b>failover</b> karta hai: internet traffic wan2 par le jaata hai. Jab wan1 recover hota hai, MX aam taur par us par wapas aa jaata hai (failback). Ek uplink wali site par failover nahi hota, to uska wan1 down ho to site internet aur VPN dono se kat jaati hai.</p>
<pre class="out">Uplinks  (network: Mumbai HQ)
Port  Circuit      ISP    Address            State   Role
wan1  ILL-MUM-01   ISP-A  198.51.100.10/24   <span class="hl">down</span>    primary
wan2  BB-MUM-02    ISP-B  203.0.113.10/24    up      <span class="hl">active</span>

Alerts and events
02:14  alert  Uplink wan1 is down (MX-MUM); traffic failed over to wan2</pre>

<h3>Tunnel active uplink ko follow karta hai</h3>
<p>Yeh uplinks aur AutoVPN ko jodne wala key idea hai. Tunnel <b>abhi ke active uplink</b> se banta hai. Jab MX-MUM wan2 par failover karta hai, VPN ke liye uska public address 203.0.113.10 ho jaata hai. Woh dashboard ke saath dobara register karta hai, spokes naya hub address seekhte hain aur tunnels rebuild karte hain. Thoda gap hota hai, to users ko chhota interruption dikh sakta hai, phir wahi internal subnets ke saath traffic naye path par chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="wan1 se wan2 failover aur tunnel ka follow karna">
<rect x="20" y="80" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="108" text-anchor="middle" class="svg-ink" font-size="13">MX-MUM</text><text x="85" y="128" text-anchor="middle" class="svg-muted" font-size="12">hub</text>
<rect x="260" y="20" width="150" height="50" rx="8" fill="#fecaca"/><text x="335" y="42" text-anchor="middle" class="svg-ink" font-size="13">wan1 ILL-MUM-01</text><text x="335" y="58" text-anchor="middle" class="svg-muted" font-size="12">down</text>
<rect x="260" y="160" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="182" text-anchor="middle" class="svg-ink" font-size="13">wan2 BB-MUM-02</text><text x="335" y="198" text-anchor="middle" class="svg-muted" font-size="12">up, active</text>
<rect x="500" y="80" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text><text x="565" y="128" text-anchor="middle" class="svg-muted" font-size="12">spoke</text>
<line x1="150" y1="100" x2="260" y2="50" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 5"/>
<line x1="150" y1="130" x2="260" y2="185" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="185" x2="500" y2="135" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 4"/>
<text x="470" y="200" class="svg-accent" font-size="12">tunnel via wan2</text>
</svg><p class="cap">wan1 fail hua, to hub wan2 use karta hai aur spoke ka tunnel naye address tak rebuild hota hai.</p></div>

<div class="warn"><p><b>Failover trap.</b> Upstream UDP rules har circuit ke alag hote hain. Agar ISP-B circuit outbound UDP block karta hai, to wan2 par failover normal web browsing ke liye chal jaayega lekin tunnels nahi banenge. Backup circuit ko hamesha VPN ke saath test karo, sirf web page se nahi.</p></div>

<h3>Load balancing, performance aur traffic shaping: concept</h3>
<p>Do live uplinks ke saath MX failure ka intezaar karne se zyada kar sakta hai. <b>Load balancing</b> alag alag flows ko dono circuits par failata hai taaki dono use hon. Isse total capacity badhti hai lekin ek single download tez nahi hota. Zyada tar designs simple rakhte hain: primary aur backup.</p>
<p>SD-WAN <b>performance policies</b> add karta hai: MX har path par loss, latency aur jitter (latency ka utar-chadhav) naapta hai aur kisi traffic type, jaise voice, ke liye target poora karne wala path prefer kar sakta hai. <b>Traffic shaping</b> traffic classes ko limit ya prioritise karta hai, jaise streaming aur guest Wi-Fi ko cap karna taaki point-of-sale traffic ke liye hamesha jagah rahe. Is course mein hum inhe concept level par dekhte hain; simulator failover aur tunnel ke active uplink ko follow karne ko model karta hai. Real product mein kaunsi classes, limits aur thresholds hote hain woh vendor documentation se aata hai.</p>

<div class="eg"><p><b>Worked example.</b> 02:14 par roadworks se ILL-MUM-01 kat gaya. MX-MUM BB-MUM-02 (203.0.113.10) par failover karta hai. MX-BLR aur MX-DEL par chhota tunnel flap dikhta hai, phir naye hub address tak tunnels up. 06:40 par leased line repair hui aur hub wan1 par laut aaya; tunnels dobara thoda flap karke 198.51.100.10 par re-form hue. Raat bhar Bengaluru staff bina kisi configuration change ke 10.1.20.10 tak pahunchta raha.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Uplinks page par aap set karte ho ki kaunsa port primary hai aur wan2 failover ke liye use hoga ya nahi. Inhe badalne se internet aur VPN traffic ka path badalta hai; VPN subnets aur firewall policy nahi badalti.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Failover ke baad hub AutoVPN ke liye kaunsa public IP use karta hai?" Us uplink ka IP jo ab active hai. Single-uplink spoke par failover nahi hota.</p></div>

<div class="scn"><h4>02:14 par roadworks</h4><p>Cable cut se raat mein ILL-MUM-01 down ho gaya. Alerts page par "uplink wan1 down" aur Uplinks page par wan2 active dikha. Subah Delhi ka staff normal kaam karta raha. Event log mein sirf do tunnel flaps ka nishaan tha. ISP ne dopahar mein cable thik kiya aur hub wan1 par laut aaya.</p><p><b>Seekh:</b> dual-uplink hub outage ko alert bana deta hai. Use review karo, phir ISP ke saath ticket raise karo.</p></div>

<div class="iv"><p class="q">"Aapka hub backup uplink par failover karta hai. AutoVPN tunnels ka kya hota hai?"</p><p>Strong answer: tunnel active uplink ko follow karta hai. Hub naye public IP ke saath re-register karta hai, spokes use dashboard se seekhte hain aur rebuild karte hain; thoda interruption hota hai. Main yeh bhi check karunga ki backup circuit par outbound UDP allowed hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>wan1 primary hai; wan1 down aur wan2 up ho to wan2 sambhalta hai.</li>
<li>Single-uplink branches par failover nahi hota.</li>
<li>Tunnel active uplink se bana hai, isliye failover naye public IP ke saath use re-form karta hai.</li>
<li>Backup circuit ko VPN ke saath test karo, sirf web browsing se nahi.</li>
<li>Load balancing, performance policies aur traffic shaping yahan concept level par hain; limits vendor documentation se.</li>
</ul></div>
`}};export{e as default};