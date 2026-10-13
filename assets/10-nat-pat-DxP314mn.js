var e={id:`nat-pat`,h:{en:`NAT and PAT: sharing one public address (Lab 3)`,hi:`NAT aur PAT: ek public address share karna (Lab 3)`},body:{en:`
<p>Back to the hotel switchboard from chapter 1. Two hundred rooms have internal extension numbers, but the hotel has one public phone number. When room 214 calls out, the operator places the call from the public number and notes "outside line 7 belongs to room 214". When the reply comes back on line 7, it goes to room 214. That is <b>PAT</b> (Port Address Translation): many private hosts share one public address, and the router keeps a table so replies reach the right host.</p>

<h3>Why NAT exists</h3>
<p>IPv4 has about 4.3 billion addresses, far fewer than the devices on earth. RFC 1918 reserved three <b>private</b> ranges that anyone may use internally but that are never routed on the internet:</p>
<ul>
<li><code>10.0.0.0/8</code></li>
<li><code>172.16.0.0/12</code> (172.16.0.0 to 172.31.255.255)</li>
<li><code>192.168.0.0/16</code></li>
</ul>
<p><b>Network Address Translation (NAT)</b> rewrites the private source address to a public one as packets leave, and reverses the change for replies. Without it, the office in our lab (192.168.10.0/24) could never receive a reply from the internet, because no ISP routes private addresses.</p>

<h3>The four address terms</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th><th>Lab 3 value</th></tr>
<tr><td><b>Inside local</b></td><td>The inside host's real (private) address</td><td>192.168.10.11</td></tr>
<tr><td><b>Inside global</b></td><td>The public address that represents the inside host</td><td>203.0.113.2</td></tr>
<tr><td><b>Outside local</b></td><td>The outside host's address as seen from inside</td><td>8.8.8.8</td></tr>
<tr><td><b>Outside global</b></td><td>The outside host's real address</td><td>8.8.8.8</td></tr>
</table>
<p>"Inside/outside" says <i>whose</i> address it is; "local/global" says <i>where</i> you are looking from. In normal internet access the outside addresses are not translated, so outside local equals outside global.</p>

<h3>Three kinds of NAT</h3>
<ul>
<li><b>Static NAT</b>: one inside address permanently mapped to one public address. Used to publish a server. <code>ip nat inside source static 192.168.10.50 203.0.113.5</code></li>
<li><b>Dynamic NAT</b>: inside hosts borrow addresses from a pool of public addresses, one each, first come first served. If the pool is empty, new hosts fail.</li>
<li><b>PAT</b> (NAT overload): all inside hosts share one public address; each session gets a unique source <b>port</b> so replies can be told apart. Nearly every home and office router does this. One address can carry tens of thousands of sessions.</li>
</ul>
<p>A variation of static NAT is <b>port forwarding</b>: only one port of the public address goes to an inside server, for example <code>ip nat inside source static tcp 192.168.10.50 443 interface GigabitEthernet0/1 443</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAT in lab 3">
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="10" y="140" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1 (PAT)</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">in Gi0/0 | out Gi0/1</text>
<rect x="490" y="80" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="52" x2="250" y2="100" stroke="#64748b"/><line x1="150" y1="162" x2="250" y2="120" stroke="#64748b"/><line x1="390" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">.11:1 → 203.0.113.2:1   .12:1 → 203.0.113.2:1024</text>
</svg><p class="cap">Both PCs appear on the internet as 203.0.113.2; PAT keeps them apart with different port numbers.</p></div>

<h3>Lab 3: internet access with PAT</h3>
<p>R1 has Gi0/0 <code>192.168.10.1/24</code> towards the LAN and Gi0/1 <code>203.0.113.2/30</code> towards the ISP, plus a default route to 203.0.113.1. The ISP routes nothing private back. You need three pieces: mark the interfaces, say <b>who</b> may be translated (an ACL), and say <b>to what</b> (the outside interface address, overloaded).</p>
<pre class="code"><span class="c">! 1. Which side is which</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
exit
<span class="c">! 2. Who may be translated: the LAN</span>
access-list 1 permit 192.168.10.0 0.0.0.255
<span class="c">! 3. Translate them to Gi0/1's address, sharing it by port</span>
ip nat inside source list 1 interface GigabitEthernet0/1 overload</pre>
<p>Now ping 8.8.8.8 from PC1 and PC2 and look at the translation table.</p>
<pre class="out">R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
icmp <span class="hl">203.0.113.2:1</span>         192.168.10.11:1       8.8.8.8:1             8.8.8.8:1
icmp <span class="hl">203.0.113.2:1024</span>      192.168.10.12:1       8.8.8.8:1             8.8.8.8:1024

R1# show ip nat statistics
Total active translations: 2 (0 static, 2 dynamic; 2 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 10  Misses: 0</pre>
<p>Both PCs share the inside global address <b>203.0.113.2</b>, which is the answer to the lab's last question. Both used ICMP identifier 1, so R1 changed the second one to 1024 to keep them unique.</p>

<div class="eg"><p><b>Worked example.</b> An office of 180 users has one public address. Each user has about 30 open sessions (browser tabs, mail, chat): 5,400 sessions. PAT has about 64,000 usable ports per public address per protocol, so one address is plenty. A dynamic NAT pool without overload would need 180 public addresses.</p></div>

<h3>NAT beyond the office</h3>
<p>Many ISPs now run <b>carrier-grade NAT (CGNAT)</b>, giving customers addresses from <code>100.64.0.0/10</code> and translating again in the ISP network. This is why hosting a server at home is sometimes impossible. IPv6 has so many addresses that NAT is not needed; translation appears only for coexistence, such as <b>NAT64</b> letting IPv6-only clients reach IPv4 servers. NAT is not a security feature by design, although it blocks unsolicited inbound connections as a side effect; a firewall policy is still required.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Swapping <code>ip nat inside</code> and <code>ip nat outside</code>. (2) An ACL that does not match the LAN (wrong wildcard such as 0.0.0.255 on the wrong network). (3) Forgetting <code>overload</code>: without it only one inside host at a time gets the interface address. (4) No default route to the ISP, so translated packets have nowhere to go.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Many private hosts share one public address" = PAT/NAT overload. "Make an internal web server reachable from the internet at a fixed public address" = static NAT or port forwarding. Know the RFC 1918 ranges exactly, especially 172.16.0.0/12.</p></div>

<div class="scn"><h4>Only the first PC reaches the internet</h4><p>After a router replacement, the first user in the morning could browse, but everyone else timed out. <code>show ip nat translations</code> showed a single entry with no port numbers. The new configuration read <code>ip nat inside source list 1 interface GigabitEthernet0/1</code> without <code>overload</code>, so R1 performed one-to-one dynamic NAT and the only public address was taken by the first host. Adding <code>overload</code> and clearing translations with <code>clear ip nat translation *</code> fixed everyone.</p><p><b>Lesson:</b> with one public address you need PAT; the word "overload" is what turns NAT into PAT.</p></div>

<div class="iv"><p class="q">"Explain inside local and inside global, and how PAT lets many hosts share one address."</p><p>Strong answer: inside local is the host's private address (192.168.10.11); inside global is the public address that represents it outside (203.0.113.2). PAT rewrites the source address and, when needed, the source port, and records each mapping in the translation table. Return traffic to 203.0.113.2:1024 is matched to 192.168.10.12:1 and forwarded. Mention the three-part config (inside/outside, ACL, overload) and <code>show ip nat translations</code> for verification.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. They are not routed on the internet.</li>
<li>Inside local = private address; inside global = public address representing it.</li>
<li>Static NAT publishes servers; dynamic NAT uses a pool; PAT (overload) shares one address by port.</li>
<li>PAT config: <code>ip nat inside</code>/<code>outside</code>, an ACL, and <code>ip nat inside source list ... overload</code>.</li>
<li>Verify with <code>show ip nat translations</code> and <code>show ip nat statistics</code>.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ke hotel switchboard par wapas chalo. Do sau rooms ke internal extension numbers hain, lekin hotel ka ek public phone number hai. Jab room 214 bahar call karta hai, operator call public number se lagata hai aur note karta hai "outside line 7 room 214 ki hai". Jab reply line 7 par wapas aata hai, woh room 214 ko jaata hai. Yahi <b>PAT</b> (Port Address Translation) hai: bahut saare private hosts ek public address share karte hain, aur router ek table rakhta hai taaki replies sahi host tak pahunchein.</p>

<h3>NAT kyun hai</h3>
<p>IPv4 mein lagbhag 4.3 billion addresses hain, duniya ke devices se kahin kam. RFC 1918 ne teen <b>private</b> ranges reserve ki jo koi bhi internally use kar sakta hai lekin jo internet par kabhi route nahi hoti:</p>
<ul>
<li><code>10.0.0.0/8</code></li>
<li><code>172.16.0.0/12</code> (172.16.0.0 se 172.31.255.255)</li>
<li><code>192.168.0.0/16</code></li>
</ul>
<p><b>Network Address Translation (NAT)</b> packets ke bahar jaate waqt private source address ko public mein badalta hai, aur replies ke liye change ulta karta hai. Iske bina hamare lab ka office (192.168.10.0/24) internet se kabhi reply nahi pa sakta, kyunki koi ISP private addresses route nahi karta.</p>

<h3>Chaar address terms</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th><th>Lab 3 value</th></tr>
<tr><td><b>Inside local</b></td><td>Inside host ka asli (private) address</td><td>192.168.10.11</td></tr>
<tr><td><b>Inside global</b></td><td>Woh public address jo inside host ko represent karta hai</td><td>203.0.113.2</td></tr>
<tr><td><b>Outside local</b></td><td>Outside host ka address jaisa andar se dikhta hai</td><td>8.8.8.8</td></tr>
<tr><td><b>Outside global</b></td><td>Outside host ka asli address</td><td>8.8.8.8</td></tr>
</table>
<p>"Inside/outside" batata hai address <i>kiska</i> hai; "local/global" batata hai aap <i>kahan se</i> dekh rahe ho. Normal internet access mein outside addresses translate nahi hote, to outside local outside global ke barabar hota hai.</p>

<h3>NAT ke teen types</h3>
<ul>
<li><b>Static NAT</b>: ek inside address permanently ek public address se mapped. Server publish karne ke liye. <code>ip nat inside source static 192.168.10.50 203.0.113.5</code></li>
<li><b>Dynamic NAT</b>: inside hosts public addresses ke pool se address udhaar lete hain, har ek ek, jo pehle aaye use pehle. Pool khaali ho to naye hosts fail hote hain.</li>
<li><b>PAT</b> (NAT overload): saare inside hosts ek public address share karte hain; har session ko unique source <b>port</b> milta hai taaki replies alag pehchaane ja sakein. Lagbhag har ghar aur office router yahi karta hai. Ek address hazaaron sessions le ja sakta hai.</li>
</ul>
<p>Static NAT ka ek variation <b>port forwarding</b> hai: public address ka sirf ek port inside server ko jaata hai, jaise <code>ip nat inside source static tcp 192.168.10.50 443 interface GigabitEthernet0/1 443</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 3 mein PAT">
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="10" y="140" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<rect x="250" y="80" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">R1 (PAT)</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">in Gi0/0 | out Gi0/1</text>
<rect x="490" y="80" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="105" text-anchor="middle" class="svg-ink" font-size="13">INET-SRV</text><text x="560" y="124" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="150" y1="52" x2="250" y2="100" stroke="#64748b"/><line x1="150" y1="162" x2="250" y2="120" stroke="#64748b"/><line x1="390" y1="110" x2="490" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="440" y="100" text-anchor="middle" class="svg-accent" font-size="12">203.0.113.2</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">.11:1 → 203.0.113.2:1   .12:1 → 203.0.113.2:1024</text>
</svg><p class="cap">Dono PCs internet par 203.0.113.2 dikhte hain; PAT unhe alag port numbers se alag rakhta hai.</p></div>

<h3>Lab 3: PAT se internet access</h3>
<p>R1 ke paas LAN ki taraf Gi0/0 <code>192.168.10.1/24</code> aur ISP ki taraf Gi0/1 <code>203.0.113.2/30</code> hai, plus 203.0.113.1 ki taraf default route. ISP kuch bhi private wapas route nahi karta. Aapko teen cheezein chahiye: interfaces mark karo, batao <b>kaun</b> translate ho sakta hai (ACL), aur batao <b>kis mein</b> (outside interface address, overloaded).</p>
<pre class="code"><span class="c">! 1. Kaunsi side kaunsi hai</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
exit
<span class="c">! 2. Kaun translate ho sakta hai: LAN</span>
access-list 1 permit 192.168.10.0 0.0.0.255
<span class="c">! 3. Unhe Gi0/1 ke address mein translate karo, port se share karte hue</span>
ip nat inside source list 1 interface GigabitEthernet0/1 overload</pre>
<p>Ab PC1 aur PC2 se 8.8.8.8 ping karo aur translation table dekho.</p>
<pre class="out">R1# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
icmp <span class="hl">203.0.113.2:1</span>         192.168.10.11:1       8.8.8.8:1             8.8.8.8:1
icmp <span class="hl">203.0.113.2:1024</span>      192.168.10.12:1       8.8.8.8:1             8.8.8.8:1024

R1# show ip nat statistics
Total active translations: 2 (0 static, 2 dynamic; 2 extended)
Outside interfaces:
  GigabitEthernet0/1
Inside interfaces:
  GigabitEthernet0/0
Hits: 10  Misses: 0</pre>
<p>Dono PCs inside global address <b>203.0.113.2</b> share karte hain, jo lab ke aakhri sawaal ka jawab hai. Dono ne ICMP identifier 1 use kiya, to R1 ne doosre ko unique rakhne ke liye 1024 mein badal diya.</p>

<div class="eg"><p><b>Worked example.</b> 180 users wale office ke paas ek public address hai. Har user ke lagbhag 30 open sessions hain (browser tabs, mail, chat): 5,400 sessions. PAT ke paas har public address par har protocol ke liye lagbhag 64,000 usable ports hain, to ek address kaafi hai. Bina overload wale dynamic NAT pool ko 180 public addresses chahiye hote.</p></div>

<h3>Office ke bahar NAT</h3>
<p>Kai ISPs ab <b>carrier-grade NAT (CGNAT)</b> chalate hain, customers ko <code>100.64.0.0/10</code> se addresses dete hain aur ISP network mein dobara translate karte hain. Isiliye ghar par server host karna kabhi kabhi impossible hota hai. IPv6 mein itne addresses hain ki NAT ki zaroorat nahi; translation sirf coexistence ke liye aata hai, jaise <b>NAT64</b> IPv6-only clients ko IPv4 servers tak pahunchne deta hai. NAT design se security feature nahi hai, halanki side effect ke roop mein yeh unsolicited inbound connections block karta hai; firewall policy phir bhi chahiye.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>ip nat inside</code> aur <code>ip nat outside</code> ulta kar dena. (2) ACL jo LAN se match nahi karta (galat network par 0.0.0.255 jaisa wildcard). (3) <code>overload</code> bhool jaana: iske bina ek time par sirf ek inside host ko interface address milta hai. (4) ISP ki taraf default route na hona, to translated packets ke paas jaane ki jagah nahi hoti.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Bahut saare private hosts ek public address share karte hain" = PAT/NAT overload. "Internal web server ko fixed public address par internet se reachable banao" = static NAT ya port forwarding. RFC 1918 ranges exact yaad rakho, khaas kar 172.16.0.0/12.</p></div>

<div class="scn"><h4>Sirf pehla PC internet tak pahunchta hai</h4><p>Router replacement ke baad subah ka pehla user browse kar pa raha tha, lekin baaki sab time out ho rahe the. <code>show ip nat translations</code> mein bina port numbers ki ek hi entry thi. Nayi configuration mein <code>ip nat inside source list 1 interface GigabitEthernet0/1</code> tha, bina <code>overload</code> ke, to R1 one-to-one dynamic NAT kar raha tha aur ek hi public address pehle host ne le liya tha. <code>overload</code> add karne aur <code>clear ip nat translation *</code> se translations clear karne se sab theek ho gaye.</p><p><b>Seekh:</b> ek public address ke saath aapko PAT chahiye; "overload" shabd hi NAT ko PAT banata hai.</p></div>

<div class="iv"><p class="q">"Inside local aur inside global samjhao, aur PAT bahut saare hosts ko ek address share karne kaise deta hai."</p><p>Strong answer: inside local host ka private address hai (192.168.10.11); inside global woh public address hai jo use bahar represent karta hai (203.0.113.2). PAT source address aur zaroorat ho to source port rewrite karta hai, aur har mapping translation table mein record karta hai. 203.0.113.2:1024 par aane wala return traffic 192.168.10.12:1 se match karke forward hota hai. Teen-hisse wala config (inside/outside, ACL, overload) aur verification ke liye <code>show ip nat translations</code> ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Yeh internet par route nahi hoti.</li>
<li>Inside local = private address; inside global = use represent karne wala public address.</li>
<li>Static NAT servers publish karta hai; dynamic NAT pool use karta hai; PAT (overload) port se ek address share karta hai.</li>
<li>PAT config: <code>ip nat inside</code>/<code>outside</code>, ek ACL, aur <code>ip nat inside source list ... overload</code>.</li>
<li><code>show ip nat translations</code> aur <code>show ip nat statistics</code> se verify karo.</li>
</ul></div>
`}};export{e as default};