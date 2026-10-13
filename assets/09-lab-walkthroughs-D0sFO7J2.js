var e={id:`lab-walkthroughs`,h:{en:`Lab walkthroughs: discovery, management trunk and country profile`,hi:`Lab walkthroughs: discovery, management trunk aur country profile`},body:{en:`
<h3>How to use this chapter</h3>
<p>Each of the three labs in this module is a <b>troubleshooting</b> lab: the network is built, something is broken, and you must find it with evidence and repair it on the correct device. For every lab this chapter gives the ticket, the evidence commands, how to read the output, the fix and the proof. Try the lab first without reading the fix, then compare. The device prompt shows which device you are on. The output layouts below are representative of the platform and the lab; your exact addresses and MACs may differ.</p>

<h3>Lab 1: wl-ap-discovery (APs stay in discovery)</h3>
<p><b>Ticket:</b> WLC1 is configured and answers pings. AP1 and AP2 never register. They are in VLAN 10, the controller is in VLAN 99.</p>
<p><b>Step 1: prove the controller is healthy and no AP is registered.</b></p>
<pre class="code">WLC1# show ap summary</pre>
<pre class="out">Number of APs: 0</pre>
<p>Zero APs means the control plane has not formed. The controller itself is fine (its management interface answers pings), so the missing information must be on the AP side. The APs are in another subnet, so broadcast cannot work. Ask: what tells an AP the controller address? The DHCP server for the AP VLAN is R1.</p>
<p><b>Step 2: inspect the DHCP pool on R1.</b></p>
<pre class="code">R1# show running-config | section dhcp</pre>
<pre class="out">ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
<span class="hl"> (no option 43 line)</span></pre>
<p><b>Step 3: repair on R1 and renew leases.</b></p>
<pre class="code">R1# configure terminal
R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
R1(dhcp-config)# end

AP1# ip dhcp
AP2# ip dhcp</pre>
<p>Waiting for the lease to expire could take many hours, so you renew on both APs. After roughly a minute:</p>
<pre class="code">WLC1# show ap summary</pre>
<pre class="out">Number of APs: 2
AP Name  ...  IP Address     State
<span class="hl">AP1      ...  10.10.10.21    Registered</span>
<span class="hl">AP2      ...  10.10.10.22    Registered</span></pre>
<p><b>Proof:</b> both APs Registered and they learned the controller through DHCP. Important: you changed R1 only. Never "fix" this by moving the controller to VLAN 10 or giving the APs static controller addresses: that treats the symptom and breaks the design.</p>

<h3>Lab 2: wl-mgmt-trunk (APs drop after a switch clean-up)</h3>
<p><b>Ticket:</b> a port clean-up on SW1 and all APs vanished. WLC1 and R1 are known good.</p>
<p><b>Step 1: test the gateway from the controller.</b></p>
<pre class="code">WLC1# ping 10.10.99.1</pre>
<pre class="out">Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.99.1, timeout is 2 seconds:
<span class="hl">.....</span>
Success rate is 0 percent (0/5)</pre>
<p>The controller cannot reach its own gateway. The gateway lives on R1, the controller's SVI is up, so the problem is between WLC1 and R1: the SW1 trunk. </p>
<p><b>Step 2: read the trunk on SW1.</b></p>
<pre class="code">SW1# show interfaces trunk</pre>
<pre class="out">Port        Vlans allowed on trunk
<span class="hl">Gi0/1       20,40</span></pre>
<p><b>Step 3: repair on SW1 only.</b></p>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk allowed vlan add 99
SW1(config-if)# end</pre>
<pre class="code">WLC1# ping 10.10.99.1
WLC1# show ap summary
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20</pre>
<p><b>Proof:</b> the ping now succeeds, both APs return to Registered (give them about a minute) and LAPTOP1 is again in VLAN 20 with access to the RADIUS server at 10.10.60.20. Notice that the APs were never changed; they simply needed the road to be restored.</p>

<h3>Lab 3: wl-country-profile (radios off after a site-tag rollout)</h3>
<p><b>Ticket:</b> site tag ST-CAMPUS with AP profile AP-PROF-US applied to all APs. They are registered but LAPTOP1 sees no SSID. The business is in India.</p>
<p><b>Step 1: compare the countries.</b></p>
<pre class="code">WLC1# show wireless country configured
WLC1# show ap summary</pre>
<pre class="out">Configured Country............................: IN - India
...
AP Name  ...  Country  IP Address    State
AP1      ...  <span class="hl">US</span>       10.10.10.21   Registered
AP2      ...  <span class="hl">US</span>       10.10.10.22   Registered</pre>
<p>The AP country is US but the allowed list holds only IN, so the radios stay off. Two possible fixes exist: widen the list or correct the AP profile. The ticket forbids the first (the business must keep only IN), and it would also be wrong in the real world.</p>
<p><b>Step 2: repair the profile.</b></p>
<pre class="code">WLC1# configure terminal
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# end</pre>
<p><b>Proof:</b> show ap summary now says IN, the radios turn on, LAPTOP1 sees NK-STAFF and <code>wifi status</code> shows VLAN 20. The controller list is still just IN.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three labs">
<rect x="10" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-ap-discovery</text><text x="105" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP learns controller</text><text x="105" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: R1 option 43</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-mgmt-trunk</text><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP reaches controller</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: SW1 allowed vlan</text>
<rect x="440" y="30" width="190" height="90" rx="8" fill="#fde68a"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-country-profile</text><text x="535" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP may transmit</text><text x="535" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: AP profile country</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Know it, reach it, be allowed to radiate: three steps, three devices</text>
</svg><p class="cap">Each lab breaks one step of the chain, on a different device.</p></div>

<div class="eg"><p><b>Worked example: which device owns the repair?</b> Discovery fault: R1 (the DHCP server). Trunk fault: SW1 (the switch trunk). Country fault: WLC1 (the AP profile). The labs always check that you repaired the right owner and did not disturb the others.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring the controller when the evidence points to R1 or SW1. (2) Forgetting to renew AP leases in the discovery lab. (3) Typing <code>allowed vlan 99</code> and wiping VLANs 20 and 40. (4) Fixing the country by adding US to the controller list.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lab tasks check the final state and often a verification step (ping, wifi status). Run the proof commands even if the fix seems obvious.</p></div>

<div class="scn"><h4>Three tickets in one morning</h4><p>A new engineer received three tickets: APs not joining at the Pune branch, APs gone after a switch change in Chennai, and no SSID after a rollout in Mumbai. By reading <code>show ap summary</code> first on each, she found zero APs in the first two and registered APs in the third. That split the work: first two were reachability problems (one discovery, one path), the third was a policy problem (country). She fixed all three in under an hour.</p><p><b>Lesson:</b> one command, show ap summary, tells you which layer you are on.</p></div>

<div class="iv"><p class="q">"Give me an example of a fault you fixed on the wireless control plane."</p><p>Use the STAR pattern with one of these labs: APs in discovery, found no option 43 on the AP DHCP pool, added f104 plus the controller IP, renewed leases, confirmed Registered. Say how you proved the owner of the fault with evidence before changing anything.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Lab 1: <b>Monitoring &gt; Wireless &gt; Access Points</b> for the AP state, <b>Administration &gt; Management &gt; Save Configuration</b> to save. Lab 2: <b>Troubleshooting &gt; Ping</b> and <b>Configuration &gt; Interface &gt; Ethernet</b> for the trunk; the switch side stays CLI on SW1. Lab 3: <b>Configuration &gt; Wireless &gt; Global</b> for the controller country list and <b>Configuration &gt; Tags &amp; Profiles &gt; AP Join</b>, edit the profile, for the AP country.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery fault: fix option 43 on R1, then renew the AP leases.</li>
<li>Path fault: ping the gateway from WLC1, read the SW1 trunk, add VLAN 99 with allowed vlan add.</li>
<li>Country fault: compare show ap summary with show wireless country configured and repair the AP profile.</li>
<li>Always repair on the owning device and prove the result with show ap summary and wifi status.</li>
</ul></div>
`,hi:`
<h3>Is chapter ko kaise use karein</h3>
<p>Is module ke teeno labs <b>troubleshooting</b> labs hain: network build hai, kuch toota hua hai, aur aapko evidence se dhundna aur sahi device par repair karna hai. Har lab ke liye yeh chapter ticket, evidence commands, output kaise padhna hai, fix aur proof deta hai. Pehle lab bina fix padhe try karo, phir compare karo. Device prompt batata hai ki aap kis device par ho. Neeche ke output layouts platform aur lab ke representative hain; aapke exact addresses aur MACs alag ho sakte hain.</p>

<h3>Lab 1: wl-ap-discovery (APs discovery mein atke hain)</h3>
<p><b>Ticket:</b> WLC1 configured hai aur ping ka jawab deta hai. AP1 aur AP2 kabhi register nahi hote. Woh VLAN 10 mein hain, controller VLAN 99 mein.</p>
<p><b>Step 1: prove karo controller healthy hai aur koi AP registered nahi.</b></p>
<pre class="code">WLC1# show ap summary</pre>
<pre class="out">Number of APs: 0</pre>
<p>Zero APs ka matlab control plane bana hi nahi. Controller khud theek hai (uska management interface ping ka jawab deta hai), isliye missing information AP side par honi chahiye. APs doosre subnet mein hain, isliye broadcast kaam nahi kar sakta. Poochho: AP ko controller address kaun batata hai? AP VLAN ka DHCP server R1 hai.</p>
<p><b>Step 2: R1 par DHCP pool inspect karo.</b></p>
<pre class="code">R1# show running-config | section dhcp</pre>
<pre class="out">ip dhcp pool AP-POOL
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
<span class="hl"> (no option 43 line)</span></pre>
<p><b>Step 3: R1 par repair karo aur leases renew karo.</b></p>
<pre class="code">R1# configure terminal
R1(config)# ip dhcp pool AP-POOL
R1(dhcp-config)# option 43 hex f104.0a0a.630a
R1(dhcp-config)# end

AP1# ip dhcp
AP2# ip dhcp</pre>
<p>Lease expire hone ka intezaar karne mein kai ghante lag sakte hain, isliye dono APs par renew karte ho. Lagbhag ek minute baad:</p>
<pre class="code">WLC1# show ap summary</pre>
<pre class="out">Number of APs: 2
AP Name  ...  IP Address     State
<span class="hl">AP1      ...  10.10.10.21    Registered</span>
<span class="hl">AP2      ...  10.10.10.22    Registered</span></pre>
<p><b>Proof:</b> dono APs Registered hain aur unhone controller DHCP se seekha. Zaroori: aapne sirf R1 badla. Isse "fix" kabhi mat karo ki controller ko VLAN 10 mein le jao ya APs ko static controller addresses do: yeh symptom ko treat karta hai aur design tod deta hai.</p>

<h3>Lab 2: wl-mgmt-trunk (switch clean-up ke baad APs gir gaye)</h3>
<p><b>Ticket:</b> SW1 par port clean-up ke baad saare APs gayab ho gaye. WLC1 aur R1 known good hain.</p>
<p><b>Step 1: controller se gateway test karo.</b></p>
<pre class="code">WLC1# ping 10.10.99.1</pre>
<pre class="out">Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.99.1, timeout is 2 seconds:
<span class="hl">.....</span>
Success rate is 0 percent (0/5)</pre>
<p>Controller apne gateway tak nahi pahunch sakta. Gateway R1 par hai, controller ka SVI up hai, isliye problem WLC1 aur R1 ke beech hai: SW1 trunk.</p>
<p><b>Step 2: SW1 par trunk padho.</b></p>
<pre class="code">SW1# show interfaces trunk</pre>
<pre class="out">Port        Vlans allowed on trunk
<span class="hl">Gi0/1       20,40</span></pre>
<p><b>Step 3: sirf SW1 par repair karo.</b></p>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport trunk allowed vlan add 99
SW1(config-if)# end</pre>
<pre class="code">WLC1# ping 10.10.99.1
WLC1# show ap summary
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20</pre>
<p><b>Proof:</b> ping ab succeed hota hai, dono APs Registered par wapas aate hain (lagbhag ek minute do) aur LAPTOP1 phir VLAN 20 mein hai aur 10.10.60.20 RADIUS server tak pahunchta hai. Dhyan do ki APs kabhi badle nahi gaye; unhe bas road wapas chahiye thi.</p>

<h3>Lab 3: wl-country-profile (site-tag rollout ke baad radios off)</h3>
<p><b>Ticket:</b> site tag ST-CAMPUS AP profile AP-PROF-US ke saath saare APs par lagaya gaya. Woh registered hain lekin LAPTOP1 ko koi SSID nahi dikhta. Business India mein hai.</p>
<p><b>Step 1: countries compare karo.</b></p>
<pre class="code">WLC1# show wireless country configured
WLC1# show ap summary</pre>
<pre class="out">Configured Country............................: IN - India
...
AP Name  ...  Country  IP Address    State
AP1      ...  <span class="hl">US</span>       10.10.10.21   Registered
AP2      ...  <span class="hl">US</span>       10.10.10.22   Registered</pre>
<p>AP country US hai lekin allowed list mein sirf IN hai, isliye radios off rehte hain. Do fixes possible hain: list widen karo ya AP profile correct karo. Ticket pehle wale ko mana karta hai (business ko sirf IN rakhna hai), aur real duniya mein bhi woh galat hota.</p>
<p><b>Step 2: profile repair karo.</b></p>
<pre class="code">WLC1# configure terminal
WLC1(config)# ap profile AP-PROF-US
WLC1(config-ap-profile)# country IN
WLC1(config-ap-profile)# end</pre>
<p><b>Proof:</b> show ap summary ab IN dikhata hai, radios on ho jaate hain, LAPTOP1 ko NK-STAFF dikhta hai aur <code>wifi status</code> VLAN 20 dikhata hai. Controller list ab bhi sirf IN hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Three labs">
<rect x="10" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-ap-discovery</text><text x="105" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP controller seekhe</text><text x="105" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: R1 option 43</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-mgmt-trunk</text><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP controller tak pahunche</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: SW1 allowed vlan</text>
<rect x="440" y="30" width="190" height="90" rx="8" fill="#fde68a"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">wl-country-profile</text><text x="535" y="78" text-anchor="middle" class="svg-ink" font-size="12">AP transmit kar sake</text><text x="535" y="98" text-anchor="middle" class="svg-ink" font-size="12">fix: AP profile country</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Jaano, pahucho, radiate karne ki ijazat: teen steps, teen devices</text>
</svg><p class="cap">Har lab chain ka ek step todta hai, alag device par.</p></div>

<div class="eg"><p><b>Worked example: repair kis device ka hai?</b> Discovery fault: R1 (DHCP server). Trunk fault: SW1 (switch trunk). Country fault: WLC1 (AP profile). Labs hamesha check karte hain ki aapne sahi owner repair kiya aur baaki ko disturb nahi kiya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Evidence R1 ya SW1 ki taraf ishara kare tab controller configure karna. (2) Discovery lab mein AP leases renew karna bhool jaana. (3) <code>allowed vlan 99</code> type karke VLANs 20 aur 40 mita dena. (4) Controller list mein US add karke country fix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lab tasks final state aur aksar verification step (ping, wifi status) check karte hain. Fix obvious lage tab bhi proof commands chalao.</p></div>

<div class="scn"><h4>Ek subah mein teen tickets</h4><p>Naye engineer ko teen tickets mile: Pune branch mein APs join nahi ho rahe, Chennai mein switch change ke baad APs gayab, aur Mumbai mein rollout ke baad SSID nahi. Har ek par pehle <code>show ap summary</code> padhkar usne pehle do mein zero APs aur teesre mein registered APs paaye. Isse kaam baat gaya: pehle do reachability problems the (ek discovery, ek path), teesri policy problem thi (country). Usne teeno ek ghante se kam mein fix kar diye.</p><p><b>Seekh:</b> ek command, show ap summary, batata hai ki aap kaun si layer par ho.</p></div>

<div class="iv"><p class="q">"Wireless control plane par aapne jo fault fix kiya uska ek example do."</p><p>In labs mein se ek ke saath STAR pattern use karo: APs discovery mein, AP DHCP pool mein option 43 nahi mila, f104 plus controller IP add kiya, leases renew kiye, Registered confirm kiya. Batao ki kuch badalne se pehle evidence se fault ka owner kaise prove kiya.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> Lab 1: AP state ke liye <b>Monitoring &gt; Wireless &gt; Access Points</b>, save karne ke liye <b>Administration &gt; Management &gt; Save Configuration</b>. Lab 2: <b>Troubleshooting &gt; Ping</b> aur trunk ke liye <b>Configuration &gt; Interface &gt; Ethernet</b>; switch side SW1 par CLI hi rehta hai. Lab 3: controller country list ke liye <b>Configuration &gt; Wireless &gt; Global</b> aur AP country ke liye <b>Configuration &gt; Tags &amp; Profiles &gt; AP Join</b>, profile edit karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Discovery fault: R1 par option 43 fix karo, phir AP leases renew karo.</li>
<li>Path fault: WLC1 se gateway ping karo, SW1 trunk padho, allowed vlan add se VLAN 99 add karo.</li>
<li>Country fault: show ap summary ko show wireless country configured se compare karo aur AP profile repair karo.</li>
<li>Hamesha owning device par repair karo aur show ap summary aur wifi status se result prove karo.</li>
</ul></div>
`}};export{e as default};