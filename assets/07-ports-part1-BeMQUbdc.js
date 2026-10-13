var e={id:`ports-1`,h:{en:`Ports and protocols, part 1: ranges, sockets and ports 20 to 123`,hi:`Ports aur protocols, part 1: ranges, sockets aur ports 20 se 123`},body:{en:`
<p>Objective 1.4 expects you to know twenty services by port number <b>and</b> transport protocol, and to recognise them in a firewall rule, a capture or a scenario. We split the table into two chapters. This one explains how ports work and covers the first ten services, with a memory aid for each. Think of an IP address as the address of a large office building and the port as the <b>desk number</b> inside: the building is the same, but the post for desk 53 goes to the DNS team and the post for desk 443 goes to the secure web team.</p>

<h3>Port ranges</h3>
<p>A port is a 16-bit number, so it ranges from 0 to 65535. IANA divides the range into three blocks:</p>
<table class="cmp"><tr><th>Range</th><th>Name</th><th>Used by</th></tr>
<tr><td>0-1023</td><td>Well-known (system) ports</td><td>Core services: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS</td></tr>
<tr><td>1024-49151</td><td>Registered ports</td><td>Vendor and application services: 1433 SQL Server, 3389 RDP, 5060 SIP</td></tr>
<tr><td>49152-65535</td><td>Dynamic, private or ephemeral ports</td><td>Temporary source ports chosen by clients for each connection</td></tr>
</table>
<p>A <b>server</b> listens on a fixed, well-known or registered port. A <b>client</b> picks a random <b>ephemeral</b> source port for each new connection. The reply comes back to that ephemeral port. This is why a firewall rule for web browsing says "destination port 443" and the return traffic is handled by state tracking.</p>

<h3>Sockets and the 5-tuple</h3>
<p>An IP address plus a port is a <b>socket</b>, written 10.0.20.10:443. A connection is identified by the <b>5-tuple</b>: source IP, source port, destination IP, destination port and protocol (TCP or UDP). Two browser tabs to the same server are two different connections because their source ports differ.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Client ephemeral port to server well-known port">
<rect x="20" y="30" width="200" height="70" rx="8" fill="#bae6fd"/><text x="120" y="58" text-anchor="middle" class="svg-ink" font-size="14">PC1 client</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="13">10.0.10.10:50514</text>
<rect x="420" y="30" width="200" height="70" rx="8" fill="#bbf7d0"/><text x="520" y="58" text-anchor="middle" class="svg-ink" font-size="14">SRV web server</text><text x="520" y="82" text-anchor="middle" class="svg-muted" font-size="13">10.0.20.10:443</text>
<line x1="220" y1="52" x2="420" y2="52" stroke="#64748b" stroke-width="2"/><text x="320" y="44" text-anchor="middle" class="svg-accent" font-size="12">src 50514, dst 443</text>
<line x1="420" y1="84" x2="220" y2="84" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="12">src 443, dst 50514</text>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">5-tuple: TCP, 10.0.10.10, 50514, 10.0.20.10, 443</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">The client chooses the ephemeral port; the server always listens on 443.</text>
</svg><p class="cap">Ports swap places in the reply. Firewall rules match the server's port as the destination.</p></div>

<pre class="code"><span class="c">! On a Windows client: list connections and listening ports</span>
C:&gt; netstat -an</pre>
<pre class="out">  Proto  Local Address          Foreign Address        State
<span class="hl">  TCP    10.0.10.10:50514       10.0.20.10:443         ESTABLISHED</span>
  TCP    10.0.10.10:50515       10.0.20.10:80          TIME_WAIT
  UDP    10.0.10.10:61022       *:*</pre>

<h3>The first ten services</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Transport</th><th>What to know</th><th>Memory aid</th></tr>
<tr><td>20, 21</td><td>FTP</td><td>TCP</td><td>File transfer. 21 = control (commands), 20 = data in active mode. Cleartext, including passwords.</td><td>The oldest service gets the first pair: 20 data, 21 control.</td></tr>
<tr><td>22</td><td>SSH</td><td>TCP</td><td>Encrypted remote command-line access. Replaces Telnet.</td><td><b>S</b>ecure <b>S</b>hell: two S, so 22.</td></tr>
<tr><td>22</td><td>SFTP</td><td>TCP</td><td>File transfer that runs inside SSH, so it shares port 22.</td><td>SFTP rides in the SSH car.</td></tr>
<tr><td>23</td><td>Telnet</td><td>TCP</td><td>Unencrypted remote CLI. Never use on untrusted networks.</td><td>The insecure brother right after SSH.</td></tr>
<tr><td>25</td><td>SMTP</td><td>TCP</td><td>Sends and relays email between mail servers.</td><td>A 25 paise stamp on every letter.</td></tr>
<tr><td>53</td><td>DNS</td><td>UDP and TCP</td><td>Name resolution. Queries use UDP 53; zone transfers and large answers use TCP 53.</td><td>5 looks like S and 3 like a reversed E: <b>SE</b>arch for a name.</td></tr>
<tr><td>67, 68</td><td>DHCP</td><td>UDP</td><td>Automatic addressing. Server listens on 67, client on 68.</td><td>The server speaks first, so it gets 67.</td></tr>
<tr><td>69</td><td>TFTP</td><td>UDP</td><td>Trivial FTP: no login, no listing. Firmware, configs, PXE boot.</td><td>PXE boot uses DHCP then TFTP: 67, 68, 69 in a row.</td></tr>
<tr><td>80</td><td>HTTP</td><td>TCP</td><td>Unencrypted web traffic.</td><td>H is the 8th letter of the alphabet, plus a zero: 80.</td></tr>
<tr><td>123</td><td>NTP</td><td>UDP</td><td>Time synchronisation. Accurate time is needed for logs, certificates and Kerberos.</td><td>Time counts 1, 2, 3.</td></tr>
</table>

<h3>Details the exam likes</h3>
<p><b>FTP active versus passive.</b> In <b>active</b> mode the client opens the control connection to port 21, then the <b>server</b> connects back to the client from port 20 for data. Firewalls and NAT at the client side usually block that inbound connection. In <b>passive</b> mode the client opens both connections, the data one to a random high port the server announces. Passive is what works through most firewalls. Do not confuse <b>SFTP</b> (SSH-based, port 22) with <b>FTPS</b> (FTP over TLS, ports 989/990 or explicit TLS on 21).</p>
<p><b>DNS over UDP and TCP.</b> Almost every query is a single UDP 53 datagram. TCP 53 is used for <b>zone transfers</b> between DNS servers and for responses too large for UDP. A firewall that allows only UDP 53 will break zone transfers.</p>
<p><b>DHCP uses broadcasts</b> because the client has no IP yet: DISCOVER, OFFER, REQUEST, ACK (DORA). A router in the path needs a DHCP relay (<code>ip helper-address</code>) to forward them. That is covered in the services module.</p>
<p><b>SMTP</b> on 25 is for server-to-server relay; mail clients submit mail with authentication on 587 (next chapter). Receiving protocols such as IMAP and POP3 are not on the N10-009 port list, but you may still see them in the real world.</p>

<div class="eg"><p><b>Worked example: build a firewall rule list.</b> A branch needs: web browsing, name resolution, time sync, and SSH to its router. Rules, outbound from inside: TCP 80 and 443 to any, UDP 53 (and TCP 53) to the DNS servers, UDP 123 to the NTP servers, and TCP 22 to the router's management address. Replies are allowed automatically by the stateful firewall. Telnet (23) and FTP (20/21) stay blocked.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Allowing only TCP 53 or only UDP 53. Writing a rule with the ephemeral port as the destination. Assuming SFTP and FTPS are the same thing. Using TFTP across the internet: it has no authentication or encryption.</p></div>

<div class="exam"><p><b>Exam traps.</b> 20/21 FTP TCP; 22 SSH and SFTP TCP; 23 Telnet TCP; 25 SMTP TCP; 53 DNS UDP and TCP; 67/68 DHCP UDP; 69 TFTP UDP; 80 HTTP TCP; 123 NTP UDP. A question that says "secure replacement for Telnet" wants SSH 22. "Transfer files with no authentication" wants TFTP 69.</p></div>

<div class="scn"><h4>The FTP upload that listed but never transferred</h4><p>A vendor could log into a company's FTP server and see the directory banner, but every file upload hung. The firewall allowed TCP 21 only. The vendor's client was in passive mode, and the server announced a random data port that the firewall blocked. The engineer enabled the firewall's FTP inspection (which opens the announced data port dynamically for that session), and later replaced FTP with SFTP on port 22, which needs only one connection and encrypts everything.</p><p><b>Lesson:</b> FTP uses separate control and data connections; know which side opens each one.</p></div>

<div class="iv"><p class="q">"Does DNS use TCP or UDP?"</p><p>Strong answer: both, on port 53. Normal queries and answers use UDP 53 because they are small and a single request-reply exchange is fastest. TCP 53 is used for zone transfers (AXFR/IXFR) between primary and secondary servers and when an answer is too large for UDP, for example with DNSSEC; the server sets the truncated flag and the client retries over TCP. So firewall rules for DNS servers should allow both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports: 0-1023 well-known, 1024-49151 registered, 49152-65535 ephemeral.</li>
<li>A socket is IP plus port; a connection is a 5-tuple; clients use ephemeral source ports.</li>
<li>20/21 FTP, 22 SSH/SFTP, 23 Telnet, 25 SMTP are TCP; 67/68 DHCP, 69 TFTP, 123 NTP are UDP; 53 DNS is both.</li>
<li>FTP active mode has the server connect back; passive mode works better through firewalls.</li>
<li>Remember each port with its symptom when blocked, not just the number.</li>
</ul></div>
`,hi:`
<p>Objective 1.4 ummeed karta hai ki aap bees services ko port number <b>aur</b> transport protocol se jaano, aur unhe firewall rule, capture ya scenario mein pehchaano. Hum table ko do chapters mein baant rahe hain. Yeh chapter samjhata hai ki ports kaise kaam karte hain aur pehli das services cover karta hai, har ek ke memory aid ke saath. IP address ko ek badi office building ka address socho aur port ko andar ka <b>desk number</b>: building same hai, lekin desk 53 ki daak DNS team ko jaati hai aur desk 443 ki daak secure web team ko.</p>

<h3>Port ranges</h3>
<p>Port 16-bit number hai, isliye 0 se 65535 tak hota hai. IANA range ko teen blocks mein baantta hai:</p>
<table class="cmp"><tr><th>Range</th><th>Naam</th><th>Kaun use karta hai</th></tr>
<tr><td>0-1023</td><td>Well-known (system) ports</td><td>Core services: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS</td></tr>
<tr><td>1024-49151</td><td>Registered ports</td><td>Vendor aur application services: 1433 SQL Server, 3389 RDP, 5060 SIP</td></tr>
<tr><td>49152-65535</td><td>Dynamic, private ya ephemeral ports</td><td>Har connection ke liye clients ke chune temporary source ports</td></tr>
</table>
<p><b>Server</b> ek fixed, well-known ya registered port par listen karta hai. <b>Client</b> har naye connection ke liye random <b>ephemeral</b> source port chunta hai. Reply usi ephemeral port par wapas aata hai. Isiliye web browsing ka firewall rule "destination port 443" kehta hai aur return traffic state tracking sambhalti hai.</p>

<h3>Sockets aur 5-tuple</h3>
<p>IP address plus port ek <b>socket</b> hai, 10.0.20.10:443 ki tarah likha jaata hai. Connection <b>5-tuple</b> se pehchana jaata hai: source IP, source port, destination IP, destination port aur protocol (TCP ya UDP). Same server ke do browser tabs do alag connections hain kyunki unke source ports alag hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Client ephemeral port se server well-known port">
<rect x="20" y="30" width="200" height="70" rx="8" fill="#bae6fd"/><text x="120" y="58" text-anchor="middle" class="svg-ink" font-size="14">PC1 client</text><text x="120" y="82" text-anchor="middle" class="svg-muted" font-size="13">10.0.10.10:50514</text>
<rect x="420" y="30" width="200" height="70" rx="8" fill="#bbf7d0"/><text x="520" y="58" text-anchor="middle" class="svg-ink" font-size="14">SRV web server</text><text x="520" y="82" text-anchor="middle" class="svg-muted" font-size="13">10.0.20.10:443</text>
<line x1="220" y1="52" x2="420" y2="52" stroke="#64748b" stroke-width="2"/><text x="320" y="44" text-anchor="middle" class="svg-accent" font-size="12">src 50514, dst 443</text>
<line x1="420" y1="84" x2="220" y2="84" stroke="#64748b" stroke-width="2"/><text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="12">src 443, dst 50514</text>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">5-tuple: TCP, 10.0.10.10, 50514, 10.0.20.10, 443</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Client ephemeral port chunta hai; server hamesha 443 par listen karta hai.</text>
</svg><p class="cap">Reply mein ports jagah badal lete hain. Firewall rules server ke port ko destination ki tarah match karte hain.</p></div>

<pre class="code"><span class="c">! Windows client par: connections aur listening ports dikhao</span>
C:&gt; netstat -an</pre>
<pre class="out">  Proto  Local Address          Foreign Address        State
<span class="hl">  TCP    10.0.10.10:50514       10.0.20.10:443         ESTABLISHED</span>
  TCP    10.0.10.10:50515       10.0.20.10:80          TIME_WAIT
  UDP    10.0.10.10:61022       *:*</pre>

<h3>Pehli das services</h3>
<table class="cmp"><tr><th>Port</th><th>Service</th><th>Transport</th><th>Kya jaanna hai</th><th>Memory aid</th></tr>
<tr><td>20, 21</td><td>FTP</td><td>TCP</td><td>File transfer. 21 = control (commands), 20 = active mode mein data. Cleartext, passwords samet.</td><td>Sabse purani service ko pehla pair milta hai: 20 data, 21 control.</td></tr>
<tr><td>22</td><td>SSH</td><td>TCP</td><td>Encrypted remote command-line access. Telnet ki jagah leta hai.</td><td><b>S</b>ecure <b>S</b>hell: do S, isliye 22.</td></tr>
<tr><td>22</td><td>SFTP</td><td>TCP</td><td>File transfer jo SSH ke andar chalta hai, isliye port 22 share karta hai.</td><td>SFTP SSH ki gaadi mein baithta hai.</td></tr>
<tr><td>23</td><td>Telnet</td><td>TCP</td><td>Unencrypted remote CLI. Untrusted networks par kabhi use mat karo.</td><td>SSH ke theek baad wala insecure bhai.</td></tr>
<tr><td>25</td><td>SMTP</td><td>TCP</td><td>Mail servers ke beech email bhejta aur relay karta hai.</td><td>Har chitthi par 25 paise ka stamp.</td></tr>
<tr><td>53</td><td>DNS</td><td>UDP aur TCP</td><td>Name resolution. Queries UDP 53 use karti hain; zone transfers aur bade answers TCP 53.</td><td>5 S jaisa aur 3 ulta E jaisa dikhta hai: naam ki <b>SE</b>arch.</td></tr>
<tr><td>67, 68</td><td>DHCP</td><td>UDP</td><td>Automatic addressing. Server 67 par listen karta hai, client 68 par.</td><td>Server pehle bolta hai, isliye use 67 milta hai.</td></tr>
<tr><td>69</td><td>TFTP</td><td>UDP</td><td>Trivial FTP: na login, na listing. Firmware, configs, PXE boot.</td><td>PXE boot pehle DHCP phir TFTP use karta hai: 67, 68, 69 lagataar.</td></tr>
<tr><td>80</td><td>HTTP</td><td>TCP</td><td>Unencrypted web traffic.</td><td>H alphabet ka 8th letter hai, saath mein ek zero: 80.</td></tr>
<tr><td>123</td><td>NTP</td><td>UDP</td><td>Time synchronisation. Logs, certificates aur Kerberos ke liye sahi time zaroori hai.</td><td>Time ginta hai 1, 2, 3.</td></tr>
</table>

<h3>Details jo exam ko pasand hain</h3>
<p><b>FTP active vs passive.</b> <b>Active</b> mode mein client port 21 par control connection kholta hai, phir <b>server</b> data ke liye port 20 se client ko wapas connect karta hai. Client side ke firewalls aur NAT aam taur par woh inbound connection block kar dete hain. <b>Passive</b> mode mein client dono connections kholta hai, data wala server ke announce kiye random high port par. Passive hi zyada tar firewalls ke through chalta hai. <b>SFTP</b> (SSH-based, port 22) ko <b>FTPS</b> (TLS par FTP, ports 989/990 ya 21 par explicit TLS) se confuse mat karo.</p>
<p><b>UDP aur TCP par DNS.</b> Lagbhag har query ek single UDP 53 datagram hai. TCP 53 DNS servers ke beech <b>zone transfers</b> aur UDP ke liye bahut bade responses ke liye use hota hai. Jo firewall sirf UDP 53 allow karta hai woh zone transfers tod dega.</p>
<p><b>DHCP broadcasts use karta hai</b> kyunki client ke paas abhi IP nahi hai: DISCOVER, OFFER, REQUEST, ACK (DORA). Path mein router ko unhe forward karne ke liye DHCP relay (<code>ip helper-address</code>) chahiye. Yeh services module mein cover hota hai.</p>
<p>Port 25 par <b>SMTP</b> server-to-server relay ke liye hai; mail clients authentication ke saath 587 par mail submit karte hain (agla chapter). IMAP aur POP3 jaise receiving protocols N10-009 port list mein nahi hain, lekin real world mein aapko dikh sakte hain.</p>

<div class="eg"><p><b>Worked example: firewall rule list banao.</b> Branch ko chahiye: web browsing, name resolution, time sync, aur apne router par SSH. Rules, inside se outbound: TCP 80 aur 443 any ko, UDP 53 (aur TCP 53) DNS servers ko, UDP 123 NTP servers ko, aur TCP 22 router ke management address ko. Replies stateful firewall apne aap allow karta hai. Telnet (23) aur FTP (20/21) blocked rehte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf TCP 53 ya sirf UDP 53 allow karna. Ephemeral port ko destination bana kar rule likhna. SFTP aur FTPS ko ek hi cheez maan lena. Internet ke paar TFTP use karna: usmein na authentication hai na encryption.</p></div>

<div class="exam"><p><b>Exam traps.</b> 20/21 FTP TCP; 22 SSH aur SFTP TCP; 23 Telnet TCP; 25 SMTP TCP; 53 DNS UDP aur TCP; 67/68 DHCP UDP; 69 TFTP UDP; 80 HTTP TCP; 123 NTP UDP. Jo sawaal kahe "Telnet ka secure replacement" use SSH 22 chahiye. "Bina authentication files transfer karo" ko TFTP 69 chahiye.</p></div>

<div class="scn"><h4>FTP upload jo list hota tha lekin transfer kabhi nahi</h4><p>Ek vendor company ke FTP server mein login karke directory banner dekh sakta tha, lekin har file upload atak jaata tha. Firewall sirf TCP 21 allow karta tha. Vendor ka client passive mode mein tha, aur server ek random data port announce karta tha jise firewall block karta tha. Engineer ne firewall ka FTP inspection enable kiya (jo us session ke liye announce kiya data port dynamically kholta hai), aur baad mein FTP ko port 22 par SFTP se replace kiya, jise sirf ek connection chahiye aur jo sab kuch encrypt karta hai.</p><p><b>Seekh:</b> FTP alag control aur data connections use karta hai; jaano ki har ek kaunsi side kholti hai.</p></div>

<div class="iv"><p class="q">"DNS TCP use karta hai ya UDP?"</p><p>Strong answer: dono, port 53 par. Normal queries aur answers UDP 53 use karte hain kyunki woh chhote hote hain aur ek request-reply exchange sabse tez hai. TCP 53 primary aur secondary servers ke beech zone transfers (AXFR/IXFR) ke liye aur jab answer UDP ke liye bahut bada ho, jaise DNSSEC ke saath, tab use hota hai; server truncated flag set karta hai aur client TCP par retry karta hai. Isliye DNS servers ke firewall rules dono allow karne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ports: 0-1023 well-known, 1024-49151 registered, 49152-65535 ephemeral.</li>
<li>Socket IP plus port hai; connection 5-tuple hai; clients ephemeral source ports use karte hain.</li>
<li>20/21 FTP, 22 SSH/SFTP, 23 Telnet, 25 SMTP TCP hain; 67/68 DHCP, 69 TFTP, 123 NTP UDP hain; 53 DNS dono hai.</li>
<li>FTP active mode mein server wapas connect karta hai; passive mode firewalls ke through behtar chalta hai.</li>
<li>Har port ko block hone par aane wale symptom ke saath yaad rakho, sirf number nahi.</li>
</ul></div>
`}};export{e as default};