var e={id:`managed-devices-registration`,h:{en:`Managed devices, serial numbers and registration`,hi:`Managed devices, serial numbers aur registration`},body:{en:`
<p>Think of a hostel with a guest register. A visitor arrives at the gate and says "I am here to stay". The warden checks the register: is this person's name written there? If the name is not in the register the visitor is not let in, however polite they are. Similarly, a firewall that announces itself to Panorama is accepted only if Panorama has its serial number in the list of managed devices. Both sides must agree: the firewall must know whom to call, and Panorama must know who is allowed to call.</p>

<h3>Serial number: the device identity</h3>
<p>Every firewall has a unique <b>serial number</b>. Panorama uses it as the identity of a managed device, not the hostname and not the IP address, because names and addresses can change. You read the serial number on the firewall with <code>show system info</code>. In the simulator the serial is derived from the device name; in real life it comes from the hardware or the virtual machine's licence record.</p>
<pre class="code"><span class="c">! on the firewall (operational mode)</span>
&gt; show system info
hostname: NK-PUNE-PA
ip-address: 192.0.2.11
serial: 0079185321121
sw-version: 11.1.4 (NK-OS educational simulator)</pre>

<h3>The two halves of onboarding</h3>
<p>Onboarding a firewall under Panorama has exactly two configuration halves, plus a connection that results from them.</p>
<table class="tbl"><tr><th>Where</th><th>What you set</th><th>Meaning</th></tr>
<tr><td>On the firewall</td><td>Panorama server address (and optionally a second one)</td><td>"Whom do I call?"</td></tr>
<tr><td>On Panorama</td><td>The firewall's serial number in the managed devices list</td><td>"Who may call me?"</td></tr>
<tr><td>Network</td><td>Management IP reachability, same subnet or gateways</td><td>"Can the call physically get through?"</td></tr>
</table>
<p>Reference configuration (shape of the commands; see the lab for exact practice):</p>
<pre class="code"><span class="c">! on the firewall</span>
configure
set deviceconfig system panorama-server &lt;panorama-ip&gt;
commit

<span class="c">! on Panorama</span>
configure
set mgt-config devices &lt;serial&gt;
commit</pre>
<p>Notice that the firewall commit makes the firewall start calling, and the Panorama commit makes Panorama accept the call. Order does not matter, but both commits are needed.</p>

<h3>Adding a managed device to groups</h3>
<p>Being registered makes a firewall <i>managed</i>; it does not yet say what configuration it receives. For that you place its serial number in a device group and a template stack:</p>
<pre class="code">set device-group NK-BRANCHES devices &lt;serial&gt;
set template-stack NK-STACK devices &lt;serial&gt;
commit</pre>
<p>A firewall can be connected but in no group. It then shows Connected: yes with empty Device group and Template stack columns, and there is nothing to push to it. This is a normal intermediate state, and chapter 6 shows how to read it.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Registration handshake">
<rect x="20" y="40" width="200" height="80" rx="8" fill="#bae6fd"/><text x="120" y="70" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="120" y="90" text-anchor="middle" class="svg-muted" font-size="12">panorama-server 192.0.2.50</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">serial 0079185321121</text>
<rect x="420" y="40" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text><text x="520" y="90" text-anchor="middle" class="svg-muted" font-size="12">managed devices list</text><text x="520" y="108" text-anchor="middle" class="svg-muted" font-size="12">contains that serial?</text>
<line x1="220" y1="80" x2="420" y2="80" stroke="#64748b" stroke-width="3"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">TCP 3978</text>
</svg><p class="cap">The firewall calls; Panorama checks its list. Both settings are needed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying the serial number with a typo (one wrong digit means "unknown device"); registering the hostname instead of the serial; configuring only one side and waiting; forgetting to commit on one of the two devices. Real onboarding may involve additional steps such as licensing and authentication keys; check the documentation for your PAN-OS version. The simulator does not model them.</p></div>

<div class="scn"><h4>The firewall that was cloned</h4><p>A team cloned a virtual firewall for a new site and forgot that the clone needed its own identity. Two devices with one identity cannot be managed reliably. The fix was to give the clone its proper identity before onboarding.</p><p><b>Lesson:</b> the serial number is the identity; treat it as such and never reuse it.</p></div>

<div class="iv"><p class="q">"How do you bring a new firewall under Panorama?"</p><p>On the firewall set the Panorama server address and commit. On Panorama add the firewall's serial number as a managed device and commit. Make sure the management networks can reach each other. Then add the firewall to a device group and template stack and verify it shows Connected.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The serial number is the identity of a managed device.</li>
<li>Two halves: panorama-server on the firewall, serial in managed devices on Panorama.</li>
<li>Both devices need a commit; the network path must exist too.</li>
<li>Managed is not the same as in a device group or template stack.</li>
<li>Read the serial with show system info.</li>
</ul></div>
`,hi:`
<p>Socho ek hostel guest register ke saath. Visitor gate par aata hai aur kehta hai "main yahan rukne aaya hoon". Warden register check karta hai: kya is insaan ka naam yahan likha hai? Naam register mein nahi hai to visitor andar nahi jata, chahe kitna bhi politely bole. Isi tarah jo firewall Panorama ko apna aana batata hai wo tabhi accept hota hai jab Panorama ki managed devices list mein uska serial number ho. Dono taraf agree hona chahiye: firewall ko pata ho kise call karna hai, aur Panorama ko pata ho kaun call kar sakta hai.</p>

<h3>Serial number: device ki identity</h3>
<p>Har firewall ka ek unique <b>serial number</b> hota hai. Panorama managed device ki identity ke liye serial use karta hai, hostname ya IP address nahi, kyunki names aur addresses badal sakte hain. Serial number firewall par <code>show system info</code> se padhte hain. Simulator mein serial device name se derive hota hai; real life mein ye hardware ya virtual machine ke licence record se aata hai.</p>
<pre class="code"><span class="c">! firewall par (operational mode)</span>
&gt; show system info
hostname: NK-PUNE-PA
ip-address: 192.0.2.11
serial: 0079185321121
sw-version: 11.1.4 (NK-OS educational simulator)</pre>

<h3>Onboarding ke do halves</h3>
<p>Firewall ko Panorama ke under onboard karne mein bilkul do configuration halves hote hain, aur unse bana ek connection.</p>
<table class="tbl"><tr><th>Kahan</th><th>Kya set karte ho</th><th>Matlab</th></tr>
<tr><td>Firewall par</td><td>Panorama server address (aur optionally doosra)</td><td>"Main kise call karoon?"</td></tr>
<tr><td>Panorama par</td><td>Managed devices list mein firewall ka serial number</td><td>"Mujhe kaun call kar sakta hai?"</td></tr>
<tr><td>Network</td><td>Management IP reachability, same subnet ya gateways</td><td>"Kya call physically pahunch sakti hai?"</td></tr>
</table>
<p>Reference configuration (commands ka shape; exact practice lab mein):</p>
<pre class="code"><span class="c">! firewall par</span>
configure
set deviceconfig system panorama-server &lt;panorama-ip&gt;
commit

<span class="c">! Panorama par</span>
configure
set mgt-config devices &lt;serial&gt;
commit</pre>
<p>Dhyan do ki firewall ka commit firewall ko call karna shuru karwata hai, aur Panorama ka commit Panorama ko call accept karwata hai. Order matter nahi karta par dono commits chahiye.</p>

<h3>Managed device ko groups mein jodna</h3>
<p>Registered hone se firewall <i>managed</i> ho jata hai; isse ye nahi pata chalta ki use kaun si configuration milegi. Uske liye uska serial number device group aur template stack mein rakhte ho:</p>
<pre class="code">set device-group NK-BRANCHES devices &lt;serial&gt;
set template-stack NK-STACK devices &lt;serial&gt;
commit</pre>
<p>Firewall connected ho sakta hai par kisi group mein nahi. Tab wo Connected: yes dikhata hai aur Device group aur Template stack columns khaali hote hain, aur push karne ke liye kuch nahi hota. Ye normal intermediate state hai, aur chapter 6 isse padhna sikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Registration handshake">
<rect x="20" y="40" width="200" height="80" rx="8" fill="#bae6fd"/><text x="120" y="70" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="120" y="90" text-anchor="middle" class="svg-muted" font-size="12">panorama-server 192.0.2.50</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">serial 0079185321121</text>
<rect x="420" y="40" width="200" height="80" rx="8" fill="#ddd6fe"/><text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text><text x="520" y="90" text-anchor="middle" class="svg-muted" font-size="12">managed devices list</text><text x="520" y="108" text-anchor="middle" class="svg-muted" font-size="12">kya ye serial hai?</text>
<line x1="220" y1="80" x2="420" y2="80" stroke="#64748b" stroke-width="3"/><text x="320" y="70" text-anchor="middle" class="svg-accent" font-size="12">TCP 3978</text>
</svg><p class="cap">Firewall call karta hai; Panorama apni list check karta hai. Dono settings chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Serial number typo ke saath copy karna (ek galat digit ka matlab "unknown device"); serial ke bajay hostname register karna; sirf ek side configure karke wait karna; dono mein se ek device par commit bhool jana. Real onboarding mein licensing aur authentication keys jaise extra steps ho sakte hain; apne PAN-OS version ki documentation check karo. Simulator unhe model nahi karta.</p></div>

<div class="scn"><h4>Clone kiya hua firewall</h4><p>Ek team ne naye site ke liye virtual firewall clone kiya aur bhool gayi ki clone ko apni identity chahiye. Ek identity wale do devices reliably manage nahi ho sakte. Fix ye tha ki onboarding se pehle clone ko uski proper identity di jaye.</p><p><b>Lesson:</b> serial number hi identity hai; use waisa hi maano aur kabhi reuse mat karo.</p></div>

<div class="iv"><p class="q">"Naye firewall ko Panorama ke under kaise laate ho?"</p><p>Firewall par Panorama server address set karke commit. Panorama par firewall ka serial number managed device mein jodkar commit. Dekho ki management networks ek doosre tak pahunch sakte hain. Phir firewall ko device group aur template stack mein jodo aur verify karo ki Connected dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Serial number managed device ki identity hai.</li>
<li>Do halves: firewall par panorama-server, Panorama par managed devices mein serial.</li>
<li>Dono devices par commit chahiye; network path bhi hona chahiye.</li>
<li>Managed hona device group ya template stack mein hone jaisa nahi hai.</li>
<li>Serial show system info se padho.</li>
</ul></div>
`}};export{e as default};