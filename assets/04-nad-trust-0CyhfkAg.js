var e={id:`nad-trust`,h:{en:`Trust in both directions: the switch and the network device`,hi:`Dono taraf trust: switch aur network device`},body:{en:`
<p>Before any user policy can work, two machines must trust each other. The switch must know where ClearPass is and share a secret with it. ClearPass must know that the switch is an allowed RADIUS client. If either half is missing, no username, password or policy matters. This chapter builds both halves and is the first lab of the module, <b>cp-nad-register</b>.</p>

<h3>Analogy: two offices exchanging visiting cards</h3>
<p>Two companies agree to do business by phone. Company A writes down Company B's phone number. Company B writes down Company A's number and a code word. When a call arrives, B checks the caller's number against its book and asks for the code word. An unknown number or a wrong code word gets no answer at all, because B does not want to reveal anything. That is exactly how ClearPass treats RADIUS packets.</p>

<h3>What a network device (NAD) is</h3>
<p>In ClearPass a <b>network device</b> is any RADIUS or TACACS+ client: switch, wireless controller, VPN gateway, firewall. ClearPass identifies it by the <b>source IP address of the RADIUS packet</b>, not by its hostname. The device record stores the name, the IP address (or a subnet or range), the <b>RADIUS shared secret</b>, the vendor (Aruba, which matters for vendor-specific attributes such as Aruba-User-Role) and optionally the <b>CoA</b> settings (RFC 5176, UDP 3799).</p>
<p>The real GUI path is <b>Configuration, Network, Devices, Add</b>. You fill in Name, IP or Subnet Address, RADIUS Shared Secret, Vendor Name Aruba and, if you plan to use change of authorization, Enable RADIUS CoA with port 3799.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Two halves of trust">
<rect x="20" y="40" width="250" height="120" rx="10" fill="#bbf7d0"/><text x="145" y="64" text-anchor="middle" class="svg-ink" font-size="14">ACCESS (switch)</text>
<text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">radius-server host 10.20.60.10</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">key ArubaNK1</text><text x="145" y="132" text-anchor="middle" class="svg-muted" font-size="12">server group CPPM, source 10.20.99.2</text>
<rect x="370" y="40" width="250" height="120" rx="10" fill="#ddd6fe"/><text x="495" y="64" text-anchor="middle" class="svg-ink" font-size="14">CPPM (ClearPass)</text>
<text x="495" y="92" text-anchor="middle" class="svg-muted" font-size="12">network device ACCESS</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">ip 10.20.99.2, secret ArubaNK1</text><text x="495" y="132" text-anchor="middle" class="svg-muted" font-size="12">vendor Aruba</text>
<line x1="270" y1="100" x2="370" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Both halves must match: address and secret</text>
</svg><p class="cap">The switch points at ClearPass; ClearPass lists the switch by its source address.</p></div>

<h3>Which address does the switch use?</h3>
<p>A switch with several interfaces picks one as the source of its RADIUS packets. In the lab, ACCESS reaches ClearPass through R1 and sources its requests from its Vlan99 address, <b>10.20.99.2</b>. That is the address you must register, not the management name and not an address of another VLAN. On the real switch you can set the source interface per VRF; check it with the show commands before you register the device.</p>

<h3>Part 1: the switch side (AOS-CX style)</h3>
<pre class="code"><span class="c">! ACCESS: tell the switch where ClearPass is</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
    exit
<span class="c">! turn on 802.1X globally, using that server group</span>
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
    exit
<span class="c">! and enable it on the port of LAPTOP1</span>
interface 1/1/3
    aaa authentication port-access dot1x authenticator
        enable
    exit</pre>
<p>A method only works when it is enabled in <b>both</b> places: globally (with a server group that exists) and on the port. Missing either one is a very common reason why a port does nothing. In the lab the enable line is shown as part of the sub-mode; follow the lab prompts.</p>

<h3>Part 2: the ClearPass side (Lab shell)</h3>
<pre class="code"><span class="c">! Lab shell on CPPM. GUI: Configuration &gt; Network &gt; Devices &gt; Add</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off</pre>
<p>The two values that must be exactly right are the <b>IP address</b> and the <b>secret</b>. The CoA option is left off for now; it is the subject of a later module.</p>

<h3>Part 3: prove that ClearPass sees the request</h3>
<p>After both halves exist, LAPTOP1 tries to log in. ClearPass now accepts the packet at station 1, but there is no service yet. Open the Access Tracker:</p>
<pre class="code">monitoring access-tracker
monitoring access-tracker detail latest alerts</pre>
<pre class="out">Access Tracker (1 record)
Time      Username  Device   Service  Result
10:04:12  alice     ACCESS   -        <span class="hl">REJECT</span>

Alerts for latest:
  <span class="hl">9002  Failed to classify request to service</span></pre>
<p>This is good news in the first lab. The record exists, so trust works. The failure is at station 2, because you have not built a service yet. You will build one in chapters 5 to 9.</p>

<div class="eg"><p><b>Worked example.</b> A colleague registers the device with address 10.20.60.2 (the R1 interface toward the servers) because "that is the router near ClearPass". ClearPass logs "request from an unknown device 10.20.99.2" in the Event Viewer and sends nothing back. Correcting the device address to 10.20.99.2 makes the very next login appear in the Access Tracker.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Registering the switch by hostname or management IP instead of the RADIUS source address. Typing the secret with a different case or an extra space. Registering the device but forgetting <code>enable</code> on the port or the global server group. Expecting the user policy to fix a trust problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> Unknown NAD and wrong shared secret are not "rejects". ClearPass drops the packet silently; the switch sees timeouts and marks the server dead; the Access Tracker has no record, and the Event Viewer is where the proof lives.</p></div>

<div class="scn"><h4>The new floor switch</h4><p>A branch got a new access switch. 802.1X was configured exactly like the old switch, yet every port stayed unauthorized. The Access Tracker was empty. The Event Viewer showed packets from an address that was not a configured device. The engineer had registered the switch loopback, while the switch sourced RADIUS from the uplink VLAN interface. Correcting the device address fixed it in seconds.</p><p><b>Lesson:</b> check the source address the switch really uses, then register that one.</p></div>

<div class="iv"><p class="q">"A new switch is cabled and configured for 802.1X but nobody can authenticate and the Access Tracker shows nothing. What do you check?"</p><p>Strong answer: the NAD is probably not registered, or the address or secret is wrong, so ClearPass drops the request before any service runs. Check the Event Viewer, confirm the switch RADIUS source IP, compare the shared secrets, and confirm reachability on UDP 1812. Only after the record appears in the Access Tracker look at services and policies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust has two halves: the switch knows the server and key; ClearPass knows the device and secret.</li>
<li>ClearPass identifies a NAD by the source IP of the RADIUS packet; here 10.20.99.2.</li>
<li>Wrong address or secret means silent drop and Event Viewer evidence only.</li>
<li>Methods need enabling globally and on the port, with an existing server group.</li>
<li>GUI path: Configuration, Network, Devices; the lab command is configuration network device.</li>
</ul></div>
`,hi:`
<p>Koi bhi user policy kaam kare, usse pehle do machines ko ek dusre par trust karna padta hai. Switch ko pata hona chahiye ki ClearPass kahan hai aur uske saath ek secret share karna chahiye. ClearPass ko pata hona chahiye ki switch ek allowed RADIUS client hai. Agar koi bhi aadha hissa missing hai, to username, password ya policy kuch matter nahi karta. Yeh chapter dono halves banata hai aur module ka pehla lab hai, <b>cp-nad-register</b>.</p>

<h3>Analogy: do offices visiting cards exchange karte hue</h3>
<p>Do companies phone par business karne ke liye agree hoti hain. Company A, Company B ka phone number likh leti hai. Company B, Company A ka number aur ek code word likh leti hai. Jab call aati hai, B caller ka number apni book se check karti hai aur code word maangti hai. Unknown number ya galat code word ko koi jawab nahi milta, kyunki B kuch reveal nahi karna chahti. ClearPass RADIUS packets ke saath bilkul yahi karta hai.</p>

<h3>Network device (NAD) kya hota hai</h3>
<p>ClearPass mein <b>network device</b> koi bhi RADIUS ya TACACS+ client hai: switch, wireless controller, VPN gateway, firewall. ClearPass use <b>RADIUS packet ke source IP address</b> se pehchanta hai, hostname se nahi. Device record mein name, IP address (ya subnet ya range), <b>RADIUS shared secret</b>, vendor (Aruba, jo Aruba-User-Role jaise vendor-specific attributes ke liye matter karta hai) aur optionally <b>CoA</b> settings (RFC 5176, UDP 3799) store hote hain.</p>
<p>Real GUI path <b>Configuration, Network, Devices, Add</b> hai. Aap Name, IP or Subnet Address, RADIUS Shared Secret, Vendor Name Aruba bharte ho aur, agar change of authorization use karna hai, to Enable RADIUS CoA port 3799 ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Trust ke do halves">
<rect x="20" y="40" width="250" height="120" rx="10" fill="#bbf7d0"/><text x="145" y="64" text-anchor="middle" class="svg-ink" font-size="14">ACCESS (switch)</text>
<text x="145" y="92" text-anchor="middle" class="svg-muted" font-size="12">radius-server host 10.20.60.10</text><text x="145" y="112" text-anchor="middle" class="svg-muted" font-size="12">key ArubaNK1</text><text x="145" y="132" text-anchor="middle" class="svg-muted" font-size="12">server group CPPM, source 10.20.99.2</text>
<rect x="370" y="40" width="250" height="120" rx="10" fill="#ddd6fe"/><text x="495" y="64" text-anchor="middle" class="svg-ink" font-size="14">CPPM (ClearPass)</text>
<text x="495" y="92" text-anchor="middle" class="svg-muted" font-size="12">network device ACCESS</text><text x="495" y="112" text-anchor="middle" class="svg-muted" font-size="12">ip 10.20.99.2, secret ArubaNK1</text><text x="495" y="132" text-anchor="middle" class="svg-muted" font-size="12">vendor Aruba</text>
<line x1="270" y1="100" x2="370" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Dono halves match hone chahiye: address aur secret</text>
</svg><p class="cap">Switch ClearPass ko point karta hai; ClearPass switch ko uske source address se list karta hai.</p></div>

<h3>Switch kaunsa address use karta hai?</h3>
<p>Kai interfaces wala switch ek ko apne RADIUS packets ka source chunta hai. Lab mein ACCESS R1 ke through ClearPass tak pahunchta hai aur apni Vlan99 address se requests source karta hai, yaani <b>10.20.99.2</b>. Yahi address aapko register karna hai, management name nahi aur kisi doosre VLAN ka address nahi. Real switch par aap source interface per VRF set kar sakte ho; device register karne se pehle show commands se check karo.</p>

<h3>Part 1: switch side (AOS-CX style)</h3>
<pre class="code"><span class="c">! ACCESS: switch ko batao ClearPass kahan hai</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
    exit
<span class="c">! 802.1X globally on karo, us server group ke saath</span>
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
    exit
<span class="c">! aur LAPTOP1 ke port par enable karo</span>
interface 1/1/3
    aaa authentication port-access dot1x authenticator
        enable
    exit</pre>
<p>Method tabhi kaam karta hai jab woh <b>dono</b> jagah enabled ho: globally (existing server group ke saath) aur port par. Koi ek bhi missing ho to port kuch nahi karta, aur yeh bahut common wajah hai. Lab mein enable line sub-mode ka hissa dikhti hai; lab prompts follow karo.</p>

<h3>Part 2: ClearPass side (Lab shell)</h3>
<pre class="code"><span class="c">! CPPM par Lab shell. GUI: Configuration &gt; Network &gt; Devices &gt; Add</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off</pre>
<p>Do values bilkul sahi honi chahiye: <b>IP address</b> aur <b>secret</b>. CoA option abhi off hai; woh aage ke module ka subject hai.</p>

<h3>Part 3: prove karo ki ClearPass request dekh raha hai</h3>
<p>Dono halves banne ke baad LAPTOP1 login try karta hai. ClearPass ab station 1 par packet accept karta hai, par abhi koi service nahi hai. Access Tracker kholo:</p>
<pre class="code">monitoring access-tracker
monitoring access-tracker detail latest alerts</pre>
<pre class="out">Access Tracker (1 record)
Time      Username  Device   Service  Result
10:04:12  alice     ACCESS   -        <span class="hl">REJECT</span>

Alerts for latest:
  <span class="hl">9002  Failed to classify request to service</span></pre>
<p>Pehle lab mein yeh achhi khabar hai. Record maujood hai, matlab trust kaam karta hai. Failure station 2 par hai, kyunki aapne abhi service nahi banayi. Aap chapters 5 se 9 mein banaoge.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague device ko address 10.20.60.2 (servers ki taraf R1 ka interface) ke saath register karta hai kyunki "woh ClearPass ke paas wala router hai". ClearPass Event Viewer mein "request from an unknown device 10.20.99.2" log karta hai aur kuch wapas nahi bhejta. Device address ko 10.20.99.2 karne se agla login Access Tracker mein dikh jata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Switch ko hostname ya management IP se register karna, RADIUS source address se nahi. Secret ko alag case ya extra space ke saath type karna. Device register karna par port ya global server group par <code>enable</code> bhool jana. Trust problem ko user policy se fix karne ki umeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Unknown NAD aur wrong shared secret "reject" nahi hain. ClearPass packet chupchap drop karta hai; switch ko timeouts dikhte hain aur woh server ko dead mark karta hai; Access Tracker mein record nahi hota, aur proof Event Viewer mein hota hai.</p></div>

<div class="scn"><h4>Naya floor switch</h4><p>Ek branch ko naya access switch mila. 802.1X bilkul purane switch ki tarah configure kiya, phir bhi har port unauthorized raha. Access Tracker khaali tha. Event Viewer mein aise address se packets dikhe jo configured device nahi tha. Engineer ne switch ka loopback register kiya tha, jabki switch RADIUS uplink VLAN interface se source karta tha. Device address sahi karne se kuch second mein fix ho gaya.</p><p><b>Seekh:</b> check karo ki switch asli mein kaunsa source address use karta hai, aur wahi register karo.</p></div>

<div class="iv"><p class="q">"Naya switch cable aur 802.1X ke liye configure hai par koi authenticate nahi ho pa raha aur Access Tracker mein kuch nahi. Aap kya check karoge?"</p><p>Strong answer: shayad NAD register nahi hai, ya address ya secret galat hai, isliye ClearPass koi service chalne se pehle request drop kar deta hai. Event Viewer check karo, switch ka RADIUS source IP confirm karo, shared secrets compare karo, aur UDP 1812 reachability confirm karo. Record Access Tracker mein aane ke baad hi services aur policies dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust ke do halves: switch server aur key jaanta hai; ClearPass device aur secret jaanta hai.</li>
<li>ClearPass NAD ko RADIUS packet ke source IP se pehchanta hai; yahan 10.20.99.2.</li>
<li>Galat address ya secret ka matlab silent drop aur sirf Event Viewer evidence.</li>
<li>Methods ko globally aur port par enable karna padta hai, existing server group ke saath.</li>
<li>GUI path: Configuration, Network, Devices; lab command configuration network device hai.</li>
</ul></div>
`}};export{e as default};