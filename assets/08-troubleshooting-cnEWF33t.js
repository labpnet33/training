var e={id:`troubleshooting`,h:{en:`Troubleshooting: one floor, three faults`,hi:`Troubleshooting: ek floor, teen faults`},body:{en:`
<p>Lab 2 is a realistic ticket: <i>"Three phones on the compact switch ACC2. Reception phone is dead, the HR phone powers up but never registers, and the sales phone's PC cannot print."</i> Each symptom hides a different layer. Work bottom up: <b>power, link, policy, VLAN, address</b>.</p>

<h3>Method</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Question</th></tr>
<tr><td>Power</td><td><code>show poe interface</code>, <code>show poe controller</code></td><td>Is the port ON? Is the budget full?</td></tr>
<tr><td>Discovery</td><td><code>show lldp neighbors</code></td><td>Is the phone visible?</td></tr>
<tr><td>Policy</td><td><code>show lldp neighbors interface X</code></td><td>Did it receive the voice policy?</td></tr>
<tr><td>VLANs</td><td><code>show ethernet-switching interface X</code></td><td>DATA untagged and VOICE tagged?</td></tr>
<tr><td>Config</td><td><code>show configuration poe</code>, <code>switch-options</code>, <code>protocols</code></td><td>What is missing?</td></tr></table>

<h3>Fault 1: the reception phone is dead (power)</h3>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     10.8W         0W       Static       UP
Allocated power: <span class="hl">30.8W of 32.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     <span class="hl">OFF</span>         15.4W      Low            0.0W           not-applicable</pre>
<p>Only 10.8 W is consumed, yet 30.8 W is reserved: static management. Fix with <code>set poe management class</code> and give the important port <code>set poe interface ge-0/0/5 priority high</code>. Afterwards the controller shows class management, 21.0 W of 32.0 W allocated, and ge-0/0/5 is ON with High priority.</p>

<h3>Fault 2: the HR phone has no policy (LLDP-MED)</h3>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/2
Network policy:
        Application type : Voice, <span class="hl">Policy: unknown (none received from this switch)</span></pre>
<p>The phone is alive and sees LLDP, but MED sends it nothing. <code>show configuration protocols</code> reveals <code>lldp-med interface ge-0/0/2 disable</code>. Fix: <code>delete protocols lldp-med interface ge-0/0/2</code>.</p>

<h3>Fault 3: the sales port has no voice VLAN</h3>
<p>PHONE3 and its PC are on ge-0/0/5, which has no <code>voip</code> statement. After power returns, the real VLAN view before the fix shows only DATA 10 on that port (and, while unpowered, it was Discarding with the DN flag). Fix: <code>set switch-options voip interface ge-0/0/5.0 vlan VOICE</code>.</p>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/5
Network policy:
        Application type : Voice, VLAN ID: 20, Tagged, Priority: 5, DSCP: 46
Extended power via MDI:
        Power type: PD device, Power source: PSE, <span class="hl">Priority: High</span></pre>

<h3>Final verification</h3>
<p>After all three fixes, <code>show lldp neighbors</code> lists PHONE1, PHONE2 and PHONE3, <code>show ethernet-switching interface ge-0/0/5</code> shows DATA untagged and VOICE tagged, both Forwarding, and PHONE3 can ping the call server 10.20.0.50. The lab task answer is the amount statically reserved per phone: <b>15.4 W</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="55" width="100" height="50" rx="8" fill="#fecaca"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Power</text>
<rect x="140" y="55" width="100" height="50" rx="8" fill="#fed7aa"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 LLDP</text>
<rect x="260" y="55" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text>
<rect x="380" y="55" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="430" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 VLANs</text>
<rect x="500" y="55" width="100" height="50" rx="8" fill="#bae6fd"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 Address</text>
</svg><p class="cap">Stop at the first layer that fails; fix it before moving up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Blaming the phone before checking the budget. Testing a ping before the port is ON. Fixing one fault and declaring victory: tickets often hold several.</p></div>
<div class="exam"><p><b>Exam trap.</b> A port can be Enabled yet OFF: enabled is configuration, OFF is the power state. Static reservation can starve ports even when real consumption is low.</p></div>

<div class="scn"><h4>Three symptoms, three layers</h4><p>Reception dead: budget. HR registered nowhere: MED disabled. Sales PC fine but phone in DATA: no voip statement. One ticket, three commands, three fixes.</p><p><b>Lesson:</b> do not stop at the first fix.</p></div>

<div class="iv"><p class="q">"A phone will not power on. How do you proceed?"</p><p>I run show poe interface to see the state; if OFF I check show poe controller for budget and management mode. Static allocation reserves the port maximum, so I consider class management and priority. If the port is Searching, I look at the cable and device instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom up: power, LLDP, policy, VLAN, address.</li>
<li>Static budget full means OFF ports; use class management and priority high.</li>
<li>Policy unknown means LLDP-MED disabled or the port has no voip statement.</li>
<li>Verify with lldp neighbors, ethernet-switching interface and a ping.</li>
</ul></div>
`,hi:`
<p>Lab 2 ek asli jaisa ticket hai: <i>"Compact switch ACC2 par teen phones. Reception phone dead hai, HR phone power hota hai par register nahi hota, aur sales phone ka PC print nahi kar sakta."</i> Har symptom alag layer chhupata hai. Neeche se upar kaam karo: <b>power, link, policy, VLAN, address</b>.</p>

<h3>Method</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Sawaal</th></tr>
<tr><td>Power</td><td><code>show poe interface</code>, <code>show poe controller</code></td><td>Port ON hai? Budget full hai?</td></tr>
<tr><td>Discovery</td><td><code>show lldp neighbors</code></td><td>Phone dikhta hai?</td></tr>
<tr><td>Policy</td><td><code>show lldp neighbors interface X</code></td><td>Voice policy mili?</td></tr>
<tr><td>VLANs</td><td><code>show ethernet-switching interface X</code></td><td>DATA untagged aur VOICE tagged?</td></tr>
<tr><td>Config</td><td><code>show configuration poe</code>, <code>switch-options</code>, <code>protocols</code></td><td>Kya missing hai?</td></tr></table>

<h3>Fault 1: reception phone dead (power)</h3>
<pre class="out">lab@ACC2&gt; show poe controller
Controller  Maximum   Power         Guard    Management   Status
index       power     consumption   band
0           32.0W     10.8W         0W       Static       UP
Allocated power: <span class="hl">30.8W of 32.0W</span> available (static allocation: maximum-power of each powered port)

lab@ACC2&gt; show poe interface
ge-0/0/1     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/2     Enabled     ON          15.4W      Low            5.4W           2
ge-0/0/5     Enabled     <span class="hl">OFF</span>         15.4W      Low            0.0W           not-applicable</pre>
<p>Sirf 10.8 W consume ho raha hai, phir bhi 30.8 W reserved hai: static management. Fix: <code>set poe management class</code> aur zaroori port ko <code>set poe interface ge-0/0/5 priority high</code>. Uske baad controller class management, 32.0 W mein se 21.0 W allocated dikhata hai, aur ge-0/0/5 High priority ke saath ON hai.</p>

<h3>Fault 2: HR phone ko policy nahi (LLDP-MED)</h3>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/2
Network policy:
        Application type : Voice, <span class="hl">Policy: unknown (none received from this switch)</span></pre>
<p>Phone zinda hai aur LLDP dekhta hai, par MED use kuch nahi bhejta. <code>show configuration protocols</code> mein <code>lldp-med interface ge-0/0/2 disable</code> dikhta hai. Fix: <code>delete protocols lldp-med interface ge-0/0/2</code>.</p>

<h3>Fault 3: sales port par voice VLAN nahi</h3>
<p>PHONE3 aur uska PC ge-0/0/5 par hain, jahan <code>voip</code> statement nahi. Fix se pehle us port par sirf DATA 10 dikhta hai (aur unpowered hone par woh DN flag ke saath Discarding tha). Fix: <code>set switch-options voip interface ge-0/0/5.0 vlan VOICE</code>.</p>
<pre class="out">lab@ACC2&gt; show lldp neighbors interface ge-0/0/5
Network policy:
        Application type : Voice, VLAN ID: 20, Tagged, Priority: 5, DSCP: 46
Extended power via MDI:
        Power type: PD device, Power source: PSE, <span class="hl">Priority: High</span></pre>

<h3>Final verification</h3>
<p>Teeno fixes ke baad <code>show lldp neighbors</code> mein PHONE1, PHONE2 aur PHONE3 dikhte hain, <code>show ethernet-switching interface ge-0/0/5</code> DATA untagged aur VOICE tagged, dono Forwarding, dikhata hai, aur PHONE3 call server 10.20.0.50 ko ping kar sakta hai. Lab task ka jawab har phone ke liye static reserve ki gayi power hai: <b>15.4 W</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="55" width="100" height="50" rx="8" fill="#fecaca"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="12">1 Power</text>
<rect x="140" y="55" width="100" height="50" rx="8" fill="#fed7aa"/><text x="190" y="85" text-anchor="middle" class="svg-ink" font-size="12">2 LLDP</text>
<rect x="260" y="55" width="100" height="50" rx="8" fill="#fde68a"/><text x="310" y="85" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text>
<rect x="380" y="55" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="430" y="85" text-anchor="middle" class="svg-ink" font-size="12">4 VLANs</text>
<rect x="500" y="55" width="100" height="50" rx="8" fill="#bae6fd"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="12">5 Address</text>
</svg><p class="cap">Jo pehli layer fail ho wahin ruko; use theek karke upar badho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Budget dekhe bina phone ko blame karna. Port ON hone se pehle ping test karna. Ek fault theek karke jeet maan lena: tickets mein aksar kai hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Port Enabled hote hue bhi OFF ho sakta hai: enabled configuration hai, OFF power state hai. Static reservation asal consumption kam hone par bhi ports ko bhookha rakh sakta hai.</p></div>

<div class="scn"><h4>Teen symptoms, teen layers</h4><p>Reception dead: budget. HR kahin register nahi: MED disabled. Sales PC theek par phone DATA mein: voip statement nahi. Ek ticket, teen commands, teen fixes.</p><p><b>Lesson:</b> pehle fix par mat ruko.</p></div>

<div class="iv"><p class="q">"Phone power on nahi hota. Kaise aage badhoge?"</p><p>Main show poe interface se state dekhta hoon; OFF ho to show poe controller se budget aur management mode check karta hoon. Static allocation port maximum reserve karta hai, isliye class management aur priority sochta hoon. Port Searching ho to cable aur device dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar: power, LLDP, policy, VLAN, address.</li>
<li>Static budget full matlab ports OFF; class management aur priority high use karo.</li>
<li>Policy unknown matlab LLDP-MED disabled ya port par voip statement nahi.</li>
<li>lldp neighbors, ethernet-switching interface aur ping se verify karo.</li>
</ul></div>
`}};export{e as default};