var e={id:`scope`,h:{en:`Scopes, exclusions, reservations, lease time and options (Lab 1)`,hi:`Scopes, exclusions, reservations, lease time aur options (Lab 1)`},body:{en:`
<p>Think of a car park attendant with a book of numbered parking bays. Some bays are painted "Reserved: Director" and always go to the same car. Some are blocked off for the fire engine and are never handed out. The rest go to whoever arrives first, for a fixed number of hours. The attendant also hands every driver a leaflet with the exit route and the nearest fuel station. A DHCP server works the same way: <b>scope</b>, <b>reservations</b>, <b>exclusions</b>, <b>lease time</b> and <b>options</b>.</p>

<h3>The building blocks of a DHCP server</h3>
<dl class="terms">
<dt>Scope (called a pool on Cisco IOS)</dt><dd>The range of addresses for one subnet, plus the settings handed out with them. One subnet or VLAN needs one scope.</dd>
<dt>Exclusion</dt><dd>Addresses inside the subnet that the server must never hand out, because they are used by statically configured devices: the gateway, servers, printers, switches, access points.</dd>
<dt>Reservation</dt><dd>A permanent mapping of one address to one client, identified by its MAC address or client identifier. The device still uses DHCP, but always receives the same address.</dd>
<dt>Lease time</dt><dd>How long a client may keep the address before it must renew.</dd>
<dt>Options</dt><dd>Extra settings delivered with the address, each with a number.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Scope layout">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">.1 - .20</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">excluded</text>
<rect x="140" y="30" width="490" height="50" rx="8" fill="#bbf7d0"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="13">.21 - .254 dynamic pool</text><text x="385" y="70" text-anchor="middle" class="svg-muted" font-size="12">leased first come, first served</text>
<rect x="200" y="88" width="110" height="32" rx="8" fill="#fde68a"/><text x="255" y="109" text-anchor="middle" class="svg-ink" font-size="12">.50 reserved</text>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Scope 192.168.10.0/24, gateway .1, DNS .1</text>
</svg><p class="cap">One scope: an excluded block for static devices, a dynamic range, and a reservation for the printer.</p></div>

<h3>DHCP options you must know</h3>
<table class="cmp"><tr><th>Option</th><th>Name</th><th>Used for</th></tr>
<tr><td>1</td><td>Subnet mask</td><td>The mask of the leased address</td></tr>
<tr><td>3</td><td>Router</td><td>The default gateway</td></tr>
<tr><td>6</td><td>DNS servers</td><td>Where the client sends name queries</td></tr>
<tr><td>15</td><td>Domain name</td><td>Suffix added to short names (<code>nwk.lab</code>)</td></tr>
<tr><td>42</td><td>NTP servers</td><td>Time sources</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>For example, telling access points where their controller is</td></tr>
<tr><td>51</td><td>Lease time</td><td>How long the lease lasts</td></tr>
<tr><td>66 / 67</td><td>TFTP server / boot file</td><td>Network booting (PXE) and IP phones</td></tr>
</table>

<h3>Choosing the lease time</h3>
<p>A long lease (days) means less DHCP traffic and stable addresses, but addresses of devices that left are stuck until the lease expires. A short lease (an hour or two) recycles addresses quickly, which suits guest Wi-Fi or a busy café where hundreds of phones come and go. A classic outage: a guest network with a /24 scope and an 8-day lease fills up in two days, and new visitors get nothing.</p>

<h3>Lab 1: make R1 the DHCP server</h3>
<p>In the lab, the office LAN is <code>192.168.10.0/24</code> and R1 Gi0/0 is <code>192.168.10.1</code>. Addresses .1 to .20 are kept for static devices. Here is the full configuration with an explanation of every line.</p>
<pre class="code"><span class="c">! 1. Keep .1 - .20 for static devices (configure exclusions BEFORE the pool)</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
<span class="c">! 2. Create the pool (scope) for the LAN</span>
ip dhcp pool LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 192.168.10.1
<span class="c">! optional extras you would add in production</span>
 domain-name nwk.lab
 lease 0 8
<span class="c">!   lease days hours: here 8 hours</span></pre>
<p>The lab only checks the exclusion, the network, the gateway and the DNS server. The <code>domain-name</code> and <code>lease</code> lines are shown so you know the syntax; the default lease on IOS is one day.</p>
<p>On each PC run <code>ip dhcp</code> and then <code>show ip</code>. Both PCs must receive an address above .20.</p>

<h3>Verification on the server</h3>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
<span class="hl">192.168.10.21       0100.5079.6668.01       Mar 03 2026 09:02 AM    Automatic</span>
192.168.10.22       0100.5079.6668.02       Mar 03 2026 09:03 AM    Automatic

R1# show ip dhcp pool
Pool LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 <span class="hl">Leased addresses               : 2</span>
 Excluded addresses             : 20
 Pending event                  : none</pre>
<p>The first address handed out is .21, because .1 to .20 are excluded. The Client-ID starts with <code>01</code> (meaning Ethernet) followed by the MAC address.</p>

<h3>Making a reservation</h3>
<p>Reserve an address for a network printer so its address never changes but it is still managed centrally:</p>
<pre class="code">ip dhcp pool PRINTER
 host 192.168.10.50 255.255.255.0
 client-identifier 0100.5079.6668.50
 default-router 192.168.10.1
 dns-server 192.168.10.1</pre>
<p>On Windows Server or a firewall GUI you do the same thing by right-clicking the lease and choosing "Add to reservation".</p>

<div class="eg"><p><b>Worked example: is the pool big enough?</b> A /24 has 254 usable addresses. Excluding 20 leaves <b>234</b> for clients. The office has 60 staff, each with a laptop and a phone on the same VLAN, plus 30 visitors a day: 150 devices. The pool is big enough. If the company grows to 150 staff (300 devices), 234 is too small: either shorten the lease, split phones into another VLAN, or use a larger subnet such as a /23.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting exclusions, so DHCP hands the gateway's address to a laptop and causes an IP conflict. (2) A wrong <code>default-router</code>: clients get addresses and can reach local devices, but nothing beyond the subnet. (3) The <code>network</code> statement does not match the interface subnet, so the server has no pool for Discovers arriving on that interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exclusion vs reservation: an <b>exclusion</b> removes addresses from the pool; a <b>reservation</b> always gives one specific client the same address. A device with a static IP needs an exclusion; a device that should always get the same IP by DHCP needs a reservation.</p></div>

<div class="scn"><h4>The printer that "moved"</h4><p>Every few weeks the finance printer stopped working for everyone. The printer used DHCP, and after a power cut it came back with a new address, while all PCs still pointed to the old one. The engineer created a reservation for the printer's MAC address. From then on the printer always received <code>192.168.10.50</code>, and the ticket never came back.</p><p><b>Lesson:</b> shared devices such as printers, cameras and access points need a predictable address: either a static address inside the excluded range or a DHCP reservation.</p></div>

<div class="iv"><p class="q">"What is the difference between a DHCP exclusion and a reservation, and when would you use each?"</p><p>Strong answer: an exclusion stops the server offering certain addresses at all, which protects statically configured devices such as the gateway and servers. A reservation binds one address to one client MAC or client ID, so the device keeps using DHCP (and gets new options automatically) but always receives the same address. Give a real example: exclude .1 to .20 for infrastructure, reserve .50 for the printer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A scope (pool) covers one subnet: address range, gateway, DNS, lease time and options.</li>
<li>Exclusions protect static addresses; reservations give one client the same address every time.</li>
<li>Key options: 3 router, 6 DNS, 15 domain name, 42 NTP, 43 vendor, 51 lease, 66/67 boot.</li>
<li>Short leases suit busy guest networks; long leases suit stable wired desks.</li>
<li>Verify with <code>show ip dhcp binding</code> and <code>show ip dhcp pool</code>.</li>
</ul></div>
`,hi:`
<p>Ek car park attendant socho jiske paas numbered parking bays ki ek book hai. Kuch bays par likha hai "Reserved: Director" aur woh hamesha same car ko jaate hain. Kuch fire engine ke liye block hain aur kabhi nahi diye jaate. Baaki jo pehle aaye use milte hain, fixed ghanton ke liye. Attendant har driver ko exit route aur nazdeeki petrol pump wala ek leaflet bhi deta hai. DHCP server bhi aise hi kaam karta hai: <b>scope</b>, <b>reservations</b>, <b>exclusions</b>, <b>lease time</b> aur <b>options</b>.</p>

<h3>DHCP server ke building blocks</h3>
<dl class="terms">
<dt>Scope (Cisco IOS par pool kehte hain)</dt><dd>Ek subnet ke addresses ki range, aur unke saath diye jaane wale settings. Ek subnet ya VLAN ko ek scope chahiye.</dd>
<dt>Exclusion</dt><dd>Subnet ke andar ke woh addresses jo server ko kabhi nahi dene chahiye, kyunki woh statically configured devices use karte hain: gateway, servers, printers, switches, access points.</dd>
<dt>Reservation</dt><dd>Ek address ki ek client se permanent mapping, jo uske MAC address ya client identifier se pehchaana jaata hai. Device abhi bhi DHCP use karta hai, lekin hamesha same address paata hai.</dd>
<dt>Lease time</dt><dd>Client kitni der tak address rakh sakta hai iske pehle ki use renew karna pade.</dd>
<dt>Options</dt><dd>Address ke saath diye jaane wale extra settings, har ek ka ek number hota hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Scope layout">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="52" text-anchor="middle" class="svg-ink" font-size="13">.1 - .20</text><text x="70" y="70" text-anchor="middle" class="svg-muted" font-size="12">excluded</text>
<rect x="140" y="30" width="490" height="50" rx="8" fill="#bbf7d0"/><text x="385" y="52" text-anchor="middle" class="svg-ink" font-size="13">.21 - .254 dynamic pool</text><text x="385" y="70" text-anchor="middle" class="svg-muted" font-size="12">jo pehle aaye use pehle lease</text>
<rect x="200" y="88" width="110" height="32" rx="8" fill="#fde68a"/><text x="255" y="109" text-anchor="middle" class="svg-ink" font-size="12">.50 reserved</text>
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Scope 192.168.10.0/24, gateway .1, DNS .1</text>
</svg><p class="cap">Ek scope: static devices ke liye excluded block, ek dynamic range, aur printer ke liye reservation.</p></div>

<h3>DHCP options jo pata hone chahiye</h3>
<table class="cmp"><tr><th>Option</th><th>Naam</th><th>Kis kaam ke liye</th></tr>
<tr><td>1</td><td>Subnet mask</td><td>Leased address ka mask</td></tr>
<tr><td>3</td><td>Router</td><td>Default gateway</td></tr>
<tr><td>6</td><td>DNS servers</td><td>Client name queries kahan bhejta hai</td></tr>
<tr><td>15</td><td>Domain name</td><td>Short names ke saath juda suffix (<code>nwk.lab</code>)</td></tr>
<tr><td>42</td><td>NTP servers</td><td>Time sources</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>Jaise access points ko batana ki unka controller kahan hai</td></tr>
<tr><td>51</td><td>Lease time</td><td>Lease kitni der chalti hai</td></tr>
<tr><td>66 / 67</td><td>TFTP server / boot file</td><td>Network booting (PXE) aur IP phones</td></tr>
</table>

<h3>Lease time chunna</h3>
<p>Lambi lease (kai din) ka matlab kam DHCP traffic aur stable addresses, lekin jo devices chale gaye unke addresses lease expire hone tak atke rehte hain. Chhoti lease (ek do ghante) addresses jaldi recycle karti hai, jo guest Wi-Fi ya busy café ke liye theek hai jahan sainkdon phones aate jaate hain. Ek classic outage: /24 scope aur 8 din ki lease wala guest network do din mein bhar jaata hai, aur naye visitors ko kuch nahi milta.</p>

<h3>Lab 1: R1 ko DHCP server banao</h3>
<p>Lab mein office LAN <code>192.168.10.0/24</code> hai aur R1 Gi0/0 <code>192.168.10.1</code> hai. Addresses .1 se .20 static devices ke liye rakhe gaye hain. Yeh poori configuration hai, har line ki explanation ke saath.</p>
<pre class="code"><span class="c">! 1. .1 - .20 static devices ke liye rakho (exclusions pool SE PEHLE configure karo)</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
<span class="c">! 2. LAN ke liye pool (scope) banao</span>
ip dhcp pool LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 192.168.10.1
<span class="c">! optional extras jo aap production mein add karoge</span>
 domain-name nwk.lab
 lease 0 8
<span class="c">!   lease days hours: yahan 8 ghante</span></pre>
<p>Lab sirf exclusion, network, gateway aur DNS server check karta hai. <code>domain-name</code> aur <code>lease</code> lines isliye dikhayi hain taaki aapko syntax pata ho; IOS par default lease ek din hai.</p>
<p>Har PC par <code>ip dhcp</code> aur phir <code>show ip</code> chalao. Dono PCs ko .20 se upar ka address milna chahiye.</p>

<h3>Server par verification</h3>
<pre class="out">R1# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type
                    Hardware address/
                    User name
<span class="hl">192.168.10.21       0100.5079.6668.01       Mar 03 2026 09:02 AM    Automatic</span>
192.168.10.22       0100.5079.6668.02       Mar 03 2026 09:03 AM    Automatic

R1# show ip dhcp pool
Pool LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
 <span class="hl">Leased addresses               : 2</span>
 Excluded addresses             : 20
 Pending event                  : none</pre>
<p>Pehla diya gaya address .21 hai, kyunki .1 se .20 excluded hain. Client-ID <code>01</code> (matlab Ethernet) se shuru hota hai aur uske baad MAC address aata hai.</p>

<h3>Reservation banana</h3>
<p>Network printer ke liye address reserve karo taaki uska address kabhi na badle lekin woh phir bhi centrally manage ho:</p>
<pre class="code">ip dhcp pool PRINTER
 host 192.168.10.50 255.255.255.0
 client-identifier 0100.5079.6668.50
 default-router 192.168.10.1
 dns-server 192.168.10.1</pre>
<p>Windows Server ya firewall GUI par aap yahi kaam lease par right-click karke "Add to reservation" chunkar karte ho.</p>

<div class="eg"><p><b>Worked example: kya pool kaafi bada hai?</b> /24 mein 254 usable addresses hain. 20 exclude karne ke baad clients ke liye <b>234</b> bachte hain. Office mein 60 staff hain, har ek ka laptop aur phone same VLAN par, plus roz 30 visitors: 150 devices. Pool kaafi bada hai. Agar company 150 staff (300 devices) tak badh jaaye, to 234 chhota hai: ya to lease chhoti karo, phones ko doosre VLAN mein daalo, ya /23 jaisa bada subnet use karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Exclusions bhool jaana, jisse DHCP gateway ka address kisi laptop ko de deta hai aur IP conflict hota hai. (2) Galat <code>default-router</code>: clients ko addresses milte hain aur local devices tak pahunch jaate hain, lekin subnet ke bahar kuch nahi. (3) <code>network</code> statement interface subnet se match nahi karta, to us interface par aane wale Discovers ke liye server ke paas koi pool nahi hota.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exclusion vs reservation: <b>exclusion</b> addresses ko pool se hata deta hai; <b>reservation</b> ek specific client ko hamesha same address deta hai. Static IP wale device ko exclusion chahiye; jo device hamesha DHCP se same IP paaye use reservation chahiye.</p></div>

<div class="scn"><h4>Printer jo "shift" ho gaya</h4><p>Har kuch hafton mein finance printer sabke liye kaam karna band kar deta tha. Printer DHCP use karta tha, aur power cut ke baad naye address ke saath wapas aata tha, jabki saare PCs abhi bhi purane address ko point karte the. Engineer ne printer ke MAC address ke liye reservation banayi. Uske baad se printer ko hamesha <code>192.168.10.50</code> mila, aur ticket kabhi wapas nahi aaya.</p><p><b>Seekh:</b> printers, cameras aur access points jaise shared devices ko predictable address chahiye: ya to excluded range ke andar static address ya DHCP reservation.</p></div>

<div class="iv"><p class="q">"DHCP exclusion aur reservation mein kya farak hai, aur aap har ek kab use karoge?"</p><p>Strong answer: exclusion server ko kuch addresses offer karne se hi rok deta hai, jo gateway aur servers jaise statically configured devices ko bachata hai. Reservation ek address ko ek client MAC ya client ID se baandhta hai, to device DHCP use karta rehta hai (aur naye options apne aap paata hai) lekin hamesha same address paata hai. Real example do: infrastructure ke liye .1 se .20 exclude karo, printer ke liye .50 reserve karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope (pool) ek subnet cover karta hai: address range, gateway, DNS, lease time aur options.</li>
<li>Exclusions static addresses ko bachate hain; reservations ek client ko har baar same address dete hain.</li>
<li>Key options: 3 router, 6 DNS, 15 domain name, 42 NTP, 43 vendor, 51 lease, 66/67 boot.</li>
<li>Chhoti leases busy guest networks ke liye; lambi leases stable wired desks ke liye.</li>
<li><code>show ip dhcp binding</code> aur <code>show ip dhcp pool</code> se verify karo.</li>
</ul></div>
`}};export{e as default};