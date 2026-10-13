var e={id:`flow-vs-packet-mode`,h:{en:`Flow-based mode versus packet-based mode`,hi:`Flow-based mode versus packet-based mode`},body:{en:`<p><b>Analogy.</b> A toll road has two lanes. In the <i>packet lane</i> every car is waved through by the barrier without anyone writing anything down. In the <i>flow lane</i> a clerk records each car's plate and destination, checks the rules once, and then lets that car and its return trip pass quickly. The SRX has both lanes, and its default lane for IPv4 is the flow lane.</p>
<h3>Flow-based mode (the default for IPv4)</h3>
<p>In <b>flow mode</b> the SRX builds sessions and applies security features: zones and policies, NAT, screens, IPsec VPN, application layer gateways, IDP and UTM. All of this module and almost the whole track lives in flow mode. If you configure a security policy and see it working, the traffic was processed in flow mode.</p>
<h3>Packet-based mode (stateless)</h3>
<p>In <b>packet mode</b> a packet is forwarded using routes and Junos firewall filters only. There is no session, no zone and no security policy for that traffic. It is used for protocol families that the flow engine does not handle, and for routing-style deployments where you want no stateful inspection.</p>
<table class="cmp"><tr><th>Question</th><th>Flow mode</th><th>Packet mode</th></tr>
<tr><td>Session table</td><td>Yes</td><td>No</td></tr>
<tr><td>Security policies, zones</td><td>Apply</td><td>Do not apply</td></tr>
<tr><td>NAT, screens, IPsec, IDP, UTM</td><td>Available</td><td>Not available</td></tr>
<tr><td>Filtering tool</td><td>Policies (and filters)</td><td>Firewall filters only</td></tr></table>
<h3>How you choose the mode per family</h3>
<p>The mode is chosen per protocol family under <code>security forwarding-options</code>. IPv4 is flow-based by default. IPv6 is not forwarded until you choose a mode for it, and MPLS and ISO are packet-based families. The simulator models IPv4 flow mode only; the lines below are a reference.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
set security forwarding-options family inet6 mode flow-based
set security forwarding-options family mpls mode packet-based</pre>
<div class="eg"><p><b>Worked example.</b> A branch SRX forwards IPv4 users to the Internet in flow mode: zones, policy and source NAT apply. The same box also carries MPLS labels for a small provider link. MPLS is packet-based, so it bypasses policy and is protected with a firewall filter on the interface instead.</p></div>
<div class="warn"><p><b>Common mistake.</b> Expecting a security policy to filter traffic that is in packet mode, or turning on IPv6 forwarding and forgetting that IPv6 needs its own zones and policies.</p></div>
<div class="exam"><p><b>Exam trap.</b> Features such as NAT, screens, IPsec, IDP and UTM require flow mode. Packet mode means no sessions and no security policies.</p></div>
<div class="scn"><h4>The policy that never matched</h4><p>An engineer wrote a deny policy for an MPLS service and saw zero hits for a week. The traffic was packet-based, so the policy engine never saw it. A firewall filter on the interface did the job.</p><p><b>Lesson:</b> check which mode carries the traffic before you debug the policy.</p></div>
<div class="iv"><p class="q">"What is the difference between flow-based and packet-based mode?"</p><p>Flow mode is stateful: sessions, zones, policies and services such as NAT and VPN. Packet mode is stateless: routing and firewall filters only. IPv4 is flow-based by default on the SRX, and I choose the mode per family with security forwarding-options.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IPv4 defaults to flow mode with sessions and policies.</li><li>Packet mode bypasses zones and policies.</li><li>NAT, screens, IPsec, IDP and UTM need flow mode.</li><li>Mode is set per protocol family.</li></ul></div>`,hi:`<p><b>Analogy.</b> Toll road ki do lanes hain. <i>Packet lane</i> mein har gaadi barrier se bina kuch likhe nikal jaati hai. <i>Flow lane</i> mein ek clerk har gaadi ki plate aur destination likhta hai, rules ek baar check karta hai, aur phir us gaadi aur uski wapsi ko tezi se guzarne deta hai. SRX ke paas dono lanes hain, aur IPv4 ke liye uski default lane flow lane hai.</p>
<h3>Flow-based mode (IPv4 ka default)</h3>
<p><b>Flow mode</b> mein SRX sessions banata hai aur security features lagata hai: zones aur policies, NAT, screens, IPsec VPN, application layer gateways, IDP aur UTM. Yeh poora module aur lagbhag poora track flow mode mein hai. Agar aap security policy configure karke use kaam karta dekhte ho, to traffic flow mode mein process hua tha.</p>
<h3>Packet-based mode (stateless)</h3>
<p><b>Packet mode</b> mein packet sirf routes aur Junos firewall filters se forward hota hai. Us traffic ke liye koi session, zone ya security policy nahi hoti. Yeh un protocol families ke liye use hota hai jo flow engine handle nahi karta, aur routing-style deployments ke liye jahan stateful inspection nahi chahiye.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Flow mode</th><th>Packet mode</th></tr>
<tr><td>Session table</td><td>Haan</td><td>Nahi</td></tr>
<tr><td>Security policies, zones</td><td>Lagte hain</td><td>Nahi lagte</td></tr>
<tr><td>NAT, screens, IPsec, IDP, UTM</td><td>Available</td><td>Available nahi</td></tr>
<tr><td>Filtering tool</td><td>Policies (aur filters)</td><td>Sirf firewall filters</td></tr></table>
<h3>Mode family ke hisaab se kaise chunte ho</h3>
<p>Mode har protocol family ke liye <code>security forwarding-options</code> ke neeche chuna jata hai. IPv4 default mein flow-based hai. IPv6 tab tak forward nahi hota jab tak aap uska mode na chuno, aur MPLS aur ISO packet-based families hain. Simulator sirf IPv4 flow mode model karta hai; neeche ki lines reference hain.</p>
<pre class="code"><span class="c"># Reference configuration (not run in the simulator)</span>
set security forwarding-options family inet6 mode flow-based
set security forwarding-options family mpls mode packet-based</pre>
<div class="eg"><p><b>Worked example.</b> Ek branch SRX IPv4 users ko Internet tak flow mode mein forward karta hai: zones, policy aur source NAT lagte hain. Wahi box ek chhote provider link ke liye MPLS labels bhi carry karta hai. MPLS packet-based hai, isliye woh policy ko bypass karta hai aur interface par firewall filter se protect hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Packet mode ke traffic par security policy ke filter karne ki ummeed rakhna, ya IPv6 forwarding on karke bhool jana ki IPv6 ko apne zones aur policies chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> NAT, screens, IPsec, IDP aur UTM jaise features flow mode maangte hain. Packet mode matlab koi sessions nahi aur koi security policies nahi.</p></div>
<div class="scn"><h4>Policy jo kabhi match nahi hui</h4><p>Ek engineer ne MPLS service ke liye deny policy likhi aur ek hafte tak zero hits dekhe. Traffic packet-based tha, isliye policy engine ne use dekha hi nahi. Interface par firewall filter ne kaam kiya.</p><p><b>Lesson:</b> policy debug karne se pehle check karo ki traffic kaunsa mode carry karta hai.</p></div>
<div class="iv"><p class="q">"Flow-based aur packet-based mode mein kya fark hai?"</p><p>Flow mode stateful hai: sessions, zones, policies aur NAT, VPN jaisi services. Packet mode stateless hai: sirf routing aur firewall filters. SRX par IPv4 default mein flow-based hai, aur main mode har family ke liye security forwarding-options se chunta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IPv4 default mein flow mode hai: sessions aur policies ke saath.</li><li>Packet mode zones aur policies ko bypass karta hai.</li><li>NAT, screens, IPsec, IDP aur UTM ko flow mode chahiye.</li><li>Mode protocol family ke hisaab se set hota hai.</li></ul></div>`}};export{e as default};