var e={id:`server-profiles`,h:{en:`Server profiles and Panorama settings in templates`,hi:`Templates mein server profiles aur Panorama settings`},body:{en:`
<p>A firm keeps a printed list of important phone numbers on the wall of every office: the fire brigade, the electrician, the head office. When a number changes, the head office sends a new sheet to every branch. A <b>server profile</b> is such a list entry for a firewall: it names a server the firewall should talk to, such as a syslog collector, together with the port, the transport and the message format. Because the same collector is used by many firewalls, the profile belongs in a template.</p>

<h3>What a syslog server profile holds</h3>
<table class="tbl"><thead><tr><th>Field</th><th>Meaning</th><th>Lab example</th></tr></thead><tbody>
<tr><td>profile name</td><td>The handle other settings use</td><td>NK-SYSLOG</td></tr>
<tr><td>server entry name</td><td>A label for one destination</td><td>collector1</td></tr>
<tr><td>server</td><td>IP address or name</td><td>192.0.2.99</td></tr>
<tr><td>transport</td><td>UDP, TCP or SSL</td><td>TCP</td></tr>
<tr><td>port</td><td>Destination port</td><td>514</td></tr>
<tr><td>format</td><td>BSD or IETF message style</td><td>IETF</td></tr>
<tr><td>facility</td><td>Syslog facility label</td><td>LOG_USER</td></tr>
</tbody></table>
<p>The lab accepts the UDP, TCP and SSL words, but real SSL, certificates and delivery to a real syslog host are not simulated. Which transports and ports are right for you depends on your collector and your PAN-OS version, so check the documentation for your PAN-OS version.</p>
<pre class="code">PANO&gt; configure
PANO# set template NK-REGION config shared server-profile syslog NK-SYSLOG server collector1 server 192.0.2.99 transport TCP port 514 format IETF facility LOG_USER
PANO# commit
PANO# exit</pre>

<h3>Why profiles belong in a template</h3>
<p>The profile is device configuration: it says where this firewall sends syslog. A log forwarding profile in a device group may refer to the profile by name, for example with <code>send-syslog NK-SYSLOG</code>. In the lab, that reference counts as valid if a profile with that name exists in a template pushed to the firewall or locally on it. So there are two halves in two places: the destination (template) and the rule that uses it (device group). Push order and naming matter here, and the logging module comes back to this.</p>

<h3>The Panorama server setting</h3>
<p>Another small but vital setting is <code>panorama-server</code>, the address of Panorama on the firewall. On a firewall you type it locally with <code>set deviceconfig system panorama-server 192.0.2.50</code>, because without it the firewall cannot be managed at all. In the lab, a template can also carry the Panorama server addresses and other management settings. Be careful: if you push a wrong address to every firewall through a template, you can cut them all off from Panorama in one stroke. Treat this class of setting as high risk, test on a small group first, and keep out-of-band access ready. In the lab the management network is out of band and not drawn, which is also best practice in real life.</p>
<pre class="code"><span class="c">On a firewall, lab command (not part of this module's labs)</span>
NK-PUNE-PA# set deviceconfig system panorama-server 192.0.2.50</pre>

<h3>Variables inside server profiles</h3>
<p>Because the regional collector differs by region, the server address can be a variable of type ip-netmask or fqdn, with a stack-level value. Then one profile design serves all regions, and the south stack points to the south collector. Which fields accept variables is version dependent; check the documentation for your PAN-OS version.</p>

<div class="scn"><h4>Logs that went nowhere</h4><p>After a data centre move, the old syslog server address stayed in one template, and for weeks the audit team received nothing from the south region. A one-line template edit with a stack-level value for the south stack fixed it. The engineer also wrote the collector address in the template description so the next reader knew who owned it.</p></div>

<div class="iv"><p class="q">"Where would you configure the syslog destination for all branch firewalls, and why?"</p><p>In a template server profile, because the destination is device configuration shared by many firewalls. The device group's log forwarding profile then refers to that profile by name. If the collector differs by region I use a variable with a stack-level value.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A server profile defines a destination: server, transport, port, format, facility.</li>
<li>Syslog profiles belong in templates; log forwarding rules in device groups refer to them by name.</li>
<li>Pushing a wrong Panorama address through a template can cut off many firewalls; treat it as high risk.</li>
<li>Real SSL and syslog delivery are not simulated; check documentation for your PAN-OS version.</li>
</ul></div>
`,hi:`
<p>Ek firm har office ki deewar par important phone numbers ki printed list rakhti hai: fire brigade, electrician, head office. Number badle to head office har branch ko nayi sheet bhejta hai. <b>Server profile</b> firewall ke liye aisi hi list entry hai: wo us server ka naam batata hai jisse firewall ko baat karni hai, jaise syslog collector, port, transport aur message format ke saath. Ek hi collector bahut firewalls use karte hain, isliye profile template mein aati hai.</p>

<h3>Syslog server profile mein kya hota hai</h3>
<table class="tbl"><thead><tr><th>Field</th><th>Matlab</th><th>Lab example</th></tr></thead><tbody>
<tr><td>profile name</td><td>Doosri settings isse refer karti hain</td><td>NK-SYSLOG</td></tr>
<tr><td>server entry name</td><td>Ek destination ka label</td><td>collector1</td></tr>
<tr><td>server</td><td>IP address ya naam</td><td>192.0.2.99</td></tr>
<tr><td>transport</td><td>UDP, TCP ya SSL</td><td>TCP</td></tr>
<tr><td>port</td><td>Destination port</td><td>514</td></tr>
<tr><td>format</td><td>BSD ya IETF message style</td><td>IETF</td></tr>
<tr><td>facility</td><td>Syslog facility label</td><td>LOG_USER</td></tr>
</tbody></table>
<p>Lab UDP, TCP aur SSL shabd accept karta hai, lekin real SSL, certificates aur real syslog host tak delivery simulate nahi hoti. Tumhare liye kaunse transports aur ports sahi hain ye tumhare collector aur PAN-OS version par depend karta hai, isliye apne PAN-OS version ki documentation check karo.</p>
<pre class="code">PANO&gt; configure
PANO# set template NK-REGION config shared server-profile syslog NK-SYSLOG server collector1 server 192.0.2.99 transport TCP port 514 format IETF facility LOG_USER
PANO# commit
PANO# exit</pre>

<h3>Profiles template mein kyun</h3>
<p>Profile device configuration hai: wo batata hai ki ye firewall syslog kahan bhejta hai. Device group ka log forwarding profile use naam se refer kar sakta hai, jaise <code>send-syslog NK-SYSLOG</code>. Lab mein ye reference valid maana jaata hai agar us naam ka profile firewall par pushed template mein ya locally maujood ho. To do hisse do jagah hain: destination (template) aur use use karne wala rule (device group). Yahan push order aur naming matter karte hain, aur logging module ismein wapas aayega.</p>

<h3>Panorama server setting</h3>
<p>Ek aur chhoti lekin zaroori setting <code>panorama-server</code> hai, firewall par Panorama ka address. Firewall par ise locally <code>set deviceconfig system panorama-server 192.0.2.50</code> se type karte ho, kyunki iske bina firewall manage hi nahi ho sakta. Lab mein template bhi Panorama server addresses aur doosri management settings le ja sakta hai. Savdhan: agar tum template se har firewall ko galat address push kar do to ek jhatke mein sabko Panorama se kaat sakte ho. Is class ki setting ko high risk maano, pehle chhote group par test karo, aur out-of-band access taiyaar rakho. Lab mein management network out of band hai aur drawn nahi, jo real life ki best practice bhi hai.</p>
<pre class="code"><span class="c">Firewall par, lab command (is module ke labs ka hissa nahi)</span>
NK-PUNE-PA# set deviceconfig system panorama-server 192.0.2.50</pre>

<h3>Server profiles ke andar variables</h3>
<p>Regional collector region ke hisaab se alag hota hai, isliye server address ip-netmask ya fqdn type ka variable ho sakta hai, stack-level value ke saath. Phir ek profile design sab regions ko serve karta hai, aur south stack south collector ko point karta hai. Kaunse fields variables accept karte hain ye version par depend karta hai; apne PAN-OS version ki documentation check karo.</p>

<div class="scn"><h4>Logs jo kahin nahi gaye</h4><p>Data centre move ke baad purana syslog server address ek template mein reh gaya, aur hafton tak audit team ko south region se kuch nahi mila. South stack ke liye stack-level value ke saath ek-line template edit ne fix kiya. Engineer ne collector address template description mein bhi likh diya taaki agla padhne wala jaane ki ye kiska hai.</p></div>

<div class="iv"><p class="q">"Saare branch firewalls ke liye syslog destination kahan configure karoge, aur kyun?"</p><p>Template server profile mein, kyunki destination bahut firewalls ki shared device configuration hai. Device group ka log forwarding profile phir us profile ko naam se refer karta hai. Collector region ke hisaab se alag ho to stack-level value wala variable use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server profile destination define karta hai: server, transport, port, format, facility.</li>
<li>Syslog profiles templates mein; device group ke log forwarding rules unhe naam se refer karte hain.</li>
<li>Template se galat Panorama address push karna bahut firewalls ko kaat sakta hai; high risk maano.</li>
<li>Real SSL aur syslog delivery simulate nahi hoti; PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};