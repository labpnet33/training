var e={id:`monitoring-and-alerts`,h:{en:`Monitoring and alerts: the Overview page and triage`,hi:`Monitoring aur alerts: Overview page aur triage`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What monitoring is and why a cloud dashboard makes it easier.</li>
<li>How to read the Overview page and the Alerts and events page.</li>
<li>The alert types this track uses and what each one usually means.</li>
<li>How to triage: decide what to look at first when many things are red.</li>
</ul>
<p><b>Prerequisites:</b> the earlier modules (organization and networks, MX, VPN, switching, wireless). You should know the Bharat Retail Co sites (Mumbai HQ hub, Bengaluru and Delhi spokes), the VLANs and the device names. This module has no new configuration; it teaches how to <b>operate</b> what you built.</p>

<h3>The big picture: a hospital monitor</h3>
<p>Think of a hospital ward monitor. Nurses do not stare at every patient all night. The monitor shows each patient's vital signs and sounds an alarm when something leaves the safe range. Network <b>monitoring</b> is the same: the dashboard watches devices and links, and raises an <b>alert</b> when something is wrong. A good engineer reads the alarm, decides how serious it is, and acts in the right order. That decision is called <b>triage</b>.</p>

<h3>The Overview page</h3>
<p>The <b>Overview</b> page is the first screen of a network. It gives a summary: how many devices are online or offline, the state of the WAN uplinks, whether the VPN tunnels are up, and any open alerts. You use it to answer one question in seconds: "Is anything broken, and where?" Select a network at the top (Mumbai HQ, Bengaluru Branch, Delhi Branch) or look at all of them in the organization view.</p>
<pre class="out">Overview  (organization: Bharat Retail Co)
Network            Devices  Uplink          VPN         Alerts
Mumbai HQ          4/4 up   wan1 active     hub         0
Bengaluru Branch   3/4 up   wan1 active     tunnel up   <span class="hl">2</span>
Delhi Branch       4/4 up   wan1 down       <span class="hl">tunnel down</span>   3</pre>

<h3>Alert types and what they suggest</h3>
<table class="cmp"><tr><th>Alert</th><th>Typical meaning</th><th>First look</th></tr>
<tr><td>Device offline</td><td>A switch, AP or MX cannot reach the dashboard</td><td>Power, port, uplink, management VLAN 99</td></tr>
<tr><td>Tunnel down</td><td>AutoVPN between spoke and hub is not up</td><td>Uplink up? VPN mode and subnets? UDP blocked?</td></tr>
<tr><td>Uplink down or failover</td><td>wan1 failed or traffic moved to wan2</td><td>ISP circuit, cable, carrier ticket</td></tr>
<tr><td>DHCP pool exhausted</td><td>No free addresses in a scope</td><td>Pool size, lease time, rogue devices</td></tr>
<tr><td>STP root change</td><td>A different switch became the spanning-tree root</td><td>New switch with a lower priority?</td></tr>
<tr><td>Native VLAN mismatch</td><td>Trunk ends disagree on the untagged VLAN</td><td>Both ends of the uplink trunk</td></tr>
<tr><td>Licence</td><td>Organization licence problem</td><td>Licence state; VPN may stop working</td></tr></table>
<p>Alert names and details in a real product differ; check the vendor documentation. In this simulator alerts are <b>derived</b>: the dashboard works them out from the current state of the network.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Triage order">
<rect x="20" y="15" width="180" height="45" rx="8" fill="#fecaca"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Outage (many users)</text>
<rect x="230" y="15" width="180" height="45" rx="8" fill="#fed7aa"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Degraded (failover)</text>
<rect x="440" y="15" width="180" height="45" rx="8" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 Capacity warning</text>
<line x1="200" y1="37" x2="230" y2="37" stroke="#64748b" stroke-width="2"/><line x1="410" y1="37" x2="440" y2="37" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="90" width="600" height="45" rx="8" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Ask: how many users? which site? did it just start? what changed?</text>
<rect x="20" y="160" width="600" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Fix the cause that hides others first: a down MX or uplink creates many alerts</text><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Devices behind a dead uplink all show offline</text>
</svg><p class="cap">Triage: serious and wide first, root cause before symptoms.</p></div>

<h3>Severity and triage</h3>
<p><b>Severity</b> is how bad the alert is. A simple scale: <b>critical</b> (many users down), <b>warning</b> (service degraded or at risk) and <b>info</b> (something changed). Triage uses three questions: <b>impact</b> (how many users, which site), <b>urgency</b> (getting worse?), and <b>root cause</b> (one fault behind many alerts?). If Delhi shows an uplink alert, a tunnel alert and three devices offline, the uplink is the cause and the others are consequences. Fix the uplink first.</p>

<div class="eg"><p><b>Worked example.</b> At 11:05 the Overview shows Delhi Branch with: uplink down on wan1, tunnel down, SW-DEL offline, AP-DEL offline. Reading the order: wan1 is Delhi's only circuit (ACT-BB, ISP-B, 203.0.113.30). If it is down, the MX cannot reach the dashboard, so devices behind it show offline too. One cause (the circuit), four alerts. The engineer raises a carrier ticket and tells the store manager.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Nothing. Monitoring only reads state. It is safe to look at any time. Changes come later, when you act on what you found, and each change is then recorded in the change log (next chapter).</p></div>
<div class="warn"><p><b>Common mistakes.</b> Treating every alert as equal; chasing symptoms (an offline AP) while the cause (a dead uplink) is ignored; clearing or ignoring alerts without understanding them; not noting the time the alert started.</p></div>
<div class="exam"><p><b>Exam trap.</b> Many devices offline at one site at once usually means one upstream cause (uplink, MX, management VLAN), not many separate failures.</p></div>

<div class="scn"><h4>The wall of red</h4><p>On Monday morning Bengaluru showed seven alerts: SW-BLR offline, AP-BLR offline, tunnel down and more. A junior engineer began checking the AP. The senior engineer read the Overview: the MX had a native VLAN mismatch alert from Sunday night. One misconfigured trunk had taken the switch and the AP offline. Fixing the trunk cleared six of seven alerts.</p><p><b>Lesson:</b> find the root cause that explains the most alerts.</p></div>

<div class="iv"><p class="q">"Your dashboard shows twenty alerts. How do you start?"</p><p>Strong answer: look at the Overview for scope (which sites, how many users), group alerts by site and time, find the earliest and most upstream alert (uplink, MX, management VLAN), check what changed recently, fix the root cause and confirm the other alerts clear.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring reads state; it never changes the network.</li>
<li>The Overview answers "what is broken and where" in seconds.</li>
<li>Know the alert types: device offline, tunnel down, uplink down or failover, DHCP exhausted, STP root change, native VLAN mismatch, licence.</li>
<li>Triage by impact, urgency and root cause.</li>
<li>One upstream fault often creates many alerts.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<ul>
<li>Monitoring kya hai aur cloud dashboard use kyun aasaan banata hai.</li>
<li>Overview page aur Alerts and events page kaise padhte hain.</li>
<li>Is track ke alert types aur har ek ka aam matlab.</li>
<li>Triage kaise karte hain: bahut saari red cheezein hon to pehle kya dekhna hai.</li>
</ul>
<p><b>Prerequisites:</b> pichhle modules (organization aur networks, MX, VPN, switching, wireless). Aapko Bharat Retail Co ke sites (Mumbai HQ hub, Bengaluru aur Delhi spokes), VLANs aur device names pata hone chahiye. Is module mein nayi configuration nahi hai; yeh sikhata hai ki jo banaya use <b>operate</b> kaise karte hain.</p>

<h3>Big picture: hospital ka monitor</h3>
<p>Hospital ward ke monitor ke baare mein socho. Nurses poori raat har patient ko ghoorte nahi. Monitor har patient ke vital signs dikhata hai aur jab kuch safe range se bahar jaata hai to alarm bajata hai. Network <b>monitoring</b> bhi aisi hai: dashboard devices aur links dekhta hai aur kuch galat hone par <b>alert</b> uthata hai. Achha engineer alarm padhta hai, decide karta hai kitna serious hai, aur sahi order mein action leta hai. Is decision ko <b>triage</b> kehte hain.</p>

<h3>Overview page</h3>
<p><b>Overview</b> page network ki pehli screen hai. Yeh summary deta hai: kitne devices online ya offline hain, WAN uplinks ka haal, VPN tunnels up hain ya nahi, aur open alerts. Aap ise seconds mein ek sawal ka jawab dene ke liye use karte ho: "Kuch toota hai, aur kahan?" Upar se network chuno (Mumbai HQ, Bengaluru Branch, Delhi Branch) ya organization view mein sab dekho.</p>
<pre class="out">Overview  (organization: Bharat Retail Co)
Network            Devices  Uplink          VPN         Alerts
Mumbai HQ          4/4 up   wan1 active     hub         0
Bengaluru Branch   3/4 up   wan1 active     tunnel up   <span class="hl">2</span>
Delhi Branch       4/4 up   wan1 down       <span class="hl">tunnel down</span>   3</pre>

<h3>Alert types aur unka matlab</h3>
<table class="cmp"><tr><th>Alert</th><th>Aam matlab</th><th>Pehle kya dekho</th></tr>
<tr><td>Device offline</td><td>Switch, AP ya MX dashboard tak nahi pahunch pa raha</td><td>Power, port, uplink, management VLAN 99</td></tr>
<tr><td>Tunnel down</td><td>Spoke aur hub ke beech AutoVPN up nahi hai</td><td>Uplink up? VPN mode aur subnets? UDP blocked?</td></tr>
<tr><td>Uplink down ya failover</td><td>wan1 fail hua ya traffic wan2 par chala gaya</td><td>ISP circuit, cable, carrier ticket</td></tr>
<tr><td>DHCP pool exhausted</td><td>Scope mein free addresses nahi</td><td>Pool size, lease time, rogue devices</td></tr>
<tr><td>STP root change</td><td>Koi aur switch spanning-tree root ban gaya</td><td>Kam priority wala naya switch?</td></tr>
<tr><td>Native VLAN mismatch</td><td>Trunk ke dono ends untagged VLAN par ek mat nahi</td><td>Uplink trunk ke dono ends</td></tr>
<tr><td>Licence</td><td>Organization licence ki problem</td><td>Licence state; VPN ruk sakta hai</td></tr></table>
<p>Real product mein alert names aur details alag hote hain; vendor documentation check karo. Is simulator mein alerts <b>derived</b> hain: dashboard network ki current state se unhe nikalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Triage order">
<rect x="20" y="15" width="180" height="45" rx="8" fill="#fecaca"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">1 Outage (kai users)</text>
<rect x="230" y="15" width="180" height="45" rx="8" fill="#fed7aa"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">2 Degraded (failover)</text>
<rect x="440" y="15" width="180" height="45" rx="8" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">3 Capacity warning</text>
<line x1="200" y1="37" x2="230" y2="37" stroke="#64748b" stroke-width="2"/><line x1="410" y1="37" x2="440" y2="37" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="90" width="600" height="45" rx="8" fill="#bae6fd"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Pucho: kitne users? kaun sa site? abhi shuru hua? kya badla?</text>
<rect x="20" y="160" width="600" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Woh cause pehle fix karo jo baaki chhupata hai: down MX ya uplink kai alerts banata hai</text><text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Dead uplink ke peeche ke devices sab offline dikhte hain</text>
</svg><p class="cap">Triage: serious aur wide pehle, symptoms se pehle root cause.</p></div>

<h3>Severity aur triage</h3>
<p><b>Severity</b> batati hai alert kitna bura hai. Simple scale: <b>critical</b> (kai users down), <b>warning</b> (service degraded ya risk mein) aur <b>info</b> (kuch badla). Triage teen sawal use karta hai: <b>impact</b> (kitne users, kaun sa site), <b>urgency</b> (halat bigad raha hai?), aur <b>root cause</b> (kai alerts ke peeche ek fault?). Agar Delhi uplink alert, tunnel alert aur teen devices offline dikhata hai, to uplink cause hai aur baaki uske nateeje. Pehle uplink fix karo.</p>

<div class="eg"><p><b>Worked example.</b> 11:05 par Overview Delhi Branch ke liye dikhata hai: wan1 par uplink down, tunnel down, SW-DEL offline, AP-DEL offline. Order padho: wan1 Delhi ka akela circuit hai (ACT-BB, ISP-B, 203.0.113.30). Agar woh down hai to MX dashboard tak nahi pahunch sakta, isliye uske peeche ke devices bhi offline dikhte hain. Ek cause (circuit), chaar alerts. Engineer carrier ticket raise karta hai aur store manager ko batata hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Kuch nahi. Monitoring sirf state padhti hai. Kabhi bhi dekhna safe hai. Changes baad mein aate hain, jab aap jo mila uspar action lete ho, aur har change phir change log mein record hota hai (agla chapter).</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Har alert ko barabar samajhna; symptoms (offline AP) ke peeche bhaagna jabki cause (dead uplink) ignore; alerts ko samjhe bina clear ya ignore karna; alert kab shuru hua yeh note na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek site par ek saath kai devices offline hone ka matlab aam taur par ek upstream cause (uplink, MX, management VLAN) hai, kai alag failures nahi.</p></div>

<div class="scn"><h4>Laal alerts ki deewar</h4><p>Monday subah Bengaluru ne saat alerts dikhaye: SW-BLR offline, AP-BLR offline, tunnel down aur aur. Ek junior engineer AP check karne laga. Senior engineer ne Overview padha: Sunday raat se MX par native VLAN mismatch alert tha. Ek galat trunk ne switch aur AP dono ko offline kar diya tha. Trunk fix karne se saat mein se chhe alerts clear ho gaye.</p><p><b>Seekh:</b> woh root cause dhoondho jo sabse zyada alerts explain kare.</p></div>

<div class="iv"><p class="q">"Aapke dashboard par bees alerts hain. Kahan se shuru karoge?"</p><p>Strong answer: scope ke liye Overview dekho (kaun se sites, kitne users), alerts ko site aur time se group karo, sabse pehla aur sabse upstream alert dhoondho (uplink, MX, management VLAN), dekho haal mein kya badla, root cause fix karo aur confirm karo ki baaki alerts clear hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring state padhti hai; network ko kabhi nahi badalti.</li>
<li>Overview seconds mein batata hai "kya toota hai aur kahan".</li>
<li>Alert types jaano: device offline, tunnel down, uplink down ya failover, DHCP exhausted, STP root change, native VLAN mismatch, licence.</li>
<li>Triage impact, urgency aur root cause se karo.</li>
<li>Ek upstream fault aksar kai alerts banata hai.</li>
</ul></div>
`}};export{e as default};