var e={id:`nad-onboarding`,h:{en:`Network devices: onboarding a NAD`,hi:`Network devices: NAD ko onboard karna`},body:{en:`
<p>Think of a building reception that keeps a visitor log of <b>approved delivery companies</b>. A courier who is not on the list is not stopped and not scolded; reception just does not open the door. In ClearPass the list of approved callers is the <b>network device</b> list. A <b>NAD</b> (network access device) is any device that asks ClearPass to make an access decision on behalf of a user: an access switch, a wireless controller, an Instant AP cluster, a VPN gateway. In 802.1X language the NAD is the <b>authenticator</b>.</p>

<h3>Why ClearPass insists on a device list</h3>
<p>RADIUS is an old protocol that runs over UDP. A RADIUS packet carries a user name and some attributes, but nothing strong proves who sent it, except the <b>shared secret</b> and the <b>source IP address</b>. If ClearPass answered every sender, anybody on the network could send forged requests, learn which users exist from the replies, or flood the server. So ClearPass answers only the devices an administrator has registered, and it uses the registered secret to check each packet. This is the first security gate, before any service or policy runs.</p>

<h3>The real GUI: Configuration &gt; Network &gt; Devices</h3>
<p>In the real ClearPass Policy Manager you open <b>Configuration &gt; Network &gt; Devices</b> and click <b>Add</b>. The fields that matter for this module are:</p>
<dl class="terms">
<dt>Name</dt><dd>A friendly label, such as ACCESS or MUM-HQ-SW01. It is for humans and for reports. It is <b>not</b> used to match packets.</dd>
<dt>IP or Subnet Address</dt><dd>The address ClearPass compares with the source of the RADIUS packet. The real product accepts a single address, a subnet in CIDR form or an address range, which is useful when many switches share a management block. The lab model accepts one address.</dd>
<dt>RADIUS Shared Secret</dt><dd>The secret for this device. Stored per device, so two switches can have two different secrets.</dd>
<dt>TACACS+ Shared Secret</dt><dd>A separate secret used only when the device does TACACS+ administration (chapter 9).</dd>
<dt>Vendor Name</dt><dd>For example Aruba. The vendor selects the dictionary of vendor-specific attributes, such as Aruba-User-Role, that ClearPass may return.</dd>
<dt>Enable RADIUS CoA and CoA port</dt><dd>Allows ClearPass to send Change of Authorization and Disconnect messages to the device. The standard port is UDP 3799. The switch must be configured to accept them with the same secret.</dd>
</dl>
<p>The real product has more tabs (SNMP read settings for profiling, CLI settings, device attributes). They are out of scope for the lab.</p>

<p><b>Lab shell</b> (the practice equivalent of the GUI form):</p>
<pre class="code"><span class="c">! Lab shell on CPPM: Configuration &gt; Network &gt; Devices &gt; Add</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
<span class="c">! check what is registered</span>
configuration network device show</pre>

<h3>The other half: the switch side</h3>
<p>A NAD entry on ClearPass is only half of the trust. The switch needs the mirror image. On the AOS-CX style switch you define the RADIUS host with its key, put it in a server group and enable the method globally and on the port:</p>
<pre class="code">radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
  server 10.20.60.10
  exit
aaa authentication port-access dot1x authenticator
  radius server-group CPPM
  enable
  exit
interface 1/1/3
  aaa authentication port-access dot1x authenticator
    enable
  exit</pre>
<p>Remember the lab rule: a method only runs when it is enabled <b>both globally and on the port</b>, and the global section names a server group that exists. A common half-finished build is a perfect ClearPass entry and a switch with the global section enabled but no port enabled.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Both sides of device trust">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">ACCESS (switch side)</text>
<text x="40" y="85" class="svg-ink" font-size="12">radius-server host 10.20.60.10</text><text x="40" y="107" class="svg-ink" font-size="12">key ArubaNK1</text><text x="40" y="129" class="svg-ink" font-size="12">server group CPPM</text><text x="40" y="151" class="svg-ink" font-size="12">dot1x on globally and on 1/1/3</text>
<rect x="350" y="30" width="270" height="150" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">CPPM (server side)</text>
<text x="370" y="85" class="svg-ink" font-size="12">Network Device: ACCESS</text><text x="370" y="107" class="svg-ink" font-size="12">IP 10.20.99.2</text><text x="370" y="129" class="svg-ink" font-size="12">RADIUS secret ArubaNK1</text><text x="370" y="151" class="svg-ink" font-size="12">vendor Aruba, CoA optional</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="3"/><text x="320" y="97" text-anchor="middle" class="svg-accent" font-size="12">trust</text>
</svg><p class="cap">Trust is a pair: the switch must know the server and the key, and the server must know the switch address and the key.</p></div>

<h3>What happens when the device is not registered</h3>
<p>If no entry matches the source address, ClearPass does not reply. In the Event Viewer you see a system event saying the request came from a device that is not a configured network device. The wording differs between releases, so look for the idea: unknown NAS or unknown client address. On the switch, the RADIUS server shows as unreachable after the timeout.</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time                 Source   Level  Description
10:41:07             RADIUS   WARN   <span class="hl">Request from unknown network device 10.20.99.2 dropped</span>
10:41:17             RADIUS   WARN   Request from unknown network device 10.20.99.2 dropped</pre>
<p>This is representative output; the exact words in the lab differ slightly, but the hint is the same: an address that is not a registered device.</p>

<div class="eg"><p><b>Worked example.</b> A branch has 40 switches in 10.30.5.0/24, all with the same secret. In the real product you can register one network device with the subnet 10.30.5.0/24 instead of 40 entries. The trade-off: every switch now shares one secret, so rotating the secret means touching all of them. Many sites prefer one entry per device or per site group for exactly that reason.</p></div>

<div class="warn"><p><b>Common mistake.</b> Registering the device by the address you SSH to. The management address and the RADIUS source address can differ (chapter 4). Also, typing the name correctly but the IP wrongly: the name is cosmetic, only the IP matters.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass finds the NAD by its hostname." False. It matches the RADIUS packet source IP against Configuration &gt; Network &gt; Devices. The NAS-Identifier attribute inside the packet is only information, not the lookup key.</p></div>

<div class="scn"><h4>Forty switches, one typo</h4><p>A site onboarded 40 new access switches from a spreadsheet. Thirty-nine worked. One kept showing a dead RADIUS server. The Event Viewer listed an unknown device address ending in .41 while the spreadsheet row had .14 (digits swapped). The engineer corrected the address on the network device entry and the switch recovered at once; no change was needed on the switch.</p><p><b>Lesson:</b> when one device of a batch fails, compare the address in the log with the entry; transposed digits are common.</p></div>

<div class="iv"><p class="q">"What does ClearPass check before it looks at any service?"</p><p>Strong answer: the packet source IP must match a configured network device, and the packet must verify with that device's shared secret. Only then is the request classified into a service. Add that failures here are silent drops logged in the Event Viewer, not Access Tracker rejects.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NAD is the authenticator (switch, controller, AP) that sends RADIUS requests to ClearPass.</li>
<li>Real GUI path: Configuration &gt; Network &gt; Devices; the lab command is configuration network device add.</li>
<li>The lookup key is the source IP of the packet, not the name; the secret is stored per device.</li>
<li>The switch needs the mirror configuration: RADIUS host and key, server group, method on globally and on the port.</li>
<li>An unregistered device is dropped silently and appears in the Event Viewer.</li>
</ul></div>
`,hi:`
<p>Socho ek building reception ke paas <b>approved delivery companies</b> ka visitor log hai. Jo courier list mein nahi hai use rokte nahi, daantte bhi nahi; reception bas darwaza nahi kholta. ClearPass mein approved callers ki list <b>network device</b> list hai. <b>NAD</b> (network access device) koi bhi aisa device hai jo user ki taraf se ClearPass se access decision maangta hai: access switch, wireless controller, Instant AP cluster, VPN gateway. 802.1X ki bhasha mein NAD <b>authenticator</b> hai.</p>

<h3>ClearPass device list par zid kyun karta hai</h3>
<p>RADIUS purana protocol hai jo UDP par chalta hai. RADIUS packet mein user name aur kuch attributes hote hain, par koi strong cheez yeh prove nahi karti ki kisne bheja, siwaye <b>shared secret</b> aur <b>source IP address</b> ke. Agar ClearPass har bhejne wale ko jawab deta, to network par koi bhi forged requests bhej sakta tha, replies se pata laga sakta tha ki kaunse users exist karte hain, ya server ko flood kar sakta tha. Isliye ClearPass sirf un devices ko jawab deta hai jo administrator ne register kiye hain, aur har packet ko registered secret se check karta hai. Yeh pehla security gate hai, kisi bhi service ya policy ke chalne se pehle.</p>

<h3>Real GUI: Configuration &gt; Network &gt; Devices</h3>
<p>Real ClearPass Policy Manager mein aap <b>Configuration &gt; Network &gt; Devices</b> kholte ho aur <b>Add</b> dabate ho. Is module ke liye jo fields matter karte hain:</p>
<dl class="terms">
<dt>Name</dt><dd>Friendly label, jaise ACCESS ya MUM-HQ-SW01. Yeh humans aur reports ke liye hai. Packets match karne mein iska use <b>nahi</b> hota.</dd>
<dt>IP or Subnet Address</dt><dd>Woh address jise ClearPass RADIUS packet ke source se compare karta hai. Real product ek single address, CIDR subnet ya address range accept karta hai, jo tab kaam aata hai jab bahut saare switches ek management block share karte hain. Lab model ek address leta hai.</dd>
<dt>RADIUS Shared Secret</dt><dd>Is device ka secret. Per device store hota hai, isliye do switches ke do alag secrets ho sakte hain.</dd>
<dt>TACACS+ Shared Secret</dt><dd>Alag secret jo sirf tab use hota hai jab device TACACS+ administration karta hai (chapter 9).</dd>
<dt>Vendor Name</dt><dd>Jaise Aruba. Vendor un vendor-specific attributes ki dictionary select karta hai, jaise Aruba-User-Role, jo ClearPass return kar sakta hai.</dd>
<dt>Enable RADIUS CoA aur CoA port</dt><dd>ClearPass ko device ko Change of Authorization aur Disconnect messages bhejne deta hai. Standard port UDP 3799 hai. Switch ko same secret ke saath inhe accept karne ke liye configure karna padta hai.</dd>
</dl>
<p>Real product mein aur tabs hain (profiling ke liye SNMP read settings, CLI settings, device attributes). Yeh lab ke scope se bahar hain.</p>

<p><b>Lab shell</b> (GUI form ka practice equivalent):</p>
<pre class="code"><span class="c">! Lab shell on CPPM: Configuration &gt; Network &gt; Devices &gt; Add</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
<span class="c">! check what is registered</span>
configuration network device show</pre>

<h3>Doosra half: switch side</h3>
<p>ClearPass par NAD entry trust ka sirf aadha hissa hai. Switch ko mirror image chahiye. AOS-CX style switch par aap RADIUS host key ke saath define karte ho, use server group mein daalte ho aur method ko globally aur port par enable karte ho:</p>
<pre class="code">radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
  server 10.20.60.10
  exit
aaa authentication port-access dot1x authenticator
  radius server-group CPPM
  enable
  exit
interface 1/1/3
  aaa authentication port-access dot1x authenticator
    enable
  exit</pre>
<p>Lab rule yaad rakho: method tabhi chalta hai jab woh <b>globally aur port par dono jagah</b> enable ho, aur global section aise server group ka naam le jo exist karta ho. Aadhi bani build ka common example: ClearPass entry perfect, par switch par global section enabled aur koi port enabled nahi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Device trust ke dono sides">
<rect x="20" y="30" width="270" height="150" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">ACCESS (switch side)</text>
<text x="40" y="85" class="svg-ink" font-size="12">radius-server host 10.20.60.10</text><text x="40" y="107" class="svg-ink" font-size="12">key ArubaNK1</text><text x="40" y="129" class="svg-ink" font-size="12">server group CPPM</text><text x="40" y="151" class="svg-ink" font-size="12">dot1x global aur 1/1/3 par on</text>
<rect x="350" y="30" width="270" height="150" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">CPPM (server side)</text>
<text x="370" y="85" class="svg-ink" font-size="12">Network Device: ACCESS</text><text x="370" y="107" class="svg-ink" font-size="12">IP 10.20.99.2</text><text x="370" y="129" class="svg-ink" font-size="12">RADIUS secret ArubaNK1</text><text x="370" y="151" class="svg-ink" font-size="12">vendor Aruba, CoA optional</text>
<line x1="290" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="3"/><text x="320" y="97" text-anchor="middle" class="svg-accent" font-size="12">trust</text>
</svg><p class="cap">Trust ek jodi hai: switch ko server aur key pata honi chahiye, aur server ko switch ka address aur key pata honi chahiye.</p></div>

<h3>Device registered na ho to kya hota hai</h3>
<p>Agar koi entry source address se match nahi karti, to ClearPass reply nahi deta. Event Viewer mein ek system event dikhta hai ki request aise device se aayi jo configured network device nahi hai. Wording releases ke beech badalti hai, isliye idea dhoondo: unknown NAS ya unknown client address. Switch par timeout ke baad RADIUS server unreachable dikhta hai.</p>
<pre class="out">CPPM&gt; monitoring event-viewer
Time                 Source   Level  Description
10:41:07             RADIUS   WARN   <span class="hl">Request from unknown network device 10.20.99.2 dropped</span>
10:41:17             RADIUS   WARN   Request from unknown network device 10.20.99.2 dropped</pre>
<p>Yeh representative output hai; lab mein exact words thode alag hain, par hint wahi hai: aisa address jo registered device nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch mein 10.30.5.0/24 mein 40 switches hain, sabka secret same. Real product mein 40 entries ki jagah subnet 10.30.5.0/24 ke saath ek network device register kar sakte ho. Trade-off: ab har switch ek secret share karta hai, isliye secret rotate karne ka matlab sabko chhoona. Bahut sites isi wajah se per device ya per site group ek entry pasand karti hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Device ko us address se register karna jis par aap SSH karte ho. Management address aur RADIUS source address alag ho sakte hain (chapter 4). Naam sahi aur IP galat type karna bhi common hai: naam sirf cosmetic hai, sirf IP matter karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass NAD ko uske hostname se dhoondta hai." Galat. Woh RADIUS packet ka source IP Configuration &gt; Network &gt; Devices se match karta hai. Packet ke andar NAS-Identifier attribute sirf information hai, lookup key nahi.</p></div>

<div class="scn"><h4>Chalis switches, ek typo</h4><p>Ek site ne spreadsheet se 40 naye access switches onboard kiye. Unnees chalte the. Ek mein RADIUS server dead dikhta rahta tha. Event Viewer mein unknown device address .41 par khatam hota tha jabki spreadsheet ki row mein .14 tha (digits ulte). Engineer ne network device entry ka address sahi kiya aur switch turant recover ho gaya; switch par koi change nahi chahiye tha.</p><p><b>Seekh:</b> jab batch ka ek device fail ho, log ka address entry se compare karo; ulte digits common hain.</p></div>

<div class="iv"><p class="q">"Kisi bhi service ko dekhne se pehle ClearPass kya check karta hai?"</p><p>Strong answer: packet ka source IP kisi configured network device se match hona chahiye, aur packet us device ke shared secret se verify hona chahiye. Uske baad hi request service mein classify hoti hai. Jodo ki yahan ke failures silent drops hain jo Event Viewer mein log hote hain, Access Tracker rejects nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAD authenticator hai (switch, controller, AP) jo ClearPass ko RADIUS requests bhejta hai.</li>
<li>Real GUI path: Configuration &gt; Network &gt; Devices; lab command configuration network device add hai.</li>
<li>Lookup key packet ka source IP hai, naam nahi; secret per device store hota hai.</li>
<li>Switch ko mirror configuration chahiye: RADIUS host aur key, server group, method globally aur port par on.</li>
<li>Unregistered device chupchaap drop hota hai aur Event Viewer mein dikhta hai.</li>
</ul></div>
`}};export{e as default};