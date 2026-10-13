var e={id:`lab-trace-and-epc`,h:{en:`Lab walkthrough: wl-diag-trace-policy and wl-diag-epc-dhcp`,hi:`Lab walkthrough: wl-diag-trace-policy aur wl-diag-epc-dhcp`},body:{en:`
<p>A pilot learns in a simulator before flying. In this chapter you fly two flights: a client that is dropped right after association (a <b>trace</b> case) and a client that never gets an IP address (a <b>capture</b> case). For each lab we follow the method of chapter 1: symptom, scope, layer, evidence, one change, re-test. Try the lab first, then compare with this walkthrough.</p>

<h3>Lab 1: wl-diag-trace-policy</h3>
<p><b>Ticket.</b> LAPTOP1 sees NK-STAFF, the key NkStaff2024 is correct and AP1 is joined, yet the client never stays connected. The helpdesk has no idea why.</p>
<p><b>Step 1: scope and layer.</b> One SSID, and the client does see it, so stages 1 and 2 pass (chapter 2). The key is stated correct, which leaves stages 3 to 6. A trace is the right tool because the client reaches the controller.</p>
<p><b>Step 2: find the MAC and start the condition.</b></p>
<pre class="code">LAPTOP1# show interfaces
<span class="c">! note the Wi-Fi MAC, here 0050.2fe9.9a01</span>
WLC1# enable
WLC1# debug wireless mac 0050.2fe9.9a01</pre>
<p>GUI: <b>Troubleshooting &gt; Radioactive Trace</b>, enter the MAC, Start.</p>
<p><b>Step 3: reproduce, stop, read.</b></p>
<pre class="code">LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# no debug wireless mac 0050.2fe9.9a01
WLC1# show logging profile wireless filter mac 0050.2fe9.9a01</pre>
<pre class="out">... (note): MAC: 0050.2fe9.9a01 Association received. BSSID ..., WLAN NK-STAFF ... AP AP1
... [client-orch-state] (note): ... S_CO_INIT -&gt; S_CO_ASSOCIATING
... [client-keymgmt] (note): ... EAP Key management successful. AKM:PSK Cipher:CCMP WPA Version: WPA2
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected
... (note): ... Deleting the client, reason: policy profile has central switching disabled ...</pre>
<p><b>Reading.</b> Association succeeded, the PSK was right, the failure is stage 4 (placement). The ERR line names the object: policy profile PP-STAFF. Wireless knowledge supplies the reason: an AP in <b>local</b> mode tunnels all client traffic to the controller, so a policy with central switching off only makes sense for FlexConnect APs (module wl-flex). Here no flex profile exists.</p>
<p><b>Step 4: one change.</b> A policy profile must be shut down before its switching mode can change (wl-ops).</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# shutdown
WLC1(config-wireless-policy)# central switching
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# end</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-STAFF &gt; Advanced / Access Policies</b>.</p>
<p><b>Step 5: prove.</b> Reconnect with <code>wifi connect NK-STAFF psk NkStaff2024</code>, then <code>wifi status</code> (an address in 10.10.20.x) and <code>ping 10.10.60.20</code> (RAD1). The fourth task checks both.</p>
<div class="warn"><p><b>Common mistake.</b> Starting the trace <i>after</i> the failed attempt. The lab requires the condition to exist before the connect. Start, then reproduce.</p></div>

<h3>Lab 2: wl-diag-epc-dhcp</h3>
<p><b>Ticket.</b> LAPTOP1 joins NK-STAFF but never gets an IP address. WLAN, policy VLAN and AP tags look correct.</p>
<p><b>Step 1: layer.</b> "Joins" means stages 1 to 4 pass; no IP is stage 5. A capture proves the network's behaviour.</p>
<p><b>Step 2: capture CAP-DHCP on GigabitEthernet1.</b></p>
<pre class="code">WLC1# monitor capture CAP-DHCP interface GigabitEthernet1 both
WLC1# monitor capture CAP-DHCP start
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-DHCP stop
WLC1# show monitor capture CAP-DHCP buffer brief</pre>
<pre class="out"> 1   342   0.000000   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>
 2   342   2.001204   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>
 3   342   4.002871   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>   (no Offer)</pre>
<p><b>Reading.</b> The client asks, nobody answers. The check wants Discover rows and no Offer row.</p>
<p><b>Step 3: find the silent device.</b> DHCP for VLAN 20 is on R1, reached through its sub-interface for VLAN 20.</p>
<pre class="code">R1# show ip interface brief
GigabitEthernet0/0.20   10.10.20.1   YES manual <span class="hl">administratively down</span> down
R1# configure terminal
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# no shutdown</pre>
<p><b>Step 4: second capture CAP-OK</b> under a fresh connection.</p>
<pre class="code">WLC1# monitor capture CAP-OK interface GigabitEthernet1 both
WLC1# monitor capture CAP-OK start
LAPTOP1# wifi disconnect
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-OK stop
WLC1# show monitor capture CAP-OK buffer brief</pre>
<p>The buffer must now hold <code>DHCP Discover</code>, <code>DHCP Offer</code>, <code>DHCP Request</code> and <code>DHCP ACK</code>. The last task confirms LAPTOP1 is in VLAN 20 and reaches RAD1.</p>

<div class="eg"><p><b>Worked example (what the evidence pair means).</b> CAP-DHCP has 3 Discover rows over 4 seconds and no Offer; CAP-OK has 4 rows in the order Discover, Offer, Request, ACK. The only change between the two captures was <code>no shutdown</code> on R1 GigabitEthernet0/0.20. A before-and-after pair like this is what an engineer attaches to a ticket.</p></div>

<div class="exam"><p><b>Exam trap.</b> The fix was on <b>R1</b>, not the controller. The web UI covers WLC1 only; R1 and SW1 are CLI. A capture on the controller can only point at the silent device, never repair it.</p></div>

<div class="scn"><h4>Two tools, one afternoon</h4><p>A branch reported "Wi-Fi connects and drops". The trace showed a placement ERR within seconds; a policy edit made during a flex pilot had cleared central switching on the staff profile. The next day, the same branch reported no addresses on a new VLAN. The capture showed Discovers and no Offers and the DHCP scope had not been created. Different layers, different tools, same method.</p><p><b>Lesson:</b> pick the tool by the stage the symptom proves, not by habit.</p></div>

<div class="iv"><p class="q">"A client associates and is then dropped within seconds. What do you do?"</p><p>I start a Radioactive Trace for its MAC, reproduce once, stop and read the ERR line before the delete. A drop right after a successful key exchange points at placement, for example VLAN missing or central switching off, not at the password. I fix one object, reconnect under a new trace and confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trace case: start before reproducing; the ERR line names the object.</li>
<li>PP-STAFF with central switching off fails for a local-mode AP; shut down, fix, no shutdown.</li>
<li>Capture case: Discover rows without Offer prove nobody answered.</li>
<li>The silent device was R1 GigabitEthernet0/0.20; fix on the device that owns it.</li>
<li>Before and after evidence (CAP-DHCP, CAP-OK) is the proof of repair.</li>
</ul></div>
`,hi:`
<p>Pilot udne se pehle simulator mein seekhta hai. Is chapter mein aap do flights udaoge: ek client jo association ke turant baad drop ho jata hai (<b>trace</b> case) aur ek client jise kabhi IP address nahi milta (<b>capture</b> case). Har lab mein hum chapter 1 ka method follow karte hain: symptom, scope, layer, evidence, one change, re-test. Pehle lab khud try karo, phir is walkthrough se compare karo.</p>

<h3>Lab 1: wl-diag-trace-policy</h3>
<p><b>Ticket.</b> LAPTOP1 ko NK-STAFF dikhta hai, key NkStaff2024 sahi hai aur AP1 joined hai, phir bhi client kabhi connected nahi rehta. Helpdesk ko wajah nahi pata.</p>
<p><b>Step 1: scope aur layer.</b> Ek SSID, aur client use dekhta hai, to stages 1 aur 2 pass (chapter 2). Key sahi bataya gaya hai, to stages 3 se 6 bachte hain. Trace sahi tool hai kyunki client controller tak pahunchta hai.</p>
<p><b>Step 2: MAC dhundo aur condition start karo.</b></p>
<pre class="code">LAPTOP1# show interfaces
<span class="c">! Wi-Fi MAC note karo, yahan 0050.2fe9.9a01</span>
WLC1# enable
WLC1# debug wireless mac 0050.2fe9.9a01</pre>
<p>GUI: <b>Troubleshooting &gt; Radioactive Trace</b>, MAC daalo, Start.</p>
<p><b>Step 3: reproduce, stop, read.</b></p>
<pre class="code">LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# no debug wireless mac 0050.2fe9.9a01
WLC1# show logging profile wireless filter mac 0050.2fe9.9a01</pre>
<pre class="out">... (note): MAC: 0050.2fe9.9a01 Association received. BSSID ..., WLAN NK-STAFF ... AP AP1
... [client-orch-state] (note): ... S_CO_INIT -&gt; S_CO_ASSOCIATING
... [client-keymgmt] (note): ... EAP Key management successful. AKM:PSK Cipher:CCMP WPA Version: WPA2
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected
... (note): ... Deleting the client, reason: policy profile has central switching disabled ...</pre>
<p><b>Padhna.</b> Association succeed hua, PSK sahi tha, failure stage 4 (placement) hai. ERR line object ka naam batati hai: policy profile PP-STAFF. Wireless knowledge reason deti hai: <b>local</b> mode ka AP saara client traffic controller tak tunnel karta hai, isliye central switching off wali policy sirf FlexConnect APs ke liye sense karti hai (module wl-flex). Yahan koi flex profile nahi hai.</p>
<p><b>Step 4: ek change.</b> Policy profile ka switching mode badalne se pehle use shut down karna padta hai (wl-ops).</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# shutdown
WLC1(config-wireless-policy)# central switching
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# end</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-STAFF &gt; Advanced / Access Policies</b>.</p>
<p><b>Step 5: prove.</b> <code>wifi connect NK-STAFF psk NkStaff2024</code> se reconnect karo, phir <code>wifi status</code> (10.10.20.x mein address) aur <code>ping 10.10.60.20</code> (RAD1). Chautha task dono check karta hai.</p>
<div class="warn"><p><b>Common mistake.</b> Trace ko failed attempt ke <i>baad</i> start karna. Lab maangta hai ki condition connect se pehle exist kare. Pehle start, phir reproduce.</p></div>

<h3>Lab 2: wl-diag-epc-dhcp</h3>
<p><b>Ticket.</b> LAPTOP1 NK-STAFF join karta hai lekin IP address nahi milta. WLAN, policy VLAN aur AP tags sahi dikhte hain.</p>
<p><b>Step 1: layer.</b> "Join karta hai" ka matlab stages 1 se 4 pass; IP nahi to stage 5. Capture network ka behaviour prove karta hai.</p>
<p><b>Step 2: GigabitEthernet1 par capture CAP-DHCP.</b></p>
<pre class="code">WLC1# monitor capture CAP-DHCP interface GigabitEthernet1 both
WLC1# monitor capture CAP-DHCP start
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-DHCP stop
WLC1# show monitor capture CAP-DHCP buffer brief</pre>
<pre class="out"> 1   342   0.000000   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>
 2   342   2.001204   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>
 3   342   4.002871   0.0.0.0  -&gt;  255.255.255.255    UDP   <span class="hl">DHCP Discover</span>   (no Offer)</pre>
<p><b>Padhna.</b> Client poochta hai, koi jawab nahi deta. Check Discover rows aur Offer row ka na hona maangta hai.</p>
<p><b>Step 3: chup device dhundo.</b> VLAN 20 ka DHCP R1 par hai, jo VLAN 20 ke sub-interface se reach hota hai.</p>
<pre class="code">R1# show ip interface brief
GigabitEthernet0/0.20   10.10.20.1   YES manual <span class="hl">administratively down</span> down
R1# configure terminal
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# no shutdown</pre>
<p><b>Step 4: doosra capture CAP-OK</b> nayi connection ke saath.</p>
<pre class="code">WLC1# monitor capture CAP-OK interface GigabitEthernet1 both
WLC1# monitor capture CAP-OK start
LAPTOP1# wifi disconnect
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-OK stop
WLC1# show monitor capture CAP-OK buffer brief</pre>
<p>Buffer mein ab <code>DHCP Discover</code>, <code>DHCP Offer</code>, <code>DHCP Request</code> aur <code>DHCP ACK</code> hone chahiye. Aakhri task confirm karta hai ki LAPTOP1 VLAN 20 mein hai aur RAD1 tak pahunchta hai.</p>

<div class="eg"><p><b>Worked example (evidence pair ka matlab).</b> CAP-DHCP mein 4 second mein 3 Discover rows aur Offer nahi; CAP-OK mein 4 rows Discover, Offer, Request, ACK order mein. Dono captures ke beech sirf R1 GigabitEthernet0/0.20 par <code>no shutdown</code> badla. Aisi before-and-after jodi engineer ticket ke saath attach karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fix <b>R1</b> par tha, controller par nahi. Web UI sirf WLC1 cover karta hai; R1 aur SW1 CLI hain. Controller par capture sirf chup device ki taraf ishara kar sakta hai, repair nahi.</p></div>

<div class="scn"><h4>Do tools, ek dopahar</h4><p>Ek branch ne report kiya "Wi-Fi connect hota hai aur drop". Trace ne kuch seconds mein placement ERR dikhaya; flex pilot ke dauran ek policy edit ne staff profile ki central switching hata di thi. Agle din usi branch ne naye VLAN par address nahi milne ki report ki. Capture ne Discovers aur koi Offer nahi dikhaya aur DHCP scope bana hi nahi tha. Alag layers, alag tools, wahi method.</p><p><b>Lesson:</b> tool us stage se chuno jo symptom prove karta hai, aadat se nahi.</p></div>

<div class="iv"><p class="q">"Client associate hota hai aur kuch seconds mein drop ho jata hai. Aap kya karte ho?"</p><p>Uske MAC ke liye Radioactive Trace start karta hoon, ek baar reproduce, stop aur delete se pehle ki ERR line padhta hoon. Successful key exchange ke turant baad drop placement ki taraf point karta hai, jaise VLAN missing ya central switching off, password ki taraf nahi. Ek object fix karta hoon, naye trace ke under reconnect karta hoon aur confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trace case: reproduce se pehle start; ERR line object ka naam batati hai.</li>
<li>Central switching off wali PP-STAFF local-mode AP ke liye fail hoti hai; shutdown, fix, no shutdown.</li>
<li>Capture case: Offer ke bina Discover rows prove karte hain ki koi nahi bola.</li>
<li>Chup device R1 GigabitEthernet0/0.20 tha; fix us device par jo use own karta hai.</li>
<li>Before aur after evidence (CAP-DHCP, CAP-OK) repair ka proof hai.</li>
</ul></div>
`}};export{e as default};