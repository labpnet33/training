var e={id:`security-intelligence`,h:{en:`Security Intelligence: Talos feeds, block lists and monitor-only`,hi:`Security Intelligence: Talos feeds, block lists aur monitor-only`},body:{en:`
<p>Every airline shares a <b>no-fly list</b>. The check-in agent does not need to search a listed person's bag or ask about their trip: the name is on the list, so the answer is no, immediately and cheaply. <b>Security Intelligence (SI)</b> is the no-fly list of Threat Defense. Cisco Talos watches the internet all day and publishes addresses and names that are known to host malware, command-and-control (C2) servers, phishing pages, open proxies and other bad things. Threat Defense downloads those lists and blocks matching traffic <b>before</b> any access control rule is even looked at.</p>

<h3>What SI looks at</h3>
<dl class="terms">
<dt>Network SI</dt><dd>Source or destination IP address against IP lists and feeds. Decided on the first packet.</dd>
<dt>URL SI</dt><dd>The requested URL or host name against URL lists and feeds. Needs a few packets because the URL arrives after the TCP handshake.</dd>
<dt>DNS SI</dt><dd>The domain name inside a DNS query, handled by the <b>DNS policy</b>. Covered in the next chapter.</dd>
<dt>Feed</dt><dd>A list the system downloads and refreshes automatically, such as the Cisco Intelligence Feed from Talos or a custom feed from your own threat-intel server.</dd>
<dt>List</dt><dd>A static list you upload or build by hand. The <b>Global Block List</b> and <b>Global Do-Not-Block List</b> are special lists you can fill directly from an event with a right-click.</dd>
</dl>

<p>The Talos feed is split into <b>categories</b>, for example Attackers, Bogon, Bots, CnC, Cryptomining, Dga, Exploitkit, Malware, Open_proxy, Phishing, Spam, Suspicious and Tor_exit_node. In our simulator the categories are shown as <code>Talos-Malware</code>, <code>Talos-CnC</code>, <code>Talos-Phishing</code>, <code>Talos-Bogon</code> and <code>Talos-Tor-Exit</code>. For each category you choose an action.</p>

<table class="cmp"><tr><th>Setting</th><th>What happens</th><th>Event</th></tr>
<tr><td>Block</td><td>flow dropped before the access control rules</td><td>SI event, connection Reason IP Block or URL Block</td></tr>
<tr><td>Monitor-only</td><td>flow continues to the rules; only logged</td><td>SI event with action Monitor</td></tr>
<tr><td>Do-Not-Block</td><td>overrides a block for that entry, flow continues</td><td>none from SI</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security Intelligence decision">
<rect x="20" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">New flow</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">src, dst, URL</text>
<rect x="170" y="70" width="140" height="80" rx="10" fill="#fde68a"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">On Do-Not-Block?</text><text x="240" y="120" text-anchor="middle" class="svg-muted" font-size="12">yes: skip SI</text>
<rect x="350" y="70" width="130" height="80" rx="10" fill="#fed7aa"/><text x="415" y="100" text-anchor="middle" class="svg-ink" font-size="13">On a Block</text><text x="415" y="118" text-anchor="middle" class="svg-ink" font-size="13">list or feed?</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fecaca"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">Drop + event</text>
<rect x="520" y="150" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="176" text-anchor="middle" class="svg-ink" font-size="13">Access rules</text><text x="575" y="194" text-anchor="middle" class="svg-muted" font-size="12">(monitor logs)</text>
<line x1="130" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="310" y1="110" x2="350" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="95" x2="520" y2="50" stroke="#64748b" stroke-width="2"/><text x="485" y="66" class="svg-muted" font-size="12">yes</text>
<line x1="480" y1="125" x2="520" y2="175" stroke="#64748b" stroke-width="2"/><text x="485" y="165" class="svg-muted" font-size="12">no</text>
<line x1="240" y1="150" x2="520" y2="190" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg><p class="cap">Do-Not-Block beats Block; a Block match ends the flow before any access control rule runs.</p></div>

<h3>Why it matters</h3>
<p>SI is the cheapest protection you have. A lookup in a reputation table costs almost nothing compared with running thousands of intrusion rules on a flow. It also catches what other layers miss: a C2 server talking plain TLS has no signature to match, but its address is on the CnC feed. Talos updates the feed continuously, and <b>feed updates do not need a deploy</b>; only changes to your SI configuration do.</p>

<h3>Configuring SI (Lab: Security Intelligence and a DNS sinkhole)</h3>
<p>Threat intel says a C2 server lives at <b>192.0.2.66</b> (BADHOST). First prove the risk from PC1, then block it.</p>
<pre class="code">PC1&gt; curl 192.0.2.66
&lt;html&gt;&lt;body&gt;&lt;h1&gt;update service&lt;/h1&gt;...    <span class="c">! reachable today: bad</span>

<span class="c">! Management Center</span>
Objects &gt; Security Intelligence  (or NK-ACP &gt; Security Intelligence tab)
  Networks:  Talos-Malware = Block
             Talos-CnC     = Block
  Logging:   enabled for block and monitor events
Deploy</pre>

<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">curl: (28) Failed to connect to 192.0.2.66 port 80 after 2001 ms: Timeout was reached</span>
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NK Daily News&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

Analysis &gt; Connections &gt; Security Intelligence Events
Time      Action  Reason    Initiator   Responder    SI Category
10:12:41  Block   <span class="hl">IP Block</span>  10.0.1.10   192.0.2.66   <span class="hl">Talos-Malware</span></pre>

<p>Notice the category: 192.0.2.66 is in both Talos-Malware and Talos-CnC, and the event names the first list that matched. On the device, <code>show asp drop</code> counts the drops under "Blocked by Security Intelligence", and <code>system support trace</code> prints a line such as <code>Security Intelligence: Network block, list Talos-Malware</code>.</p>

<div class="eg"><p><b>Worked example: monitor first.</b> A hospital wants to enable the Tor_exit_node category but fears it will break a research group. Week 1 they set it to <b>Monitor-only</b>: 37 SI events, all from one lab PC used for privacy research. They add an access control rule that allows that PC to Tor and, in week 2, switch the category to Block. Everybody else is now protected and the research group still works.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding a partner's address to the Do-Not-Block list "because it was blocked once". Do-Not-Block disables SI for that address <b>forever</b>, including when the partner is really compromised. Investigate the event first; if it is a false positive, report it to Talos and use the narrowest exception possible with an expiry review.</p></div>

<div class="exam"><p><b>Exam trap.</b> SI runs <b>before</b> access control rules, so you cannot "allow" a blocked IP with a normal Allow or Trust rule. You must use the Do-Not-Block list or remove the entry. And monitor-only SI never blocks: the flow is decided by the rules.</p></div>

<div class="scn"><h4>The crypto-miner on the build server</h4><p>A software company saw CPU alarms on a Linux build server. The Threat Defense had SI enabled, but the Cryptomining category was set to Monitor-only from a pilot months earlier. SI events showed the server contacting a mining pool every minute, all marked Monitor. The engineer set the category to Block, deployed, and the security team cleaned the server. A weekly report on monitor-only SI events was added so pilots never stay silent again.</p><p><b>Lesson:</b> monitor-only is a phase, not a destination.</p></div>

<div class="iv"><p class="q">"Where does Security Intelligence sit in the policy order, and why is that useful?"</p><p>After the prefilter and before the decryption policy and access control rules. It is a cheap reputation lookup, so known-bad IPs, URLs and domains are dropped before expensive deep inspection, and a broad Trust or Allow rule cannot accidentally let them through. Mention feeds versus lists, Block versus Monitor-only, the Global Do-Not-Block list, that feed updates need no deploy, and that SI requires the IPS license.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SI blocks known-bad IPs, URLs and domains from Talos feeds and your own lists, before the rules.</li>
<li>Per category: Block, Monitor-only; Do-Not-Block overrides Block.</li>
<li>Feeds refresh automatically without a deploy; SI configuration changes need a deploy.</li>
<li>Events: Security Intelligence Events, connection Reason IP Block or URL Block.</li>
<li>Use monitor-only as a short pilot, then enforce.</li>
</ul></div>
`,hi:`
<p>Har airline ek <b>no-fly list</b> share karti hai. Check-in agent ko listed person ka bag search karne ya trip ke baare mein poochhne ki zaroorat nahi: naam list par hai, isliye jawab turant aur saste mein "nahi" hai. <b>Security Intelligence (SI)</b> Threat Defense ki no-fly list hai. Cisco Talos poore din internet dekhta hai aur aise addresses aur naam publish karta hai jo malware, command-and-control (C2) servers, phishing pages, open proxies aur doosri buri cheezein host karne ke liye jaane jaate hain. Threat Defense woh lists download karta hai aur matching traffic ko kisi bhi access control rule ko dekhne se <b>pehle</b> block kar deta hai.</p>

<h3>SI kya dekhti hai</h3>
<dl class="terms">
<dt>Network SI</dt><dd>Source ya destination IP address ko IP lists aur feeds se milana. Pehle packet par decide hota hai.</dd>
<dt>URL SI</dt><dd>Maanga gaya URL ya host name URL lists aur feeds se milana. Kuch packets chahiye kyunki URL TCP handshake ke baad aata hai.</dd>
<dt>DNS SI</dt><dd>DNS query ke andar ka domain name, jise <b>DNS policy</b> handle karti hai. Agle chapter mein cover hai.</dd>
<dt>Feed</dt><dd>Aisi list jo system apne aap download aur refresh karta hai, jaise Talos ka Cisco Intelligence Feed ya aapke apne threat-intel server ka custom feed.</dd>
<dt>List</dt><dd>Static list jo aap upload karte ho ya haath se banate ho. <b>Global Block List</b> aur <b>Global Do-Not-Block List</b> special lists hain jinhe aap event par right-click karke seedha bhar sakte ho.</dd>
</dl>

<p>Talos feed <b>categories</b> mein bata hai, jaise Attackers, Bogon, Bots, CnC, Cryptomining, Dga, Exploitkit, Malware, Open_proxy, Phishing, Spam, Suspicious aur Tor_exit_node. Hamare simulator mein categories <code>Talos-Malware</code>, <code>Talos-CnC</code>, <code>Talos-Phishing</code>, <code>Talos-Bogon</code> aur <code>Talos-Tor-Exit</code> ke roop mein dikhti hain. Har category ke liye aap ek action chunte ho.</p>

<table class="cmp"><tr><th>Setting</th><th>Kya hota hai</th><th>Event</th></tr>
<tr><td>Block</td><td>access control rules se pehle flow drop</td><td>SI event, connection Reason IP Block ya URL Block</td></tr>
<tr><td>Monitor-only</td><td>flow rules tak jaata hai; sirf log</td><td>action Monitor wala SI event</td></tr>
<tr><td>Do-Not-Block</td><td>us entry ke liye block override karta hai, flow aage jaata hai</td><td>SI se koi nahi</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Security Intelligence ka faisla">
<rect x="20" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="75" y="106" text-anchor="middle" class="svg-ink" font-size="13">Naya flow</text><text x="75" y="124" text-anchor="middle" class="svg-muted" font-size="12">src, dst, URL</text>
<rect x="170" y="70" width="140" height="80" rx="10" fill="#fde68a"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="13">Do-Not-Block par?</text><text x="240" y="120" text-anchor="middle" class="svg-muted" font-size="12">haan: SI skip</text>
<rect x="350" y="70" width="130" height="80" rx="10" fill="#fed7aa"/><text x="415" y="100" text-anchor="middle" class="svg-ink" font-size="13">Block list ya</text><text x="415" y="118" text-anchor="middle" class="svg-ink" font-size="13">feed par?</text>
<rect x="520" y="20" width="110" height="50" rx="8" fill="#fecaca"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">Drop + event</text>
<rect x="520" y="150" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="176" text-anchor="middle" class="svg-ink" font-size="13">Access rules</text><text x="575" y="194" text-anchor="middle" class="svg-muted" font-size="12">(monitor log)</text>
<line x1="130" y1="110" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="310" y1="110" x2="350" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="95" x2="520" y2="50" stroke="#64748b" stroke-width="2"/><text x="485" y="66" class="svg-muted" font-size="12">haan</text>
<line x1="480" y1="125" x2="520" y2="175" stroke="#64748b" stroke-width="2"/><text x="485" y="165" class="svg-muted" font-size="12">nahi</text>
<line x1="240" y1="150" x2="520" y2="190" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg><p class="cap">Do-Not-Block Block ko harata hai; Block match kisi access control rule ke chalne se pehle flow khatam kar deta hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>SI aapki sabse sasti protection hai. Reputation table mein lookup ki keemat flow par hazaron intrusion rules chalane ke muqable lagbhag zero hai. Yeh woh bhi pakadti hai jo doosri layers miss kar deti hain: plain TLS bolne wale C2 server ka koi signature nahi hota, lekin uska address CnC feed par hota hai. Talos feed lagataar update karta hai, aur <b>feed updates ko deploy nahi chahiye</b>; sirf aapki SI configuration ke changes ko chahiye.</p>

<h3>SI configure karna (Lab: Security Intelligence aur DNS sinkhole)</h3>
<p>Threat intel kehta hai ki ek C2 server <b>192.0.2.66</b> (BADHOST) par hai. Pehle PC1 se risk saabit karo, phir use block karo.</p>
<pre class="code">PC1&gt; curl 192.0.2.66
&lt;html&gt;&lt;body&gt;&lt;h1&gt;update service&lt;/h1&gt;...    <span class="c">! aaj reachable hai: bura</span>

<span class="c">! Management Center</span>
Objects &gt; Security Intelligence  (ya NK-ACP &gt; Security Intelligence tab)
  Networks:  Talos-Malware = Block
             Talos-CnC     = Block
  Logging:   block aur monitor events ke liye enabled
Deploy</pre>

<pre class="out">PC1&gt; curl 192.0.2.66
<span class="hl">curl: (28) Failed to connect to 192.0.2.66 port 80 after 2001 ms: Timeout was reached</span>
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NK Daily News&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

Analysis &gt; Connections &gt; Security Intelligence Events
Time      Action  Reason    Initiator   Responder    SI Category
10:12:41  Block   <span class="hl">IP Block</span>  10.0.1.10   192.0.2.66   <span class="hl">Talos-Malware</span></pre>

<p>Category par dhyan do: 192.0.2.66 Talos-Malware aur Talos-CnC dono mein hai, aur event pehli match hui list ka naam deta hai. Device par <code>show asp drop</code> in drops ko "Blocked by Security Intelligence" ke neeche ginta hai, aur <code>system support trace</code> <code>Security Intelligence: Network block, list Talos-Malware</code> jaisi line print karta hai.</p>

<div class="eg"><p><b>Worked example: pehle monitor.</b> Ek hospital Tor_exit_node category enable karna chahta hai lekin dar hai ki ek research group toot jaayega. Week 1 mein woh ise <b>Monitor-only</b> rakhte hain: 37 SI events, sab ek lab PC se jo privacy research ke liye use hota hai. Woh ek access control rule jodte hain jo us PC ko Tor allow karti hai aur week 2 mein category ko Block kar dete hain. Baaki sab ab protected hain aur research group phir bhi kaam karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Partner ka address Do-Not-Block list mein daal dena "kyunki ek baar block hua tha". Do-Not-Block us address ke liye SI ko <b>hamesha</b> ke liye band kar deta hai, tab bhi jab partner sach mein compromised ho. Pehle event investigate karo; agar false positive hai, to Talos ko report karo aur expiry review ke saath sabse narrow exception use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SI access control rules se <b>pehle</b> chalti hai, isliye aap blocked IP ko normal Allow ya Trust rule se "allow" nahi kar sakte. Aapko Do-Not-Block list use karni hogi ya entry hatani hogi. Aur monitor-only SI kabhi block nahi karti: flow ka faisla rules karti hain.</p></div>

<div class="scn"><h4>Build server par crypto-miner</h4><p>Ek software company ko Linux build server par CPU alarms dikhe. Threat Defense par SI enabled thi, lekin Cryptomining category mahino pehle ke pilot se Monitor-only par thi. SI events mein server har minute mining pool se contact kar raha tha, sab Monitor marked. Engineer ne category Block ki, deploy kiya, aur security team ne server saaf kiya. Monitor-only SI events par weekly report jodi gayi taaki pilots dobara kabhi chup na rahein.</p><p><b>Lesson:</b> monitor-only ek phase hai, manzil nahi.</p></div>

<div class="iv"><p class="q">"Policy order mein Security Intelligence kahan baithti hai, aur yeh useful kyun hai?"</p><p>Prefilter ke baad aur decryption policy aur access control rules se pehle. Yeh sasta reputation lookup hai, isliye known-bad IPs, URLs aur domains mehenge deep inspection se pehle drop ho jaate hain, aur koi broad Trust ya Allow rule galti se unhe jaane nahi de sakti. Feeds vs lists, Block vs Monitor-only, Global Do-Not-Block list, yeh ki feed updates ko deploy nahi chahiye, aur yeh ki SI ko IPS license chahiye, yeh sab batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SI Talos feeds aur aapki lists se known-bad IPs, URLs aur domains ko rules se pehle block karti hai.</li>
<li>Har category par: Block, Monitor-only; Do-Not-Block Block ko override karta hai.</li>
<li>Feeds bina deploy ke apne aap refresh hote hain; SI configuration changes ko deploy chahiye.</li>
<li>Events: Security Intelligence Events, connection Reason IP Block ya URL Block.</li>
<li>Monitor-only ko chhote pilot ki tarah use karo, phir enforce karo.</li>
</ul></div>
`}};export{e as default};