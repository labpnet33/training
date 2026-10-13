var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What this module gave you</h3>
<p>You started with the happy path and finished with a network that behaves well on bad days. You can place a failed login into a safe role, keep staff working when ClearPass is unreachable, and change a live session with RFC 5176 CoA and Disconnect. You also know where guest self-registration, captive portals, OnGuard posture, profiling and Onboard fit, and you can say honestly which of them the lab simulates. Use this chapter as a last revision before the quiz, the scenarios and the interview questions.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="200" height="90" rx="10" fill="#fed7aa"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">reject-role</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">server said NO</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">GUEST, VLAN 40</text>
<rect x="220" y="10" width="200" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">critical-role</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">server silent / dead</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">CRITICAL, VLAN 10</text>
<rect x="430" y="10" width="200" height="90" rx="10" fill="#ddd6fe"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="14">CoA / Disconnect</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">live session changes</text><text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">QUARANTINE, VLAN 50</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Concepts only: guest portal, OnGuard, profiling, Onboard</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Not simulated in the lab</text>
</svg><p class="cap">Three simulated safety nets, four conceptual functions around them.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the difference between auth-role, reject-role and critical-role, and give the trigger for each.</li>
<li>Create a port-access role with a VLAN, attach it as a reject-role, and prove isolation with a failing ping.</li>
<li>Read an Access Tracker alert and name the cause: 215, 216, 217, 9002, 9010.</li>
<li>Prove a dead RADIUS server with <code>show radius-server</code> and configure a critical-role.</li>
<li>Explain why the critical-role is fail-open and how to limit its risk.</li>
<li>Explain why policy changes do not affect live sessions, and what CoA does.</li>
<li>Configure both sides of CoA and send a Disconnect from the Access Tracker.</li>
<li>Read a CoA failure message and name the missing piece.</li>
<li>Describe the guest portal flow, the posture tokens, profiling and Onboard without claiming the lab simulates them.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Reject-role</dt><dd>Switch fallback role for a client that ClearPass rejected.</dd>
<dt>Critical-role</dt><dd>Switch fallback role applied when no RADIUS server is reachable.</dd>
<dt>Auth-role</dt><dd>Fallback role for an authenticated client with no role or VLAN returned.</dd>
<dt>Port-access role</dt><dd>Local AOS-CX policy object that carries a VLAN; referenced by name.</dd>
<dt>Aruba-User-Role</dt><dd>RADIUS attribute ClearPass returns, naming a role defined on the switch.</dd>
<dt>CoA</dt><dd>Change of Authorization: a server request that changes or reauthenticates a live session.</dd>
<dt>Disconnect-Request</dt><dd>RFC 5176 message that terminates a session; the client must authenticate again.</dd>
<dt>Dynamic authorization</dt><dd>The AOS-CX feature that listens for CoA and Disconnect from listed clients.</dd>
<dt>Access Tracker</dt><dd>ClearPass live record of every request with Summary, Input, Output and Alerts.</dd>
<dt>Posture token</dt><dd>OnGuard result value such as HEALTHY (0), QUARANTINE (20) or UNKNOWN (100).</dd>
<dt>Profiling</dt><dd>Guessing a device category from DHCP, HTTP and other clues.</dd>
<dt>Onboard</dt><dd>ClearPass function that enrols a device with a certificate and network settings.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Where reject-role and critical-role are set</td><td>On the switch, per port; ClearPass does not know them.</td></tr>
<tr><td>Reject versus silence</td><td>Reject uses the reject-role; no answer uses the critical-role.</td></tr>
<tr><td>CoA and Disconnect port</td><td>UDP 3799, from ClearPass to the NAD.</td></tr>
<tr><td>CoA needs</td><td>dyn-authorization enable plus client with secret on the switch; CoA enabled on the network device.</td></tr>
<tr><td>Why a policy change is not enough</td><td>Policy is evaluated only at authentication.</td></tr>
<tr><td>Alerts</td><td>215 password, 216 unknown, 217 disabled, 9002 no service, 9010 no rule.</td></tr>
<tr><td>Posture default</td><td>UNKNOWN (100), not healthy.</td></tr>
<tr><td>Role names</td><td>Compared exactly, case-sensitive.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Switch (AOS-CX style)</span>
port-access role GUEST
  vlan access 40
interface 1/1/4
  aaa authentication port-access reject-role GUEST
port-access role CRITICAL
  vlan access 10
interface 1/1/3
  aaa authentication port-access critical-role CRITICAL
radius dyn-authorization enable
radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1
show port-access clients detail
show port-access role GUEST
show radius-server
show radius dyn-authorization

<span class="c">! Lab shell: ClearPass</span>
configuration network device ACCESS coa 3799
configuration enforcement policy EPOL-WIRED rule remove 1
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-QUARANTINE
monitoring access-tracker detail bob alerts
monitoring access-tracker disconnect 00:50:2f:e9:9a:01
monitoring event-viewer</pre>

<div class="warn"><p><b>Common mistake.</b> Memorising the commands without the reasons. Interviewers and exam questions ask why a safety net is chosen, what it risks and how you would prove it works. Practise stating the evidence you would show.</p></div>

<div class="exam"><p><b>Exam trap.</b> Words like "guest", "quarantine" and "critical" are role names that you chose. The mechanism that applies them is what the exam tests: a reject, a dead server or a CoA. Always identify the trigger first.</p></div>

<div class="scn"><h4>The pre-go-live review</h4><p>Before a new building opened, a lead engineer reviewed the access design with one question per safety net. What happens when someone types a wrong password? A reject-role to an isolated guest VLAN, tested with a failing ping to the servers. What happens if both ClearPass nodes are down? A critical-role for employees only, with an alarm. What happens when security blocks a device? Dynamic authorization is enabled and the result message is checked after every test. The building opened with no access tickets on day one.</p><p><b>Lesson:</b> a design is finished when each failure has a defined, tested outcome.</p></div>

<div class="iv"><p class="q">"Summarise how you would make an 802.1X deployment resilient."</p><p>Strong answer: handle three failures. A rejected login lands in an isolated reject-role. An unreachable RADIUS server uses a critical-role, with risk limited and an alarm raised. A live session that must change is handled by CoA with dynamic authorization on both sides. Add monitoring of the Access Tracker, and testing of every path with evidence. Mention that guest portals, posture and onboarding build on the same roles and CoA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reject, critical and CoA cover login failure, server failure and live change.</li>
<li>All three finish as a role on the switch, applied for different triggers.</li>
<li>Prove every safety net with evidence from both the switch and ClearPass.</li>
<li>Guest portal, OnGuard, profiling and Onboard are concepts here and are not simulated.</li>
<li>Next modules build on this with deployment details and operations.</li>
</ul></div>
`,hi:`
<h3>Is module ne aapko kya diya</h3>
<p>Aapne happy path se shuru kiya aur aisa network banana seekha jo kharab dinon mein bhi achha behave kare. Aap failed login ko safe role mein daal sakte ho, ClearPass unreachable ho tab bhi staff ko kaam par rakh sakte ho, aur RFC 5176 CoA aur Disconnect se live session badal sakte ho. Aap yeh bhi jaante ho ki guest self-registration, captive portals, OnGuard posture, profiling aur Onboard kahan fit hote hain, aur honestly bata sakte ho ki lab inme se kya simulate karta hai. Quiz, scenarios aur interview questions se pehle is chapter ko last revision ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary map">
<rect x="10" y="10" width="200" height="90" rx="10" fill="#fed7aa"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">reject-role</text><text x="110" y="58" text-anchor="middle" class="svg-muted" font-size="12">server ne NO bola</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">GUEST, VLAN 40</text>
<rect x="220" y="10" width="200" height="90" rx="10" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">critical-role</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">server chup / dead</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">CRITICAL, VLAN 10</text>
<rect x="430" y="10" width="200" height="90" rx="10" fill="#ddd6fe"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="14">CoA / Disconnect</text><text x="530" y="58" text-anchor="middle" class="svg-muted" font-size="12">live session badalta hai</text><text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">QUARANTINE, VLAN 50</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Sirf concepts: guest portal, OnGuard, profiling, Onboard</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Lab mein simulated nahi</text>
</svg><p class="cap">Teen simulated safety nets, unke aas-paas chaar conceptual functions.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Auth-role, reject-role aur critical-role ka difference samjhao, aur har ek ka trigger batao.</li>
<li>VLAN ke saath port-access role banao, use reject-role ki tarah attach karo, aur failing ping se isolation prove karo.</li>
<li>Access Tracker alert padho aur cause batao: 215, 216, 217, 9002, 9010.</li>
<li><code>show radius-server</code> se dead RADIUS server prove karo aur critical-role configure karo.</li>
<li>Samjhao ki critical-role fail-open kyun hai aur uska risk kaise limit karte hain.</li>
<li>Samjhao ki policy changes live sessions ko kyun affect nahi karte, aur CoA kya karta hai.</li>
<li>CoA ki dono sides configure karo aur Access Tracker se Disconnect bhejo.</li>
<li>CoA failure message padho aur missing piece ka naam batao.</li>
<li>Guest portal flow, posture tokens, profiling aur Onboard describe karo bina yeh claim kiye ki lab unhe simulate karta hai.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Reject-role</dt><dd>Us client ke liye switch fallback role jise ClearPass ne reject kiya.</dd>
<dt>Critical-role</dt><dd>Switch fallback role jo tab apply hota hai jab koi RADIUS server reachable na ho.</dd>
<dt>Auth-role</dt><dd>Authenticated client ke liye fallback role jisme koi role ya VLAN return nahi hua.</dd>
<dt>Port-access role</dt><dd>Local AOS-CX policy object jo VLAN carry karta hai; naam se refer hota hai.</dd>
<dt>Aruba-User-Role</dt><dd>RADIUS attribute jo ClearPass return karta hai, switch par defined role ka naam batata hai.</dd>
<dt>CoA</dt><dd>Change of Authorization: server ki request jo live session ko badalti ya reauthenticate karti hai.</dd>
<dt>Disconnect-Request</dt><dd>RFC 5176 message jo session terminate karta hai; client ko dobara authenticate karna padta hai.</dd>
<dt>Dynamic authorization</dt><dd>AOS-CX feature jo listed clients se CoA aur Disconnect sunta hai.</dd>
<dt>Access Tracker</dt><dd>ClearPass ka live record har request ka, Summary, Input, Output aur Alerts ke saath.</dd>
<dt>Posture token</dt><dd>OnGuard result value jaise HEALTHY (0), QUARANTINE (20) ya UNKNOWN (100).</dd>
<dt>Profiling</dt><dd>DHCP, HTTP aur doosre clues se device category ka andaza lagana.</dd>
<dt>Onboard</dt><dd>ClearPass function jo device ko certificate aur network settings ke saath enrol karta hai.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Reject-role aur critical-role kahan set hote hain</td><td>Switch par, per port; ClearPass unhe nahi jaanta.</td></tr>
<tr><td>Reject versus silence</td><td>Reject reject-role use karta hai; jawab nahi to critical-role.</td></tr>
<tr><td>CoA aur Disconnect port</td><td>UDP 3799, ClearPass se NAD ko.</td></tr>
<tr><td>CoA ko kya chahiye</td><td>Switch par dyn-authorization enable plus secret ke saath client; network device par CoA enabled.</td></tr>
<tr><td>Policy change kaafi kyun nahi</td><td>Policy sirf authentication par evaluate hoti hai.</td></tr>
<tr><td>Alerts</td><td>215 password, 216 unknown, 217 disabled, 9002 no service, 9010 no rule.</td></tr>
<tr><td>Posture default</td><td>UNKNOWN (100), healthy nahi.</td></tr>
<tr><td>Role names</td><td>Exactly compare hote hain, case-sensitive.</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Switch (AOS-CX style)</span>
port-access role GUEST
  vlan access 40
interface 1/1/4
  aaa authentication port-access reject-role GUEST
port-access role CRITICAL
  vlan access 10
interface 1/1/3
  aaa authentication port-access critical-role CRITICAL
radius dyn-authorization enable
radius dyn-authorization client 10.20.60.10 secret-key plaintext ArubaNK1
show port-access clients detail
show port-access role GUEST
show radius-server
show radius dyn-authorization

<span class="c">! Lab shell: ClearPass</span>
configuration network device ACCESS coa 3799
configuration enforcement policy EPOL-WIRED rule remove 1
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-QUARANTINE
monitoring access-tracker detail bob alerts
monitoring access-tracker disconnect 00:50:2f:e9:9a:01
monitoring event-viewer</pre>

<div class="warn"><p><b>Common mistake.</b> Commands ratna lekin reasons nahi. Interviewers aur exam questions poochte hain ki safety net kyun choose kiya, uska risk kya hai aur kaise prove karoge ki kaam karta hai. Yeh practise karo ki aap kaun sa evidence dikhaoge.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Guest", "quarantine" aur "critical" jaise words aapke chune hue role names hain. Exam jo test karta hai woh mechanism hai jo unhe apply karta hai: reject, dead server ya CoA. Hamesha pehle trigger pehchano.</p></div>

<div class="scn"><h4>Go-live se pehle ka review</h4><p>Naya building khulne se pehle lead engineer ne har safety net ke liye ek sawaal se access design review kiya. Koi galat password type kare to kya hota hai? Isolated guest VLAN mein reject-role, servers ko failing ping se tested. Dono ClearPass nodes down hon to? Sirf employees ke liye critical-role, alarm ke saath. Security kisi device ko block kare to? Dynamic authorization enabled hai aur har test ke baad result message check hota hai. Building day one par bina access tickets ke khuli.</p><p><b>Seekh:</b> design tab poora hota hai jab har failure ka defined, tested outcome ho.</p></div>

<div class="iv"><p class="q">"802.1X deployment ko resilient kaise banaoge, summary do."</p><p>Strong answer: teen failures handle karo. Rejected login isolated reject-role mein land hota hai. Unreachable RADIUS server critical-role use karta hai, risk limited aur alarm ke saath. Live session jo badalna hai woh CoA se handle hota hai, dono sides par dynamic authorization ke saath. Access Tracker ki monitoring jodo, aur har path ko evidence ke saath test karo. Batao ki guest portals, posture aur onboarding same roles aur CoA par bante hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Reject, critical aur CoA login failure, server failure aur live change cover karte hain.</li>
<li>Teeno switch par role ke roop mein khatam hote hain, alag triggers ke liye apply hote hain.</li>
<li>Har safety net ko switch aur ClearPass dono ke evidence se prove karo.</li>
<li>Guest portal, OnGuard, profiling aur Onboard yahan concepts hain aur simulated nahi.</li>
<li>Agle modules deployment details aur operations ke saath isi par build karte hain.</li>
</ul></div>
`}};export{e as default};