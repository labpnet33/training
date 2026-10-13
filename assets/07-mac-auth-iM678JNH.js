var e={id:`mac-auth`,h:{en:`MAC authentication and the Endpoints Repository`,hi:`MAC authentication aur Endpoints Repository`},body:{en:`
<p>A printer cannot type a password. It has no supplicant, so it never answers the switch's identity request. Think of a parcel with no sender name: the only thing the guard can read is the <b>serial number on the box</b>. MAC authentication uses that serial number, the device's MAC address, as its identity, and ClearPass checks it against a list of boxes it already knows.</p>

<h3>How MAC authentication works</h3>
<ol>
<li>The port tries 802.1X first. The printer does not answer. In the lab model the switch waits about 10 seconds.</li>
<li>The switch falls over to MAC authentication. It learns the MAC address from the first frame the device sends.</li>
<li>The switch sends a RADIUS Access-Request. The username is the MAC address, and so is the password, in a format agreed on both sides (for example lowercase with colons or hyphens). On real equipment the Calling-Station-Id attribute carries the MAC too.</li>
<li>ClearPass classifies the request to a MAC authentication service, checks the MAC in the Endpoints Repository, maps a role and returns attributes.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAC authentication fallback">
<rect x="20" y="80" width="120" height="60" rx="8" fill="#fde68a"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="14">PRN1</text><text x="80" y="126" text-anchor="middle" class="svg-muted" font-size="12">no supplicant</text>
<rect x="260" y="80" width="120" height="60" rx="8" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">ACCESS 1/1/5</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">dot1x then mac-auth</text>
<rect x="500" y="80" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="107" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="560" y="126" text-anchor="middle" class="svg-muted" font-size="12">Endpoints Repo</text>
<line x1="140" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><text x="200" y="102" text-anchor="middle" class="svg-muted" font-size="12">frame, MAC</text>
<line x1="380" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="440" y="102" text-anchor="middle" class="svg-accent" font-size="12">user = MAC</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. 802.1X times out (about 10 s)</text><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">2. fall over to MAC authentication</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3. role IOT, VLAN 30</text>
<text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">MAC is a name, not a proof</text>
</svg><p class="cap">The printer is identified by its MAC and placed by role, after 802.1X times out.</p></div>

<h3>The Endpoints Repository</h3>
<p>The <b>Endpoints Repository</b> is ClearPass's built-in database of devices, keyed by MAC address (GUI: Configuration &gt; Identity &gt; Endpoints). Each endpoint has a <b>status</b> (known, unknown or disabled) and attributes. Attributes such as <code>Category</code> are what role mapping uses: Category Printer maps to a printer-type role, Category Camera to another. In a real deployment, device profiling can fill these automatically from DHCP and other fingerprints. Profiling and Network Scan are <b>not simulated in the lab</b>; in the lab you add the endpoint by hand.</p>
<table class="cmp"><tr><th>Status</th><th>Meaning</th><th>Alert</th></tr>
<tr><td>known</td><td>Registered and allowed to authenticate</td><td>none</td></tr>
<tr><td>unknown</td><td>Seen but not trusted</td><td>216 unknown endpoint when not in the repository</td></tr>
<tr><td>disabled</td><td>Blocked on purpose (lost, retired)</td><td>rejected</td></tr></table>

<h3>The lab: cp-mac-auth</h3>
<p>Port 1/1/5 already has MAC authentication enabled and the switch has the role IOT (VLAN 30). On ClearPass the roles, role mapping RM-MAC, profile EP-IOT and policy EPOL-MAC exist, but no endpoint and no service. You add two things.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
<span class="c">! 1. the printer as a known endpoint with Category Printer</span>
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer
<span class="c">! 2. the service from the wired MAC auth template, then bind the objects</span>
configuration service add "Wired MAC Auth" template wired-mac-auth
configuration service "Wired MAC Auth" role-mapping RM-MAC
configuration service "Wired MAC Auth" enforcement-policy EPOL-MAC
<span class="c">! on PRN1</span>
ip dhcp
ping 10.20.70.20</pre>
<p>The template sets the classification rules and the methods for you ([MAC AUTH] checks the Endpoints Repository). The real GUI offers a similar service template for MAC authentication, and you still pick the role mapping and enforcement policy yourself.</p>
<pre class="out">CPPM Access Tracker  detail latest summary
  Service           : Wired MAC Auth
  Auth method       : MAC AUTH
  Auth source       : Endpoints Repository
  Roles             : PRINTER
  Enforcement       : EP-IOT
  Result            : ACCEPT

ACCESS# show port-access clients detail
Client 00:50:67:fb:67:01
  Port        : 1/1/5
  Status      : <span class="hl">authorized</span>
  Method      : <span class="hl">mac-auth</span>
  Role        : <span class="hl">IOT</span>
  VLAN        : 30
  IPv4 address: 10.20.30.50</pre>

<div class="eg"><p><b>Worked example.</b> The chain for PRN1: MAC 00:50:67:fb:67:01 is found with Category=Printer. RM-MAC rule: Endpoint:Category EQUALS Printer then role PRINTER. EPOL-MAC rule: Tips:Role EQUALS PRINTER then EP-IOT. EP-IOT returns Aruba-User-Role IOT. The switch role IOT puts the port in VLAN 30. Four hops, one visible result. Time to first address is about 10 s of 802.1X wait plus a second or two of MAC auth plus DHCP.</p></div>

<h3>Security: a MAC is a name, not a proof</h3>
<p>A MAC address can be seen on the wire and copied. If someone clones the printer's MAC onto a laptop, MAC authentication will accept it. For this reason MAC-authenticated devices should be given the <b>least access that still works</b>: the IOT VLAN, filtered at the router, and only the destinations the printer needs. Review the repository regularly, disable lost devices, and use stronger identity (certificates or 802.1X) wherever the device supports it. ClearPass can also compare the MAC with profiling data to spot a device that behaves unlike its recorded type; that is a real capability that is <b>not simulated in the lab</b>.</p>

<div class="note"><p><b>Real platform note.</b> Real ClearPass also offers the [Allow All MAC AUTH] method, which accepts any MAC at the authentication step and relies on later authorization or on profiling to restrict access. That is a deliberate design for unknown devices, but it makes the Endpoints Repository check optional, so use it knowingly.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding the endpoint but not binding the role mapping and enforcement policy to the service. The device then authenticates and lands in the default profile. Another is a MAC typed in the wrong case or format, so lookups fail with alert 216.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAC authentication is not a stronger or "more secure" method than 802.1X; it is a fallback for devices that cannot do 802.1X. Also, the switch tries 802.1X first and only then falls over to MAC authentication, which is why printers appear slow.</p></div>

<div class="scn"><h4>The loss report</h4><p>A printer disappeared from a store room and its endpoint was marked disabled. Months later a replacement was plugged into the same port and was rejected. The Access Tracker alert showed the old MAC as disabled. Adding the new MAC as known and keeping the old one disabled gave a clean audit trail.</p><p><b>Lesson:</b> the endpoint status is policy; check it before suspecting the switch.</p></div>

<div class="iv"><p class="q">"How do you onboard a printer that cannot run 802.1X, and what are the risks?"</p><p>Strong answer: enable MAC authentication as a fallback on the port, add the printer MAC to the Endpoints Repository as known with a category, map that category to a role, and return a restricted role or VLAN. Explain that MAC addresses can be spoofed, so restrict the role, monitor and prefer stronger identity where possible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC authentication uses the MAC as username and password for devices without a supplicant.</li>
<li>The switch tries 802.1X first, then falls over to MAC authentication after a timeout.</li>
<li>The Endpoints Repository holds status (known, unknown, disabled) and attributes such as Category.</li>
<li>Bind role mapping and enforcement policy to the Wired MAC Auth service.</li>
<li>A MAC can be spoofed, so give MAC devices the least access.</li>
</ul></div>
`,hi:`
<p>Printer password type nahi kar sakta. Uske paas supplicant nahi hai, isliye woh switch ki identity request ka jawab kabhi nahi deta. Aise parcel ki tarah socho jis par bhejne wale ka naam nahi hai: guard sirf <b>box par likha serial number</b> padh sakta hai. MAC authentication wahi serial number, device ka MAC address, apni identity ki tarah use karta hai, aur ClearPass use un boxes ki list se match karta hai jinhe woh pehle se jaanta hai.</p>

<h3>MAC authentication kaise kaam karta hai</h3>
<ol>
<li>Port pehle 802.1X try karta hai. Printer jawab nahi deta. Lab model mein switch lagbhag 10 second wait karta hai.</li>
<li>Switch MAC authentication par fall over karta hai. Woh device ke pehle frame se MAC address seekhta hai.</li>
<li>Switch RADIUS Access-Request bhejta hai. Username MAC address hai, aur password bhi, ek format mein jo dono sides agree karein (jaise colons ya hyphens ke saath lowercase). Real equipment par Calling-Station-Id attribute bhi MAC le jaata hai.</li>
<li>ClearPass request ko MAC authentication service par classify karta hai, Endpoints Repository mein MAC check karta hai, role map karta hai aur attributes return karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MAC authentication fallback">
<rect x="20" y="80" width="120" height="60" rx="8" fill="#fde68a"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="14">PRN1</text><text x="80" y="126" text-anchor="middle" class="svg-muted" font-size="12">no supplicant</text>
<rect x="260" y="80" width="120" height="60" rx="8" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">ACCESS 1/1/5</text><text x="320" y="126" text-anchor="middle" class="svg-muted" font-size="12">dot1x phir mac-auth</text>
<rect x="500" y="80" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="107" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="560" y="126" text-anchor="middle" class="svg-muted" font-size="12">Endpoints Repo</text>
<line x1="140" y1="110" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><text x="200" y="102" text-anchor="middle" class="svg-muted" font-size="12">frame, MAC</text>
<line x1="380" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><text x="440" y="102" text-anchor="middle" class="svg-accent" font-size="12">user = MAC</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. 802.1X timeout (lagbhag 10 s)</text><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">2. MAC authentication par fall over</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3. role IOT, VLAN 30</text>
<text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">MAC ek naam hai, proof nahi</text>
</svg><p class="cap">802.1X timeout ke baad printer apne MAC se pehchana jaata hai aur role se place hota hai.</p></div>

<h3>Endpoints Repository</h3>
<p><b>Endpoints Repository</b> ClearPass ka built-in devices database hai, MAC address se keyed (GUI: Configuration &gt; Identity &gt; Endpoints). Har endpoint ka ek <b>status</b> (known, unknown ya disabled) aur attributes hote hain. <code>Category</code> jaise attributes role mapping use karti hai: Category Printer ek printer-type role se map hota hai, Category Camera doosre se. Real deployment mein device profiling DHCP aur doosre fingerprints se yeh automatically bhar sakti hai. Profiling aur Network Scan lab mein <b>not simulated in the lab</b> hain; lab mein aap endpoint haath se add karte ho.</p>
<table class="cmp"><tr><th>Status</th><th>Matlab</th><th>Alert</th></tr>
<tr><td>known</td><td>Registered aur authenticate karne ki ijazat</td><td>koi nahi</td></tr>
<tr><td>unknown</td><td>Dekha gaya par trusted nahi</td><td>repository mein na ho to 216 unknown endpoint</td></tr>
<tr><td>disabled</td><td>Jaan boojh kar block (lost, retired)</td><td>rejected</td></tr></table>

<h3>Lab: cp-mac-auth</h3>
<p>Port 1/1/5 par MAC authentication pehle se enabled hai aur switch par role IOT (VLAN 30) hai. ClearPass par roles, role mapping RM-MAC, profile EP-IOT aur policy EPOL-MAC exist karte hain, par koi endpoint aur koi service nahi. Aap do cheezein add karte ho.</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
<span class="c">! 1. the printer as a known endpoint with Category Printer</span>
configuration identity endpoint add 00:50:67:fb:67:01 status known attr Category=Printer
<span class="c">! 2. the service from the wired MAC auth template, then bind the objects</span>
configuration service add "Wired MAC Auth" template wired-mac-auth
configuration service "Wired MAC Auth" role-mapping RM-MAC
configuration service "Wired MAC Auth" enforcement-policy EPOL-MAC
<span class="c">! on PRN1</span>
ip dhcp
ping 10.20.70.20</pre>
<p>Template classification rules aur methods aapke liye set karta hai ([MAC AUTH] Endpoints Repository check karta hai). Real GUI mein MAC authentication ke liye aisa hi service template milta hai, aur role mapping aur enforcement policy aap khud chunte ho.</p>
<pre class="out">CPPM Access Tracker  detail latest summary
  Service           : Wired MAC Auth
  Auth method       : MAC AUTH
  Auth source       : Endpoints Repository
  Roles             : PRINTER
  Enforcement       : EP-IOT
  Result            : ACCEPT

ACCESS# show port-access clients detail
Client 00:50:67:fb:67:01
  Port        : 1/1/5
  Status      : <span class="hl">authorized</span>
  Method      : <span class="hl">mac-auth</span>
  Role        : <span class="hl">IOT</span>
  VLAN        : 30
  IPv4 address: 10.20.30.50</pre>

<div class="eg"><p><b>Worked example.</b> PRN1 ki chain: MAC 00:50:67:fb:67:01 Category=Printer ke saath mil jaata hai. RM-MAC rule: Endpoint:Category EQUALS Printer then role PRINTER. EPOL-MAC rule: Tips:Role EQUALS PRINTER then EP-IOT. EP-IOT Aruba-User-Role IOT return karta hai. Switch role IOT port ko VLAN 30 mein daalta hai. Chaar hops, ek visible result. Pehla address aane ka time lagbhag 10 s 802.1X wait plus ek do second MAC auth plus DHCP hai.</p></div>

<h3>Security: MAC naam hai, proof nahi</h3>
<p>MAC address wire par dekha aur copy kiya ja sakta hai. Agar koi printer ka MAC laptop par clone kar de, to MAC authentication use accept kar lega. Isliye MAC-authenticated devices ko <b>sabse kam access jo phir bhi kaam kare</b> dena chahiye: IOT VLAN, router par filtered, aur sirf woh destinations jo printer ko chahiye. Repository ko regularly review karo, lost devices ko disable karo, aur jahan device support kare wahan stronger identity (certificates ya 802.1X) use karo. ClearPass MAC ko profiling data se bhi compare kar sakta hai taaki aise device ko pakde jo apne recorded type jaisa behave nahi karta; yeh real capability lab mein <b>not simulated in the lab</b> hai.</p>

<div class="note"><p><b>Real platform note.</b> Real ClearPass [Allow All MAC AUTH] method bhi deta hai, jo authentication step par koi bhi MAC accept kar leta hai aur baad ki authorization ya profiling par access restrict karne ke liye nirbhar karta hai. Yeh unknown devices ke liye jaan boojh kar design hai, par isse Endpoints Repository check optional ho jaata hai, isliye samajh kar use karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Endpoint add karna par role mapping aur enforcement policy ko service se bind na karna. Tab device authenticate hota hai aur default profile mein pahunchta hai. Doosri galti: MAC galat case ya format mein type karna, jisse lookup alert 216 ke saath fail hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> MAC authentication 802.1X se zyada strong ya "more secure" method nahi hai; yeh un devices ke liye fallback hai jo 802.1X nahi kar sakte. Aur switch pehle 802.1X try karta hai, phir hi MAC authentication par fall over karta hai, isliye printers slow lagte hain.</p></div>

<div class="scn"><h4>Loss report</h4><p>Ek printer store room se gaayab ho gaya aur uska endpoint disabled mark kiya gaya. Mahino baad usi port mein replacement lagaya gaya aur reject ho gaya. Access Tracker alert ne purana MAC disabled dikhaya. Naya MAC known ki tarah add karne aur purana disabled rakhne se clean audit trail mila.</p><p><b>Seekh:</b> endpoint status policy hai; switch par shak karne se pehle use check karo.</p></div>

<div class="iv"><p class="q">"Jo printer 802.1X nahi chala sakta use kaise onboard karoge, aur risks kya hain?"</p><p>Strong answer: port par fallback ke roop mein MAC authentication enable karo, printer ka MAC Endpoints Repository mein category ke saath known add karo, us category ko role se map karo, aur restricted role ya VLAN return karo. Samjhao ki MAC addresses spoof ho sakte hain, isliye role restrict karo, monitor karo aur jahan mumkin ho stronger identity prefer karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC authentication supplicant-less devices ke liye MAC ko username aur password ki tarah use karta hai.</li>
<li>Switch pehle 802.1X try karta hai, timeout ke baad MAC authentication par fall over karta hai.</li>
<li>Endpoints Repository status (known, unknown, disabled) aur Category jaise attributes rakhta hai.</li>
<li>Role mapping aur enforcement policy ko Wired MAC Auth service se bind karo.</li>
<li>MAC spoof ho sakta hai, isliye MAC devices ko least access do.</li>
</ul></div>
`}};export{e as default};