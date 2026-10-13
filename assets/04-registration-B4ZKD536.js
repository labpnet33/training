var e={id:`registration`,h:{en:`Registering a device: manager add, key and NAT ID`,hi:`Device register karna: manager add, key aur NAT ID`},body:{en:`
<p>Registering a firewall to the Management Center is like pairing a new phone with a smartwatch. Both devices are told about each other, both are given the same one-time code, and once the code matches they build a private, trusted link. After that the code is never needed again. In Threat Defense the one-time code is the <b>registration key</b>, the "phone number" is the manager address or a <b>NAT ID</b>, and the private link is the <b>sftunnel</b>.</p>

<h3>Step 1: day-0 on the device</h3>
<p>A new Threat Defense boots into a setup wizard on the console (or a first SSH session to the management interface). You accept the licence agreement, set the admin password, give the <b>management interface</b> an address, gateway and DNS, choose routed or transparent firewall mode, and answer "manage the device locally?" with <b>no</b> when a Management Center will manage it. The same values can be set later on the CLI:</p>
<pre class="code"><span class="c">! management address for the lab device (documentation range)</span>
&gt; configure network ipv4 manual 192.0.2.10 255.255.255.0 192.0.2.1
<span class="c">! tell the device who its manager is and the shared one-time key</span>
&gt; configure manager add fmc.nwk.lab Nk-Reg-2026
Manager successfully configured.
Please make note of reg_key as this will be required while adding Device in FMC.</pre>

<h3>Step 2: add the device in the Management Center</h3>
<p>On a real Management Center: <b>Devices → Device Management → Add → Device</b>. The dialog asks for:</p>
<dl class="terms">
<dt>Host</dt><dd>The device's management address (192.0.2.10), or blank if the device is behind NAT and you use a NAT ID.</dd>
<dt>Display Name</dt><dd>The name you will see in the manager, for example NK-FTD.</dd>
<dt>Registration Key</dt><dd>The same one-time key typed on the device (Nk-Reg-2026). It only authenticates the registration.</dd>
<dt>Access Control Policy</dt><dd>Mandatory: a device always has exactly one access control policy. The lab device was registered with <b>NK-ACP</b>, whose default action is Block All Traffic.</dd>
<dt>Smart Licensing</dt><dd>Which feature licences to assign: IPS, Malware Defense, URL. Essentials is always included.</dd>
<dt>Unique NAT ID</dt><dd>An extra one-time identifier, required when either side cannot reach or does not know the other's address.</dd>
</dl>
<p>With cdFMC, Security Cloud Control generates the complete <code>configure manager add</code> line for you to paste, or onboards the device by serial number with zero-touch provisioning.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Registration over the sftunnel">
<rect x="20" y="60" width="170" height="70" rx="8" fill="#fed7aa"/><text x="105" y="86" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="12">mgmt 192.0.2.10</text>
<rect x="450" y="60" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="14">Management Center</text><text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="12">fmc.nwk.lab</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="13">sftunnel TCP 8305 (TLS)</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">either side can open it</text>
<text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">key Nk-Reg-2026</text><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">key Nk-Reg-2026</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Keys (and NAT IDs, if used) must match exactly</text>
</svg><p class="cap">Registration: both sides know the key; the sftunnel on TCP 8305 carries policy down and events up.</p></div>

<h3>Step 3: the sftunnel and what it carries</h3>
<p>After the key is accepted, the two sides exchange certificates and build the <b>sftunnel</b>, a TLS-protected channel on <b>TCP 8305</b>. Either side can initiate it, which is why only one side needs to know the other's address. Through it the manager sends policy, updates and licences, and the device sends events and health data. From now on the registration key plays no role.</p>

<h3>When you need a NAT ID</h3>
<p>If the firewall sits behind NAT (or gets its management address by DHCP), the Management Center cannot reach it at a fixed address. Then the device initiates the tunnel, and both sides need a matching NAT ID so the manager can recognise which pending device is knocking:</p>
<pre class="code"><span class="c">! manager address known, device address unknown: give a NAT ID on both sides</span>
&gt; configure manager add fmc.nwk.lab Nk-Reg-2026 BRANCH17
<span class="c">! manager address also unknown (manager behind NAT): DONTRESOLVE</span>
&gt; configure manager add DONTRESOLVE Nk-Reg-2026 BRANCH17</pre>
<p>With <code>DONTRESOLVE</code> the device waits for the manager to connect, so the Host field in the manager must then contain the device address. At least one side must be reachable.</p>

<h3>Verification</h3>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : fmc.nwk.lab
Display name              : fmc.nwk.lab
Version                   : 7.6.0
<span class="hl">Registration              : Completed</span>
Management type           : Configuration</pre>
<p>Before the manager side is completed you would see <code>Registration : Pending</code>. On real devices <code>sftunnel-status-brief</code> shows whether the tunnel is up. In the lab, NK-FTD is already registered, so <code>show managers</code> and <code>show version</code> are your checks.</p>

<div class="eg"><p><b>Worked example.</b> Branch 17 gets its management address by DHCP from a home-office router doing NAT. The manager has a public, fixed address. On the device: <code>configure manager add fmc.example Br17-Key BRANCH17</code>. In the Management Center: Host left blank, Registration Key Br17-Key, Unique NAT ID BRANCH17. The device opens TCP 8305 to the manager, presents the NAT ID, the manager matches it to the pending entry, and registration completes.</p></div>

<div class="warn"><p><b>Common mistake.</b> A firewall between the device and the manager that permits only TCP 443. Registration hangs at Pending because TCP 8305 is blocked. Other classic causes: a typo in the key or NAT ID (they are case sensitive), a manager older than the device, and wrong time or DNS on the device.</p></div>

<div class="exam"><p><b>Exam trap.</b> The registration key is used once, only to authenticate the registration; it does not encrypt the tunnel. The sftunnel uses TCP 8305. The NAT ID is needed when one side cannot reach the other, and both sides must enter the same value.</p></div>

<div class="scn"><h4>The branch stuck at Pending</h4><p>A new branch firewall showed <code>Registration : Pending</code> for two hours. The engineer could ping the manager from the management interface, so routing was fine. A capture on the head-office edge firewall showed SYNs to TCP 8305 being dropped by an old rule that only allowed TCP 443 from branches. After a rule for TCP 8305 between the branch management subnet and the manager was added, registration completed within a minute.</p><p><b>Lesson:</b> ping proves the path, not the port; the sftunnel needs TCP 8305 end to end.</p></div>

<div class="iv"><p class="q">"Walk me through registering a Threat Defense to a Management Center."</p><p>On the device: set the management address, then <code>configure manager add &lt;manager&gt; &lt;reg_key&gt; [nat_id]</code>. In the manager: Devices, Device Management, Add Device, with host, display name, the same key, an access control policy and licences. They build the sftunnel on TCP 8305, either side can initiate. Mention the NAT ID and DONTRESOLVE for NAT cases, and verify with <code>show managers</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>configure manager add &lt;host | DONTRESOLVE&gt; &lt;reg_key&gt; [nat_id]</code> on the device.</li>
<li>In the manager: Devices, Device Management, Add Device, with the same key and an access control policy.</li>
<li>The sftunnel runs on TCP 8305 and can be opened by either side.</li>
<li>Use a NAT ID when one side is behind NAT or has an unknown address.</li>
<li>Verify with <code>show managers</code>: Registration Completed.</li>
</ul></div>
`,hi:`
<p>Firewall ko Management Center mein register karna naye phone ko smartwatch ke saath pair karne jaisa hai. Dono devices ko ek doosre ke baare mein bataya jaata hai, dono ko same one-time code diya jaata hai, aur code match hote hi woh ek private, trusted link bana lete hain. Uske baad code ki kabhi zaroorat nahi padti. Threat Defense mein one-time code <b>registration key</b> hai, "phone number" manager address ya <b>NAT ID</b> hai, aur private link <b>sftunnel</b> hai.</p>

<h3>Step 1: device par day-0</h3>
<p>Naya Threat Defense console par (ya management interface par pehle SSH session mein) setup wizard mein boot hota hai. Aap licence agreement accept karte ho, admin password set karte ho, <b>management interface</b> ko address, gateway aur DNS dete ho, routed ya transparent firewall mode chunte ho, aur "device ko locally manage karein?" ka jawab <b>no</b> dete ho jab Management Center use manage karega. Yahi values baad mein CLI par bhi set ho sakti hain:</p>
<pre class="code"><span class="c">! lab device ka management address (documentation range)</span>
&gt; configure network ipv4 manual 192.0.2.10 255.255.255.0 192.0.2.1
<span class="c">! device ko batao uska manager kaun hai aur shared one-time key</span>
&gt; configure manager add fmc.nwk.lab Nk-Reg-2026
Manager successfully configured.
Please make note of reg_key as this will be required while adding Device in FMC.</pre>

<h3>Step 2: Management Center mein device add karo</h3>
<p>Real Management Center par: <b>Devices → Device Management → Add → Device</b>. Dialog yeh maangta hai:</p>
<dl class="terms">
<dt>Host</dt><dd>Device ka management address (192.0.2.10), ya khaali agar device NAT ke peeche hai aur aap NAT ID use karte ho.</dd>
<dt>Display Name</dt><dd>Woh naam jo aapko manager mein dikhega, jaise NK-FTD.</dd>
<dt>Registration Key</dt><dd>Wahi one-time key jo device par type ki gayi (Nk-Reg-2026). Yeh sirf registration ko authenticate karti hai.</dd>
<dt>Access Control Policy</dt><dd>Mandatory: device ke paas hamesha bilkul ek access control policy hoti hai. Lab device <b>NK-ACP</b> ke saath register hua tha, jiska default action Block All Traffic hai.</dd>
<dt>Smart Licensing</dt><dd>Kaunse feature licences assign karne hain: IPS, Malware Defense, URL. Essentials hamesha included hai.</dd>
<dt>Unique NAT ID</dt><dd>Ek extra one-time identifier, tab zaroori jab koi side doosri ka address reach nahi kar sakti ya jaanti nahi.</dd>
</dl>
<p>cdFMC ke saath, Security Cloud Control aapke paste karne ke liye poori <code>configure manager add</code> line bana deta hai, ya device ko serial number se zero-touch provisioning ke saath onboard karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Registration over the sftunnel">
<rect x="20" y="60" width="170" height="70" rx="8" fill="#fed7aa"/><text x="105" y="86" text-anchor="middle" class="svg-ink" font-size="14">NK-FTD</text><text x="105" y="106" text-anchor="middle" class="svg-muted" font-size="12">mgmt 192.0.2.10</text>
<rect x="450" y="60" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="86" text-anchor="middle" class="svg-ink" font-size="14">Management Center</text><text x="535" y="106" text-anchor="middle" class="svg-muted" font-size="12">fmc.nwk.lab</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="13">sftunnel TCP 8305 (TLS)</text>
<text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">koi bhi side khol sakti hai</text>
<text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">key Nk-Reg-2026</text><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">key Nk-Reg-2026</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Keys (aur NAT IDs, agar use hon) bilkul match hone chahiye</text>
</svg><p class="cap">Registration: dono sides key jaanti hain; TCP 8305 par sftunnel policy neeche aur events upar le jaata hai.</p></div>

<h3>Step 3: sftunnel aur woh kya le jaata hai</h3>
<p>Key accept hone ke baad dono sides certificates exchange karti hain aur <b>sftunnel</b> banati hain, <b>TCP 8305</b> par TLS-protected channel. Koi bhi side ise initiate kar sakti hai, isi wajah se sirf ek side ko doosri ka address pata hona chahiye. Iske through manager policy, updates aur licences bhejta hai, aur device events aur health data bhejta hai. Ab se registration key ka koi role nahi.</p>

<h3>NAT ID kab chahiye</h3>
<p>Agar firewall NAT ke peeche hai (ya management address DHCP se leta hai), to Management Center use fixed address par reach nahi kar sakta. Tab device tunnel initiate karta hai, aur dono sides ko matching NAT ID chahiye taaki manager pehchaan sake ki kaunsa pending device darwaza khatkhata raha hai:</p>
<pre class="code"><span class="c">! manager address pata hai, device address nahi: dono sides par NAT ID do</span>
&gt; configure manager add fmc.nwk.lab Nk-Reg-2026 BRANCH17
<span class="c">! manager address bhi pata nahi (manager NAT ke peeche): DONTRESOLVE</span>
&gt; configure manager add DONTRESOLVE Nk-Reg-2026 BRANCH17</pre>
<p><code>DONTRESOLVE</code> ke saath device manager ke connect hone ka intezaar karta hai, isliye manager ke Host field mein tab device address hona chahiye. Kam se kam ek side reachable honi chahiye.</p>

<h3>Verification</h3>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : fmc.nwk.lab
Display name              : fmc.nwk.lab
Version                   : 7.6.0
<span class="hl">Registration              : Completed</span>
Management type           : Configuration</pre>
<p>Manager side complete hone se pehle aapko <code>Registration : Pending</code> dikhta. Real devices par <code>sftunnel-status-brief</code> dikhata hai ki tunnel up hai ya nahi. Lab mein NK-FTD pehle se registered hai, isliye <code>show managers</code> aur <code>show version</code> aapke checks hain.</p>

<div class="eg"><p><b>Worked example.</b> Branch 17 apna management address NAT karne wale home-office router se DHCP se leti hai. Manager ka public, fixed address hai. Device par: <code>configure manager add fmc.example Br17-Key BRANCH17</code>. Management Center mein: Host khaali, Registration Key Br17-Key, Unique NAT ID BRANCH17. Device manager ki taraf TCP 8305 kholta hai, NAT ID dikhata hai, manager use pending entry se match karta hai, aur registration complete ho jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Device aur manager ke beech ek firewall jo sirf TCP 443 permit karta hai. Registration Pending par atak jaata hai kyunki TCP 8305 blocked hai. Doosre classic causes: key ya NAT ID mein typo (yeh case sensitive hain), device se purana manager, aur device par galat time ya DNS.</p></div>

<div class="exam"><p><b>Exam trap.</b> Registration key ek baar use hoti hai, sirf registration authenticate karne ke liye; yeh tunnel encrypt nahi karti. sftunnel TCP 8305 use karta hai. NAT ID tab chahiye jab ek side doosri tak nahi pahunch sakti, aur dono sides ko same value daalni hoti hai.</p></div>

<div class="scn"><h4>Pending par atki branch</h4><p>Ek nayi branch firewall do ghante tak <code>Registration : Pending</code> dikhati rahi. Engineer management interface se manager ko ping kar pa raha tha, isliye routing theek thi. Head-office edge firewall par capture ne dikhaya ki TCP 8305 ke SYNs ek purani rule se drop ho rahe the jo branches se sirf TCP 443 allow karti thi. Branch management subnet aur manager ke beech TCP 8305 ki rule jodne ke baad registration ek minute mein complete ho gaya.</p><p><b>Seekh:</b> ping path saabit karta hai, port nahi; sftunnel ko end to end TCP 8305 chahiye.</p></div>

<div class="iv"><p class="q">"Threat Defense ko Management Center mein register karne ka process samjhao."</p><p>Device par: management address set karo, phir <code>configure manager add &lt;manager&gt; &lt;reg_key&gt; [nat_id]</code>. Manager mein: Devices, Device Management, Add Device, host, display name, same key, ek access control policy aur licences ke saath. Dono TCP 8305 par sftunnel banate hain, koi bhi side initiate kar sakti hai. NAT cases ke liye NAT ID aur DONTRESOLVE mention karo, aur <code>show managers</code> se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device par <code>configure manager add &lt;host | DONTRESOLVE&gt; &lt;reg_key&gt; [nat_id]</code>.</li>
<li>Manager mein: Devices, Device Management, Add Device, same key aur ek access control policy ke saath.</li>
<li>sftunnel TCP 8305 par chalta hai aur koi bhi side use khol sakti hai.</li>
<li>Jab ek side NAT ke peeche ho ya address unknown ho, NAT ID use karo.</li>
<li><code>show managers</code> se verify karo: Registration Completed.</li>
</ul></div>
`}};export{e as default};