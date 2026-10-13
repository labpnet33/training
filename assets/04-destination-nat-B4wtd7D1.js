var e={id:`destination-nat`,h:{en:`Destination NAT: publish the DMZ web server`,hi:`Destination NAT: DMZ web server publish karo`},body:{en:`
<p>Outbound users are only half of a firewall's job. Customers also need to reach <b>your</b> servers. The web server WEB sits in the DMZ with the private address 10.0.2.10. Customers on the internet cannot reach a private address, so you advertise a <b>public address</b>, 203.0.113.3, and let the firewall translate the destination to the real server. Think of a company's public reception number that the receptionist forwards to an internal extension.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Destination NAT to the DMZ"><rect x="20" y="20" width="130" height="74" rx="10" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">to 203.0.113.3</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">PA1</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">dest NAT</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">10.0.2.10 dmz</text></svg><p class="cap">The client sends to the public address; the firewall rewrites the destination to the DMZ server.</p></div>
<h3>Three objects and two rules</h3>
<ol><li>Address object <code>WEB-PUBLIC</code> = 203.0.113.3 (the pre-NAT address).</li><li>Address object <code>WEB-PRIVATE</code> = 10.0.2.10 (the translated address).</li><li>A <b>NAT rule</b> from untrust to untrust, destination <code>WEB-PUBLIC</code>, service HTTP, translating the destination to <code>WEB-PRIVATE</code>.</li><li>A <b>security rule</b> from untrust to dmz, destination <code>WEB-PUBLIC</code>, application web-browsing, service application-default, allow.</li></ol>
<p>First the objects and the NAT rule, committed together:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set address WEB-PUBLIC ip-netmask 203.0.113.3
[edit]
admin@NK-PUNE-PA# set address WEB-PRIVATE ip-netmask 10.0.2.10
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase nat rules WEB-DNAT from untrust to untrust source any destination WEB-PUBLIC service service-h&#116;tp destination-translation translated-address WEB-PRIVATE</span>
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Before the security rule exists, the test commands show the problem clearly. The NAT decision is correct, but the security decision is the predefined deny:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
WEB-DNAT; index: 2 {
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Add the security rule with the <b>post-NAT zone dmz</b> and the <b>pre-NAT address WEB-PUBLIC</b>:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase security rules WEB-IN from untrust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow
[edit]
admin@NK-PUNE-PA# commit
Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out"><span class="hl">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80</span>
<span class="hl">"WEB-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
<span class="hl">        to dmz;</span>
<span class="hl">        destination WEB-PUBLIC;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Now test from the internet side. The web page loads; SSH and ping do not, because the rule allows only web-browsing:</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">INET-SRV&gt; ssh -l admin 203.0.113.3
<span class="hl">ssh: connect to host 203.0.113.3 port 22: Connection timed out</span>
INET-SRV&gt; ping 203.0.113.3 -c 1
<span class="hl">203.0.113.3 icmp_seq=1 timeout</span></pre>
<p>The session table records destination NAT with the flag <b>ND</b>. Note the translated address in the second line: the destination in brackets is the real server.</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         web-browsing   ACTIVE  FLOW ND    8.8.8.8[64251]/untrust/6  (8.8.8.8[64251])</span>
<span class="hl">vsys1                                          203.0.113.3[80]/dmz  (10.0.2.10[80])</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9361
Session             9361
	c2s flow:
		source:      8.8.8.8 [untrust]
		dst:         203.0.113.3
		sport:       64251           dport:      80
	s2c flow:
		source:      10.0.2.10 [dmz]
		dst:         8.8.8.8
		sport:       80              dport:      64251
	total byte count(c2s)                : 300
	total byte count(s2c)                : 300
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	application                          : web-browsing
<span class="hl">	rule                                 : WEB-IN</span>
<span class="hl">	address/port translation             : destination</span>
<span class="hl">	nat-rule                             : WEB-DNAT(vsys1)</span>
	ingress interface                    : ethernet1/1
<span class="hl">	egress interface                     : ethernet1/3</span>
<span class="hl">	session QoS rule                     : N/A (class 4)</span></pre>
<p>The details name the security rule <code>WEB-IN</code>, the NAT rule <code>WEB-DNAT</code>, the translation type <code>destination</code> and the egress interface <code>ethernet1/3</code> (the DMZ).</p>
<div class="note"><p><b>Why the ISP finds 203.0.113.3.</b> The address 203.0.113.3 is in the same subnet as the firewall's WAN interface (203.0.113.0/29), so the firewall answers ARP requests for it and the ISP router sends the packets to the firewall without extra configuration. If the public address were in a different subnet, the ISP would have to route it to the firewall.</p></div>
<div class="warn"><p><b>Common mistake.</b> Allowing the whole host to the world. Always limit the NAT rule with the service and the security rule with the application, so that only web traffic reaches the server.</p></div>
<div class="exam"><p><b>Exam trap.</b> For destination NAT of a DMZ server the NAT rule has <b>untrust to untrust</b> because the public address is routed out of the untrust interface. The security rule is <b>untrust to dmz</b>. If you reverse these, the traffic never matches.</p></div>
<div class="scn"><h4>Launch day for the customer portal</h4><p>The portal went live and customers in Delhi reported timeouts while the internal team saw the site fine. The NAT rule matched correctly, and the security rule used the private address of the server. The test command for the public address showed <code>interzone-default</code>. The engineer changed the destination to the public address object and committed; customers connected within seconds.</p><p><b>Lesson:</b> internal users hit the private address, so internal tests can hide a pre-NAT mistake.</p></div>
<div class="iv"><p class="q">"How do you publish a DMZ server on a public IP on a Palo Alto firewall?"</p><p>I create address objects for the public and private addresses. The NAT rule is from untrust to untrust (pre-NAT zones) with the public address as destination, the required service, and the private address as the destination translation. The security rule is from untrust to dmz (post-NAT zone) with the public address (pre-NAT) as destination and the exact application with application-default. Then I verify with the two test commands and the ND flag in the session table.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>DNAT needs two rules: a NAT rule and a security rule.</li><li>NAT rule zones: untrust to untrust. Security rule zones: untrust to dmz.</li><li>Security destination is the public (pre-NAT) address.</li><li>The ND flag marks destination NAT in the session table.</li></ul></div>
`,hi:`
<p>Outbound users firewall ke kaam ka sirf aadha hissa hain. Customers ko <b>aapke</b> servers tak bhi pahunchna hai. Web server WEB DMZ mein private address 10.0.2.10 par hai. Internet ke customers private address tak nahi pahunch sakte, isliye aap ek <b>public address</b>, 203.0.113.3, advertise karte ho aur firewall ko destination ko asli server mein translate karne dete ho. Company ke public reception number ki tarah socho jise receptionist internal extension par forward karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="DMZ ke liye destination NAT"><rect x="20" y="20" width="130" height="74" rx="10" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="85" y="72" text-anchor="middle" class="svg-muted" font-size="11">8.8.8.8</text><line x1="153" y1="57" x2="173" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="173,57 167,53 167,61" fill="#64748b"/><rect x="176" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="241" y="50" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="241" y="72" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.3 tak</text><line x1="309" y1="57" x2="329" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="329,57 323,53 323,61" fill="#64748b"/><rect x="332" y="20" width="130" height="74" rx="10" fill="#fde68a"/><text x="397" y="50" text-anchor="middle" class="svg-ink" font-size="13">PA1</text><text x="397" y="72" text-anchor="middle" class="svg-muted" font-size="11">dest NAT</text><line x1="465" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="485,57 479,53 479,61" fill="#64748b"/><rect x="488" y="20" width="130" height="74" rx="10" fill="#bbf7d0"/><text x="553" y="50" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="553" y="72" text-anchor="middle" class="svg-muted" font-size="11">10.0.2.10 dmz</text></svg><p class="cap">Client public address par bhejta hai; firewall destination ko DMZ server mein badal deta hai.</p></div>
<h3>Teen objects aur do rules</h3>
<ol><li>Address object <code>WEB-PUBLIC</code> = 203.0.113.3 (pre-NAT address).</li><li>Address object <code>WEB-PRIVATE</code> = 10.0.2.10 (translated address).</li><li>Ek <b>NAT rule</b> from untrust to untrust, destination <code>WEB-PUBLIC</code>, service HTTP, destination ko <code>WEB-PRIVATE</code> mein translate karti hai.</li><li>Ek <b>security rule</b> from untrust to dmz, destination <code>WEB-PUBLIC</code>, application web-browsing, service application-default, allow.</li></ol>
<p>Pehle objects aur NAT rule, saath commit:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set address WEB-PUBLIC ip-netmask 203.0.113.3
[edit]
admin@NK-PUNE-PA# set address WEB-PRIVATE ip-netmask 10.0.2.10
[edit]
<span class="hl">admin@NK-PUNE-PA# set rulebase nat rules WEB-DNAT from untrust to untrust source any destination WEB-PUBLIC service service-h&#116;tp destination-translation translated-address WEB-PRIVATE</span>
[edit]
admin@NK-PUNE-PA# commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<p>Security rule banne se pehle test commands samasya saaf dikhate hain. NAT decision sahi hai, lekin security decision predefined deny hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test nat-policy-match from untrust to untrust source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
WEB-DNAT; index: 2 {
        nat-type ipv4;
        from untrust;
        source any;
        to untrust;
        to-interface  ;
        destination WEB-PUBLIC;
        service service-h&#116;tp;
<span class="hl">        translate-to "dst: 10.0.2.10";</span>
        terminal no;
}</pre>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Security rule <b>post-NAT zone dmz</b> aur <b>pre-NAT address WEB-PUBLIC</b> ke saath jodo:</p>
<pre class="out">admin@NK-PUNE-PA&gt; configure
Entering configuration mode
[edit]
admin@NK-PUNE-PA# set rulebase security rules WEB-IN from untrust to dmz source any destination WEB-PUBLIC application web-browsing service application-default action allow
[edit]
admin@NK-PUNE-PA# commit
Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span>

[edit]
admin@NK-PUNE-PA# exit
Exiting configuration mode</pre>
<pre class="out"><span class="hl">admin@NK-PUNE-PA&gt; test security-policy-match from untrust to dmz source 8.8.8.8 destination 203.0.113.3 protocol 6 destination-port 80</span>
<span class="hl">"WEB-IN; index: 2" {</span>
        from untrust;
        source any;
        source-region none;
<span class="hl">        to dmz;</span>
<span class="hl">        destination WEB-PUBLIC;</span>
        destination-region none;
        category any;
        application/service web-browsing/application-default;
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Ab internet side se test karo. Web page load hota hai; SSH aur ping nahi, kyunki rule sirf web-browsing allow karti hai:</p>
<pre class="out">INET-SRV&gt; curl 203.0.113.3
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;WEB&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<pre class="out">INET-SRV&gt; ssh -l admin 203.0.113.3
<span class="hl">ssh: connect to host 203.0.113.3 port 22: Connection timed out</span>
INET-SRV&gt; ping 203.0.113.3 -c 1
<span class="hl">203.0.113.3 icmp_seq=1 timeout</span></pre>
<p>Session table destination NAT ko flag <b>ND</b> se record karti hai. Doosri line ka translated address dekho: bracket mein destination asli server hai.</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session all
--------------------------------------------------------------------------------
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
--------------------------------------------------------------------------------
<span class="hl">9361         web-browsing   ACTIVE  FLOW ND    8.8.8.8[64251]/untrust/6  (8.8.8.8[64251])</span>
<span class="hl">vsys1                                          203.0.113.3[80]/dmz  (10.0.2.10[80])</span></pre>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9361
Session             9361
	c2s flow:
		source:      8.8.8.8 [untrust]
		dst:         203.0.113.3
		sport:       64251           dport:      80
	s2c flow:
		source:      10.0.2.10 [dmz]
		dst:         8.8.8.8
		sport:       80              dport:      64251
	total byte count(c2s)                : 300
	total byte count(s2c)                : 300
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	application                          : web-browsing
<span class="hl">	rule                                 : WEB-IN</span>
<span class="hl">	address/port translation             : destination</span>
<span class="hl">	nat-rule                             : WEB-DNAT(vsys1)</span>
	ingress interface                    : ethernet1/1
<span class="hl">	egress interface                     : ethernet1/3</span>
<span class="hl">	session QoS rule                     : N/A (class 4)</span></pre>
<p>Details security rule <code>WEB-IN</code>, NAT rule <code>WEB-DNAT</code>, translation type <code>destination</code> aur egress interface <code>ethernet1/3</code> (DMZ) ka naam batati hain.</p>
<div class="note"><p><b>ISP ko 203.0.113.3 kaise milta hai.</b> Address 203.0.113.3 firewall ke WAN interface ke subnet (203.0.113.0/29) mein hi hai, isliye firewall uske ARP requests ka jawab deta hai aur ISP router bina extra configuration ke packets firewall ko bhejta hai. Public address alag subnet mein hota to ISP ko use firewall ki taraf route karna padta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Poora host duniya ke liye khol dena. NAT rule ko service se aur security rule ko application se limit karo, taaki server tak sirf web traffic pahunche.</p></div>
<div class="exam"><p><b>Exam trap.</b> DMZ server ke destination NAT mein NAT rule <b>untrust to untrust</b> hoti hai kyunki public address untrust interface se route hota hai. Security rule <b>untrust to dmz</b> hoti hai. Inhe ulta karo to traffic kabhi match nahi karta.</p></div>
<div class="scn"><h4>Customer portal ka launch day</h4><p>Portal live hua aur Delhi ke customers ne timeout bataya jabki internal team ko site theek dikh rahi thi. NAT rule sahi match ho rahi thi, aur security rule server ka private address use kar rahi thi. Public address ke liye test command ne <code>interzone-default</code> dikhaya. Engineer ne destination public address object kiya aur commit kiya; customers kuch seconds mein connect ho gaye.</p><p><b>Lesson:</b> Internal users private address par jaate hain, isliye internal tests pre-NAT galti chhupa sakte hain.</p></div>
<div class="iv"><p class="q">"Palo Alto firewall par DMZ server ko public IP par kaise publish karte ho?"</p><p>Main public aur private addresses ke address objects banata hoon. NAT rule from untrust to untrust (pre-NAT zones) hoti hai, destination public address, zaroori service, aur destination translation mein private address. Security rule from untrust to dmz (post-NAT zone) hoti hai, destination public address (pre-NAT) aur exact application application-default ke saath. Phir do test commands aur session table ke ND flag se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>DNAT ko do rules chahiye: NAT rule aur security rule.</li><li>NAT rule zones: untrust to untrust. Security rule zones: untrust to dmz.</li><li>Security destination public (pre-NAT) address hai.</li><li>Session table mein ND flag destination NAT dikhata hai.</li></ul></div>
`}};export{e as default};