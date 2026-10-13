var e={id:`edge-list-security`,h:{en:`The WAN edge list and control-plane security (DTLS, TLS, ports)`,hi:`WAN edge list aur control-plane security (DTLS, TLS, ports)`},body:{en:`
<p>A certificate proves that a device is genuine. It does not prove that the device is yours. Think of a hotel: a guest may hold a perfectly real passport, but the front desk still checks the booking list. Only people on the list receive a room key. In SD-WAN, the <b>WAN edge list</b> is the booking list. Even a router with a good certificate is refused if its serial number is not authorised in your fabric.</p>

<h3>What the list contains</h3>
<p>The WAN edge list lives on the Manager. Each entry holds the device's <b>chassis number</b> (also called the unique device identifier or UUID) and its <b>certificate serial number</b>, the model, and a validity state. The Manager sends the list to the Validator and the Controllers, so they can check any device that tries to connect. The list is filled in one of three ways: by synchronising with the Plug and Play Connect portal for the Smart Account, by uploading a file of devices, or by adding devices by hand.</p>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>What the device can do</th></tr>
<tr><td>Valid</td><td>Authorised for the production fabric</td><td>Join the Validator, Controllers and Manager</td></tr>
<tr><td>Staging</td><td>Allowed only for staging in a controlled network</td><td>Connect for bootstrap, with limited access, not production</td></tr>
<tr><td>Invalid</td><td>Not allowed</td><td>Refused by controllers</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WAN edge list flow">
<rect x="10" y="20" width="150" height="70" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">Smart Account /</text><text x="85" y="62" text-anchor="middle" class="svg-ink" font-size="12">Plug and Play</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="10">or file upload</text>
<rect x="190" y="20" width="150" height="70" rx="10" fill="#bae6fd"/><text x="265" y="45" text-anchor="middle" class="svg-ink" font-size="12">Manager</text><text x="265" y="62" text-anchor="middle" class="svg-muted" font-size="10">WAN edge list</text><text x="265" y="78" text-anchor="middle" class="svg-muted" font-size="10">set state: Valid</text>
<rect x="370" y="20" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="430" y="45" text-anchor="middle" class="svg-ink" font-size="12">Validator</text><text x="430" y="62" text-anchor="middle" class="svg-muted" font-size="10">gets the list</text>
<rect x="510" y="20" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="12">Controllers</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="10">get the list</text>
<path d="M160 55 L190 55 M340 55 L370 55 M490 55 L510 55" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="110" rx="12" fill="#f1f5f9"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">An edge connects: the Validator checks its certificate and its serial number</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">Serial on the list and Valid: continue. Not on the list or Invalid: connection refused.</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">Controllers and the Manager repeat the same check on their own connections.</text><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="11">The Manager must push the list ("send to controllers") after a change.</text>
</svg><p class="cap">The authorised list is a second check on top of the certificate.</p></div>

<h3>Checking the list on the controllers</h3>
<pre class="out">VBOND# show orchestrator valid-vedges
CHASSIS NUMBER                          SERIAL NUMBER   VALIDITY
C8K-6A1B...-0001                        <span class="hl">A1B2C3D4</span>        <span class="hl">valid</span>
C8K-6A1B...-0002                        A1B2C3D5        valid
VSMART# show control valid-vedges</pre>
<p>If a device is missing from this output, the problem is on the Manager side: it was never added, never set to valid, or the change was not sent to the controllers.</p>

<h3>Onboarding a virtual edge</h3>
<p>A virtual router has no hardware certificate. It is added to the list with a chassis number and a one-time <b>token</b>. The token is typed on the router together with the chassis number, which lets the router obtain a certificate and prove it is the device you added.</p>
<pre class="code"><span class="c">! Reference configuration: activating a virtual edge with the values from the Manager</span>
request platform software sdwan vedge_cloud activate chassis-number C8K-6A1B-0001 token 0123456789abcdef</pre>

<h3>Control-plane security: DTLS and TLS</h3>
<p>Control connections are encrypted. By default they use <b>DTLS</b> (datagram TLS over UDP). You can switch to <b>TLS over TCP</b> if UDP is a problem, for example when a firewall or a provider treats UDP badly. DTLS is the default because it has less overhead and tolerates packet loss better. If two peers are configured for different protocols, TLS is used.</p>
<table class="cmp"><tr><th>Item</th><th>DTLS (default)</th><th>TLS</th></tr>
<tr><td>Transport</td><td>UDP</td><td>TCP</td></tr>
<tr><td>Base port</td><td>12346</td><td>23456 (configurable)</td></tr>
<tr><td>Port hopping</td><td>Yes: a device can use 12346, 12366, 12386, 12406 and 12426 on its tunnel interface</td><td>No hopping</td></tr>
<tr><td>Where to choose</td><td>Normal networks</td><td>Where UDP is blocked or filtered</td></tr></table>
<pre class="code"><span class="c">! Reference configuration: switch the control protocol to TLS on a device</span>
security
 control
  protocol tls</pre>
<p><b>Port hopping</b> means that a device with several TLOCs may use a different port for each tunnel interface, starting at the base 12346 and moving up by 20 (12366, 12386 and so on). It exists so that devices behind one NAT address, using the same private port, do not collide. In the firewall plan, allow the base port and the hopping range that you actually use, towards the controllers.</p>

<h3>Firewall checklist for the control plane</h3>
<ul>
<li>From every edge transport to the Validator, Controllers and Manager: the DTLS or TLS ports in use.</li>
<li>Between the controllers themselves, in both directions.</li>
<li>For on-premises designs, the Manager's HTTPS port for administrators and APIs, kept restricted.</li>
<li>NAT mappings (static) for any controller on a private address behind a public one.</li>
</ul>

<div class="eg"><p><b>Counting hops.</b> An edge has two tunnel interfaces on the same router, one MPLS and one internet. The first uses base port 12346, the second hops to 12366. If the firewall at the data centre allows only 12346, the first connection forms and the second is silently blocked. The edge shows one control connection up and one stuck in connect, and the dashboard looks half healthy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding a device to the list but not setting it to valid; changing the list and forgetting to send it to the controllers; opening only port 12346; choosing TLS on one side and expecting DTLS to work; leaving a device in staging state in production.</p></div>

<div class="exam"><p><b>Exam traps.</b> The list checks the serial number; the certificate checks the identity and the CA. Valid, Staging and Invalid are the three states. DTLS over UDP is the default; if the peers differ, TLS is used. The base DTLS port is 12346 and hopping increases by 20.</p></div>

<div class="scn"><h4>The router that was perfectly genuine</h4><p>A branch router was shipped with a valid certificate but sat in connect state. The control-connection history said the Validator rejected it. The engineer searched the Manager's WAN edge list and found the serial number missing: the purchase order had been placed under a different Smart Account. The device was added to the list, set to valid and sent to the controllers, and it joined at once.</p><p><b>Lesson:</b> a good certificate is necessary but not enough. Check the list.</p></div>

<div class="iv"><p class="q">"A new router has a valid certificate but cannot join. What do you check?"</p><p>Strong answer: first that its serial number is on the WAN edge list and valid, and that the list was sent to the controllers; then the organization name, then reachability to the Validator, then the firewall ports (DTLS 12346 and hop ports), then the time. Use the control-connection history for the error code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The WAN edge list authorises devices by chassis number and serial number.</li>
<li>States are Valid, Staging and Invalid; push changes to the controllers.</li>
<li>Virtual edges onboard with a chassis number and a one-time token.</li>
<li>DTLS over UDP (base port 12346, hopping by 20) is the default; TLS uses TCP.</li>
<li>Plan the firewall for every hop port that your TLOCs will use.</li>
</ul></div>
`,hi:`
<p>Certificate saabit karta hai ki device asli hai. Yeh saabit nahi karta ki device aapka hai. Hotel socho: mehmaan ke paas bilkul asli passport ho sakta hai, phir bhi front desk booking list check karta hai. Sirf list wale logon ko room ki chaabi milti hai. SD-WAN mein <b>WAN edge list</b> booking list hai. Achhe certificate wale router ko bhi refuse kiya jaata hai agar uska serial number aapke fabric mein authorised nahi hai.</p>

<h3>List mein kya hota hai</h3>
<p>WAN edge list Manager par rehti hai. Har entry mein device ka <b>chassis number</b> (jise unique device identifier ya UUID bhi kehte hain) aur uska <b>certificate serial number</b>, model aur ek validity state hoti hai. Manager list Validator aur Controllers ko bhejta hai, taaki woh connect karne wale kisi bhi device ko check kar sakein. List teen tareeke se bharti hai: Smart Account ke liye Plug and Play Connect portal se synchronise karke, devices ki file upload karke, ya haath se devices jodkar.</p>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Device kya kar sakta hai</th></tr>
<tr><td>Valid</td><td>Production fabric ke liye authorised</td><td>Validator, Controllers aur Manager se join</td></tr>
<tr><td>Staging</td><td>Sirf controlled network mein staging ke liye allowed</td><td>Bootstrap ke liye limited access ke saath connect, production nahi</td></tr>
<tr><td>Invalid</td><td>Allowed nahi</td><td>Controllers refuse karte hain</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="WAN edge list flow">
<rect x="10" y="20" width="150" height="70" rx="10" fill="#fde68a"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">Smart Account /</text><text x="85" y="62" text-anchor="middle" class="svg-ink" font-size="12">Plug and Play</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="10">ya file upload</text>
<rect x="190" y="20" width="150" height="70" rx="10" fill="#bae6fd"/><text x="265" y="45" text-anchor="middle" class="svg-ink" font-size="12">Manager</text><text x="265" y="62" text-anchor="middle" class="svg-muted" font-size="10">WAN edge list</text><text x="265" y="78" text-anchor="middle" class="svg-muted" font-size="10">state Valid set karo</text>
<rect x="370" y="20" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="430" y="45" text-anchor="middle" class="svg-ink" font-size="12">Validator</text><text x="430" y="62" text-anchor="middle" class="svg-muted" font-size="10">list milti hai</text>
<rect x="510" y="20" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="12">Controllers</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="10">list milti hai</text>
<path d="M160 55 L190 55 M340 55 L370 55 M490 55 L510 55" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="110" rx="12" fill="#f1f5f9"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Edge connect karta hai: Validator uska certificate aur serial number check karta hai</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">Serial list mein hai aur Valid: aage badho. List mein nahi ya Invalid: connection refuse.</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">Controllers aur Manager apne connections par yahi check dohrate hain.</text><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="11">Badlav ke baad Manager ko list push karni hoti hai ("send to controllers").</text>
</svg><p class="cap">Authorised list certificate ke upar doosra check hai.</p></div>

<h3>Controllers par list check karna</h3>
<pre class="out">VBOND# show orchestrator valid-vedges
CHASSIS NUMBER                          SERIAL NUMBER   VALIDITY
C8K-6A1B...-0001                        <span class="hl">A1B2C3D4</span>        <span class="hl">valid</span>
C8K-6A1B...-0002                        A1B2C3D5        valid
VSMART# show control valid-vedges</pre>
<p>Agar koi device is output mein missing hai, to problem Manager side par hai: use kabhi jodha nahi gaya, valid set nahi hua, ya badlav controllers ko nahi bheja gaya.</p>

<h3>Virtual edge onboard karna</h3>
<p>Virtual router ke paas hardware certificate nahi hota. Use chassis number aur ek one-time <b>token</b> ke saath list mein jodte hain. Token router par chassis number ke saath type kiya jaata hai, jisse router certificate paata hai aur saabit karta hai ki yahi woh device hai jise aapne joda.</p>
<pre class="code"><span class="c">! Reference configuration: activating a virtual edge with the values from the Manager</span>
request platform software sdwan vedge_cloud activate chassis-number C8K-6A1B-0001 token 0123456789abcdef</pre>

<h3>Control-plane security: DTLS aur TLS</h3>
<p>Control connections encrypted hote hain. Default mein woh <b>DTLS</b> (UDP par datagram TLS) use karte hain. UDP problem ho to aap <b>TCP par TLS</b> chun sakte ho, jaise jab firewall ya provider UDP ko kharab treat karta ho. DTLS default hai kyunki overhead kam hai aur packet loss behtar sahta hai. Agar do peers alag protocols ke liye configured hain to TLS use hota hai.</p>
<table class="cmp"><tr><th>Item</th><th>DTLS (default)</th><th>TLS</th></tr>
<tr><td>Transport</td><td>UDP</td><td>TCP</td></tr>
<tr><td>Base port</td><td>12346</td><td>23456 (configurable)</td></tr>
<tr><td>Port hopping</td><td>Haan: device tunnel interface par 12346, 12366, 12386, 12406 aur 12426 use kar sakta hai</td><td>Hopping nahi</td></tr>
<tr><td>Kahan chunein</td><td>Normal networks</td><td>Jahan UDP block ya filtered ho</td></tr></table>
<pre class="code"><span class="c">! Reference configuration: switch the control protocol to TLS on a device</span>
security
 control
  protocol tls</pre>
<p><b>Port hopping</b> ka matlab hai ki kai TLOCs wala device har tunnel interface ke liye alag port use kar sakta hai, base 12346 se shuru karke 20 ke steps mein badhte hue (12366, 12386 aur aage). Yeh isliye hai ki ek NAT address ke peeche same private port use karne wale devices takrayein nahi. Firewall plan mein controllers ki taraf base port aur woh hopping range allow karo jo aap sach mein use karte ho.</p>

<h3>Control plane ke liye firewall checklist</h3>
<ul>
<li>Har edge transport se Validator, Controllers aur Manager tak: use mein aane wale DTLS ya TLS ports.</li>
<li>Controllers ke beech, dono directions mein.</li>
<li>On-premises designs mein administrators aur APIs ke liye Manager ka HTTPS port, restricted rakhkar.</li>
<li>Public ke peeche private address wale kisi bhi controller ke liye (static) NAT mappings.</li>
</ul>

<div class="eg"><p><b>Hops ginna.</b> Ek edge ke ek hi router par do tunnel interfaces hain, ek MPLS aur ek internet. Pehla base port 12346 use karta hai, doosra 12366 par hop karta hai. Agar data centre ka firewall sirf 12346 allow karta hai, to pehla connection ban jaata hai aur doosra chupchaap block ho jaata hai. Edge ek control connection up aur ek connect mein atka dikhata hai, aur dashboard aadha healthy dikhta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Device ko list mein jodna par valid set na karna; list badalkar controllers ko bhejna bhool jaana; sirf port 12346 kholna; ek side par TLS chunna aur DTLS ke kaam karne ki ummeed rakhna; production mein device ko staging state mein chhodna.</p></div>

<div class="exam"><p><b>Exam traps.</b> List serial number check karti hai; certificate identity aur CA check karta hai. Valid, Staging aur Invalid teen states hain. UDP par DTLS default hai; peers alag hon to TLS use hota hai. Base DTLS port 12346 hai aur hopping 20 se badhti hai.</p></div>

<div class="scn"><h4>Router jo bilkul asli tha</h4><p>Ek branch router valid certificate ke saath aaya par connect state mein atka raha. Control-connection history ne kaha ki Validator ne use reject kiya. Engineer ne Manager ki WAN edge list mein dhoondha aur serial number missing paya: purchase order alag Smart Account ke tahat gaya tha. Device ko list mein joda gaya, valid set kiya gaya aur controllers ko bheja gaya, aur woh turant join ho gaya.</p><p><b>Seekh:</b> achha certificate zaroori hai par kaafi nahi. List check karo.</p></div>

<div class="iv"><p class="q">"Naye router ke paas valid certificate hai par woh join nahi kar pa raha. Kya check karoge?"</p><p>Strong answer: pehle ki uska serial number WAN edge list mein hai aur valid hai, aur ki list controllers ko bheji gayi; phir organization name, phir Validator tak reachability, phir firewall ports (DTLS 12346 aur hop ports), phir time. Error code ke liye control-connection history use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WAN edge list devices ko chassis number aur serial number se authorise karti hai.</li>
<li>States Valid, Staging aur Invalid hain; badlav controllers ko push karo.</li>
<li>Virtual edges chassis number aur one-time token se onboard hote hain.</li>
<li>UDP par DTLS (base port 12346, 20 ke steps mein hopping) default hai; TLS TCP use karta hai.</li>
<li>Jitne hop ports aapke TLOCs use karenge, un sab ke liye firewall plan karo.</li>
</ul></div>
`}};export{e as default};