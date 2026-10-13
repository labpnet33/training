var e={id:`ntp-auth`,h:{en:`NTP with authentication: trustworthy time for logs, certificates and forensics`,hi:`Authentication ke saath NTP: logs, certificates aur forensics ke liye bharosemand time`},body:{en:`
<p>If a cricket match had ten scorers and every scorer's watch showed a different time, nobody could agree which ball came first. Worse, if a stranger could walk up and reset the scorers' watches, he could rewrite the order of events. Network devices are the scorers, the logs are the scoresheet, and <b>NTP authentication</b> makes sure only the official timekeeper can set the watches.</p>

<h3>Why time is a security control</h3>
<ul>
<li><b>Log correlation</b>: an investigation joins firewall, router, ISE and server logs on timestamps. A router ten minutes fast makes the attack timeline impossible to rebuild.</li>
<li><b>Certificates</b>: PKI checks "not before" and "not after" dates. A device with a wrong clock rejects valid certificates or accepts expired ones, which breaks VPNs, ISE EAP-TLS and HTTPS management.</li>
<li><b>Time-based authentication</b>: Kerberos and one-time-password tokens fail when clocks drift.</li>
<li><b>Evidence</b>: in court or an audit, logs only count if you can show the clocks were synchronised to a trusted source.</li>
</ul>

<h3>NTP basics</h3>
<p>NTP runs on <b>UDP 123</b>. Servers are ranked by <b>stratum</b>: stratum 0 is a reference clock (GPS, atomic), stratum 1 is directly attached to it, and every hop adds one. A device synchronised to a stratum 3 server becomes stratum 4. Stratum 16 means "unsynchronised". In the lab, TIME (10.10.10.200) is configured with <code>ntp master 3</code>, so R1 will become stratum 4. A client polls every 64 to 1024 seconds and needs several exchanges before it trusts a server, so the first synchronisation takes a few minutes.</p>

<h3>The risk without authentication</h3>
<p>Unauthenticated NTP believes any server that answers convincingly. An attacker on the path, or a misconfigured device claiming a better stratum, can shift a router's clock by hours. Defenders see this as sudden time jumps in logs, "clock is unsynchronized" messages, or certificate validation errors across many devices at once. The controls are authentication, source restrictions and multiple servers.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Authenticated NTP">
<rect x="430" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="13">TIME 10.10.10.200</text><text x="525" y="73" text-anchor="middle" class="svg-muted" font-size="12">stratum 3, key 1</text>
<rect x="20" y="90" width="190" height="60" rx="8" fill="#bae6fd"/><text x="115" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1 10.10.10.1</text><text x="115" y="133" text-anchor="middle" class="svg-muted" font-size="12">stratum 4 after sync</text>
<rect x="430" y="150" width="190" height="60" rx="8" fill="#fed7aa"/><text x="525" y="175" text-anchor="middle" class="svg-ink" font-size="13">Rogue server</text><text x="525" y="193" text-anchor="middle" class="svg-muted" font-size="12">no valid key</text>
<line x1="210" y1="110" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">MAC with key 1: accepted</text>
<line x1="210" y1="130" x2="430" y2="178" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="12">no or wrong MAC: ignored</text>
</svg><p class="cap">With authentication on, R1 only synchronises to a server whose packets carry a valid message authentication code for a trusted key.</p></div>

<h3>Configuring authentication on the client</h3>
<pre class="code"><span class="c">! 1. turn authentication on (required for the client to enforce it)</span>
ntp authenticate
<span class="c">! 2. define the key: id 1, algorithm, value (lab values)</span>
ntp authentication-key 1 md5 NK-Ntp-26
<span class="c">! 3. mark key 1 as trusted</span>
ntp trusted-key 1
<span class="c">! 4. use the key toward this server</span>
ntp server 10.10.10.200 key 1
<span class="c">! good practice</span>
ntp source GigabitEthernet0/0
ntp server 10.10.10.201 key 1
ntp server 10.10.10.202 key 1</pre>
<p>All four pieces are needed: the global <code>ntp authenticate</code>, the key definition, the <code>trusted-key</code> statement, and the <code>key</code> keyword on the server line. The server (TIME) must have the same key ID and value. MD5 is what most IOS configurations and exam questions show; newer releases add SHA-based key types, and the IETF's Network Time Security (NTS) uses TLS-based key exchange, the direction the industry is moving. Three or more servers let the client detect a "falseticker" whose time disagrees with the others.</p>

<h3>Restricting who can talk NTP to you</h3>
<pre class="code">access-list 20 permit 10.10.10.200
access-list 20 permit 10.10.10.201
access-list 20 permit 10.10.10.202
access-list 21 permit 10.10.0.0 0.0.255.255
ntp access-group peer 20
ntp access-group serve-only 21</pre>
<p><code>peer</code> allows the listed servers to synchronise this device; <code>serve-only</code> lets internal clients get time from it but never change its clock. Add CoPP for UDP 123 from the second chapter.</p>

<h3>Verification</h3>
<pre class="out">R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.10.10.200    127.127.1.1      3     21     64   377  1.000   0.412  1.938</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

R1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.10.200</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10

R1# show ntp associations detail | include 10.10.10.200
<span class="hl">10.10.10.200 configured, ipv4, authenticated, our_master, sane, valid, stratum 3</span></pre>
<p>The asterisk marks the chosen system peer. Reach 377 (octal) means the last eight polls all succeeded. The word <b>authenticated</b> in the detail output proves the key is being used. If the key is wrong or untrusted you see the server stuck at stratum 16, reach not climbing, and <code>Clock is unsynchronized</code>.</p>

<div class="eg"><p><b>Worked example (Lab 3, task 3).</b> TIME already has <code>ntp master 3</code>, <code>ntp authenticate</code> and key 1 = NK-Ntp-26 trusted. On R1 you enter the four commands above. For the first minute <code>show ntp associations</code> shows <code>~10.10.10.200</code> with reach 1 or 3; after a few polls it shows <code>*~10.10.10.200</code> and <code>show ntp status</code> reports synchronized, stratum 4, reference 10.10.10.200. The lab checks both conditions.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>ntp authentication-key</code> and <code>ntp server ... key 1</code> but forgetting <code>ntp trusted-key 1</code>. The key exists but is not trusted, so the client never synchronises. The second classic: configuring keys but not <code>ntp authenticate</code>, so nothing is enforced and a rogue server is still accepted.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stratum grows by one per hop: sync to stratum 3 makes you stratum 4. Stratum 16 = unsynchronised. NTP uses UDP 123. The asterisk in <code>show ntp associations</code> is the peer you are synchronised to.</p></div>

<div class="scn"><h4>The logs that started in 1993</h4><p>After a power cut, a branch router came up with its clock reset to 1993, because its NTP server line pointed to an address blocked by a new ACL. Syslog entries arrived at the SIEM with dates thirty years old, so correlation rules missed a brute-force alert from that branch. The team restored the ACL entry for UDP 123 from the NTP servers, added authentication and three servers, and set an alert for any device reporting "Clock is unsynchronized".</p><p><b>Lesson:</b> time is part of the security system; monitor sync status like any other control.</p></div>

<div class="iv"><p class="q">"How do you configure NTP authentication, and how do you prove it works?"</p><p>List the four pieces: <code>ntp authenticate</code>, <code>ntp authentication-key</code>, <code>ntp trusted-key</code>, and <code>ntp server ... key</code>, with a matching key on the server. Prove it with <code>show ntp status</code> (synchronized), <code>show ntp associations</code> (asterisk, reach 377) and <code>show ntp associations detail</code> showing "authenticated". Mention access-group restrictions and multiple servers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Correct time is a security control: logs, certificates, Kerberos and evidence depend on it.</li>
<li>NTP uses UDP 123; stratum increases by one per hop; stratum 16 means unsynchronised.</li>
<li>Authentication needs <code>ntp authenticate</code>, a key, <code>trusted-key</code>, and <code>key</code> on the server line.</li>
<li>Restrict with <code>ntp access-group peer / serve-only</code>, use three or more servers, and monitor sync.</li>
<li>Verify "authenticated" in <code>show ntp associations detail</code> and "synchronized" in <code>show ntp status</code>.</li>
</ul></div>
`,hi:`
<p>Agar ek cricket match mein das scorers hon aur har scorer ki ghadi alag time dikhaye, to koi agree nahi kar paayega ki kaunsi ball pehle aayi. Isse bhi bura, agar koi ajnabi aakar scorers ki ghadiyaan reset kar sake, to woh events ka order dobara likh sakta hai. Network devices scorers hain, logs scoresheet hain, aur <b>NTP authentication</b> pakka karta hai ki sirf official timekeeper hi ghadiyaan set kar sake.</p>

<h3>Time ek security control kyun hai</h3>
<ul>
<li><b>Log correlation</b>: investigation firewall, router, ISE aur server logs ko timestamps par jodti hai. Das minute aage chalne wala router attack timeline dobara banana namumkin kar deta hai.</li>
<li><b>Certificates</b>: PKI "not before" aur "not after" dates check karta hai. Galat clock wala device valid certificates reject karta hai ya expired accept karta hai, jo VPNs, ISE EAP-TLS aur HTTPS management tod deta hai.</li>
<li><b>Time-based authentication</b>: clocks drift hone par Kerberos aur one-time-password tokens fail hote hain.</li>
<li><b>Evidence</b>: court ya audit mein logs tabhi maane jaate hain jab aap dikha sako ki clocks trusted source se synchronised the.</li>
</ul>

<h3>NTP basics</h3>
<p>NTP <b>UDP 123</b> par chalta hai. Servers <b>stratum</b> se rank hote hain: stratum 0 reference clock hai (GPS, atomic), stratum 1 usse seedha juda hai, aur har hop ek jodta hai. Stratum 3 server se synchronised device stratum 4 ban jaata hai. Stratum 16 ka matlab "unsynchronised". Lab mein TIME (10.10.10.200) <code>ntp master 3</code> ke saath configured hai, isliye R1 stratum 4 banega. Client har 64 se 1024 seconds mein poll karta hai aur server par bharosa karne se pehle use kai exchanges chahiye, isliye pehla synchronisation kuch minute leta hai.</p>

<h3>Authentication ke bina risk</h3>
<p>Unauthenticated NTP har us server par bharosa karta hai jo convincingly jawab de. Path par baitha attacker, ya behtar stratum claim karne wala misconfigured device, router ki clock ko ghanton se khiska sakta hai. Defenders ise logs mein achanak time jumps, "clock is unsynchronized" messages, ya ek saath kai devices par certificate validation errors ke roop mein dekhte hain. Controls hain authentication, source restrictions aur multiple servers.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Authenticated NTP">
<rect x="430" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="525" y="55" text-anchor="middle" class="svg-ink" font-size="13">TIME 10.10.10.200</text><text x="525" y="73" text-anchor="middle" class="svg-muted" font-size="12">stratum 3, key 1</text>
<rect x="20" y="90" width="190" height="60" rx="8" fill="#bae6fd"/><text x="115" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1 10.10.10.1</text><text x="115" y="133" text-anchor="middle" class="svg-muted" font-size="12">sync ke baad stratum 4</text>
<rect x="430" y="150" width="190" height="60" rx="8" fill="#fed7aa"/><text x="525" y="175" text-anchor="middle" class="svg-ink" font-size="13">Rogue server</text><text x="525" y="193" text-anchor="middle" class="svg-muted" font-size="12">koi valid key nahi</text>
<line x1="210" y1="110" x2="430" y2="65" stroke="#64748b" stroke-width="2"/><text x="320" y="78" text-anchor="middle" class="svg-accent" font-size="12">key 1 ke saath MAC: accepted</text>
<line x1="210" y1="130" x2="430" y2="178" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="172" text-anchor="middle" class="svg-accent" font-size="12">MAC nahi ya galat: ignore</text>
</svg><p class="cap">Authentication on hone par R1 sirf us server se sync karta hai jiske packets mein trusted key ka valid message authentication code ho.</p></div>

<h3>Client par authentication configure karna</h3>
<pre class="code"><span class="c">! 1. authentication on karo (client ke enforce karne ke liye zaroori)</span>
ntp authenticate
<span class="c">! 2. key define karo: id 1, algorithm, value (lab values)</span>
ntp authentication-key 1 md5 NK-Ntp-26
<span class="c">! 3. key 1 ko trusted mark karo</span>
ntp trusted-key 1
<span class="c">! 4. is server ki taraf key use karo</span>
ntp server 10.10.10.200 key 1
<span class="c">! good practice</span>
ntp source GigabitEthernet0/0
ntp server 10.10.10.201 key 1
ntp server 10.10.10.202 key 1</pre>
<p>Chaaron hisse zaroori hain: global <code>ntp authenticate</code>, key definition, <code>trusted-key</code> statement, aur server line par <code>key</code> keyword. Server (TIME) par same key ID aur value honi chahiye. Zyada tar IOS configurations aur exam questions MD5 dikhate hain; naye releases SHA-based key types jodte hain, aur IETF ka Network Time Security (NTS) TLS-based key exchange use karta hai, jis taraf industry ja rahi hai. Teen ya zyada servers client ko ek "falseticker" pakadne dete hain jiska time baaki se match nahi karta.</p>

<h3>Aapse NTP kaun baat kar sakta hai, use seemit karna</h3>
<pre class="code">access-list 20 permit 10.10.10.200
access-list 20 permit 10.10.10.201
access-list 20 permit 10.10.10.202
access-list 21 permit 10.10.0.0 0.0.255.255
ntp access-group peer 20
ntp access-group serve-only 21</pre>
<p><code>peer</code> listed servers ko is device ko synchronise karne deta hai; <code>serve-only</code> internal clients ko isse time lene deta hai par iski clock kabhi badalne nahi deta. Doosre chapter se UDP 123 ke liye CoPP jodo.</p>

<h3>Verification</h3>
<pre class="out">R1# show ntp associations

  address         ref clock       st   when   poll reach  delay  offset   disp
<span class="hl">*~10.10.10.200    127.127.1.1      3     21     64   377  1.000   0.412  1.938</span>
 * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured

R1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.10.200</span>
nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**10

R1# show ntp associations detail | include 10.10.10.200
<span class="hl">10.10.10.200 configured, ipv4, authenticated, our_master, sane, valid, stratum 3</span></pre>
<p>Asterisk chuna hua system peer mark karta hai. Reach 377 (octal) ka matlab pichhle aath polls sab successful. Detail output mein <b>authenticated</b> shabd sabit karta hai ki key use ho rahi hai. Agar key galat ya untrusted hai to aap server ko stratum 16 par atka dekhte ho, reach nahi badhta, aur <code>Clock is unsynchronized</code>.</p>

<div class="eg"><p><b>Worked example (Lab 3, task 3).</b> TIME par pehle se <code>ntp master 3</code>, <code>ntp authenticate</code> aur trusted key 1 = NK-Ntp-26 hai. R1 par aap upar ke chaar commands daalte ho. Pehle minute <code>show ntp associations</code> <code>~10.10.10.200</code> ko reach 1 ya 3 ke saath dikhata hai; kuch polls ke baad <code>*~10.10.10.200</code> dikhata hai aur <code>show ntp status</code> synchronized, stratum 4, reference 10.10.10.200 report karta hai. Lab dono conditions check karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>ntp authentication-key</code> aur <code>ntp server ... key 1</code> configure karna par <code>ntp trusted-key 1</code> bhool jaana. Key exist karti hai par trusted nahi hai, isliye client kabhi sync nahi hota. Doosri classic galti: keys configure karna par <code>ntp authenticate</code> nahi, to kuch enforce nahi hota aur rogue server abhi bhi accept hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stratum har hop par ek badhta hai: stratum 3 se sync aapko stratum 4 banata hai. Stratum 16 = unsynchronised. NTP UDP 123 use karta hai. <code>show ntp associations</code> mein asterisk woh peer hai jisse aap synchronised ho.</p></div>

<div class="scn"><h4>Logs jo 1993 mein shuru hue</h4><p>Power cut ke baad ek branch router ki clock 1993 par reset hokar aayi, kyunki uski NTP server line ek aise address ki taraf thi jise naye ACL ne block kar diya tha. Syslog entries SIEM par tees saal purani dates ke saath pahunchi, isliye correlation rules ne us branch ka brute-force alert miss kar diya. Team ne NTP servers se UDP 123 ki ACL entry wapas daali, authentication aur teen servers jode, aur "Clock is unsynchronized" report karne wale kisi bhi device ke liye alert set kiya.</p><p><b>Seekh:</b> time security system ka hissa hai; sync status ko kisi bhi doosre control ki tarah monitor karo.</p></div>

<div class="iv"><p class="q">"Aap NTP authentication kaise configure karte ho, aur kaise sabit karte ho ki woh kaam kar raha hai?"</p><p>Chaar hisse batao: <code>ntp authenticate</code>, <code>ntp authentication-key</code>, <code>ntp trusted-key</code>, aur <code>ntp server ... key</code>, server par matching key ke saath. <code>show ntp status</code> (synchronized), <code>show ntp associations</code> (asterisk, reach 377) aur "authenticated" dikhane wale <code>show ntp associations detail</code> se sabit karo. Access-group restrictions aur multiple servers ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sahi time ek security control hai: logs, certificates, Kerberos aur evidence us par depend karte hain.</li>
<li>NTP UDP 123 use karta hai; stratum har hop par ek badhta hai; stratum 16 ka matlab unsynchronised.</li>
<li>Authentication ko <code>ntp authenticate</code>, ek key, <code>trusted-key</code>, aur server line par <code>key</code> chahiye.</li>
<li><code>ntp access-group peer / serve-only</code> se seemit karo, teen ya zyada servers use karo, aur sync monitor karo.</li>
<li><code>show ntp associations detail</code> mein "authenticated" aur <code>show ntp status</code> mein "synchronized" verify karo.</li>
</ul></div>
`}};export{e as default};