var e={id:`ports-2`,h:{en:`Ports and protocols, part 2: ports 161 to 5061, memory aids and the lab`,hi:`Ports aur protocols, part 2: ports 161 se 5061, memory aids aur lab`},body:{en:`
<p>This chapter completes the N10-009 port list, gives you a system for remembering all twenty entries, and walks through the lab <b>Ports and protocols in action</b>, where you watch DNS and HTTPS use their real ports in a capture.</p>

<h3>The second ten services</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Transport</th><th>What to know</th><th>Memory aid</th></tr>
<tr><td>161, 162</td><td>SNMP</td><td>UDP</td><td>Monitoring. The manager polls agents on 161; agents send traps to the manager on 162. Use SNMPv3 for authentication and encryption.</td><td>Ask on 161, the device shouts back one higher on 162.</td></tr>
<tr><td>389</td><td>LDAP</td><td>TCP (and UDP)</td><td>Directory queries: users, groups, computers (for example Active Directory). Cleartext by default.</td><td>389 is the directory's phone number; RDP (3389) borrows it.</td></tr>
<tr><td>443</td><td>HTTPS</td><td>TCP (and UDP for HTTP/3)</td><td>HTTP inside TLS. Also used by many SSL VPNs.</td><td>443 and 445 are neighbours: S for Secure web, S for Share.</td></tr>
<tr><td>445</td><td>SMB</td><td>TCP</td><td>Windows file and printer sharing, directly over TCP. Never expose it to the internet.</td><td>Two doors after secure web.</td></tr>
<tr><td>514</td><td>Syslog</td><td>UDP</td><td>Devices send log messages to a central syslog server. TLS-protected syslog uses TCP 6514.</td><td>Logs (514) come before letters (587) in the 500s.</td></tr>
<tr><td>587</td><td>SMTPS</td><td>TCP</td><td>Authenticated, encrypted mail submission from clients (STARTTLS). You may also meet 465 for implicit TLS.</td><td>Secure mail lives next to the logs in the 500s.</td></tr>
<tr><td>636</td><td>LDAPS</td><td>TCP</td><td>LDAP over TLS.</td><td>6-3-6 is a palindrome: a mirror shows the secure copy.</td></tr>
<tr><td>1433</td><td>SQL Server</td><td>TCP</td><td>Microsoft SQL Server database connections.</td><td>143 was the old pager code for "I love you"; DBAs love SQL, add a 3.</td></tr>
<tr><td>3389</td><td>RDP</td><td>TCP (and UDP)</td><td>Remote Desktop to Windows machines. Put it behind a VPN or gateway, never raw on the internet.</td><td>A 3 in front of LDAP's 389: both live in Windows domains.</td></tr>
<tr><td>5060, 5061</td><td>SIP</td><td>TCP/UDP 5060, TCP 5061</td><td>Sets up, modifies and tears down voice and video calls. 5061 is SIP over TLS. The voice itself travels in RTP on high UDP ports.</td><td>Like SNMP, the second role is one higher: secure SIP 5061.</td></tr>
</table>

<h3>A system for all twenty</h3>
<p>Do not learn twenty random numbers. Learn them in <b>families</b> and in <b>secure pairs</b>.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Ports grouped by family and secure pairs">
<rect x="10" y="10" width="200" height="118" rx="8" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Manage devices</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">SSH 22, Telnet 23</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">SNMP 161/162, Syslog 514</text><text x="110" y="94" text-anchor="middle" class="svg-muted" font-size="12">NTP 123, TFTP 69</text><text x="110" y="114" text-anchor="middle" class="svg-muted" font-size="12">RDP 3389</text>
<rect x="220" y="10" width="200" height="118" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Files and data</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">FTP 20/21, SFTP 22</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">SMB 445</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">SQL Server 1433</text>
<rect x="430" y="10" width="200" height="118" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core services</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">DNS 53, DHCP 67/68</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">HTTP 80, HTTPS 443</text><text x="530" y="94" text-anchor="middle" class="svg-muted" font-size="12">LDAP 389, LDAPS 636</text><text x="530" y="114" text-anchor="middle" class="svg-muted" font-size="12">SMTP 25, SMTPS 587, SIP</text>
<rect x="10" y="142" width="620" height="120" rx="8" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">Insecure to secure pairs</text>
<text x="170" y="190" text-anchor="middle" class="svg-ink" font-size="12">Telnet 23 to SSH 22</text><text x="470" y="190" text-anchor="middle" class="svg-ink" font-size="12">HTTP 80 to HTTPS 443</text>
<text x="170" y="212" text-anchor="middle" class="svg-ink" font-size="12">FTP 20/21 to SFTP 22</text><text x="470" y="212" text-anchor="middle" class="svg-ink" font-size="12">LDAP 389 to LDAPS 636</text>
<text x="170" y="234" text-anchor="middle" class="svg-ink" font-size="12">SMTP 25 to SMTPS 587</text><text x="470" y="234" text-anchor="middle" class="svg-ink" font-size="12">SIP 5060 to SIP-TLS 5061</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">SNMPv1/v2c to SNMPv3: same ports, secure version</text>
</svg><p class="cap">Families help with scenario questions; secure pairs help with "which should replace" questions.</p></div>

<p><b>UDP list trick.</b> The services on UDP in the list are the "small, fast, fire-and-forget" ones: <b>DHCP, TFTP, NTP, SNMP, syslog</b> and DNS queries. A phrase to remember them: "<b>D</b>on't <b>T</b>alk, <b>N</b>ot <b>S</b>o <b>S</b>low" (DHCP, TFTP, NTP, SNMP, Syslog). Everything else in the list is TCP, with DNS, SIP, RDP, LDAP and HTTPS/3 also using UDP.</p>

<h3>The lab: watching real ports</h3>
<p>In the lab, R1 acts as the office DNS server: it has <code>ip dns server</code> and a host entry <code>ip host web.nwk.lab 10.0.20.10</code>. SRV runs a web service on ports 80 and 443. First, point PC1 at the DNS server and resolve the name.</p>
<pre class="code"><span class="c">! on PC1</span>
PC1&gt; ip dns 10.0.10.1
PC1&gt; nslookup web.nwk.lab</pre>
<pre class="out"><span class="hl">Server:         10.0.10.1
Address:        10.0.10.1#53</span>

Name:   web.nwk.lab
<span class="hl">Address: 10.0.20.10</span></pre>
<p>The "#53" tells you the query went to port 53. Now open the site by name over both web protocols. Each command first resolves the name, then opens a TCP connection.</p>
<pre class="code">PC1&gt; curl web.nwk.lab
PC1&gt; curl h&#116;tps://web.nwk.lab</pre>
<pre class="out">PC1&gt; curl web.nwk.lab
&lt;html&gt;&lt;body&gt;&lt;h1&gt;SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl h&#116;tps://web.nwk.lab
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<p>Open <b>Capture packets</b>, run <code>nslookup</code> again and look at the packet from PC1 to 10.0.10.1: it is <b>UDP, destination port 53</b>, from an ephemeral source port. Then find the SYN of the HTTPS connection: <b>TCP, destination port 443</b>. The plain curl shows TCP 80. Those are the answers the lab asks for.</p>

<div class="eg"><p><b>Worked example: what a single secure page load uses.</b> A user types a name in the browser. (1) DNS query, UDP 53, to the resolver. (2) TCP handshake to port 443. (3) TLS handshake inside that connection. (4) HTTP requests inside TLS. If the page is also fetched over HTTP/3, the browser uses UDP 443 (QUIC). Four protocols, three ports' worth of rules, one click.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Swapping SNMP directions: polls go <b>to</b> the device on 161; traps go <b>to</b> the manager on 162. Opening only UDP 161 on a firewall and wondering why no traps arrive. Thinking SMB (445) is safe to publish on the internet. Mixing up 389 (LDAP) and 3389 (RDP).</p></div>

<div class="exam"><p><b>Exam traps.</b> 161/162 SNMP UDP; 389 LDAP; 443 HTTPS; 445 SMB; 514 syslog UDP; 587 SMTPS; 636 LDAPS; 1433 SQL Server; 3389 RDP; 5060/5061 SIP. "Secure directory queries" = 636. "Secure email submission" = 587. "Windows file shares" = 445. "Remote graphical desktop" = 3389. "Call setup for VoIP" = SIP 5060/5061.</p></div>

<div class="scn"><h4>The monitoring server that never heard an alarm</h4><p>A new NMS in the data center could poll every branch router: interface graphs and CPU charts all worked. But when a branch WAN link failed, no alert appeared. The engineer checked the path: the data-center firewall allowed UDP 161 from the NMS to the branches (polls) and their replies, but blocked UDP 162 from the branches to the NMS, which is where unsolicited traps arrive. Adding a rule for UDP 162 inbound to the NMS, plus UDP 514 for syslog, fixed alerting.</p><p><b>Lesson:</b> polls and traps travel in opposite directions on different ports.</p></div>

<div class="iv"><p class="q">"Walk me through the ports used when a user opens a secure intranet site by name."</p><p>Strong answer: the PC sends a DNS query from an ephemeral port to UDP 53 on its configured DNS server (TCP 53 only if the answer is large). With the IP address, it opens a TCP connection from a new ephemeral port to 443 with a three-way handshake, negotiates TLS, and sends HTTP requests inside it. If the site redirects from HTTP, there is first a connection to TCP 80. Mention that ARP to the gateway happens first if the cache is empty, and that a capture shows each step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>161/162 SNMP, 514 syslog are UDP; 389, 443, 445, 587, 636, 1433, 3389 are TCP; SIP is 5060 (TCP/UDP) and 5061 (TLS).</li>
<li>Learn ports in families (manage, files, core services) and in insecure-to-secure pairs.</li>
<li>UDP services: Don't Talk, Not So Slow (DHCP, TFTP, NTP, SNMP, Syslog) plus DNS queries.</li>
<li>The lab proves DNS uses UDP 53 and HTTPS uses TCP 443, seen in a capture.</li>
<li>SNMP polls go to 161 on the device; traps go to 162 on the manager.</li>
</ul></div>
`,hi:`
<p>Yeh chapter N10-009 ki port list poori karta hai, aapko saare bees entries yaad rakhne ka system deta hai, aur lab <b>Ports and protocols in action</b> ko walk through karta hai, jahan aap capture mein DNS aur HTTPS ko unke asli ports use karte dekhte ho.</p>

<h3>Doosri das services</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Transport</th><th>Kya jaanna hai</th><th>Memory aid</th></tr>
<tr><td>161, 162</td><td>SNMP</td><td>UDP</td><td>Monitoring. Manager agents ko 161 par poll karta hai; agents manager ko 162 par traps bhejte hain. Authentication aur encryption ke liye SNMPv3 use karo.</td><td>161 par poocho, device ek upar 162 par chillata hai.</td></tr>
<tr><td>389</td><td>LDAP</td><td>TCP (aur UDP)</td><td>Directory queries: users, groups, computers (jaise Active Directory). Default mein cleartext.</td><td>389 directory ka phone number hai; RDP (3389) ise udhaar leta hai.</td></tr>
<tr><td>443</td><td>HTTPS</td><td>TCP (aur HTTP/3 ke liye UDP)</td><td>TLS ke andar HTTP. Bahut se SSL VPNs bhi use karte hain.</td><td>443 aur 445 padosi hain: Secure web ka S, Share ka S.</td></tr>
<tr><td>445</td><td>SMB</td><td>TCP</td><td>Windows file aur printer sharing, seedha TCP par. Ise kabhi internet par expose mat karo.</td><td>Secure web se do darwaze aage.</td></tr>
<tr><td>514</td><td>Syslog</td><td>UDP</td><td>Devices log messages central syslog server ko bhejte hain. TLS-protected syslog TCP 6514 use karta hai.</td><td>500s mein logs (514) letters (587) se pehle aate hain.</td></tr>
<tr><td>587</td><td>SMTPS</td><td>TCP</td><td>Clients se authenticated, encrypted mail submission (STARTTLS). Implicit TLS ke liye 465 bhi mil sakta hai.</td><td>Secure mail 500s mein logs ke bagal mein rehta hai.</td></tr>
<tr><td>636</td><td>LDAPS</td><td>TCP</td><td>TLS par LDAP.</td><td>6-3-6 palindrome hai: aaina secure copy dikhata hai.</td></tr>
<tr><td>1433</td><td>SQL Server</td><td>TCP</td><td>Microsoft SQL Server database connections.</td><td>143 purana pager code tha "I love you" ka; DBAs ko SQL se pyaar hai, ek 3 jodo.</td></tr>
<tr><td>3389</td><td>RDP</td><td>TCP (aur UDP)</td><td>Windows machines ka Remote Desktop. Ise VPN ya gateway ke peeche rakho, internet par seedha kabhi nahi.</td><td>LDAP ke 389 ke aage ek 3: dono Windows domains mein rehte hain.</td></tr>
<tr><td>5060, 5061</td><td>SIP</td><td>TCP/UDP 5060, TCP 5061</td><td>Voice aur video calls set up, modify aur tear down karta hai. 5061 TLS par SIP hai. Awaaz khud high UDP ports par RTP mein jaati hai.</td><td>SNMP ki tarah, doosra role ek upar: secure SIP 5061.</td></tr>
</table>

<h3>Saare bees ke liye ek system</h3>
<p>Bees random numbers ratta mat maaro. Unhe <b>families</b> mein aur <b>secure pairs</b> mein seekho.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Family aur secure pairs ke hisaab se ports">
<rect x="10" y="10" width="200" height="118" rx="8" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Devices manage karo</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="12">SSH 22, Telnet 23</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">SNMP 161/162, Syslog 514</text><text x="110" y="94" text-anchor="middle" class="svg-muted" font-size="12">NTP 123, TFTP 69</text><text x="110" y="114" text-anchor="middle" class="svg-muted" font-size="12">RDP 3389</text>
<rect x="220" y="10" width="200" height="118" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Files aur data</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">FTP 20/21, SFTP 22</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">SMB 445</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">SQL Server 1433</text>
<rect x="430" y="10" width="200" height="118" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core services</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="12">DNS 53, DHCP 67/68</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">HTTP 80, HTTPS 443</text><text x="530" y="94" text-anchor="middle" class="svg-muted" font-size="12">LDAP 389, LDAPS 636</text><text x="530" y="114" text-anchor="middle" class="svg-muted" font-size="12">SMTP 25, SMTPS 587, SIP</text>
<rect x="10" y="142" width="620" height="120" rx="8" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="13">Insecure se secure pairs</text>
<text x="170" y="190" text-anchor="middle" class="svg-ink" font-size="12">Telnet 23 se SSH 22</text><text x="470" y="190" text-anchor="middle" class="svg-ink" font-size="12">HTTP 80 se HTTPS 443</text>
<text x="170" y="212" text-anchor="middle" class="svg-ink" font-size="12">FTP 20/21 se SFTP 22</text><text x="470" y="212" text-anchor="middle" class="svg-ink" font-size="12">LDAP 389 se LDAPS 636</text>
<text x="170" y="234" text-anchor="middle" class="svg-ink" font-size="12">SMTP 25 se SMTPS 587</text><text x="470" y="234" text-anchor="middle" class="svg-ink" font-size="12">SIP 5060 se SIP-TLS 5061</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">SNMPv1/v2c se SNMPv3: same ports, secure version</text>
</svg><p class="cap">Families scenario sawaalon mein madad karti hain; secure pairs "kisse replace karein" wale sawaalon mein.</p></div>

<p><b>UDP list trick.</b> List mein UDP wali services "chhoti, tez, bhejo aur bhool jao" wali hain: <b>DHCP, TFTP, NTP, SNMP, syslog</b> aur DNS queries. Yaad rakhne ka phrase: "<b>D</b>on't <b>T</b>alk, <b>N</b>ot <b>S</b>o <b>S</b>low" (DHCP, TFTP, NTP, SNMP, Syslog). List mein baaki sab TCP hai, jismein DNS, SIP, RDP, LDAP aur HTTPS/3 UDP bhi use karte hain.</p>

<h3>Lab: asli ports dekhna</h3>
<p>Lab mein R1 office DNS server ka kaam karta hai: uspar <code>ip dns server</code> aur host entry <code>ip host web.nwk.lab 10.0.20.10</code> hai. SRV ports 80 aur 443 par web service chalata hai. Pehle PC1 ko DNS server par point karo aur naam resolve karo.</p>
<pre class="code"><span class="c">! PC1 par</span>
PC1&gt; ip dns 10.0.10.1
PC1&gt; nslookup web.nwk.lab</pre>
<pre class="out"><span class="hl">Server:         10.0.10.1
Address:        10.0.10.1#53</span>

Name:   web.nwk.lab
<span class="hl">Address: 10.0.20.10</span></pre>
<p>"#53" batata hai ki query port 53 par gayi. Ab site ko naam se dono web protocols par kholo. Har command pehle naam resolve karta hai, phir TCP connection kholta hai.</p>
<pre class="code">PC1&gt; curl web.nwk.lab
PC1&gt; curl h&#116;tps://web.nwk.lab</pre>
<pre class="out">PC1&gt; curl web.nwk.lab
&lt;html&gt;&lt;body&gt;&lt;h1&gt;SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl h&#116;tps://web.nwk.lab
<span class="hl">&lt;html&gt;&lt;body&gt;&lt;h1&gt;SRV&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;</span></pre>
<p><b>Capture packets</b> kholo, <code>nslookup</code> dobara chalao aur PC1 se 10.0.10.1 wala packet dekho: woh <b>UDP, destination port 53</b> hai, ek ephemeral source port se. Phir HTTPS connection ka SYN dhoondo: <b>TCP, destination port 443</b>. Saada curl TCP 80 dikhata hai. Yahi jawab lab maangta hai.</p>

<div class="eg"><p><b>Worked example: ek secure page load kya kya use karta hai.</b> User browser mein naam type karta hai. (1) Resolver ko DNS query, UDP 53. (2) Port 443 par TCP handshake. (3) Us connection ke andar TLS handshake. (4) TLS ke andar HTTP requests. Agar page HTTP/3 par bhi aata hai, to browser UDP 443 (QUIC) use karta hai. Chaar protocols, teen ports ke rules, ek click.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> SNMP ki directions ulat dena: polls device <b>ko</b> 161 par jaate hain; traps manager <b>ko</b> 162 par jaate hain. Firewall par sirf UDP 161 kholna aur sochna ki traps kyun nahi aa rahe. SMB (445) ko internet par publish karna safe samajhna. 389 (LDAP) aur 3389 (RDP) ko mix kar dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> 161/162 SNMP UDP; 389 LDAP; 443 HTTPS; 445 SMB; 514 syslog UDP; 587 SMTPS; 636 LDAPS; 1433 SQL Server; 3389 RDP; 5060/5061 SIP. "Secure directory queries" = 636. "Secure email submission" = 587. "Windows file shares" = 445. "Remote graphical desktop" = 3389. "VoIP ke liye call setup" = SIP 5060/5061.</p></div>

<div class="scn"><h4>Monitoring server jisne kabhi alarm nahi suna</h4><p>Data center ka naya NMS har branch router ko poll kar sakta tha: interface graphs aur CPU charts sab chal rahe the. Lekin jab ek branch ka WAN link fail hua, koi alert nahi aaya. Engineer ne path check kiya: data-center firewall NMS se branches ko UDP 161 (polls) aur unke replies allow karta tha, lekin branches se NMS ko UDP 162 block karta tha, jahan bina maange traps aate hain. NMS ko inbound UDP 162, plus syslog ke liye UDP 514, ka rule jodne se alerting theek ho gayi.</p><p><b>Seekh:</b> polls aur traps ulti directions mein alag ports par chalte hain.</p></div>

<div class="iv"><p class="q">"Jab user secure intranet site naam se kholta hai to kaunse ports use hote hain, samjhao."</p><p>Strong answer: PC ek ephemeral port se apne configured DNS server ke UDP 53 par DNS query bhejta hai (TCP 53 sirf tab jab answer bada ho). IP address milne par woh naye ephemeral port se 443 par three-way handshake ke saath TCP connection kholta hai, TLS negotiate karta hai, aur uske andar HTTP requests bhejta hai. Agar site HTTP se redirect karti hai, to pehle TCP 80 par connection hota hai. Batao ki cache khaali ho to pehle gateway ke liye ARP hota hai, aur capture har step dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>161/162 SNMP, 514 syslog UDP hain; 389, 443, 445, 587, 636, 1433, 3389 TCP hain; SIP 5060 (TCP/UDP) aur 5061 (TLS) hai.</li>
<li>Ports ko families (manage, files, core services) mein aur insecure-se-secure pairs mein seekho.</li>
<li>UDP services: Don't Talk, Not So Slow (DHCP, TFTP, NTP, SNMP, Syslog) plus DNS queries.</li>
<li>Lab prove karta hai ki DNS UDP 53 aur HTTPS TCP 443 use karta hai, capture mein dikhta hai.</li>
<li>SNMP polls device ke 161 par jaate hain; traps manager ke 162 par.</li>
</ul></div>
`}};export{e as default};