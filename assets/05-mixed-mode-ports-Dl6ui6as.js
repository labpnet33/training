var e={id:`mixed-mode-ports`,h:{en:`Mixed-mode ports: 802.1X first, MAC authentication as fallback`,hi:`Mixed-mode ports: pehle 802.1X, fallback mein MAC authentication`},body:{en:`
<p>Picture an office door with two ways in. Staff swipe a badge at the reader (that is 802.1X: the person proves who they are). Some visitors carry no badge at all, so the receptionist checks a printed list of approved visitor names (that is MAC authentication: the device is recognised by its hardware address). A good door tries the badge reader first, waits a moment, and if nobody swipes, it checks the list. That is a <b>mixed-mode port</b>.</p>

<h3>Why one port design for everything</h3>
<p>In a real office you cannot know in advance what will be plugged into a wall socket: a laptop with a supplicant today, a printer tomorrow, an IP camera next week. If you configure one port design for laptops and a different one for printers, every move needs a switch change and a ticket. A single design on all access ports (802.1X, then fallback to MAC authentication) lets the <b>policy</b> on ClearPass decide who gets what, and the cabling stays generic.</p>

<h3>How the lab switch decides</h3>
<p>From the lab facts, the switch behaves like this:</p>
<ol>
<li>A method only runs when it is enabled <b>globally</b> (with a server group that exists) <b>and on the port</b>.</li>
<li>802.1X is tried first. The switch sends EAP requests. A laptop with a supplicant answers.</li>
<li>A client without a supplicant never answers. After about <b>10 seconds</b> the switch gives up on 802.1X and falls over to MAC authentication, sending the client MAC address as both user name and password in a RADIUS request.</li>
<li>ClearPass handles that second request in a different service (Wired MAC Auth), looks the MAC up in the Endpoints Repository and answers with a role.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Mixed mode flow">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">Link up on port</text>
<rect x="190" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="275" y="52" text-anchor="middle" class="svg-ink" font-size="13">802.1X (EAP)</text><text x="275" y="69" text-anchor="middle" class="svg-muted" font-size="12">service Wired 802.1X</text>
<rect x="190" y="180" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="275" y="202" text-anchor="middle" class="svg-ink" font-size="13">MAC authentication</text><text x="275" y="219" text-anchor="middle" class="svg-muted" font-size="12">service Wired MAC Auth</text>
<rect x="440" y="30" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1, LAPTOP2</text><text x="530" y="69" text-anchor="middle" class="svg-muted" font-size="12">EMPLOYEE, CONTRACTOR</text>
<rect x="440" y="180" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="202" text-anchor="middle" class="svg-ink" font-size="13">PRN1</text><text x="530" y="219" text-anchor="middle" class="svg-muted" font-size="12">role IOT, VLAN 30</text>
<line x1="140" y1="115" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="275" y1="80" x2="275" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="285" y="135" class="svg-muted" font-size="12">no answer, about 10 s</text>
<line x1="360" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Every device starts with 802.1X. Only silence sends it down the MAC authentication path.</p></div>

<h3>The configuration: one interface range</h3>
<p>Instead of repeating the same lines on three ports, use an interface range. The lab ticket <code>cp-mixed-port</code> asks you to enable both methods on ports 1/1/3 to 1/1/5:</p>
<pre class="code">ACCESS# configure terminal
ACCESS(config)# interface 1/1/3-1/1/5
ACCESS(config-if-range)# aaa authentication port-access dot1x authenticator
ACCESS(config-if-dot1x-auth)# enable
ACCESS(config-if-dot1x-auth)# exit
ACCESS(config-if-range)# aaa authentication port-access mac-auth
ACCESS(config-if-macauth)# enable
ACCESS(config-if-macauth)# exit
ACCESS(config-if-range)# exit</pre>
<p>In the lab shell the same sequence is entered as <code>interface 1/1/3-1/1/5</code>, then <code>aaa authentication port-access dot1x authenticator</code>, <code>exit</code>, <code>aaa authentication port-access mac-auth</code>, <code>exit</code>, <code>exit</code>. The prompts above are representative of AOS-CX; the lab prompts are shorter. Remember that the global sections for dot1x and mac-auth, each with the server group CPPM, must also exist; verify with <code>show aaa authentication port-access</code>.</p>

<h3>The ClearPass side of a printer</h3>
<p>For the MAC path ClearPass needs: the <b>endpoint</b> in the Endpoints Repository (Configuration &gt; Identity &gt; Endpoints; MAC, status Known, attribute Category=Printer), a service of type MAC authentication that uses the role mapping RM-MAC and the policy EPOL-MAC, and an enforcement profile returning the switch role IOT. In the lab those objects exist; the printer MAC is 00:50:67:fb:67:01. The ticket's trap is the endpoint <b>status</b>: it was marked <b>Disabled</b> after a loss report. A disabled endpoint is rejected even if everything else is correct. When the device is recovered, set it to Known:</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Identity &gt; Endpoints &gt; edit the MAC &gt; Status</span>
<span class="c">! Lab shell on CPPM:</span>
monitoring access-tracker detail 00:50:67:fb:67:01 alerts
configuration identity endpoint 00:50:67:fb:67:01 status known</pre>

<h3>Verification</h3>
<pre class="out">ACCESS# show port-access clients
Port    Role          VLAN  Method     Status
1/1/3   EMPLOYEE      10    <span class="hl">dot1x</span>      authorized
1/1/4   CONTRACTOR    20    <span class="hl">dot1x</span>      authorized
1/1/5   IOT           30    <span class="hl">mac-auth</span>   authorized</pre>
<p>Check the <b>Method</b> column. A printer showing dot1x would be wrong (printers have no supplicant), and a laptop showing mac-auth means the laptop supplicant failed and the laptop fell back, which should make you look at its Access Tracker alert. The columns above are representative; use <code>show port-access clients detail</code> for the full status. Finally the printer must get an address: ping APP1 from PRN1 after <code>ip dhcp</code>.</p>

<div class="eg"><p><b>Worked example.</b> A new camera is plugged into 1/1/6. It has no supplicant, so 802.1X times out after about 10 seconds. The switch sends a MAC authentication request with the camera MAC. If the MAC is in the Endpoints Repository as Known with Category=Camera, ClearPass role mapping assigns CAMERA and the policy returns the IOT role: VLAN 30. If the MAC is unknown, the result is alert 216 and the client gets the port reject-role (if one is configured) or no access.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling the method only on the port and not globally (or the reverse). (2) Leaving the printer MAC out of the Endpoints Repository, or in the wrong status. (3) Expecting fallback to be instant: the supplicant timeout makes devices without one wait about 10 seconds. (4) Trusting MAC authentication as strong security. A MAC address can be copied, so treat an IOT role as low trust and keep its VLAN tightly limited.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order matters: 802.1X is attempted first and MAC authentication is the fallback. MAC authentication does not authenticate a user. Only the device identity (MAC) is checked. Also, the MAC request is evaluated by a separate service from the 802.1X one.</p></div>

<div class="scn"><h4>The printer that was marked lost</h4><p>After an office move a printer stopped getting network access. The port design was correct, the switch showed the client as unauthorized, and ClearPass listed a failed MAC authentication. The Access Tracker alert showed the endpoint record carried the Disabled status that Facilities had set when the printer was reported lost. After the printer was found, the endpoint was set back to Known and the next authentication placed it in the IOT role.</p><p><b>Lesson:</b> endpoint status is a policy lever; read the alert before touching the switch.</p></div>

<div class="iv"><p class="q">"How do you handle laptops and printers on the same access port?"</p><p>Strong answer: one port design with both 802.1X and MAC authentication enabled, 802.1X first. Laptops with supplicants authenticate by user; devices without one time out and fall back to MAC authentication against the Endpoints Repository. Separate ClearPass services and role mappings assign roles. I would keep the IOT VLAN restricted, because a MAC address is weak identity, and I would verify with the client list and the Method column.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mixed mode means 802.1X first, MAC authentication after a timeout of about 10 seconds.</li>
<li>Each method must be enabled globally with a server group and on the port; use an interface range for many ports.</li>
<li>MAC authentication needs an endpoint in the Endpoints Repository with a usable status (Known).</li>
<li>A Disabled or unknown endpoint is rejected; read the Access Tracker alert.</li>
<li>Verify the Method column in show port-access clients; treat MAC-based roles as low trust.</li>
</ul></div>
`,hi:`
<p>Ek office ka darwaza socho jisme andar aane ke do raaste hain. Staff reader par badge swipe karta hai (yeh 802.1X hai: insaan prove karta hai ki woh kaun hai). Kuch visitors ke paas koi badge nahi hota, isliye receptionist approved visitor names ki printed list check karta hai (yeh MAC authentication hai: device ko uske hardware address se pehchana jaata hai). Achha darwaza pehle badge reader try karta hai, thodi der intezaar karta hai, aur agar koi swipe na kare, to list check karta hai. Yahi <b>mixed-mode port</b> hai.</p>

<h3>Sab ke liye ek port design kyun</h3>
<p>Real office mein pehle se nahi pata ki wall socket mein kya lagega: aaj supplicant wala laptop, kal printer, agle hafte IP camera. Agar laptops ke liye ek port design aur printers ke liye alag design configure karo, to har move par switch change aur ticket lagta hai. Saare access ports par ek design (802.1X, phir MAC authentication fallback) ClearPass ki <b>policy</b> ko decide karne deta hai ki kisko kya milega, aur cabling generic rehti hai.</p>

<h3>Lab switch kaise decide karta hai</h3>
<p>Lab facts ke hisaab se switch aise behave karta hai:</p>
<ol>
<li>Method tabhi chalta hai jab woh <b>globally</b> (aise server group ke saath jo exist karta ho) <b>aur port par</b> enabled ho.</li>
<li>Pehle 802.1X try hota hai. Switch EAP requests bhejta hai. Supplicant wala laptop jawab deta hai.</li>
<li>Supplicant ke bina client kabhi jawab nahi deta. Lagbhag <b>10 seconds</b> ke baad switch 802.1X chhod deta hai aur MAC authentication par chala jaata hai, aur client MAC address ko user name aur password dono ki tarah RADIUS request mein bhejta hai.</li>
<li>ClearPass us doosri request ko alag service (Wired MAC Auth) mein handle karta hai, MAC ko Endpoints Repository mein dhoondta hai aur role ke saath jawab deta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Mixed mode flow">
<rect x="20" y="100" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">Port par link up</text>
<rect x="190" y="30" width="170" height="50" rx="8" fill="#bae6fd"/><text x="275" y="52" text-anchor="middle" class="svg-ink" font-size="13">802.1X (EAP)</text><text x="275" y="69" text-anchor="middle" class="svg-muted" font-size="12">service Wired 802.1X</text>
<rect x="190" y="180" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="275" y="202" text-anchor="middle" class="svg-ink" font-size="13">MAC authentication</text><text x="275" y="219" text-anchor="middle" class="svg-muted" font-size="12">service Wired MAC Auth</text>
<rect x="440" y="30" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1, LAPTOP2</text><text x="530" y="69" text-anchor="middle" class="svg-muted" font-size="12">EMPLOYEE, CONTRACTOR</text>
<rect x="440" y="180" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="202" text-anchor="middle" class="svg-ink" font-size="13">PRN1</text><text x="530" y="219" text-anchor="middle" class="svg-muted" font-size="12">role IOT, VLAN 30</text>
<line x1="140" y1="115" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="360" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="275" y1="80" x2="275" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="285" y="135" class="svg-muted" font-size="12">jawab nahi, lagbhag 10 s</text>
<line x1="360" y1="205" x2="440" y2="205" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har device 802.1X se shuru karta hai. Sirf khamoshi use MAC authentication path par bhejti hai.</p></div>

<h3>Configuration: ek interface range</h3>
<p>Teen ports par same lines repeat karne ki jagah interface range use karo. Lab ticket <code>cp-mixed-port</code> ports 1/1/3 se 1/1/5 par dono methods enable karne ko kehta hai:</p>
<pre class="code">ACCESS# configure terminal
ACCESS(config)# interface 1/1/3-1/1/5
ACCESS(config-if-range)# aaa authentication port-access dot1x authenticator
ACCESS(config-if-dot1x-auth)# enable
ACCESS(config-if-dot1x-auth)# exit
ACCESS(config-if-range)# aaa authentication port-access mac-auth
ACCESS(config-if-macauth)# enable
ACCESS(config-if-macauth)# exit
ACCESS(config-if-range)# exit</pre>
<p>Lab shell mein wahi sequence <code>interface 1/1/3-1/1/5</code>, phir <code>aaa authentication port-access dot1x authenticator</code>, <code>exit</code>, <code>aaa authentication port-access mac-auth</code>, <code>exit</code>, <code>exit</code> ke roop mein daala jaata hai. Upar ke prompts AOS-CX ke representative hain; lab ke prompts chhote hain. Yaad rakho ki dot1x aur mac-auth ke global sections, dono server group CPPM ke saath, bhi exist karne chahiye; <code>show aaa authentication port-access</code> se verify karo.</p>

<h3>Printer ka ClearPass side</h3>
<p>MAC path ke liye ClearPass ko chahiye: Endpoints Repository mein <b>endpoint</b> (Configuration &gt; Identity &gt; Endpoints; MAC, status Known, attribute Category=Printer), MAC authentication type ki service jo role mapping RM-MAC aur policy EPOL-MAC use kare, aur enforcement profile jo switch role IOT return kare. Lab mein yeh objects maujood hain; printer MAC 00:50:67:fb:67:01 hai. Ticket ka trap endpoint ka <b>status</b> hai: loss report ke baad use <b>Disabled</b> mark kiya gaya tha. Disabled endpoint reject hota hai chahe baaki sab sahi ho. Device recover hone par use Known set karo:</p>
<pre class="code"><span class="c">! Real GUI: Configuration &gt; Identity &gt; Endpoints &gt; MAC edit karo &gt; Status</span>
<span class="c">! Lab shell on CPPM:</span>
monitoring access-tracker detail 00:50:67:fb:67:01 alerts
configuration identity endpoint 00:50:67:fb:67:01 status known</pre>

<h3>Verification</h3>
<pre class="out">ACCESS# show port-access clients
Port    Role          VLAN  Method     Status
1/1/3   EMPLOYEE      10    <span class="hl">dot1x</span>      authorized
1/1/4   CONTRACTOR    20    <span class="hl">dot1x</span>      authorized
1/1/5   IOT           30    <span class="hl">mac-auth</span>   authorized</pre>
<p><b>Method</b> column check karo. Printer par dot1x dikhe to galat hai (printers ke paas supplicant nahi hota), aur laptop par mac-auth dikhe to matlab laptop ka supplicant fail hua aur laptop fallback ho gaya, jo aapko uska Access Tracker alert dekhne par majboor kare. Upar ke columns representative hain; poore status ke liye <code>show port-access clients detail</code> use karo. Akhir mein printer ko address milna chahiye: <code>ip dhcp</code> ke baad PRN1 se APP1 ko ping karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek naya camera 1/1/6 mein lagta hai. Uske paas supplicant nahi, isliye 802.1X lagbhag 10 seconds baad timeout hota hai. Switch camera MAC ke saath MAC authentication request bhejta hai. Agar MAC Endpoints Repository mein Known aur Category=Camera ke saath hai, to ClearPass role mapping CAMERA assign karti hai aur policy IOT role return karti hai: VLAN 30. Agar MAC unknown hai, to result alert 216 hai aur client ko port ka reject-role milta hai (agar configure ho) ya koi access nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Method sirf port par enable karna aur global par nahi (ya ulta). (2) Printer MAC ko Endpoints Repository se bahar rakhna, ya galat status mein. (3) Fallback ke turant hone ki ummeed: supplicant timeout ki wajah se bina supplicant wale devices lagbhag 10 seconds intezaar karte hain. (4) MAC authentication ko strong security maan lena. MAC address copy ho sakta hai, isliye IOT role ko low trust samjho aur uska VLAN tightly limited rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order matter karta hai: 802.1X pehle try hota hai aur MAC authentication fallback hai. MAC authentication user ko authenticate nahi karta. Sirf device identity (MAC) check hoti hai. Aur MAC request 802.1X wali se alag service mein evaluate hoti hai.</p></div>

<div class="scn"><h4>Printer jo lost mark ho gaya tha</h4><p>Office move ke baad ek printer ka network access band ho gaya. Port design sahi tha, switch ne client ko unauthorized dikhaya, aur ClearPass ne failed MAC authentication list kiya. Access Tracker alert ne dikhaya ki endpoint record par Disabled status tha jo Facilities ne printer ke lost report hone par set kiya tha. Printer milne ke baad endpoint wapas Known kiya gaya aur agli authentication ne use IOT role mein daal diya.</p><p><b>Seekh:</b> endpoint status ek policy lever hai; switch ko haath lagane se pehle alert padho.</p></div>

<div class="iv"><p class="q">"Ek hi access port par laptops aur printers kaise handle karoge?"</p><p>Strong answer: ek port design jisme 802.1X aur MAC authentication dono enabled hon, 802.1X pehle. Supplicant wale laptops user se authenticate karte hain; jinke paas nahi hota woh timeout ke baad Endpoints Repository ke against MAC authentication par fallback karte hain. Alag ClearPass services aur role mappings roles assign karte hain. Main IOT VLAN restricted rakhunga, kyunki MAC address kamzor identity hai, aur client list aur Method column se verify karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mixed mode ka matlab hai pehle 802.1X, lagbhag 10 seconds timeout ke baad MAC authentication.</li>
<li>Har method globally server group ke saath aur port par enable hona chahiye; bahut ports ke liye interface range use karo.</li>
<li>MAC authentication ko Endpoints Repository mein usable status (Known) wala endpoint chahiye.</li>
<li>Disabled ya unknown endpoint reject hota hai; Access Tracker alert padho.</li>
<li>show port-access clients ka Method column verify karo; MAC-based roles ko low trust maano.</li>
</ul></div>
`}};export{e as default};