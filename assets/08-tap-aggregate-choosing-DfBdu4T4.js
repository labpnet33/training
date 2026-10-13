var e={id:`tap-aggregate-choosing`,h:{en:`Tap, aggregate ethernet and choosing the mode`,hi:`Tap, aggregate ethernet aur mode chunna`},body:{en:`
<p><b>Analogy: a security camera versus a gate.</b> A gate (Layer 3, Layer 2, virtual wire) can stop people. A camera (tap) only watches and reports. And a wide gate made of several lanes (aggregate ethernet) is still one gate, just with more capacity.</p>

<div class="warn"><p><b>Simulator note.</b> Tap mode and aggregate ethernet are not simulated in NK-OS. The blocks here are a <b>Reference configuration (not run in the simulator)</b>. There is no lab; for runnable L3 practice use pan-setup, and for VLAN switching use ccna-vlans.</p></div>

<h3>Tap mode</h3>
<p>A tap interface receives a copy of traffic from a switch SPAN or mirror port. The firewall sees traffic, logs applications and threats, but <b>cannot block anything</b>, because the real packets never pass through it.</p>
<pre class="code">set network interface ethernet ethernet1/7 tap
set zone tap-zone network tap ethernet1/7
set rulebase security rules Tap-Visibility from tap-zone to tap-zone source any destination any application any service application-default action allow
commit</pre>
<p>Use it for a proof of concept: put it on a mirror port to learn which applications run before enforcing anything. Rules in tap mode only drive logging, and actions such as deny have no effect on the live traffic.</p>

<h3>Aggregate ethernet (AE)</h3>
<p>An aggregate group bundles several physical links into one logical interface using LACP or a static bundle. It gives more bandwidth and survives a single link failing. The aggregate interface then acts as a parent: it can be Layer 3, Layer 2 or virtual wire, and Layer 3 aggregates can have subinterfaces with tags exactly as in chapter 3.</p>
<pre class="code">set network interface aggregate-ethernet ae1 layer3 units ae1.10 tag 10 ip 10.10.10.1/24
set network interface ethernet ethernet1/3 aggregate-group ae1
set network interface ethernet ethernet1/4 aggregate-group ae1
set zone users network layer3 ae1.10
commit</pre>
<p>The switch side needs a matching port-channel. Tagging, zones and policy do not change; only the parent changed from one port to a bundle. You can recognise this in the interface list: the earlier simulator output showed <code>aggregation groups: 0</code>, meaning none were configured.</p>

<h3>Choosing the mode</h3>
<table>
<tr><th>Need</th><th>Mode</th></tr>
<tr><td>Route between VLANs and enforce policy</td><td>Layer 3 subinterfaces</td></tr>
<tr><td>Insert the firewall without changing addressing, no firewall IP</td><td>Virtual wire</td></tr>
<tr><td>Firewall acts as the switch, inspect inside a VLAN</td><td>Layer 2 with VLAN object</td></tr>
<tr><td>Visibility only, via a mirror port</td><td>Tap</td></tr>
<tr><td>More bandwidth and link redundancy</td><td>Aggregate ethernet (any of the above on top)</td></tr>
<tr><td>VPN, DHCP, NAT to the internet</td><td>Layer 3</td></tr>
</table>
<p>Only the first row can be practised in the simulator. That is deliberate: Layer 3 subinterfaces are what most PAN-OS exam questions and most real deployments centre on.</p>

<div class="eg"><p><b>Worked example.</b> A hospital wants to see what runs on its medical VLAN without any risk of breaking it. Step 1: tap on a SPAN port for two weeks. Step 2: use the application list to write rules. Step 3: move to virtual wire inline to enforce, with no IP changes. Step 4: later migrate to Layer 3 subinterfaces if routing between VLANs is needed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting tap mode to block. Mixing interface types inside one zone. Forgetting the matching port-channel mode on the switch. Choosing a mode because it is easy to cable rather than because of the requirement.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tap cannot block; its rules only log. Virtual wire cannot route. Layer 3 is the only mode that routes and terminates VPNs and DHCP.</p></div>

<div class="scn"><h4>The deny that did nothing</h4><p>A team put a firewall in tap mode and wrote a deny rule for a risky application. Logs showed the rule hit but the application kept working, because the live traffic never passed through the firewall. They needed an inline mode.</p><p><b>Lesson:</b> enforcement requires an inline mode.</p></div>

<div class="iv"><p class="q">"What does the firewall do in tap mode, and what can't it do?"</p><p>It receives a mirrored copy of traffic, so it can identify applications, users and threats and log them. It cannot block, rate-limit or modify the real traffic, because that traffic does not flow through it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tap is visibility only; it cannot block.</li>
<li>Aggregate ethernet bundles links and acts as a parent for L3, L2 or virtual wire.</li>
<li>Choose the mode by requirement: route, insert, switch, observe.</li>
<li>Only Layer 3 subinterfaces are runnable in the simulator.</li>
<li>Tap and AE commands here are reference only.</li>
</ul></div>
`,hi:`
<p><b>Analogy: security camera versus gate.</b> Gate (Layer 3, Layer 2, virtual wire) logon ko rok sakta hai. Camera (tap) sirf dekhta aur report karta hai. Aur kai lanes ka bana chauda gate (aggregate ethernet) abhi bhi ek hi gate hai, bas capacity zyada.</p>

<div class="warn"><p><b>Simulator note.</b> Tap mode aur aggregate ethernet NK-OS mein simulate nahi hote. Yahan ke blocks <b>Reference configuration (not run in the simulator)</b> hain. Koi lab nahi hai; chalne wali L3 practice ke liye pan-setup aur VLAN switching ke liye ccna-vlans.</p></div>

<h3>Tap mode</h3>
<p>Tap interface switch ke SPAN ya mirror port se traffic ki copy receive karta hai. Firewall traffic dekhta hai, applications aur threats log karta hai, lekin <b>kuch block nahi kar sakta</b>, kyunki asli packets uske through nahi guzarte.</p>
<pre class="code">set network interface ethernet ethernet1/7 tap
set zone tap-zone network tap ethernet1/7
set rulebase security rules Tap-Visibility from tap-zone to tap-zone source any destination any application any service application-default action allow
commit</pre>
<p>Proof of concept ke liye use karo: mirror port par lagao aur enforce karne se pehle seekho kaun si applications chalti hain. Tap mode mein rules sirf logging chalate hain, aur deny jaise actions ka live traffic par koi asar nahi hota.</p>

<h3>Aggregate ethernet (AE)</h3>
<p>Aggregate group kai physical links ko LACP ya static bundle se ek logical interface mein bundle karta hai. Zyada bandwidth milti hai aur ek link fail hone par bhi chalta hai. Aggregate interface phir parent ki tarah kaam karta hai: woh Layer 3, Layer 2 ya virtual wire ho sakta hai, aur Layer 3 aggregates par chapter 3 ki tarah tag wale subinterfaces ho sakte hain.</p>
<pre class="code">set network interface aggregate-ethernet ae1 layer3 units ae1.10 tag 10 ip 10.10.10.1/24
set network interface ethernet ethernet1/3 aggregate-group ae1
set network interface ethernet ethernet1/4 aggregate-group ae1
set zone users network layer3 ae1.10
commit</pre>
<p>Switch side par matching port-channel chahiye. Tagging, zones aur policy nahi badalte; sirf parent ek port se bundle ban gaya. Interface list mein pehchaan sakte ho: pehle ke simulator output mein <code>aggregation groups: 0</code> tha, yaani koi configured nahi.</p>

<h3>Mode chunna</h3>
<table>
<tr><th>Zaroorat</th><th>Mode</th></tr>
<tr><td>VLANs ke beech route karna aur policy lagana</td><td>Layer 3 subinterfaces</td></tr>
<tr><td>Addressing badle bina firewall daalna, firewall IP nahi</td><td>Virtual wire</td></tr>
<tr><td>Firewall switch ki tarah, VLAN ke andar inspect</td><td>Layer 2 with VLAN object</td></tr>
<tr><td>Sirf visibility, mirror port se</td><td>Tap</td></tr>
<tr><td>Zyada bandwidth aur link redundancy</td><td>Aggregate ethernet (upar ke kisi par bhi)</td></tr>
<tr><td>VPN, DHCP, internet ke liye NAT</td><td>Layer 3</td></tr>
</table>
<p>Simulator mein sirf pehli row ki practice ho sakti hai. Yeh jaanbujhkar hai: Layer 3 subinterfaces par zyadatar PAN-OS exam sawal aur asli deployments tike hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital apni medical VLAN par kya chalta hai dekhna chahta hai bina kuch todne ke risk ke. Step 1: do hafte SPAN port par tap. Step 2: application list se rules likho. Step 3: enforce karne ke liye virtual wire inline, IP changes ke bina. Step 4: baad mein VLANs ke beech routing chahiye to Layer 3 subinterfaces par jao.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Tap mode se blocking ki ummeed. Ek zone mein alag interface types milana. Switch par matching port-channel mode bhool jaana. Mode isliye chunna ki cable karna aasaan hai, requirement ke hisaab se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tap block nahi kar sakta; uske rules sirf log karte hain. Virtual wire route nahi kar sakta. Layer 3 hi akela mode hai jo route karta hai aur VPN aur DHCP terminate karta hai.</p></div>

<div class="scn"><h4>Deny jisne kuch nahi kiya</h4><p>Ek team ne firewall ko tap mode mein lagaya aur risky application ke liye deny rule likha. Logs mein rule hit dikha lekin application chalti rahi, kyunki live traffic firewall se guzra hi nahi. Unhe inline mode chahiye tha.</p><p><b>Lesson:</b> enforcement ke liye inline mode chahiye.</p></div>

<div class="iv"><p class="q">"Tap mode mein firewall kya karta hai aur kya nahi kar sakta?"</p><p>Woh traffic ki mirror copy receive karta hai, to applications, users aur threats pehchaan kar log kar sakta hai. Woh asli traffic ko block, rate-limit ya modify nahi kar sakta, kyunki woh uske through nahi behta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tap sirf visibility hai; block nahi kar sakta.</li>
<li>Aggregate ethernet links bundle karta hai aur L3, L2 ya virtual wire ka parent banta hai.</li>
<li>Mode requirement se chuno: route, insert, switch, observe.</li>
<li>Simulator mein sirf Layer 3 subinterfaces chalte hain.</li>
<li>Tap aur AE commands yahan sirf reference hain.</li>
</ul></div>
`}};export{e as default};