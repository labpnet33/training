var e={id:`troubleshooting`,h:{en:`Troubleshooting control connections: commands, error codes and causes`,hi:`Control connections ka troubleshooting: commands, error codes aur wajahein`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes the temperature, looks at the report and then decides. A control-connection fault is solved in the same way: look at the symptom, read the state and the error code, and the cause usually follows. The aim of this chapter is to give you a routine so that you reach the cause of a fault in a few minutes and not by trial and error.</p>

<h3>The routine</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Control connection troubleshooting routine">
<rect x="10" y="20" width="145" height="75" rx="10" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 State</text><text x="82" y="62" text-anchor="middle" class="svg-muted" font-size="10">show sdwan control</text><text x="82" y="76" text-anchor="middle" class="svg-muted" font-size="10">connections</text>
<rect x="170" y="20" width="145" height="75" rx="10" fill="#fde68a"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 History</text><text x="242" y="62" text-anchor="middle" class="svg-muted" font-size="10">connection-history,</text><text x="242" y="76" text-anchor="middle" class="svg-muted" font-size="10">error codes</text>
<rect x="330" y="20" width="145" height="75" rx="10" fill="#ddd6fe"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Identity</text><text x="402" y="62" text-anchor="middle" class="svg-muted" font-size="10">local-properties,</text><text x="402" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate, org, clock</text>
<rect x="490" y="20" width="140" height="75" rx="10" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Network</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="10">ping, default route,</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">ports, NAT</text>
<path d="M155 57 L170 57 M315 57 L330 57 M475 57 L490 57" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="115" rx="12" fill="#f1f5f9"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Where to run it</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">On the edge: its own view (state, history, local properties).</text><text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="11">On the Validator: show orchestrator connections and the valid list.</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="11">On the Controller and Manager: show control connections, certificate status.</text><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="11">Compare both ends: the error on one side often explains the other.</text>
</svg><p class="cap">State, history, identity, network. Then compare both ends.</p></div>

<h3>The commands</h3>
<table class="cmp"><tr><th>Device</th><th>Command</th><th>What it tells you</th></tr>
<tr><td>Validator</td><td><code>show orchestrator connections</code></td><td>Which devices are connected now</td></tr>
<tr><td>Validator</td><td><code>show orchestrator valid-vedges</code></td><td>The authorised list as the Validator sees it</td></tr>
<tr><td>Controller, Manager</td><td><code>show control connections</code></td><td>Connected peers and states</td></tr>
<tr><td>Controller, Manager</td><td><code>show control connections-history</code></td><td>Past attempts with local and remote errors</td></tr>
<tr><td>Controller, Manager</td><td><code>show control local-properties</code></td><td>Certificate status, organization name, ports</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control connections</code></td><td>Current connections and states</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control connection-history</code></td><td>Past attempts with error codes</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control local-properties</code></td><td>The edge's own certificate and settings</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan certificate serial</code></td><td>The serial number the edge presents</td></tr></table>

<h3>The most common error codes</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning in plain words</th><th>First things to check</th></tr>
<tr><td>DCONFAIL</td><td>The DTLS connection could not be established</td><td>Reachability in VPN 0, default route, DNS for the vbond name, firewall ports, NAT</td></tr>
<tr><td>CRTVERFL</td><td>The certificate could not be verified</td><td>Root CA installed, certificate expired or not yet valid, clock</td></tr>
<tr><td>CRTREJSER</td><td>The peer rejected the challenge, often because the certificate or serial is not accepted</td><td>Serial on the list and valid, list sent to controllers</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name mismatch</td><td>Compare the name on both devices exactly, including case and spaces</td></tr>
<tr><td>BIDNTVRFD</td><td>The board ID could not be verified</td><td>Device authenticity: hardware certificate and root CA chain</td></tr>
<tr><td>VB_TMO, VM_TMO, VS_TMO</td><td>Timeouts towards the Validator, Manager or Controller</td><td>Reachability, firewall, controller load</td></tr>
<tr><td>NOERR</td><td>No error recorded</td><td>Normal for a connection that came up</td></tr></table>
<p>These are the codes most often seen. The full list is long and changes between releases, so the troubleshooting guide for your release is the final reference. What does not change is the method: read the local and the remote error, find the matching cause, fix, then watch the state change.</p>

<h3>Cause by cause</h3>
<p><b>Reachability and ports (DCONFAIL, VB_TMO).</b> From the edge, ping the Validator address in VPN 0, check the default route and that the interface is up. If the vbond is a DNS name, check that it resolves. Then check the firewall for the base port 12346 and the hop ports your TLOCs use, and for TLS if configured.</p>
<p><b>Certificates and the clock (CRTVERFL).</b> Check that the root CA is installed on the device, that the certificate dates are valid, and that the clocks of both ends are right. A router that lost its clock after a power cut will show dates in 1970 or 2000, and every certificate looks not yet valid.</p>
<p><b>The authorised list (CRTREJSER).</b> Check the serial number the edge presents and look for it in the valid list on the Validator. If it is absent, add it on the Manager, set it to valid and send the list.</p>
<p><b>Organization name (CTORGNMMIS).</b> Compare the name in the system block of both devices, and the name inside the certificate subject. A difference of one capital letter or one space is enough.</p>
<p><b>NAT traversal.</b> An edge behind NAT appears to the Validator with a different public address and port than its private ones. This is normal and is handled by the Validator telling the edge its mapped address. Problems arise when both ends are behind a strict (symmetric) NAT or when a firewall blocks the mapped port. The symptoms are that control connections are fine but BFD between two such sites does not come up, and the fix is to review the NAT type, use a colour and TLOC design that allows a direct path, or to give one side a public address.</p>

<div class="eg"><p><b>Reading a case.</b> E-MUM-1 shows the vbond row in connect state and the history shows DCONFAIL. The state says connect, so the network is the suspect. The engineer pings 198.51.100.30 in VPN 0: no reply. The default route in VPN 0 is missing after a DHCP lease expired. He adds a static default route; the state moves to challenge and then up. Total time: four minutes.</p>
<pre class="out">E-MUM-1# ping 198.51.100.30
Sending 5, 100-byte ICMP Echos to 198.51.100.30, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)
E-MUM-1# show ip route 0.0.0.0
% Network not in table
E-MUM-1# show sdwan control connection-history
vbond  198.51.100.30  connect  <span class="hl">DCONFAIL</span>  NOERR</pre></div>

<div class="warn"><p><b>Common mistakes.</b> Changing configuration before reading the history; checking only one end; assuming a certificate problem when the state is connect; forgetting to send the list after a Manager change; blaming the cloud service when the first hop is the branch firewall.</p></div>

<div class="exam"><p><b>Exam traps.</b> DCONFAIL is about the connection itself, not about identity. CTORGNMMIS means organization names differ. CRTVERFL is about verifying the certificate (root, dates, clock). CRTREJSER is the peer rejecting the challenge, so look at the authorised list. States and codes together locate the cause.</p></div>

<div class="scn"><h4>Fifty branches, one error</h4><p>After a firewall upgrade, fifty branches lost their control connections at 03:00. The dashboard showed all red. On three edges the history showed the same code, DCONFAIL, and all had been working until the firewall change. The network team compared the old and new rule sets and found that the hop range of ports had been replaced by 12346 alone. Adding the range restored the connections within minutes; no change on any controller was needed.</p><p><b>Lesson:</b> one code on many devices points to one shared cause. Look for what changed.</p></div>

<div class="iv"><p class="q">"An edge cannot establish control connections. How do you troubleshoot?"</p><p>Strong answer: read the state and the connection history on the edge. If it is stuck in connect, check VPN 0 reachability, DNS, the default route and firewall ports. If it reaches challenge or fails verification, check the certificate and root CA, the clock, the organization name and the authorised list. Read the local and remote error codes, compare with the Validator, then fix one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, history, identity, then network, comparing both ends.</li>
<li>DCONFAIL: reachability and ports. CRTVERFL: certificate, root, clock.</li>
<li>CRTREJSER: authorised list. CTORGNMMIS: organization name.</li>
<li>Stuck in connect points to the network; stuck at challenge points to identity.</li>
<li>One error on many devices means one shared cause: find what changed.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh poochhti hai ki dard kahan hai, temperature leti hai, report dekhti hai aur phir faisla karti hai. Control-connection fault bhi isi tarah suljhta hai: symptom dekho, state aur error code padho, aur wajah aam taur par saamne aa jaati hai. Is chapter ka maqsad aapko ek routine dena hai taaki aap kuch minute mein fault ki wajah tak pahunchein, trial and error se nahi.</p>

<h3>Routine</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Control connection troubleshooting routine">
<rect x="10" y="20" width="145" height="75" rx="10" fill="#bae6fd"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 State</text><text x="82" y="62" text-anchor="middle" class="svg-muted" font-size="10">show sdwan control</text><text x="82" y="76" text-anchor="middle" class="svg-muted" font-size="10">connections</text>
<rect x="170" y="20" width="145" height="75" rx="10" fill="#fde68a"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 History</text><text x="242" y="62" text-anchor="middle" class="svg-muted" font-size="10">connection-history,</text><text x="242" y="76" text-anchor="middle" class="svg-muted" font-size="10">error codes</text>
<rect x="330" y="20" width="145" height="75" rx="10" fill="#ddd6fe"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Identity</text><text x="402" y="62" text-anchor="middle" class="svg-muted" font-size="10">local-properties,</text><text x="402" y="76" text-anchor="middle" class="svg-muted" font-size="10">certificate, org, clock</text>
<rect x="490" y="20" width="140" height="75" rx="10" fill="#bbf7d0"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Network</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="10">ping, default route,</text><text x="560" y="76" text-anchor="middle" class="svg-muted" font-size="10">ports, NAT</text>
<path d="M155 57 L170 57 M315 57 L330 57 M475 57 L490 57" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="580" height="115" rx="12" fill="#f1f5f9"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">Kahan chalana hai</text><text x="320" y="168" text-anchor="middle" class="svg-muted" font-size="11">Edge par: uska apna view (state, history, local properties).</text><text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="11">Validator par: show orchestrator connections aur valid list.</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="11">Controller aur Manager par: show control connections, certificate status.</text><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="11">Dono ends compare karo: ek side ka error aksar doosri ko samjha deta hai.</text>
</svg><p class="cap">State, history, identity, network. Phir dono ends compare karo.</p></div>

<h3>Commands</h3>
<table class="cmp"><tr><th>Device</th><th>Command</th><th>Kya batata hai</th></tr>
<tr><td>Validator</td><td><code>show orchestrator connections</code></td><td>Abhi kaunse devices connected hain</td></tr>
<tr><td>Validator</td><td><code>show orchestrator valid-vedges</code></td><td>Validator ko dikhne wali authorised list</td></tr>
<tr><td>Controller, Manager</td><td><code>show control connections</code></td><td>Connected peers aur states</td></tr>
<tr><td>Controller, Manager</td><td><code>show control connections-history</code></td><td>Local aur remote errors ke saath pichhli koshishein</td></tr>
<tr><td>Controller, Manager</td><td><code>show control local-properties</code></td><td>Certificate status, organization name, ports</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control connections</code></td><td>Maujooda connections aur states</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control connection-history</code></td><td>Error codes ke saath pichhli koshishein</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan control local-properties</code></td><td>Edge ka apna certificate aur settings</td></tr>
<tr><td>WAN edge</td><td><code>show sdwan certificate serial</code></td><td>Edge jo serial number pesh karta hai</td></tr></table>

<h3>Sabse aam error codes</h3>
<table class="cmp"><tr><th>Code</th><th>Saadi bhasha mein matlab</th><th>Pehle kya dekhein</th></tr>
<tr><td>DCONFAIL</td><td>DTLS connection ban nahi paya</td><td>VPN 0 mein reachability, default route, vbond name ka DNS, firewall ports, NAT</td></tr>
<tr><td>CRTVERFL</td><td>Certificate verify nahi ho paya</td><td>Root CA installed, certificate expired ya abhi valid nahi, clock</td></tr>
<tr><td>CRTREJSER</td><td>Peer ne challenge reject kiya, aksar kyunki certificate ya serial accept nahi</td><td>Serial list mein aur valid, list controllers ko bheji</td></tr>
<tr><td>CTORGNMMIS</td><td>Organization name mismatch</td><td>Dono devices par naam bilkul compare karo, case aur spaces samet</td></tr>
<tr><td>BIDNTVRFD</td><td>Board ID verify nahi ho paya</td><td>Device ki authenticity: hardware certificate aur root CA chain</td></tr>
<tr><td>VB_TMO, VM_TMO, VS_TMO</td><td>Validator, Manager ya Controller ki taraf timeouts</td><td>Reachability, firewall, controller load</td></tr>
<tr><td>NOERR</td><td>Koi error record nahi</td><td>Jo connection up aaya uske liye normal</td></tr></table>
<p>Yeh woh codes hain jo sabse zyada dikhte hain. Poori list lambi hai aur releases ke beech badalti hai, isliye aapki release ki troubleshooting guide antim reference hai. Jo nahi badalta woh tareeka hai: local aur remote error padho, milti hui wajah dhoondho, theek karo, phir state badalte dekho.</p>

<h3>Wajah ke hisaab se</h3>
<p><b>Reachability aur ports (DCONFAIL, VB_TMO).</b> Edge se VPN 0 mein Validator address ko ping karo, default route aur interface ke up hone ko check karo. Agar vbond DNS name hai to check karo ki woh resolve hota hai. Phir firewall mein base port 12346 aur woh hop ports jo aapke TLOCs use karte hain, aur configured ho to TLS ke liye check karo.</p>
<p><b>Certificates aur clock (CRTVERFL).</b> Check karo ki device par root CA installed hai, certificate dates valid hain, aur dono ends ke clocks sahi hain. Power cut ke baad clock kho dene wala router 1970 ya 2000 ki dates dikhayega, aur har certificate abhi valid nahi lagega.</p>
<p><b>Authorised list (CRTREJSER).</b> Edge jo serial number pesh karta hai use dekho aur Validator par valid list mein dhoondho. Agar absent hai to Manager par jodo, valid set karo aur list bhejo.</p>
<p><b>Organization name (CTORGNMMIS).</b> Dono devices ke system block ka naam aur certificate subject ke andar ka naam compare karo. Ek capital letter ya ek space ka fark kaafi hai.</p>
<p><b>NAT traversal.</b> NAT ke peeche edge Validator ko apne private addresses aur ports se alag public address aur port ke saath dikhta hai. Yeh normal hai aur Validator edge ko uska mapped address batakar sambhal leta hai. Problem tab hoti hai jab dono ends strict (symmetric) NAT ke peeche hon ya firewall mapped port ko block kare. Symptoms yeh hote hain ki control connections theek hain par aise do sites ke beech BFD up nahi aata, aur fix hai NAT type ko review karna, aisa colour aur TLOC design use karna jo direct path allow kare, ya ek side ko public address dena.</p>

<div class="eg"><p><b>Case padhna.</b> E-MUM-1 vbond row ko connect state mein dikhata hai aur history DCONFAIL dikhati hai. State connect kehti hai, isliye shak network par hai. Engineer VPN 0 mein 198.51.100.30 ko ping karta hai: jawab nahi. DHCP lease expire hone ke baad VPN 0 ka default route gayab hai. Woh static default route jodta hai; state challenge aur phir up ho jaati hai. Kul samay: chaar minute.</p>
<pre class="out">E-MUM-1# ping 198.51.100.30
Sending 5, 100-byte ICMP Echos to 198.51.100.30, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)
E-MUM-1# show ip route 0.0.0.0
% Network not in table
E-MUM-1# show sdwan control connection-history
vbond  198.51.100.30  connect  <span class="hl">DCONFAIL</span>  NOERR</pre></div>

<div class="warn"><p><b>Common mistakes.</b> History padhne se pehle configuration badalna; sirf ek end check karna; state connect hone par certificate problem maan lena; Manager change ke baad list bhejna bhoolna; jab pehla hop branch firewall ho tab cloud service ko dosh dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> DCONFAIL connection ke baare mein hai, identity ke baare mein nahi. CTORGNMMIS ka matlab organization names alag hain. CRTVERFL certificate verify karne (root, dates, clock) ke baare mein hai. CRTREJSER peer ka challenge reject karna hai, isliye authorised list dekho. States aur codes milkar wajah batate hain.</p></div>

<div class="scn"><h4>Pachaas branches, ek error</h4><p>Firewall upgrade ke baad pachaas branches ne 03:00 par apne control connections kho diye. Dashboard poora laal dikha raha tha. Teen edges par history mein wahi code dikha, DCONFAIL, aur sab firewall change tak theek chal rahe the. Network team ne purane aur naye rule sets compare kiye aur paya ki ports ki hop range ko sirf 12346 se badal diya gaya tha. Range jodne se connections kuch minute mein wapas aa gaye; kisi controller par koi badlav nahi chahiye tha.</p><p><b>Seekh:</b> bahut devices par ek code ek saajha wajah ki taraf ishaara karta hai. Dhoondho ki kya badla.</p></div>

<div class="iv"><p class="q">"Ek edge control connections nahi bana pa raha. Troubleshoot kaise karoge?"</p><p>Strong answer: edge par state aur connection history padho. Agar woh connect mein atka hai to VPN 0 reachability, DNS, default route aur firewall ports check karo. Agar woh challenge tak pahunchta hai ya verification fail hota hai to certificate aur root CA, clock, organization name aur authorised list check karo. Local aur remote error codes padho, Validator se compare karo, phir ek ek cheez theek karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: state, history, identity, phir network, dono ends compare karte hue.</li>
<li>DCONFAIL: reachability aur ports. CRTVERFL: certificate, root, clock.</li>
<li>CRTREJSER: authorised list. CTORGNMMIS: organization name.</li>
<li>Connect mein atkna network ki taraf; challenge par atkna identity ki taraf.</li>
<li>Bahut devices par ek error matlab ek saajha wajah: dhoondho kya badla.</li>
</ul></div>
`}};export{e as default};