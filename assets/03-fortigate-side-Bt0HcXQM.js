var e={id:`fortigate-side`,h:{en:`The FortiGate side: log fortianalyzer setting and filter`,hi:`FortiGate side: log fortianalyzer setting aur filter`},body:{en:`
<p>Imagine posting a parcel. You need an address (where to), a sender label (who you are), a choice of service (ordinary or registered) and a rule about what you are willing to post at all. On a FortiGate, <code>config log fortianalyzer setting</code> holds the address, the label and the service. <code>config log fortianalyzer filter</code> holds the rule about what may leave. Both are real FortiOS command names.</p>

<h3>The setting table</h3>
<table class="cmp"><tr><th>Option</th><th>Meaning</th><th>Default</th></tr>
<tr><td><code>status</code></td><td>Switch logging to a FortiAnalyzer on or off</td><td>disable</td></tr>
<tr><td><code>server</code></td><td>IP address of the FortiAnalyzer</td><td>empty</td></tr>
<tr><td><code>serial</code></td><td>Serial number(s) of the FortiAnalyzer you trust</td><td>empty</td></tr>
<tr><td><code>upload-option</code></td><td>realtime, 1-minute or 5-minute</td><td>realtime</td></tr>
<tr><td><code>reliable</code></td><td>Send logs over TCP instead of UDP</td><td>disable</td></tr>
<tr><td><code>source-ip</code></td><td>Address the FortiGate uses as the source of the log connection</td><td>0.0.0.0 (automatic)</td></tr>
<tr><td><code>certificate-verification</code></td><td>Check the FortiAnalyzer identity; needs <code>serial</code></td><td>disable</td></tr>
</table>
<p>The simulator also accepts <code>ssl-min-proto-version</code> and <code>access-config</code>, but only records them; no TLS negotiation is simulated and names (FQDN) are not resolved, so always use an IP address.</p>
<p>What is <code>source-ip</code> for? A FortiGate with several interfaces picks a source address by its routing table. If FAZ-1 only accepts a certain address, or a return route exists only for one interface, you fix the source here. In our lab network the log traffic leaves HQ-FGT from 192.0.2.11, and you rarely need to set it.</p>

<h3>The minimal configuration</h3>
<pre class="code">HQ-FGT # <span class="c">! switch logging on and name the server</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>If you enable it without a server, the FortiGate refuses:</p>
<pre class="out">HQ-FGT # config log fortianalyzer setting
HQ-FGT # set status enable
HQ-FGT # end
<span class="hl">Attribute 'server' MUST be set.</span>
Command fail. Return code 1</pre>
<p>A small habit with <code>show</code>: it prints only values that differ from the default. After the minimal configuration you see just two lines. Use <code>show full-configuration</code> to see every option, including the defaults.</p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    set server "192.0.2.6"
end</pre>

<h3>The filter table</h3>
<p>The filter decides which logs may be sent. Two settings matter most in this course.</p>
<ul>
<li><code>severity</code>: the least severe level that is still sent. Levels from most to least severe: emergency, alert, critical, error, warning, notice, information, debug. The default is <code>information</code>, which lets almost everything through. In the simulator traffic logs are level <code>notice</code>, event logs <code>information</code>.</li>
<li><code>forward-traffic</code>: enable or disable the traffic logs of sessions that pass through the FortiGate.</li>
</ul>
<p>The options <code>local-traffic</code>, <code>multicast-traffic</code>, <code>sniffer-traffic</code>, <code>anomaly</code> and <code>voip</code> exist and are recorded, but the simulator produces no such logs.</p>

<div class="eg"><p><b>Worked example.</b> Madurai wants fewer logs to save disk. If you set <code>severity warning</code> on MDU-FGT, traffic logs (notice) and event logs (information) are no longer sent, because both are less severe than warning. Only UTM logs of warning level or worse remain. Setting <code>forward-traffic disable</code> alone removes just the traffic logs and keeps events and UTM logs.</p></div>

<h3>Checking the connection</h3>
<p><code>execute log fortianalyzer test-connectivity</code> asks the FortiGate to test the link. The name is real; the simulator's output is approximated.</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Adom Name: -
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Version: 7.6.0
FortiAnalyzer Max Log Rate: 0
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<p>Two lines carry the answer. <b>Connection</b> tells you whether the FortiGate can talk to the FortiAnalyzer; <code>Allow</code> is the good value. <b>Registration</b> tells you whether FAZ-1 has a device entry; here it has not. A FortiGate can therefore be connected and still have all its logs discarded. If logging is switched off the command says so instead:</p>
<pre class="out">FortiAnalyzer logging is disabled. Enable it: config log fortianalyzer setting, set status enable.</pre>
<p>For the queue and counters use <code>diagnose test application miglogd 6</code> (chapter 2).</p>

<div class="warn"><p><b>Common mistakes.</b> Typing the wrong server address and trusting the status enable alone. Setting <code>certificate-verification enable</code> without a <code>serial</code>. Setting a high severity filter during a lab and forgetting it, so traffic logs vanish. Forgetting that <code>show</code> hides defaults and concluding that an option is missing. Leaving <code>logtraffic</code> off in the policy: the filter is not the only gate.</p></div>

<div class="exam"><p><b>Exam traps.</b> Enabling without a server is refused. The severity filter passes a log when its level is at least as severe as the setting. The default upload option is realtime. Disabling forward-traffic stops only the traffic logs. The commands <code>config log fortianalyzer setting</code> and <code>filter</code> are CLI on the FortiGate in the real product too.</p></div>

<div class="scn"><h4>The typo that looked like an outage</h4><p>A new Trichy engineer typed 192.0.2.66 instead of 192.0.2.6. The setting said status enable, so he thought logging was running. test-connectivity showed Connection timeout and empty host fields: no FortiAnalyzer answered at that address. He corrected the server and the line changed to Allow within seconds.</p><p><b>Lesson:</b> status enable is a request, not a result; the proof is the Connection line.</p></div>

<div class="iv"><p class="q">"How do you configure a FortiGate to send logs to a FortiAnalyzer and how do you verify it?"</p><p>Under <code>config log fortianalyzer setting</code> set status enable and the server IP, optionally upload-option, reliable and source-ip. Verify with test-connectivity (Connection and Registration lines) and miglogd 6 (mode, queue, lost). Mention the filter and that the policy needs logging on.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>config log fortianalyzer setting</code> holds status, server, serial, upload-option, reliable, source-ip.</li>
<li><code>config log fortianalyzer filter</code> holds severity and forward-traffic among others.</li>
<li>Enabling without a server fails with "Attribute 'server' MUST be set."</li>
<li><code>show</code> hides defaults; <code>show full-configuration</code> shows all.</li>
<li>test-connectivity reports Connection and Registration separately.</li>
</ul></div>
`,hi:`
<p>Socho aap parcel post kar rahe ho. Aapko address chahiye (kahan bhejna), sender label (aap kaun ho), service ka choice (ordinary ya registered) aur ek rule ki aap kya post karne ko taiyar ho. FortiGate par <code>config log fortianalyzer setting</code> address, label aur service rakhta hai. <code>config log fortianalyzer filter</code> wo rule rakhta hai ki kya bahar ja sakta hai. Dono real FortiOS command names hain.</p>

<h3>Setting table</h3>
<table class="cmp"><tr><th>Option</th><th>Matlab</th><th>Default</th></tr>
<tr><td><code>status</code></td><td>FortiAnalyzer ko logging on ya off</td><td>disable</td></tr>
<tr><td><code>server</code></td><td>FortiAnalyzer ka IP address</td><td>empty</td></tr>
<tr><td><code>serial</code></td><td>Us FortiAnalyzer ke serial number(s) jis par aap bharosa karte ho</td><td>empty</td></tr>
<tr><td><code>upload-option</code></td><td>realtime, 1-minute ya 5-minute</td><td>realtime</td></tr>
<tr><td><code>reliable</code></td><td>UDP ki jagah TCP par logs bhejo</td><td>disable</td></tr>
<tr><td><code>source-ip</code></td><td>Log connection ka source address jo FortiGate use kare</td><td>0.0.0.0 (automatic)</td></tr>
<tr><td><code>certificate-verification</code></td><td>FortiAnalyzer ki identity check karo; <code>serial</code> chahiye</td><td>disable</td></tr>
</table>
<p>Simulator <code>ssl-min-proto-version</code> aur <code>access-config</code> bhi accept karta hai, par sirf record karta hai; TLS negotiation simulate nahi hota aur names (FQDN) resolve nahi hote, isliye hamesha IP address use karo.</p>
<p><code>source-ip</code> kis liye hai? Kai interfaces wala FortiGate source address routing table se chunta hai. FAZ-1 sirf ek khaas address accept kare, ya return route sirf ek interface ke liye ho, to aap source yahan fix karte ho. Humare lab network mein log traffic HQ-FGT se 192.0.2.11 se nikalta hai, aur ise set karne ki kam hi zaroorat padti hai.</p>

<h3>Minimal configuration</h3>
<pre class="code">HQ-FGT # <span class="c">! logging on karo aur server ka naam do</span>
config log fortianalyzer setting
    set status enable
    set server 192.0.2.6
end</pre>
<p>Server ke bina enable karo to FortiGate mana kar deta hai:</p>
<pre class="out">HQ-FGT # config log fortianalyzer setting
HQ-FGT # set status enable
HQ-FGT # end
<span class="hl">Attribute 'server' MUST be set.</span>
Command fail. Return code 1</pre>
<p><code>show</code> ki ek chhoti aadat: ye sirf wahi values print karta hai jo default se alag hain. Minimal configuration ke baad aapko sirf do lines dikhti hain. Saare options, defaults ke saath, dekhne ke liye <code>show full-configuration</code> use karo.</p>
<pre class="out">HQ-FGT # show log fortianalyzer setting
config log fortianalyzer setting
    set status enable
    set server "192.0.2.6"
end</pre>

<h3>Filter table</h3>
<p>Filter tay karta hai kaun se logs bheje ja sakte hain. Is course mein do settings sabse zaroori hain.</p>
<ul>
<li><code>severity</code>: sabse kam severe level jo phir bhi bheja jata hai. Levels zyada se kam severe: emergency, alert, critical, error, warning, notice, information, debug. Default <code>information</code> hai, jo lagbhag sab kuch jaane deta hai. Simulator mein traffic logs level <code>notice</code> hain, event logs <code>information</code>.</li>
<li><code>forward-traffic</code>: FortiGate ke through guzarne wale sessions ke traffic logs enable ya disable.</li>
</ul>
<p>Options <code>local-traffic</code>, <code>multicast-traffic</code>, <code>sniffer-traffic</code>, <code>anomaly</code> aur <code>voip</code> exist karte hain aur record hote hain, par simulator aise logs nahi banata.</p>

<div class="eg"><p><b>Worked example.</b> Madurai disk bachane ke liye kam logs chahta hai. MDU-FGT par <code>severity warning</code> set karo to traffic logs (notice) aur event logs (information) ab nahi jate, kyunki dono warning se kam severe hain. Sirf warning ya usse zyada severe UTM logs bachte hain. Akela <code>forward-traffic disable</code> sirf traffic logs hatata hai aur events aur UTM logs rakhta hai.</p></div>

<h3>Connection check karna</h3>
<p><code>execute log fortianalyzer test-connectivity</code> FortiGate se link test karwata hai. Naam real hai; simulator ka output approximate hai.</p>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Adom Name: -
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Version: 7.6.0
FortiAnalyzer Max Log Rate: 0
<span class="hl">FortiAnalyzer Registration: unregistered</span>
<span class="hl">Connection: Allow</span></pre>
<p>Do lines mein jawab hai. <b>Connection</b> batata hai ki FortiGate FortiAnalyzer se baat kar sakta hai ya nahi; <code>Allow</code> achhi value hai. <b>Registration</b> batata hai ki FAZ-1 ke paas device entry hai ya nahi; yahan nahi hai. Isliye FortiGate connected ho kar bhi uske saare logs discard ho sakte hain. Logging off ho to command yahi batati hai:</p>
<pre class="out">FortiAnalyzer logging is disabled. Enable it: config log fortianalyzer setting, set status enable.</pre>
<p>Queue aur counters ke liye <code>diagnose test application miglogd 6</code> use karo (chapter 2).</p>

<div class="warn"><p><b>Common mistakes.</b> Galat server address type karna aur sirf status enable par bharosa karna. Serial ke bina <code>certificate-verification enable</code> karna. Lab mein high severity filter lagakar bhool jana, jisse traffic logs gayab ho jate hain. Ye bhool jana ki <code>show</code> defaults chhupata hai aur soch lena ki option missing hai. Policy mein <code>logtraffic</code> off chhodna: filter akela gate nahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Server ke bina enable refuse hota hai. Severity filter log ko tab pass karta hai jab uska level setting jitna ya usse zyada severe ho. Default upload option realtime hai. forward-traffic disable sirf traffic logs rokta hai. Commands <code>config log fortianalyzer setting</code> aur <code>filter</code> real product mein bhi FortiGate par CLI hain.</p></div>

<div class="scn"><h4>Typo jo outage jaisa dikha</h4><p>Trichy ke naye engineer ne 192.0.2.6 ki jagah 192.0.2.66 type kar diya. Setting mein status enable tha, isliye usne socha logging chal rahi hai. test-connectivity ne Connection timeout aur khaali host fields dikhaye: us address par koi FortiAnalyzer jawab nahi de raha tha. Server sahi kiya aur line kuch seconds mein Allow ho gayi.</p><p><b>Lesson:</b> status enable ek request hai, result nahi; saboot Connection line hai.</p></div>

<div class="iv"><p class="q">"FortiGate ko FortiAnalyzer ko logs bhejne ke liye kaise configure karte ho aur verify kaise karte ho?"</p><p><code>config log fortianalyzer setting</code> mein status enable aur server IP set karo, optional upload-option, reliable aur source-ip. Verify test-connectivity (Connection aur Registration lines) aur miglogd 6 (mode, queue, lost) se. Filter ka zikr karo aur ye ki policy par logging on honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>config log fortianalyzer setting</code> mein status, server, serial, upload-option, reliable, source-ip hote hain.</li>
<li><code>config log fortianalyzer filter</code> mein severity aur forward-traffic jaise options hote hain.</li>
<li>Server ke bina enable karne par "Attribute 'server' MUST be set." aata hai.</li>
<li><code>show</code> defaults chhupata hai; <code>show full-configuration</code> sab dikhata hai.</li>
<li>test-connectivity Connection aur Registration alag-alag batata hai.</li>
</ul></div>
`}};export{e as default};