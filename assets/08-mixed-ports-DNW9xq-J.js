var e={id:`mixed-ports`,h:{en:`One port design: fallback, reject and critical outcomes`,hi:`Ek port design: fallback, reject aur critical outcomes`},body:{en:`
<p>A good building has one standard door for every floor. It opens for staff with a key card, it has a buzzer for deliveries, and it has a rule for what happens when the card system is down. Wired access should be designed the same way: <b>one port template</b> that handles a laptop, a printer, a wrong password and a server outage.</p>

<h3>Four different events, four different outcomes</h3>
<p>A common design mistake is to treat all failures as one. They are not. Each needs a deliberate result:</p>
<table class="cmp"><tr><th>Event</th><th>What the switch sees</th><th>Typical outcome</th></tr>
<tr><td>Device has no supplicant</td><td>802.1X times out, no reply</td><td>Try MAC authentication</td></tr>
<tr><td>Explicit reject</td><td>Access-Reject from ClearPass</td><td>Port reject-role (for example GUEST)</td></tr>
<tr><td>Server outage</td><td>RADIUS server dead, no answers</td><td>Port critical-role</td></tr>
<tr><td>Success</td><td>Access-Accept with attributes</td><td>Role or VLAN from ClearPass</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Port decision tree">
<rect x="240" y="10" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Link up on 1/1/x</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="75" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">Try 802.1X</text>
<line x1="220" y1="95" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><text x="150" y="118" text-anchor="middle" class="svg-muted" font-size="12">no reply</text>
<rect x="30" y="150" width="160" height="40" rx="8" fill="#fde68a"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">mac-auth</text>
<line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><text x="355" y="138" class="svg-muted" font-size="12">answer</text>
<rect x="240" y="150" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">accept: role/VLAN</text>
<line x1="420" y1="95" x2="530" y2="150" stroke="#64748b" stroke-width="2"/><text x="500" y="118" text-anchor="middle" class="svg-muted" font-size="12">reject / dead</text>
<rect x="450" y="150" width="170" height="40" rx="8" fill="#fed7aa"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="12">reject-role or</text><text x="535" y="184" text-anchor="middle" class="svg-ink" font-size="12">critical-role</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Same template on every access port</text>
</svg><p class="cap">One template, four outcomes. Design each on purpose.</p></div>

<h3>The mixed port template (Lab shell and switch)</h3>
<p>Ports 1/1/3 to 1/1/5 carry laptops and a printer, so they get both methods in one range. This is the lab <b>cp-mixed-port</b> pattern.</p>
<pre class="code"><span class="c">! on ACCESS: both methods on three ports with one range</span>
interface 1/1/3-1/1/5
    aaa authentication port-access dot1x authenticator
        enable
        exit
    aaa authentication port-access mac-auth
        enable
        exit
    exit</pre>
<p>If the printer is still rejected, look at the Access Tracker alerts for its MAC. A disabled endpoint is the classic cause (a loss report earlier). Recover it on ClearPass only:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity endpoint 00:50:67:fb:67:01 status known</pre>
<pre class="out">ACCESS# show port-access clients detail
1/1/3  00:50:2f:e9:9a:01  authorized  EMPLOYEE    VLAN 10  <span class="hl">dot1x</span>
1/1/4  00:50:2f:e9:9a:02  authorized  CONTRACTOR  VLAN 20  <span class="hl">dot1x</span>
1/1/5  00:50:67:fb:67:01  authorized  IOT         VLAN 30  <span class="hl">mac-auth</span></pre>
<p>Three devices, three roles, two methods, one template.</p>

<h3>Reject-role and critical-role</h3>
<p>Two interface commands tune what happens when things go wrong:</p>
<pre class="code"><span class="c">! on ACCESS: a failed login lands in GUEST, not a dead port</span>
port-access role GUEST
    vlan access 40
    exit
interface 1/1/4
    aaa authentication port-access reject-role GUEST
    exit
<span class="c">! on ACCESS: keep employees working if ClearPass is unreachable</span>
port-access role CRITICAL
    vlan access 10
    exit
interface 1/1/3
    aaa authentication port-access critical-role CRITICAL
    exit</pre>
<p>A rejected client gets the reject-role; a dead RADIUS server gives the critical-role. In the lab, GUEST is VLAN 40 and R1's ACL GUEST-IN blocks guests from the internal networks, so a user who mistyped a password reaches the internet but not the servers. The critical-role must be used with care: VLAN 10 for CRITICAL means anyone can plug in while ClearPass is down, so many sites give critical a limited VLAN instead. When the server is reachable again, the port reauthenticates (after a bounce in the lab) and the normal RADIUS role returns.</p>
<p>Prove each with the switch evidence, not only with a ping: the role name and VLAN in <code>show port-access clients</code>, and <code>show radius-server</code> reporting the server dead during an outage.</p>

<div class="eg"><p><b>Worked example.</b> Bob mistypes his password. ClearPass logs alert 215 (password mismatch) and returns Access-Reject. Port 1/1/4 has reject-role GUEST, so Bob lands in VLAN 40 with 10.20.40.x and can reach the internet but not APP1. He corrects his password, the supplicant retries after the quiet period (20 s in the lab model), and he moves to CONTRACTOR in VLAN 20. No ticket is needed.</p></div>

<div class="note"><p><b>Looking ahead.</b> Enforcement runs at login, so changing a policy does not move someone already connected. The tool for that is RADIUS Change of Authorization (RFC 5176, UDP port 3799), which needs both the ClearPass network device CoA setting and <code>radius dyn-authorization</code> on the switch. The guest, quarantine and CoA labs belong to later modules; here you only need to know why CoA exists.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling a method on the ports but forgetting that the new server group must be used by both global sections. Another: setting a critical-role that is more generous than the normal role for the most sensitive users. Review the risk, not only the syntax.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Reject" and "no response" are different. A reject (ClearPass answered no) uses the reject-role. A silent server (outage, or dropped because of a secret mismatch) is seen by the switch as a dead server and uses the critical-role. The two cases have different fixes.</p></div>

<div class="scn"><h4>The data-centre link that dropped</h4><p>A fibre between the server room and the floor router failed on a Tuesday. The access switch marked ClearPass dead. Employees on ports with a critical-role stayed online with a reduced VLAN; ports without one went unauthorized and the help desk phones lit up. After the fibre was restored, a bounce of the ports let users return to their proper roles.</p><p><b>Lesson:</b> plan for the outage on every port, and test the recovery path as well as the failure.</p></div>

<div class="iv"><p class="q">"What should happen when RADIUS is down, and what are the trade-offs?"</p><p>Strong answer: choose a critical-role per port group so business-critical users keep working, accepting that access is not authenticated during the outage; keep the critical VLAN limited, alarm on the dead server, and test that ports return to RADIUS-assigned roles when the server is back. Distinguish this from a reject-role for failed logins.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One port template can serve 802.1X laptops and MAC-auth printers with fallback.</li>
<li>No supplicant leads to MAC authentication; a reject leads to the reject-role; a dead server leads to the critical-role.</li>
<li>A disabled endpoint is a common reason a printer is rejected.</li>
<li>Critical roles trade security for continuity; scope them.</li>
<li>Policy changes affect new logins; CoA is for live sessions.</li>
</ul></div>
`,hi:`
<p>Achhi building mein har floor ke liye ek standard darwaaza hota hai. Woh staff ke liye key card se khulta hai, deliveries ke liye buzzer hota hai, aur card system down ho to kya hoga uska rule hota hai. Wired access bhi aise hi design karna chahiye: <b>ek port template</b> jo laptop, printer, galat password aur server outage sab handle kare.</p>

<h3>Chaar alag events, chaar alag outcomes</h3>
<p>Aam design galti hai sab failures ko ek samajhna. Woh ek nahi hain. Har ek ko jaan boojh kar result chahiye:</p>
<table class="cmp"><tr><th>Event</th><th>Switch kya dekhta hai</th><th>Typical outcome</th></tr>
<tr><td>Device mein supplicant nahi</td><td>802.1X timeout, koi reply nahi</td><td>MAC authentication try karo</td></tr>
<tr><td>Explicit reject</td><td>ClearPass se Access-Reject</td><td>Port reject-role (jaise GUEST)</td></tr>
<tr><td>Server outage</td><td>RADIUS server dead, koi answer nahi</td><td>Port critical-role</td></tr>
<tr><td>Success</td><td>Attributes ke saath Access-Accept</td><td>ClearPass se role ya VLAN</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Port decision tree">
<rect x="240" y="10" width="160" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">1/1/x par link up</text>
<line x1="320" y1="50" x2="320" y2="75" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="75" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">802.1X try karo</text>
<line x1="220" y1="95" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><text x="150" y="118" text-anchor="middle" class="svg-muted" font-size="12">reply nahi</text>
<rect x="30" y="150" width="160" height="40" rx="8" fill="#fde68a"/><text x="110" y="175" text-anchor="middle" class="svg-ink" font-size="13">mac-auth</text>
<line x1="320" y1="115" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><text x="355" y="138" class="svg-muted" font-size="12">answer</text>
<rect x="240" y="150" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">accept: role/VLAN</text>
<line x1="420" y1="95" x2="530" y2="150" stroke="#64748b" stroke-width="2"/><text x="500" y="118" text-anchor="middle" class="svg-muted" font-size="12">reject / dead</text>
<rect x="450" y="150" width="170" height="40" rx="8" fill="#fed7aa"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="12">reject-role ya</text><text x="535" y="184" text-anchor="middle" class="svg-ink" font-size="12">critical-role</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Har access port par same template</text>
</svg><p class="cap">Ek template, chaar outcomes. Har ek jaan boojh kar design karo.</p></div>

<h3>Mixed port template (Lab shell aur switch)</h3>
<p>Ports 1/1/3 se 1/1/5 laptops aur ek printer le jaate hain, isliye unhe ek range mein dono methods milte hain. Yeh lab <b>cp-mixed-port</b> ka pattern hai.</p>
<pre class="code"><span class="c">! on ACCESS: both methods on three ports with one range</span>
interface 1/1/3-1/1/5
    aaa authentication port-access dot1x authenticator
        enable
        exit
    aaa authentication port-access mac-auth
        enable
        exit
    exit</pre>
<p>Agar printer phir bhi reject ho raha hai, to uske MAC ke liye Access Tracker alerts dekho. Disabled endpoint classic cause hai (pehle ki loss report). Sirf ClearPass par recover karo:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity endpoint 00:50:67:fb:67:01 status known</pre>
<pre class="out">ACCESS# show port-access clients detail
1/1/3  00:50:2f:e9:9a:01  authorized  EMPLOYEE    VLAN 10  <span class="hl">dot1x</span>
1/1/4  00:50:2f:e9:9a:02  authorized  CONTRACTOR  VLAN 20  <span class="hl">dot1x</span>
1/1/5  00:50:67:fb:67:01  authorized  IOT         VLAN 30  <span class="hl">mac-auth</span></pre>
<p>Teen devices, teen roles, do methods, ek template.</p>

<h3>Reject-role aur critical-role</h3>
<p>Do interface commands tay karte hain ki cheezein bigadne par kya hota hai:</p>
<pre class="code"><span class="c">! on ACCESS: a failed login lands in GUEST, not a dead port</span>
port-access role GUEST
    vlan access 40
    exit
interface 1/1/4
    aaa authentication port-access reject-role GUEST
    exit
<span class="c">! on ACCESS: keep employees working if ClearPass is unreachable</span>
port-access role CRITICAL
    vlan access 10
    exit
interface 1/1/3
    aaa authentication port-access critical-role CRITICAL
    exit</pre>
<p>Rejected client ko reject-role milta hai; dead RADIUS server critical-role deta hai. Lab mein GUEST VLAN 40 hai aur R1 ki ACL GUEST-IN guests ko internal networks se block karti hai, isliye jis user ne password galat type kiya woh internet tak pahunchta hai par servers tak nahi. Critical-role ko dhyaan se use karo: CRITICAL ke liye VLAN 10 ka matlab ClearPass down hone par koi bhi plug in kar sakta hai, isliye kai sites critical ko limited VLAN deti hain. Server wapas reachable hone par port reauthenticate hota hai (lab mein bounce ke baad) aur normal RADIUS role wapas aata hai.</p>
<p>Har ek ko switch evidence se prove karo, sirf ping se nahi: <code>show port-access clients</code> mein role name aur VLAN, aur outage ke dauran <code>show radius-server</code> jo server dead batata hai.</p>

<div class="eg"><p><b>Worked example.</b> Bob ne password galat type kiya. ClearPass alert 215 (password mismatch) log karta hai aur Access-Reject bhejta hai. Port 1/1/4 par reject-role GUEST hai, to Bob VLAN 40 mein 10.20.40.x ke saath pahunchta hai aur internet tak jaa sakta hai par APP1 tak nahi. Woh password theek karta hai, supplicant quiet period (lab model mein 20 s) ke baad retry karta hai, aur woh VLAN 20 mein CONTRACTOR ban jaata hai. Ticket ki zaroorat nahi.</p></div>

<div class="note"><p><b>Aage ki baat.</b> Enforcement login par chalta hai, isliye policy badalne se pehle se connected bande ko nahi hilta. Uske liye tool RADIUS Change of Authorization (RFC 5176, UDP port 3799) hai, jise ClearPass network device ki CoA setting aur switch par <code>radius dyn-authorization</code> dono chahiye. Guest, quarantine aur CoA labs aage ke modules ke hain; yahan bas yeh samajhna hai ki CoA kyun hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ports par method enable karna par bhoolna ki naye server group ko dono global sections use karein. Doosri: sabse sensitive users ke liye normal role se zyada generous critical-role set karna. Syntax ke saath risk bhi review karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Reject" aur "no response" alag hain. Reject (ClearPass ne no bola) reject-role use karta hai. Khamosh server (outage, ya secret mismatch ki wajah se drop) switch ko dead server dikhta hai aur critical-role use karta hai. Dono cases ke fix alag hain.</p></div>

<div class="scn"><h4>Data-centre link jo gir gaya</h4><p>Server room aur floor router ke beech ka fibre Tuesday ko fail ho gaya. Access switch ne ClearPass ko dead mark kiya. Jin ports par critical-role tha unke employees reduced VLAN ke saath online rahe; jinke paas nahi tha woh unauthorized ho gaye aur help desk ke phone bajne lage. Fibre restore hone ke baad ports bounce karne se users apne proper roles mein wapas aaye.</p><p><b>Seekh:</b> har port par outage ka plan banao, aur failure ke saath recovery path bhi test karo.</p></div>

<div class="iv"><p class="q">"RADIUS down ho to kya hona chahiye, aur trade-offs kya hain?"</p><p>Strong answer: port group ke hisaab se critical-role chuno taaki business-critical users kaam karte rahein, yeh maanke ki outage ke dauran access authenticated nahi hai; critical VLAN limited rakho, dead server par alarm lagao, aur test karo ki server wapas aane par ports RADIUS-assigned roles par lautte hain. Ise failed logins ke reject-role se alag batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek port template fallback ke saath 802.1X laptops aur MAC-auth printers dono ko serve kar sakta hai.</li>
<li>Supplicant nahi to MAC authentication; reject to reject-role; dead server to critical-role.</li>
<li>Disabled endpoint printer ke reject hone ka aam kaaran hai.</li>
<li>Critical roles security ke badle continuity dete hain; unhe scope karo.</li>
<li>Policy changes naye logins ko affect karte hain; live sessions ke liye CoA hai.</li>
</ul></div>
`}};export{e as default};